import { motion } from 'motion/react';
import { ExternalLink, Github, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/src/components/ui/GradientCard';
import { Project } from '@/src/types';
import { getOptimizedImageUrl } from '@/src/lib/storage';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <GradientCard 
        className="h-full group border border-border/40 hover:border-primary/30 transition-colors duration-500 overflow-hidden" 
        containerClassName="p-0 flex flex-col"
      >
        {/* Image Section */}
        <div className="aspect-[16/10] overflow-hidden relative border-b border-border/40">
          <img 
            src={getOptimizedImageUrl(project.image_url, { width: 800, quality: 85 })} 
            alt={project.title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 z-20">
          </div>

          {/* Featured Badge */}
          {project.is_featured && (
            <div className="absolute top-6 left-6 z-30">
              <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full border-none flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl">
                <Star className="w-3 h-3 fill-current" /> Featured
              </Badge>
            </div>
          )}

          {/* Year Badge (Monospace) */}
          {project.year && (
            <div className="absolute top-6 right-6 z-30">
              <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-md text-[10px] font-mono border border-white/10">
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
  );
};
