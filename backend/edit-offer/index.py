import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Update offer details including slots, city and offices
    Args: event with httpMethod, body containing offer_id, amount, rate, meeting_time, meeting_time_end, city, offices
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
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        offer_id = body.get('offer_id')
        user_id = body.get('user_id')
        offer_type = body.get('offer_type')
        amount = body.get('amount')
        rate = body.get('rate')
        meeting_time = body.get('meeting_time')
        meeting_time_end = body.get('meeting_time_end', meeting_time)
        city = body.get('city', 'Москва')
        offices = body.get('offices', [])
        
        if not offer_id or not user_id or not offer_type or not amount or not rate or not meeting_time:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Check if user owns this offer
        cur.execute(f"SELECT user_id FROM offers WHERE id = {offer_id}")
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Offer not found'})
            }
        
        if result[0] != user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not authorized to edit this offer'})
            }
        
        # Generate available slots
        time_start_parts = meeting_time.split(':')
        time_end_parts = meeting_time_end.split(':')
        start_minutes = int(time_start_parts[0]) * 60 + int(time_start_parts[1])
        end_minutes = int(time_end_parts[0]) * 60 + int(time_end_parts[1])
        
        available_slots = []
        current = start_minutes
        while current <= end_minutes:
            hours = current // 60
            minutes = current % 60
            available_slots.append(f"{hours:02d}:{minutes:02d}")
            current += 15
        
        offices_json = json.dumps(offices).replace("'", "''")
        slots_json = json.dumps(available_slots).replace("'", "''")
        city_escaped = city.replace("'", "''")
        
        cur.execute(f'''
            UPDATE offers 
            SET offer_type = '{offer_type}', 
                amount = {amount}, 
                rate = {rate}, 
                meeting_time = '{meeting_time}',
                meeting_time_end = '{meeting_time_end}',
                city = '{city_escaped}',
                offices = '{offices_json}',
                available_slots = '{slots_json}'
            WHERE id = {offer_id}
        ''')
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Offer updated successfully'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }