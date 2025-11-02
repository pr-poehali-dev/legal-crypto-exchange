import json
import os
import psycopg
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Reserve specific time slot for offer and notify owner via Telegram
    Args: event with httpMethod, body containing offer_id, slot_time, user_id, username
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
    slot_time = body_data.get('slot_time')
    user_id = body_data.get('user_id')
    username = body_data.get('username')
    buyer_name = body_data.get('buyer_name')
    buyer_phone = body_data.get('buyer_phone')
    meeting_office = body_data.get('meeting_office')
    is_anonymous = body_data.get('is_anonymous', False)
    
    if not offer_id or not slot_time:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing offer_id or slot_time'})
        }
    
    if not meeting_office:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing meeting_office'})
        }
    
    if is_anonymous:
        if not buyer_name or not buyer_phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Missing buyer_name or buyer_phone'})
            }
    else:
        if not user_id or not username:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Missing user_id or username'})
            }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        def escape_sql(value):
            if value is None:
                return 'NULL'
            return f"'{str(value).replace(chr(39), chr(39)+chr(39))}'"
        
        with psycopg.connect(dsn, autocommit=False) as conn:
            conn.autocommit = True
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT o.user_id, o.amount, o.rate, o.offer_type, 
                           u.telegram_id, u.username as owner_username, o.is_anonymous
                    FROM offers o
                    JOIN users u ON o.user_id = u.id
                    WHERE o.id = {offer_id}
                """)
                
                result = cur.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'success': False, 'error': 'Offer not found or not active'})
                    }
                
                owner_id, amount, rate, offer_type, telegram_id, owner_username, offer_is_anonymous = result
                
                if not offer_is_anonymous:
                    cur.execute(f"""
                        SELECT is_reserved 
                        FROM offer_time_slots
                        WHERE offer_id = {offer_id} AND slot_time = '{slot_time}'
                    """)
                    
                    slot_result = cur.fetchone()
                    if not slot_result:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'isBase64Encoded': False,
                            'body': json.dumps({'success': False, 'error': 'Time slot not found'})
                        }
                    
                    if slot_result[0]:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'isBase64Encoded': False,
                            'body': json.dumps({'success': False, 'error': 'Time slot already reserved'})
                        }
                
                if not is_anonymous and owner_id == user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'success': False, 'error': 'Cannot reserve own offer'})
                    }
                
                display_name = buyer_name if is_anonymous else username
                
                buyer_name_sql = escape_sql(buyer_name) if is_anonymous else 'NULL'
                buyer_phone_sql = escape_sql(buyer_phone) if is_anonymous else 'NULL'
                user_id_sql = user_id if not is_anonymous else 'NULL'
                
                cur.execute(f"""
                    INSERT INTO reservations 
                    (offer_id, buyer_name, buyer_phone, buyer_user_id, meeting_office, meeting_time, status) 
                    VALUES ({offer_id}, {buyer_name_sql}, {buyer_phone_sql}, {user_id_sql}, {escape_sql(meeting_office)}, '{slot_time}', 'pending')
                    RETURNING id
                """)
                
                reservation_id = cur.fetchone()[0]
                
                total_amount = float(amount) * float(rate)
                
                offer_type_text = 'Покупка' if offer_type == 'buy' else 'Продажа'
                
                if telegram_id:
                    contact_info = f"\n🌐 Контакт: {buyer_phone}" if is_anonymous else ""
                    owner_message = f"""🔔 НОВАЯ ЗАЯВКА НА БРОНЬ!

👤 Партнёр: {display_name}{contact_info}
⚡ Тип сделки: {offer_type_text}
💎 Объём: {amount} USDT ({total_amount:.2f} ₽)
📊 Курс: {rate} ₽
📍 Точка встречи: {meeting_office}
⏰ Временной слот: {slot_time}

⏳ Зайдите в профиль и подтвердите или отклоните заявку."""
                    
                    try:
                        requests.post(
                            'https://functions.poehali.dev/09e16699-07ea-42a0-a07b-6faa27662d58',
                            json={
                                'telegram_id': telegram_id,
                                'message': owner_message
                            },
                            timeout=5
                        )
                    except Exception as e:
                        print(f"Failed to send owner notification: {e}")
                
                bot_token_deals = os.environ.get('TELEGRAM_BOT_TOKEN_DEALS')
                chat_id = os.environ.get('TELEGRAM_CHAT_ID')
                if bot_token_deals and chat_id:
                    contact_details = f"\n🌐 Контакт: {buyer_phone}" if is_anonymous else ""
                    admin_message = f"""🔔 НОВАЯ ЗАЯВКА НА БРОНЬ

🎯 Инициатор: {owner_username}
👽 Партнёр: {display_name}{contact_details}
⚡ Операция: {offer_type_text}
💎 Объём: {amount} USDT
📊 Курс: {rate} ₽
📡 Станция: {meeting_office}
⏱ Временной слот: {slot_time}
💫 Итоговая сумма: {float(amount) * float(rate):,.2f} ₽"""
                    
                    try:
                        telegram_api_url = f'https://api.telegram.org/bot{bot_token_deals}/sendMessage'
                        requests.post(
                            telegram_api_url,
                            json={
                                'chat_id': chat_id,
                                'text': admin_message,
                                'parse_mode': 'HTML'
                            },
                            timeout=5
                        )
                    except Exception as e:
                        print(f"Failed to send deals notification: {e}")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'reservation_id': reservation_id})
        }
    
    except Exception as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': str(e)})
        }