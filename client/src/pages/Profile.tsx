import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, ShoppingBag, Heart, LogOut, Settings, Camera } from 'lucide-react';
import EditProfileForm from '../components/EditProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import AccountSettingsForm from '../components/AccountSettingsForm';
import WishlistSection from '../components/WishlistSection';
import OrderSection from '../components/OrderSection';

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [settings, setSettings] = useState({
    notifications: true,
    language: 'en',
    currency: 'USD'
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleProfileUpdate = async (data: { username: string; email: string }) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      setIsEditing(false);
      // Reload user data or update context
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setIsChangingPassword(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  const handleSettingsUpdate = async (data: { notifications: boolean; language: string; currency: string }) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSettings(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('http://localhost:5000/api/profile/upload-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload profile picture');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-12 w-12 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.username}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-t-lg border-b border-red-100">
                  {error}
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                  
                  {/* Profile Picture */}
                  <div className="mb-8 text-center">
                    <div className="relative inline-block">
                      <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                        {user?.profilePicture ? (
                          <img 
                            src={`http://localhost:5000${user.profilePicture}`}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-16 w-16 text-primary-600" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                        <Camera className="h-5 w-5 text-gray-600" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {isEditing ? (
                    <EditProfileForm
                      onSubmit={handleProfileUpdate}
                      initialData={{
                        username: user?.username || '',
                        email: user?.email || ''
                      }}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                          {user?.username}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                          {user?.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  )}

                  {isChangingPassword && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h4>
                      <ChangePasswordForm onSubmit={handlePasswordChange} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Order History</h3>
                  <OrderSection />
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Wishlist</h3>
                  <WishlistSection />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
                  <AccountSettingsForm
                    onSubmit={handleSettingsUpdate}
                    initialData={settings}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
