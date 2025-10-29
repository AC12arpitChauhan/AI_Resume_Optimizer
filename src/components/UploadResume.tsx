'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { resumesAPI } from '@/lib/api';
import { toast } from 'sonner';

interface UploadResumeProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadResume({ open, onClose, onSuccess }: UploadResumeProps) {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMethod === 'file' && !file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (uploadMethod === 'text' && !resumeText.trim()) {
      toast.error('Please enter resume text');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      if (uploadMethod === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('baseResumeText', resumeText);
      }

      await resumesAPI.upload(formData);
      toast.success('Resume uploaded successfully');
      onSuccess();
      onClose();
      
      // Reset form
      setFile(null);
      setResumeText('');
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader className="border-b border-gray-800/50 pb-4">
          <DialogTitle className="text-white text-2xl">Upload Resume</DialogTitle>
          <DialogDescription className="text-gray-400 text-base">
            Upload a resume file or paste the resume text directly
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('file')}
              className={`flex-1 ${
                uploadMethod === 'file'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadMethod === 'text' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('text')}
              className={`flex-1 ${
                uploadMethod === 'text'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Paste Text
            </Button>
          </div>

          {uploadMethod === 'file' ? (
            <div className="space-y-2">
              <Label htmlFor="file" className="text-gray-300 font-medium">
                Resume File
              </Label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors bg-gray-950/50">
                <input
                  id="file"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  {file ? (
                    <div>
                      <p className="font-medium text-white mb-1">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-white mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400">
                        Supported formats: .txt, .pdf, .doc, .docx (Max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="resumeText" className="text-gray-300 font-medium">
                Resume Text
              </Label>
              <Textarea
                id="resumeText"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={12}
                className="resize-none font-mono text-sm bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-700 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Paste the complete resume text including name, contact, experience, education, etc.
              </p>
            </div>
          )}

          <DialogFooter className="border-t border-gray-800/50 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isUploading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Resume'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}