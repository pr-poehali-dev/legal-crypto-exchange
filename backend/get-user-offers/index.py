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
    
    cur.execute("""
        SELECT o.id, o.offer_type, o.amount, o.rate, o.meeting_time, o.status, o.created_at, 
               o.reserved_by, o.reserved_at, u.username as reserved_by_username
        FROM offers o
        LEFT JOIN users u ON o.reserved_by = u.id
        WHERE o.user_id = %s 
        ORDER BY o.created_at DESC
    """, (user_id,))
    
    rows = cur.fetchall()
    
    offers = []
    for row in rows:
        offers.append({
            'id': row[0],
            'offer_type': row[1],
            'amount': float(row[2]),
            'rate': float(row[3]),
            'meeting_time': row[4],
            'status': row[5],
            'created_at': row[6].isoformat() if row[6] else None,
            'reserved_by': row[7],
            'reserved_at': row[8].isoformat() if row[8] else None,
            'reserved_by_username': row[9]
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