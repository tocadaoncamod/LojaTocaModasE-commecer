import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  bucket?: string;
  folder?: string;
  className?: string;
  showPreview?: boolean;
}

interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  maxFiles = 5,
  maxSizePerFile = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  bucket = 'products',
  folder = '',
  className = '',
  showPreview = true
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizePerFile) {
      return `Arquivo muito grande. Máximo: ${maxSizePerFile}MB`;
    }

    return null;
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Erro ao obter URL pública');
    }

    return urlData.publicUrl;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (images.length + fileArray.length > maxFiles) {
      alert(`Máximo ${maxFiles} arquivos permitidos`);
      return;
    }

    // Validate and create preview for each file
    const newImages: UploadedImage[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      
      if (error) {
        alert(`Erro no arquivo ${file.name}: ${error}`);
        continue;
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        error: undefined
      });
    }

    if (newImages.length === 0) return;

    setImages(prev => [...prev, ...newImages]);

    // Start uploading
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < newImages.length; i++) {
      const imageIndex = images.length + i;
      
      try {
        // Update uploading status
        setImages(prev => prev.map((img, idx) => 
          idx === imageIndex ? { ...img, uploading: true } : img
        ));

        const url = await uploadToSupabase(newImages[i].file);
        
        // Update with success
        setImages(prev => prev.map((img, idx) => 
          idx === imageIndex ? { ...img, url, uploading: false } : img
        ));

        uploadedUrls.push(url);
      } catch (error) {
        // Update with error
        setImages(prev => prev.map((img, idx) => 
          idx === imageIndex ? { 
            ...img, 
            uploading: false, 
            error: error instanceof Error ? error.message : 'Erro no upload'
          } : img
        ));
      }
    }

    setIsUploading(false);
    
    if (uploadedUrls.length > 0) {
      onUpload(uploadedUrls);
    }
  }, [images, maxFiles, bucket, folder, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      // Revoke object URL to prevent memory leaks
      if (newImages[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const retryUpload = async (index: number) => {
    const image = images[index];
    if (!image || image.uploading) return;

    setImages(prev => prev.map((img, idx) => 
      idx === index ? { ...img, uploading: true, error: undefined } : img
    ));

    try {
      const url = await uploadToSupabase(image.file);
      
      setImages(prev => prev.map((img, idx) => 
        idx === index ? { ...img, url, uploading: false } : img
      ));

      onUpload([url]);
    } catch (error) {
      setImages(prev => prev.map((img, idx) => 
        idx === index ? { 
          ...img, 
          uploading: false, 
          error: error instanceof Error ? error.message : 'Erro no upload'
        } : img
      ));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="space-y-2">
          <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isDragging ? 'Solte as imagens aqui' : 'Clique ou arraste imagens'}
            </p>
            <p className="text-xs text-gray-500">
              Máximo {maxFiles} arquivos, {maxSizePerFile}MB cada
            </p>
            <p className="text-xs text-gray-500">
              Formatos: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Fazendo upload...</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Imagens ({images.length}/{maxFiles})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Upload Status Overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  {/* Success Indicator */}
                  {image.url && !image.uploading && !image.error && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
                    </div>
                  )}
                  
                  {/* Error Indicator */}
                  {image.error && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={image.uploading}
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Retry Button for Errors */}
                {image.error && (
                  <button
                    onClick={() => retryUpload(index)}
                    className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Tentar novamente
                  </button>
                )}

                {/* Primary Image Indicator */}
                {index === 0 && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error Messages */}
          {images.some(img => img.error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-red-800 mb-2">Erros de Upload:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {images.map((image, index) => 
                  image.error ? (
                    <li key={index}>
                      • {image.file.name}: {image.error}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          )}

          {/* Upload Summary */}
          <div className="text-xs text-gray-500 text-center">
            {images.filter(img => img.url).length} de {images.length} imagens enviadas com sucesso
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;