import { Search, Lightbulb, Code, Rocket, TrendingUp, LucideIcon } from 'lucide-react';
import { Section } from './Section';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { SplitText } from '@/src/components/animations/SplitText';

interface ProcessStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

const HARDCODED_STEPS: ProcessStep[] = [
  {
    title: 'Discovery',
    description: 'Deep dive into your business goals, target audience, and market landscape to define clear objectives.',
    icon: Search,
  },
  {
    title: 'Strategy',
    description: 'Crafting a tailored roadmap and technical architecture designed for scalability and long-term success.',
    icon: Lightbulb,
  },
  {
    title: 'Design',
    description: 'Creating intuitive, high-fidelity user interfaces that blend aesthetic excellence with seamless functionality.',
    icon: Code,
  },
  {
    title: 'Development',
    description: 'Engineering robust, high-performance solutions using cutting-edge technologies and agile methodologies.',
    icon: Rocket,
  },
  {
    title: 'Launch',
    description: 'Rigorous testing followed by a strategic deployment and continuous optimization for peak performance.',
    icon: TrendingUp,
  },
];

export const Process = () => {
  return (
    <Section id="process" className="relative overflow-hidden">
      <div className="text-center max-w-3xl mx-auto mb-24 relative z-10 flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight flex flex-wrap justify-center gap-x-4">
          <SplitText text="Our" delay={0.1} />
          <span className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            <SplitText text="Process" delay={0.3} />
          </span>
        </h2>
        <ScrollReveal 
          delay={0.5}
          y={20}
          className="text-xl text-muted-foreground"
        >
          A systematic approach to delivering high-quality digital solutions.
        </ScrollReveal>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent -translate-y-1/2 hidden lg:block" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 relative z-10">
          {HARDCODED_STEPS.map((step, index) => (
            <ScrollReveal
              key={step.title}
              delay={index * 0.1 + 0.6}
              y={30}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full"></div>
                <div className="w-20 h-20 rounded-full bg-foreground/5 backdrop-blur-xl border border-foreground/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-500 shadow-2xl relative z-10">
                  <step.icon className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" />
                </div>
                {/* Step Number Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors duration-500 z-20">
                  0{index + 1}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-all duration-500">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                {step.description}
              </p>
              
              {/* Large Background Number */}
              <div className="mt-8 text-7xl font-black text-foreground/[0.02] select-none group-hover:text-primary/[0.05] transition-colors duration-700">
                0{index + 1}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </Section>
  );
};
