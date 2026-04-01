import React, { useState } from 'react';
import { Twitter, Linkedin, Github, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { supabase } from '@/src/lib/supabase';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          alert('You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative pt-32 pb-16 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-96 bg-primary/10 blur-[120px] rounded-full opacity-50" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <ScrollReveal className="space-y-8">
            <a href="#" className="text-3xl font-bold tracking-tighter flex items-center gap-3 group">
              <img src="/src/assets/images/Editors-Room logo.png" alt="Editors Room" className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
            </a>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Empowering startups with premium IT solutions. 
              We build the future of digital experiences with cutting-edge technology.
            </p>
            <div className="flex gap-5">
              {[Twitter, Linkedin, Github, Instagram].map((Icon, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className="w-12 h-12 rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:border-primary hover:text-white hover:scale-110 transition-all duration-500 shadow-2xl"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="space-y-8">
            <h4 className="text-xl font-bold text-foreground mb-8">Services</h4>
            <ul className="space-y-5 text-muted-foreground/60">
              {['Software Development', 'AI & Gen AI', 'Cloud Solutions', 'Cybersecurity', 'Digital Marketing'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-lg hover:text-primary hover:translate-x-2 inline-block transition-all duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.3} className="space-y-8">
            <h4 className="text-xl font-bold text-foreground mb-8">Company</h4>
            <ul className="space-y-5 text-muted-foreground/60">
              {['About Us', 'Our Team', 'Projects', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`/#${item.toLowerCase().replace(' ', '')}`} className="text-lg hover:text-primary hover:translate-x-2 inline-block transition-all duration-300">{item}</a>
                </li>
              ))}
              <li>
                <a href="/login" className="text-lg hover:text-primary hover:translate-x-2 inline-block transition-all duration-300">Admin Login</a>
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.4} className="space-y-8">
            <h4 className="text-xl font-bold text-foreground mb-8">Newsletter</h4>
            <p className="text-muted-foreground mb-8 text-lg">
              Subscribe to our newsletter to get the latest updates and news.
            </p>
            {isSuccess ? (
              <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-center">
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" 
                  required
                  className="w-full h-14 bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-2xl px-6 text-foreground placeholder:text-foreground/20 focus:outline-none focus:bg-foreground/10 focus:border-primary/50 transition-all duration-300"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Join Now'}
                </button>
              </form>
            )}
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.6} y={10} className="pt-10 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground/40">
          <p className="text-lg">© 2026 Editors Room. All rights reserved.</p>
          <div className="flex gap-10">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="text-lg hover:text-foreground transition-colors duration-300">{item}</a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};
