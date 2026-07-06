import { useState, useEffect } from 'react';
import { getAllUsersApi, deactivateUserApi } from '../../api/authApi';

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [filterRole, setFilterRole] = useState('All');

  useEffect(() => { fetchUsers(); }, [pageNumber]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsersApi(pageNumber, 10);
      setUsers(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user account?')) return;
    setDeactivatingId(userId);
    try {
      await deactivateUserApi(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: false } : u));
    } catch {
      setError('Failed to deactivate user.');
    } finally {
      setDeactivatingId(null);
    }
  };

  const getRoleClass = (role) => {
    const map = { Admin: 'role-admin', HotelOwner: 'role-owner', User: 'role-user' };
    return map[role] || 'role-user';
  };

  const getRoleIcon = (role) => {
    const map = { Admin: '👑', HotelOwner: '🏨', User: '👤' };
    return map[role] || '👤';
  };

  const getAvatarColor = (role) => {
    const map = {
      Admin: { bg: '#fde8e8', color: '#c0392b' },
      HotelOwner: { bg: '#fef3e2', color: '#d68910' },
      User: { bg: '#e8f0fe', color: '#1a56db' },
    };
    return map[role] || { bg: '#e8f0fe', color: '#1a56db' };
  };

  const filteredUsers = filterRole === 'All'
    ? users
    : users.filter(u => u.role === filterRole);

  const roleCounts = {
    All: users.length,
    Admin: users.filter(u => u.role === 'Admin').length,
    HotelOwner: users.filter(u => u.role === 'HotelOwner').length,
    User: users.filter(u => u.role === 'User').length,
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
      <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
        Loading users...
      </p>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h4 className="page-title">User Management</h4>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0
          }}>
            {totalCount} registered accounts
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da', border: '1px solid #f5c6cb',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
          marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.875rem'
        }}>⚠️ {error}</div>
      )}

      <div className="admin-card">
        {/* Card header with filters */}
        <div className="admin-card-header">
          <h5>All Users</h5>
          <div className="d-flex gap-2 flex-wrap">
            {['All', 'Admin', 'HotelOwner', 'User'].map(role => (
              <button
                key={role}
                className={`filter-chip ${filterRole === role ? 'active' : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role === 'All' ? '👥' : getRoleIcon(role)} {role}
                {' '}
                <span style={{ opacity: 0.7 }}>({roleCounts[role]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="pro-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No users found
                  </td>
                </tr>
              ) : filteredUsers.map((user) => {
                const avatarStyle = getAvatarColor(user.role);
                return (
                  <tr key={user.id}>
                    <td style={{ paddingLeft: '1.5rem' }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="table-avatar" style={{
                          background: avatarStyle.bg,
                          color: avatarStyle.color
                        }}>
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {user.fullName}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-light)'
                          }}>
                            #{user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </td>
                    <td>
                      <span className={getRoleClass(user.role)}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                        {user.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                      {user.isActive ? (
                        <button
                          className="btn-deactivate"
                          onClick={() => handleDeactivate(user.id)}
                          disabled={deactivatingId === user.id}
                        >
                          {deactivatingId === user.id
                            ? 'Deactivating...'
                            : 'Deactivate'}
                        </button>
                      ) : (
                        <span style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-light)',
                          fontStyle: 'italic'
                        }}>
                          Deactivated
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Page {pageNumber} of {totalPages}
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pageNumber === 1}
                onClick={() => setPageNumber(p => p - 1)}
              >
                ← Previous
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pageNumber === totalPages}
                onClick={() => setPageNumber(p => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsersPage;