import { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

interface SiteSettings {
  id: string;
  company_name: string;
  logo_url: string | null;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string | null;
  social_links: Record<string, string>;
  theme_colors: Record<string, string>;
}

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          company_name: settings.company_name,
          logo_url: settings.logo_url,
          phone: settings.phone,
          email: settings.email,
          address_line1: settings.address_line1,
          address_line2: settings.address_line2,
          social_links: settings.social_links,
          theme_colors: settings.theme_colors,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 text-[#003b67] animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#003b67]">Site Settings</h2>
        <p className="text-gray-600">Manage company information, contact details, and branding</p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg ${
          message.includes('Error')
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-[#003b67] mb-4">Company Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Company Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Logo</label>
              <ImageUpload
                currentImageUrl={settings.logo_url || ''}
                onImageUrlChange={(url) => setSettings({ ...settings, logo_url: url })}
                folder="branding"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-[#003b67] mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Address Line 1</label>
              <input
                type="text"
                value={settings.address_line1}
                onChange={(e) => setSettings({ ...settings, address_line1: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Address Line 2</label>
              <input
                type="text"
                value={settings.address_line2 || ''}
                onChange={(e) => setSettings({ ...settings, address_line2: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-[#003b67] mb-4">Social Media Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Facebook</label>
              <input
                type="url"
                value={settings.social_links.facebook || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, facebook: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Twitter</label>
              <input
                type="url"
                value={settings.social_links.twitter || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, twitter: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">LinkedIn</label>
              <input
                type="url"
                value={settings.social_links.linkedin || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, linkedin: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Instagram</label>
              <input
                type="url"
                value={settings.social_links.instagram || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, instagram: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#003b67] hover:bg-[#002a4d] text-white px-6 py-3 rounded-lg font-bold transition flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
