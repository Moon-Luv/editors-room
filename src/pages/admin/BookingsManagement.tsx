import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  User,
  ExternalLink,
  Check,
  X,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/src/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

import { Booking, TimeSlot } from '@/src/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeSlotsManagement } from './TimeSlotsManagement';

export const BookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, time_slot:time_slots(slot_time)')
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: Booking['status']) => {
    setIsUpdating(id);
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      fetchBookings();
    }
    setIsUpdating(null);
  };

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingToDelete.id);

      if (error) {
        throw error;
      }

      fetchBookings();
      setIsDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (error: any) {
      alert('Error deleting booking: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5"><CheckCircle2 className="w-3 h-3" /> Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5"><AlertCircle className="w-3 h-3" /> Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5"><XCircle className="w-3 h-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings & Appointments</h1>
          <p className="text-muted-foreground">Manage client calls, consultations, and service bookings.</p>
        </div>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-muted/50 border border-border p-1">
          <TabsTrigger value="bookings" className="data-active:bg-primary data-active:text-black">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="slots" className="data-active:bg-primary data-active:text-black">
            Time Slots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6 mt-6">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email or company..." 
                className="pl-10 bg-muted/50 border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-muted/50 border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Company</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date & Time</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full"></div></td>
                      </tr>
                    ))
                  ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {booking.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{booking.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {booking.email}</p>
                              <p className="text-xs text-muted-foreground">{booking.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{booking.company}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {booking.booking_date}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {booking.time_slot?.slot_time || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs" disabled={isUpdating === booking.id}>
                                  {isUpdating === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Status'}
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-card border-border text-foreground">
                                <DropdownMenuItem onClick={() => updateStatus(booking.id, 'confirmed')} className="gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Confirm
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(booking.id, 'cancelled')} className="gap-2">
                                  <XCircle className="w-4 h-4 text-rose-500" /> Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(booking.id, 'pending')} className="gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-500" /> Pending
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(booking)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">No bookings found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Placeholder */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
              <p className="text-xs text-muted-foreground">Showing {filteredBookings.length} of {bookings.length} bookings</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-white/5 bg-transparent" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-white/5 bg-transparent" disabled>Next</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="slots" className="mt-6">
          <TimeSlotsManagement />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-rose-500 flex items-center gap-2">
              <Trash2 className="w-6 h-6" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-4">
              Are you sure you want to delete the booking for <span className="text-foreground font-bold">"{bookingToDelete?.name}"</span>? 
              This action cannot be undone and will permanently remove the booking from our records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3 sm:gap-0">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-xl border border-white/5 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper for Select component since I'm using it in multiple places
// Note: Select is already imported at the top
