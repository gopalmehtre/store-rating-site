import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { DashboardStats } from '../../types';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load statistics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrapper"><div className="spinner" /> Loading stats…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of your platform</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-label">Total Stores</div>
          <div className="stat-value">{stats?.totalStores ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-label">Total Ratings</div>
          <div className="stat-value">{stats?.totalRatings ?? 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 2 }}>
          <p>Use the sidebar to manage <strong>Users</strong> and <strong>Stores</strong>.</p>
          <p>You can create admins, normal users, and store owners.</p>
          <p>You can add stores and assign them to store owners.</p>
          <p>All lists support searching, filtering, and sorting.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
