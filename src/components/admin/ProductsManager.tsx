import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  image_url: string | null;
  is_featured: boolean;
  order_position: number;
  is_active: boolean;
}

interface ProductsManagerProps {
  onUpdate: () => void;
}

export default function ProductsManager({ onUpdate }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    features: [''],
    image_url: '',
    is_featured: false,
    order_position: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products_content')
        .select('*')
        .order('order_position');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
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
          .from('products_content')
          .update({ ...dataToSave, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products_content')
          .insert([dataToSave]);
        if (error) throw error;
      }

      resetForm();
      await fetchProducts();
      onUpdate();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
      onUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const editProduct = (product: Product) => {
    setFormData({
      title: product.title,
      category: product.category,
      description: product.description,
      features: product.features.length > 0 ? product.features : [''],
      image_url: product.image_url || '',
      is_featured: product.is_featured,
      order_position: product.order_position,
      is_active: product.is_active,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      features: [''],
      image_url: '',
      is_featured: false,
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
          <h2 className="text-2xl font-bold text-[#003b67]">Products</h2>
          <p className="text-gray-600">Manage product catalog and equipment listings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-[#003b67] mb-4">
            {editingId ? 'Edit Product' : 'Add New Product'}
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
              <label className="block text-sm font-bold text-[#003b67] mb-2">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                placeholder="Floor Machines, Cleaning Supplies, etc."
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-[#003b67] mb-2">Product Image</label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="products"
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
          <div className="grid md:grid-cols-3 gap-4 mb-4">
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
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-[#003b67]">Featured</span>
              </label>
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
              {editingId ? 'Update' : 'Add'} Product
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
        {products.map((product) => (
          <div key={product.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-[#003b67]">{product.title}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.is_featured && (
                    <span className="bg-[#f57a18] text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-white" />
                      <span>Featured</span>
                    </span>
                  )}
                  {!product.is_active && (
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-3">{product.description}</p>
                {product.features.length > 0 && (
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    {product.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => editProduct(product)}
                  className="p-2 text-[#003b67] hover:bg-white rounded-lg transition"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
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
