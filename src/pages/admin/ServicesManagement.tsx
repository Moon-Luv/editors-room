import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Layers,
  Check,
  X,
  Loader2,
  Code,
  Cloud,
  Shield,
  Cpu,
  Smartphone,
  Globe,
  Database,
  Search as SearchIcon,
  Lightbulb,
  Rocket,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/src/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from '@/src/types';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const iconOptions = [
  { name: 'Code', icon: Code },
  { name: 'Cloud', icon: Cloud },
  { name: 'Shield', icon: Shield },
  { name: 'Cpu', icon: Cpu },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Globe', icon: Globe },
  { name: 'Database', icon: Database },
  { name: 'Search', icon: SearchIcon },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Rocket', icon: Rocket },
  { name: 'TrendingUp', icon: TrendingUp },
];

export const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Service>>({
    title: '',
    description: '',
    icon_name: 'Code',
    category: 'Development',
    sort_order: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    
    setIsDeleting(true);
    try {
      const id = serviceToDelete.id;
      console.log('Attempting to delete service:', id);
      
      const { error, count } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Delete successful, count:', count);

      // Update local state immediately for better UX
      setServices(prev => prev.filter(s => s.id !== id));
      
      fetchServices();
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error: any) {
      console.error('Error in handleDelete:', error);
      alert('Error deleting service: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let error;
    if (editingService) {
      const { error: updateError } = await supabase
        .from('services')
        .update(formData)
        .eq('id', editingService.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('services')
        .insert([formData]);
      error = insertError;
    }

    if (error) {
      alert('Error saving service: ' + error.message);
    } else {
      setIsDialogOpen(false);
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        icon_name: 'Code',
        category: 'Development',
        sort_order: 0
      });
      fetchServices();
    }
    setIsSaving(false);
  };

  const getIcon = (name: string) => {
    const option = iconOptions.find(o => o.name === name);
    return option ? option.icon : Code;
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
          <p className="text-muted-foreground">Define and manage the IT services you offer to clients.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingService(null);
            setFormData({
              title: '',
              description: '',
              icon_name: 'Code',
              category: 'Development',
              sort_order: 0
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the details below to {editingService ? 'update' : 'create'} a service.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input 
                  id="title" 
                  value={formData.title || ''} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cloud Infrastructure"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="AI & Data">AI & Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select 
                  value={formData.icon_name} 
                  onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {iconOptions.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        <div className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          {option.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description || ''} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the service..."
                  className="bg-muted/50 border-border min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input 
                  id="sort_order" 
                  type="number"
                  value={formData.sort_order} 
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingService ? 'Update Service' : 'Create Service'}
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
            placeholder="Search services..." 
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[200px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service) => {
              const Icon = getIcon(service.icon_name);
              return (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-white" onClick={() => handleEdit(service)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(service)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-white/10 text-muted-foreground">
                      {service.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs font-mono text-muted-foreground">Order: {service.sort_order}</span>
                    <span className="text-[10px] font-mono text-muted-foreground opacity-30">{(service.id || '').slice(0, 8)}</span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No services found</h3>
              <p className="text-muted-foreground">Try adjusting your search or add a new service.</p>
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
              Are you sure you want to delete the service <span className="text-foreground font-bold">"{serviceToDelete?.title}"</span>? 
              This action cannot be undone and will permanently remove the service from our records.
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
                'Delete Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
