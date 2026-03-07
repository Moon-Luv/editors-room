import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, animate } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Zap, ArrowUpRight, Award, Rocket, Clock, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const StatCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
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
  const imageMainRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal animations
      gsap.from(".reveal-item", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        }
      });

      // Smooth integrated parallax for the main image
      if (imageInnerRef.current) {
        gsap.to(imageInnerRef.current, {
          y: "15%",
          ease: "none",
          scrollTrigger: {
            trigger: imageMainRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-start">
          
          {/* Left Side: Refined Visual Composition */}
          <div className="lg:col-span-5 relative order-1">
            <div className="relative">
              {/* Main Image Container - Cleaner, no heavy shadow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                ref={imageMainRef}
                className="relative z-20 w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 group"
              >
                <img
                  ref={imageInnerRef}
                  src="https://picsum.photos/seed/agency-minimal/1200/1600"
                  alt="Our Creative Studio"
                  className="w-full h-[120%] -top-[10%] absolute object-cover grayscale-[0.6] brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
              </motion.div>

              {/* Minimal Detail Element instead of a second big image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.6 }}
                className="absolute -bottom-10 -left-10 z-30 p-8 bg-zinc-900 border border-white/10 rounded-xl hidden xl:block"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Studio Location</span>
                  <span className="text-white font-display text-lg">Downtown, NY</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Narrative Content - Cleaner Typography */}
          <div className="lg:col-span-7 order-2" ref={contentRef}>
            <div className="reveal-item">
              <div className="inline-flex items-center gap-3 mb-12 px-4 py-2 rounded-full border border-white/10 bg-white/5">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span className="text-zinc-400 font-medium tracking-widest uppercase text-[10px]">
                  About the Studio
                </span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-display font-medium tracking-tight mb-12 leading-[0.95] text-white">
                Crafting <span className="italic font-light text-zinc-500">meaningful</span> <br /> 
                digital experiences.
              </h2>

              <div className="max-w-2xl mb-16">
                <p className="text-xl lg:text-2xl text-zinc-300 leading-relaxed font-light mb-8">
                  We are a design-led collective focused on the intersection of aesthetics and utility. We help brands find their voice in a crowded digital world.
                </p>
                <p className="text-lg text-zinc-500 leading-relaxed">
                  Our process is rooted in deep research and iterative design. We don't believe in shortcuts—only in the relentless pursuit of excellence and the courage to challenge the status quo.
                </p>
              </div>

              {/* Minimal Expertise List */}
              <div className="flex flex-wrap gap-x-12 gap-y-6 mb-20">
                {expertise.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand/50 transition-colors">
                      <item.icon className="text-zinc-500 group-hover:text-brand transition-colors" size={14} />
                    </div>
                    <span className="text-zinc-400 group-hover:text-white transition-colors text-sm font-medium uppercase tracking-wider">{item.title}</span>
                  </div>
                ))}
              </div>

              {/* Clean Stats - No bulky boxes */}
              <div className="grid grid-cols-3 gap-12 border-t border-white/5 pt-16 mb-16" ref={statsRef}>
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                      {stat.label}
                    </span>
                    <div className="text-5xl lg:text-6xl font-display font-light text-white tracking-tighter">
                      <StatCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Minimal CTA */}
              <motion.button
                whileHover={{ x: 5 }}
                className="group flex items-center gap-6"
              >
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500">
                  <ArrowUpRight size={24} className="text-white group-hover:text-black transition-colors" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Get in touch</span>
                  <span className="text-white text-xl font-display group-hover:text-brand transition-colors">Start a project</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

