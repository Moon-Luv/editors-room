import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Points, PointMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  ArrowRight, 
  Menu, 
  X, 
  ArrowUpRight,
  Sparkles,
  Zap,
  Code,
  Palette,
  Target,
  Globe,
  Clock
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// --- Three.js Background Components ---

const ParticleField = () => {
  const points = useRef<THREE.Points>(null!);
  const [particleCount] = useState(2000);
  
  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, [particleCount]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.05;
    points.current.rotation.x = time * 0.02;
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ff4d00"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const BackgroundCanvas = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0505]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ParticleField />
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[1, 64, 64]} position={[2, -1, -2]}>
              <MeshDistortMaterial
                color="#ff4d00"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0}
                metalness={1}
              />
            </Sphere>
          </Float>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ff4d00" />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0505]/50 to-[#0a0505]" />
      <div className="noise-bg absolute inset-0" />
    </div>
  );
};

// --- UI Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Projects', href: '#projects' },
    { name: 'Services', href: '#services' },
    { name: 'About us', href: '#about' },
    { name: 'Blog', href: '#blog' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className={`flex justify-between items-center px-6 py-3 rounded-2xl transition-all duration-500 ${isScrolled ? 'glass-nav shadow-2xl' : 'bg-transparent'}`}>
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-2xl group-hover:rotate-[360deg] transition-transform duration-700 shadow-[0_0_20px_rgba(255,77,0,0.5)]">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter text-glow">Pumpkin</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-zinc-400 hover:text-white transition-all hover:tracking-widest">
                {link.name}
              </a>
            ))}
            <button className="bg-white text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand hover:text-white transition-all active:scale-95 brand-glow">
              Get in touch
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#0a0505] z-40 flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link, idx) => (
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={link.name} 
                href={link.href} 
                className="text-4xl font-display font-bold text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </motion.a>
            ))}
            <button className="mt-8 bg-brand text-white px-10 py-4 rounded-2xl font-bold text-xl brand-glow">
              Get in touch
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Reference Image Style Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,77,0,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-[80vw] h-[80vw] border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-[60vw] h-[60vw] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute w-[40vw] h-[40vw] border border-white/10 rounded-full" />
          {/* Radar Lines */}
          <div className="absolute w-full h-[1px] bg-white/5 rotate-45" />
          <div className="absolute w-full h-[1px] bg-white/5 -rotate-45" />
          <div className="absolute w-[1px] h-full bg-white/5" />
          <div className="absolute h-[1px] w-full bg-white/5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-12 inline-block"
        >
          {/* Futuristic Portrait Placeholder */}
          <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto rounded-full overflow-hidden border-4 border-brand/30 brand-glow">
            <img 
              src="https://picsum.photos/seed/futuristic/800/800" 
              alt="Visionary" 
              className="w-full h-full object-cover grayscale brightness-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/40 to-transparent mix-blend-overlay" />
            {/* Glowing Visor Effect */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-brand blur-md animate-pulse" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-white shadow-[0_0_15px_#fff]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter leading-[0.9] mb-8 text-glow">
            Imagine a space between <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand to-white bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">vision & impact</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto mb-12 font-medium tracking-wide">
            That’s where we make an impact. Crafting digital excellence through strategy and innovation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand hover:text-white transition-all flex items-center gap-3 group brand-glow">
              Book a free call
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-10 py-5 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/5 transition-all">
              Explore projects
            </button>
          </div>
        </motion.div>
      </div>

      {/* Hero Footer Info */}
      <div className="absolute bottom-10 left-0 right-0 px-10 flex justify-between items-end text-zinc-500 font-mono text-xs tracking-widest uppercase">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand animate-ping" />
            <span>Live System Active</span>
          </div>
          <span>{time}</span>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <span className="animate-bounce">Scroll to explore ↓</span>
        </div>

        <div className="text-right flex flex-col gap-2">
          <span>EST. in 2025</span>
          <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProjectSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.project-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        },
        y: 100,
        opacity: 0,
        stagger: 0.2,
        scale: 0.8,
        rotateX: 45,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const projects = [
    { id: '01', title: 'CyberNexus', category: 'Web3 Ecosystem', image: 'https://picsum.photos/seed/cyber/1200/800' },
    { id: '02', title: 'Aetheria', category: 'AI Interface', image: 'https://picsum.photos/seed/aether/1200/800' },
    { id: '03', title: 'Vortex', category: 'Motion Identity', image: 'https://picsum.photos/seed/vortex/1200/800' },
  ];

  return (
    <section id="projects" ref={sectionRef} className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24">
          <span className="text-brand font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Selected Works</span>
          <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter">Crafting the future.</h2>
        </div>

        <div className="grid grid-cols-1 gap-32">
          {projects.map((project) => (
            <div key={project.id} className="project-card group relative">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[40px] border border-white/10">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                  <div>
                    <span className="text-brand font-mono text-xl mb-2 block">{project.id}</span>
                    <h3 className="text-4xl md:text-6xl font-display font-bold">{project.title}</h3>
                    <p className="text-zinc-400 font-medium mt-2">{project.category}</p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <ArrowUpRight size={32} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ServicesSection = () => {
  const services = [
    { icon: Target, title: 'Strategic Vision', desc: 'Defining the digital roadmap for industry leaders.' },
    { icon: Palette, title: 'Immersive Design', desc: 'Creating experiences that transcend the screen.' },
    { icon: Code, title: 'Future Tech', desc: 'Building with the most advanced stacks available.' },
    { icon: Sparkles, title: 'AI Integration', desc: 'Harnessing machine intelligence for growth.' },
  ];

  return (
    <section id="services" className="py-32 bg-zinc-950/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-brand font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Capabilities</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8">We build what others only imagine.</h2>
            <p className="text-xl text-zinc-400 leading-relaxed mb-12">
              Our multidisciplinary team blends creative artistry with technical precision to deliver results that redefine expectations.
            </p>
            <button className="group flex items-center gap-4 text-xl font-bold hover:text-brand transition-colors">
              Explore our process
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-brand group-hover:bg-brand transition-all">
                <ArrowRight size={20} />
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((service, idx) => (
              <motion.div 
                key={service.title}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mb-6 group-hover:bg-brand group-hover:text-white transition-all">
                  <service.icon size={28} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{service.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-brand/20 rounded-full blur-[120px] -z-10" />
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-20 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="max-w-xl">
            <a href="#" className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-2xl brand-glow">
                <Zap size={24} fill="currentColor" />
              </div>
              <span className="font-display font-bold text-3xl tracking-tighter">Pumpkin</span>
            </a>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Ready to build <br /> the future?</h2>
            <button className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-xl hover:bg-brand hover:text-white transition-all brand-glow">
              Start a project
            </button>
          </div>

          <div className="grid grid-cols-2 gap-20">
            <div>
              <h4 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-8">Navigation</h4>
              <ul className="space-y-4 text-xl font-bold">
                <li><a href="#" className="hover:text-brand transition-colors">Projects</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">About</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-8">Social</h4>
              <ul className="space-y-4 text-xl font-bold">
                <li><a href="#" className="hover:text-brand transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Dribbble</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 font-mono text-xs tracking-widest uppercase">
          <p>© 2025 Pumpkin Studio. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="relative">
      <BackgroundCanvas />
      <Navbar />
      <main>
        <Hero />
        <ProjectSection />
        <ServicesSection />
        
        {/* Storytelling Section */}
        <section className="py-64 flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-brand font-bold tracking-[0.5em] uppercase text-sm mb-8 block"
            >
              Our Philosophy
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl md:text-7xl font-display font-bold tracking-tighter leading-tight"
            >
              We don't just follow trends. <br />
              We define the <span className="text-brand">new standard</span> of digital interaction.
            </motion.h2>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
