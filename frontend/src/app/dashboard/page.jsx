"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Activity, Database, Network } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    indexed_memories: 0,
    graph_relationships: 0,
    active_clusters: 0,
    semantic_depth: "0%",
    recent_clusters: ["Initializing System...", "Mapping Concepts..."]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
        <p className="text-zinc-400">Overview of your digital memory and system status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl"><Database className="w-6 h-6 text-blue-500" /></div>
            <h3 className="text-zinc-400 font-medium text-sm">Indexed Memories</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.indexed_memories}</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl"><Network className="w-6 h-6 text-purple-500" /></div>
            <h3 className="text-zinc-400 font-medium text-sm">Graph Relationships</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.graph_relationships}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl"><Activity className="w-6 h-6 text-green-500" /></div>
            <h3 className="text-zinc-400 font-medium text-sm">Active Concepts</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.active_clusters}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl"><BrainCircuit className="w-6 h-6 text-orange-500" /></div>
            <h3 className="text-zinc-400 font-medium text-sm">Semantic Depth</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.semantic_depth}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border-white/5">
          <h2 className="text-xl font-bold text-white mb-6">Recently Extracted Concepts</h2>
          <div className="space-y-4">
            {stats.recent_clusters.map((cluster, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-zinc-200 font-medium">{cluster}</span>
                </div>
                <Link 
                  href={`/search?q=${encodeURIComponent(cluster)}`}
                  className="text-xs text-zinc-400 bg-white/5 hover:bg-blue-600 px-3 py-1.5 rounded cursor-pointer hover:text-white transition-all"
                >
                  View Concept
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-white/5 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="flex flex-col gap-4 flex-1">
            <Link href="/upload" className="w-full py-3 bg-white/5 hover:bg-blue-600 transition-colors rounded-xl text-center text-sm font-semibold text-white border border-white/10 hover:border-transparent">
              Inject New Memory
            </Link>
            <Link href="/search" className="w-full py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl text-center text-sm font-semibold text-white border border-white/10">
              Semantic Search
            </Link>
            <Link href="/graph" className="w-full py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl text-center text-sm font-semibold text-white border border-white/10">
              View Global Graph
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
