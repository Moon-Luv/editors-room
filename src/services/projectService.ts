import { supabase } from '@/src/lib/supabase';
import { Project } from '@/src/types';

export const projectService = {
  /**
   * Fetches all projects from Supabase, ordered by sort_order.
   */
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches the latest projects for the homepage.
   * @param limit - Number of projects to fetch.
   */
  async getLatestProjects(limit: number = 4): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest projects:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Subscribes to real-time changes in the projects table.
   * @param callback - Function to call when changes occur.
   */
  subscribeToChanges(callback: () => void) {
    const channel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
