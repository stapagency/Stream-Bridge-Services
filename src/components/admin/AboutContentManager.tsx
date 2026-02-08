import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

interface AboutContent {
  id: string;
  section: string;
  title: string;
  content: string;
  image_url: string | null;
  order_position: number;
  is_active: boolean;
}

export default function AboutContentManager() {
  const [contents, setContents] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    section: '',
    title: '',
    content: '',
    image_url: '',
    order_position: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('order_position');

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('about_content')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('about_content')
          .insert([formData]);
        if (error) throw error;
      }

      resetForm();
      await fetchContents();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase
        .from('about_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const editContent = (content: AboutContent) => {
    setFormData({
      section: content.section,
      title: content.title,
      content: content.content,
      image_url: content.image_url || '',
      order_position: content.order_position,
      is_active: content.is_active,
    });
    setEditingId(content.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      section: '',
      title: '',
      content: '',
      image_url: '',
      order_position: 0,
      is_active: true,
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
          <h2 className="text-2xl font-bold text-[#003b67]">About Page Content</h2>
          <p className="text-gray-600">Manage sections and content for the About page</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Section</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-[#003b67] mb-4">
            {editingId ? 'Edit Section' : 'Add New Section'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Section Name *</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                placeholder="mission, history, values, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#003b67] mb-2">Order Position</label>
              <input
                type="number"
                value={formData.order_position}
                onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Section Image (Optional)</label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="about"
            />
          </div>
          <div className="mb-4">
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
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-[#003b67] hover:bg-[#002a4d] text-white px-6 py-2 rounded-lg font-medium transition"
            >
              {editingId ? 'Update' : 'Add'} Section
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
        {contents.map((content) => (
          <div key={content.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-[#003b67] text-white text-xs px-3 py-1 rounded-full font-medium">
                    {content.section}
                  </span>
                  <span className="text-sm text-gray-500">Position: {content.order_position}</span>
                  {!content.is_active && (
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#003b67] mb-2">{content.title}</h3>
                <p className="text-gray-700 mb-3">{content.content}</p>
                {content.image_url && (
                  <div className="mt-3">
                    <img
                      src={content.image_url}
                      alt={content.title}
                      className="w-48 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => editContent(content)}
                  className="p-2 text-[#003b67] hover:bg-white rounded-lg transition"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteContent(content.id)}
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
