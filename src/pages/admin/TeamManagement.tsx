import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  User,
  Upload,
  Loader2,
  Github,
  Twitter,
  Linkedin,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/src/lib/supabase';
import { uploadFile, generateUniqueFilePath, deleteFile, extractFilePathFromUrl } from '@/src/lib/storage';
import { motion, AnimatePresence } from 'motion/react';
import { TeamMember } from '@/src/types';
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

export const TeamManagement = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    image_url: '',
    bio: '',
    github_url: '',
    twitter_url: '',
    linkedin_url: '',
    website_url: '',
    sort_order: 0
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching team members:', error);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      const filePath = generateUniqueFilePath(file.name, 'team');
      const publicUrl = await uploadFile('team', filePath, file);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData(member);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    
    setIsDeleting(true);
    try {
      const id = memberToDelete.id;
      console.log('Attempting to delete team member:', id);
      
      if (memberToDelete.image_url) {
        // 2. Extract path and delete from storage
        try {
          const filePath = extractFilePathFromUrl(memberToDelete.image_url, 'team');
          if (filePath) {
            console.log('Deleting file from storage:', filePath);
            await deleteFile('team', filePath);
          }
        } catch (storageError) {
          console.warn('Could not delete file from storage, proceeding with database deletion:', storageError);
        }
      }

      // 3. Delete from database
      console.log('Deleting from database table "team_members" where id =', id);
      const { error, count } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Delete successful, count:', count);

      // 4. Update local state immediately for better UX
      setMembers(prev => prev.filter(m => m.id !== id));
      
      // 5. Refresh from server to be sure
      fetchMembers();
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    } catch (error: any) {
      console.error('Error in handleDelete:', error);
      alert('Error deleting member: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let error;
    if (editingMember) {
      const { error: updateError } = await supabase
        .from('team_members')
        .update(formData)
        .eq('id', editingMember.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('team_members')
        .insert([formData]);
      error = insertError;
    }

    if (error) {
      alert('Error saving member: ' + error.message);
    } else {
      setIsDialogOpen(false);
      setEditingMember(null);
      setFormData({
        name: '',
        role: '',
        image_url: '',
        bio: '',
        github_url: '',
        twitter_url: '',
        linkedin_url: '',
        website_url: '',
        sort_order: 0
      });
      fetchMembers();
    }
    setIsSaving(false);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your agency's talent and experts.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingMember(null);
            setFormData({
              name: '',
              role: '',
              image_url: '',
              bio: '',
              github_url: '',
              twitter_url: '',
              linkedin_url: '',
              website_url: '',
              sort_order: 0
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Member' : 'Add Team Member'}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the details below to {editingMember ? 'update' : 'create'} a team member profile.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role / Title</Label>
                <Input 
                  id="role" 
                  value={formData.role || ''} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Creative Director"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        id="image_url" 
                        value={formData.image_url || ''} 
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="Photo URL..."
                        className="bg-white/5 border-white/10 text-xs"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="member-photo-upload"
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
                          <label htmlFor="member-photo-upload" className="cursor-pointer">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub</Label>
                  <Input 
                    id="github_url" 
                    value={formData.github_url || ''} 
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="URL"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  <Input 
                    id="linkedin_url" 
                    value={formData.linkedin_url || ''} 
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="URL"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input 
                  id="sort_order" 
                  type="number"
                  value={formData.sort_order} 
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingMember ? 'Update Member' : 'Create Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search team members..." 
            className="pl-10 bg-muted/50 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  {member.image_url ? (
                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <User className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full w-10 h-10" onClick={() => handleEdit(member)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold group-hover:text-primary transition-colors">{member.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{member.role}</p>
                  <div className="flex justify-center gap-3 mt-4">
                    {member.github_url && <Github className="w-3.5 h-3.5 text-muted-foreground" />}
                    {member.linkedin_url && <Linkedin className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                      onClick={() => handleDeleteClick(member)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete Member
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <h3 className="text-xl font-bold">No team members found</h3>
              <p className="text-muted-foreground">Add your first team member to get started.</p>
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
              Are you sure you want to delete the team member <span className="text-foreground font-bold">"{memberToDelete?.name}"</span>? 
              This action cannot be undone and will permanently remove the member from our records.
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
                'Delete Member'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
