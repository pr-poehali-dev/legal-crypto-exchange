import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get user active offers
    Args: event with queryStringParameters (user_id); context with request_id
    Returns: JSON list of user offers
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    params = event.get('queryStringParameters', {})
    user_id = params.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'user_id is required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Get offers created by user with reservations count
    cur.execute(f"""
        SELECT o.id, o.offer_type, o.amount, o.rate, o.meeting_time, o.time_start, o.time_end, o.status, o.created_at, 
               o.user_id, owner.username as owner_username, 'created' as relation_type,
               COUNT(r.id) as reservations_count
        FROM t_p53513159_legal_crypto_exchang.offers o
        LEFT JOIN t_p53513159_legal_crypto_exchang.users owner ON o.user_id = owner.id
        LEFT JOIN t_p53513159_legal_crypto_exchang.reservations r ON o.id = r.offer_id
        WHERE o.user_id = {user_id} 
        GROUP BY o.id, owner.username
        ORDER BY o.created_at DESC
    """)
    
    created_offers = cur.fetchall()
    
    # Get offers reserved by user (через таблицу reservations)
    cur.execute(f"""
        SELECT DISTINCT o.id, o.offer_type, o.amount, o.rate, o.meeting_time, o.time_start, o.time_end, o.status, o.created_at, 
               o.user_id, owner.username as owner_username, 'reserved' as relation_type,
               0 as reservations_count, r.status as reservation_status
        FROM t_p53513159_legal_crypto_exchang.offers o
        LEFT JOIN t_p53513159_legal_crypto_exchang.users owner ON o.user_id = owner.id
        INNER JOIN t_p53513159_legal_crypto_exchang.reservations r ON o.id = r.offer_id
        WHERE r.buyer_user_id = {user_id} 
        ORDER BY o.created_at DESC
    """)
    
    reserved_offers = cur.fetchall()
    
    # Combine both lists
    all_rows = list(created_offers) + list(reserved_offers)
    
    offers = []
    for row in all_rows:
        offer_id = row[0]
        relation_type = row[11]
        
        # Получаем детали резерваций для созданных объявлений
        reservations_list = []
        reservation_status = None
        
        if relation_type == 'created':
            # Автоматически отклоняем резервации старше 3 минут
            cur.execute(f"""
                UPDATE t_p53513159_legal_crypto_exchang.reservations
                SET status = 'expired'
                WHERE offer_id = {offer_id} 
                AND status = 'pending' 
                AND created_at < NOW() - INTERVAL '3 minutes'
            """)
            
            cur.execute(f"""
                SELECT r.id, r.buyer_name, r.buyer_phone, r.meeting_time, r.meeting_office, r.created_at,
                       u.username as buyer_username, r.status,
                       EXTRACT(EPOCH FROM (NOW() - r.created_at)) as seconds_ago
                FROM t_p53513159_legal_crypto_exchang.reservations r
                LEFT JOIN t_p53513159_legal_crypto_exchang.users u ON r.buyer_user_id = u.id
                WHERE r.offer_id = {offer_id}
                ORDER BY r.created_at DESC
            """)
            
            reservations_data = cur.fetchall()
            for res in reservations_data:
                status = res[7] if res[7] else 'pending'
                seconds_ago = int(res[8]) if res[8] else 0
                time_left = max(0, 180 - seconds_ago)  # 3 минуты = 180 секунд
                
                reservations_list.append({
                    'id': res[0],
                    'buyer_name': res[6] if res[6] else res[1],
                    'buyer_phone': res[2],
                    'meeting_time': str(res[3]),
                    'meeting_office': res[4],
                    'created_at': res[5].isoformat() if res[5] else None,
                    'status': status,
                    'time_left_seconds': time_left
                })
        else:
            # Для зарезервированных объявлений получаем статус резервации
            reservation_status = row[13] if len(row) > 13 else 'pending'
        
        offers.append({
            'id': row[0],
            'offer_type': row[1],
            'amount': float(row[2]),
            'rate': float(row[3]),
            'meeting_time': str(row[5]) if row[5] else row[4],
            'meeting_time_end': str(row[6]) if row[6] else None,
            'status': row[7],
            'created_at': row[8].isoformat() if row[8] else None,
            'owner_id': row[9],
            'owner_username': row[10],
            'relation_type': row[11],
            'reservations_count': row[12],
            'reservations': reservations_list,
            'reservation_status': reservation_status
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'offers': offers})
    }