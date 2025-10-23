import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Cancel offer reservation (owner or reserver can cancel)
    Args: event with httpMethod, body containing offer_id, user_id
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
    
    offer_id = body_data.get('offer_id')
    user_id = body_data.get('user_id')
    
    if not all([offer_id, user_id]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing required fields'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute(
        "SELECT user_id, reserved_by FROM offers WHERE id = %s",
        (offer_id,)
    )
    
    result = cur.fetchone()
    
    if not result:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Offer not found'})
        }
    
    owner_id, reserved_by = result
    
    if not reserved_by:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Offer is not reserved'})
        }
    
    # Allow cancellation by owner OR by the person who reserved it
    if owner_id != user_id and reserved_by != user_id:
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Not authorized'})
        }
    
    cur.execute(
        "UPDATE offers SET reserved_by = NULL, reserved_at = NULL WHERE id = %s",
        (offer_id,)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True})
    }