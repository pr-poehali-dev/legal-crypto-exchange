import json
import os
import psycopg2
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create new offer/announcement for buying or selling USDT
    Args: event with httpMethod, body containing user_id, offer_type, amount, rate, meeting_time
    Returns: Success response with offer_id
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        offer_type = body_data.get('offer_type')
        amount = body_data.get('amount')
        rate = body_data.get('rate')
        meeting_time = body_data.get('meeting_time')
        city = body_data.get('city', 'Москва')
        
        if not all([user_id, offer_type, amount, rate, meeting_time]):
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COALESCE(blocked, false) FROM t_p53513159_legal_crypto_exchang.users WHERE id = %s', (user_id,))
        user_data = cursor.fetchone()
        
        if user_data and user_data[0]:
            cursor.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': 'Вы заблокированы и не можете создавать объявления'})
            }
        
        cursor.execute('''
            INSERT INTO t_p53513159_legal_crypto_exchang.offers 
            (user_id, offer_type, amount, rate, meeting_time, city, status, expires_at)
            VALUES (%s, %s, %s, %s, %s, %s, 'active', NOW() + INTERVAL '24 hours')
            RETURNING id
        ''', (user_id, offer_type, float(amount), float(rate), meeting_time, city))
        
        offer_id = cursor.fetchone()[0]
        
        cursor.execute('SELECT username FROM t_p53513159_legal_crypto_exchang.users WHERE id = %s', (user_id,))
        username_result = cursor.fetchone()
        username = username_result[0] if username_result else 'Пользователь'
        
        conn.commit()
        cursor.close()
        conn.close()
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN_OFFERS')
        
        if bot_token:
            offer_type_text = 'Покупка' if offer_type == 'buy' else 'Продажа'
            message = f"""📝 Новое объявление!

👤 Пользователь: {username}
🏙️ Город: {city}
📝 Тип: {offer_type_text}
💰 Сумма: {float(amount)} USDT
💱 Курс: {float(rate)} ₽
⏰ Время встречи: {meeting_time}
💵 Итого: {float(amount) * float(rate):,.2f} ₽"""
            
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
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'offer_id': offer_id
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }