import React, { useRef } from 'react';
import { motion, useInView, animate, useScroll, useTransform, useSpring } from 'motion/react';
import { Target, Zap, ArrowUpRight, Award, Rocket, Clock, Heart } from 'lucide-react';

const StatCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = "" }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  React.useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
};

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Effect for Image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const springY = useSpring(y, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  const stats = [
    { label: 'Projects Launched', value: 150, suffix: '+', icon: Rocket },
    { label: 'Years of Experience', value: 8, suffix: '+', icon: Clock },
    { label: 'Happy Clients', value: 50, suffix: '+', icon: Heart },
  ];

  const expertise = [
    { title: 'Brand Identity', icon: Award },
    { title: 'Digital Strategy', icon: Target },
    { title: 'Creative Engineering', icon: Zap },
  ];

  return (
    <section id="about" ref={sectionRef} className="py-32 lg:py-64 relative overflow-hidden bg-zinc-950">
      {/* Background Decorative Elements - More subtle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Side: Visual Composition */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              {/* Main Image Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 w-full aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 group shadow-2xl"
              >
                <motion.img
                  style={{ y: springY }}
                  src="https://picsum.photos/seed/agency-minimal/1200/1600"
                  alt="Our Creative Studio"
                  className="w-full h-[140%] -top-[20%] absolute object-cover grayscale-[0.4] brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
              </motion.div>

              {/* Detail Element */}
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                className="absolute -bottom-6 -left-6 z-30 p-6 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl hidden xl:block shadow-xl"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-brand font-bold">Studio Location</span>
                  <span className="text-white font-display text-lg">Downtown, NY</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Narrative Content */}
          <motion.div 
            ref={containerRef}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 lg:order-2"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full border border-white/10 bg-white/5">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-zinc-400 font-medium tracking-widest uppercase text-[10px]">
                About the Studio
              </span>
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl xl:text-8xl font-display font-medium tracking-tight mb-10 leading-[0.9] text-white">
              Crafting <span className="italic font-light text-zinc-500">meaningful</span> <br className="hidden md:block" /> 
              digital experiences.
            </motion.h2>

            <div className="space-y-8 mb-16">
              <motion.p variants={itemVariants} className="text-xl lg:text-2xl text-zinc-300 leading-relaxed font-light">
                We are a design-led collective focused on the intersection of aesthetics and utility. We help brands find their voice in a crowded digital world.
              </motion.p>
              <motion.p variants={itemVariants} className="text-lg text-zinc-500 leading-relaxed">
                Our process is rooted in deep research and iterative design. We don't believe in shortcuts—only in the relentless pursuit of excellence and the courage to challenge the status quo.
              </motion.p>
            </div>

            {/* Expertise List */}
            <div className="flex flex-wrap gap-x-10 gap-y-6 mb-16">
              {expertise.map((item, idx) => (
                <motion.div 
                  key={item.title} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand/50 transition-colors bg-white/5">
                    <item.icon className="text-zinc-500 group-hover:text-brand transition-colors" size={18} />
                  </div>
                  <span className="text-zinc-400 group-hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">{item.title}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 border-t border-white/5 pt-12 mb-16">
              {stats.map((stat) => (
                <motion.div 
                  key={stat.label} 
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="flex flex-col gap-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    {stat.label}
                  </span>
                  <div className="text-4xl lg:text-5xl font-display font-light text-white tracking-tighter">
                    <StatCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              variants={itemVariants}
              whileHover={{ x: 5, scale: 1.02 }}
              className="group flex items-center gap-6 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500 bg-white/5">
                <ArrowUpRight size={24} className="text-white group-hover:text-black transition-colors" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Get in touch</span>
                <span className="text-white text-xl font-display group-hover:text-brand transition-colors">Start a project</span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

