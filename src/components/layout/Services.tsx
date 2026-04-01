import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  Cpu, 
  Cloud, 
  ShieldCheck, 
  BarChart3, 
  Video, 
  SearchCheck,
  Target,
  Zap,
  Globe,
  Smartphone,
  Layers,
  Layout,
  Database,
  Lock,
  Rocket,
  Palette,
  Megaphone,
  LucideIcon
} from 'lucide-react';
import { GradientCard } from '@/src/components/ui/GradientCard';
import { Section } from './Section';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { supabase } from '@/src/lib/supabase';

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const iconMap: Record<string, LucideIcon> = {
  Code2,
  Cpu,
  Cloud,
  ShieldCheck,
  BarChart3,
  Video,
  SearchCheck,
  Target,
  Zap,
  Globe,
  Smartphone,
  Layers,
  Layout,
  Database,
  Lock,
  Rocket,
  Palette,
  Megaphone,
};

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
      } else if (data && data.length > 0) {
        setServices(data.map(s => ({
          title: s.title,
          description: s.description,
          icon: iconMap[s.icon_name] || Code2,
          color: s.color_class || 'bg-primary/10 text-primary',
        })));
      } else {
        // Fallback services if database is empty
        setServices([
          {
            title: 'Custom Software Development',
            description: 'We build scalable, high-performance applications tailored to your business needs.',
            icon: Code2,
            color: 'bg-blue-500/10 text-blue-500',
          },
          {
            title: 'AI & Machine Learning',
            description: 'Integrate intelligent solutions to automate processes and gain deeper insights.',
            icon: Cpu,
            color: 'bg-purple-500/10 text-purple-500',
          },
          {
            title: 'Cloud Infrastructure',
            description: 'Secure and reliable cloud solutions to keep your business running smoothly.',
            icon: Cloud,
            color: 'bg-cyan-500/10 text-cyan-500',
          },
          {
            title: 'Cybersecurity',
            description: 'Protect your digital assets with our advanced security protocols and monitoring.',
            icon: ShieldCheck,
            color: 'bg-red-500/10 text-red-500',
          },
          {
            title: 'Data Analytics',
            description: 'Turn your raw data into actionable insights with our analytics expertise.',
            icon: BarChart3,
            color: 'bg-green-500/10 text-green-500',
          },
          {
            title: 'Digital Marketing',
            description: 'Grow your online presence and reach your target audience effectively.',
            icon: Megaphone,
            color: 'bg-orange-500/10 text-orange-500',
          },
        ]);
      }
    };

    fetchServices();
  }, []);

  return (
    <Section id="services" className="bg-muted/30">
      <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
          Comprehensive IT Services
        </h2>
        <p className="text-lg text-muted-foreground">
          We provide end-to-end solutions to help your business thrive in the digital age.
          From engineering to marketing, we've got you covered.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <ScrollReveal
            key={service.title}
            delay={index * 0.1}
            y={30}
            className="h-full"
          >
            <GradientCard className="h-full" containerClassName="p-8">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${service.color} group-hover:bg-primary group-hover:text-primary-foreground`}>
                  <service.icon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">{service.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </GradientCard>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
};
