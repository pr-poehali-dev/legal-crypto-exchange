import json
import urllib.request
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get current USDT/RUB exchange rate from Rapira.net API
    Args: event with httpMethod; context with request_id
    Returns: JSON with current exchange rate
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
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
    
    if method == 'GET':
        # Fetch from Rapira.net API
        rapira_url = 'https://api.rapira.net/open/market/rates'
        
        req = urllib.request.Request(rapira_url)
        req.add_header('User-Agent', 'Mozilla/5.0')
        
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            
            # Find USDT/RUB rate in response
            rate = 0.0
            if 'data' in data:
                for item in data['data']:
                    if item.get('symbol') == 'USDT/RUB':
                        rate = float(item.get('askPrice', 0))
                        break
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'rate': rate,
                    'source': 'rapira.net'
                })
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': False, 'error': 'Method not allowed'})
    }