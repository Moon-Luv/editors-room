import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  X, 
  Star,
  LayoutGrid,
  SearchX,
  ArrowUpDown,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GradientCard } from '@/src/components/ui/GradientCard';
import { supabase } from '@/src/lib/supabase';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '@/src/lib/storage';

interface Project {
  display_id?: string;
  title: string;
  category: string;
  image: string;
  year?: string;
  description?: string;
  featured?: boolean;
  created_at: string;
}

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllProjects = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all projects:', error);
      } else if (data) {
        setProjects(data.map(p => ({
          display_id: p.display_id,
          title: p.title,
          category: p.category,
          image: p.image_url,
          year: p.year,
          description: p.description,
          featured: p.is_featured,
          created_at: p.created_at
        })));
      }
      setIsLoading(false);
    };

    fetchAllProjects();
    window.scrollTo(0, 0);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category));
    return Array.from(cats);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return filtered;
  }, [projects, searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-8 mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                All <span className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 italic">Projects</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Explore our full portfolio of digital experiences. We turn complex ideas into seamless digital realities.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search projects..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-foreground/5 border-border focus:border-primary/50 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/10 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-xl border-border bg-foreground/5 flex-shrink-0"
                onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                title={sortBy === 'newest' ? 'Sort by Oldest' : 'Sort by Newest'}
              >
                <ArrowUpDown className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-32 space-y-10">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                  <LayoutGrid className="w-3 h-3" /> Categories
                </h4>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border text-left",
                      !selectedCategory 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                        : "bg-foreground/5 text-foreground/60 border-border hover:border-primary/50"
                    )}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border text-left",
                        selectedCategory === cat 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                          : "bg-foreground/5 text-foreground/60 border-white/10 hover:border-primary/50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {(selectedCategory || searchQuery) && (
                <Button 
                  variant="ghost" 
                  onClick={clearFilters}
                  className="w-full text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-xl h-12"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Projects Grid */}
          <div className="flex-grow">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[16/10] rounded-3xl bg-foreground/5 animate-pulse" />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.title}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <GradientCard className="h-full group border border-border/40 hover:border-primary/30 transition-colors duration-500 overflow-hidden" containerClassName="p-0 flex flex-col">
                        <div className="aspect-[16/10] overflow-hidden relative border-b border-border/40">
                          <img 
                            src={getOptimizedImageUrl(project.image, { width: 800, quality: 85 })} 
                            alt={project.title} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 z-20">
                          </div>
                          {project.featured && (
                            <div className="absolute top-4 left-4 z-30">
                              <Badge className="bg-primary text-primary-foreground px-3 py-1 rounded-full border-none flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.2em] shadow-2xl">
                                <Star className="w-2.5 h-2.5 fill-current" /> Featured
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            {project.display_id && (
                              <span className="text-[8px] font-mono text-muted-foreground border border-border/60 px-1.5 py-0.5 rounded">
                                {project.display_id}
                              </span>
                            )}
                            <p className="text-[8px] font-bold text-primary uppercase tracking-[0.3em]">
                              {project.category}
                            </p>
                          </div>
                          <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors duration-500">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      </GradientCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-foreground/5 rounded-[2.5rem] border border-dashed border-border">
                <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center mb-6 border border-border">
                  <SearchX className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No projects found</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any projects matching your current filters. Try adjusting your search or filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-8 rounded-full px-8 border-border hover:bg-foreground/10"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
