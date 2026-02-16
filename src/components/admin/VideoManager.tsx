import { useState, useEffect } from 'react';
import { Video, Upload, Trash2, Loader, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VideoData {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: string;
  position: number;
  is_active: boolean;
}

export default function VideoManager() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<VideoData>>({});

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      alert('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (position: number, file: File) => {
    try {
      setUploading(position);

      const fileExt = file.name.split('.').pop();
      const fileName = `video-${position}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const video = videos.find(v => v.position === position);
      if (video) {
        const { error: updateError } = await supabase
          .from('videos')
          .update({
            video_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);

        if (updateError) throw updateError;
      }

      await fetchVideos();
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleThumbnailUpload = async (position: number, file: File) => {
    try {
      setUploading(position);

      const fileExt = file.name.split('.').pop();
      const fileName = `thumbnail-${position}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const video = videos.find(v => v.position === position);
      if (video) {
        const { error: updateError } = await supabase
          .from('videos')
          .update({
            thumbnail_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);

        if (updateError) throw updateError;
      }

      await fetchVideos();
      alert('Thumbnail uploaded successfully!');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Failed to upload thumbnail. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleEdit = (video: VideoData) => {
    setEditingId(video.id);
    setFormData(video);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;

      await fetchVideos();
      setEditingId(null);
      setFormData({});
      alert('Video updated successfully!');
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video');
    }
  };

  const handleDelete = async (video: VideoData) => {
    if (!confirm(`Are you sure you want to delete the video "${video.title}"?`)) return;

    try {
      if (video.video_url) {
        const videoPath = video.video_url.split('/').pop();
        if (videoPath) {
          await supabase.storage.from('videos').remove([videoPath]);
        }
      }

      if (video.thumbnail_url) {
        const thumbnailPath = video.thumbnail_url.split('/').pop();
        if (thumbnailPath) {
          await supabase.storage.from('videos').remove([thumbnailPath]);
        }
      }

      const { error } = await supabase
        .from('videos')
        .update({
          video_url: null,
          thumbnail_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id);

      if (error) throw error;

      await fetchVideos();
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
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
        <h2 className="text-2xl font-bold text-[#003b67] mb-2">Video Management</h2>
        <p className="text-gray-600">Upload and manage the two videos displayed on the home page</p>
      </div>

      <div className="grid gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-[#003b67] p-3 rounded-lg">
                  <Video className="h-6 w-6 text-[#f57a18]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#003b67]">Video {video.position}</h3>
                  <p className="text-sm text-gray-500">Position: {video.position === 1 ? 'Left' : 'Right'}</p>
                </div>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-sm text-gray-600">Active</span>
                <input
                  type="checkbox"
                  checked={video.is_active}
                  onChange={async (e) => {
                    try {
                      await supabase
                        .from('videos')
                        .update({ is_active: e.target.checked })
                        .eq('id', video.id);
                      fetchVideos();
                    } catch (error) {
                      console.error('Error updating status:', error);
                    }
                  }}
                  className="w-5 h-5 text-[#f57a18] rounded focus:ring-[#f57a18]"
                />
              </label>
            </div>

            {editingId === video.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f57a18] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f57a18] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (e.g., 3:45)</label>
                  <input
                    type="text"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f57a18] focus:border-transparent"
                    placeholder="3:45"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-[#003b67] hover:bg-[#005a9c] text-white px-4 py-2 rounded-lg transition"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setFormData({});
                    }}
                    className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#003b67] mb-1">{video.title}</h4>
                  <p className="text-gray-600 text-sm">{video.description}</p>
                  <p className="text-gray-500 text-xs mt-1">Duration: {video.duration}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                    {video.video_url ? (
                      <div className="space-y-2">
                        <video
                          src={video.video_url}
                          controls
                          className="w-full rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => handleDelete(video)}
                          className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Video</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload video</p>
                          <p className="text-xs text-gray-400">MP4, WebM (max 100MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="video/mp4,video/webm"
                          disabled={uploading === video.position}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(video.position, file);
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
                    {video.thumbnail_url ? (
                      <div className="space-y-2">
                        <img
                          src={video.thumbnail_url}
                          alt="Thumbnail"
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <label className="w-full flex items-center justify-center space-x-2 bg-[#003b67] hover:bg-[#005a9c] text-white px-3 py-2 rounded-lg transition text-sm cursor-pointer">
                          <Upload className="h-4 w-4" />
                          <span>Replace Thumbnail</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            disabled={uploading === video.position}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleThumbnailUpload(video.position, file);
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                          <p className="text-xs text-gray-400">JPG, PNG (recommended)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={uploading === video.position}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbnailUpload(video.position, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(video)}
                  className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-4 py-2 rounded-lg transition text-sm"
                >
                  Edit Details
                </button>
              </div>
            )}

            {uploading === video.position && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-[#003b67]">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for Best Results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Video files should be in MP4 or WebM format</li>
          <li>• Keep videos under 100MB for faster loading</li>
          <li>• Recommended resolution: 1920x1080 (Full HD)</li>
          <li>• Thumbnails should be clear and representative of the video content</li>
          <li>• Videos will display in a 16:9 aspect ratio on the home page</li>
        </ul>
      </div>
    </div>
  );
}
