import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Send contact form messages to Telegram
    Args: event with httpMethod, body containing name, email, phone, message
    Returns: HTTP response with success/error status
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Telegram not configured'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    name = body_data.get('name', '')
    email = body_data.get('email', '')
    phone = body_data.get('phone', '')
    message = body_data.get('message', '')
    
    telegram_message = f"""📡 ВХОДЯЩАЯ ПЕРЕДАЧА ОТ ЗЕМЛИ

👤 Отправитель: {name}
📧 Канал связи: {email}
🌐 Контакт: {phone}

💬 Содержание сигнала:
{message}"""
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = {
        'chat_id': chat_id,
        'text': telegram_message,
        'parse_mode': 'HTML'
    }
    
    encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=encoded_data, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            response.read()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'message': 'Сообщение отправлено'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to send: {str(e)}'})
        }