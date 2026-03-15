import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  User,
  Loader2,
  Linkedin,
  Twitter
} from 'lucide-react';
import { api, TeamMember } from '../../services/api';
import { useTeam } from '../../hooks/useAdminData';
import { cn } from '../../lib/utils';

const ManageTeam: React.FC = () => {
  const { team, isLoading, refresh: fetchTeam } = useTeam();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    linkedin_url: '',
    twitter_url: '',
    sort_order: 0
  });

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url,
      linkedin_url: member.linkedin_url || '',
      twitter_url: member.twitter_url || '',
      sort_order: member.sort_order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    try {
      await api.team.delete(id);
      if (imageUrl) {
        await api.storage.delete('team-avatars', imageUrl);
      }
      fetchTeam();
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Failed to delete team member.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await api.storage.upload('team-avatars', file);
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
      if (editingMember) {
        await api.team.update(editingMember.id, formData);
      } else {
        await api.team.create(formData);
      }
      setIsModalOpen(false);
      fetchTeam();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Failed to save team member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeam = team.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Team Members</h1>
          <p className="text-zinc-500">Manage the talented individuals behind your agency.</p>
        </div>
        <button 
          onClick={() => {
            setEditingMember(null);
            setFormData({
              name: '',
              role: '',
              bio: '',
              image_url: '',
              linkedin_url: '',
              twitter_url: '',
              sort_order: team.length
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text" 
          placeholder="Search team members..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-brand/50 transition-all outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand" size={40} />
            <p className="text-zinc-500">Loading team...</p>
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-500">No team members found.</div>
        ) : (
          filteredTeam.map((member) => (
            <motion.div 
              layout
              key={member.id}
              className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-brand/20 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 overflow-hidden border border-white/5">
                  <img src={member.image_url || `https://i.pravatar.cc/150?u=${member.id}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-brand text-sm font-medium">{member.role}</p>
                  <div className="flex gap-2 mt-3">
                    {member.linkedin_url && <Linkedin size={14} className="text-zinc-500" />}
                    {member.twitter_url && <Twitter size={14} className="text-zinc-500" />}
                  </div>
                </div>
              </div>
              <p className="text-sm text-zinc-500 line-clamp-3 mb-6">{member.bio}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(member)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(member.id, member.image_url)}
                  className="flex-1 py-2.5 rounded-xl bg-red-400/5 text-red-400 hover:text-white hover:bg-red-400 transition-all flex items-center justify-center gap-2 text-sm font-bold"
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
                <h2 className="text-2xl font-display font-bold">{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Role</label>
                    <input required type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="e.g. Creative Director" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Bio</label>
                  <textarea required rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Short professional bio..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Profile Image</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <input 
                        type="url" 
                        value={formData.image_url} 
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                        placeholder="Image URL (https://...)" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all text-sm" 
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="team-image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="team-image-upload"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-white/10 hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer font-bold text-sm"
                        >
                          {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                        </label>
                      </div>
                    </div>
                    <div className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group">
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
                          <User size={32} className="mb-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">LinkedIn</label>
                    <input type="url" value={formData.linkedin_url} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} placeholder="URL" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Twitter</label>
                    <input type="url" value={formData.twitter_url} onChange={(e) => setFormData({...formData, twitter_url: e.target.value})} placeholder="URL" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-brand/50 outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 rounded-2xl bg-brand text-white font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">{editingMember ? 'Update Member' : 'Create Member'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageTeam;
