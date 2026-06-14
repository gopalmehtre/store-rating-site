import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/api';
import { User } from '../../types';
import { validateName, validateEmail, validatePassword, validateAddress } from '../../utils/validators';

const roleBadge = (role: string) => {
  const cls = role === 'ADMIN' ? 'badge-admin' : role === 'STORE_OWNER' ? 'badge-owner' : 'badge-user';
  const label = role === 'STORE_OWNER' ? 'Store Owner' : role;
  return <span className={`badge ${cls}`}>{label}</span>;
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sortBy: sort.field, order: sort.order };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;
      const res = await adminService.getUsers(params);
      setUsers(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
    const passErr = validatePassword(form.password); if (passErr) errs.password = passErr;
    const addrErr = validateAddress(form.address); if (addrErr) errs.address = addrErr;
    if (!form.role) errs.role = 'Role is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) return;
    setFormLoading(true);
    try {
      await adminService.createUser(form);
      setFormSuccess('User created successfully!');
      setForm({ name: '', email: '', password: '', address: '', role: 'USER' });
      fetchUsers();
      setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewUser = async (id: number) => {
    try {
      const res = await adminService.getUserById(id);
      setSelectedUser(res.data);
    } catch { /* silent */ }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{users.length} users found</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); setFormSuccess(''); }}>
          + Add User
        </button>
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
        <div className="form-group" style={{ minWidth: 130 }}>
          <label className="form-label">Role</label>
          <select className="form-select" value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setFilters({ name: '', email: '', address: '', role: '' })}>
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /> Loading users…</div>
        ) : users.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"></div><p>No users found.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Name {sortIcon('name')}</th>
                <th onClick={() => handleSort('email')}>Email {sortIcon('email')}</th>
                <th onClick={() => handleSort('address')}>Address {sortIcon('address')}</th>
                <th onClick={() => handleSort('role')}>Role {sortIcon('role')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 500 }}>{user.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{user.address}</td>
                  <td>{roleBadge(user.role)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleViewUser(user.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className={`form-input ${formErrors.name ? 'error' : ''}`} placeholder="Min 20 characters"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                  <p className="form-hint">{form.name.length}/60</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className={`form-input ${formErrors.email ? 'error' : ''}`}
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className={`form-input ${formErrors.password ? 'error' : ''}`}
                    placeholder="e.g. MyPass@123"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  {formErrors.password && <p className="form-error">{formErrors.password}</p>}
                  <p className="form-hint">8–16 chars, 1 uppercase, 1 special char</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className={`form-input ${formErrors.address ? 'error' : ''}`} rows={2}
                    value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    style={{ resize: 'vertical' }} />
                  {formErrors.address && <p className="form-error">{formErrors.address}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className={`form-select ${formErrors.role ? 'error' : ''}`}
                    value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="USER">Normal User</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                  {formErrors.role && <p className="form-error">{formErrors.role}</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Name', value: selectedUser.name },
                  { label: 'Email', value: selectedUser.email },
                  { label: 'Address', value: selectedUser.address },
                  { label: 'Role', value: roleBadge(selectedUser.role) },
                  ...(selectedUser.store ? [
                    { label: 'Store', value: selectedUser.store.name },
                    { label: 'Store Rating', value: selectedUser.store.avgRating != null ? `${selectedUser.store.avgRating}` : 'No ratings yet' },
                  ] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', width: 100, flexShrink: 0, paddingTop: '2px' }}>{label}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
