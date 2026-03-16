import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { api, Project as SupabaseProject } from '../services/api';
import { MaskedHeading } from './AnimatedHeading';

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  year: string;
  description: string;
}

const mockProjects: Project[] = [
  {
    id: '01',
    title: 'Aether Platform',
    category: 'Digital Ecosystem',
    image: 'https://picsum.photos/seed/project1/1200/800',
    year: '2024',
    description: 'A comprehensive cloud infrastructure visualization tool for enterprise-level data management.',
  },
  {
    id: '02',
    title: 'Luminary Brand',
    category: 'Visual Identity',
    image: 'https://picsum.photos/seed/project2/1200/800',
    year: '2023',
    description: 'Reimagining the visual language for a sustainable energy startup focused on solar innovation.',
  },
  {
    id: '03',
    title: 'Vortex App',
    category: 'Mobile Experience',
    image: 'https://picsum.photos/seed/project3/1200/800',
    year: '2024',
    description: 'An immersive social platform designed for the next generation of creative collaborators.',
  },
  {
    id: '04',
    title: 'Nova Commerce',
    category: 'E-commerce',
    image: 'https://picsum.photos/seed/project4/1200/800',
    year: '2023',
    description: 'A high-performance shopping experience built for a premium luxury fashion house.',
  },
];

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity }}
      className={`relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32 lg:mb-64 ${
        index % 2 !== 0 ? 'lg:direction-rtl' : ''
      }`}
    >
      {/* Project Image */}
      <div className={`lg:col-span-7 overflow-hidden rounded-2xl border border-white/5 group relative aspect-[16/10] ${
        index % 2 !== 0 ? 'lg:order-2' : 'lg:order-1'
      }`}>
        <motion.img
          style={{ y }}
          src={project.image}
          alt={project.title}
          className="w-full h-[140%] absolute -top-[20%] left-0 object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black scale-50 group-hover:scale-100 transition-transform duration-500">
            <ExternalLink size={24} />
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className={`lg:col-span-5 flex flex-col gap-6 ${
        index % 2 !== 0 ? 'lg:order-1 lg:text-right lg:items-end' : 'lg:order-2'
      }`}>
        <div className="flex items-center gap-4 text-zinc-500 font-mono text-xs tracking-[0.3em] uppercase">
          <span>{project.id}</span>
          <span className="w-8 h-[1px] bg-zinc-800" />
          <span>{project.category}</span>
        </div>
        
        <h3 className="text-5xl md:text-7xl font-display font-medium tracking-tighter text-white leading-none">
          {project.title}
        </h3>
        
        <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
          {project.description}
        </p>

        <div className="flex items-center gap-8 mt-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Year</span>
            <span className="text-white font-mono">{project.year}</span>
          </div>
          
          <motion.button
            whileHover={{ x: index % 2 !== 0 ? -5 : 5 }}
            className="group flex items-center gap-4 text-white hover:text-brand transition-colors"
          >
            <span className="text-sm font-bold uppercase tracking-widest">View Project</span>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand group-hover:bg-brand group-hover:text-white transition-all">
              <ArrowUpRight size={18} />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <div className={`relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32 lg:mb-64 ${
    index % 2 !== 0 ? 'lg:direction-rtl' : ''
  }`}>
    <div className={`lg:col-span-7 aspect-[16/10] bg-white/5 rounded-2xl animate-pulse ${
      index % 2 !== 0 ? 'lg:order-2' : 'lg:order-1'
    }`} />
    <div className={`lg:col-span-5 flex flex-col gap-6 ${
      index % 2 !== 0 ? 'lg:order-1 lg:text-right lg:items-end' : 'lg:order-2'
    }`}>
      <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
      <div className="h-16 w-full bg-white/5 rounded animate-pulse" />
      <div className="h-24 w-full bg-white/5 rounded animate-pulse" />
      <div className="flex gap-8 mt-4">
        <div className="h-10 w-20 bg-white/5 rounded animate-pulse" />
        <div className="h-10 w-40 bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Fetching projects from Supabase...');
        const data = await api.projects.getAll();
        console.log('Projects data received:', data);

        if (data && data.length > 0) {
          const formattedProjects: Project[] = data.map(p => ({
            id: p.display_id,
            title: p.title,
            category: p.category,
            image: p.image_url,
            year: p.year,
            description: p.description
          }));
          setProjects(formattedProjects);
        } else {
          console.log('No projects found in Supabase, using mock data.');
          setProjects(mockProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(mockProjects);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-32 lg:py-64 relative overflow-hidden bg-zinc-950">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-32 lg:mb-48">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/5"
          >
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-zinc-400 font-medium tracking-widest uppercase text-[10px]">
              Selected Works
            </span>
          </motion.div>
          
          <MaskedHeading className="text-6xl md:text-8xl lg:text-9xl font-display font-medium tracking-tight leading-[0.85] text-white">
            Crafting digital <br />
            <span className="italic font-light text-zinc-500">excellence</span>.
          </MaskedHeading>
        </div>

        {/* Projects List */}
        <div className="relative">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <ProjectSkeleton key={i} index={i} />
            ))
          ) : (
            projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))
          )}
        </div>

        {/* View All CTA */}
        <div className="flex justify-center mt-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-6 rounded-2xl bg-white text-black font-bold text-xl hover:bg-brand hover:text-white transition-all shadow-2xl brand-glow"
          >
            Explore All Projects
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
