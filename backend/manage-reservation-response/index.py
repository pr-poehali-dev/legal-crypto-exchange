import json
import os
import psycopg2
import urllib.request
import urllib.parse
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Accept or reject reservation request
    Args: event with body containing reservation_id, action (accept/reject)
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
    
    reservation_id = body_data.get('reservation_id')
    action = body_data.get('action')
    
    if not reservation_id or not action:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing reservation_id or action'})
        }
    
    if action not in ['accept', 'reject']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Invalid action. Use accept or reject'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        new_status = 'confirmed' if action == 'accept' else 'rejected'
        
        cur.execute(f"""
            UPDATE reservations
            SET status = '{new_status}', {('confirmed_at' if action == 'accept' else 'rejected_at')} = NOW()
            WHERE id = {reservation_id}
            RETURNING offer_id, buyer_name, meeting_time, meeting_office, buyer_user_id
        """)
        
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Reservation not found'})
            }
        
        offer_id, buyer_name, meeting_time, meeting_office, buyer_user_id_from_res = result
        
        cur.execute(f"""
            SELECT is_anonymous FROM offers WHERE id = {offer_id}
        """)
        offer_result = cur.fetchone()
        is_anonymous_offer = offer_result[0] if offer_result else False
        
        if not is_anonymous_offer:
            if action == 'accept':
                if buyer_user_id_from_res:
                    cur.execute(f"""
                        UPDATE offer_time_slots
                        SET is_reserved = TRUE, reserved_by = {buyer_user_id_from_res}, reserved_at = NOW()
                        WHERE offer_id = {offer_id} AND slot_time = '{meeting_time}'
                    """)
                else:
                    cur.execute(f"""
                        UPDATE offer_time_slots
                        SET is_reserved = TRUE, reserved_at = NOW()
                        WHERE offer_id = {offer_id} AND slot_time = '{meeting_time}'
                    """)
            else:
                cur.execute(f"""
                    UPDATE offer_time_slots
                    SET is_reserved = FALSE, reserved_by = NULL, reserved_at = NULL
                    WHERE offer_id = {offer_id} AND slot_time = '{meeting_time}'
                """)
        
        cur.execute(f"""
            SELECT o.amount, o.rate, o.offer_type, u.telegram_id, u.username, r.buyer_user_id
            FROM offers o
            LEFT JOIN reservations r ON r.id = {reservation_id}
            LEFT JOIN users u ON r.buyer_user_id = u.id
            WHERE o.id = {offer_id}
        """)
        
        offer_data = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        if offer_data:
            amount, rate, offer_type, telegram_id, username, buyer_user_id = offer_data
            
            if not buyer_user_id:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'message': f'Reservation {action}ed successfully (anonymous buyer)',
                        'reservation': {
                            'id': reservation_id,
                            'status': new_status,
                            'buyer_name': buyer_name,
                            'meeting_time': str(meeting_time),
                            'meeting_office': meeting_office
                        }
                    })
                }
            bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
            
            if bot_token and telegram_id:
                status_text = '✅ ПОДТВЕРЖДЕНА' if action == 'accept' else '⛔ ОТКЛОНЕНА'
                status_emoji = '🚀' if action == 'accept' else '🌑'
                deal_type_text = 'Покупка' if offer_type == 'buy' else 'Продажа'
                total_amount = float(amount) * float(rate)
                
                telegram_message = f"""{status_emoji} СТАТУС БРОНИ: {status_text}

⚡ Операция: {deal_type_text}
💎 Объём: {amount} USDT ({total_amount:.2f} ₽)
📊 Курс: {rate} ₽
📡 Станция: {meeting_office}
⏱ Временной слот: {meeting_time}"""
                
                url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                data = {
                    'chat_id': telegram_id,
                    'text': telegram_message
                }
                
                try:
                    encoded_data = urllib.parse.urlencode(data).encode('utf-8')
                    req = urllib.request.Request(url, data=encoded_data, method='POST')
                    with urllib.request.urlopen(req) as response:
                        response.read()
                except:
                    pass
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'message': f'Reservation {action}ed successfully',
                'reservation': {
                    'id': reservation_id,
                    'status': new_status,
                    'buyer_name': buyer_name,
                    'meeting_time': str(meeting_time),
                    'meeting_office': meeting_office
                }
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': str(e)})
        }