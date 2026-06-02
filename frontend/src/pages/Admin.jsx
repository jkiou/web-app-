import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';

export default function Admin() {
  const { token, user: currentUser, showToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch users and system stats in parallel
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      if (usersRes.ok && usersData.status === 'success') {
        setUsers(usersData.data.users);
      } else {
        showToast(usersData.message || 'Failed to load user accounts.', 'error');
      }

      if (statsRes.ok && statsData.status === 'success') {
        setStats(statsData.data.stats);
      } else {
        showToast(statsData.message || 'Failed to load system metrics.', 'error');
      }

    } catch (err) {
      console.error(err);
      showToast('Network error loading administrative panels.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleRoleChange = async (userId, currentRole) => {
    if (userId === currentUser.id) {
      showToast('You cannot modify your own administrative role.', 'error');
      return;
    }

    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;

    setUpdatingUserId(userId);
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToast(data.message || 'Role updated successfully!', 'success');
        fetchAdminData(); // Refresh tables and metrics
      } else {
        showToast(data.message || 'Failed to update user role.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, action failed.', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUserDelete = async (userId) => {
    if (userId === currentUser.id) {
      showToast('You cannot delete your own account.', 'error');
      return;
    }

    if (!window.confirm('WARNING: Deleting this user will permanently remove their account and all their assigned tasks. Proceed?')) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToast(data.message || 'User deleted successfully.', 'success');
        fetchAdminData(); // Refresh tables and metrics
      } else {
        showToast(data.message || 'Failed to delete user account.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, action failed.', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>System-wide oversight, user access governance, and core analytics.</p>
      </div>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Stats metrics row */}
          {stats && (
            <div className="stats-row animate-fade-in">
              <div className="stat-card">
                <div className="stat-num">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{stats.totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-card" style={{ borderBottom: '3px solid var(--success)' }}>
                <div className="stat-num">{stats.tasksByStatus.COMPLETED}</div>
                <div className="stat-label">Completed Tasks</div>
              </div>
              <div className="stat-card" style={{ borderBottom: '3px solid var(--primary)' }}>
                <div className="stat-num">{stats.tasksByStatus.IN_PROGRESS}</div>
                <div className="stat-label">Tasks In Progress</div>
              </div>
              <div className="stat-card" style={{ borderBottom: '3px solid var(--text-dark)' }}>
                <div className="stat-num">{stats.tasksByStatus.PENDING}</div>
                <div className="stat-label">Pending Tasks</div>
              </div>
            </div>
          )}

          {/* User management panel */}
          <div className="glass-panel" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              User Account Directory
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Promote, demote, or terminate accounts. System tasks automatically cascade delete.
            </p>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Tasks count</th>
                    <th>Joined Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} style={isSelf ? { background: 'rgba(168, 85, 247, 0.05)' } : undefined}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="avatar-circle" style={{ background: u.role === 'ADMIN' ? 'var(--primary)' : 'var(--secondary)' }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{u.name}</strong> {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>(You)</span>}
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-status-progress' : 'badge-status-pending'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u._count.tasks} Tasks</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => handleRoleChange(u.id, u.role)}
                              disabled={isSelf || updatingUserId === u.id}
                              title={isSelf ? 'You cannot alter your own admin role' : `Change role to ${u.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}
                            >
                              {u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => handleUserDelete(u.id)}
                              disabled={isSelf || updatingUserId === u.id}
                              title={isSelf ? 'You cannot delete your own account' : 'Delete user account'}
                            >
                              Delete Account
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
