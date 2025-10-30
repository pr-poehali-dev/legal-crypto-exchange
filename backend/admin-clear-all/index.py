import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Удаляет все объявления и резервации для администратора
    Args: event - dict с httpMethod, body
          context - объект с request_id
    Returns: HTTP response с количеством удаленных записей
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    dsn: str = os.environ.get('DATABASE_URL', '')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute("DELETE FROM reservations")
        reservations_deleted = cur.rowcount
        
        cur.execute("DELETE FROM deals WHERE offer_id IN (SELECT id FROM offers WHERE status = 'active')")
        deals_deleted = cur.rowcount
        
        cur.execute("DELETE FROM offer_time_slots WHERE offer_id IN (SELECT id FROM offers WHERE status = 'active')")
        slots_deleted = cur.rowcount
        
        cur.execute("DELETE FROM offers WHERE status = 'active'")
        offers_deleted = cur.rowcount
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'deleted_count': offers_deleted + reservations_deleted + deals_deleted + slots_deleted,
                'reservations': reservations_deleted,
                'offers': offers_deleted,
                'deals': deals_deleted,
                'slots': slots_deleted
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }