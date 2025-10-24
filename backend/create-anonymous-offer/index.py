'''
Business: Create anonymous buy offer without registration (only for buy type)
Args: event - HTTP event with body containing name, phone, amount, rate, meeting_time
      context - execution context with request_id
Returns: HTTP response with created offer data
'''
import json
import os
from typing import Dict, Any
import psycopg2
import requests
from pydantic import BaseModel, Field, validator

def get_db_connection():
    """Get database connection using environment variable"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not found in environment')
    return psycopg2.connect(dsn)

class AnonymousOfferRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    amount: float = Field(..., gt=0)
    rate: float = Field(..., gt=0)
    meeting_time: str = Field(..., pattern=r'^\d{2}:\d{2}$')
    
    @validator('phone')
    def validate_phone(cls, v):
        cleaned = ''.join(filter(str.isdigit, v))
        if len(cleaned) < 10:
            raise ValueError('Phone number must contain at least 10 digits')
        return v

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main handler for creating anonymous buy offers"""
    method = event.get('httpMethod', 'GET')
    
    # Handle CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    # Validate request data
    offer_req = AnonymousOfferRequest(**body_data)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get anonymous system user ID
        cursor.execute("""
            SELECT id FROM t_p53513159_legal_crypto_exchang.users 
            WHERE email = 'anonymous@system.local'
        """)
        anon_user = cursor.fetchone()
        if not anon_user:
            raise ValueError('Anonymous system user not found')
        
        anon_user_id = anon_user[0]
        
        # Escape single quotes in name and phone
        safe_name = offer_req.name.replace("'", "''")
        safe_phone = offer_req.phone.replace("'", "''")
        
        # Insert anonymous buy offer with expires_at (24 hours from now)
        cursor.execute(f"""
            INSERT INTO t_p53513159_legal_crypto_exchang.offers 
            (user_id, offer_type, amount, rate, meeting_time, status, 
             is_anonymous, anonymous_name, anonymous_phone, expires_at)
            VALUES ({anon_user_id}, 'buy', {offer_req.amount}, {offer_req.rate}, '{offer_req.meeting_time}', 'active',
                    true, '{safe_name}', '{safe_phone}', NOW() + INTERVAL '24 hours')
            RETURNING id, offer_type, amount, rate, meeting_time, status, created_at,
                      anonymous_name, anonymous_phone, is_anonymous
        """)
        
        result = cursor.fetchone()
        conn.commit()
        
        offer = {
            'id': result[0],
            'offer_type': result[1],
            'amount': float(result[2]),
            'rate': float(result[3]),
            'meeting_time': result[4],
            'status': result[5],
            'created_at': result[6].isoformat() if result[6] else None,
            'anonymous_name': result[7],
            'anonymous_phone': result[8],
            'is_anonymous': result[9]
        }
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN_OFFERS')
        
        if bot_token:
            message = f"""📝 Новое анонимное объявление!

👤 Имя: {safe_name}
📞 Телефон: {safe_phone}
📝 Тип: Покупка
💰 Сумма: {offer_req.amount} USDT
💱 Курс: {offer_req.rate} ₽
⏰ Время встречи: {offer_req.meeting_time}
💵 Итого: {offer_req.amount * offer_req.rate:,.2f} ₽"""
            
            try:
                telegram_api_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                requests.post(
                    telegram_api_url,
                    json={'chat_id': bot_token.split(':')[0], 'text': message},
                    timeout=5
                )
            except Exception as e:
                print(f"Failed to send Telegram notification: {e}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'offer': offer,
                'message': 'Объявление создано. Продавцы свяжутся с вами по указанному телефону'
            })
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
    
    finally:
        cursor.close()
        conn.close()