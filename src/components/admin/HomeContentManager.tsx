import { useState, useEffect } from 'react';
import { Edit, Save, X, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HomeContent {
  id: string;
  section: string;
  title: string;
  description: string | null;
  content: Record<string, any>;
  order_position: number;
  is_active: boolean;
}

export default function HomeContentManager() {
  const [contents, setContents] = useState<HomeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<HomeContent>>({});

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .order('order_position');

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching home content:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (content: HomeContent) => {
    setEditingId(content.id);
    setEditForm(content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('home_content')
        .update({
          title: editForm.title,
          description: editForm.description,
          content: editForm.content,
          is_active: editForm.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) throw error;
      await fetchContents();
      cancelEdit();
    } catch (error) {
      console.error('Error updating content:', error);
    }
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#003b67]">Home Page Content</h2>
        <p className="text-gray-600">Edit hero section, stats, and other home page content</p>
      </div>

      <div className="space-y-6">
        {contents.map((content) => {
          const isEditing = editingId === content.id;

          return (
            <div key={content.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-[#003b67] text-white text-xs px-3 py-1 rounded-full font-medium">
                      {content.section}
                    </span>
                    {!isEditing && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={content.is_active}
                          onChange={async (e) => {
                            await supabase
                              .from('home_content')
                              .update({ is_active: e.target.checked })
                              .eq('id', content.id);
                            fetchContents();
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600">Active</span>
                      </label>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[#003b67] mb-2">Title</label>
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#003b67] mb-2">Description</label>
                        <textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#003b67] mb-2">Content (JSON)</label>
                        <textarea
                          value={JSON.stringify(editForm.content, null, 2)}
                          onChange={(e) => {
                            try {
                              setEditForm({ ...editForm, content: JSON.parse(e.target.value) });
                            } catch (err) {
                              console.error('Invalid JSON');
                            }
                          }}
                          rows={5}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18] font-mono text-sm"
                        ></textarea>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editForm.is_active}
                          onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium text-[#003b67]">Active</span>
                      </label>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-[#003b67] mb-2">{content.title}</h3>
                      {content.description && (
                        <p className="text-gray-700 mb-3">{content.description}</p>
                      )}
                      <div className="bg-white rounded p-3">
                        <p className="text-xs text-gray-500 mb-1">Content Data:</p>
                        <pre className="text-sm text-gray-700 overflow-x-auto">
                          {JSON.stringify(content.content, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-2 text-green-600 hover:bg-white rounded-lg transition"
                        title="Save"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-red-600 hover:bg-white rounded-lg transition"
                        title="Cancel"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(content)}
                      className="p-2 text-[#003b67] hover:bg-white rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
