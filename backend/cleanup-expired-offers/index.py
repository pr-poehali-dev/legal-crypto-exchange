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
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
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
    
    cursor.execute("""
        DELETE FROM offers 
        WHERE status != 'completed' AND (
            (status = 'active' AND meeting_time < %s)
            OR 
            (status = 'reserved' AND reserved_at < (NOW() - INTERVAL '1 day'))
        )
        RETURNING id, status
    """, (now_str,))
    
    deleted_rows = cursor.fetchall()
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