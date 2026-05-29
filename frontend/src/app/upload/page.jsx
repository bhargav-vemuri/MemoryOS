"use client";

import { useState } from "react";
import { UploadCloud, FileType, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("idle");

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus("idle");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setStatus("success");
        setFile(null);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 -z-10" />
      
      <div className="max-w-2xl w-full glass-panel rounded-3xl p-12 text-center border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -z-10" />
        
        <h2 className="text-3xl font-bold mb-4 text-white">Neural Intake System</h2>
        <p className="text-zinc-400 mb-10">Upload files, PDFs, or images to digitize and index your memory context.</p>

        <div 
          className="border-2 border-dashed border-zinc-700 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all relative group"
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <UploadCloud className="w-16 h-16 text-zinc-500 group-hover:text-blue-400 mb-6 transition-colors" />
          <h3 className="text-xl font-semibold text-zinc-200 mb-2">Drag & Drop or Click to Select</h3>
          <p className="text-sm text-zinc-500">Supports PDF, DOCX, TXT, PNG, JPG</p>
        </div>

        {file && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center justify-between glass-panel p-4 rounded-xl border-blue-500/30"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FileType className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? "Processing..." : "Inject Memory"}
            </button>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-center justify-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Memory successfully assimilated into semantic layer.</span>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-center justify-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Error injecting memory. Backend offline or incompatible format.</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
