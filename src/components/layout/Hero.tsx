import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';
import { cn } from '@/src/lib/utils';
import { SplitText } from '@/src/components/animations/SplitText';
import { BlurText } from '@/src/components/animations/BlurText';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { BookCallModal } from '@/src/components/ui/BookCallModal';
import { supabase } from '@/src/lib/supabase';
import { getOptimizedImageUrl } from '@/src/lib/storage';

export const Hero = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [testimonialStats, setTestimonialStats] = useState({ count: 0, averageRating: 4.9 });
  const [testimonialAvatars, setTestimonialAvatars] = useState<string[]>([]);

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('trusted_companies')
      .select('name')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching brands:', error);
    } else if (data && data.length > 0) {
      setBrands(data.map(b => b.name));
    }
  };

  const fetchTestimonialStats = async () => {
    const { data, error, count } = await supabase
      .from('testimonials')
      .select('rating, avatar_url', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching testimonial stats:', error);
      return;
    }

    if (data && data.length > 0) {
      const totalRating = data.reduce((acc, curr) => acc + (curr.rating || 5), 0);
      const avg = totalRating / data.length;
      setTestimonialStats({
        count: count || data.length,
        averageRating: Number(avg.toFixed(1))
      });
      setTestimonialAvatars(data.map(t => t.avatar_url).filter(Boolean));
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchTestimonialStats();
  }, []);

  const defaultAvatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
  ];

  const displayAvatars = testimonialAvatars.length > 0 ? testimonialAvatars : defaultAvatars;

  return (
    <Section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse delay-700" />
      </div>

      <div className="flex flex-col items-center text-center max-w-5xl mx-auto relative z-10">
        <ScrollReveal
          delay={0}
          y={10}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md text-xs font-medium mb-10 shadow-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-foreground/80 tracking-wide uppercase">Next-Gen IT Solutions for Modern Startups</span>
        </ScrollReveal>

        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.2] sm:leading-[1.1] flex flex-col items-center">
          <SplitText 
            text="Building the Future of" 
            className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 text-center justify-center w-full"
            delay={0.1}
            stagger={0.02}
          />
          <SplitText 
            text="Digital Experiences" 
            className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-cyan-400 text-center justify-center w-full"
            delay={0.3}
            stagger={0.02}
          />
        </h1>

        <BlurText
          text="We empower startups with cutting-edge software development, AI integration, and cloud solutions. Scale your business with our expert engineering team."
          className="text-base sm:text-lg md:text-2xl text-foreground/60 mb-12 max-w-3xl leading-relaxed block"
          delay={0.5}
        />

        <ScrollReveal
          delay={0.7}
          y={10}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full md:w-auto px-6 md:px-0">
            <BookCallModal 
              trigger={
                <Button size="lg" variant="outline" className="rounded-full px-10 h-14 sm:h-16 text-base sm:text-lg gap-3 border-foreground/10 bg-foreground/5 backdrop-blur-md hover:bg-foreground/10 text-foreground transition-all duration-300 hover:scale-105 active:scale-95 w-full md:w-auto">
                  <Play className="w-5 h-5 fill-current" /> Book a Call
                </Button>
              }
            />

            {/* Social Proof / Trust Element - Seamless Design */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="flex -space-x-3">
                {displayAvatars.map((avatar, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-secondary hover:scale-110 hover:z-10 transition-transform duration-300 cursor-pointer"
                  >
                    <img 
                      src={avatar} 
                      alt={`User ${i}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground hover:scale-110 hover:z-10 transition-transform duration-300 cursor-pointer">
                  +{testimonialStats.count > 4 ? testimonialStats.count - 4 : "3"}
                </div>
              </div>
              
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={cn("w-3 h-3", star <= Math.round(testimonialStats.averageRating) ? "text-yellow-500 fill-yellow-500" : "text-yellow-500/30 fill-yellow-500/30")} 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className="text-[10px] font-bold text-foreground ml-1">{testimonialStats.averageRating}/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Trust Badges - Logo Loop */}
        <ScrollReveal
          delay={0.9}
          y={10}
          className="mt-24 pt-12 border-t border-foreground/5 w-full overflow-hidden group/trust"
        >
          <div className="flex items-center justify-center gap-4 mb-10">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-[0.3em]">
              Trusted by industry leaders
            </p>
          </div>
          
          {brands.length > 0 && (
            <div className="relative flex overflow-x-hidden">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-12 sm:gap-20 md:gap-32" style={{ '--duration': '30s', '--gap': '80px' } as React.CSSProperties}>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-12 sm:gap-20 md:gap-32 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 pr-12 sm:pr-20 md:pr-32">
                    {brands.map((brand) => (
                      <span key={brand} className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter text-foreground/80 hover:text-foreground transition-colors cursor-default">
                        {brand}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollReveal>
      </div>
    </Section>
  );
};
