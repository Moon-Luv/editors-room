import React, { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { GradientCard } from '@/src/components/ui/GradientCard';
import { Section } from './Section';
import { Marquee } from '@/src/components/ui/Marquee';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { SplitText } from '@/src/components/animations/SplitText';
import { supabase } from '@/src/lib/supabase';
import { getOptimizedImageUrl } from '@/src/lib/storage';

interface Testimonial {
  content: string;
  author: string;
  role: string;
  company?: string;
  image: string;
  rating?: number;
}

interface TestimonialCardProps {
  image: string;
  author: string;
  role: string;
  content: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  image,
  author,
  role,
  content,
}) => {
  return (
    <div className="mx-3 md:mx-4 w-[300px] md:w-[400px]">
      <GradientCard 
        className="w-full cursor-pointer h-full" 
        containerClassName="p-6 md:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm bg-background/60 border border-foreground/10"
        animate={true}
      >
        <div className="absolute -top-4 -right-4 opacity-[0.05] pointer-events-none transform rotate-12">
          <Quote className="w-24 h-24 md:w-32 md:h-32 text-primary" />
        </div>
        
        <div className="flex flex-col gap-4 md:gap-5 relative z-10">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm md:text-base leading-relaxed text-foreground/90 font-medium italic">
            <SplitText text={`"${content}"`} delay={0.1} stagger={0.03} />
          </p>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4 mt-6 md:mt-8 pt-6 border-t border-border/40 relative z-10">
          <div className="relative">
            <img 
              src={getOptimizedImageUrl(image, { width: 100, height: 100, quality: 80 })} 
              alt={author} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-primary/20"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full flex items-center justify-center border-2 border-background">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs md:text-sm font-bold leading-none mb-1 md:mb-1.5 tracking-tight">
              <SplitText text={author} delay={0.2} />
            </h4>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <SplitText text={role} delay={0.3} />
            </p>
          </div>
        </div>
      </GradientCard>
    </div>
  );
};

export const Testimonials = () => {
  const [data, setData] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data: testimonialsData, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching testimonials:', error);
      } else if (testimonialsData && testimonialsData.length > 0) {
        setData(testimonialsData.map(t => ({
          content: t.content,
          author: t.name,
          role: t.role,
          company: t.company,
          image: t.avatar_url,
          rating: t.rating
        })));
      }
    };

    fetchTestimonials();

    // Real-time subscription
    const channel = supabase
      .channel('testimonials-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchTestimonials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const firstRow = (data || []).slice(0, Math.ceil((data || []).length / 2));
  const secondRow = (data || []).slice(Math.ceil((data || []).length / 2));

  return (
    <Section id="testimonials" className="bg-muted/30 overflow-hidden relative py-24 md:py-32 px-0">
      {/* Background Decorative Elements - Subtle Gradient Section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.03),transparent_70%)]" />
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/3 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-500/3 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 mb-16 md:mb-24">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <ScrollReveal
            delay={0}
            y={20}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Testimonials
          </ScrollReveal>
          
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-tighter flex flex-wrap justify-center gap-x-4">
            <SplitText text="Trusted by" delay={0.2} />
            <span className="text-primary italic">
              <SplitText text="Industry Leaders" delay={0.4} />
            </span>
          </h2>
          
          <ScrollReveal 
            delay={0.6}
            y={20}
            className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed"
          >
            We've helped hundreds of startups and enterprises scale their digital presence. 
            Here's what they have to say about our partnership.
          </ScrollReveal>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-2">
        {/* Row 1 */}
        <Marquee pauseOnHover className="[--duration:50s] py-4">
          {firstRow.map((review) => (
            <TestimonialCard key={review.author} {...review} />
          ))}
        </Marquee>
        
        {/* Row 2 */}
        <Marquee reverse pauseOnHover className="[--duration:55s] py-4">
          {secondRow.map((review) => (
            <TestimonialCard key={review.author} {...review} />
          ))}
        </Marquee>
        
        {/* Gradient Masks for smooth fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 md:w-1/4 bg-gradient-to-r from-muted/30 via-muted/10 to-transparent z-20"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 md:w-1/4 bg-gradient-to-l from-muted/30 via-muted/10 to-transparent z-20"></div>
      </div>
    </Section>
  );
};
