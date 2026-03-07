import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
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
  Clock,
  Linkedin,
  Twitter,
  Github,
  ChevronDown,
  Mail,
  User,
  MessageSquare,
  Star
} from 'lucide-react';

import AboutSection from './components/AboutSection';

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
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Team', href: '#team' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
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
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-zinc-400 hover:text-white transition-all hover:tracking-widest">
                {link.name}
              </a>
            ))}
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 77, 0, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand hover:text-white transition-all brand-glow"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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
            className="fixed inset-0 bg-[#0a0505] z-40 flex flex-col items-center justify-center gap-8 lg:hidden"
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
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 77, 0, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 bg-brand text-white px-10 py-4 rounded-2xl font-bold text-xl brand-glow"
            >
              Get Started
            </motion.button>
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
            That’s where we make an impact. We blend design, strategy, and innovation to craft bold, memorable experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 77, 0, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand hover:text-white transition-all flex items-center gap-3 group brand-glow"
            >
              Get Started
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/5 transition-all"
            >
              View our work
            </motion.button>
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

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const features = [
    { icon: Target, title: 'Strategic Vision', desc: 'Defining the digital roadmap for industry leaders.' },
    { icon: Palette, title: 'Immersive Design', desc: 'Creating experiences that transcend the screen.' },
    { icon: Code, title: 'Future Tech', desc: 'Building with the most advanced stacks available.' },
    { icon: Sparkles, title: 'AI Integration', desc: 'Harnessing machine intelligence for growth.' },
    { icon: Globe, title: 'Global Reach', desc: 'Scaling your brand across international markets.' },
    { icon: Clock, title: 'Rapid Delivery', desc: 'Fast turnarounds without compromising on quality.' },
  ];

  return (
    <section id="features" ref={sectionRef} className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <span className="text-brand font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Capabilities</span>
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">We build what others only imagine.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[40px] bg-white/5 border border-white/10 hover:border-brand/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mb-8 group-hover:bg-brand group-hover:text-white transition-all">
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ShowcaseSection = () => {
  return (
    <section className="py-32 bg-zinc-950/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-brand font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Product Showcase</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">The next generation <br /> of digital products.</h2>
            <p className="text-xl text-zinc-400 leading-relaxed mb-12">
              Our platform empowers creators to build immersive experiences with ease. From concept to deployment, we provide the tools you need to succeed.
            </p>
            <ul className="space-y-6 mb-12">
              {['Seamless Integration', 'AI-Powered Workflows', 'Real-time Collaboration'].map((item) => (
                <li key={item} className="flex items-center gap-4 text-lg font-medium">
                  <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand">
                    <Sparkles size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 77, 0, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand hover:text-white transition-all brand-glow"
            >
              Learn More
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative aspect-square rounded-[60px] overflow-hidden border border-white/10"
          >
            <img 
              src="https://picsum.photos/seed/showcase/1200/1200" 
              alt="Showcase" 
              className="w-full h-full object-cover grayscale brightness-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white animate-pulse">
                <Zap size={40} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TeamSection = () => {
  const team = [
    { name: 'Alex Rivers', role: 'Creative Director', bio: 'Visionary designer with 10+ years of experience.', image: 'https://i.pravatar.cc/150?u=alex' },
    { name: 'Sarah Chen', role: 'Lead Developer', bio: 'Full-stack expert specializing in modern frameworks.', image: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Marcus Thorne', role: 'Strategy Lead', bio: 'Helping brands navigate the digital landscape.', image: 'https://i.pravatar.cc/150?u=marcus' },
    { name: 'Elena Vance', role: 'AI Specialist', bio: 'Integrating machine intelligence into creative workflows.', image: 'https://i.pravatar.cc/150?u=elena' },
  ];

  return (
    <section id="team" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-brand font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Our Team</span>
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">The minds behind the magic.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, idx) => (
            <motion.div 
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="group relative"
            >
              <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden mb-6 border border-white/10">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Social Icons on Hover */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <a href="#" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-brand hover:text-white transition-colors">
                    <Linkedin size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-brand hover:text-white transition-colors">
                    <Twitter size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-brand hover:text-white transition-colors">
                    <Github size={18} />
                  </a>
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold mb-1">{member.name}</h3>
              <p className="text-brand font-medium text-sm mb-3">{member.role}</p>
              <p className="text-zinc-500 text-sm leading-relaxed">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ t, idx }: { t: any, idx: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  // More pronounced parallax movement for the photo
  const y = useTransform(scrollYProgress, [0, 1], [25, -25]);

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        y: -12,
        transition: { duration: 0.4 }
      }}
      className="p-12 rounded-[40px] bg-white/5 border border-white/10 relative group transition-colors hover:border-brand/30"
    >
      <div className="flex gap-1 mb-8">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className="text-brand fill-brand" />
        ))}
      </div>
      <p className="text-2xl font-display font-medium leading-relaxed mb-10 italic text-zinc-200">“{t.quote}”</p>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-brand/30 shadow-[0_0_20px_rgba(255,77,0,0.15)]">
          <motion.img 
            style={{ y }}
            src={t.avatar} 
            alt={t.name} 
            className="absolute -top-6 left-0 w-full h-[160%] object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
            referrerPolicy="no-referrer" 
          />
        </div>
        <div>
          <h4 className="font-bold text-lg text-white">{t.name}</h4>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">{t.role}</p>
        </div>
      </div>
      
      {/* Decorative corner element */}
      <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-30 transition-opacity">
        <Sparkles size={24} className="text-brand" />
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    { name: 'Lena Brooks', role: 'CEO at Nexora', quote: 'They translated our vision into a modern, scalable digital identity — crafted, fast, and ahead of the curve.', avatar: 'https://i.pravatar.cc/150?u=lena' },
    { name: 'David Lin', role: 'Product Lead at Zupitar', quote: 'With design and attention to detail, they improved our product — making it simple, clear, and enjoyable.', avatar: 'https://i.pravatar.cc/150?u=david' },
    { name: 'Uba Micheal', role: 'Founder of Fanoos', quote: 'The team\'s ability to blend creative flair with technical excellence is truly remarkable. Our conversion rates tripled.', avatar: 'https://i.pravatar.cc/150?u=uba' },
  ];

  return (
    <section id="testimonials" className="py-32 bg-zinc-950/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <span className="text-brand font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Testimonials</span>
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">What our partners say.</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={t.name} t={t} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'What services do you offer?', a: 'We offer a full range of creative services including brand strategy, UI/UX design, web development, motion graphics, and AI-driven solutions.' },
    { q: 'How long does development take?', a: 'A typical project takes anywhere from 4 to 12 weeks depending on complexity. We prioritize quality and rapid delivery.' },
    { q: 'Do you provide ongoing support?', a: 'Yes, we offer various support and maintenance plans to ensure your digital product continues to perform at its best.' },
    { q: 'Can I customize the design?', a: 'Absolutely. Every project we undertake is custom-built to match your unique brand identity and goals.' },
    { q: 'Do you offer support after launch?', a: 'We provide 30 days of post-launch support for all projects, with options for long-term partnerships.' },
  ];

  return (
    <section id="faq" className="py-32 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-brand font-bold tracking-[0.3em] uppercase text-sm mb-4 block">FAQ</span>
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">Everything you need to know.</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
              <button 
                className="w-full p-8 flex justify-between items-center text-left hover:bg-white/10 transition-colors"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="text-xl md:text-2xl font-display font-bold">{faq.q}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${openIndex === idx ? 'bg-brand text-white rotate-180' : 'bg-white/10 text-white'}`}>
                  <ChevronDown size={24} />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-8 pt-0 text-lg text-zinc-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="p-20 rounded-[60px] bg-gradient-to-br from-brand to-brand-dark text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-white mb-8 leading-[0.9]">Ready to build <br /> the future?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 font-medium">
              Join the ranks of industry leaders who have transformed their digital presence with Pumpkin Studio.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-12 py-6 rounded-2xl font-bold text-xl transition-all shadow-2xl"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contact" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <span className="text-brand font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Contact Us</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Let's create <br /> something bold.</h2>
            <p className="text-xl text-zinc-400 leading-relaxed mb-12">
              Have a project in mind? We'd love to hear from you. Fill out the form and our team will get back to you within 24 hours.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-lg font-medium">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Mail size={24} />
                </div>
                hello@pumpkin.studio
              </div>
              <div className="flex items-center gap-4 text-lg font-medium">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Globe size={24} />
                </div>
                San Francisco, CA
              </div>
            </div>
          </div>

          <motion.form 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="p-12 rounded-[40px] bg-white/5 border border-white/10 space-y-8"
          >
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-brand transition-colors outline-none" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input type="email" placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-brand transition-colors outline-none" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Message</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-6 text-zinc-500" size={20} />
                <textarea rows={4} placeholder="Tell us about your project..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-brand transition-colors outline-none resize-none" />
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255, 77, 0, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-brand text-white py-5 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all brand-glow"
            >
              Send Message
            </motion.button>
          </motion.form>
        </div>
      </div>
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
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand transition-all">
                <Linkedin size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand transition-all">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20">
            <div>
              <h4 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-8">Navigation</h4>
              <ul className="space-y-4 text-xl font-bold">
                <li><a href="#" className="hover:text-brand transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-brand transition-colors">Features</a></li>
                <li><a href="#team" className="hover:text-brand transition-colors">Team</a></li>
                <li><a href="#contact" className="hover:text-brand transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-8">Company</h4>
              <ul className="space-y-4 text-xl font-bold">
                <li><a href="#" className="hover:text-brand transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 font-mono text-xs tracking-widest uppercase">
          <p>© 2025 Pumpkin Studio. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
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
        <AboutSection />
        <FeaturesSection />
        <ShowcaseSection />
        <TeamSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
