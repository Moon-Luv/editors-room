import { useState, useEffect, useCallback } from 'react';
import { api, Project, TeamMember, Testimonial, BlogPost } from '../services/api';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.projects.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, error, refresh: fetchProjects };
}

export function useTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.team.getAll();
      setTeam(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { team, isLoading, error, refresh: fetchTeam };
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.testimonials.getAll();
      setTestimonials(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return { testimonials, isLoading, error, refresh: fetchTestimonials };
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.blog.getAll();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, isLoading, error, refresh: fetchPosts };
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    projects: 0,
    featuredProjects: 0,
    team: 0,
    testimonials: 0
  });
  const [recentActivity, setRecentActivity] = useState<{
    recentProjects: Project[];
    recentTestimonials: Testimonial[];
  }>({
    recentProjects: [],
    recentTestimonials: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, activityData] = await Promise.all([
        api.dashboard.getStats(),
        api.dashboard.getRecentActivity()
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Real-time subscriptions
    const projectsSub = api.supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
      .subscribe();

    const teamSub = api.supabase
      .channel('team-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => fetchData())
      .subscribe();

    const testimonialsSub = api.supabase
      .channel('testimonials-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => fetchData())
      .subscribe();

    return () => {
      projectsSub.unsubscribe();
      teamSub.unsubscribe();
      testimonialsSub.unsubscribe();
    };
  }, [fetchData]);

  return { stats, recentActivity, isLoading, error, refresh: fetchData };
}
