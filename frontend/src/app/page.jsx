"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Network, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto mt-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-blue-500/30 text-blue-400">
          <BrainCircuit className="w-5 h-5" />
          <span className="text-sm font-medium tracking-wide uppercase">Digital Memory Reconstruction System</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-transparent">
          Rebuild Your Context. <br/> Retrieve Your Mind.
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Unify your fragmented digital life into a searchable semantic memory layer. 
          Discover patterns, track idea evolution, and never lose context again.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/upload" className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all">
            Initialize Memory
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="glass-panel hover:bg-white/5 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all">
            Access Dashboard
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full mb-20">
        {[
          {
            title: "Semantic Retrieval",
            desc: "Search by meaning, not just keywords. Find exact contexts instantly.",
            icon: <BrainCircuit className="w-8 h-8 text-blue-500" />
          },
          {
            title: "Chronological Reconstruction",
            desc: "Timeline intelligence that maps your activity and obsession cycles.",
            icon: <Clock className="w-8 h-8 text-blue-500" />
          },
          {
            title: "Relationship Mapping",
            desc: "Dynamic graphs connecting your files, thoughts, and projects.",
            icon: <Network className="w-8 h-8 text-blue-500" />
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 + 0.5 }}
            className="glass-panel p-8 rounded-2xl flex flex-col items-start gap-4 hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="p-3 bg-blue-500/10 rounded-xl">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white">{feature.title}</h3>
            <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
