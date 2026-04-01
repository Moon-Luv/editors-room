import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Twitter, Linkedin, Github } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GradientCard } from '@/src/components/ui/GradientCard';
import { Section } from './Section';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { SplitText } from '@/src/components/animations/SplitText';
import { supabase } from '@/src/lib/supabase';
import { getOptimizedImageUrl } from '@/src/lib/storage';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
}

export const Team = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching team:', error);
      } else if (data && data.length > 0) {
        setTeam(data.map(m => ({
          name: m.name,
          role: m.role,
          image: m.image_url || `https://i.pravatar.cc/400?u=${m.name}`,
          bio: m.bio,
          linkedin_url: m.linkedin_url,
          twitter_url: m.twitter_url,
          github_url: m.github_url
        })));
      }
    };

    fetchTeam();

    const channel = supabase
      .channel('team_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, fetchTeam)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Section id="team" className="relative overflow-hidden">
      <div className="text-center max-w-3xl mx-auto mb-20 relative z-10 flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-tighter flex flex-wrap justify-center gap-x-4">
          <SplitText text="Meet Our" delay={0.1} />
          <span className="text-primary italic">
            <SplitText text="Experts" delay={0.3} />
          </span>
        </h2>
        <ScrollReveal 
          delay={0.5}
          y={20}
          className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed"
        >
          A diverse team of passionate individuals dedicated to building exceptional digital products.
        </ScrollReveal>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        autoplay={true}
        autoplayDelay={4000}
        className="w-full max-w-7xl mx-auto relative z-10"
      >
        <CarouselContent className="-ml-8">
          {team.map((member, index) => (
            <CarouselItem key={member.name} className="md:basis-1/2 lg:basis-1/3 pl-8">
              <ScrollReveal
                delay={index * 0.1 + 0.6}
                scale={0.9}
                y={30}
              >
                <GradientCard className="rounded-[2.5rem]" containerClassName="p-4 rounded-[calc(2.5rem-1px)]">
                  <div className="aspect-square rounded-[2rem] overflow-hidden mb-8 relative">
                    <img 
                      src={getOptimizedImageUrl(member.image, { width: 500, height: 500, quality: 85 })} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                      <button className="w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-md border border-foreground/20 flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                        <Twitter className="w-5 h-5" />
                      </button>
                      <button className="w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-md border border-foreground/20 flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                        <Linkedin className="w-5 h-5" />
                      </button>
                      <button className="w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-md border border-foreground/20 flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                        <Github className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-center pb-4">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-500">
                      <SplitText text={member.name} delay={0.2} />
                    </h3>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs mt-2">
                      <SplitText text={member.role} delay={0.3} />
                    </p>
                  </div>
                </GradientCard>
              </ScrollReveal>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex justify-center gap-6 mt-14">
          <CarouselPrevious className="static translate-y-0 w-12 h-12 rounded-full bg-foreground/5 border-foreground/10 hover:bg-foreground/10 text-foreground transition-all duration-300" />
          <CarouselNext className="static translate-y-0 w-12 h-12 rounded-full bg-foreground/5 border-foreground/10 hover:bg-foreground/10 text-foreground transition-all duration-300" />
        </div>
      </Carousel>
    </Section>
  );
};
