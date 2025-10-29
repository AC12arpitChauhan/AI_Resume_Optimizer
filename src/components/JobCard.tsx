'use client';

import { Job } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, truncateText } from '@/lib/utils';
import { 
  Sparkles, 
  Eye, 
  Pencil, 
  Trash2, 
  ExternalLink,
  Building2,
  User,
  Briefcase,
  Calendar
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  onOptimize: (job: Job) => void;
  onViewChanges: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}

export function JobCard({ job, onOptimize, onViewChanges, onEdit, onDelete }: JobCardProps) {
  const isOptimized = job.status === 'Optimized';

  return (
    <Card className="bg-gray-900 border-gray-800 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-gray-700">
      <CardHeader className="space-y-3 border-b border-gray-800/50 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="h-3.5 w-3.5" />
              <span>{job.clientName}</span>
            </div>
            <h3 className="font-semibold text-lg text-white leading-tight">{job.position}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Building2 className="h-3.5 w-3.5" />
              <span>{job.companyName}</span>
            </div>
          </div>
          <Badge 
            variant={isOptimized ? 'default' : 'secondary'} 
            className={`ml-2 ${
              isOptimized 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            {job.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        <div>
          <p className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Job Description
          </p>
          <p className="text-sm leading-relaxed text-gray-300">
            {truncateText(job.jobDescription, 150)}
          </p>
        </div>

        {job.jobApplicationLink && (
          <a
            href={job.jobApplicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Application Link
          </a>
        )}

        {isOptimized && job.optimizedOn && (
          <div className="pt-3 border-t border-gray-800/50 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>Optimized on {formatDate(job.optimizedOn)}</span>
            </div>
            {job.changesSummary && (
              <p className="text-sm font-medium text-green-400">
                ✓ {job.changesSummary}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-gray-800/50">
        {!isOptimized ? (
          <Button 
            onClick={() => onOptimize(job)} 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!job.baseResume}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Optimize Resume
          </Button>
        ) : (
          <Button 
            onClick={() => onViewChanges(job)} 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Changes
          </Button>
        )}
        <Button 
          onClick={() => onEdit(job)} 
          variant="outline" 
          size="icon"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => onDelete(job)} 
          variant="outline" 
          size="icon"
          className="border-gray-700 text-gray-300 hover:bg-rose-900/50 hover:text-rose-400 hover:border-rose-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}