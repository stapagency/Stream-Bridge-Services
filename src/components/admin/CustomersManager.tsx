import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

interface Customer {
  id: string;
  company_name: string;
  logo_url: string | null;
  description: string;
  category: string;
  is_active: boolean;
  order_position: number;
}

interface CustomersManagerProps {
  onUpdate: () => void;
}

const categories = ['Retail', 'Restaurants', 'Wholesale', 'Corporate'];

export default function CustomersManager({ onUpdate }: CustomersManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    description: '',
    category: 'Corporate',
    is_active: true,
    order_position: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('order_position');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('customers')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([formData]);
        if (error) throw error;
      }

      resetForm();
      await fetchCustomers();
      onUpdate();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCustomers();
      onUpdate();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const editCustomer = (customer: Customer) => {
    setFormData({
      company_name: customer.company_name,
      logo_url: customer.logo_url || '',
      description: customer.description,
      category: customer.category,
      is_active: customer.is_active,
      order_position: customer.order_position,
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      logo_url: '',
      description: '',
      category: 'Corporate',
      is_active: true,
      order_position: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 text-[#003b67] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#003b67]">Customers</h2>
          <p className="text-gray-600">Manage customer showcase and testimonials</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-[#003b67] mb-4">
            {editingId ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Customer Logo</label>
            <ImageUpload
              currentImageUrl={formData.logo_url}
              onImageUrlChange={(url) => setFormData({ ...formData, logo_url: url })}
              folder="customers"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={2}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              placeholder="One-line description of the customer"
            ></textarea>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Order Position</label>
              <input
                type="number"
                value={formData.order_position}
                onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-[#003b67]">Active</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-[#003b67] hover:bg-[#002a4d] text-white px-6 py-2 rounded-lg font-medium transition"
            >
              {editingId ? 'Update' : 'Add'} Customer
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {customer.logo_url ? (
                    <img
                      src={customer.logo_url}
                      alt={customer.company_name}
                      className="w-20 h-20 object-contain bg-white rounded-lg p-2"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-[#003b67]">{customer.company_name}</h3>
                    <span className="bg-[#003b67] text-white text-xs px-3 py-1 rounded-full">
                      {customer.category}
                    </span>
                    {!customer.is_active && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{customer.description}</p>
                  <p className="text-sm text-gray-500">Order: {customer.order_position}</p>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => editCustomer(customer)}
                  className="p-2 text-[#003b67] hover:bg-white rounded-lg transition"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteCustomer(customer.id)}
                  className="p-2 text-red-600 hover:bg-white rounded-lg transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
