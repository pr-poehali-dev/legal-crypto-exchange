import json
import os
import psycopg2
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Reserve offer and notify owner via Telegram
    Args: event with httpMethod, body containing offer_id, user_id, username
          context with request_id
    Returns: HTTP response with success status
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '{}')
    if not body_str or body_str == '':
        body_str = '{}'
    body_data = json.loads(body_str)
    
    offer_id = body_data.get('offer_id')
    user_id = body_data.get('user_id')
    username = body_data.get('username')
    
    if not all([offer_id, user_id, username]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing required fields'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT o.user_id, o.amount, o.rate, o.meeting_time, o.offer_type, 
               u.telegram_id, u.username as owner_username, o.reserved_by
        FROM offers o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = %s AND o.status = 'active'
    """, (offer_id,))
    
    result = cur.fetchone()
    
    if not result:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Offer not found or not active'})
        }
    
    owner_id, amount, rate, meeting_time, offer_type, telegram_id, owner_username, reserved_by = result
    
    if owner_id == user_id:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Cannot reserve own offer'})
        }
    
    if reserved_by:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Offer already reserved'})
        }
    
    cur.execute(
        "UPDATE offers SET reserved_by = %s, reserved_at = NOW() WHERE id = %s",
        (user_id, offer_id)
    )
    conn.commit()
    
    if telegram_id:
        offer_type_text = 'Покупка' if offer_type == 'buy' else 'Продажа'
        message = f"""🔔 Ваше объявление зарезервировано!

Пользователь {username} хочет связаться по объявлению:
📝 Тип: {offer_type_text}
💰 Сумма: {amount} USDT
💱 Курс: {rate} ₽
⏰ Время встречи: {meeting_time}

Пожалуйста, приходите в офис в указанное время."""
        
        try:
            requests.post(
                'https://functions.poehali.dev/09e16699-07ea-42a0-a07b-6faa27662d58',
                json={
                    'telegram_id': telegram_id,
                    'message': message
                },
                timeout=5
            )
        except Exception as e:
            print(f"Failed to send Telegram notification: {e}")
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True})
    }