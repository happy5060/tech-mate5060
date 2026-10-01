import React, { useState, useEffect } from 'react';
import { LessonResource } from '../../types/classroom';
import { videoResourceService } from '../../services/api/videoResourceService';
import {
  Video,
  Play,
  Plus,
  Trash2,
  ExternalLink,
  X,
  FileVideo,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LessonResourcesPanelProps {
  lessonId: string;
  topic?: string;
  subject?: string;
  classLevel?: string;
  learningObjective?: string;
  isReadOnly?: boolean;
}

export const LessonResourcesPanel: React.FC<LessonResourcesPanelProps> = ({
  lessonId,
  isReadOnly = false
}) => {
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Watch video modal
  const [activeWatchVideo, setActiveWatchVideo] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    loadResources();
  }, [lessonId]);

  const loadResources = async () => {
    const list = await videoResourceService.getLessonResources(lessonId);
    setResources(list);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);

    const videoId = videoResourceService.extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      setUrlError('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }

    setIsSaving(true);
    try {
      // Safe metadata lookup (oEmbed)
      const meta = await videoResourceService.fetchMetadata(youtubeUrl, videoId);
      const titleToUse = videoTitle.trim() || meta.title;

      const newRes = await videoResourceService.addResource({
        lesson_id: lessonId,
        type: 'youtube',
        video_id: videoId,
        title: titleToUse,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channel: meta.channel || 'YouTube',
        duration: 'Variable',
        added_by: 'Teacher',
        is_approved: true
      });

      setResources((prev) => [...prev, newRes]);
      setYoutubeUrl('');
      setVideoTitle('');
      setIsModalOpen(false);
    } catch (err: any) {
      setUrlError('Failed to save YouTube resource: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    await videoResourceService.removeResource(resourceId);
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
  };

  return (
    <div className="space-y-6">
      {/* Learning Resources Header */}
      <div className="glass-card rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl p-5 shadow-glass space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-red-600 rounded-xl text-white shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Learning Resources & Videos
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verified educational videos and supplementary links
              </p>
            </div>
          </div>

          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUrlError(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-semibold bg-white/80 border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-xs self-start sm:self-center"
            >
              Add YouTube URL manually
            </Button>
          )}
        </div>

        {/* Approved Resources List */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            APPROVED LESSON RESOURCES ({resources.length})
          </h4>

          {resources.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-3">
              <FileVideo className="w-9 h-9 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                No videos or external resources added to this lesson yet.
              </p>
              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Add YouTube URL manually
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Thumbnail with overlay watch action */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                      {res.thumbnail ? (
                        <img
                          src={res.thumbnail}
                          alt={res.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Video className="w-8 h-8" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveWatchVideo({
                            id: res.video_id || '',
                            title: res.title
                          })
                        }
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold"
                      >
                        <Play className="w-6 h-6 fill-white" />
                        <span>Watch Video</span>
                      </button>
                    </div>

                    {/* Metadata */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">
                        <span>{res.channel || 'YouTube'}</span>
                        <span>•</span>
                        <span>Verified Resource</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {res.title}
                      </h5>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveWatchVideo({
                          id: res.video_id || '',
                          title: res.title
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Play className="w-3.5 h-3.5 fill-indigo-600" />
                      <span>Watch</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveResource(res.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add YouTube Video */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-modal border border-slate-200/80 w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add YouTube Video</h3>
                <p className="text-xs text-slate-500">
                  Paste a link from YouTube (video, short, or youtu.be)
                </p>
              </div>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  YouTube URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports standard watch links, youtu.be short links, and YouTube Shorts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Video Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photosynthesis Explained"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {urlError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                >
                  Add Video
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Watch Video Modal Player */}
      {activeWatchVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-modal border border-slate-700/80 w-full max-w-3xl overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <h3 className="text-sm font-bold truncate pr-6">{activeWatchVideo.title}</h3>
              <button
                type="button"
                onClick={() => setActiveWatchVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeWatchVideo.id}?autoplay=1&rel=0`}
                title={activeWatchVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Backwards-compatible export alias for any components that may import VideoRecommendationPanel
export const VideoRecommendationPanel = LessonResourcesPanel;
