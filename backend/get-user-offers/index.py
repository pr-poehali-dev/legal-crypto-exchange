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
    
    # Get offers created by user
    cur.execute("""
        SELECT o.id, o.offer_type, o.amount, o.rate, o.meeting_time, o.status, o.created_at, 
               o.reserved_by, o.reserved_at, u.username as reserved_by_username, 
               o.user_id, owner.username as owner_username, 'created' as relation_type
        FROM offers o
        LEFT JOIN users u ON o.reserved_by = u.id
        LEFT JOIN users owner ON o.user_id = owner.id
        WHERE o.user_id = %s 
        ORDER BY o.created_at DESC
    """, (user_id,))
    
    created_offers = cur.fetchall()
    
    # Get offers reserved by user
    cur.execute("""
        SELECT o.id, o.offer_type, o.amount, o.rate, o.meeting_time, o.status, o.created_at, 
               o.reserved_by, o.reserved_at, NULL as reserved_by_username, 
               o.user_id, owner.username as owner_username, 'reserved' as relation_type
        FROM offers o
        LEFT JOIN users owner ON o.user_id = owner.id
        WHERE o.reserved_by = %s 
        ORDER BY o.created_at DESC
    """, (user_id,))
    
    reserved_offers = cur.fetchall()
    
    # Combine both lists
    all_rows = list(created_offers) + list(reserved_offers)
    
    offers = []
    for row in all_rows:
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
            'reserved_by_username': row[9],
            'owner_id': row[10],
            'owner_username': row[11],
            'relation_type': row[12]
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