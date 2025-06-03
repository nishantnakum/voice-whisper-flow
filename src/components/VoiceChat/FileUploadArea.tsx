
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image, FileText, Loader2 } from 'lucide-react';
import { MessageAttachment } from '@/types/ai';

interface FileUploadAreaProps {
  onFileUpload: (files: File[]) => void;
  pendingAttachments: MessageAttachment[];
  onRemoveAttachment: (id: string) => void;
  isProcessing: boolean;
}

export const FileUploadArea = ({ 
  onFileUpload, 
  pendingAttachments, 
  onRemoveAttachment,
  isProcessing 
}: FileUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop files here, or{' '}
                <button 
                  onClick={handleFileSelect}
                  className="text-blue-600 hover:text-blue-700 underline"
                  disabled={isProcessing}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports images, documents, and text files
              </p>
            </div>
            
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing files...</span>
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {pendingAttachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Pending attachments:</p>
            <div className="space-y-2">
              {pendingAttachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {attachment.type === 'image' ? (
                      <Image className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    {attachment.metadata?.analysis && (
                      <p className="text-xs text-gray-500 truncate">
                        {attachment.metadata.analysis.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => onRemoveAttachment(attachment.id)}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
