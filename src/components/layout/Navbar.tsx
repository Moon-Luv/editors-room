import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Moon, Sun, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/src/context/ThemeContext';
import { cn } from '@/src/lib/utils';
import { BookCallModal } from '@/src/components/ui/BookCallModal';
import { Link, useLocation } from 'react-router-dom';
import logoIcon from '@/src/assets/images/Editors-Room logo.png';

const navItems = [
  { name: 'Services', href: '/#services' },
  { name: 'About', href: '/#about' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Team', href: '/#team' },
  { name: 'Contact', href: '/#contact' },
];

const socialLinks = [
  { icon: Twitter, href: '#' },
  { icon: Github, href: '#' },
  { icon: Linkedin, href: '#' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('/#') && location.pathname === '/') {
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-500',
        scrolled || isOpen
          ? 'bg-background/40 backdrop-blur-xl py-4 border-b border-foreground/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
          : 'bg-transparent py-6 border-b border-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center relative z-[110] group">
          <img
            src={logoIcon}
            alt="Editors Room"
            className="h-16 w-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-300 relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <div className="flex items-center gap-6 border-l border-foreground/10 pl-8 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-all duration-300"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
            </Button>
            <BookCallModal 
              trigger={
                <Button 
                  size="sm" 
                  className="rounded-full px-8 h-11 bg-foreground/10 hover:bg-foreground/20 border border-foreground/20 backdrop-blur-md text-foreground transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-foreground/5"
                >
                  Get Started
                </Button>
              }
            />
          </div>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center gap-4 lg:hidden relative z-[110]">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-foreground/5 border border-foreground/10"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
          </Button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground transition-all duration-300 active:scale-90"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" />
            
            {/* Content Container */}
            <div className="relative h-full flex flex-col pt-32 pb-12 px-8 container mx-auto">
              {/* Background Glows */}
              <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -z-10" />
              <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -z-10" />

              <div className="flex flex-col gap-8 mb-auto">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-2">Navigation</p>
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className="text-4xl sm:text-5xl font-bold text-foreground/70 hover:text-foreground transition-all duration-300 flex items-center justify-between group"
                    >
                      <span className="relative">
                        {item.name}
                        <span className="absolute -bottom-2 left-0 w-0 h-1 bg-primary transition-all duration-300 group-hover:w-full" />
                      </span>
                      <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 text-primary" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 space-y-8">
                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.3em]">Ready to scale?</p>
                  <BookCallModal 
                    trigger={
                      <Button className="w-full h-16 rounded-2xl text-xl font-bold bg-gradient-to-r from-primary to-purple-600 shadow-xl shadow-primary/20 text-white group">
                        Book a Call <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-foreground/10">
                  <div className="flex items-center gap-6">
                    {socialLinks.map((social, i) => (
                      <motion.a
                        key={i}
                        href={social.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary/50 transition-all duration-300"
                      >
                        <social.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-foreground/40">© 2026 Editors Room</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
