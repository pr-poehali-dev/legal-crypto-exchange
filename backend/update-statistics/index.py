'''
Business: Update statistics cache for all users and global stats at 00:00 MSK daily
Args: event - HTTP event with httpMethod and optional body
      context - execution context with request_id
Returns: HTTP response with update status
'''
import json
import os
from datetime import datetime, timedelta, timezone
import psycopg2
from typing import Dict, Any, Tuple

def get_db_connection():
    """Get database connection using environment variable"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not found in environment')
    return psycopg2.connect(dsn)

def get_date_ranges() -> Dict[str, Tuple[str, str]]:
    """Calculate date ranges for different periods in MSK timezone"""
    msk_tz = timezone(timedelta(hours=3))
    now_msk = datetime.now(msk_tz)
    
    today = now_msk.date()
    yesterday = today - timedelta(days=1)
    week_start = today - timedelta(days=7)
    
    return {
        'today': (str(today), str(today)),
        'yesterday': (str(yesterday), str(yesterday)),
        'week': (str(week_start), str(today)),
        'all_time': ('1970-01-01', str(today))
    }

def update_user_statistics(conn, user_id: int, period_type: str, period_start: str, period_end: str):
    """Update statistics cache for specific user and period"""
    cursor = conn.cursor()
    
    # Calculate deals statistics
    cursor.execute(f"""
        SELECT 
            COUNT(*) as total_deals,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_deals,
            COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0) as total_volume,
            COUNT(*) FILTER (WHERE deal_type = 'buy' AND status = 'completed') as buy_deals,
            COALESCE(SUM(total) FILTER (WHERE deal_type = 'buy' AND status = 'completed'), 0) as buy_volume,
            COUNT(*) FILTER (WHERE deal_type = 'sell' AND status = 'completed') as sell_deals,
            COALESCE(SUM(total) FILTER (WHERE deal_type = 'sell' AND status = 'completed'), 0) as sell_volume
        FROM t_p53513159_legal_crypto_exchang.deals
        WHERE user_id = {user_id}
        AND created_at::date BETWEEN '{period_start}' AND '{period_end}'
    """)
    
    stats = cursor.fetchone()
    
    # Count active offers
    cursor.execute(f"""
        SELECT COUNT(*)
        FROM t_p53513159_legal_crypto_exchang.offers
        WHERE user_id = {user_id}
        AND status = 'active'
        AND created_at::date BETWEEN '{period_start}' AND '{period_end}'
    """)
    
    active_offers = cursor.fetchone()[0]
    
    # Insert or update cache
    cursor.execute(f"""
        INSERT INTO t_p53513159_legal_crypto_exchang.statistics_cache 
        (user_id, period_type, period_start, period_end, 
         total_deals, completed_deals, total_volume, 
         buy_deals, buy_volume, sell_deals, sell_volume, active_offers, updated_at)
        VALUES ({user_id}, '{period_type}', '{period_start}', '{period_end}',
                {stats[0]}, {stats[1]}, {stats[2]},
                {stats[3]}, {stats[4]}, {stats[5]}, {stats[6]}, {active_offers}, NOW())
        ON CONFLICT (user_id, period_type, period_start, period_end)
        DO UPDATE SET
            total_deals = {stats[0]},
            completed_deals = {stats[1]},
            total_volume = {stats[2]},
            buy_deals = {stats[3]},
            buy_volume = {stats[4]},
            sell_deals = {stats[5]},
            sell_volume = {stats[6]},
            active_offers = {active_offers},
            updated_at = NOW()
    """)
    
    cursor.close()

def update_global_statistics(conn, period_type: str, period_start: str, period_end: str):
    """Update global statistics cache for admin"""
    cursor = conn.cursor()
    
    # Count users
    cursor.execute("""
        SELECT 
            COUNT(*) as total_users,
            COUNT(*) FILTER (WHERE blocked = true) as blocked_users
        FROM t_p53513159_legal_crypto_exchang.users
    """)
    
    user_stats = cursor.fetchone()
    
    # Count offers
    cursor.execute(f"""
        SELECT 
            COUNT(*) as total_offers,
            COUNT(*) FILTER (WHERE status = 'active') as active_offers
        FROM t_p53513159_legal_crypto_exchang.offers
        WHERE created_at::date BETWEEN '{period_start}' AND '{period_end}'
    """)
    
    offer_stats = cursor.fetchone()
    
    # Calculate deals statistics
    cursor.execute(f"""
        SELECT 
            COUNT(*) as total_deals,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_deals,
            COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0) as total_volume,
            COUNT(*) FILTER (WHERE deal_type = 'buy' AND status = 'completed') as buy_deals,
            COALESCE(SUM(total) FILTER (WHERE deal_type = 'buy' AND status = 'completed'), 0) as buy_volume,
            COUNT(*) FILTER (WHERE deal_type = 'sell' AND status = 'completed') as sell_deals,
            COALESCE(SUM(total) FILTER (WHERE deal_type = 'sell' AND status = 'completed'), 0) as sell_volume
        FROM t_p53513159_legal_crypto_exchang.deals
        WHERE created_at::date BETWEEN '{period_start}' AND '{period_end}'
    """)
    
    deal_stats = cursor.fetchone()
    
    # Insert or update global cache
    cursor.execute(f"""
        INSERT INTO t_p53513159_legal_crypto_exchang.global_statistics_cache 
        (period_type, period_start, period_end,
         total_users, blocked_users, total_offers, active_offers,
         total_deals, completed_deals, total_volume,
         buy_deals, buy_volume, sell_deals, sell_volume, updated_at)
        VALUES ('{period_type}', '{period_start}', '{period_end}',
                {user_stats[0]}, {user_stats[1]}, {offer_stats[0]}, {offer_stats[1]},
                {deal_stats[0]}, {deal_stats[1]}, {deal_stats[2]},
                {deal_stats[3]}, {deal_stats[4]}, {deal_stats[5]}, {deal_stats[6]}, NOW())
        ON CONFLICT (period_type, period_start, period_end)
        DO UPDATE SET
            total_users = {user_stats[0]},
            blocked_users = {user_stats[1]},
            total_offers = {offer_stats[0]},
            active_offers = {offer_stats[1]},
            total_deals = {deal_stats[0]},
            completed_deals = {deal_stats[1]},
            total_volume = {deal_stats[2]},
            buy_deals = {deal_stats[3]},
            buy_volume = {deal_stats[4]},
            sell_deals = {deal_stats[5]},
            sell_volume = {deal_stats[6]},
            updated_at = NOW()
    """)
    
    cursor.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main handler for statistics update"""
    method = event.get('httpMethod', 'GET')
    
    # Handle CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    
    try:
        date_ranges = get_date_ranges()
        
        # Get all user IDs
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM t_p53513159_legal_crypto_exchang.users")
        user_ids = [row[0] for row in cursor.fetchall()]
        cursor.close()
        
        # Update statistics for each period type
        for period_type, (period_start, period_end) in date_ranges.items():
            # Update for each user
            for user_id in user_ids:
                update_user_statistics(conn, user_id, period_type, period_start, period_end)
            
            # Update global statistics
            update_global_statistics(conn, period_type, period_start, period_end)
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Statistics updated successfully',
                'users_updated': len(user_ids),
                'periods': list(date_ranges.keys())
            })
        }
    
    except Exception as e:
        conn.rollback()
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
