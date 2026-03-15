import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Filter,
  X,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { api, Project as SupabaseProject } from '../../services/api';
import { useProjects } from '../../hooks/useAdminData';
import { cn } from '../../lib/utils';

const ManageProjects: React.FC = () => {
  const { projects, isLoading, refresh: fetchProjects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<SupabaseProject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    year: new Date().getFullYear().toString(),
    display_id: '',
    image_url: '',
    is_featured: false,
    sort_order: 0
  });

  const handleEdit = (project: SupabaseProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      category: project.category,
      description: project.description,
      year: project.year,
      display_id: project.display_id,
      image_url: project.image_url,
      is_featured: project.is_featured,
      sort_order: project.sort_order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await api.projects.delete(id);
      if (imageUrl) {
        await api.storage.delete('project-images', imageUrl);
      }
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await api.storage.upload('project-images', file);
      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProject) {
        await api.projects.update(editingProject.id, formData);
      } else {
        await api.projects.create(formData);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Projects</h1>
          <p className="text-zinc-500">Manage your portfolio and showcase your best work.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProject(null);
            setFormData({
              title: '',
              category: '',
              description: '',
              year: new Date().getFullYear().toString(),
              display_id: (projects.length + 1).toString().padStart(2, '0'),
              image_url: '',
              is_featured: false,
              sort_order: projects.length
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search projects by title or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-brand/50 transition-all outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="rounded-[40px] bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-zinc-500 font-bold">Project</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-zinc-500 font-bold">Category</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-zinc-500 font-bold">Year</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-zinc-500 font-bold">Status</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-zinc-500 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-brand" size={40} />
                      <p className="text-zinc-500 font-medium">Loading projects...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-zinc-500 font-medium">No projects found.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-zinc-800 overflow-hidden border border-white/5">
                          <img 
                            src={project.image_url || 'https://picsum.photos/seed/placeholder/200/150'} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{project.title}</p>
                          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">ID: {project.display_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
                        {project.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-zinc-400 font-mono">{project.year}</td>
                    <td className="px-8 py-6">
                      {project.is_featured ? (
                        <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs font-bold">Standard</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(project)}
                          className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id, project.image_url)}
                          className="p-2 rounded-xl bg-red-400/5 text-red-400 hover:text-white hover:bg-red-400 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Project Title</label>
                    <input 
                      required
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. Aether Platform"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Category</label>
                    <input 
                      required
                      type="text" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g. Digital Ecosystem"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Briefly describe the project..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Display ID</label>
                    <input 
                      required
                      type="text" 
                      value={formData.display_id}
                      onChange={(e) => setFormData({...formData, display_id: e.target.value})}
                      placeholder="01"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Year</label>
                    <input 
                      required
                      type="text" 
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      placeholder="2024"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sort Order</label>
                    <input 
                      type="number" 
                      value={formData.sort_order}
                      onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Project Image</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                          type="url" 
                          value={formData.image_url}
                          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                          placeholder="Image URL (https://...)"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-brand/50 outline-none transition-all text-sm"
                        />
                      </div>
                      
                      <div className="relative">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="image-upload"
                          className={cn(
                            "flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-white/10 hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer font-bold text-sm",
                            isUploading && "opacity-50 cursor-wait"
                          )}
                        >
                          {isUploading ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Plus size={18} />
                          )}
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                        </label>
                      </div>
                    </div>

                    <div className="aspect-video rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group">
                      {formData.image_url ? (
                        <>
                          <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, image_url: ''})}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                          <ImageIcon size={32} className="mb-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <input 
                    type="checkbox" 
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="w-5 h-5 rounded bg-zinc-800 border-white/10 text-brand focus:ring-brand"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">Feature this project on the homepage</label>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-brand text-white font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                  >
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageProjects;
