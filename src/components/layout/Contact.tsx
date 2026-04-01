import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Section } from './Section';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { SplitText } from '@/src/components/animations/SplitText';
import { supabase } from '@/src/lib/supabase';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  service: z.string().min(1, { message: 'Please select a service.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: values.name,
            email: values.email,
            service: values.service,
            message: values.message,
          },
        ]);

      if (error) throw error;

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Section id="contact" className="relative overflow-hidden">
      <div className="flex flex-col items-center text-center mb-16 relative z-10">
        <ScrollReveal
          delay={0}
          y={10}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md text-xs font-medium mb-6 shadow-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-foreground/80 tracking-wide uppercase">Get in Touch</span>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
        <div className="flex flex-col">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 flex flex-wrap gap-x-4">
            <SplitText text="Let's talk about your" delay={0.1} />
            <span className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 italic">
              <SplitText text="vision." delay={0.4} />
            </span>
          </h2>
          <ScrollReveal delay={0.6} y={20}>
            <p className="text-xl text-muted-foreground mb-16 leading-relaxed">
              Have a project in mind? We'd love to hear from you. 
              Fill out the form and our team will get back to you within 24 hours.
            </p>
          </ScrollReveal>

          <div className="space-y-10">
            {[
              { icon: Mail, title: 'Email Us', value: 'hello@editorsroom.com', color: 'from-blue-500 to-cyan-400' },
              { icon: Phone, title: 'Call Us', value: '+1 (555) 000-0000', color: 'from-purple-500 to-pink-400' },
              { icon: MapPin, title: 'Visit Us', value: '123 Innovation Way, San Francisco, CA', color: 'from-orange-500 to-yellow-400' },
            ].map((item, idx) => (
              <ScrollReveal 
                key={idx}
                delay={0.8 + idx * 0.1}
                x={-30}
                className="flex items-start gap-6 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 flex items-center justify-center text-foreground group-hover:bg-gradient-to-br ${item.color} group-hover:border-transparent group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-2xl`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-foreground mb-1 group-hover:text-primary transition-all duration-500">{item.title}</h4>
                  <p className="text-muted-foreground text-lg">{item.value}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal
          delay={0.4}
          x={50}
          className="glass-card p-10 md:p-14 rounded-[3rem] border-foreground/10 shadow-[0_0_50px_rgba(0,0,0,0.05)] min-h-[600px] flex flex-col justify-center"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      {...register('name')} 
                      className="h-14 rounded-2xl bg-foreground/5 border-foreground/10 text-foreground placeholder:text-foreground/20 focus:bg-foreground/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300" 
                    />
                    {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Email</Label>
                    <Input 
                      id="email" 
                      placeholder="john@example.com" 
                      {...register('email')} 
                      className="h-14 rounded-2xl bg-foreground/5 border-foreground/10 text-foreground placeholder:text-foreground/20 focus:bg-foreground/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300" 
                    />
                    {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="service" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Service Interested In</Label>
                  <div className="relative">
                    <select 
                      id="service"
                      {...register('service')}
                      className="w-full h-14 px-4 rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground focus:outline-none focus:bg-foreground/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-background">Select a service</option>
                      <option value="software" className="bg-background">Software Development</option>
                      <option value="ai" className="bg-background">AI Solutions</option>
                      <option value="cloud" className="bg-background">Cloud Solutions</option>
                      <option value="marketing" className="bg-background">Digital Marketing</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  {errors.service && <p className="text-xs text-red-500 ml-1">{errors.service.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="message" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Tell us about your project..." 
                    className="min-h-[180px] rounded-2xl bg-foreground/5 border-foreground/10 text-foreground placeholder:text-foreground/20 focus:bg-foreground/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none p-5" 
                    {...register('message')} 
                  />
                  {errors.message && <p className="text-xs text-red-500 ml-1">{errors.message.message}</p>}
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 rounded-2xl gap-3 group text-lg font-bold bg-gradient-to-r from-primary to-purple-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message <Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-center space-y-6 py-12"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
                  <CheckCircle className="w-12 h-12 text-primary animate-in zoom-in duration-500" />
                </div>
                <h3 className="text-3xl font-bold text-foreground">Message Sent!</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
                </p>
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  variant="outline" 
                  className="mt-8 rounded-full px-8 h-12 border-foreground/10 hover:bg-foreground/5"
                >
                  Send another message
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollReveal>
      </div>
    </Section>
  );
};
