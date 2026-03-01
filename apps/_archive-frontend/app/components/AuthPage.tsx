import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, User, Github } from 'lucide-react';

const AuthPage = ({ isSignin = true, isSignup = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine current mode
  const mode = isSignin ? 'signin' : 'signup';
  const isSignInMode = mode === 'signin';

  const handleSocialLogin = (provider : string) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Column - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Animated Gradient Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-emerald-600"
          animate={{
            background: [
              'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #059669 100%)',
              'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #10b981 100%)',
              'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #059669 100%)',
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"
          animate={{ 
            y: [0, 40, 0],
            scale: [1, 0.8, 1],
            rotate: [0, -90, -180]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Logo Placeholder */}
            <motion.div 
              className="flex items-center gap-3 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <span className="text-2xl font-bold">D</span>
              </div>
              <span className="text-2xl font-bold">DevBoard</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-5xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-white via-emerald-200 to-indigo-200 bg-clip-text text-transparent">
                DevBoard
              </span>
            </motion.h1>

            {/* Tagline */}
            <AnimatePresence mode="wait">
              <motion.p 
                key={mode}
                className="text-xl text-white/80 leading-relaxed max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                {isSignInMode 
                  ? "Sign in to access your boards and collaborate in real-time."
                  : "Create your account and start collaborating seamlessly."
                }
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-16 h-2 bg-white/20 rounded-full"
                animate={{ 
                  scaleX: [1, 1.5, 1],
                  opacity: [0.2, 0.6, 0.2]
                }}
                transition={{ 
                  duration: 2, 
                  delay: i * 0.2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Column - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        {/* Mobile Branding Header */}
        <motion.div 
          className="lg:hidden absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 p-6 text-white"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="font-bold">D</span>
            </div>
            <span className="text-xl font-bold">DevBoard</span>
          </div>
        </motion.div>

        <motion.div 
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 mt-20 lg:mt-0"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Form Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignInMode ? 'Sign In' : 'Sign Up'}
              </h2>
              <p className="text-gray-600 mb-8">
                {isSignInMode 
                  ? 'Welcome back! Please enter your details.'
                  : 'Create your account to get started.'
                }
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Sign Up Only Fields */}
                {!isSignInMode && (
                  <>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Full name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required={!isSignInMode}
                      />
                    </div>
                    
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Username"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required={!isSignInMode}
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Confirm Password (Sign Up Only) */}
                {!isSignInMode && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      required={!isSignInMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Forgot Password (Sign In Only) */}
            {isSignInMode && (
              <div className="flex justify-end">
                <motion.a
                  href="#"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Forgot password?
                </motion.a>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="button"
              onClick={ () => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 2000);
                // logic to handle form submission
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 25px rgba(79, 70, 229, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <motion.div
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {isSignInMode ? 'Sign In' : 'Create Account'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative bg-white px-4 text-sm text-gray-500">
                or continue with
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
              >
                <Github className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">GitHub</span>
              </motion.button>
            </div>

            {/* Bottom Link */}
            <div className="text-center pt-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={mode}
                  className="text-sm text-gray-600"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {isSignInMode ? "Don't have an account? " : "Already have an account? "}
                  <motion.a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSignInMode ? 'Sign up' : 'Sign in'}
                  </motion.a>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;