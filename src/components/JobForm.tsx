'use client';

import { useState, useEffect } from 'react';
import { Job, Resume } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JobFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  job?: Job | null;
  resumes: Resume[];
}

export function JobForm({ open, onClose, onSubmit, job, resumes }: JobFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    position: '',
    jobDescription: '',
    jobApplicationLink: '',
    baseResumeId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        clientName: job.clientName,
        companyName: job.companyName,
        position: job.position,
        jobDescription: job.jobDescription,
        jobApplicationLink: job.jobApplicationLink || '',
        baseResumeId: job.baseResume?._id || '',
      });
    } else {
      setFormData({
        clientName: '',
        companyName: '',
        position: '',
        jobDescription: '',
        jobApplicationLink: '',
        baseResumeId: '',
      });
    }
  }, [job, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar bg-gray-900 border-gray-800">
        <DialogHeader className="border-b border-gray-800/50 pb-4">
          <DialogTitle className="text-white text-2xl">{job ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          <DialogDescription className="text-gray-400 text-base">
            {job ? 'Update the job details below.' : 'Fill in the details to create a new job card.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-gray-300 font-medium">
                Client Name *
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
                placeholder="John Doe"
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-700 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-gray-300 font-medium">
                Company Name *
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                placeholder="Amazon"
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-700 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position" className="text-gray-300 font-medium">
              Position *
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
              placeholder="Senior Software Engineer"
              className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-700 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription" className="text-gray-300 font-medium">
              Job Description *
            </Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              required
              placeholder="Enter the full job description here..."
              rows={6}
              className="resize-none bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-700 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobApplicationLink" className="text-gray-300 font-medium">
              Application Link
            </Label>
            <Input
              id="jobApplicationLink"
              type="url"
              value={formData.jobApplicationLink}
              onChange={(e) => setFormData({ ...formData, jobApplicationLink: e.target.value })}
              placeholder="https://company.com/careers/job-id"
              className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-700 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseResumeId" className="text-gray-300 font-medium">
              Base Resume
            </Label>
            <Select
              value={formData.baseResumeId}
              onValueChange={(value) => setFormData({ ...formData, baseResumeId: value })}
            >
              <SelectTrigger className="bg-gray-950 border-gray-800 text-white focus:border-gray-700 focus:ring-blue-500">
                <SelectValue placeholder="Select a base resume" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                {resumes.map((resume) => (
                  <SelectItem 
                    key={resume._id} 
                    value={resume._id}
                    className="text-gray-200 focus:bg-gray-800 focus:text-white"
                  >
                    Resume {resume._id.slice(-6)} - {resume.baseResumeText.substring(0, 50)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Optional: Select a base resume to optimize for this job
            </p>
          </div>

          <DialogFooter className="border-t border-gray-800/50 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}