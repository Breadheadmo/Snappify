import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

const AdminUsers: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const handleEdit = (user: User) => {
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
    await fetch(`/api/users/${editUserId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editData),
    });
    setEditUserId(null);
    setEditData({});
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4">Username</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Admin</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b">
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
                      <button onClick={() => handleDelete(u._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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
