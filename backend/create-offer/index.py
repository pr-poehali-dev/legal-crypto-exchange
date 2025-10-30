import json
import os
import psycopg2
import requests
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create new offer with time slots for buying or selling USDT
    Args: event with httpMethod, body containing user_id, offer_type, amount, rate, time_start, time_end
    Returns: Success response with offer_id and created time slots
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
        time_start = body_data.get('time_start')
        time_end = body_data.get('time_end')
        city = body_data.get('city', 'Москва')
        offices = body_data.get('offices', [])
        
        if not all([user_id, offer_type, amount, rate, time_start, time_end]):
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
            (user_id, offer_type, amount, rate, meeting_time, time_start, time_end, city, offices, status, expires_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'active', NOW() + INTERVAL '24 hours')
            RETURNING id
        ''', (user_id, offer_type, float(amount), float(rate), f"{time_start}-{time_end}", time_start, time_end, city, offices))
        
        offer_id = cursor.fetchone()[0]
        
        # Генерируем временные слоты (каждые 15 минут)
        start_time = datetime.strptime(time_start, '%H:%M').time()
        end_time = datetime.strptime(time_end, '%H:%M').time()
        
        current_time = datetime.combine(datetime.today(), start_time)
        end_datetime = datetime.combine(datetime.today(), end_time)
        
        # Если время окончания 00:00, это следующий день
        if end_time.hour == 0 and end_time.minute == 0:
            end_datetime += timedelta(days=1)
        
        slots_created = 0
        while current_time < end_datetime:
            cursor.execute('''
                INSERT INTO t_p53513159_legal_crypto_exchang.offer_time_slots 
                (offer_id, slot_time, is_reserved)
                VALUES (%s, %s, FALSE)
            ''', (offer_id, current_time.time()))
            current_time += timedelta(minutes=15)
            slots_created += 1
        
        cursor.execute('SELECT username FROM t_p53513159_legal_crypto_exchang.users WHERE id = %s', (user_id,))
        username_result = cursor.fetchone()
        username = username_result[0] if username_result else 'Пользователь'
        
        conn.commit()
        cursor.close()
        conn.close()
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN_OFFERS')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        if bot_token and chat_id:
            offer_type_text = 'Покупка' if offer_type == 'buy' else 'Продажа'
            message = f"""📝 Новое объявление!

👤 Пользователь: {username}
🏙️ Город: {city}
📝 Тип: {offer_type_text}
💰 Сумма: {float(amount)} USDT
💱 Курс: {float(rate)} ₽
⏰ Временной промежуток: {time_start} - {time_end}
📅 Слотов создано: {slots_created}
💵 Итого: {float(amount) * float(rate):,.2f} ₽"""
            
            try:
                telegram_api_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                requests.post(
                    telegram_api_url,
                    json={'chat_id': chat_id, 'text': message},
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
                'offer_id': offer_id,
                'slots_created': slots_created
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