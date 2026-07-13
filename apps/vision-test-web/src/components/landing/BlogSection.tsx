import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';

const blogs = [
  {
    category: "Technology",
    title: "How Neurolens AI is Revolutionizing Web Accessibility",
    date: "Aug 14, 2026",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=60",
    readTime: "5 min read"
  },
  {
    category: "Health",
    title: "The Silent Struggle: Navigating the Digital World with CVD",
    date: "Aug 10, 2026",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=60",
    readTime: "7 min read"
  },
  {
    category: "Updates",
    title: "Mobile App 2.0: AI Voice Assistant Now Understands Medicine Context",
    date: "Aug 02, 2026",
    image: "https://images.unsplash.com/photo-1616422285623-aa30eb07096a?w=600&auto=format&fit=crop&q=60",
    readTime: "4 min read"
  }
];

export const BlogSection: React.FC = () => {
  return (
    <section id="blogs" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight"
            >
              Latest Insights & <span className="text-emerald-600">News</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 font-medium"
            >
              Stay updated with the latest in digital accessibility, AI advancements, and community stories.
            </motion.p>
          </div>
          <motion.a 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            href="#" onClick={(e) => e.preventDefault()}
            className="hidden md:flex items-center gap-2 font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View All Articles <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              <div className="h-48 w-full overflow-hidden relative">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-700">
                  {blog.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                  <Calendar className="w-3.5 h-3.5" /> {blog.date} <span className="mx-1">•</span> {blog.readTime}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  {blog.title}
                </h3>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">
                  Read Article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
