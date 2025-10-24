'''
Business: Автоматически удаляет объявления после истечения времени встречи
Args: event - dict с httpMethod, context - объект с атрибутами
Returns: HTTP response dict со статистикой удаленных объявлений
'''

import json
import os
from datetime import datetime, timezone
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    clear_all = body_data.get('clear_all', False)
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    now_utc = datetime.now(timezone.utc)
    now_str = now_utc.strftime('%Y-%m-%d %H:%M:%S')
    
    if clear_all:
        cursor.execute('SELECT COUNT(*) as count FROM t_p53513159_legal_crypto_exchang.offers')
        count_result = cursor.fetchone()
        deleted_count = count_result['count'] if count_result else 0
        
        cursor.execute('DELETE FROM t_p53513159_legal_crypto_exchang.offers')
        deleted_ids = []
    else:
        cursor.execute("""
            SELECT id, status, meeting_time FROM t_p53513159_legal_crypto_exchang.offers 
            WHERE status != 'completed'
        """)
        offers_to_check = cursor.fetchall()
        
        ids_to_delete = []
        for offer in offers_to_check:
            offer_id = offer['id']
            status = offer['status']
            meeting_time = offer['meeting_time']
            
            if status == 'reserved':
                cursor.execute("""
                    SELECT reserved_at FROM t_p53513159_legal_crypto_exchang.offers 
                    WHERE id = %s AND reserved_at < (NOW() - INTERVAL '1 day')
                """, (offer_id,))
                if cursor.fetchone():
                    ids_to_delete.append(offer_id)
            
            elif status == 'active' and meeting_time:
                try:
                    meeting_datetime_str = f"{now_utc.strftime('%Y-%m-%d')} {meeting_time}"
                    cursor.execute("""
                        SELECT %s::timestamp < NOW()
                    """, (meeting_datetime_str,))
                    result = cursor.fetchone()
                    if result and result[0]:
                        ids_to_delete.append(offer_id)
                except:
                    pass
        
        deleted_rows = []
        if ids_to_delete:
            for offer_id in ids_to_delete:
                cursor.execute("""
                    DELETE FROM t_p53513159_legal_crypto_exchang.offers 
                    WHERE id = %s
                    RETURNING id, status
                """, (offer_id,))
                deleted_row = cursor.fetchone()
                if deleted_row:
                    deleted_rows.append(deleted_row)
        
        deleted_ids = [row['id'] for row in deleted_rows]
        deleted_count = len(deleted_ids)
    
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
            'deleted_count': deleted_count,
            'deleted_ids': deleted_ids,
            'timestamp': now_str
        })
    }