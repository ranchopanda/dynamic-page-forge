import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';
import AdminStyleManager from './AdminStyleManager';
import AdminDesignReview from './AdminDesignReview';
import AdminBlogManager from './AdminBlogManager';
import AdminSettings from './AdminSettings';

interface AdminDashboardProps {
  onBack: () => void;
  onStartDesign?: () => void;
  onGallery?: () => void;
  onArtists?: () => void;
  onSaved?: () => void;
  onBooking?: () => void;
  onAuth?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBack, 
  onStartDesign, 
  onGallery, 
  onArtists, 
  onSaved, 
  onBooking,
  onAuth 
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'styles' | 'designs' | 'blog' | 'settings'>('dashboard');

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    loadData();
  }, [user, page]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers({ page, limit: 20 })
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setPagination(usersData.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      await api.updateUserRole(userId, newRole as any);
      loadData(); // Reload data
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">block</span>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <button onClick={onBack} className="px-6 py-2 bg-primary text-white rounded-full hover:bg-[#a15842]">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fadeIn">
      <Header
        onBookClick={onStartDesign || (() => {})}
        onSavedClick={onSaved || (() => {})}
        onGalleryClick={onGallery || (() => {})}
        onArtistsClick={onArtists || (() => {})}
        onProfileClick={() => {}}
        onAuthClick={onAuth || (() => {})}
        onLogoClick={onBack}
      />

      <div className="max-w-7xl mx-auto py-8 px-4">
        <Breadcrumb items={[
          { label: 'Home', onClick: onBack },
          { label: 'Admin Dashboard' }
        ]} />

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary font-headline mb-2">Admin Dashboard</h1>
          <p className="text-text-primary-light/70">Manage users, view statistics, and monitor platform activity</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['dashboard', 'users', 'styles', 'designs', 'blog', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap capitalize ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {tab === 'styles' ? '🎨 Styles' : 
               tab === 'designs' ? '📋 Reviews' :
               tab === 'blog' ? '📝 Blog' :
               tab === 'settings' ? '⚙️ Settings' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'styles' ? (
          <AdminStyleManager />
        ) : activeTab === 'designs' ? (
          <AdminDesignReview />
        ) : activeTab === 'blog' ? (
          <AdminBlogManager />
        ) : activeTab === 'settings' ? (
          <AdminSettings />
        ) : loading && !stats ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error}
          </div>
        ) : activeTab === 'dashboard' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-background-dark/50 p-6 rounded-2xl shadow-md border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-text-primary-light/60">Total Users</h3>
                  <span className="material-symbols-outlined text-primary">group</span>
                </div>
                <p className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</p>
              </div>

              <div className="bg-white dark:bg-background-dark/50 p-6 rounded-2xl shadow-md border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-text-primary-light/60">Total Designs</h3>
                  <span className="material-symbols-outlined text-primary">palette</span>
                </div>
                <p className="text-3xl font-bold text-primary">{stats?.totalDesigns || 0}</p>
              </div>

              <div className="bg-white dark:bg-background-dark/50 p-6 rounded-2xl shadow-md border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-text-primary-light/60">Total Bookings</h3>
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                </div>
                <p className="text-3xl font-bold text-primary">{stats?.totalBookings || 0}</p>
              </div>

              <div className="bg-white dark:bg-background-dark/50 p-6 rounded-2xl shadow-md border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-text-primary-light/60">Pending Bookings</h3>
                  <span className="material-symbols-outlined text-orange-500">pending</span>
                </div>
                <p className="text-3xl font-bold text-orange-500">{stats?.pendingBookings || 0}</p>
              </div>
            </div>

            {/* Recent Bookings */}
            {stats?.recentBookings && stats.recentBookings.length > 0 && (
              <div className="bg-white dark:bg-background-dark/50 rounded-2xl shadow-md border border-primary/10 p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
                <div className="space-y-3">
                  {stats.recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-xl">
                      <div>
                        <p className="font-medium">{booking.user.name}</p>
                        <p className="text-sm text-text-primary-light/60">{booking.user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </>
        ) : activeTab === 'users' ? (
          <>
            {/* Users Table */}
            <div className="bg-white dark:bg-background-dark/50 rounded-2xl shadow-md border border-primary/10 overflow-hidden">
              <div className="p-6 border-b border-primary/10">
                <h2 className="text-xl font-bold">User Management</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-light dark:bg-background-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-primary-light/60 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-primary-light/60 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-primary-light/60 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-primary-light/60 uppercase tracking-wider">Designs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-primary-light/60 uppercase tracking-wider">Bookings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-primary-light/60 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/10">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-primary-light/70">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            user.role === 'ARTIST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user._count.designs}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user._count.bookings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="border border-primary/20 rounded-lg px-3 py-1 text-sm bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary outline-none"
                          >
                            <option value="USER">User</option>
                            <option value="ARTIST">Artist</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="p-6 border-t border-primary/10 flex items-center justify-between">
                  <div className="text-sm text-text-primary-light/60">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
