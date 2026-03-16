import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { Linkedin, Twitter, Github, ArrowUpRight, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { MaskedHeading } from './AnimatedHeading';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

const mockTeam: TeamMember[] = [
  {
    name: 'Alex Rivers',
    role: 'Creative Director',
    bio: 'A visionary designer with over a decade of experience crafting digital narratives for global brands.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    socials: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Sarah Chen',
    role: 'Lead Developer',
    bio: 'Specializing in high-performance architectures and immersive web experiences that push technical boundaries.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
    socials: { github: '#', linkedin: '#' },
  },
  {
    name: 'Marcus Thorne',
    role: 'Strategy Lead',
    bio: 'Bridging the gap between business objectives and creative execution through data-driven insights.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    socials: { twitter: '#', linkedin: '#' },
  },
  {
    name: 'Elena Vance',
    role: 'AI Specialist',
    bio: 'Pioneering the integration of generative intelligence into creative workflows and user interfaces.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    socials: { github: '#', twitter: '#' },
  },
  {
    name: 'Julian Voss',
    role: 'Motion Designer',
    bio: 'Expert in creating fluid, organic animations that bring static interfaces to life.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
    socials: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Maya Patel',
    role: 'UX Researcher',
    bio: 'Dedicated to understanding human behavior to build products that are truly user-centric.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    socials: { linkedin: '#', twitter: '#' },
  },
];

// Triple the team for infinite scroll effect
// This is now handled inside the TeamSection component

const TeamMemberCard: React.FC<{ member: TeamMember; index: number }> = ({ member, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Scroll Reveal Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const
      }
    })
  };

  // Magnetic Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Text Reveal Variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: (index % 6) * 0.1 + i * 0.1,
        duration: 0.5,
        ease: "easeOut" as const
      }
    })
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.1);
    y.set(distanceY * 0.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      custom={index % 6} // Use modulo to stagger within visible sets
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -10, transition: { duration: 0.4, ease: "easeOut" } }}
      style={{ x: springX, y: springY }}
      className="group relative flex-shrink-0 w-[300px] md:w-[400px] cursor-pointer"
    >
      <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl group-hover:shadow-brand/20 transition-shadow duration-500">
        <motion.img
          src={member.image}
          alt={member.name}
          animate={{ scale: isHovered ? 1.1 : 1, filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

        <div className="absolute top-6 right-6 flex flex-col gap-3">
          {member.socials.linkedin && (
            <motion.a 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              href={member.socials.linkedin} 
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-brand hover:scale-110 transition-all"
            >
              <Linkedin size={20} />
            </motion.a>
          )}
          {member.socials.twitter && (
            <motion.a 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              href={member.socials.twitter} 
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-brand hover:scale-110 transition-all"
            >
              <Twitter size={20} />
            </motion.a>
          )}
          {member.socials.github && (
            <motion.a 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              href={member.socials.github} 
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-brand hover:scale-110 transition-all"
            >
              <Github size={20} />
            </motion.a>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <motion.p 
                custom={1}
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                animate={{ 
                  y: isHovered ? 0 : 0, // Keep it at 0 if visible
                  opacity: isHovered ? 1 : 0.6 
                }}
                className="text-brand font-mono text-[11px] uppercase tracking-[0.3em] mb-2"
              >
                {member.role}
              </motion.p>
              <motion.h3 
                custom={2}
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                animate={{
                  color: isHovered ? "#FF4D00" : "#FFFFFF",
                  transition: { duration: 0.3 }
                }}
                className="text-3xl font-display font-bold text-white tracking-tighter leading-none"
              >
                {member.name}
              </motion.h3>
            </div>
            <motion.div 
              animate={{ rotate: isHovered ? 45 : 0 }}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white"
            >
              <Plus size={24} />
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <motion.p 
              custom={3}
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-sm text-zinc-400 leading-relaxed pt-4 border-t border-white/10"
            >
              {member.bio}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const TeamSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-[300px] md:w-[400px]">
    <div className="aspect-[4/5] rounded-[32px] bg-white/5 animate-pulse border border-white/5" />
    <div className="mt-6 space-y-4">
      <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
      <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
    </div>
  </div>
);

const TeamSection: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        console.log('Fetching team members from Supabase...');
        const data = await api.team.getAll();
        console.log('Team data received:', data);
        
        if (data && data.length > 0) {
          const formattedTeam: TeamMember[] = data.map(m => ({
            name: m.name,
            role: m.role,
            bio: m.bio,
            image: m.image_url,
            socials: {
              linkedin: m.linkedin_url || undefined,
              twitter: m.twitter_url || undefined,
              github: m.github_url || undefined
            }
          }));
          setTeam(formattedTeam);
        } else {
          console.log('No team members found in Supabase, using mock data.');
          setTeam(mockTeam);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        setTeam(mockTeam);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const extendedTeam = [...team, ...team, ...team];
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInitialScrollSet, setIsInitialScrollSet] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const xBg = useTransform(scrollYProgress, [0, 1], [100, -100]);

  // Handle Initial Scroll to Center Set
  useEffect(() => {
    if (isLoading) return;
    const updateMaxScroll = () => {
      if (carouselRef.current) {
        const fullWidth = carouselRef.current.scrollWidth;
        const visibleWidth = carouselRef.current.offsetWidth;
        const newMaxScroll = fullWidth - visibleWidth;
        setMaxScroll(newMaxScroll);

        // Set initial position to middle set of items if not set
        if (!isInitialScrollSet && fullWidth > 0) {
          const singleSetWidth = fullWidth / 3;
          carouselRef.current.scrollLeft = singleSetWidth;
          setScrollX(singleSetWidth);
          setIsInitialScrollSet(true);
        }
      }
    };
    
    updateMaxScroll();
    window.addEventListener('resize', updateMaxScroll);
    return () => window.removeEventListener('resize', updateMaxScroll);
  }, [isInitialScrollSet, isLoading]);

  // Autoplay Logic
  useEffect(() => {
    if (isPaused || isLoading) return;

    const interval = setInterval(() => {
      handleScroll('right');
    }, 4000); // 4 seconds interval

    return () => clearInterval(interval);
  }, [isPaused, scrollX, maxScroll, isLoading]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current || isLoading) return;
    const cardWidth = window.innerWidth < 768 ? 300 : 400;
    const gap = 32;
    const scrollAmount = cardWidth + gap;
    
    let newScroll = direction === 'left' ? scrollX - scrollAmount : scrollX + scrollAmount;
    
    carouselRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  const onScroll = () => {
    if (!carouselRef.current || isLoading) return;
    const currentScroll = carouselRef.current.scrollLeft;
    const fullWidth = carouselRef.current.scrollWidth;
    const singleSetWidth = fullWidth / 3;

    // Infinite Loop Logic: Jump back/forward when reaching boundaries of the middle set
    if (currentScroll >= singleSetWidth * 2) {
      carouselRef.current.scrollLeft = currentScroll - singleSetWidth;
    } else if (currentScroll <= singleSetWidth - carouselRef.current.offsetWidth) {
      // This part is tricky because of the offset. 
      // Simpler: if we go too far left, jump to the right set
      if (currentScroll < 10) {
         carouselRef.current.scrollLeft = singleSetWidth;
      }
    }

    setScrollX(carouselRef.current.scrollLeft);
  };

  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => setIsPaused(false);

  return (
    <section id="team" ref={sectionRef} className="py-32 lg:py-64 relative overflow-hidden bg-zinc-950">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full pointer-events-none select-none overflow-hidden whitespace-nowrap opacity-[0.02]">
        <motion.h2 
          style={{ x: xBg }}
          className="text-[30vw] font-display font-black text-white leading-none uppercase"
        >
          Collective Collective Collective
        </motion.h2>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl border-x border-white/5" />
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/5" />
        <div className="absolute top-3/4 left-0 w-full h-[1px] bg-white/5" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-32">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-4 mb-8"
            >
              <span className="w-16 h-[1px] bg-brand" />
              <span className="text-brand font-bold tracking-[0.4em] uppercase text-xs">
                Our Talent
              </span>
            </motion.div>
            <MaskedHeading 
              className="text-7xl md:text-9xl font-display font-bold tracking-tighter leading-[0.8] text-white"
            >
              The minds <br />
              <span className="text-zinc-600 italic font-light">behind Pumpkin</span>.
            </MaskedHeading>
          </div>
          
          <div className="flex flex-col gap-8">
            <p className="text-xl text-zinc-400 leading-relaxed max-w-sm">
              A multidisciplinary collective of visionaries, engineers, and strategists crafting the next generation of digital excellence.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => { handleScroll('left'); handleInteractionStart(); setTimeout(handleInteractionEnd, 5000); }}
                className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                <ArrowLeft size={24} />
              </button>
              <button 
                onClick={() => { handleScroll('right'); handleInteractionStart(); setTimeout(handleInteractionEnd, 5000); }}
                className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-brand hover:border-brand transition-all cursor-pointer"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={handleInteractionStart}
          onMouseLeave={handleInteractionEnd}
        >
          <div 
            ref={carouselRef}
            onScroll={onScroll}
            className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TeamSkeleton key={i} />
              ))
            ) : (
              extendedTeam.map((member, index) => (
                <div key={`${member.name}-${index}`} className="snap-start">
                  <TeamMemberCard member={member} index={index} />
                </div>
              ))
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand"
              animate={{ 
                width: maxScroll > 0 ? `${(scrollX / maxScroll) * 100}%` : '0%' 
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            />
          </div>
        </div>


        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-16 rounded-[48px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand/20 transition-colors duration-1000" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-center lg:text-left">
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">Ready to join the magic?</h3>
              <p className="text-xl text-zinc-500 max-w-xl">We are always looking for bold individuals who want to push the boundaries of what's possible.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255, 77, 0, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 rounded-2xl bg-white text-black font-bold text-xl hover:bg-brand hover:text-white transition-all shadow-2xl brand-glow cursor-pointer"
            >
              View Open Positions
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
