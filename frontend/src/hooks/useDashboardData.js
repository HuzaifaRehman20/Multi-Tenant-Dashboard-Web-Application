import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useDashboardData() {
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [activityBreakdown, setActivityBreakdown] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, trendRes, activityRes, recentRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/sales-trend'),
          api.get('/dashboard/activity-breakdown'),
          api.get('/dashboard/recent-sales'),
        ]);
        setStats(statsRes.data.stats);
        setSalesTrend(trendRes.data.chart_data);
        setActivityBreakdown(activityRes.data.chart_data);
        setRecentSales(recentRes.data.recent_sales);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return { stats, salesTrend, activityBreakdown, recentSales, loading, error };
}
