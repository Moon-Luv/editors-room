import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { SplitText } from '@/src/components/animations/SplitText';
import { BookCallModal } from '@/src/components/ui/BookCallModal';

export const CTA = () => {
  return (
    <Section className="py-0">
      <div className="bg-muted/50 border border-border/50 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight flex flex-wrap justify-center gap-x-4">
            <SplitText text="Ready to build something" delay={0.1} />
            <span className="text-primary italic">
              <SplitText text="extraordinary?" delay={0.5} />
            </span>
          </h2>
          <ScrollReveal delay={0.7} y={20}>
            <p className="text-xl text-muted-foreground mb-12">
              Join 50+ successful startups that have scaled their business with Editors Room. 
              Let's discuss your next project today.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.9} y={20} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg gap-2 group shadow-lg shadow-primary/20">
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <BookCallModal 
              trigger={
                <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg border-border hover:bg-muted gap-2">
                  <Phone className="w-4 h-4" /> Book a Call
                </Button>
              }
            />
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
};
