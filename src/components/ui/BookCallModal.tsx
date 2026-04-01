import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Send, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Phone,
  Building,
  User,
  Mail
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { format, addDays, isBefore, startOfToday } from 'date-fns';

import { supabase } from '@/src/lib/supabase';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  company: z.string().min(1, { message: 'Please enter your company name.' }),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TimeSlot {
  id: string;
  slot_time: string;
  is_active: boolean;
}

export const BookCallModal = ({ trigger, open: controlledOpen, onOpenChange: setControlledOpen }: { trigger?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Fetch slots and existing bookings when date changes
  useEffect(() => {
    if (selectedDate) {
      const fetchAvailability = async () => {
        setIsLoadingSlots(true);
        try {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          
          // 1. Fetch all active time slots
          const { data: allSlots, error: slotsError } = await supabase
            .from('time_slots')
            .select('*')
            .eq('is_active', true)
            .order('slot_time', { ascending: true });

          if (slotsError) throw slotsError;

          // 2. Fetch bookings for this date to see which slots are taken
          const { data: existingBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('slot_id')
            .eq('booking_date', formattedDate)
            .not('status', 'eq', 'cancelled');

          if (bookingsError) throw bookingsError;

          setSlots(allSlots || []);
          setBookedSlots(existingBookings?.map(b => b.slot_id) || []);
        } catch (error) {
          console.error('Error fetching availability:', error);
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchAvailability();
    }
  }, [selectedDate]);

  const handleNextStep = () => {
    if (step === 1 && selectedDate) setStep(2);
    else if (step === 2 && selectedSlot) setStep(3);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const formatTime = (timeStr: string) => {
    // timeStr is likely "HH:mm:ss"
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!selectedSlot || !selectedDate) return;

      const bookingData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        slot_id: selectedSlot.id,
        status: 'pending'
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;
      
      setIsSubmitted(true);
      
      setTimeout(() => {
        setOpen(false);
        setTimeout(() => {
          setIsSubmitted(false);
          setStep(1);
          setSelectedDate(undefined);
          setSelectedSlot(null);
          reset();
        }, 500);
      }, 4000);
    } catch (error) {
      console.error('Error booking call:', error);
      alert('Failed to book call. It might have been taken just now. Please try another slot.');
    }
  };

  const steps = [
    { title: 'Select Date', icon: CalendarIcon },
    { title: 'Select Time', icon: Clock },
    { title: 'Your Details', icon: User },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full glass-card p-6 md:p-10 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          {/* Background Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="booking-flow"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Book a Strategy Call</h2>
                      <p className="text-sm text-foreground/50">30-minute discovery session</p>
                    </div>
                  </div>
                  
                  {/* Step Indicator */}
                  <div className="hidden sm:flex items-center gap-2">
                    {steps.map((s, i) => (
                      <React.Fragment key={i}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                          step > i + 1 ? "bg-primary text-primary-foreground" : 
                          step === i + 1 ? "bg-primary/20 text-primary border border-primary/30" : 
                          "bg-foreground/5 text-foreground/30 border border-foreground/10"
                        )}>
                          {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        {i < steps.length - 1 && <div className="w-4 h-[1px] bg-foreground/10" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col md:flex-row gap-8 items-start"
                      >
                        <div className="flex-1 w-full">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary" /> Select a Date
                          </h3>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => isBefore(date, startOfToday())}
                            className="rounded-2xl border border-foreground/10 bg-foreground/5 p-4 w-full"
                          />
                        </div>
                        <div className="w-full md:w-64 space-y-4">
                          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Selected Date</h4>
                            <p className="text-2xl font-bold">
                              {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Pick a date'}
                            </p>
                          </div>
                          <p className="text-sm text-foreground/50 leading-relaxed">
                            Choose a date that works best for you. We'll show available times on the next step.
                          </p>
                          <Button 
                            onClick={handleNextStep} 
                            disabled={!selectedDate}
                            className="w-full h-12 rounded-xl gap-2 group"
                          >
                            Next: Select Time <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> Select a Time Slot
                          </h3>
                          <Badge variant="outline" className="rounded-full px-3 py-1 border-foreground/10">
                            {selectedDate && format(selectedDate, 'EEEE, MMMM dd')}
                          </Badge>
                        </div>

                        {isLoadingSlots ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className="h-12 rounded-xl bg-foreground/5 animate-pulse" />
                            ))}
                          </div>
                        ) : slots.length === 0 ? (
                          <div className="text-center py-12 bg-foreground/5 rounded-2xl border border-dashed border-foreground/10">
                            <p className="text-foreground/50">No available slots for this date.</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[300px] pr-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {slots.map((slot) => {
                                const isBooked = bookedSlots.includes(slot.id);
                                return (
                                  <button
                                    key={slot.id}
                                    disabled={isBooked}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={cn(
                                      "h-12 rounded-xl text-sm font-bold transition-all duration-300 border flex items-center justify-center relative overflow-hidden",
                                      isBooked ? "opacity-30 cursor-not-allowed bg-foreground/5 border-transparent" :
                                      selectedSlot?.id === slot.id ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105 z-10" :
                                      "bg-foreground/5 border-foreground/10 hover:border-primary/50 hover:bg-foreground/10"
                                    )}
                                  >
                                    {formatTime(slot.slot_time)}
                                  </button>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        )}

                        <div className="flex items-center gap-4 pt-4">
                          <Button variant="ghost" onClick={handlePrevStep} className="rounded-xl h-12 px-6">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                          </Button>
                          <Button 
                            onClick={handleNextStep} 
                            disabled={!selectedSlot}
                            className="flex-1 h-12 rounded-xl gap-2 group"
                          >
                            Next: Your Details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Complete Your Booking
                          </h3>
                          <div className="text-right">
                            <p className="text-xs font-bold text-primary uppercase tracking-widest">Selected Time</p>
                            <p className="text-sm font-medium">
                              {selectedDate && format(selectedDate, 'MMM dd')} at {selectedSlot && formatTime(selectedSlot.slot_time)}
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Full Name</Label>
                              <div className="relative">
                                <Input {...register('name')} className="h-11 rounded-xl bg-foreground/5 border-foreground/10 pl-10" placeholder="John Doe" />
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                              </div>
                              {errors.name && <p className="text-[10px] text-red-400 font-bold uppercase">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Email Address</Label>
                              <div className="relative">
                                <Input {...register('email')} className="h-11 rounded-xl bg-foreground/5 border-foreground/10 pl-10" placeholder="john@editorsroom.com" />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                              </div>
                              {errors.email && <p className="text-[10px] text-red-400 font-bold uppercase">{errors.email.message}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Phone Number</Label>
                              <div className="relative">
                                <Input {...register('phone')} className="h-11 rounded-xl bg-foreground/5 border-foreground/10 pl-10" placeholder="+1 (555) 000-0000" />
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                              </div>
                              {errors.phone && <p className="text-[10px] text-red-400 font-bold uppercase">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Company Name</Label>
                              <div className="relative">
                                <Input {...register('company')} className="h-11 rounded-xl bg-foreground/5 border-foreground/10 pl-10" placeholder="Editors Room" />
                                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                              </div>
                              {errors.company && <p className="text-[10px] text-red-400 font-bold uppercase">{errors.company.message}</p>}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Message (Optional)</Label>
                            <Textarea {...register('message')} className="min-h-[80px] rounded-xl bg-foreground/5 border-foreground/10 resize-none" placeholder="Tell us about your project..." />
                          </div>

                          <div className="flex items-center gap-4 pt-4">
                            <Button variant="ghost" type="button" onClick={handlePrevStep} className="rounded-xl h-12 px-6">
                              <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={isSubmitting}
                              className="flex-1 h-12 rounded-xl gap-2 group bg-gradient-to-r from-primary to-purple-600"
                            >
                              {isSubmitting ? 'Scheduling...' : <>Confirm Booking <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 relative z-10"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
                  <CheckCircle className="w-12 h-12 text-primary animate-in zoom-in duration-500" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">Call Scheduled!</h3>
                <p className="text-foreground/60 text-lg max-w-sm mx-auto leading-relaxed">
                  Your strategy call has been successfully booked for <span className="text-foreground font-bold">{selectedDate && format(selectedDate, 'MMM dd')} at {selectedSlot && formatTime(selectedSlot.slot_time)}</span>.
                </p>
                <div className="mt-12 p-6 rounded-2xl bg-foreground/5 border border-foreground/10 text-left max-w-sm mx-auto">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4">What's Next?</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-foreground/80">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Check your inbox for the invite</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground/80">
                      <Video className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Google Meet link is attached</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
