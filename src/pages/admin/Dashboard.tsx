import { useState, useEffect } from 'react';
import { LogOut, Mail, MessageSquare, Star, FileText, Package, Loader, Settings, Info, Video, Users, Phone, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ContactRequestsManager from '../../components/admin/ContactRequestsManager';
import TestimonialsManager from '../../components/admin/TestimonialsManager';
import HomeContentManager from '../../components/admin/HomeContentManager';
import ServicesManager from '../../components/admin/ServicesManager';
import ProductsManager from '../../components/admin/ProductsManager';
import SiteSettingsManager from '../../components/admin/SiteSettingsManager';
import AboutContentManager from '../../components/admin/AboutContentManager';
import VideoManager from '../../components/admin/VideoManager';
import AdminUsersManager from '../../components/admin/AdminUsersManager';
import ContactContentManager from '../../components/admin/ContactContentManager';
import CustomersManager from '../../components/admin/CustomersManager';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  const [stats, setStats] = useState({
    pendingContacts: 0,
    totalTestimonials: 0,
    activeServices: 0,
    activeProducts: 0,
    activeCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [contacts, testimonials, services, products, customers] = await Promise.all([
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('services_content').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products_content').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      setStats({
        pendingContacts: contacts.count || 0,
        totalTestimonials: testimonials.count || 0,
        activeServices: services.count || 0,
        activeProducts: products.count || 0,
        activeCustomers: customers.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onLogout();
  };

  const tabs = [
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'admin-users', label: 'Admin Users', icon: Users },
    { id: 'contacts', label: 'Contact Requests', icon: Mail, count: stats.pendingContacts },
    { id: 'testimonials', label: 'Testimonials', icon: Star, count: stats.totalTestimonials },
    { id: 'home', label: 'Home Content', icon: FileText },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'contact-page', label: 'Contact Page', icon: Phone },
    { id: 'services', label: 'Services', icon: MessageSquare, count: stats.activeServices },
    { id: 'products', label: 'Products', icon: Package, count: stats.activeProducts },
    { id: 'customers', label: 'Customers', icon: Building2, count: stats.activeCustomers },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#003b67] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-xs text-gray-300">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-[#f57a18] hover:bg-[#d86a15] px-4 py-2 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                      activeTab === tab.id
                        ? 'border-[#f57a18] text-[#f57a18]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="bg-[#f57a18] text-white text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="h-8 w-8 text-[#003b67] animate-spin" />
              </div>
            ) : (
              <>
                {activeTab === 'settings' && <SiteSettingsManager />}
                {activeTab === 'admin-users' && <AdminUsersManager />}
                {activeTab === 'contacts' && <ContactRequestsManager onUpdate={fetchStats} />}
                {activeTab === 'testimonials' && <TestimonialsManager onUpdate={fetchStats} />}
                {activeTab === 'home' && <HomeContentManager />}
                {activeTab === 'videos' && <VideoManager />}
                {activeTab === 'about' && <AboutContentManager />}
                {activeTab === 'contact-page' && <ContactContentManager />}
                {activeTab === 'services' && <ServicesManager onUpdate={fetchStats} />}
                {activeTab === 'products' && <ProductsManager onUpdate={fetchStats} />}
                {activeTab === 'customers' && <CustomersManager onUpdate={fetchStats} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
