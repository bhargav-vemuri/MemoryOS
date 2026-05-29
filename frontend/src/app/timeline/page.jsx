"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, Trash2 } from "lucide-react";

export default function TimelinePage() {
  const [timeline, setTimeline] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch timeline from backend, mock if offline
    const fetchTimeline = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/timeline");
        if (res.ok) {
          const data = await res.json();
          setTimeline(data.timeline);
        }
      } catch (err) {
        setTimeline([
          { id: 1, filename: "Q3_Goals.pdf", type: "pdf", date: "2026-05-24T10:00:00Z", status: "completed" },
          { id: 2, filename: "startup_brainstorm.txt", type: "txt", date: "2026-05-22T14:30:00Z", status: "completed" },
          { id: 3, filename: "architecture_diagram.png", type: "image", date: "2026-05-15T09:15:00Z", status: "completed" }
        ]);
      }
    };
    fetchTimeline();
  }, []);

  const handleDelete = async (id) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/file/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        // Remove item from state to hide it instantly
        setTimeline(prev => prev.filter(item => item.id !== id));
      } else {
        console.error("Failed to delete file");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
      <div className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500" />
          Chronological Memory Reconstruction
        </h1>
        <p className="text-zinc-400">Track how your ideas, projects, and activities evolved over time.</p>
      </div>

      <div className="relative border-l border-zinc-800 ml-6 space-y-12 pb-20">
        {timeline.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="relative pl-8"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[5px] top-1 w-[10px] h-[10px] rounded-full bg-blue-500 ring-4 ring-black" />
            
            <div className="glass-panel p-6 rounded-2xl hover:border-blue-500/30 transition-colors group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Clock className="w-4 h-4" />
                  {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full uppercase tracking-wider font-semibold">
                  {item.status}
                </span>
              </div>
              
              <h3 className="text-xl font-medium text-zinc-200 mb-2">{item.filename}</h3>
              <p className="text-sm text-zinc-500 uppercase tracking-wider font-mono">{item.type}</p>

              {/* Delete Button */}
              <button 
                onClick={() => handleDelete(item.id)}
                disabled={isDeleting}
                className="absolute right-6 bottom-6 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 disabled:opacity-50"
                title="Wipe Memory"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
        {timeline.length === 0 && (
          <div className="pl-8 text-zinc-500">No memories in timeline yet.</div>
        )}
      </div>
    </div>
  );
}
