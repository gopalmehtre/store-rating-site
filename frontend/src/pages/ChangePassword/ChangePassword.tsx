import React, { useState } from 'react';
import { userService } from '../../services/api';
import { validatePassword } from '../../utils/validators';

const ChangePassword: React.FC = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required.';
    const passErr = validatePassword(form.newPassword);
    if (passErr) errs.newPassword = passErr;
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (form.newPassword === form.currentPassword) errs.newPassword = 'New password must be different from current password.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await userService.changePassword(form.currentPassword, form.newPassword);
      setSuccess('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account password</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-body">
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
              />
              {errors.currentPassword && <p className="form-error">{errors.currentPassword}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                placeholder="e.g. NewPass@123"
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
              <p className="form-hint">8–16 chars, 1 uppercase letter, 1 special character</p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repeat new password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
