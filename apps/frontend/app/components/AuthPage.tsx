"use client";

import { motion } from 'motion/react';
import Link from "next/link";

interface AuthPageProps {
  isSignin?: boolean;
  isSignup?: boolean;
}

export default function AuthPage({ isSignin, isSignup }: AuthPageProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Branding Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-500 to-emerald-500 p-10 text-white">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center lg:text-left"
        >
          <h1 className="text-4xl font-extrabold">Welcome to DevBoard</h1>
          <p className="mt-4 text-lg text-indigo-50">
            {isSignin
              ? "Sign in to access your boards and collaborate in real-time."
              : "Create your account and start collaborating seamlessly."}
          </p>
        </motion.div>
      </div>

      {/* Right Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isSignin ? "Sign In" : "Sign Up"}
          </h2>

          <form className="space-y-5">
            {isSignup && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {isSignup && (
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              {isSignin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-2 text-sm text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Auth */}
          <div className="flex gap-4">
            <button className="flex-1 py-2 border rounded-xl hover:bg-gray-50">
              Google
            </button>
            <button className="flex-1 py-2 border rounded-xl hover:bg-gray-50">
              GitHub
            </button>
          </div>

          {/* Switch Link */}
          <p className="text-sm text-gray-600 mt-6 text-center">
            {isSignin ? (
              <>
                Don’t have an account?{" "}
                <Link href="/signup" className="text-indigo-600 font-medium">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/signin" className="text-indigo-600 font-medium">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
