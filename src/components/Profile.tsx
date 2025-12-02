import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/SupabaseAuthContext';
import { supabaseApi } from '../lib/supabaseApi';
import { Booking, Design } from '../types';
import Header from './Header';
import Footer from './Footer';

interface ProfileProps {
  onBack: () => void;
  onViewDesign: (designId: string) => void;
  onStartDesign?: () => void;
  onGallery?: () => void;
  onArtists?: () => void;
  onSaved?: () => void;
  onBooking?: () => void;
  onAuth?: () => void;
  onAdmin?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack, onViewDesign, onStartDesign, onGallery, onArtists, onSaved, onBooking, onAuth, onAdmin }) => {
  const { user, updateProfile, logout, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'designs' | 'bookings' | 'settings'>('designs');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name, phone: user.phone || '' });
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [designsData, bookingsData] = await Promise.all([
        supabaseApi.getMyDesigns(),
        supabaseApi.getMyBookings(),
      ]);
      setDesigns(designsData as any);
      setBookings(bookingsData as any);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      await updatePassword(passwordForm.newPassword);
      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    try {
      await supabaseApi.deleteDesign(id);
      setDesigns(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete design:', error);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await supabaseApi.cancelBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Only admins have profiles
  if (!user) {
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
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="bg-white dark:bg-background-dark rounded-2xl p-8 shadow-lg">
            <span className="material-symbols-outlined text-6xl text-primary mb-4">admin_panel_settings</span>
            <h2 className="text-2xl font-bold mb-4">Admin Access Only</h2>
            <p className="text-text-primary-light/70 mb-6">
              This page is for administrators only. Regular users don't need accounts - you can use all features freely!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={onAuth}
                className="px-6 py-3 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/10 transition-colors"
              >
                Admin Login
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-[#a15842] transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Header */}
      <Header
        onBookClick={onStartDesign || (() => {})}
        onSavedClick={onSaved || (() => {})}
        onGalleryClick={onGallery || (() => {})}
        onArtistsClick={onArtists || (() => {})}
        onProfileClick={() => {}}
        onAuthClick={onAuth || (() => {})}
        onLogoClick={onBack}
      />

      <div className="max-w-5xl mx-auto py-8 px-4">

        {/* Profile Header */}
        <div className="bg-white dark:bg-background-dark/50 rounded-3xl p-8 shadow-lg border border-primary/10 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-primary">person</span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-headline text-3xl font-bold text-primary">{user.name}</h1>
              <p className="text-text-primary-light/70 dark:text-text-primary-dark/70">{user.email}</p>
              <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                  {designs.length} Designs
                </span>
                <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                  {bookings.length} Bookings
                </span>
                <span className="text-sm bg-accent-gold/20 text-accent-gold px-3 py-1 rounded-full capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {user.role === 'ADMIN' && onAdmin && (
                <button
                  onClick={onAdmin}
                  className="px-6 py-2 bg-primary text-white rounded-full hover:bg-[#a15842] transition-colors flex items-center gap-2 justify-center"
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={logout}
                className="px-6 py-2 border border-red-300 text-red-500 rounded-full hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['designs', 'bookings', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'designs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-text-primary-light/50">
                    <span className="material-symbols-outlined text-6xl mb-4">palette</span>
                    <p>No designs yet. Start creating!</p>
                  </div>
                ) : (
                  designs.map(design => (
                    <div
                      key={design.id}
                      className="group relative bg-white dark:bg-background-dark/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-primary/10"
                    >
                      <div
                        className="aspect-[3/4] bg-cover bg-center cursor-pointer"
                        style={{ backgroundImage: `url("${design.generatedImageUrl}")` }}
                        onClick={() => onViewDesign(design.id)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                        <p className="text-white font-bold">{design.style?.name || 'Custom Design'}</p>
                        <p className="text-white/70 text-sm">{new Date(design.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDesign(design.id)}
                        className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-text-primary-light/50">
                    <span className="material-symbols-outlined text-6xl mb-4">calendar_month</span>
                    <p>No bookings yet.</p>
                  </div>
                ) : (
                  bookings.map(booking => (
                    <div
                      key={booking.id}
                      className="bg-white dark:bg-background-dark/50 rounded-2xl p-6 shadow-md border border-primary/10"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <span className="text-sm text-text-primary-light/50 font-mono">
                              {booking.confirmationCode}
                            </span>
                          </div>
                          <p className="font-bold text-lg">
                            {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-text-primary-light/70">
                            {booking.scheduledTime} • {booking.consultationType.replace('_', ' ')}
                          </p>
                        </div>
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Profile Settings */}
                <div className="bg-white dark:bg-background-dark/50 rounded-2xl p-8 shadow-md border border-primary/10">
                  <h3 className="font-headline text-xl font-bold mb-6">Profile Settings</h3>
                  
                  {isEditing ? (
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveProfile}
                          className="px-6 py-2 bg-primary text-white rounded-full hover:bg-[#a15842] transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 border border-primary/20 rounded-full hover:bg-primary/5 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-primary/10">
                        <span className="text-text-primary-light/70">Name</span>
                        <span className="font-medium">{user.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-primary/10">
                        <span className="text-text-primary-light/70">Email</span>
                        <span className="font-medium">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-primary/10">
                        <span className="text-text-primary-light/70">Phone</span>
                        <span className="font-medium">{user.phone || 'Not set'}</span>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-6 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-background-dark/50 rounded-2xl p-8 shadow-md border border-primary/10">
                  <h3 className="font-headline text-xl font-bold mb-6">Change Password</h3>
                  
                  {isChangingPassword ? (
                    <div className="space-y-4 max-w-md">
                      {passwordError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                          {passwordSuccess}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark"
                          placeholder="••••••••"
                          minLength={8}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background-light dark:bg-background-dark"
                          placeholder="••••••••"
                          minLength={8}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleChangePassword}
                          className="px-6 py-2 bg-primary text-white rounded-full hover:bg-[#a15842] transition-colors"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordForm({ newPassword: '', confirmPassword: '' });
                            setPasswordError('');
                          }}
                          className="px-6 py-2 border border-primary/20 rounded-full hover:bg-primary/5 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-text-primary-light/70 mb-4">
                        Update your password to keep your account secure.
                      </p>
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="px-6 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">lock</span>
                        Change Password
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
