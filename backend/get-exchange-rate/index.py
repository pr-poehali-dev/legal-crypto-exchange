import json
import urllib.request
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get current USDT/RUB exchange rates from multiple crypto exchanges
    Args: event with httpMethod; context with request_id
    Returns: JSON with rates from Binance, Bybit, OKX, Coinbase, KuCoin, MEXC, Bitget, HTX, Gate.io
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
    
    rates: List[Dict[str, Any]] = []
    usd_rub_rate = 100.0
    
    try:
        req = urllib.request.Request('https://api.exchangerate-api.com/v4/latest/USD')
        req.add_header('User-Agent', 'Mozilla/5.0')
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            usd_rub_rate = float(data['rates'].get('RUB', 100.0))
    except:
        pass
    
    def fetch_binance():
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
                headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
            )
            
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('data') and len(data['data']) > 0:
                    prices = [float(item['adv']['price']) for item in data['data'][:5]]
                    return {
                        'exchange': 'Binance',
                        'rate': round(sum(prices) / len(prices), 2),
                        'change': 0.0
                    }
        except Exception as e:
            print(f'Binance error: {e}')
            return None
    
    def fetch_bybit():
        try:
            payload = json.dumps({
                "tokenId": "USDT",
                "currencyId": "RUB",
                "side": "1",
                "size": "10",
                "page": "1"
            }).encode('utf-8')
            
            req = urllib.request.Request(
                'https://api2.bybit.com/fiat/otc/item/online',
                data=payload,
                headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
            )
            
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('result', {}).get('items'):
                    prices = [float(item['price']) for item in data['result']['items'][:5]]
                    return {
                        'exchange': 'Bybit',
                        'rate': round(sum(prices) / len(prices), 2),
                        'change': 0.0
                    }
        except Exception as e:
            print(f'Bybit error: {e}')
            return None
    
    def fetch_okx():
        try:
            req = urllib.request.Request('https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=RUB&baseCurrency=USDT&side=buy&limit=10')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('data', {}).get('buy'):
                    prices = [float(item['price']) for item in data['data']['buy'][:5]]
                    if prices:
                        return {
                            'exchange': 'OKX',
                            'rate': round(sum(prices) / len(prices), 2),
                            'change': 0.0
                        }
        except Exception as e:
            print(f'OKX error: {e}')
            return None
    
    def fetch_kucoin():
        try:
            req = urllib.request.Request('https://www.kucoin.com/_api/otc/ad/list?currency=RUB&legal=USDT&side=buy&page=1&pageSize=10')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('data', {}).get('items'):
                    prices = [float(item['price']) for item in data['data']['items'][:5]]
                    if prices:
                        return {
                            'exchange': 'KuCoin',
                            'rate': round(sum(prices) / len(prices), 2),
                            'change': 0.0
                        }
        except Exception as e:
            print(f'KuCoin error: {e}')
            return None
    
    def fetch_mexc():
        try:
            req = urllib.request.Request('https://www.mexc.com/api/platform/otc/ad/list?currency=RUB&paymentTerm=USDT&side=BUY&page=1&limit=10')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('data'):
                    prices = [float(item['price']) for item in data['data'][:5] if 'price' in item]
                    if prices:
                        return {
                            'exchange': 'MEXC',
                            'rate': round(sum(prices) / len(prices), 2),
                            'change': 0.0
                        }
        except Exception as e:
            print(f'MEXC error: {e}')
            return None
    
    def fetch_gate():
        try:
            req = urllib.request.Request('https://www.gate.io/c2c/deals?currency=RUB&crypto_currency=USDT&trade_type=buy&page=1&page_size=10')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('list'):
                    prices = [float(item['price']) for item in data['list'][:5] if 'price' in item]
                    if prices:
                        return {
                            'exchange': 'Gate.io',
                            'rate': round(sum(prices) / len(prices), 2),
                            'change': 0.0
                        }
        except Exception as e:
            print(f'Gate.io error: {e}')
            return None
    
    def fetch_coinbase():
        try:
            req = urllib.request.Request('https://api.coinbase.com/v2/exchange-rates?currency=USDT')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=3) as response:
                data = json.loads(response.read().decode())
                if data.get('data', {}).get('rates', {}).get('RUB'):
                    return {
                        'exchange': 'Coinbase',
                        'rate': round(float(data['data']['rates']['RUB']), 2),
                        'change': 0.0
                    }
        except:
            return None
    
    def fetch_bitget():
        try:
            req = urllib.request.Request('https://api.bitget.com/api/p2p/ad/list?fiat=RUB&crypto=USDT&side=buy&page=1&size=10')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('data', {}).get('advList'):
                    prices = [float(item['price']) for item in data['data']['advList'][:5]]
                    if prices:
                        return {
                            'exchange': 'Bitget',
                            'rate': round(sum(prices) / len(prices), 2),
                            'change': 0.0
                        }
        except Exception as e:
            print(f'Bitget error: {e}')
            return None
    
    def fetch_htx():
        try:
            req = urllib.request.Request('https://www.htx.com/-/x/otc/v1/data/trade-market?coinId=2&currency=11&tradeType=buy&online=1&range=0')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('data'):
                    prices = [float(item['price']) for item in data['data'][:5] if 'price' in item]
                    if prices:
                        return {
                            'exchange': 'HTX',
                            'rate': round(sum(prices) / len(prices), 2),
                            'change': 0.0
                        }
        except Exception as e:
            print(f'HTX error: {e}')
            return None
    
    def fetch_rapira():
        try:
            req = urllib.request.Request('https://rapira.net/exchange/USDT_RUB')
            req.add_header('User-Agent', 'Mozilla/5.0')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('rate'):
                    return {
                        'exchange': 'Rapira',
                        'rate': round(float(data['rate']), 2),
                        'change': 0.0
                    }
        except Exception as e:
            print(f'Rapira error: {e}')
            return None
    
    fetchers = [
        fetch_rapira, fetch_binance, fetch_bybit, fetch_okx, fetch_kucoin,
        fetch_mexc, fetch_gate, fetch_coinbase, fetch_bitget, fetch_htx
    ]
    
    for fetcher in fetchers:
        result = fetcher()
        if result:
            rates.append(result)
    
    if not rates:
        rates = [{'exchange': 'Fallback', 'rate': round(usd_rub_rate, 2), 'change': 0.0}]
    
    avg_rate = sum(r['rate'] for r in rates) / len(rates) if rates else usd_rub_rate
    
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
            'rate': round(avg_rate, 2),
            'rates': rates,
            'count': len(rates),
            'usd_rub': round(usd_rub_rate, 2)
        })
    }