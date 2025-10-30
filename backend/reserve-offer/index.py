import json
import os
import psycopg2
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
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Проверяем, что слот существует и свободен
        cur.execute("""
            SELECT is_reserved 
            FROM t_p53513159_legal_crypto_exchang.offer_time_slots
            WHERE offer_id = %s AND slot_time = %s
        """, (offer_id, slot_time))
        
        slot_result = cur.fetchone()
        if not slot_result:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Time slot not found'})
            }
        
        if slot_result[0]:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Time slot already reserved'})
            }
        
        cur.execute("""
            SELECT o.user_id, o.amount, o.rate, o.offer_type, 
                   u.telegram_id, u.username as owner_username
            FROM t_p53513159_legal_crypto_exchang.offers o
            JOIN t_p53513159_legal_crypto_exchang.users u ON o.user_id = u.id
            WHERE o.id = %s
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
        
        owner_id, amount, rate, offer_type, telegram_id, owner_username = result
        
        if not is_anonymous and owner_id == user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Cannot reserve own offer'})
            }
        
        display_name = buyer_name if is_anonymous else username
        
        # Резервируем конкретный временной слот
        if is_anonymous:
            cur.execute("""
                UPDATE t_p53513159_legal_crypto_exchang.offer_time_slots
                SET is_reserved = TRUE, reserved_at = NOW()
                WHERE offer_id = %s AND slot_time = %s
            """, (offer_id, slot_time))
        else:
            cur.execute("""
                UPDATE t_p53513159_legal_crypto_exchang.offer_time_slots
                SET is_reserved = TRUE, reserved_by = %s, reserved_at = NOW()
                WHERE offer_id = %s AND slot_time = %s
            """, (user_id, offer_id, slot_time))
        
        cur.execute("""
            INSERT INTO t_p53513159_legal_crypto_exchang.reservations 
            (offer_id, buyer_name, buyer_phone, buyer_user_id, meeting_office, meeting_time) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (offer_id, buyer_name if is_anonymous else None, buyer_phone if is_anonymous else None, 
               user_id if not is_anonymous else None, meeting_office, slot_time))
        
        total_amount = float(amount) * float(rate)
        
        conn.commit()
        
        offer_type_text = 'Покупка' if offer_type == 'buy' else 'Продажа'
        
        # Send notification to offer owner
        if telegram_id:
            contact_info = f"\n📞 Телефон: {buyer_phone}" if is_anonymous else ""
            owner_message = f"""🔔 Ваше объявление зарезервировано!

Пользователь {display_name} хочет связаться по объявлению:{contact_info}
📝 Тип: {offer_type_text}
💰 Сумма: {amount} USDT
💱 Курс: {rate} ₽
📍 Офис: {meeting_office}
⏰ Время встречи: {slot_time}

Пожалуйста, приходите в офис в указанное время."""
            
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
        
        # Send notification to deals bot
        bot_token_deals = os.environ.get('TELEGRAM_BOT_TOKEN_DEALS')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        if bot_token_deals and chat_id:
            contact_details = f"\n📞 Телефон клиента: {buyer_phone}" if is_anonymous else ""
            admin_message = f"""📅 Новая встреча!

👤 Владелец: {owner_username}
👤 Клиент: {display_name}{contact_details}
📝 Тип: {offer_type_text}
💰 Сумма: {amount} USDT
💱 Курс: {rate} ₽
📍 Офис: {meeting_office}
⏰ Время встречи: {slot_time}
💵 Итого: {float(amount) * float(rate):,.2f} ₽"""
            
            try:
                telegram_api_url = f'https://api.telegram.org/bot{bot_token_deals}/sendMessage'
                requests.post(
                    telegram_api_url,
                    json={'chat_id': chat_id, 'text': admin_message},
                    timeout=5
                )
            except Exception as e:
                print(f"Failed to send deals notification: {e}")
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True})
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error occurred: {error_details}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': f'Database error: {str(e)}'})
        }