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
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    if offer_type:
        cur.execute(
            "SELECT o.id, o.offer_type, o.amount, o.rate, o.meeting_time, o.created_at, u.username, u.phone FROM offers o JOIN users u ON o.user_id = u.id WHERE o.status = 'active' AND o.offer_type = %s ORDER BY o.created_at DESC",
            (offer_type,)
        )
    else:
        cur.execute(
            "SELECT o.id, o.offer_type, o.amount, o.rate, o.meeting_time, o.created_at, u.username, u.phone FROM offers o JOIN users u ON o.user_id = u.id WHERE o.status = 'active' ORDER BY o.created_at DESC"
        )
    
    rows = cur.fetchall()
    
    offers = []
    for row in rows:
        offers.append({
            'id': row[0],
            'offer_type': row[1],
            'amount': float(row[2]),
            'rate': float(row[3]),
            'meeting_time': row[4],
            'created_at': row[5].isoformat() if row[5] else None,
            'username': row[6],
            'phone': row[7],
            'deals_count': 0
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