'use client';
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';

import { 
  Users, 
  Zap, 
  Palette, 
  Share2, 
  ArrowRight, 
  Github, 
  Twitter,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  gradient?: string;
}

const DevBoardLanding = () => {
  const { scrollY } = useScroll();
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);
  
  // Parallax transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const featuresY = useTransform(scrollY, [200, 800], [0, -50]);
  
  const testimonials : Testimonial[] = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      quote: "DevBoard transformed how our team collaborates. It's like having Notion and Figma in perfect harmony."
    },
    {
      name: "Marcus Rodriguez", 
      role: "Designer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      quote: "The real-time collaboration is seamless. I can sketch ideas while my team adds notes instantly."
    },
    {
      name: "Emily Watson",
      role: "Engineering Lead", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      quote: "Finally, a tool that bridges the gap between visual thinking and structured documentation."
    }
  ];

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-emerald-800 to-violet-900"
          animate={{
            background: [
              'linear-gradient(135deg, #312e81 0%, #065f46 50%, #581c87 100%)',
              'linear-gradient(135deg, #1e1b4b 0%, #047857 50%, #7c2d92 100%)',
              'linear-gradient(135deg, #312e81 0%, #065f46 50%, #581c87 100%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full opacity-20 blur-3xl"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full opacity-20 blur-3xl"
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 60, 0],
            scale: [1, 0.8, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div 
          className="container mx-auto px-6 z-10 grid lg:grid-cols-2 gap-12 items-center"
          style={{ y: heroY }}
        >
          {/* Left Content */}
          <div className="space-y-8">
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span 
                className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Think. Draw.
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Organize. Together.
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-gray-300 max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              A collaborative whiteboard that merges Notion and Excalidraw.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-xl font-semibold text-lg flex items-center gap-2 shadow-2xl"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                className="px-8 py-4 border-2 border-gray-400 rounded-xl font-semibold text-lg relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-emerald-600 opacity-0 group-hover:opacity-20"
                  initial={false}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 0.2 }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-100"
                  style={{ 
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'subtract'
                  }}
                />
                Watch Demo
              </motion.button>
            </motion.div>
          </div>

          {/* Right Mockup */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
              animate={{ 
                y: [0, -10, 0],
                rotateY: [0, 5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 relative overflow-hidden">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-4 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded opacity-60"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    />
                  ))}
                </div>
                
                {/* Animated Cursors */}
                <motion.div
                  className="absolute top-4 left-4 w-4 h-4 bg-indigo-500 rounded-full"
                  animate={{
                    x: [0, 100, 50, 150],
                    y: [0, 50, 100, 25]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute top-8 right-8 w-4 h-4 bg-emerald-500 rounded-full"
                  animate={{
                    x: [0, -80, -40, -120],
                    y: [0, 60, 30, 90]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900" />
        <motion.div 
          className="container mx-auto px-6 relative z-10"
          style={{ y: featuresY }}
        >
          <motion.h2 
            className="text-4xl lg:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Everything you need to collaborate
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Real-time Collaboration",
                description: "Work together seamlessly with live cursors, instant updates, and synchronized editing.",
                color: "from-indigo-500 to-indigo-600",
                bgColor: "bg-indigo-500"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Optimized performance with instant loading and smooth animations for the best experience.",
                color: "from-emerald-500 to-emerald-600", 
                bgColor: "bg-emerald-500"
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Visual & Text",
                description: "Combine freehand drawing, shapes, sticky notes, and rich text in one unified canvas.",
                color: "from-amber-500 to-amber-600",
                bgColor: "bg-amber-500"
              },
              {
                icon: <Share2 className="w-8 h-8" />,
                title: "Easy Sharing",
                description: "Share boards with teammates, export to multiple formats, or embed in your workflow.",
                color: "from-violet-500 to-violet-600",
                bgColor: "bg-violet-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02
                }}
              >
                <motion.div
                  className={`w-16 h-16 ${feature.bgColor}/20 rounded-2xl flex items-center justify-center mb-6 text-white`}
                  whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Collaboration Preview */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            className="text-4xl lg:text-5xl font-bold mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            See what your team sees — instantly
          </motion.h2>

          <motion.div
            className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Avatars */}
            <div className="flex justify-center mb-8 gap-4">
              {[
                "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
              ].map((avatar, index) => (
                <motion.div
                  key={index}
                  className="w-16 h-16 rounded-full overflow-hidden border-4 border-indigo-500"
                  initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <img src={avatar} alt={`User ${index + 1}`} className="w-full h-full object-cover" />
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Demo Area */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl relative overflow-hidden">
              <motion.div
                className="absolute inset-4 border-2 border-dashed border-gray-600 rounded-xl"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Moving Elements */}
              <motion.div
                className="absolute top-8 left-8 w-24 h-16 bg-indigo-500/50 rounded-lg"
                animate={{ 
                  x: [0, 100, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <motion.div
                className="absolute bottom-8 right-8 w-32 h-8 bg-emerald-500/50 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Cursors */}
              <motion.div
                className="absolute w-6 h-6 bg-indigo-500 rounded-full"
                animate={{
                  x: [32, 200, 150, 300],
                  y: [32, 100, 200, 80]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-6 h-6 bg-emerald-500 rounded-full"
                animate={{
                  x: [300, 150, 250, 100],
                  y: [200, 50, 150, 180]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <motion.h2 
            className="text-4xl lg:text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Loved by teams everywhere
          </motion.h2>

          <div className="max-w-4xl mx-auto relative">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={prevTestimonial}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextTestimonial}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                className="bg-gradient-to-br from-indigo-900/50 to-emerald-900/50 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src={testimonials[currentTestimonial]?.avatar}
                  alt={testimonials[currentTestimonial]?.name}
                  className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-indigo-500"
                  whileHover={{ scale: 1.1 }}
                />
                <blockquote className="text-2xl italic mb-6 text-gray-300">
                  "{testimonials[currentTestimonial]?.quote}"
                </blockquote>
                <div>
                  <div className="font-bold text-xl">{testimonials[currentTestimonial]?.name}</div>
                  <div className="text-indigo-400">{testimonials[currentTestimonial]?.role}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-indigo-500' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl"
          animate={{
            x: [0, 200, 0],
            y: [0, -100, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600 rounded-full opacity-20 blur-3xl"
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-600 rounded-full opacity-15 blur-3xl"
          animate={{
            x: [-50, 50, -50],
            y: [-100, 100, -100],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2 
            className="text-5xl lg:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Bring your ideas to life.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Start collaborating today.
            </span>
          </motion.h2>

          <motion.button
            className="px-12 py-6 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-2xl font-bold text-2xl shadow-2xl relative overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            // transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.3)",
                "0 0 40px rgba(99, 102, 241, 0.5)",
                "0 0 20px rgba(99, 102, 241, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-emerald-400 opacity-0 group-hover:opacity-20"
              whileHover={{ opacity: 0.2 }}
            />
            Get Started Free
          </motion.button>

          <motion.p
            className="text-gray-400 mt-6 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            No credit card required.
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center gap-3 mb-6 md:mb-0"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl flex items-center justify-center font-bold text-lg">
                D
              </div>
              <span className="text-xl font-bold">DevBoard</span>
              <span className="text-gray-500 ml-2">© 2025</span>
            </motion.div>

            <div className="flex gap-8">
              {[
                { icon: <FileText className="w-5 h-5" />, label: "Docs", color: "hover:text-indigo-400" },
                { icon: <Github className="w-5 h-5" />, label: "GitHub", color: "hover:text-emerald-400" },
                { icon: <Twitter className="w-5 h-5" />, label: "Twitter", color: "hover:text-violet-400" },
                { icon: <Shield className="w-5 h-5" />, label: "Privacy", color: "hover:text-amber-400" }
              ].map((link, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className={`flex items-center gap-2 text-gray-400 transition-colors ${link.color}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {link.icon}
                  <span className="hidden sm:inline">{link.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DevBoardLanding;