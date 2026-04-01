import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Star,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/src/lib/supabase';
import { uploadFile, generateUniqueFilePath, deleteFile, extractFilePathFromUrl } from '@/src/lib/storage';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '@/src/types';
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

export const ProjectsManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    category: '',
    image_url: '',
    year: new Date().getFullYear().toString(),
    description: '',
    is_featured: false,
    sort_order: 0,
    display_id: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const filePath = generateUniqueFilePath(file.name, 'projects');
      const publicUrl = await uploadFile('projects', filePath, file);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    try {
      const id = projectToDelete.id;
      console.log('Attempting to delete project:', id);
      
      if (projectToDelete.image_url) {
        // 2. Extract path and delete from storage
        try {
          const filePath = extractFilePathFromUrl(projectToDelete.image_url, 'projects');
          if (filePath) {
            console.log('Deleting file from storage:', filePath);
            await deleteFile('projects', filePath);
          }
        } catch (storageError) {
          console.warn('Could not delete file from storage, proceeding with database deletion:', storageError);
        }
      }

      // 3. Delete from database
      console.log('Deleting from database table "projects" where id =', id);
      const { error, count } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Delete successful, count:', count);

      // 4. Update local state immediately for better UX
      setProjects(prev => prev.filter(p => p.id !== id));
      
      // 5. Refresh from server to be sure
      fetchProjects();
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: any) {
      console.error('Error in handleDelete:', error);
      alert('Error deleting project: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const projectData = {
      ...formData
    };

    let error;
    if (editingProject) {
      const { error: updateError } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editingProject.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('projects')
        .insert([projectData]);
      error = insertError;
    }

    if (error) {
      alert('Error saving project: ' + error.message);
    } else {
      setIsDialogOpen(false);
      setEditingProject(null);
      setFormData({
        title: '',
        category: '',
        image_url: '',
        year: new Date().getFullYear().toString(),
        description: '',
        is_featured: false,
        sort_order: 0,
        display_id: ''
      });
      fetchProjects();
    }
    setIsSaving(false);
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects Management</h1>
          <p className="text-muted-foreground">Manage your portfolio and showcase your best work.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProject(null);
            setFormData({
              title: '',
              category: '',
              image_url: '',
              year: new Date().getFullYear().toString(),
              description: '',
              is_featured: false,
              sort_order: 0,
              display_id: ''
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the details below to {editingProject ? 'update' : 'create'} a project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input 
                  id="title" 
                  value={formData.title || ''} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Nexus Dashboard"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_id">Display ID</Label>
                <Input 
                  id="display_id" 
                  value={formData.display_id || ''} 
                  onChange={(e) => setFormData({ ...formData, display_id: e.target.value })}
                  placeholder="e.g. PRJ-001"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  value={formData.category || ''} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Web Development"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input 
                  id="year" 
                  value={formData.year || ''} 
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g. 2024"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image_url">Project Image</Label>
                <div className="flex flex-col gap-4">
                  {formData.image_url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input 
                        id="image_url" 
                        value={formData.image_url || ''} 
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="Or enter image URL manually..."
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                      <Button 
                        asChild 
                        variant="outline" 
                        className="gap-2 border-white/10 bg-white/5"
                        disabled={isUploading}
                        nativeButton={false}
                      >
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload File
                        </label>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description || ''} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the project..."
                  className="bg-white/5 border-white/10 min-h-[100px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_featured" 
                  checked={!!formData.is_featured} 
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
                  className="border-white/20 data-[state=checked]:bg-primary"
                />
                <Label htmlFor="is_featured">Featured Project</Label>
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
                {editingProject ? 'Update Project' : 'Create Project'}
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
            placeholder="Search projects..." 
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[400px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
              >
                {/* Project Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={project.image_url} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full w-10 h-10" onClick={() => handleEdit(project)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {project.is_featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">{project.category}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">{project.display_id}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => handleDeleteClick(project)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete Project
                      </Button>
                      <span className="text-xs font-mono text-muted-foreground">{project.year}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No projects found</h3>
              <p className="text-muted-foreground">Try adjusting your search or add a new project.</p>
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
              Are you sure you want to delete <span className="text-foreground font-bold">"{projectToDelete?.title}"</span>? 
              This action cannot be undone and will permanently remove the project and its associated image from our records.
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
                'Delete Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
