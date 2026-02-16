import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

interface Testimonial {
  id: string;
  client_name: string;
  company: string | null;
  position: string | null;
  content: string;
  rating: number;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
}

interface TestimonialsManagerProps {
  onUpdate: () => void;
}

export default function TestimonialsManager({ onUpdate }: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    company: '',
    position: '',
    content: '',
    rating: 5,
    image_url: '',
    is_featured: false,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('testimonials')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([formData]);
        if (error) throw error;
      }

      resetForm();
      await fetchTestimonials();
      onUpdate();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTestimonials();
      onUpdate();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const editTestimonial = (testimonial: Testimonial) => {
    setFormData({
      client_name: testimonial.client_name,
      company: testimonial.company || '',
      position: testimonial.position || '',
      content: testimonial.content,
      rating: testimonial.rating,
      image_url: testimonial.image_url || '',
      is_featured: testimonial.is_featured,
    });
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      company: '',
      position: '',
      content: '',
      rating: 5,
      image_url: '',
      is_featured: false,
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
          <h2 className="text-2xl font-bold text-[#003b67]">Testimonials</h2>
          <p className="text-gray-600">Manage customer reviews and testimonials</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-[#003b67] mb-4">
            {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Client Name *</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Client Image</label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="testimonials"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Testimonial Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 text-[#f57a18]"
              />
              <span className="text-sm font-medium text-[#003b67]">Featured testimonial</span>
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-[#003b67] hover:bg-[#002a4d] text-white px-6 py-2 rounded-lg font-medium transition"
            >
              {editingId ? 'Update' : 'Add'} Testimonial
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
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-[#003b67]">{testimonial.client_name}</h3>
                  {testimonial.is_featured && (
                    <span className="bg-[#f57a18] text-white text-xs px-3 py-1 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>
                {testimonial.company && (
                  <p className="text-gray-600 mb-1">
                    {testimonial.position ? `${testimonial.position}, ` : ''}{testimonial.company}
                  </p>
                )}
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#f57a18] fill-[#f57a18]" />
                  ))}
                </div>
                <p className="text-gray-700">{testimonial.content}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => editTestimonial(testimonial)}
                  className="p-2 text-[#003b67] hover:bg-white rounded-lg transition"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteTestimonial(testimonial.id)}
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
