import React from 'react';
import { Edit2, Sparkles, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SectionCardProps {
  id: string;
  sectionNumber: number;
  title: string;
  description?: string;
  icon: React.ReactNode;
  isEditable?: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onRegenerate: () => Promise<void>;
  isRegenerating?: boolean;
  children: React.ReactNode;
  editForm?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  id,
  sectionNumber,
  title,
  description,
  icon,
  isEditable = true,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRegenerate,
  isRegenerating = false,
  children,
  editForm,
}) => {
  return (
    <div
      id={id}
      className={`glass-panel rounded-2xl overflow-hidden print-card transition-all duration-200 ${
        isEditing ? 'ring-2 ring-indigo-500/50 shadow-glass-hover bg-white/95' : 'hover:shadow-glass'
      }`}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/50 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 shadow-subtle shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {sectionNumber}. {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 font-medium">{description}</p>
            )}
          </div>
        </div>

        {isEditable && (
          <div className="flex items-center gap-2 no-print shrink-0">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartEdit}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  className="rounded-xl"
                >
                  Edit
                </Button>
                <div className="relative group">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={onRegenerate}
                    isLoading={isRegenerating}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                    className="rounded-xl border border-indigo-200/60 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50/80"
                  >
                    Regenerate
                  </Button>
                  <span className="pointer-events-none absolute -top-8 right-0 z-20 hidden group-hover:block whitespace-nowrap bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg shadow-md border border-white/10">
                    Regenerates ONLY {title}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelEdit}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSaveEdit}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  className="rounded-xl"
                >
                  Save Section
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {isEditing ? editForm : children}
      </div>
    </div>
  );
};
