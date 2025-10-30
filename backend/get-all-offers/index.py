import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get all offers including inactive for admin panel
    Args: event with httpMethod; context with request_id
    Returns: JSON list of all offers with user info
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
    
    if method == 'GET':
        dsn = os.environ.get('DATABASE_URL')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute(
            "SELECT o.id, o.offer_type, o.amount, o.rate, o.meeting_time, o.time_start, o.time_end, o.status, o.created_at, u.username, u.phone, o.city, o.offices FROM offers o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC"
        )
        
        rows = cur.fetchall()
        
        offers = []
        for row in rows:
            offers.append({
                'id': row[0],
                'offer_type': row[1],
                'amount': float(row[2]),
                'rate': float(row[3]),
                'meeting_time': str(row[5]) if row[5] else row[4],
                'meeting_time_end': str(row[6]) if row[6] else None,
                'status': row[7],
                'created_at': row[8].isoformat() if row[8] else None,
                'username': row[9],
                'phone': row[10],
                'city': row[11],
                'offices': row[12] if row[12] else []
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
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': False, 'error': 'Method not allowed'})
    }