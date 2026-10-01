import { ChatMessage, ChatActionType } from '../../types/classroom';
import { invokeEdgeFunction } from './supabaseClient';

export interface SendChatMessageParams {
  message: string;
  actionType?: ChatActionType;
  isTestActive?: boolean;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  lessonContext: {
    subject: string;
    topic: string;
    classLevel: string;
    learningObjective: string;
    lessonContent: any;
    resources?: any[];
  };
}

export const aiChatService = {
  /**
   * Sends a pedagogical query to the lesson-aware AI Assistant
   */
  async sendMessage(params: SendChatMessageParams): Promise<string> {
    try {
      const res = await invokeEdgeFunction<{ reply: string }>('lesson-chat', params);
      if (res && res.reply) {
        return res.reply;
      }
    } catch (err: any) {
      console.warn('lesson-chat edge function failed, using client fallback:', err);
    }

    // Graceful offline fallback
    if (params.isTestActive) {
      return '🔒 **Assessment in Progress**: The AI Learning Assistant cannot provide answers to active test questions. Please complete and submit your assessment first!';
    }

    if (params.actionType === 'explain_simpler') {
      return `### Simplified Concept: ${params.lessonContext.topic}\n\nThink of this like building with LEGO blocks: each part connects to another to form a complete working model. In simple terms for ${params.lessonContext.classLevel}: ${params.lessonContext.learningObjective}`;
    }

    if (params.actionType === 'give_analogy') {
      return `### Helpful Analogy\n\nImagine a busy school cafeteria during lunch: ingredients come into the kitchen (inputs), energy and cooks transform them, and nutritious meals are served to students (outputs). That is exactly how ${params.lessonContext.topic} functions!`;
    }

    return `Here is a helpful pedagogical breakdown of **${params.lessonContext.topic}** for ${params.lessonContext.classLevel}:\n\n- **Core Focus**: ${params.lessonContext.learningObjective}\n- **Key Takeaway**: Review the introductory hook and hands-on activity to solidify your understanding.`;
  }
};
