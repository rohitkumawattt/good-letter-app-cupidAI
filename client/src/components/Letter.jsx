import React, { useState } from "react";
import { RefreshCw, Copy, CheckCircle2, Sparkle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const Letter = ({
  loading,
  letter,
  error,
  theme,
  selectedCategory,
  darkMode,
  fetchLetter,
}) => {
  const [copied, setCopied] = useState(false);

  // copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div
      className={`relative rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden border-4 backdrop-blur-3xl transition-all duration-700 ${theme.card}`}
    >
      {/* Card Top Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{ backgroundColor: theme.accentColor }}
      />
      <div className="px-10 pt-10 flex justify-between items-center">
        <div className="flex flex-col">
          <span
            className={`text-[10px] font-black uppercase tracking-[0.3em] ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            Crafting for
          </span>
          <span
            className="text-lg font-black capitalize flex items-center gap-2"
            style={{ color: theme.accentColor }}
          >
            {selectedCategory.label}
            <Sparkle size={18} />
          </span>
        </div>

        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all transform active:scale-95 ${
            copied
              ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
              : darkMode
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* letter content */}
      <div className="p-5 min-h-[360px] flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20"
            >
              {/* Heart Beat Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  filter: [
                    "drop-shadow(0 0 0px transparent)",
                    `drop-shadow(0 0 20px ${theme.accentColor}66)`,
                    "drop-shadow(0 0 0px transparent)",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                style={{ color: theme.accentColor }}
              >
                <Heart size={100} fill="currentColor" strokeWidth={1} />
              </motion.div>
              <p
                className={`mt-10 font-black tracking-widest text-[10px] uppercase ${darkMode ? "text-slate-600" : "text-slate-400"}`}
              >
                Soch rha hu 🤔...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={letter}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <p
                className={`text-2xl md:text-3xl font-serif leading-relaxed italic ${theme.text}`}
              >
                "{letter || "Aapke liye kuch pyaara sa generate kar raha hu..."}
                "
              </p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-5 w-16 h-1 rounded-full opacity-20"
                style={{ backgroundColor: darkMode ? "#fff" : "#334155" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* error msg and button */}
      <div className="px-10 pb-10">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-2xl text-center font-bold"
          >
            {error}
          </motion.div>
        )}

        <button
          onClick={() => fetchLetter()}
          disabled={loading}
          className={`w-full py-5 rounded-[2.2rem] flex items-center justify-center gap-4 font-black text-lg text-white shadow-2xl transition-all transform active:scale-[0.98] disabled:opacity-50`}
          style={{ backgroundColor: theme.accentColor }}
        >
          <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
          Generate Magic
        </button>
      </div>
    </motion.div>
  );
};

export default Letter;
