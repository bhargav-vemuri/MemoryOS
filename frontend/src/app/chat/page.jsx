"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello. I am MemoryOS. What would you like to recall today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

    try {
      // Create assistant message placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage.content,
          messages: [...messages, userMessage],
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = { ...newMessages[newMessages.length - 1] };
          lastMsg.content += chunkValue;
          newMessages[newMessages.length - 1] = lastMsg;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "Error connecting to the neural memory interface.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] p-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <Bot className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Neural Chat</h1>
          <p className="text-sm text-zinc-400">Query your integrated memories using natural language.</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col relative shadow-2xl shadow-blue-900/10">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-blue-600" : "bg-zinc-800 border border-zinc-700"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "bg-white/5 border border-white/5 text-zinc-200"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 flex-row"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-white/5 border border-white/5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-sm text-zinc-400">Synthesizing...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900/80 border-t border-white/5 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your memories..."
              className="w-full bg-black/40 border border-white/10 rounded-full px-6 py-4 pr-14 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-full transition-colors flex items-center justify-center shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
