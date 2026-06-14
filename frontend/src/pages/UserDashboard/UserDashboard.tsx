import React, { useEffect, useState, useCallback } from 'react';
import { storeService, ratingService } from '../../services/api';
import { StoreWithUserRating } from '../../types';
import StarRating from '../../components/common/StarRating';

const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<StoreWithUserRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });
  const [ratingModal, setRatingModal] = useState<StoreWithUserRating | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sortBy: sort.field, order: sort.order };
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;
      const res = await storeService.getStores(params);
      setStores(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openRatingModal = (store: StoreWithUserRating) => {
    setRatingModal(store);
    setSelectedRating(store.userRating || 0);
    setRatingError('');
    setRatingSuccess('');
  };

  const handleSubmitRating = async () => {
    if (!ratingModal || selectedRating === 0) {
      setRatingError('Please select a rating (1–5 stars).');
      return;
    }
    setRatingLoading(true);
    setRatingError('');
    try {
      if (ratingModal.userRatingId) {
        await ratingService.updateRating(ratingModal.userRatingId, selectedRating);
      } else {
        await ratingService.submitRating(ratingModal.id, selectedRating);
      }
      setRatingSuccess('Rating saved successfully!');
      fetchStores();
      setTimeout(() => { setRatingModal(null); setRatingSuccess(''); }, 1500);
    } catch (err: any) {
      setRatingError(err.response?.data?.message || 'Failed to save rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  const renderAvgRating = (avg: number | null) => {
    if (avg === null) return <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No ratings yet</span>;
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#f59e0b', fontSize: '14px' }}>★</span>
        <span style={{ fontWeight: 700, fontSize: '15px' }}>{avg}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/5</span>
      </span>
    );
  };

  const handleSortToggle = (field: string) => {
    setSort((prev) => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Stores</h1>
          <p className="page-subtitle">Discover and rate stores near you</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Search by Name</label>
          <input className="form-input" placeholder="e.g. Pizza Hut…" value={search.name}
            onChange={(e) => setSearch({ ...search, name: e.target.value })} />
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Search by Address</label>
          <input className="form-input" placeholder="e.g. MG Road…" value={search.address}
            onChange={(e) => setSearch({ ...search, address: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Sort By</label>
          <select className="form-select" value={sort.field}
            onChange={(e) => setSort({ field: e.target.value, order: 'asc' })}>
            <option value="name">Name</option>
            <option value="address">Address</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => handleSortToggle(sort.field)}>
            {sort.order === 'asc' ? '↑ ASC' : '↓ DESC'}
          </button>
          <button className="btn btn-secondary" onClick={() => setSearch({ name: '', address: '' })}>Clear</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper"><div className="spinner" /> Loading stores…</div>
      ) : stores.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"></div><p>No stores found.</p></div>
      ) : (
        <div className="store-grid">
          {stores.map((store) => (
            <div key={store.id} className="store-card">
              <div className="store-card-name">{store.name}</div>
              <div className="store-card-address">{store.address}</div>

              <div className="store-card-meta">
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4 }}>Overall Rating</div>
                  {renderAvgRating(store.avgRating)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4 }}>Your Rating</div>
                  {store.userRating ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: '#f59e0b' }}>{'★'.repeat(store.userRating)}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({store.userRating})</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Not rated</span>
                  )}
                </div>
              </div>

              <button
                className={`btn btn-sm ${store.userRating ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%' }}
                onClick={() => openRatingModal(store)}
              >
                {store.userRating ? 'Update Rating' : 'Rate This Store'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{ratingModal.userRatingId ? 'Update Rating' : 'Rate Store'}</h3>
              <button className="modal-close" onClick={() => setRatingModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: 4 }}>{ratingModal.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: 24 }}>{ratingModal.address}</p>

              {ratingError && <div className="alert alert-error">{ratingError}</div>}
              {ratingSuccess && <div className="alert alert-success">{ratingSuccess}</div>}

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Tap a star to select your rating
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <StarRating value={selectedRating} onChange={setSelectedRating} size="lg" />
                </div>
                <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', minHeight: 30 }}>
                  {selectedRating > 0 ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][selectedRating] : ''}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitRating} disabled={ratingLoading || selectedRating === 0}>
                {ratingLoading ? 'Saving…' : ratingModal.userRatingId ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
