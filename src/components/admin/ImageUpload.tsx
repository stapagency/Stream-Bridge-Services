import { useState, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUrlChange: (url: string) => void;
  bucket?: string;
  folder?: string;
}

export default function ImageUpload({
  currentImageUrl = '',
  onImageUrlChange,
  bucket = 'images',
  folder = 'uploads',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onImageUrlChange(publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onImageUrlChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlInput = (url: string) => {
    setPreviewUrl(url);
    onImageUrlChange(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`flex items-center space-x-2 px-4 py-2 bg-[#003b67] hover:bg-[#002a4d] text-white rounded-lg cursor-pointer transition ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </>
          )}
        </label>
        <span className="text-sm text-gray-500">or</span>
        <div className="flex-1">
          <input
            type="url"
            value={previewUrl}
            onChange={(e) => handleUrlInput(e.target.value)}
            placeholder="Paste image URL"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f57a18]"
          />
        </div>
      </div>

      {previewUrl && (
        <div className="relative inline-block">
          <div className="relative w-48 h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                setPreviewUrl('');
              }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 max-w-[192px] truncate">{previewUrl}</p>
        </div>
      )}

      {!previewUrl && (
        <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
          <ImageIcon className="h-12 w-12 mb-2" />
          <p className="text-sm">No image</p>
        </div>
      )}

      <p className="text-xs text-gray-500">Max file size: 5MB. Supported: JPG, PNG, GIF, WebP</p>
    </div>
  );
}
