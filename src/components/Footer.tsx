import { Droplets, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-gray-800 py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-14 w-auto object-contain" />
              ) : (
                <Droplets className="h-10 w-10 text-[#f57a18]" />
              )}
              <span className="font-bold text-lg text-[#003b67]">{settings?.company_name || 'Stream Bridge Services'}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Professional cleaning solutions and industrial equipment for businesses across Canada and beyond.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <button
                  onClick={() => handleNavigate('about')}
                  className="hover:text-[#f57a18] transition"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('services')}
                  className="hover:text-[#f57a18] transition"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('products')}
                  className="hover:text-[#f57a18] transition"
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('contact')}
                  className="hover:text-[#f57a18] transition"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>Commercial Cleaning</li>
              <li>Floor Waxing</li>
              <li>Duct Cleaning</li>
              <li>Equipment Supply</li>
              <li>Import/Export</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>{settings?.phone || '+1 (555) 123-4567'}</li>
              <li>{settings?.email || 'info@streambridgeservices.com'}</li>
              <li>{settings?.address_line1 || '1234 Industrial Parkway'}</li>
              <li>{settings?.address_line2 || 'Toronto, ON M1M 1M1'}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} {settings?.company_name || 'Stream Bridge Services Inc.'}. All rights reserved.</p>
          <button
            onClick={() => handleNavigate('admin-login')}
            className="mt-4 inline-flex items-center space-x-1 text-gray-400 hover:text-[#f57a18] transition text-xs"
          >
            <Lock className="h-3 w-3" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
