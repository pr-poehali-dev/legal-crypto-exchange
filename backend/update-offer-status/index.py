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
    
    # If completing the offer, create deal records for both participants
    if status == 'completed':
        # Get offer details (check both reserved_by and last_reserved_by)
        cur.execute("""
            SELECT o.user_id, o.offer_type, o.amount, o.rate, 
                   COALESCE(o.reserved_by, o.last_reserved_by) as reserved_by_user,
                   owner.username as owner_name, 
                   COALESCE(reserver.username, last_reserver.username) as reserver_name
            FROM offers o
            LEFT JOIN users owner ON o.user_id = owner.id
            LEFT JOIN users reserver ON o.reserved_by = reserver.id
            LEFT JOIN users last_reserver ON o.last_reserved_by = last_reserver.id
            WHERE o.id = %s
        """, (offer_id,))
        
        offer_row = cur.fetchone()
        
        if offer_row:
            owner_id, offer_type, amount, rate, reserved_by, owner_name, reserver_name = offer_row
            total = float(amount) * float(rate)
            
            if reserved_by:
                # Determine deal types: if owner sells, reserver buys (and vice versa)
                if offer_type == 'buy':
                    owner_deal_type = 'buy'
                    reserver_deal_type = 'sell'
                else:
                    owner_deal_type = 'sell'
                    reserver_deal_type = 'buy'
                
                # Create deal for owner
                cur.execute(
                    """INSERT INTO deals (user_id, deal_type, amount, rate, total, status, partner_name, created_at, updated_at)
                       VALUES (%s, %s, %s, %s, %s, 'completed', %s, NOW(), NOW())""",
                    (owner_id, owner_deal_type, amount, rate, total, reserver_name)
                )
                
                # Create deal for reserver
                cur.execute(
                    """INSERT INTO deals (user_id, deal_type, amount, rate, total, status, partner_name, created_at, updated_at)
                       VALUES (%s, %s, %s, %s, %s, 'completed', %s, NOW(), NOW())""",
                    (reserved_by, reserver_deal_type, amount, rate, total, owner_name)
                )
            else:
                # No reservation - only create deal for owner
                cur.execute(
                    """INSERT INTO deals (user_id, deal_type, amount, rate, total, status, partner_name, created_at, updated_at)
                       VALUES (%s, %s, %s, %s, %s, 'completed', NULL, NOW(), NOW())""",
                    (owner_id, offer_type, amount, rate, total)
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