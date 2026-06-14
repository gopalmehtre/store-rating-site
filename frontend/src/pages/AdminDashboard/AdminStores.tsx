import React, { useEffect, useState, useCallback } from 'react';
import { adminService, userService } from '../../services/api';
import { Store } from '../../types';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';

const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [storeOwners, setStoreOwners] = useState<{ id: number; name: string; email: string }[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sortBy: sort.field, order: sort.order };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      const res = await adminService.getStores(params);
      setStores(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filters, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const loadOwners = async () => {
    try {
      const res = await userService.getStoreOwners();
      setStoreOwners(res.data);
    } catch { /* silent */ }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setFormError('');
    setFormSuccess('');
    setForm({ name: '', email: '', address: '', ownerId: '' });
    setFormErrors({});
    loadOwners();
  };

  const handleSort = (field: string) => {
    setSort((prev) => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
  };

  const sortIcon = (field: string) => {
    if (sort.field !== field) return <span className="sort-indicator">↕</span>;
    return <span className="sort-indicator active">{sort.order === 'asc' ? '↑' : '↓'}</span>;
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    const nameErr = validateName(form.name); if (nameErr) errs.name = nameErr;
    const emailErr = validateEmail(form.email); if (emailErr) errs.email = emailErr;
    const addrErr = validateAddress(form.address); if (addrErr) errs.address = addrErr;
    if (!form.ownerId) errs.ownerId = 'Please select a store owner.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) return;
    setFormLoading(true);
    try {
      await adminService.createStore({ ...form, ownerId: Number(form.ownerId) });
      setFormSuccess('Store created successfully!');
      fetchStores();
      setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setFormLoading(false);
    }
  };

  const renderStars = (avg: number | null) => {
    if (avg === null) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No ratings</span>;
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</span>
        <span style={{ fontWeight: 600, fontSize: '13px' }}>{avg}</span>
      </span>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Stores</h1>
          <p className="page-subtitle">{stores.length} stores found</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>+ Add Store</button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Name</label>
          <input className="form-input" placeholder="Filter by name…" value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        </div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Email</label>
          <input className="form-input" placeholder="Filter by email…" value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        </div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Address</label>
          <input className="form-input" placeholder="Filter by address…" value={filters.address}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setFilters({ name: '', email: '', address: '' })}>Clear</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /> Loading stores…</div>
        ) : stores.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"></div><p>No stores found.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Store Name {sortIcon('name')}</th>
                <th onClick={() => handleSort('email')}>Email {sortIcon('email')}</th>
                <th onClick={() => handleSort('address')}>Address {sortIcon('address')}</th>
                <th>Owner</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td style={{ fontWeight: 500 }}>{store.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{store.email}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{store.address}</td>
                  <td>{store.owner?.name ?? '—'}</td>
                  <td>{renderStars(store.avgRating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Store Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Store</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input className={`form-input ${formErrors.name ? 'error' : ''}`} placeholder="Min 20 characters"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                  <p className="form-hint">{form.name.length}/60</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Store Email</label>
                  <input type="email" className={`form-input ${formErrors.email ? 'error' : ''}`}
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Store Address</label>
                  <textarea className={`form-input ${formErrors.address ? 'error' : ''}`} rows={2}
                    value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    style={{ resize: 'vertical' }} />
                  {formErrors.address && <p className="form-error">{formErrors.address}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Store Owner</label>
                  <select className={`form-select ${formErrors.ownerId ? 'error' : ''}`}
                    value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
                    <option value="">— Select an owner —</option>
                    {storeOwners.map((o) => (
                      <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                    ))}
                  </select>
                  {formErrors.ownerId && <p className="form-error">{formErrors.ownerId}</p>}
                  {storeOwners.length === 0 && (
                    <p className="form-hint">No available store owners. Create a user with the Store Owner role first.</p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Creating…' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
