import React, { useState, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (base64Image: string) => Promise<void>;
  onClose: () => void;
}

export function ImageUpload({ onImageSelect, onClose }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = async () => {
    try {
      if (!imageRef.current) return;

      setUploading(true);

      const canvas = document.createElement('canvas');
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      ctx.drawImage(
        imageRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      const base64Image = canvas.toDataURL('image/jpeg');
      await onImageSelect(base64Image);
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload Profile Picture</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!image ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-12 w-12 text-blue-600" />
                <span className="text-blue-600 hover:text-blue-800">
                  Click to upload an image
                </span>
                <p className="mt-2 text-sm text-gray-500">
                  JPG, PNG files are allowed
                </p>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imageRef}
                src={image}
                alt="Upload preview"
                className="max-h-[400px] mx-auto"
              />
            </ReactCrop>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImage(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={getCroppedImg}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Crop & Save'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}