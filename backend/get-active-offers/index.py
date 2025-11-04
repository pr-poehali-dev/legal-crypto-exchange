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
    
    # Автоматически деактивируем объявления, у которых истекло время
    cur.execute("""
        UPDATE offers
        SET status = 'inactive'
        WHERE status = 'active' 
        AND time_end IS NOT NULL 
        AND time_end < CURRENT_TIME
    """)
    conn.commit()
    
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
        FROM offers o 
        LEFT JOIN users u ON o.user_id = u.id 
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
        
        # Генерируем временные слоты из диапазона time_start - time_end
        from datetime import datetime, timezone, timedelta, time as dt_time
        moscow_tz = timezone(timedelta(hours=3))
        current_time = datetime.now(moscow_tz).time()
        
        city = row[12] if len(row) > 12 else 'Москва'
        offices = row[13] if len(row) > 13 and row[13] else []
        
        # Получаем все забронированные слоты в этом городе и офисах с подтверждённым статусом
        reserved_slots = set()
        if offices:
            for office in offices:
                cur.execute("""
                    SELECT r.meeting_time, r.meeting_office
                    FROM reservations r
                    JOIN offers o ON r.offer_id = o.id
                    WHERE o.city = %s 
                    AND r.meeting_office = %s 
                    AND r.status IN ('pending', 'confirmed')
                    AND r.expires_at > NOW()
                """, (city, office))
                
                for res_row in cur.fetchall():
                    reserved_slots.add(f"{res_row[0]}|{res_row[1]}")
        
        # Генерируем слоты с интервалом 15 минут
        available_slots = []
        if time_start and time_end:
            start_hour = time_start.hour
            start_minute = time_start.minute
            end_hour = time_end.hour if time_end.hour > 0 else 24
            end_minute = time_end.minute
            
            current_hour = start_hour
            current_minute = start_minute
            
            while True:
                slot_time = dt_time(current_hour % 24, current_minute)
                
                # Проверяем что слот в будущем
                if slot_time > current_time:
                    # Проверяем что слот не забронирован ни в одном офисе
                    is_available = True
                    for office in offices:
                        if f"{slot_time.strftime('%H:%M')}|{office}" in reserved_slots:
                            is_available = False
                            break
                    
                    if is_available:
                        available_slots.append(slot_time.strftime('%H:%M'))
                
                # Переходим к следующему слоту (+15 минут)
                current_minute += 15
                if current_minute >= 60:
                    current_minute = 0
                    current_hour += 1
                
                # Проверяем достигли ли конца
                if current_hour > end_hour or (current_hour == end_hour and current_minute >= end_minute):
                    break
                if current_hour >= 24:
                    break
        
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