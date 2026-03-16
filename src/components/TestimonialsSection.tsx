import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'motion/react';
import { Quote, Star, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { api } from '../services/api';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar_url: string;
  rating: number;
}

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Lena Brooks',
    role: 'CEO',
    company: 'Nexora',
    content: 'Pumpkin Studio didn’t just build a website; they crafted a digital ecosystem that redefined our brand. Their attention to detail and technical prowess is unmatched in the industry.',
    avatar_url: 'https://i.pravatar.cc/150?u=lena',
    rating: 5,
  },
  {
    id: '2',
    name: 'David Lin',
    role: 'Product Lead',
    company: 'Zupitar',
    content: 'The team’s ability to translate complex requirements into intuitive, beautiful interfaces is remarkable. They are true partners in innovation.',
    avatar_url: 'https://i.pravatar.cc/150?u=david',
    rating: 5,
  },
  {
    id: '3',
    name: 'Uba Micheal',
    role: 'Founder',
    company: 'Fanoos',
    content: 'Since launching our new platform, our user engagement has increased by 300%. Pumpkin Studio is the secret weapon every startup needs.',
    avatar_url: 'https://i.pravatar.cc/150?u=uba',
    rating: 5,
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    role: 'Marketing Director',
    company: 'Veloce',
    content: 'Working with Pumpkin was a masterclass in creative collaboration. They pushed our boundaries and delivered a result that far exceeded our expectations.',
    avatar_url: 'https://i.pravatar.cc/150?u=sarahj',
    rating: 5,
  },
];

// Triple for infinite scroll
// This is now handled inside the TestimonialsSection component

const TestimonialCard: React.FC<{ testimonial: Testimonial; index: number }> = ({ testimonial, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Scroll Reveal Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const
      }
    })
  };

  // Word Reveal Variants
  const wordVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: (index % 4) * 0.1 + i * 0.02,
        duration: 0.4,
        ease: "easeOut" as const
      }
    })
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <motion.div
      ref={cardRef}
      custom={index % 4}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02, transition: { duration: 0.4, ease: "easeOut" } }}
      className="relative p-10 md:p-16 rounded-[48px] bg-white/[0.02] border border-white/10 overflow-hidden group flex-shrink-0 w-[320px] md:w-[600px] snap-start hover:shadow-2xl hover:shadow-brand/5 transition-shadow duration-500"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,77,0,0.08), transparent 40%)`
          ),
        }}
      />

      {/* Quote Icon Background */}
      <div className="absolute top-12 right-12 text-white/5 group-hover:text-brand/10 transition-colors duration-700">
        <Quote size={120} strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="flex gap-1 mb-10">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} size={16} className="text-brand fill-brand" />
          ))}
        </div>

        <p className="text-xl md:text-3xl font-display font-medium leading-[1.3] text-white mb-12 tracking-tight">
          {testimonial.content.split(" ").map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </p>

        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-brand/20 p-1">
            <div className="w-full h-full rounded-full overflow-hidden">
              <img
                src={testimonial.avatar_url}
                alt={testimonial.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div>
            <motion.h4 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.1 + 0.5 }}
              className="font-bold text-white text-xl md:text-2xl tracking-tighter"
            >
              {testimonial.name}
            </motion.h4>
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.1 + 0.6 }}
              className="text-zinc-500 text-xs md:text-sm font-mono uppercase tracking-[0.2em]"
            >
              {testimonial.role} <span className="text-brand mx-2">/</span> {testimonial.company}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-[320px] md:w-[600px] p-10 md:p-16 rounded-[48px] bg-white/[0.02] border border-white/10 animate-pulse">
    <div className="flex gap-1 mb-10">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-4 h-4 bg-white/5 rounded-full" />
      ))}
    </div>
    <div className="h-24 w-full bg-white/5 rounded mb-12" />
    <div className="flex items-center gap-6">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5" />
      <div className="space-y-3">
        <div className="h-6 w-32 bg-white/5 rounded" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>
    </div>
  </div>
);

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        console.log('Fetching testimonials from Supabase...');
        const data = await api.testimonials.getAll();
        console.log('Testimonials data received:', data);

        if (data && data.length > 0) {
          const formattedTestimonials: Testimonial[] = data.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            company: t.company,
            content: t.content,
            avatar_url: t.avatar_url,
            rating: t.rating
          }));
          setTestimonials(formattedTestimonials);
        } else {
          console.log('No testimonials found in Supabase, using mock data.');
          setTestimonials(mockTestimonials);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials(mockTestimonials);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials];
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInitialScrollSet, setIsInitialScrollSet] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const updateMaxScroll = () => {
      if (carouselRef.current) {
        const fullWidth = carouselRef.current.scrollWidth;
        const visibleWidth = carouselRef.current.offsetWidth;
        const newMaxScroll = fullWidth - visibleWidth;
        setMaxScroll(newMaxScroll);

        if (!isInitialScrollSet && fullWidth > 0) {
          const singleSetWidth = fullWidth / 3;
          carouselRef.current.scrollLeft = singleSetWidth;
          setScrollX(singleSetWidth);
          setIsInitialScrollSet(true);
        }
      }
    };
    
    updateMaxScroll();
    window.addEventListener('resize', updateMaxScroll);
    return () => window.removeEventListener('resize', updateMaxScroll);
  }, [isInitialScrollSet, isLoading]);

  useEffect(() => {
    if (isPaused || isLoading) return;

    const interval = setInterval(() => {
      handleScroll('right');
    }, 5000); // 5 seconds for testimonials

    return () => clearInterval(interval);
  }, [isPaused, scrollX, maxScroll, isLoading]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current || isLoading) return;
    const cardWidth = window.innerWidth < 768 ? 320 : 600;
    const gap = 32;
    const scrollAmount = cardWidth + gap;
    
    let newScroll = direction === 'left' ? scrollX - scrollAmount : scrollX + scrollAmount;
    
    carouselRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  const onScroll = () => {
    if (!carouselRef.current || isLoading) return;
    const currentScroll = carouselRef.current.scrollLeft;
    const fullWidth = carouselRef.current.scrollWidth;
    const singleSetWidth = fullWidth / 3;

    if (currentScroll >= singleSetWidth * 2) {
      carouselRef.current.scrollLeft = currentScroll - singleSetWidth;
    } else if (currentScroll <= singleSetWidth - carouselRef.current.offsetWidth) {
      if (currentScroll < 10) {
         carouselRef.current.scrollLeft = singleSetWidth;
      }
    }

    setScrollX(carouselRef.current.scrollLeft);
  };

  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => setIsPaused(false);

  return (
    <section id="testimonials" ref={sectionRef} className="py-32 lg:py-64 relative overflow-hidden bg-zinc-950">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-4 mb-8">
              <span className="w-16 h-[1px] bg-brand" />
              <span className="text-brand font-bold tracking-[0.4em] uppercase text-xs">
                Client Stories
              </span>
            </div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-9xl font-display font-bold tracking-tighter leading-[0.8] text-white"
            >
              Voices of <br />
              <span className="text-zinc-600 italic font-light">our partners</span>.
            </motion.h2>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => { handleScroll('left'); handleInteractionStart(); setTimeout(handleInteractionEnd, 5000); }}
              className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
            <button 
              onClick={() => { handleScroll('right'); handleInteractionStart(); setTimeout(handleInteractionEnd, 5000); }}
              className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-brand hover:border-brand transition-all cursor-pointer"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={handleInteractionStart}
          onMouseLeave={handleInteractionEnd}
        >
          <div 
            ref={carouselRef}
            onScroll={onScroll}
            className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TestimonialSkeleton key={i} />
              ))
            ) : (
              extendedTestimonials.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} index={index} />
              ))
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand"
              animate={{ 
                width: maxScroll > 0 ? `${(scrollX / maxScroll) * 100}%` : '0%' 
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            />
          </div>
        </div>

        {/* Trust Bar */}
        <div className="mt-48">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-12 rounded-[40px] border border-white/5 bg-white/[0.01]">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-brand fill-brand" />
                ))}
              </div>
              <p className="text-white font-bold text-xl">4.9/5 Average Rating</p>
              <p className="text-zinc-600 text-sm uppercase tracking-widest">Based on 200+ global projects</p>
            </div>
            
            <div className="h-[1px] w-full md:w-[1px] md:h-20 bg-white/10" />

            <div className="flex flex-wrap justify-center gap-12 md:gap-16 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
              {['Nexora', 'Zupitar', 'Fanoos', 'Veloce'].map((brand) => (
                <span key={brand} className="text-2xl md:text-3xl font-display font-bold text-white tracking-tighter cursor-pointer hover:text-brand transition-colors">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
