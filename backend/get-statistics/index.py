'''
Business: Get cached statistics for user or admin with period filters
Args: event - HTTP event with queryStringParameters: period, user_id, start_date, end_date
      context - execution context with request_id
Returns: HTTP response with statistics data
'''
import json
import os
from datetime import datetime, timedelta, timezone
import psycopg2
from typing import Dict, Any, Optional

def get_db_connection():
    """Get database connection using environment variable"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not found in environment')
    return psycopg2.connect(dsn)

def get_date_range(period: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> tuple:
    """Calculate date range based on period type"""
    msk_tz = timezone(timedelta(hours=3))
    now_msk = datetime.now(msk_tz)
    today = now_msk.date()
    
    if period == 'custom' and start_date and end_date:
        return start_date, end_date
    elif period == 'today':
        return str(today), str(today)
    elif period == 'yesterday':
        yesterday = today - timedelta(days=1)
        return str(yesterday), str(yesterday)
    elif period == 'week':
        week_start = today - timedelta(days=7)
        return str(week_start), str(today)
    else:  # all_time
        return '1970-01-01', str(today)

def get_user_statistics(conn, user_id: int, period_start: str, period_end: str) -> Dict[str, Any]:
    """Get statistics for specific user from cache or calculate"""
    cursor = conn.cursor()
    
    # Try to get from cache first
    cursor.execute(f"""
        SELECT total_deals, completed_deals, total_volume,
               buy_deals, buy_volume, sell_deals, sell_volume, active_offers
        FROM statistics_cache
        WHERE user_id = {user_id}
        AND period_start = '{period_start}'
        AND period_end = '{period_end}'
        AND updated_at > NOW() - INTERVAL '1 hour'
    """)
    
    cached = cursor.fetchone()
    
    if cached:
        cursor.close()
        return {
            'totalDeals': cached[0],
            'completedDeals': cached[1],
            'totalVolume': float(cached[2]),
            'buyDeals': cached[3],
            'buyVolume': float(cached[4]),
            'sellDeals': cached[5],
            'sellVolume': float(cached[6]),
            'activeOffers': cached[7]
        }
    
    # Calculate if not in cache
    cursor.execute(f"""
        SELECT 
            COUNT(*) as total_deals,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_deals,
            COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0) as total_volume,
            COUNT(*) FILTER (WHERE deal_type = 'buy' AND status = 'completed') as buy_deals,
            COALESCE(SUM(total) FILTER (WHERE deal_type = 'buy' AND status = 'completed'), 0) as buy_volume,
            COUNT(*) FILTER (WHERE deal_type = 'sell' AND status = 'completed') as sell_deals,
            COALESCE(SUM(total) FILTER (WHERE deal_type = 'sell' AND status = 'completed'), 0) as sell_volume
        FROM deals
        WHERE user_id = {user_id}
        AND created_at::date BETWEEN '{period_start}' AND '{period_end}'
    """)
    
    stats = cursor.fetchone()
    
    cursor.execute(f"""
        SELECT COUNT(*)
        FROM offers
        WHERE user_id = {user_id}
        AND status = 'active'
        AND created_at::date BETWEEN '{period_start}' AND '{period_end}'
    """)
    
    active_offers = cursor.fetchone()[0]
    cursor.close()
    
    return {
        'totalDeals': stats[0],
        'completedDeals': stats[1],
        'totalVolume': float(stats[2]),
        'buyDeals': stats[3],
        'buyVolume': float(stats[4]),
        'sellDeals': stats[5],
        'sellVolume': float(stats[6]),
        'activeOffers': active_offers
    }

def get_global_statistics(conn, period_start: str, period_end: str) -> Dict[str, Any]:
    """Get global statistics for admin from cache or calculate"""
    cursor = conn.cursor()
    
    # Try to get from cache first
    cursor.execute(f"""
        SELECT total_users, blocked_users, total_offers, active_offers,
               total_deals, completed_deals, total_volume,
               buy_deals, buy_volume, sell_deals, sell_volume
        FROM global_statistics_cache
        WHERE period_start = '{period_start}'
        AND period_end = '{period_end}'
        AND updated_at > NOW() - INTERVAL '1 hour'
    """)
    
    cached = cursor.fetchone()
    
    if cached:
        cursor.close()
        return {
            'totalUsers': cached[0],
            'blockedUsers': cached[1],
            'totalOffers': cached[2],
            'activeOffers': cached[3],
            'totalDeals': cached[4],
            'completedDeals': cached[5],
            'totalVolume': float(cached[6]),
            'buyDeals': cached[7],
            'buyVolume': float(cached[8]),
            'sellDeals': cached[9],
            'sellVolume': float(cached[10])
        }
    
    # Calculate if not in cache
    cursor.execute("""
        SELECT 
            COUNT(*) as total_users,
            COUNT(*) FILTER (WHERE blocked = true) as blocked_users
        FROM users
    """)
    
    user_stats = cursor.fetchone()
    
    cursor.execute(f"""
        SELECT 
            COUNT(*) as total_offers,
            COUNT(*) FILTER (WHERE status = 'active') as active_offers
        FROM offers
        WHERE created_at::date BETWEEN '{period_start}' AND '{period_end}'
    """)
    
    offer_stats = cursor.fetchone()
    
    cursor.execute(f"""
        SELECT 
            COUNT(*) as total_deals,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_deals,
            COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0) as total_volume,
            COUNT(*) FILTER (WHERE deal_type = 'buy' AND status = 'completed') as buy_deals,
            COALESCE(SUM(total) FILTER (WHERE deal_type = 'buy' AND status = 'completed'), 0) as buy_volume,
            COUNT(*) FILTER (WHERE deal_type = 'sell' AND status = 'completed') as sell_deals,
            COALESCE(SUM(total) FILTER (WHERE deal_type = 'sell' AND status = 'completed'), 0) as sell_volume
        FROM deals
        WHERE created_at::date BETWEEN '{period_start}' AND '{period_end}'
    """)
    
    deal_stats = cursor.fetchone()
    cursor.close()
    
    return {
        'totalUsers': user_stats[0],
        'blockedUsers': user_stats[1],
        'totalOffers': offer_stats[0],
        'activeOffers': offer_stats[1],
        'totalDeals': deal_stats[0],
        'completedDeals': deal_stats[1],
        'totalVolume': float(deal_stats[2]),
        'buyDeals': deal_stats[3],
        'buyVolume': float(deal_stats[4]),
        'sellDeals': deal_stats[5],
        'sellVolume': float(deal_stats[6])
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main handler for getting statistics"""
    method = event.get('httpMethod', 'GET')
    
    # Handle CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    params = event.get('queryStringParameters', {}) or {}
    period = params.get('period', 'all_time')
    user_id = params.get('user_id')
    start_date = params.get('start_date')
    end_date = params.get('end_date')
    
    conn = get_db_connection()
    
    try:
        period_start, period_end = get_date_range(period, start_date, end_date)
        
        if user_id:
            # Get user-specific statistics
            stats = get_user_statistics(conn, int(user_id), period_start, period_end)
        else:
            # Get global statistics for admin
            stats = get_global_statistics(conn, period_start, period_end)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'period': period,
                'periodStart': period_start,
                'periodEnd': period_end,
                'statistics': stats
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
    
    finally:
        conn.close()