import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Update offer status (activate/deactivate/complete)
    Args: event with body containing offer_id, status; context with request_id
    Returns: Success status
    '''
    method: str = event.get('httpMethod', 'POST')
    
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
    
    body_data = json.loads(event.get('body', '{}'))
    
    offer_id = body_data.get('offer_id')
    status = body_data.get('status')
    
    if not offer_id or not status:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'offer_id and status are required'})
        }
    
    if status not in ['active', 'inactive', 'completed']:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invalid status'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # If completing the offer, create a deal record
    if status == 'completed':
        # Get offer details
        cur.execute(
            "SELECT user_id, offer_type, amount, rate, reserved_by FROM offers WHERE id = %s",
            (offer_id,)
        )
        offer_row = cur.fetchone()
        
        if offer_row:
            user_id, offer_type, amount, rate, reserved_by = offer_row
            total = float(amount) * float(rate)
            
            # Get partner username if reserved
            partner_name = None
            if reserved_by:
                cur.execute("SELECT username FROM users WHERE id = %s", (reserved_by,))
                partner_row = cur.fetchone()
                if partner_row:
                    partner_name = partner_row[0]
            
            # Create deal record
            cur.execute(
                """INSERT INTO deals (user_id, deal_type, amount, rate, total, status, partner_name, created_at, updated_at)
                   VALUES (%s, %s, %s, %s, %s, 'completed', %s, NOW(), NOW())""",
                (user_id, offer_type, amount, rate, total, partner_name)
            )
    
    cur.execute(
        "UPDATE offers SET status = %s WHERE id = %s",
        (status, offer_id)
    )
    
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
        'body': json.dumps({'success': True})
    }