import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import SalesTrendChart from '../components/SalesTrendChart';
import ActivityBarChart from '../components/ActivityBarChart';
import RecentSalesTable from '../components/RecentSalesTable';
import MembersTable from '../components/MembersTable';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { stats, salesTrend, activityBreakdown, recentSales, loading, error } = useDashboardData();
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-screen">
          <div className="spinner" />
          <p className="loading-text">Loading your dashboard…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-screen">
          <div className="error-icon">⚠️</div>
          <p className="error-text">{error}</p>
        </div>
      );
    }

    if (activePage === 'members' && isAdmin()) {
      return (
        <>
          <div className="dashboard-header">
            <div className="dashboard-header-top">
              <h1 className="dashboard-title">Team Members</h1>
              <div className="org-badge">
                <div className="org-badge-dot" />
                {user?.organization_name}
              </div>
            </div>
            <p className="dashboard-subtitle">All members in your organization</p>
          </div>
          <MembersTable />
        </>
      );
    }

    if (activePage === 'sales') {
      return (
        <>
          <div className="dashboard-header">
            <div className="dashboard-header-top">
              <h1 className="dashboard-title">Sales</h1>
              <div className="org-badge">
                <div className="org-badge-dot" />
                {user?.organization_name}
              </div>
            </div>
            <p className="dashboard-subtitle">
              {isAdmin() ? 'All sales across your organization' : 'Your personal sales records'}
            </p>
          </div>
          <div className="table-card">
            <div className="table-card-title">💰 Recent Sales</div>
            <RecentSalesTable data={recentSales} isAdmin={isAdmin()} />
          </div>
        </>
      );
    }

    // Default: main dashboard view
    return (
      <>
        <div className="dashboard-header">
          <div className="dashboard-header-top">
            <div>
              <h1 className="dashboard-title">
                {isAdmin() ? '🏢 Admin Dashboard' : '👤 My Dashboard'}
              </h1>
            </div>
            <div className="org-badge">
              <div className="org-badge-dot" />
              {user?.organization_name}
            </div>
          </div>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.full_name}</strong> —{' '}
            {isAdmin()
              ? 'viewing aggregated data for your entire organization'
              : 'viewing your personal performance data'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatCard
            type="revenue"
            icon="💵"
            value={stats?.total_revenue}
            label={stats?.label_revenue || 'Revenue'}
          />
          <StatCard
            type="activities"
            icon="⚡"
            value={stats?.total_activities}
            label={stats?.label_activities || 'Activities'}
          />
          {isAdmin() && (
            <StatCard
              type="members"
              icon="👥"
              value={stats?.total_members}
              label={stats?.label_members || 'Members'}
            />
          )}
        </div>

        {/* Charts */}
        <div className="charts-grid">
          {/* Chart.js Line Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Sales Trend</div>
                <div className="chart-card-subtitle">Daily revenue over time</div>
              </div>
              <span className="chart-tag line">Chart.js · Line</span>
            </div>
            <SalesTrendChart data={salesTrend} />
          </div>

          {/* D3.js Bar Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Activity Breakdown</div>
                <div className="chart-card-subtitle">Count by category</div>
              </div>
              <span className="chart-tag d3">D3.js · Bar</span>
            </div>
            <ActivityBarChart data={activityBreakdown} />
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="table-card">
          <div className="table-card-title">🕐 Recent Sales</div>
          <RecentSalesTable data={recentSales} isAdmin={isAdmin()} />
        </div>
      </>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
