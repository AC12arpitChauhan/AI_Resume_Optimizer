'use client';

import { useState } from 'react';
import { JobCard } from '@/components/JobCard';
import { JobForm } from '@/components/JobForm';
import { CompareModal } from '@/components/CompareModal';
import { UploadResume } from '@/components/UploadResume';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Upload,
  Loader2,
  Trash2,
  Zap
} from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useResumes } from '@/hooks/useResumes';
import { jobsAPI, optimizeAPI, Job } from '@/lib/api';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const { jobs, isLoading, mutate } = useJobs(statusFilter);
  const { resumes, mutate: mutateResumes } = useResumes();

  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [uploadResumeOpen, setUploadResumeOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [optimizingJobId, setOptimizingJobId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const handleCreateJob = async (data: any) => {
    try {
      await jobsAPI.create(data);
      toast.success('Job created successfully');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create job');
      throw error;
    }
  };

  const handleUpdateJob = async (data: any) => {
    if (!selectedJob) return;
    try {
      await jobsAPI.update(selectedJob._id, data);
      toast.success('Job updated successfully');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update job');
      throw error;
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await jobsAPI.delete(jobToDelete._id);
      toast.success('Job deleted successfully');
      mutate();
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete job');
    }
  };

  const handleOptimize = async (job: Job) => {
    if (!job.baseResume) {
      toast.error('No resume attached to this job');
      return;
    }

    setOptimizingJobId(job._id);
    const toastId = toast.loading('Optimizing resume with AI...');

    try {
      const result = await optimizeAPI.optimize({ jobId: job._id });
      toast.success('Resume optimized successfully!', { id: toastId });
      mutate();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to optimize resume',
        { id: toastId }
      );
    } finally {
      setOptimizingJobId(null);
    }
  };

  const handleViewChanges = (job: Job) => {
    setSelectedJob(job);
    setCompareModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setJobFormOpen(true);
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleAddJob = () => {
    setSelectedJob(null);
    setJobFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Flashfire Resume Optimizer
                </h1>
              </div>
              <p className="text-gray-400 text-lg ml-14">
                AI-powered resume optimization for job applications
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => setUploadResumeOpen(true)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
              <Button 
                onClick={handleAddJob}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Actions */}
      <div className="border-b border-gray-800/50 bg-gray-900/30">
        <div className="container mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">Filter by status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[220px] border-gray-700 bg-gray-900 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    <SelectItem value="All">All Jobs</SelectItem>
                    <SelectItem value="Pending Optimization">Pending Optimization</SelectItem>
                    <SelectItem value="Optimized">Optimized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="px-4 py-1.5 bg-gray-800/50 rounded-full border border-gray-700">
                <span className="text-sm font-medium text-gray-300">
                  {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              disabled={isLoading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Loading jobs...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-32">
            <div className="mx-auto w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-gray-800">
              <Sparkles className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No jobs yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
              Get started by adding your first job card and uploading a base resume to optimize.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => setUploadResumeOpen(true)} 
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
              <Button 
                onClick={handleAddJob}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Job
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="relative">
                {optimizingJobId === job._id && (
                  <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl border border-gray-800">
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-3" />
                      <p className="text-base font-medium text-white">Optimizing with AI...</p>
                      <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
                    </div>
                  </div>
                )}
                <JobCard
                  job={job}
                  onOptimize={handleOptimize}
                  onViewChanges={handleViewChanges}
                  onEdit={handleEditJob}
                  onDelete={handleDeleteClick}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <JobForm
        open={jobFormOpen}
        onClose={() => {
          setJobFormOpen(false);
          setSelectedJob(null);
        }}
        onSubmit={selectedJob ? handleUpdateJob : handleCreateJob}
        job={selectedJob}
        resumes={resumes}
      />

      <UploadResume
        open={uploadResumeOpen}
        onClose={() => setUploadResumeOpen(false)}
        onSuccess={() => {
          mutateResumes();
          toast.success('Resume uploaded! You can now link it to a job.');
        }}
      />

      <CompareModal
        open={compareModalOpen}
        onClose={() => {
          setCompareModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-base">
              This will permanently delete the job card for{' '}
              <span className="font-semibold text-white">{jobToDelete?.position}</span> at{' '}
              <span className="font-semibold text-white">{jobToDelete?.companyName}</span>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteJob} 
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}