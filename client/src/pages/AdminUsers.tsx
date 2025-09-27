import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import LoadingIndicator from '../components/LoadingIndicator';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { User } from '../types/User';

const AdminUsers: React.FC = () => {
  // Removed legacy feedback state
  const { showNotification } = useNotification();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [search, setSearch] = useState('');
  const [filterAdmin, setFilterAdmin] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let result = Array.isArray(users) ? users : [];
    if (search) {
      result = result.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterAdmin !== 'all') {
      result = result.filter(u => filterAdmin === 'admin' ? u.isAdmin : !u.isAdmin);
    }
    setFilteredUsers(Array.isArray(result) ? result : []);
  }, [users, search, filterAdmin]);

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const fetchUsers = async () => {
    setLoading(true);
  // Removed legacy feedback usage
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
      showNotification('Failed to load users.', 'error');
    } finally {
      setLoading(false);
      setSelectedUserIds([]);
    }
  };

  const handleEdit = (user: User) => {
    if (!user._id) return;
    setEditUserId(user._id);
    setEditData({ username: user.username, email: user.email, isAdmin: user.isAdmin });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSave = async () => {
    if (!editUserId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${editUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error('Failed to update user');
      showNotification('User updated successfully.', 'success');
    } catch (err) {
      showNotification('Failed to update user.', 'error');
    } finally {
      setEditUserId(null);
      setEditData({});
      fetchUsers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      showNotification('User deleted successfully.', 'success');
    } catch (err) {
      showNotification('Failed to delete user.', 'error');
    }
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
  {/* All feedback now handled by showNotification and NotificationProvider */}
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="mb-4 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search by username or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select
          value={filterAdmin}
          onChange={e => setFilterAdmin(e.target.value as 'all' | 'admin' | 'user')}
          className="border rounded px-2 py-1"
        >
          <option value="all">All</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>
      <div className="mb-4 flex gap-4 items-center">
        <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="border rounded px-2 py-1">
          <option value="">Bulk Actions</option>
          <option value="delete">Delete Selected</option>
          <option value="makeAdmin">Make Admin</option>
          <option value="removeAdmin">Remove Admin</option>
        </select>
        <button
          className="bg-indigo-500 text-white px-3 py-1 rounded"
          disabled={selectedUserIds.length === 0 || !bulkAction}
          onClick={async () => {
            const token = localStorage.getItem('token');
            if (bulkAction === 'delete') {
              if (!window.confirm('Delete selected users?')) return;
              await Promise.all(selectedUserIds.map(id => fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              })));
            } else if (bulkAction === 'makeAdmin' || bulkAction === 'removeAdmin') {
              await Promise.all(selectedUserIds.map(id => fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAdmin: bulkAction === 'makeAdmin' })
              })));
            }
            setBulkAction('');
            fetchUsers();
          }}
        >Apply</button>
        <span className="text-sm text-gray-500">{selectedUserIds.length} selected</span>
      </div>
      {loading ? (
  <LoadingIndicator />
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4"><input type="checkbox" onChange={e => {
                if (e.target.checked) {
                  setSelectedUserIds(filteredUsers && Array.isArray(filteredUsers) ? filteredUsers.map(u => u._id!) : []);
                } else {
                  setSelectedUserIds([]);
                }
              }} checked={filteredUsers && Array.isArray(filteredUsers) && selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0} /></th>
              <th className="py-2 px-4">Username</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Admin</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(filteredUsers && Array.isArray(filteredUsers) ? filteredUsers : []).map((u) => (
              <tr key={u._id || u.id || 'unknown'} className="border-b">
                <td className="py-2 px-4 text-center">
                  <input type="checkbox" checked={selectedUserIds.includes(u._id!)} onChange={e => {
                    if (e.target.checked) {
                      setSelectedUserIds([...selectedUserIds, u._id!]);
                    } else {
                      setSelectedUserIds(selectedUserIds.filter(id => id !== u._id));
                    }
                  }} />
                </td>
                <td className="py-2 px-4">
                  {editUserId === u._id ? (
                    <input
                      name="username"
                      value={editData.username || ''}
                      onChange={handleEditChange}
                      className="border rounded px-2"
                    />
                  ) : (
                    u.username
                  )}
                </td>
                <td className="py-2 px-4">
                  {editUserId === u._id ? (
                    <input
                      name="email"
                      value={editData.email || ''}
                      onChange={handleEditChange}
                      className="border rounded px-2"
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {editUserId === u._id ? (
                    <input
                      type="checkbox"
                      name="isAdmin"
                      checked={!!editData.isAdmin}
                      onChange={handleEditChange}
                    />
                  ) : (
                    u.isAdmin ? 'Yes' : 'No'
                  )}
                </td>
                <td className="py-2 px-4">
                  {editUserId === u._id ? (
                    <>
                      <button onClick={handleEditSave} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
                      <button onClick={() => setEditUserId(null)} className="bg-gray-300 px-2 py-1 rounded">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(u)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                      <button onClick={() => handleDelete(u._id!)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
