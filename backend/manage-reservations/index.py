import json
import os
import psycopg2
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage reservations - get pending, confirm, reject, check expired
    Args: event with httpMethod GET (get pending), POST (confirm/reject), queryStringParameters
    Returns: Reservations list or action result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # GET - получить pending резервации или проверить истёкшие
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            action = params.get('action', 'get_pending')
            user_id = params.get('user_id')
            
            if action == 'check_expired':
                # Проверяем истёкшие резервации
                cur.execute("""
                    SELECT r.id, r.offer_id, r.meeting_time, r.buyer_user_id,
                           u.telegram_id
                    FROM t_p53513159_legal_crypto_exchang.reservations r
                    LEFT JOIN t_p53513159_legal_crypto_exchang.users u ON r.buyer_user_id = u.id
                    WHERE r.status = 'pending' AND NOW() > r.expires_at
                """)
                
                expired_reservations = cur.fetchall()
                
                for reservation in expired_reservations:
                    reservation_id, offer_id, meeting_time, buyer_user_id, buyer_telegram_id = reservation
                    
                    cur.execute("""
                        UPDATE t_p53513159_legal_crypto_exchang.reservations
                        SET status = 'expired'
                        WHERE id = %s
                    """, (reservation_id,))
                    
                    cur.execute("""
                        UPDATE t_p53513159_legal_crypto_exchang.offer_time_slots
                        SET is_reserved = FALSE, reserved_by = NULL, reserved_at = NULL
                        WHERE offer_id = %s AND slot_time = %s
                    """, (offer_id, meeting_time))
                    
                    if buyer_telegram_id:
                        try:
                            requests.post(
                                'https://functions.poehali.dev/09e16699-07ea-42a0-a07b-6faa27662d58',
                                json={
                                    'telegram_id': buyer_telegram_id,
                                    'message': '⏱️ Время ожидания подтверждения истекло\n\nВладелец объявления не подтвердил вашу заявку вовремя. Попробуйте выбрать другое время.'
                                },
                                timeout=5
                            )
                        except:
                            pass
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'expired_count': len(expired_reservations)})
                }
            
            # Получаем pending резервации для пользователя
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Missing user_id'})
                }
            
            cur.execute("""
                SELECT r.id, r.offer_id, r.buyer_name, r.buyer_phone, r.buyer_user_id,
                       r.meeting_office, r.meeting_time, r.created_at, r.expires_at,
                       o.offer_type, o.amount, o.rate,
                       u.username, u.first_name, u.last_name,
                       EXTRACT(EPOCH FROM (r.expires_at - NOW())) as seconds_remaining
                FROM t_p53513159_legal_crypto_exchang.reservations r
                JOIN t_p53513159_legal_crypto_exchang.offers o ON r.offer_id = o.id
                LEFT JOIN t_p53513159_legal_crypto_exchang.users u ON r.buyer_user_id = u.id
                WHERE o.user_id = %s AND r.status = 'pending' AND NOW() <= r.expires_at
                ORDER BY r.created_at DESC
            """, (user_id,))
            
            rows = cur.fetchall()
            reservations = []
            
            for row in rows:
                buyer_user_id = row[4]
                first_name = row[13]
                last_name = row[14]
                
                if buyer_user_id:
                    if first_name and last_name:
                        display_name = f"{first_name} {last_name}"
                    elif first_name:
                        display_name = first_name
                    else:
                        display_name = row[12] if row[12] else 'Пользователь'
                else:
                    display_name = row[2] if row[2] else 'Аноним'
                
                reservations.append({
                    'id': row[0],
                    'offer_id': row[1],
                    'buyer_name': display_name,
                    'buyer_phone': row[3],
                    'meeting_office': row[5],
                    'meeting_time': row[6],
                    'offer_type': row[9],
                    'amount': float(row[10]),
                    'rate': float(row[11]),
                    'seconds_remaining': int(row[15]) if row[15] and row[15] > 0 else 0
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'reservations': reservations})
            }
        
        # POST - подтвердить или отклонить резервацию
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            reservation_id = body_data.get('reservation_id')
            action = body_data.get('action')
            user_id = body_data.get('user_id')
            
            if not all([reservation_id, action, user_id]) or action not in ['confirm', 'reject']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid parameters'})
                }
            
            cur.execute("""
                SELECT r.offer_id, r.meeting_time, r.status, r.expires_at,
                       o.user_id, o.amount, o.rate, o.offer_type,
                       r.buyer_user_id, u.telegram_id
                FROM t_p53513159_legal_crypto_exchang.reservations r
                JOIN t_p53513159_legal_crypto_exchang.offers o ON r.offer_id = o.id
                LEFT JOIN t_p53513159_legal_crypto_exchang.users u ON r.buyer_user_id = u.id
                WHERE r.id = %s
            """, (reservation_id,))
            
            result = cur.fetchone()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Reservation not found'})
                }
            
            offer_id, meeting_time, status, expires_at, owner_id, amount, rate, offer_type, buyer_user_id, buyer_telegram_id = result
            
            if owner_id != user_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Not authorized'})
                }
            
            if status != 'pending':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': f'Reservation already {status}'})
                }
            
            cur.execute("SELECT NOW() > %s", (expires_at,))
            if cur.fetchone()[0]:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Reservation expired'})
                }
            
            if action == 'confirm':
                cur.execute("""
                    UPDATE t_p53513159_legal_crypto_exchang.reservations
                    SET status = 'confirmed', confirmed_at = NOW()
                    WHERE id = %s
                """, (reservation_id,))
                
                if buyer_telegram_id:
                    offer_type_text = 'Покупка' if offer_type == 'buy' else 'Продажа'
                    try:
                        requests.post(
                            'https://functions.poehali.dev/09e16699-07ea-42a0-a07b-6faa27662d58',
                            json={
                                'telegram_id': buyer_telegram_id,
                                'message': f'✅ Ваша заявка подтверждена!\n\n📝 Тип: {offer_type_text}\n💰 Сумма: {amount} USDT\n💱 Курс: {rate} ₽\n⏰ Время: {meeting_time}\n\nЖдём вас!'
                            },
                            timeout=5
                        )
                    except:
                        pass
            else:
                cur.execute("""
                    UPDATE t_p53513159_legal_crypto_exchang.reservations
                    SET status = 'rejected', rejected_at = NOW()
                    WHERE id = %s
                """, (reservation_id,))
                
                cur.execute("""
                    UPDATE t_p53513159_legal_crypto_exchang.offer_time_slots
                    SET is_reserved = FALSE, reserved_by = NULL, reserved_at = NULL
                    WHERE offer_id = %s AND slot_time = %s
                """, (offer_id, meeting_time))
                
                if buyer_telegram_id:
                    try:
                        requests.post(
                            'https://functions.poehali.dev/09e16699-07ea-42a0-a07b-6faa27662d58',
                            json={
                                'telegram_id': buyer_telegram_id,
                                'message': '❌ Ваша заявка отклонена\n\nПопробуйте выбрать другое время.'
                            },
                            timeout=5
                        )
                    except:
                        pass
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'action': action})
            }
    
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
