import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Delete user offer by offer_id
    Args: event with httpMethod, body containing offer_id
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
    clear_all = body_data.get('clear_all', False)
    
    dsn = os.environ.get('DATABASE_URL')
    
    # Clear all offers mode
    if clear_all:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute('SELECT COUNT(*) FROM reservations')
        reservations_count = cur.fetchone()[0]
        
        cur.execute('SELECT COUNT(*) FROM deals')
        deals_count = cur.fetchone()[0]
        
        cur.execute('SELECT COUNT(*) FROM offers')
        offers_count = cur.fetchone()[0]
        
        cur.execute('DELETE FROM reservations')
        cur.execute('DELETE FROM deals')
        cur.execute('DELETE FROM offers')
        
        conn.commit()
        cur.close()
        conn.close()
        
        total_deleted = reservations_count + deals_count + offers_count
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'deleted_count': total_deleted,
                'reservations': reservations_count,
                'deals': deals_count,
                'offers': offers_count,
                'slots': 0
            })
        }
    
    if not offer_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing offer_id'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Check if offer exists
    cur.execute(f'SELECT user_id FROM offers WHERE id = {offer_id}')
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
    
    # If user_id provided, check authorization (user mode)
    # If no user_id, skip check (admin mode)
    if user_id and result[0] != user_id:
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Not authorized to delete this offer'})
        }
    
    cur.execute(f"DELETE FROM offers WHERE id = {offer_id}")
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True})
    }