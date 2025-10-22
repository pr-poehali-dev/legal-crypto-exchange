import json
import os
from typing import Dict, Any
import psycopg2
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get all deals with user info for admin panel
    Args: event with httpMethod
    Returns: List of all deals with user details
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
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                d.id, 
                d.user_id, 
                u.name as username,
                u.email,
                u.phone,
                d.deal_type, 
                d.amount, 
                d.rate, 
                d.total, 
                d.status,
                d.partner_name,
                d.created_at,
                d.updated_at
            FROM deals d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
        """)
        
        deals_data = cursor.fetchall()
        cursor.close()
        conn.close()
        
        deals = []
        for deal in deals_data:
            deals.append({
                'id': deal[0],
                'user_id': deal[1],
                'username': deal[2],
                'email': deal[3],
                'phone': deal[4],
                'deal_type': deal[5],
                'amount': float(deal[6]) if deal[6] else 0,
                'rate': float(deal[7]) if deal[7] else 0,
                'total': float(deal[8]) if deal[8] else 0,
                'status': deal[9],
                'partner_name': deal[10],
                'created_at': deal[11].isoformat() if deal[11] else None,
                'updated_at': deal[12].isoformat() if deal[12] else None
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
                'deals': deals
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
