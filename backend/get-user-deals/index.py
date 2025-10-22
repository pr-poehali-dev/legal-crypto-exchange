import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get user deals history from database
    Args: event with httpMethod, queryStringParameters containing user_id
    Returns: HTTP response with list of user deals
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
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'user_id is required'})
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
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(
            """
            SELECT id, deal_type, amount, rate, total, status, partner_name, 
                   created_at, updated_at
            FROM deals 
            WHERE user_id = %s 
            ORDER BY created_at DESC
            """,
            (user_id,)
        )
        deals = cursor.fetchall()
        cursor.close()
        conn.close()
        
        deals_list = []
        for deal in deals:
            deals_list.append({
                'id': deal['id'],
                'deal_type': deal['deal_type'],
                'amount': float(deal['amount']),
                'rate': float(deal['rate']),
                'total': float(deal['total']),
                'status': deal['status'],
                'partner_name': deal['partner_name'],
                'created_at': deal['created_at'].isoformat() if deal['created_at'] else None,
                'updated_at': deal['updated_at'].isoformat() if deal['updated_at'] else None
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'deals': deals_list
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
            'body': json.dumps({'error': f'Failed to get deals: {str(e)}'})
        }
