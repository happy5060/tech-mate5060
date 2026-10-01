import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatActionType } from '../../types/classroom';
import { aiChatService } from '../../services/api/aiChatService';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldAlert,
  Lightbulb,
  Layers,
  HelpCircle,
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LessonAssistantProps {
  lessonContext: {
    subject: string;
    topic: string;
    classLevel: string;
    learningObjective: string;
    lessonContent: any;
    resources?: any[];
  };
  isTestActive?: boolean;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  isStudent?: boolean;
}

export const LessonAssistant: React.FC<LessonAssistantProps> = ({
  lessonContext,
  isTestActive = false,
  isOpen,
  onClose,
  title = 'AI Lesson Assistant',
  isStudent = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isStudent
        ? `Hello! I am your AI learning tutor for **${lessonContext.topic}**. Ask me to explain concepts, give real-world analogies, or break things down step-by-step!`
        : `Welcome! I'm your curriculum co-pilot for **${lessonContext.topic}**. Ask me to refine teaching strategies, generate customized student examples, or adapt explanations for ${lessonContext.classLevel}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string, actionType?: ChatActionType) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsSending(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const replyText = await aiChatService.sendMessage({
        message: textToSend,
        actionType,
        isTestActive,
        history,
        lessonContext
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I had trouble processing that request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleActionChip = (action: ChatActionType, label: string) => {
    const promptMap: Record<ChatActionType, string> = {
      explain_simpler: `Explain ${lessonContext.topic} simply`,
      give_example: `Give an applied real-world example of ${lessonContext.topic}`,
      explain_step_by_step: `Explain how ${lessonContext.topic} works step-by-step`,
      give_analogy: `Give an everyday analogy for ${lessonContext.topic}`
    };
    handleSend(promptMap[action], action);
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ${
        isMinimized ? 'w-72 h-14' : 'w-full sm:w-[420px] h-[580px] max-h-[85vh]'
      }`}
    >
      <div className="w-full h-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-glass overflow-hidden flex flex-col transition-all">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white/50 to-purple-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900">{title}</h4>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-2.5 h-2.5" />
                  Lesson-Aware
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                {lessonContext.topic} • {lessonContext.classLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized Bar Return */}
        {isMinimized ? null : (
          <>
            {/* Active Test Lock Banner (Phase 15 Security) */}
            {isTestActive && (
              <div className="px-3.5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-900 flex items-center gap-2 text-[11px] font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Assessment Active:</strong> Direct answers to test questions are locked.
                </span>
              </div>
            )}

            {/* Quick Action Chips */}
            <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
              <button
                type="button"
                onClick={() => handleActionChip('explain_simpler', 'Explain Simpler')}
                disabled={isSending}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-xs whitespace-nowrap active:scale-95 transition-all flex items-center gap-1 font-medium"
              >
                <Lightbulb className="w-3 h-3 text-amber-500" />
                Explain Simpler
              </button>
              <button
                type="button"
                onClick={() => handleActionChip('give_example', 'Give an Example')}
                disabled={isSending}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-xs whitespace-nowrap active:scale-95 transition-all flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Give Example
              </button>
              <button
                type="button"
                onClick={() => handleActionChip('explain_step_by_step', 'Step-by-Step')}
                disabled={isSending}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-xs whitespace-nowrap active:scale-95 transition-all flex items-center gap-1 font-medium"
              >
                <Layers className="w-3 h-3 text-emerald-500" />
                Step-by-Step
              </button>
              <button
                type="button"
                onClick={() => handleActionChip('give_analogy', 'Give an Analogy')}
                disabled={isSending}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-xs whitespace-nowrap active:scale-95 transition-all flex items-center gap-1 font-medium"
              >
                <HelpCircle className="w-3 h-3 text-purple-500" />
                Give Analogy
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-100/80 text-slate-800 rounded-tl-none border border-slate-200/50'
                      }`}
                    >
                      <div className="whitespace-pre-line prose-xs">{m.content}</div>
                      <span
                        className={`block text-[9px] mt-1 ${
                          isUser ? 'text-indigo-200 text-right' : 'text-slate-400'
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 rounded-tl-none flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-100 bg-white/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isStudent ? 'Ask a question about this lesson...' : 'Ask AI to adapt or expand this lesson...'}
                className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!input.trim() || isSending}
                className="px-3 h-auto py-2.5 rounded-xl"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
