import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string | null;
  image_url: string | null;
  order_position: number;
  is_active: boolean;
}

interface ServicesManagerProps {
  onUpdate: () => void;
}

export default function ServicesManager({ onUpdate }: ServicesManagerProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    features: [''],
    icon: '',
    image_url: '',
    order_position: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services_content')
        .select('*')
        .order('order_position');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
      };

      if (editingId) {
        const { error } = await supabase
          .from('services_content')
          .update({ ...dataToSave, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services_content')
          .insert([dataToSave]);
        if (error) throw error;
      }

      resetForm();
      await fetchServices();
      onUpdate();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchServices();
      onUpdate();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const editService = (service: Service) => {
    setFormData({
      title: service.title,
      description: service.description,
      features: service.features.length > 0 ? service.features : [''],
      icon: service.icon || '',
      image_url: service.image_url || '',
      order_position: service.order_position,
      is_active: service.is_active,
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      features: [''],
      icon: '',
      image_url: '',
      order_position: 0,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
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
          <h2 className="text-2xl font-bold text-[#003b67]">Services</h2>
          <p className="text-gray-600">Manage service offerings and descriptions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Service</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-[#003b67] mb-4">
            {editingId ? 'Edit Service' : 'Add New Service'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Icon (Lucide name)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                placeholder="Sparkles"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Service Image</label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="services"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="text-[#f57a18] hover:text-[#d86a15] font-medium"
            >
              + Add Feature
            </button>
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
              {editingId ? 'Update' : 'Add'} Service
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
        {services.map((service) => (
          <div key={service.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-[#003b67]">{service.title}</h3>
                  {!service.is_active && (
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-3">{service.description}</p>
                {service.features.length > 0 && (
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => editService(service)}
                  className="p-2 text-[#003b67] hover:bg-white rounded-lg transition"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteService(service.id)}
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
