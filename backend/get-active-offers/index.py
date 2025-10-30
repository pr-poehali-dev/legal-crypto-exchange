import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get all active offers with available time slots
    Args: event with queryStringParameters (optional offer_type filter, offer_id for single offer); context with request_id
    Returns: JSON list of active offers with user info and available time slots
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
    
    params = event.get('queryStringParameters') or {}
    offer_type = params.get('offer_type')
    city = params.get('city')
    single_offer_id = params.get('offer_id')
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    where_conditions = ["o.status = 'active'"]
    
    if single_offer_id:
        where_conditions.append(f"o.id = {single_offer_id}")
    
    if offer_type:
        where_conditions.append(f"o.offer_type = '{offer_type}'")
    
    if city:
        where_conditions.append(f"o.city = '{city}'")
    
    where_clause = " AND ".join(where_conditions)
    
    cur.execute(f"""
        SELECT o.id, o.user_id, o.offer_type, o.amount, o.rate, o.meeting_time, o.created_at, 
               u.username, u.phone, o.is_anonymous, o.anonymous_name, o.anonymous_phone, o.city, o.offices,
               u.first_name, u.last_name, o.time_start, o.time_end
        FROM t_p53513159_legal_crypto_exchang.offers o 
        LEFT JOIN t_p53513159_legal_crypto_exchang.users u ON o.user_id = u.id 
        WHERE {where_clause}
        ORDER BY o.created_at DESC
    """)
    
    rows = cur.fetchall()
    
    offers = []
    for row in rows:
        offer_id = row[0]
        is_anonymous = row[9] if len(row) > 9 and row[9] else False
        
        first_name = row[14] if len(row) > 14 else None
        last_name = row[15] if len(row) > 15 else None
        time_start = row[16] if len(row) > 16 else None
        time_end = row[17] if len(row) > 17 else None
        
        if is_anonymous:
            username = row[10] if row[10] else 'Аноним'
            phone = row[11] if row[11] else ''
        else:
            if first_name and last_name:
                username = f"{first_name} {last_name}"
            elif first_name:
                username = first_name
            else:
                username = row[7] if row[7] else 'Пользователь'
            phone = row[8] if row[8] else ''
        
        # Получаем доступные слоты для объявления
        cur.execute("""
            SELECT slot_time
            FROM t_p53513159_legal_crypto_exchang.offer_time_slots
            WHERE offer_id = %s AND is_reserved = FALSE
            ORDER BY slot_time
        """, (offer_id,))
        
        from datetime import datetime, timezone, timedelta
        moscow_tz = timezone(timedelta(hours=3))
        current_time = datetime.now(moscow_tz).time()
        
        # Фильтруем слоты: только те, которые в будущем
        available_slots = []
        for slot in cur.fetchall():
            slot_time = slot[0]
            if slot_time > current_time:
                available_slots.append(slot_time.strftime('%H:%M'))
        
        offers.append({
            'id': offer_id,
            'user_id': row[1],
            'offer_type': row[2],
            'amount': float(row[3]),
            'rate': float(row[4]),
            'meeting_time': str(time_start) if time_start else row[5],
            'meeting_time_end': str(time_end) if time_end else None,
            'created_at': row[6].isoformat() if row[6] else None,
            'username': username,
            'phone': phone,
            'is_anonymous': is_anonymous,
            'deals_count': 0,
            'city': row[12] if len(row) > 12 else 'Москва',
            'offices': row[13] if len(row) > 13 and row[13] else [],
            'time_start': time_start.strftime('%H:%M') if time_start else None,
            'time_end': time_end.strftime('%H:%M') if time_end else None,
            'available_slots': available_slots
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