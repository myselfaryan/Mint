"use client";

import React from "react";
import { Vortex } from "./ui/vortex";
import { motion } from "framer-motion";

export function VortexDemo() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={200}
        baseHue={120}
        rangeHue={180}
        baseRadius={2}
        rangeRadius={3}
        baseSpeed={0.2}
        rangeSpeed={1.0}
        className="flex items-center flex-col justify-center px-4 md:px-10 py-4 w-full h-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
            Transform Your Coding Education
          </h1>
          <p className="text-gray-300 text-lg md:text-2xl max-w-3xl mx-auto mb-8">
            Empower your students with intelligent evaluation and collaborative learning tools. 
            Create, manage, and grade coding assignments with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 rounded-full text-white font-medium text-lg shadow-lg hover:shadow-blue-500/25">
              Get Started Free
            </button>
            <button className="px-8 py-4 border border-white/20 hover:bg-white/10 transition-all duration-200 rounded-full text-white font-medium text-lg">
              Watch Demo
            </button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-1">1000+</h3>
              <p className="text-gray-400">Active Users</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-1">50+</h3>
              <p className="text-gray-400">Universities</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-1">10k+</h3>
              <p className="text-gray-400">Assignments</p>
            </div>
          </div>
        </motion.div>
      </Vortex>
    </div>
  );
}
