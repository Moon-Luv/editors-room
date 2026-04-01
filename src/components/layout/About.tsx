import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { CheckCircle2, ArrowUpRight, Users, Globe, Briefcase, LucideIcon } from 'lucide-react';
import { Section } from './Section';
import { cn } from '@/src/lib/utils';
import { CountUp } from '@/src/components/animations/CountUp';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { supabase } from '@/src/lib/supabase';
import { getOptimizedImageUrl } from '@/src/lib/storage';

interface Stat {
  label: string;
  value: number;
  suffix: string;
  icon: LucideIcon;
}

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Users,
  Globe,
};

export const About = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [aboutData, setAboutData] = useState<{
    title: string;
    description: string;
    image_url: string;
    projects_completed: number;
    happy_clients: number;
    countries_served: number;
  } | null>(null);
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Projects Completed', value: 150, suffix: '+', icon: Briefcase },
    { label: 'Happy Clients', value: 50, suffix: '+', icon: Users },
    { label: 'Countries Served', value: 12, suffix: '+', icon: Globe },
  ]);
  const [features, setFeatures] = useState<string[]>([
    'Strategic Planning',
    'Custom Development',
    'UI/UX Excellence',
    '24/7 Support'
  ]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const fetchAboutData = async () => {
      try {
        const { data, error } = await supabase
          .from('about')
          .select('*')
          .maybeSingle();

        if (error) {
          console.error('Error fetching about data:', error);
        } else if (data) {
          setAboutData(data);
          setStats([
            { label: 'Projects Completed', value: data.projects_completed, suffix: '+', icon: Briefcase },
            { label: 'Happy Clients', value: data.happy_clients, suffix: '+', icon: Users },
            { label: 'Countries Served', value: data.countries_served, suffix: '+', icon: Globe },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFeatures = async () => {
      const { data, error } = await supabase
        .from('features')
        .select('name')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching features:', error);
      } else if (data && data.length > 0) {
        setFeatures(data.map(f => f.name));
      } else {
        // Fallback features if database is empty
        setFeatures([
          'Strategic Planning',
          'Custom Development',
          'UI/UX Excellence',
          '24/7 Support'
        ]);
      }
    };

    fetchAboutData();
    fetchFeatures();
  }, []);

  const { scrollYProgress } = useScroll({
    target: isMounted ? sectionRef : undefined,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <Section id="about" ref={sectionRef} className="relative overflow-visible">
      {/* Background Decorations with Parallax */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" 
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          <div className="lg:col-span-7 space-y-8 sm:space-y-12">
            <div className="space-y-6">
              <div className="h-4 w-32 bg-secondary animate-pulse rounded-full" />
              <div className="h-16 sm:h-24 w-full bg-secondary animate-pulse rounded-3xl" />
              <div className="h-16 sm:h-24 w-3/4 bg-secondary animate-pulse rounded-3xl" />
              <div className="h-20 w-full bg-secondary animate-pulse rounded-3xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-secondary animate-pulse rounded-3xl" />
              ))}
            </div>
            <div className="hidden md:flex gap-16 pt-8 border-t border-border/50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-10 w-20 bg-secondary animate-pulse rounded-xl" />
                  <div className="h-3 w-24 bg-secondary animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="aspect-[4/5] rounded-[3rem] bg-secondary animate-pulse" />
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start"
        >
          {/* Left Column - Content */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-12">
            <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary" />
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-primary">Our Identity</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
                {aboutData?.title ? (
                  <span dangerouslySetInnerHTML={{ __html: aboutData.title.replace(/future/g, '<span class="italic font-serif text-primary/80">future</span>') }} />
                ) : (
                  <>Engineering the <span className="italic font-serif text-primary/80">future</span> of digital experiences.</>
                )}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                {aboutData?.description || "Editors Room is a full-service IT agency dedicated to bridging the gap between complex technology and business growth. We don't just build software; we build partnerships that last."}
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, index) => (
                <ScrollReveal key={feature} delay={index * 0.1} y={20}>
                  <div className="group flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-secondary/30 border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-background border border-border flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{feature}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Stats - Desktop Horizontal */}
            <div className="hidden md:flex items-center gap-16 pt-8 border-t border-border/50">
              {stats.map((stat, index) => (
                <ScrollReveal key={stat.label} delay={0.4 + index * 0.1} y={20}>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                      <CountUp to={stat.value} />{stat.suffix}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right Column - Visual Composition */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <motion.div 
              variants={itemVariants}
              className="relative z-10"
              style={{ y: imageY }}
            >
              {/* Main Image Card */}
              <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-secondary border border-border/50 shadow-2xl relative group">
                <motion.img 
                  src={getOptimizedImageUrl(aboutData?.image_url || "https://picsum.photos/seed/editors-room-team/800/1000", { width: 800, quality: 85 })} 
                  alt="Editors Room Team" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                
                {/* Floating Badge */}
                <motion.div 
                  className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-background/80 backdrop-blur-md border border-foreground/10 shadow-xl flex items-center gap-2 sm:gap-3"
                  whileHover={{ y: -5, x: 5 }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="pr-1 sm:pr-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Est. Since</div>
                    <div className="text-xs sm:text-sm font-bold text-foreground">2018</div>
                  </div>
                </motion.div>
              </div>

              {/* Overlapping Glass Card - Mobile Stats */}
              <div className="md:hidden mt-6 p-6 sm:p-8 rounded-[2rem] bg-secondary/80 backdrop-blur-xl border border-border shadow-xl">
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center space-y-1">
                      <div className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                        <CountUp to={stat.value} />{stat.suffix}
                      </div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Floating Elements */}
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-[2rem] bg-primary/10 border border-primary/20 backdrop-blur-sm -z-10 animate-float hidden lg:block" />
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm -z-10 animate-float-delayed hidden lg:block" />
            </motion.div>

            {/* Vertical Rail Text */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden xl:block">
              <span className="writing-mode-vertical text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground/30 select-none">
                Innovation • Excellence • Partnership
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </Section>
  );
};
