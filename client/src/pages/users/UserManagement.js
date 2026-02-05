import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { authAPI } from '../../utils/api';
import { Plus, Search, Edit, Trash2, Users as UsersIcon, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import UserModal from './UserModal';
import './UserManagement.css';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data, isLoading, refetch } = useQuery('users', authAPI.getUsers);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Note: You'll need to implement this endpoint
      await authAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const users = data?.data?.data || [];
  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge-admin';
      case 'editor':
        return 'role-badge-editor';
      case 'viewer':
        return 'role-badge-viewer';
      default:
        return 'role-badge-default';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">User Management</h1>
          <p className="page-description">Manage user accounts and permissions</p>
        </div>
        <button onClick={handleCreateUser} className="btn btn-primary">
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box" style={{ maxWidth: '400px' }}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <UsersIcon size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <p>No users found</p>
          <button onClick={handleCreateUser} className="btn btn-primary">
            <Plus size={20} />
            Create First User
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <div className="user-name-cell">
                          {user.firstName} {user.lastName}
                        </div>
                        {user._id === currentUser.id && (
                          <span className="user-you-badge">You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <Mail size={16} />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      <Shield size={14} />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="btn-icon"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      {user._id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            refetch();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
