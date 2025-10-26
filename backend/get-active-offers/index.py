import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get all active offers from users
    Args: event with queryStringParameters (optional offer_type filter); context with request_id
    Returns: JSON list of active offers with user info
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
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    where_conditions = ["o.status = 'active'", "o.reserved_by IS NULL"]
    
    if offer_type:
        where_conditions.append(f"o.offer_type = '{offer_type}'")
    
    if city:
        where_conditions.append(f"o.city = '{city}'")
    
    where_clause = " AND ".join(where_conditions)
    
    cur.execute(f"""
        SELECT o.id, o.user_id, o.offer_type, o.amount, o.rate, o.meeting_time, o.created_at, 
               u.username, u.phone, o.is_anonymous, o.anonymous_name, o.anonymous_phone, o.city, o.offices
        FROM t_p53513159_legal_crypto_exchang.offers o 
        LEFT JOIN t_p53513159_legal_crypto_exchang.users u ON o.user_id = u.id 
        WHERE {where_clause}
        ORDER BY o.created_at DESC
    """)
    
    rows = cur.fetchall()
    
    offers = []
    for row in rows:
        is_anonymous = row[9] if len(row) > 9 and row[9] else False
        
        # For anonymous offers, use anonymous_name and anonymous_phone
        # For registered offers, use username and phone from users table
        username = row[10] if is_anonymous and row[10] else (row[7] if not is_anonymous else 'Аноним')
        phone = row[11] if is_anonymous and row[11] else (row[8] if not is_anonymous else '')
        
        offers.append({
            'id': row[0],
            'user_id': row[1],
            'offer_type': row[2],
            'amount': float(row[3]),
            'rate': float(row[4]),
            'meeting_time': row[5],
            'created_at': row[6].isoformat() if row[6] else None,
            'username': username,
            'phone': phone,
            'is_anonymous': is_anonymous,
            'deals_count': 0,
            'city': row[12] if len(row) > 12 else 'Москва',
            'offices': row[13] if len(row) > 13 and row[13] else []
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