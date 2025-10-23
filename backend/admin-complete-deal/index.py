import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin completes a deal (changes status to completed)
    Args: event with deal_id in body
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    deal_id = body_data.get('deal_id')
    
    if not deal_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Deal ID required'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = None
    try:
        import psycopg2
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT o.user_id, o.reserved_by, o.offer_type, o.amount, o.rate, 
                   owner.username as owner_name, reserver.username as reserver_name
            FROM offers o
            JOIN users owner ON o.user_id = owner.id
            JOIN users reserver ON o.reserved_by = reserver.id
            WHERE o.id = %s
        """, (deal_id,))
        
        offer_data = cursor.fetchone()
        
        if not offer_data:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Offer not found'})
            }
        
        owner_id, reserver_id, offer_type, amount, rate, owner_name, reserver_name = offer_data
        total = float(amount) * float(rate)
        
        if offer_type == 'buy':
            owner_deal_type = 'buy'
            reserver_deal_type = 'sell'
        else:
            owner_deal_type = 'sell'
            reserver_deal_type = 'buy'
        
        cursor.execute("""
            INSERT INTO deals (user_id, deal_type, amount, rate, total, status, partner_name)
            VALUES (%s, %s, %s, %s, %s, 'completed', %s)
        """, (owner_id, owner_deal_type, amount, rate, total, reserver_name))
        
        cursor.execute("""
            INSERT INTO deals (user_id, deal_type, amount, rate, total, status, partner_name)
            VALUES (%s, %s, %s, %s, %s, 'completed', %s)
        """, (reserver_id, reserver_deal_type, amount, rate, total, owner_name))
        
        cursor.execute(
            "UPDATE offers SET status = 'completed' WHERE id = %s",
            (deal_id,)
        )
        
        conn.commit()
        cursor.close()
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
                'message': 'Deal completed for both users'
            })
        }
    except Exception as e:
        if conn:
            conn.close()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to complete deal: {str(e)}'})
        }