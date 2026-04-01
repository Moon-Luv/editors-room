import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { TimeSlot } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

export const TimeSlotsManagement = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<TimeSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('slot_time', { ascending: true });

    if (error) {
      console.error('Error fetching slots:', error);
    } else {
      setSlots(data || []);
    }
    setLoading(false);
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime) return;

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('time_slots')
      .insert([{ slot_time: newSlotTime, is_active: true }])
      .select();

    if (error) {
      console.error('Error adding slot:', error);
      alert('Failed to add time slot. It might already exist.');
    } else {
      setSlots([...slots, data[0]].sort((a, b) => a.slot_time.localeCompare(b.slot_time)));
      setNewSlotTime('');
      setIsAdding(false);
    }
    setIsSubmitting(false);
  };

  const toggleSlotStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('time_slots')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating slot:', error);
    } else {
      setSlots(slots.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    }
  };

  const handleDeleteClick = (slot: TimeSlot) => {
    setSlotToDelete(slot);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!slotToDelete) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', slotToDelete.id);

    if (error) {
      console.error('Error deleting slot:', error);
      alert('Failed to delete slot. It might be linked to existing bookings.');
    } else {
      setSlots(slots.filter(s => s.id !== slotToDelete.id));
      setIsDeleteDialogOpen(false);
      setSlotToDelete(null);
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Available Time Slots</h2>
          <p className="text-sm text-muted-foreground text-balance max-w-lg">
            Manage the time slots available for clients to book consultations.
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Slot
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))
        ) : slots.length > 0 ? (
          slots.map((slot) => (
            <div 
              key={slot.id} 
              className={`p-4 rounded-xl border transition-all ${
                slot.is_active 
                  ? 'bg-card border-border' 
                  : 'bg-muted/30 border-border opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${slot.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-bold text-lg">{slot.slot_time}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteClick(slot)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {slot.is_active ? 'Active' : 'Inactive'}
                </span>
                <Switch 
                  checked={slot.is_active} 
                  onCheckedChange={() => toggleSlotStatus(slot.id, slot.is_active)}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-card border border-dashed border-border rounded-2xl">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold">No time slots yet</h3>
            <p className="text-muted-foreground">Add your first available time slot to start accepting bookings.</p>
            <Button variant="outline" className="mt-4 border-white/10" onClick={() => setIsAdding(true)}>
              Add Time Slot
            </Button>
          </div>
        )}
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Add New Time Slot</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter the time for the new booking slot (e.g., "10:00 AM" or "14:30").
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSlot} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slot_time">Slot Time</Label>
              <Input 
                id="slot_time"
                placeholder="e.g. 10:00 AM"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="bg-black border-white/10"
                required
                autoFocus
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Time Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-6 h-6" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-4">
              Are you sure you want to delete the time slot <span className="text-foreground font-bold">"{slotToDelete?.slot_time}"</span>? 
              This action cannot be undone and may affect future booking availability.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Slot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
