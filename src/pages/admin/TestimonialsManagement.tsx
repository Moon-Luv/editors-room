import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  Check,
  X,
  Quote,
  User,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/src/lib/supabase';
import { uploadFile, generateUniqueFilePath, deleteFile, extractFilePathFromUrl } from '@/src/lib/storage';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial } from '@/src/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    avatar_url: '',
    is_approved: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    // Validate file size (max 2MB for avatars)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      const filePath = generateUniqueFilePath(file.name, 'testimonials');
      const publicUrl = await uploadFile('testimonials', filePath, file);
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData(testimonial);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!testimonialToDelete) return;
    
    setIsDeleting(true);
    try {
      const id = testimonialToDelete.id;
      console.log('Attempting to delete testimonial:', id);
      
      if (testimonialToDelete.avatar_url) {
        // 2. Extract path and delete from storage
        try {
          const filePath = extractFilePathFromUrl(testimonialToDelete.avatar_url, 'testimonials');
          if (filePath) {
            console.log('Deleting file from storage:', filePath);
            await deleteFile('testimonials', filePath);
          }
        } catch (storageError) {
          console.warn('Could not delete file from storage, proceeding with database deletion:', storageError);
        }
      }

      // 3. Delete from database
      console.log('Deleting from database table "testimonials" where id =', id);
      const { error, count } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Delete successful, count:', count);

      // 4. Update local state immediately for better UX
      setTestimonials(prev => prev.filter(t => t.id !== id));
      
      // 5. Refresh from server to be sure
      fetchTestimonials();
      setIsDeleteDialogOpen(false);
      setTestimonialToDelete(null);
    } catch (error: any) {
      console.error('Error in handleDelete:', error);
      alert('Error deleting testimonial: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_approved: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      fetchTestimonials();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let error;
    if (editingTestimonial) {
      const { error: updateError } = await supabase
        .from('testimonials')
        .update(formData)
        .eq('id', editingTestimonial.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert([formData]);
      error = insertError;
    }

    if (error) {
      alert('Error saving testimonial: ' + error.message);
    } else {
      setIsDialogOpen(false);
      setEditingTestimonial(null);
      setFormData({
        name: '',
        role: '',
        company: '',
        content: '',
        rating: 5,
        avatar_url: '',
        is_approved: true
      });
      fetchTestimonials();
    }
    setIsSaving(false);
  };

  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials Management</h1>
          <p className="text-muted-foreground">Manage client feedback and social proof.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTestimonial(null);
            setFormData({
              name: '',
              role: '',
              company: '',
              content: '',
              rating: 5,
              avatar_url: '',
              is_approved: true
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the details below to {editingTestimonial ? 'update' : 'create'} a testimonial.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input 
                  id="name" 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value={formData.role || ''} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. CEO"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    value={formData.company || ''} 
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Nexus Corp"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        id="avatar_url" 
                        value={formData.avatar_url || ''} 
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        placeholder="Avatar URL..."
                        className="bg-white/5 border-white/10 text-xs"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        <Button 
                          asChild 
                          variant="outline" 
                          size="sm"
                          className="gap-2 border-white/10 bg-white/5"
                          disabled={isUploading}
                          nativeButton={false}
                        >
                          <label htmlFor="avatar-upload" className="cursor-pointer">
                            {isUploading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Upload className="w-3 h-3" />
                            )}
                            Upload
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input 
                  id="rating" 
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating} 
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Testimonial Content</Label>
                <Textarea 
                  id="content" 
                  value={formData.content || ''} 
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="What did the client say?"
                  className="bg-white/5 border-white/10 min-h-[100px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_approved" 
                  checked={!!formData.is_approved} 
                  onCheckedChange={(checked) => setFormData({ ...formData, is_approved: !!checked })}
                  className="border-white/20 data-[state=checked]:bg-primary"
                />
                <Label htmlFor="is_approved">Approved & Visible</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search testimonials..." 
            className="pl-10 bg-muted/50 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 border-border bg-muted/50">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[250px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))
          ) : filteredTestimonials.length > 0 ? (
            filteredTestimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-white/5 overflow-hidden">
                      {testimonial.avatar_url ? (
                        <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold group-hover:text-primary transition-colors">{testimonial.name}</h3>
                      <p className="text-xs text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-white" onClick={() => handleEdit(testimonial)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                      onClick={() => handleDeleteClick(testimonial)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-3 h-3", 
                        i < testimonial.rating ? "text-amber-500 fill-amber-500" : "text-white/10"
                      )} 
                    />
                  ))}
                </div>

                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/[0.03] -z-10" />
                  <p className="text-sm text-muted-foreground line-clamp-4 italic">"{testimonial.content}"</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                  <button 
                    onClick={() => toggleApproval(testimonial.id, testimonial.is_approved)}
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                      testimonial.is_approved ? "text-emerald-500 hover:text-emerald-400" : "text-rose-500 hover:text-rose-400"
                    )}
                  >
                    {testimonial.is_approved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {testimonial.is_approved ? 'Approved' : 'Pending'}
                  </button>
                  <span className="text-[10px] font-mono text-muted-foreground">{new Date(testimonial.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No testimonials found</h3>
              <p className="text-muted-foreground">Try adjusting your search or add a new testimonial.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-rose-500 flex items-center gap-2">
              <Trash2 className="w-6 h-6" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-4">
              Are you sure you want to delete the testimonial from <span className="text-foreground font-bold">"{testimonialToDelete?.name}"</span>? 
              This action cannot be undone and will permanently remove the testimonial from our records.
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
                'Delete Testimonial'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
