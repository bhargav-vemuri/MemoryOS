"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, BrainCircuit, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="flex-1 flex flex-col p-8 max-w-6xl mx-auto w-full">
      <div className="text-center mb-12 mt-10">
        <h1 className="text-4xl font-bold mb-4 text-white">Semantic Retrieval Layer</h1>
        <p className="text-zinc-400">Query your digital memory based on meaning and context, not just keywords.</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto w-full mb-12">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-blue-500" />
        </div>
        <input
          type="text"
          className="w-full glass-panel border border-zinc-700 rounded-full py-5 pl-16 pr-6 text-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.15)] focus:shadow-[0_0_60px_rgba(59,130,246,0.3)]"
          placeholder="e.g. What was I working on during January related to AI?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="hidden" />
      </form>

      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 text-blue-500">
          <BrainCircuit className="w-12 h-12 animate-pulse mb-4" />
          <p className="text-sm font-medium tracking-widest uppercase">Querying Neural Index...</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto w-full">
          {results.map((result, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="glass-panel p-6 rounded-2xl border-white/5 hover:border-blue-500/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-900 rounded-xl group-hover:bg-blue-500/10 transition-colors">
                  <FileText className="w-6 h-6 text-zinc-400 group-hover:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-blue-400">{result.filename}</h4>
                    <span className="text-xs font-mono text-zinc-500">Sim: {(result.score * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    {result.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {results.length === 0 && query && !isSearching && (
            <div className="text-center text-zinc-500 py-20">
              No matching memory context found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
