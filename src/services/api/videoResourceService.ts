import { LessonResource } from '../../types/classroom';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_RESOURCES = 'ai_classroom_lesson_resources_v1';

function getLocalResources(): LessonResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESOURCES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalResources(list: LessonResource[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save resources in local cache:', e);
  }
}

export const videoResourceService = {
  /**
   * Helper: Extracts clean YouTube Video ID from any standard URL format:
   * - https://www.youtube.com/watch?v=VIDEO_ID
   * - https://youtu.be/VIDEO_ID
   * - https://www.youtube.com/embed/VIDEO_ID
   * - https://www.youtube.com/shorts/VIDEO_ID
   * - Or bare 11-char ID
   */
  extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();

    // Direct ID check if teacher entered just the 11 character ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = trimmed.match(regExp);
    return match ? match[1] : null;
  },

  /**
   * Safe metadata lookup using standard public YouTube oEmbed
   */
  async fetchMetadata(url: string, videoId: string): Promise<{ title: string; channel: string }> {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const json = await res.json();
        return {
          title: json.title || `Educational Video (${videoId})`,
          channel: json.author_name || 'YouTube'
        };
      }
    } catch {
      // Offline or network restricted, fallback gracefully
    }

    return {
      title: `Educational Video (${videoId})`,
      channel: 'YouTube'
    };
  },

  /**
   * Get all resources for a specific lesson
   */
  async getLessonResources(lessonId: string): Promise<LessonResource[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('lesson_resources')
          .select('*')
          .eq('lesson_id', lessonId);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase getLessonResources warning:', err);
      }
    }

    return getLocalResources().filter((r) => r.lesson_id === lessonId);
  },

  /**
   * Add a manual YouTube resource to lesson resources
   */
  async addResource(resource: Omit<LessonResource, 'id' | 'created_at'>): Promise<LessonResource> {
    const newRecord: LessonResource = {
      ...resource,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('lesson_resources')
          .insert(newRecord)
          .select()
          .single();

        if (!error && data) {
          const current = getLocalResources();
          saveLocalResources([...current, data]);
          return data;
        }
      } catch (err) {
        console.warn('Supabase addResource warning:', err);
      }
    }

    const current = getLocalResources();
    saveLocalResources([...current, newRecord]);
    return newRecord;
  },

  /**
   * Update a resource
   */
  async updateResource(
    resourceId: string,
    updates: Partial<LessonResource>
  ): Promise<LessonResource | null> {
    const list = getLocalResources();
    const index = list.findIndex((r) => r.id === resourceId);
    if (index === -1) return null;

    const merged = { ...list[index], ...updates };
    list[index] = merged;
    saveLocalResources(list);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('lesson_resources')
          .update(updates)
          .eq('id', resourceId);
      } catch (err) {
        console.warn('Supabase updateResource warning:', err);
      }
    }

    return merged;
  },

  /**
   * Remove a resource
   */
  async removeResource(resourceId: string): Promise<void> {
    const list = getLocalResources().filter((r) => r.id !== resourceId);
    saveLocalResources(list);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('lesson_resources').delete().eq('id', resourceId);
      } catch (err) {
        console.warn('Supabase removeResource warning:', err);
      }
    }
  }
};
