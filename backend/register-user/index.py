import json
import os
import urllib.request
import urllib.parse
import hashlib
import re
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle user registration, save to database, send notification to Telegram
    Args: event with httpMethod, body containing name, email, phone, password
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
    
    body_data = json.loads(event.get('body', '{}'))
    first_name = body_data.get('first_name', '')
    last_name = body_data.get('last_name', '')
    email = body_data.get('email', '')
    phone = body_data.get('phone', '')
    password = body_data.get('password', '')
    
    if not all([first_name, last_name, email, phone, password]):
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Все поля обязательны для заполнения'})
        }
    
    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Введите корректный email адрес'})
        }
    
    # Validate phone format (Russian phone numbers)
    phone_cleaned = re.sub(r'[^\d+]', '', phone)
    phone_pattern = r'^(\+7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$'
    
    if not re.match(phone_pattern, phone) and not (len(phone_cleaned) >= 10 and len(phone_cleaned) <= 12):
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Введите корректный номер телефона (формат: +7XXXXXXXXXX или 8XXXXXXXXXX)'})
        }
    
    # Validate first_name and last_name length
    if len(first_name.strip()) < 2:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Имя должно содержать минимум 2 символа'})
        }
    
    if len(last_name.strip()) < 2:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Фамилия должна содержать минимум 2 символа'})
        }
    
    # Validate password strength
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Пароль должен содержать минимум 6 символов'})
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
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
        
        # Check if email already exists
        cursor.execute("SELECT id FROM t_p53513159_legal_crypto_exchang.users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Этот email уже зарегистрирован'})
            }
        
        # Check if phone already exists
        cursor.execute("SELECT id FROM t_p53513159_legal_crypto_exchang.users WHERE phone = %s", (phone,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Этот номер телефона уже зарегистрирован'})
            }
        
        username = f"{first_name} {last_name}"
        cursor.execute(
            "INSERT INTO t_p53513159_legal_crypto_exchang.users (name, username, first_name, last_name, email, phone, password_hash) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (username, username, first_name, last_name, email, phone, password_hash)
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        if bot_token and chat_id:
            telegram_message = f"""🎉 Новая регистрация на Legal Crypto Change!

👤 Имя: {first_name} {last_name}
📧 Email: {email}
📱 Телефон: {phone}
🆔 ID: {user_id}

✅ Пользователь готов к работе с платформой"""
            
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
            except:
                pass
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True, 
                'message': 'Регистрация успешна',
                'user_id': user_id
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
            'body': json.dumps({'error': f'Failed to register: {str(e)}'})
        }