import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Star,
  Loader2,
  Quote
} from 'lucide-react';
import { api, Testimonial } from '../../services/api';
import { useTestimonials } from '../../hooks/useAdminData';

const ManageTestimonials: React.FC = () => {
  const { testimonials, isLoading, refresh: fetchTestimonials } = useTestimonials();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    content: '',
    avatar_url: '',
    rating: 5,
    sort_order: 0
  });

  const handleEdit = (t: Testimonial) => {
    setEditingTestimonial(t);
    setFormData({
      name: t.name,
      role: t.role,
      company: t.company,
      content: t.content,
      avatar_url: t.avatar_url,
      rating: t.rating,
      sort_order: t.sort_order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.testimonials.delete(id);
      if (imageUrl) {
        await api.storage.delete('testimonials', imageUrl);
      }
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await api.storage.uploadFile('testimonials', file, {
        recordId: editingTestimonial?.id,
        tableName: 'testimonials',
        columnName: 'avatar_url'
      });
      setFormData({ ...formData, avatar_url: publicUrl });
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
      if (editingTestimonial) {
        await api.testimonials.update(editingTestimonial.id, formData);
      } else {
        await api.testimonials.create(formData);
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Testimonials</h1>
          <p className="text-zinc-500">Manage client feedback and social proof.</p>
        </div>
        <button 
          onClick={() => {
            setEditingTestimonial(null);
            setFormData({
              name: '',
              role: '',
              company: '',
              content: '',
              avatar_url: '',
              rating: 5,
              sort_order: testimonials.length
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text" 
          placeholder="Search testimonials..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-brand/50 transition-all outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand" size={40} />
            <p className="text-zinc-500">Loading testimonials...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-500">No testimonials found.</div>
        ) : (
          filteredTestimonials.map((t) => (
            <motion.div 
              layout
              key={t.id}
              className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-brand/20 transition-all group relative"
            >
              <div className="absolute top-8 right-8 text-white/5 group-hover:text-brand/10 transition-colors">
                <Quote size={60} />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden border border-white/5">
                  <img src={t.avatar_url || `https://i.pravatar.cc/150?u=${t.id}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t.name}</h3>
                  <p className="text-zinc-500 text-sm">{t.role} @ {t.company}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < t.rating ? "fill-brand text-brand" : "text-zinc-700"} />
                ))}
              </div>

              <p className="text-zinc-400 italic mb-8 relative z-10">"{t.content}"</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(t)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(t.id, t.avatar_url)}
                  className="flex-1 py-3 rounded-xl bg-red-400/5 text-red-400 hover:text-white hover:bg-red-400 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Client Name</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sarah Johnson" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Role & Company</label>
                    <div className="flex gap-2">
                      <input required type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="CEO" className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all" />
                      <input required type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="TechCorp" className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Testimonial Content</label>
                  <textarea required rows={4} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="What did they say about your work?" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Avatar Image</label>
                    <div className="space-y-4">
                      <input 
                        required 
                        type="url" 
                        value={formData.avatar_url} 
                        onChange={(e) => setFormData({...formData, avatar_url: e.target.value})} 
                        placeholder="Avatar URL (https://...)" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all text-sm" 
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="testimonial-image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="testimonial-image-upload"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-white/10 hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer font-bold text-sm"
                        >
                          {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                          {isUploading ? 'Uploading...' : 'Upload Avatar'}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Rating (1-5)</label>
                    <div className="flex flex-col gap-4">
                      <input required type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all" />
                      <div className="w-full aspect-square max-h-[88px] rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group flex items-center justify-center">
                        {formData.avatar_url ? (
                          <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Plus size={24} className="text-zinc-700" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 rounded-2xl bg-brand text-white font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">{editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageTestimonials;
