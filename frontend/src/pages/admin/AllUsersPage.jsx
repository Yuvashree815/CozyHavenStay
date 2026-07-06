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

  useEffect(() => {
    fetchUsers();
  }, [pageNumber]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsersApi(pageNumber, 10);
      setUsers(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    setDeactivatingId(userId);
    try {
      await deactivateUserApi(userId);
      setUsers(users.map(u =>
        u.id === userId ? { ...u, isActive: false } : u
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setDeactivatingId(null);
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      Admin: 'bg-danger',
      HotelOwner: 'bg-warning text-dark',
      User: 'bg-primary',
    };
    return map[role] || 'bg-secondary';
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading users...</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">All Users</h4>
          <small className="text-muted">{totalCount} total users</small>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="text-muted small">#{user.id}</td>
                <td className="fw-bold">{user.fullName}</td>
                <td className="text-muted small">{user.email}</td>
                <td>
                  <span className={`badge ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-muted small">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
                <td>
                  {user.isActive ? (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeactivate(user.id)}
                      disabled={deactivatingId === user.id}
                    >
                      {deactivatingId === user.id
                        ? 'Deactivating...'
                        : 'Deactivate'}
                    </button>
                  ) : (
                    <span className="text-muted small">Deactivated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            ← Previous
          </button>
          <span className="btn btn-light disabled">
            Page {pageNumber} of {totalPages}
          </span>
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === totalPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;