import React, { useEffect, useState } from 'react';
import { ownerService } from '../../services/api';
import { OwnerDashboard as OwnerDashboardType } from '../../types';
import StarRating from '../../components/common/StarRating';

const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });

  useEffect(() => {
    ownerService.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: string) => {
    setSort((prev) => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedRaters = data ? [...data.raters].sort((a, b) => {
    const ord = sort.order === 'asc' ? 1 : -1;
    if (sort.field === 'name') return a.user.name.localeCompare(b.user.name) * ord;
    if (sort.field === 'rating') return (a.rating - b.rating) * ord;
    return 0;
  }) : [];

  const sortIcon = (field: string) => {
    if (sort.field !== field) return <span className="sort-indicator">↕</span>;
    return <span className="sort-indicator active">{sort.order === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) return <div className="loading-wrapper"><div className="spinner" /> Loading dashboard…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Store Dashboard</h1>
          <p className="page-subtitle">{data.store.name}</p>
        </div>
      </div>

      {/* Store info + rating cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-label">Average Rating</div>
          <div className="stat-value">{data.avgRating ?? '—'}</div>
          {data.avgRating && (
            <div style={{ marginTop: 8 }}>
              <StarRating value={Math.round(data.avgRating)} readOnly size="sm" />
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-label">Total Ratings</div>
          <div className="stat-value">{data.totalRatings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-label">Store Email</div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginTop: 8, wordBreak: 'break-all' }}>{data.store.email}</div>
        </div>
      </div>

      {/* Store address */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: '20px' }}></span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>STORE ADDRESS</div>
            <div style={{ fontSize: '14px' }}>{data.store.address}</div>
          </div>
        </div>
      </div>

      {/* Raters table */}
      <div className="card">
        <div className="card-header">
          <h3>Customers Who Rated</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{data.raters.length} reviews</span>
        </div>
        {data.raters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <p>No ratings yet. Share your store to get reviews!</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Customer Name {sortIcon('name')}</th>
                  <th>Email</th>
                  <th onClick={() => handleSort('rating')}>Rating {sortIcon('rating')}</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedRaters.map((r) => (
                  <tr key={r.ratingId}>
                    <td style={{ fontWeight: 500 }}>{r.user.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.user.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#f59e0b', fontSize: '14px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{r.rating}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      {new Date(r.ratedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
