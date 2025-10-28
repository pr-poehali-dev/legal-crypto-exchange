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
    buyer_name = body_data.get('buyer_name')
    buyer_phone = body_data.get('buyer_phone')
    meeting_office = body_data.get('meeting_office')
    meeting_time = body_data.get('meeting_time')
    is_anonymous = body_data.get('is_anonymous', False)
    
    if not offer_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing offer_id'})
        }
    
    if not meeting_office or not meeting_time:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing meeting_office or meeting_time'})
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
        
        if not is_anonymous and owner_id == user_id:
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
        
        if is_anonymous:
            display_name = buyer_name
            cur.execute(
                "UPDATE offers SET status = 'reserved', reserved_by = NULL, reserved_at = NOW(), anonymous_name = %s, anonymous_phone = %s, is_anonymous = TRUE, meeting_time = %s WHERE id = %s",
                (buyer_name, buyer_phone, meeting_time, offer_id)
            )
        else:
            display_name = username
            cur.execute(
                "UPDATE offers SET status = 'reserved', reserved_by = %s, reserved_at = NOW(), is_anonymous = FALSE, anonymous_name = NULL, anonymous_phone = NULL, meeting_time = %s WHERE id = %s",
                (user_id, meeting_time, offer_id)
            )
        
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
⏰ Время встречи: {meeting_time}

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
⏰ Время встречи: {meeting_time}
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
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': f'Database error: {str(e)}'})
        }