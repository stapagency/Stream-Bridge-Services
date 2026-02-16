import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Loader, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser {
  id: string;
  email: string;
  approved_by: string | null;
  approved_at: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersManager() {
  const { user } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      showMessage('error', 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setAdding(true);

      const emailLower = newEmail.toLowerCase().trim();

      const { data: existing } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle();

      if (existing) {
        showMessage('error', 'This email is already an approved admin');
        return;
      }

      const { error } = await supabase
        .from('admin_users')
        .insert({
          email: emailLower,
          approved_by: user?.id,
          is_active: true
        });

      if (error) throw error;

      showMessage('success', `Admin user ${emailLower} added successfully`);
      setNewEmail('');
      await fetchAdminUsers();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      showMessage('error', error.message || 'Failed to add admin user');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (adminUser: AdminUser) => {
    if (adminUser.email === user?.email) {
      showMessage('error', 'You cannot deactivate yourself');
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !adminUser.is_active })
        .eq('id', adminUser.id);

      if (error) throw error;

      showMessage('success', `Admin user ${adminUser.is_active ? 'deactivated' : 'activated'}`);
      await fetchAdminUsers();
    } catch (error) {
      console.error('Error updating admin:', error);
      showMessage('error', 'Failed to update admin user');
    }
  };

  const handleDelete = async (adminUser: AdminUser) => {
    if (adminUser.email === user?.email) {
      showMessage('error', 'You cannot delete yourself');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${adminUser.email} as an admin?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminUser.id);

      if (error) throw error;

      showMessage('success', 'Admin user removed successfully');
      await fetchAdminUsers();
    } catch (error) {
      console.error('Error deleting admin:', error);
      showMessage('error', 'Failed to remove admin user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 text-[#003b67] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003b67] mb-2">Admin Users Management</h2>
        <p className="text-gray-600">Control who has access to the admin portal</p>
      </div>

      {message && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Only approved admin users can access the admin portal</li>
          <li>• Users must first create an account, then be added here by an existing admin</li>
          <li>• Deactivated admins can log in but won't have access to admin features</li>
          <li>• You cannot deactivate or remove yourself</li>
        </ul>
      </div>

      <form onSubmit={handleAddAdmin} className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#003b67] mb-4 flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Add New Admin User</span>
        </h3>

        <div className="flex space-x-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="admin@example.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f57a18] focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={adding || !newEmail.trim()}
            className="flex items-center space-x-2 bg-[#003b67] hover:bg-[#005a9c] text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Add Admin</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-[#003b67] flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Current Admin Users ({adminUsers.length})</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {adminUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No admin users found
            </div>
          ) : (
            adminUsers.map((adminUser) => (
              <div key={adminUser.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{adminUser.email}</span>
                        {adminUser.email === user?.email && (
                          <span className="text-xs bg-[#f57a18] text-white px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        adminUser.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {adminUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Added: {new Date(adminUser.approved_at).toLocaleDateString()}
                    </div>
                  </div>

                  {adminUser.email !== user?.email && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(adminUser)}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                          adminUser.is_active
                            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                        }`}
                      >
                        {adminUser.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(adminUser)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Remove admin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
