import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/src/components/ui/GradientCard';
import { Section } from './Section';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { SplitText } from '@/src/components/animations/SplitText';
import { BlurText } from '@/src/components/animations/BlurText';
import { supabase } from '@/src/lib/supabase';
import { Link } from 'react-router-dom';

interface Project {
  display_id?: string;
  title: string;
  category: string;
  image: string;
  year?: string;
  description?: string;
  featured?: boolean;
}

export const Projects = () => {
  const [data, setData] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(4);

      if (error) {
        console.error('Error fetching projects:', error);
      } else if (projectsData && projectsData.length > 0) {
        setData(projectsData.map(p => ({
          display_id: p.display_id,
          title: p.title,
          category: p.category,
          image: p.image_url,
          year: p.year,
          description: p.description,
          featured: p.is_featured
        })));
      }
    };

    fetchProjects();

    // Real-time subscription
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Section id="projects" className="bg-muted/30">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight flex flex-wrap gap-x-3">
            <SplitText text="Our Latest" delay={0.1} />
            <span className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 italic">
              <SplitText text="Projects" delay={0.4} />
            </span>
          </h2>
          <BlurText 
            text="Explore our portfolio of successful projects delivered to clients worldwide. We turn complex ideas into seamless digital realities."
            className="text-lg md:text-xl text-muted-foreground leading-relaxed"
            delay={0.6}
          />
        </div>
        <ScrollReveal delay={0.8} y={0} x={20} className="hidden lg:block">
          <Link to="/projects">
            <Button 
              variant="outline" 
              className="rounded-full px-8 h-14 text-base gap-2 border-foreground/10 bg-foreground/5 backdrop-blur-md hover:bg-foreground/10 text-foreground transition-all duration-500 hover:scale-105 active:scale-95 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-2">
                View All Projects
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-20">
        {data.map((project, index) => (
          <ScrollReveal
            key={project.title}
            delay={index * 0.1 + 0.3}
            y={40}
          >
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full"
            >
              <GradientCard className="h-full group border border-border/40 hover:border-primary/30 transition-colors duration-500 overflow-hidden" containerClassName="p-0 flex flex-col">
                {/* Image Section */}
                <div className="aspect-[16/10] overflow-hidden relative border-b border-border/40">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 z-20">
                  </div>

                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-6 left-6 z-30">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full border-none flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </Badge>
                    </div>
                  )}

                  {/* Year Badge (Monospace) */}
                  {project.year && (
                    <div className="absolute top-6 right-6 z-30">
                      <div className="bg-foreground/50 backdrop-blur-md text-background px-3 py-1 rounded-md text-[10px] font-mono border border-foreground/10">
                        {project.year}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-10 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-3">
                        {project.display_id && (
                          <span className="text-[10px] font-mono text-muted-foreground border border-border/60 px-2 py-0.5 rounded">
                            {project.display_id}
                          </span>
                        )}
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">
                          {project.category}
                        </p>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors duration-500">
                        {project.title}
                      </h3>
                      {project.description && (
                        <div className="relative group/desc">
                          <p className="text-muted-foreground text-sm md:text-base leading-relaxed transition-all duration-300">
                            {project.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </GradientCard>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.2} y={20} className="flex justify-center lg:hidden px-6">
        <Link to="/projects" className="w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="rounded-full px-10 h-16 text-lg gap-3 border-foreground/10 bg-foreground/5 backdrop-blur-md hover:bg-foreground/10 text-foreground transition-all duration-500 hover:scale-105 active:scale-95 group relative overflow-hidden w-full shadow-2xl"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-3 font-bold">
              View All Projects
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </span>
          </Button>
        </Link>
      </ScrollReveal>
    </Section>
  );
};
