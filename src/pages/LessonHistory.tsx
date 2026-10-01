import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lesson,
  LessonFilterOptions
} from '../types/lesson';
import { lessonService } from '../services/api/lessonService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  PlusCircle,
  FolderOpen,
  Trash2,
  Eye,
  Edit2,
  Printer,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface LessonHistoryProps {
  dataVersion?: number;
  onLessonDeleted?: () => void;
}

export const LessonHistory: React.FC<LessonHistoryProps> = ({
  dataVersion,
  onLessonDeleted
}) => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'duration'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Deletion modal & feedback state
  const [lessonPendingDelete, setLessonPendingDelete] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, [searchQuery, selectedSubject, selectedClass, sortBy, dataVersion]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const data = await lessonService.getLessons({
        searchQuery,
        selectedSubject,
        selectedClass,
        sortBy
      });
      setLessons(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (lesson: Lesson, e: React.MouseEvent) => {
    e.stopPropagation();
    setLessonPendingDelete(lesson);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!lessonPendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      // Call actual Supabase delete operation using the database record's unique ID
      await lessonService.deleteLesson(lessonPendingDelete.id);

      // Only remove the lesson from the UI after successful deletion
      setLessons((prev) => prev.filter((l) => l.id !== lessonPendingDelete.id));
      showToast(`Lesson "${lessonPendingDelete.title}" deleted successfully`);
      if (onLessonDeleted) onLessonDeleted();
      setLessonPendingDelete(null);
    } catch (err: any) {
      console.error('[LessonHistory] Deletion failed:', err);
      // Keep the lesson visible and show clear error message
      setDeleteError(err.message || 'Failed to delete lesson from the database. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return <Badge variant="success" size="sm">Easy</Badge>;
      case 'Medium':
        return <Badge variant="brand" size="sm">Medium</Badge>;
      case 'Hard':
        return <Badge variant="warning" size="sm">Hard</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{difficulty}</Badge>;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Distinct subjects & classes for filter menus
  const subjectsList = ['Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'History', 'English Literature', 'Computer Science'];
  const classesList = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50/80 text-indigo-700 border border-indigo-200/50 mb-1.5 shadow-xs">
            <BookOpen className="w-3 h-3 text-indigo-500" />
            Curriculum Repository
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Lesson History & Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Browse, filter, edit, and export all generated classroom packages
          </p>
        </div>

        <Link to="/create">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="shadow-md shadow-indigo-500/20 active:scale-95"
          >
            New Lesson
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar (Glass Panel) */}
      <div className="glass-card bg-white/75 backdrop-blur-xl rounded-2xl border border-white/60 p-4 sm:p-5 shadow-glass space-y-3.5 transition-all">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-md focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Subject Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-md text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-md text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
            >
              <option value="all">All Classes</option>
              {classesList.map((cl) => (
                <option key={cl} value={cl}>
                  {cl}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-md text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="duration">Sort: Duration</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="lg:col-span-1 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-2 rounded-xl border transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white/60 text-slate-400 hover:text-slate-700 border-slate-200/70 hover:bg-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table view"
              className={`p-2 rounded-xl border transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white/60 text-slate-400 hover:text-slate-700 border-slate-200/70 hover:bg-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Badges Bar */}
        {(searchQuery || selectedSubject !== 'all' || selectedClass !== 'all') && (
          <div className="flex items-center gap-2 pt-2.5 border-t border-slate-200/50 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Active filters:</span>
            {searchQuery && (
              <span className="bg-indigo-50/80 border border-indigo-200/50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium shadow-xs">
                "{searchQuery}"
              </span>
            )}
            {selectedSubject !== 'all' && (
              <span className="bg-indigo-50/80 border border-indigo-200/50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium shadow-xs">
                {selectedSubject}
              </span>
            )}
            {selectedClass !== 'all' && (
              <span className="bg-indigo-50/80 border border-indigo-200/50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium shadow-xs">
                {selectedClass}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedClass('all');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-semibold ml-auto cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-20 text-center glass-card bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-glass">
          <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Filtering lessons...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && lessons.length === 0 && (
        <div className="p-12 text-center glass-card bg-white/70 backdrop-blur-xl rounded-2xl border border-dashed border-slate-300 shadow-glass space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-100 shadow-xs">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              No matching lessons found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No lesson packages matched your active search query or filter selection.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedClass('all');
              }}
              className="bg-white/60"
            >
              Reset Filters
            </Button>
            <Link to="/create">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create New Lesson
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && lessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              variant="glass"
              hoverEffect
              onClick={() => navigate(`/lesson/${lesson.id}`)}
              className="p-5 flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="brand" size="sm">
                    {lesson.subject}
                  </Badge>
                  {getDifficultyBadge(lesson.difficulty)}
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-2 leading-snug transition-colors">
                  {lesson.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {lesson.learningObjective}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lesson.classLevel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lesson.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(lesson.updatedAt)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/workspace/${lesson.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all"
                      title="Edit in Workspace"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(lesson, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all"
                      title="Delete Lesson"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      to={`/lesson/${lesson.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/50 transition-all shadow-xs"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {!isLoading && viewMode === 'table' && lessons.length > 0 && (
        <div className="glass-card bg-white/75 backdrop-blur-xl rounded-2xl border border-white/60 overflow-hidden shadow-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-600 border-b border-slate-200/70 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Title & Subject</th>
                  <th className="py-3.5 px-3">Class</th>
                  <th className="py-3.5 px-3">Duration</th>
                  <th className="py-3.5 px-3">Difficulty</th>
                  <th className="py-3.5 px-3">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {lesson.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {lesson.subject} · {lesson.topic}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {lesson.classLevel}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {lesson.duration}
                    </td>
                    <td className="py-3.5 px-3">
                      {getDifficultyBadge(lesson.difficulty)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {formatDate(lesson.updatedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/workspace/${lesson.id}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Lesson"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(lesson, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/lesson/${lesson.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/50 transition-all shadow-xs"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {lessonPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/80 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete this lesson?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  This action cannot be undone. Are you sure you want to permanently delete{' '}
                  <strong className="text-slate-900 font-semibold">"{lessonPendingDelete.title}"</strong>?
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
                <strong className="block font-semibold">Deletion Failed:</strong>
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => {
                  setLessonPendingDelete(null);
                  setDeleteError(null);
                }}
                className="bg-white/80 hover:bg-white"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isDeleting}
                isLoading={isDeleting}
                onClick={handleConfirmDelete}
                className="shadow-sm shadow-rose-500/20"
              >
                {isDeleting ? 'Deleting...' : 'Delete Lesson'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900/90 text-white px-4 py-3 rounded-2xl shadow-glass backdrop-blur-xl border border-slate-700/60 text-xs font-medium animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
