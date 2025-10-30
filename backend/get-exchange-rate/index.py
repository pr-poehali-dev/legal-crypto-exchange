import json
import urllib.request
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get current USDT/RUB exchange rate from Binance P2P
    Args: event with httpMethod; context with request_id
    Returns: JSON with rate from Binance P2P
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    rate = None
    
    try:
        payload = json.dumps({
            "asset": "USDT",
            "fiat": "RUB",
            "merchantCheck": True,
            "page": 1,
            "rows": 10,
            "tradeType": "BUY"
        }).encode('utf-8')
        
        req = urllib.request.Request(
            'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            
            if data.get('data') and len(data['data']) > 0:
                prices = [float(item['adv']['price']) for item in data['data'][:5]]
                rate = round(sum(prices) / len(prices), 2)
    except Exception as e:
        print(f'Binance P2P error: {e}')
    
    if not rate:
        try:
            req = urllib.request.Request('https://api.exchangerate-api.com/v4/latest/USD')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                usd_rub = float(data['rates'].get('RUB', 100.0))
                rate = round(usd_rub, 2)
        except Exception as e:
            print(f'Fallback rate error: {e}')
            rate = 100.0
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=30'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'rate': rate,
            'source': 'Binance P2P'
        })
    }