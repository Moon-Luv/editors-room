import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  FileText,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  Tag
} from 'lucide-react';
import { api, BlogPost } from '../../services/api';
import { useBlogPosts } from '../../hooks/useAdminData';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

const ManageBlog: React.FC = () => {
  const { posts, isLoading, refresh: fetchPosts } = useBlogPosts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category: 'Design',
    published: false
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      const publicUrl = await api.storage.upload('blog-images', file);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingPost) {
        await api.blog.update(editingPost.id, formData);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        await api.blog.create({
          ...formData,
          author_id: user?.id || '',
          published_at: formData.published ? new Date().toISOString() : undefined
        });
      }
      fetchPosts();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.blog.delete(id);
      if (imageUrl) {
        await api.storage.delete('blog-images', imageUrl);
      }
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image_url: '',
      category: 'Design',
      published: false
    });
    setEditingPost(null);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url,
      category: post.category,
      published: post.published
    });
    setIsModalOpen(true);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Manage Blog</h1>
          <p className="text-zinc-500">Create and edit your agency's articles</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#ff4d00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e64500] transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)]"
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input 
          type="text" 
          placeholder="Search articles by title or category..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#ff4d00] outline-none transition-all"
        />
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#ff4d00] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <motion.div 
              key={post.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:border-[#ff4d00]/50 transition-all"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={post.image_url || 'https://picsum.photos/seed/blog/800/450'} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                    post.published ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
                  )}>
                    {post.published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {post.published ? 'Published' : 'Draft'}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-3">
                  <Tag size={12} className="text-[#ff4d00]" />
                  {post.category}
                  <span className="mx-2">•</span>
                  <Calendar size={12} />
                  {new Date(post.created_at || '').toLocaleDateString()}
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-2 mb-6">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(post)}
                      className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id, post.image_url)}
                      className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600">
                    /{post.slug}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-white">
                  {editingPost ? 'Edit Article' : 'New Article'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-zinc-500 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Title</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ff4d00] outline-none transition-all"
                        placeholder="Article Title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Slug</label>
                      <input 
                        required
                        type="text" 
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ff4d00] outline-none transition-all"
                        placeholder="article-slug"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ff4d00] outline-none transition-all"
                      >
                        <option value="Design">Design</option>
                        <option value="Development">Development</option>
                        <option value="Strategy">Strategy</option>
                        <option value="AI">AI</option>
                        <option value="Agency">Agency</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Excerpt</label>
                      <textarea 
                        required
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ff4d00] outline-none transition-all resize-none"
                        placeholder="Brief summary of the article..."
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Cover Image</label>
                      <div className="aspect-video rounded-2xl border-2 border-dashed border-white/10 overflow-hidden relative group">
                        {formData.image_url ? (
                          <>
                            <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">
                                Change Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                            <Plus size={32} className="text-zinc-500 mb-2" />
                            <span className="text-zinc-500 text-sm font-bold">Upload Cover</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <input 
                        type="checkbox" 
                        id="published"
                        checked={formData.published}
                        onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#ff4d00] focus:ring-[#ff4d00]"
                      />
                      <label htmlFor="published" className="text-white font-bold cursor-pointer">
                        Publish immediately
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Content (Markdown)</label>
                  <textarea 
                    required
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={10}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ff4d00] outline-none transition-all font-mono text-sm"
                    placeholder="# Your article content here..."
                  />
                </div>

                <div className="mt-12 flex gap-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#ff4d00] text-white py-4 rounded-2xl font-bold hover:bg-[#e64500] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {editingPost ? 'Update Article' : 'Create Article'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
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

export default ManageBlog;
