import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Accept or reject reservation request
    Args: event with body containing reservation_id, action (accept/reject)
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
    
    reservation_id = body_data.get('reservation_id')
    action = body_data.get('action')
    
    if not reservation_id or not action:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Missing reservation_id or action'})
        }
    
    if action not in ['accept', 'reject']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Invalid action. Use accept or reject'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        new_status = 'confirmed' if action == 'accept' else 'rejected'
        
        cur.execute("""
            UPDATE t_p53513159_legal_crypto_exchang.reservations
            SET status = %s
            WHERE id = %s
            RETURNING offer_id, buyer_name, meeting_time, meeting_office
        """, (new_status, reservation_id))
        
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Reservation not found'})
            }
        
        offer_id, buyer_name, meeting_time, meeting_office = result
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'message': f'Reservation {action}ed successfully',
                'reservation': {
                    'id': reservation_id,
                    'status': new_status,
                    'buyer_name': buyer_name,
                    'meeting_time': str(meeting_time),
                    'meeting_office': meeting_office
                }
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': str(e)})
        }
