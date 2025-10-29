'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { optimizeAPI, DiffResponse, Job } from '@/lib/api';
import { Download, Loader2, X, TrendingUp, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
}

export function CompareModal({ open, onClose, job }: CompareModalProps) {
  const [diffData, setDiffData] = useState<DiffResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'side-by-side' | 'inline'>('side-by-side');

  useEffect(() => {
    if (open && job?._id) {
      loadDiff();
    }
  }, [open, job?._id]);

  const loadDiff = async () => {
    if (!job?._id) return;

    setLoading(true);
    try {
      const data = await optimizeAPI.getDiff(job._id);
      setDiffData(data);
    } catch (error) {
      console.error('Error loading diff:', error);
      toast.error('Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!job?.latestOptimizedResume?.optimizedResumeText) return;

    const blob = new Blob([job.latestOptimizedResume.optimizedResumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-resume-${job.position.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded successfully');
  };

  const renderDiffLine = (part: any) => {
    if (part.added) {
      return (
        <div className="bg-emerald-500/10 border-l-2 border-emerald-400 px-4 py-2 hover:bg-emerald-500/15 transition-colors">
          <span className="text-emerald-300 text-base">{part.value}</span>
        </div>
      );
    }
    if (part.removed) {
      return (
        <div className="bg-rose-500/10 border-l-2 border-rose-400 px-4 py-2 hover:bg-rose-500/15 transition-colors">
          <span className="text-rose-300 line-through text-base">{part.value}</span>
        </div>
      );
    }
    return (
      <div className="px-4 py-2 text-gray-400">
        <span className="text-base">{part.value}</span>
      </div>
    );
  };

  const renderWordDiff = (parts: any[]) => {
    return (
      <div className="whitespace-pre-wrap leading-loose text-base">
        {parts.map((part, index) => {
          if (part.added) {
            return (
              <span key={index} className="bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded-md">
                {part.value}
              </span>
            );
          }
          if (part.removed) {
            return (
              <span key={index} className="bg-rose-500/20 text-rose-200 line-through px-1.5 py-0.5 rounded-md">
                {part.value}
              </span>
            );
          }
          return <span key={index} className="text-gray-300">{part.value}</span>;
        })}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-full p-0 bg-gray-950 border-gray-800 flex flex-col gap-0 overflow-hidden"
      >
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 px-8 py-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950 space-y-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-3xl font-bold text-white mb-2">
                {job?.position}
              </SheetTitle>
              <SheetDescription className="text-gray-400 text-base">
                Compare your original and optimized resume
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Loading comparison...</p>
            </div>
          </div>
        ) : diffData ? (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex flex-col min-h-full">
              {/* Summary Section */}
              <div className="flex-shrink-0 px-8 py-6 bg-gradient-to-b from-gray-900/50 to-transparent border-b border-gray-800/50">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Main Summary */}
                  <div className="xl:col-span-2 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xl text-white mb-1">{job?.changesSummary}</h3>
                        {diffData.changesSummary && (
                          <p className="text-gray-400 text-base leading-relaxed">{diffData.changesSummary}</p>
                        )}
                      </div>
                    </div>

                    {/* Keywords */}
                    {diffData.keywordsAdded && diffData.keywordsAdded.length > 0 && (
                      <div className="pt-3">
                        <p className="text-sm font-medium text-gray-300 mb-3">Keywords Added</p>
                        <div className="flex flex-wrap gap-2">
                          {diffData.keywordsAdded.map((keyword, index) => (
                            <Badge 
                              key={index} 
                              className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/30 px-3 py-1 text-sm"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  {diffData.diff.stats && (
                    <div className="flex xl:flex-col gap-4 xl:justify-center">
                      <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Plus className="h-4 w-4 text-emerald-400" />
                          <span className="text-2xl font-bold text-emerald-400">{diffData.diff.stats.additions}</span>
                        </div>
                        <p className="text-sm text-emerald-300/70">Additions</p>
                      </div>
                      <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Minus className="h-4 w-4 text-rose-400" />
                          <span className="text-2xl font-bold text-rose-400">{diffData.diff.stats.deletions}</span>
                        </div>
                        <p className="text-sm text-rose-300/70">Deletions</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs - Scrollable Content */}
              <div className="flex-1 px-8 py-6">
                <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="flex flex-col h-full">
                  <TabsList className="flex-shrink-0 grid w-full max-w-md grid-cols-2 bg-gray-900 border border-gray-800 mb-6">
                    <TabsTrigger value="side-by-side" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400">
                      Side by Side
                    </TabsTrigger>
                    <TabsTrigger value="inline" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400">
                      Inline Changes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="side-by-side" className="flex-1 mt-0 min-h-[600px]">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                      <div className="border border-gray-800 rounded-xl overflow-hidden flex flex-col bg-gray-900/50 min-h-[600px]">
                        <div className="flex-shrink-0 bg-gray-900 px-6 py-4 border-b border-gray-800">
                          <h4 className="font-semibold text-lg text-gray-300">Original Resume</h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 text-base whitespace-pre-wrap leading-relaxed text-gray-300">
                          {job?.baseResume?.baseResumeText}
                        </div>
                      </div>

                      <div className="border border-blue-500/30 rounded-xl overflow-hidden flex flex-col bg-blue-500/5 min-h-[600px]">
                        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b border-blue-500/30">
                          <h4 className="font-semibold text-lg text-white">Optimized Resume</h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 text-base whitespace-pre-wrap leading-relaxed text-gray-200">
                          {job?.latestOptimizedResume?.optimizedResumeText}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="inline" className="flex-1 mt-0 min-h-[600px]">
                    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 flex flex-col min-h-[600px]">
                      <div className="flex-shrink-0 bg-gray-900 px-6 py-4 border-b border-gray-800">
                        <h4 className="font-semibold text-lg text-gray-300">Changes Highlighted</h4>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6">
                        {diffData.diff.wordDiff ? (
                          renderWordDiff(diffData.diff.wordDiff)
                        ) : (
                          <div className="space-y-1">
                            {diffData.diff.lineDiff.map((part, index) => (
                              <div key={index}>{renderDiffLine(part)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-8 py-6 border-t border-gray-800 bg-gradient-to-t from-gray-900/50 to-transparent sticky bottom-0">
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-2 text-base"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Optimized Resume
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="bg-gray-800/50 rounded-full p-6 inline-block mb-4">
                <X className="h-12 w-12 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No comparison data available</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}