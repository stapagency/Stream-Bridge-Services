import { useState, useEffect } from 'react';
import { Loader, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactSection {
  id: string;
  section: string;
  title: string;
  subtitle: string;
  phone_primary: string;
  phone_secondary: string;
  phone_hours: string;
  email_primary: string;
  email_secondary: string;
  email_response_time: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  business_hours_line1: string;
  business_hours_line2: string;
  business_hours_line3: string;
  emergency_note: string;
  cta_phone: string;
  cta_email: string;
}

export default function ContactContentManager() {
  const [sections, setSections] = useState<Record<string, ContactSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_content')
        .select('*')
        .order('section');

      if (error) throw error;

      const sectionsMap: Record<string, ContactSection> = {};
      data?.forEach((section) => {
        sectionsMap[section.section] = section;
      });
      setSections(sectionsMap);
    } catch (error: any) {
      console.error('Error fetching contact content:', error);
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (section: string) => {
    setSaving(section);
    setStatus(null);

    try {
      const { error } = await supabase
        .from('contact_content')
        .update({
          ...sections[section],
          updated_at: new Date().toISOString(),
        })
        .eq('section', section);

      if (error) throw error;

      setStatus({ type: 'success', message: `${section} section updated successfully` });
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (section: string, field: keyof ContactSection, value: string) => {
    setSections({
      ...sections,
      [section]: {
        ...sections[section],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 text-[#003b67] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#003b67]">Contact Page Content</h2>
      </div>

      {status && (
        <div
          className={`p-4 rounded-lg flex items-start space-x-3 ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
          )}
          <p>{status.message}</p>
        </div>
      )}

      {/* Hero Section */}
      {sections.hero && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold text-[#003b67] mb-4">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={sections.hero.title}
                onChange={(e) => handleChange('hero', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                value={sections.hero.subtitle}
                onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <button
              onClick={() => handleUpdate('hero')}
              disabled={saving === 'hero'}
              className="flex items-center space-x-2 bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving === 'hero' ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Contact Info Section */}
      {sections.contact_info && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold text-[#003b67] mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={sections.contact_info.title}
                onChange={(e) => handleChange('contact_info', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={sections.contact_info.subtitle}
                onChange={(e) => handleChange('contact_info', 'subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Phone</label>
                <input
                  type="text"
                  value={sections.contact_info.phone_primary}
                  onChange={(e) => handleChange('contact_info', 'phone_primary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Phone</label>
                <input
                  type="text"
                  value={sections.contact_info.phone_secondary}
                  onChange={(e) => handleChange('contact_info', 'phone_secondary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Hours</label>
              <input
                type="text"
                value={sections.contact_info.phone_hours}
                onChange={(e) => handleChange('contact_info', 'phone_hours', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Email</label>
                <input
                  type="email"
                  value={sections.contact_info.email_primary}
                  onChange={(e) => handleChange('contact_info', 'email_primary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Email</label>
                <input
                  type="email"
                  value={sections.contact_info.email_secondary}
                  onChange={(e) => handleChange('contact_info', 'email_secondary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Response Time</label>
              <input
                type="text"
                value={sections.contact_info.email_response_time}
                onChange={(e) => handleChange('contact_info', 'email_response_time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
              <input
                type="text"
                value={sections.contact_info.address_line1}
                onChange={(e) => handleChange('contact_info', 'address_line1', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={sections.contact_info.address_line2}
                onChange={(e) => handleChange('contact_info', 'address_line2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 3</label>
              <input
                type="text"
                value={sections.contact_info.address_line3}
                onChange={(e) => handleChange('contact_info', 'address_line3', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours Line 1</label>
              <input
                type="text"
                value={sections.contact_info.business_hours_line1}
                onChange={(e) => handleChange('contact_info', 'business_hours_line1', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours Line 2</label>
              <input
                type="text"
                value={sections.contact_info.business_hours_line2}
                onChange={(e) => handleChange('contact_info', 'business_hours_line2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours Line 3</label>
              <input
                type="text"
                value={sections.contact_info.business_hours_line3}
                onChange={(e) => handleChange('contact_info', 'business_hours_line3', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Note</label>
              <input
                type="text"
                value={sections.contact_info.emergency_note}
                onChange={(e) => handleChange('contact_info', 'emergency_note', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>

            <button
              onClick={() => handleUpdate('contact_info')}
              disabled={saving === 'contact_info'}
              className="flex items-center space-x-2 bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving === 'contact_info' ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Section */}
      {sections.form && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold text-[#003b67] mb-4">Contact Form Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={sections.form.title}
                onChange={(e) => handleChange('form', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                value={sections.form.subtitle}
                onChange={(e) => handleChange('form', 'subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <button
              onClick={() => handleUpdate('form')}
              disabled={saving === 'form'}
              className="flex items-center space-x-2 bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving === 'form' ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {sections.cta && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold text-[#003b67] mb-4">Call to Action Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={sections.cta.title}
                onChange={(e) => handleChange('cta', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={sections.cta.subtitle}
                onChange={(e) => handleChange('cta', 'subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={sections.cta.cta_phone}
                  onChange={(e) => handleChange('cta', 'cta_phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={sections.cta.cta_email}
                  onChange={(e) => handleChange('cta', 'cta_email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
                />
              </div>
            </div>
            <button
              onClick={() => handleUpdate('cta')}
              disabled={saving === 'cta'}
              className="flex items-center space-x-2 bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving === 'cta' ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Location Section */}
      {sections.location && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold text-[#003b67] mb-4">Location Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={sections.location.title}
                onChange={(e) => handleChange('location', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                value={sections.location.subtitle}
                onChange={(e) => handleChange('location', 'subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
              <input
                type="text"
                value={sections.location.address_line1}
                onChange={(e) => handleChange('location', 'address_line1', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={sections.location.address_line2}
                onChange={(e) => handleChange('location', 'address_line2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 3</label>
              <input
                type="text"
                value={sections.location.address_line3}
                onChange={(e) => handleChange('location', 'address_line3', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57a18]"
              />
            </div>
            <button
              onClick={() => handleUpdate('location')}
              disabled={saving === 'location'}
              className="flex items-center space-x-2 bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving === 'location' ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
