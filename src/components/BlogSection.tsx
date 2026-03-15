import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Tag, User } from 'lucide-react';
import { api, BlogPost } from '../services/api';
import { cn } from '../lib/utils';

const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.blog.getAll();
        // Only show published posts on the main site
        setPosts(data.filter(p => p.published).slice(0, 3));
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (!isLoading && posts.length === 0) return null;

  return (
    <section id="blog" className="py-32 lg:py-64 relative overflow-hidden bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/5">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-zinc-400 font-medium tracking-widest uppercase text-[10px]">
                Insights & Thoughts
              </span>
            </div>
            <h2 className="text-6xl md:text-8xl font-display font-medium tracking-tight leading-[0.85] text-white">
              Latest from <br />
              <span className="italic font-light text-zinc-500">our blog</span>.
            </h2>
          </div>
          <motion.button
            whileHover={{ x: 10 }}
            className="flex items-center gap-4 text-white hover:text-brand transition-colors group"
          >
            <span className="text-sm font-bold uppercase tracking-widest">View All Articles</span>
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand group-hover:bg-brand transition-all">
              <ArrowRight size={20} />
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[40px] bg-white/5 animate-pulse" />
            ))
          ) : (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col h-full"
              >
                <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden mb-8 border border-white/5">
                  <img 
                    src={post.image_url || `https://picsum.photos/seed/${post.id}/800/500`} 
                    alt={post.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-brand" />
                      {new Date(post.published_at || post.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4 group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                    {post.title}
                  </h3>

                  <p className="text-zinc-500 line-clamp-3 mb-8 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <button className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2 group/btn">
                      Read More
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
