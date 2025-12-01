import React, { useState, useEffect } from 'react';
import api from '../lib/api';

interface SiteSettings {
  siteName: string;
  tagline: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  pricePerHand: number;
  availableDays: string;
  instagram: string;
  facebook: string;
  pinterest: string;
  twitter: string;
  aboutText: string;
  seoKeywords: string;
  googleAnalytics: string;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Mehndi Design',
    tagline: 'AI-Powered Custom Mehndi Design Generator',
    ownerName: 'Himanshi',
    email: 'himanshiparashar44@gmail.com',
    phone: '+91 7011489500',
    whatsapp: '+91 7011489500',
    address: 'Greater Noida, Uttar Pradesh',
    pricePerHand: 100,
    availableDays: 'Sunday, Monday',
    instagram: '',
    facebook: '',
    pinterest: '',
    twitter: '',
    aboutText: '',
    seoKeywords: 'mehndi design, henna artist Greater Noida, bridal mehndi, AI mehndi generator',
    googleAnalytics: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings', settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">⚙️ Site Settings</h2>
        {message && (
          <span className={`px-4 py-2 rounded-lg text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Info */}
        <div className="bg-white dark:bg-background-dark/50 rounded-2xl p-6 border border-primary/10">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">business</span>
            Business Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Owner Name</label>
              <input
                type="text"
                value={settings.ownerName}
                onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-background-dark/50 rounded-2xl p-6 border border-primary/10">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">contact_phone</span>
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div className="bg-white dark:bg-background-dark/50 rounded-2xl p-6 border border-primary/10">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">palette</span>
            Service Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price Per Hand (₹)</label>
              <input
                type="number"
                value={settings.pricePerHand}
                onChange={(e) => setSettings({ ...settings, pricePerHand: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Available Days</label>
              <input
                type="text"
                value={settings.availableDays}
                onChange={(e) => setSettings({ ...settings, availableDays: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
                placeholder="Sunday, Monday"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">About Text</label>
              <textarea
                value={settings.aboutText || ''}
                onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
                rows={3}
                placeholder="Brief description about your services..."
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-background-dark/50 rounded-2xl p-6 border border-primary/10">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">share</span>
            Social Media
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Instagram URL</label>
              <input
                type="url"
                value={settings.instagram || ''}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Facebook URL</label>
              <input
                type="url"
                value={settings.facebook || ''}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pinterest URL</label>
              <input
                type="url"
                value={settings.pinterest || ''}
                onChange={(e) => setSettings({ ...settings, pinterest: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
                placeholder="https://pinterest.com/yourhandle"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white dark:bg-background-dark/50 rounded-2xl p-6 border border-primary/10 lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">search</span>
            SEO Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SEO Keywords</label>
              <textarea
                value={settings.seoKeywords}
                onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
                rows={2}
                placeholder="mehndi design, henna artist Greater Noida, bridal mehndi..."
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated keywords for search engines</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Analytics ID</label>
              <input
                type="text"
                value={settings.googleAnalytics || ''}
                onChange={(e) => setSettings({ ...settings, googleAnalytics: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#a15842] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">save</span>
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Suggested Keywords */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
        <h4 className="font-bold text-green-800 dark:text-green-300 mb-3">🎯 Suggested SEO Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {[
            'mehndi design Greater Noida',
            'henna artist Noida',
            'bridal mehndi Delhi NCR',
            'wedding mehndi artist',
            'AI mehndi generator',
            'Arabic mehndi design',
            'Indian bridal henna',
            'mehndi booking online',
            'festive mehndi Noida',
            'Karwa Chauth mehndi',
            'Diwali henna design',
            'mehndi artist near me',
          ].map((keyword) => (
            <button
              key={keyword}
              onClick={() => {
                if (!settings.seoKeywords.includes(keyword)) {
                  setSettings({
                    ...settings,
                    seoKeywords: settings.seoKeywords ? `${settings.seoKeywords}, ${keyword}` : keyword,
                  });
                }
              }}
              className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full hover:bg-green-200 transition-colors"
            >
              + {keyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
