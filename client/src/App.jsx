import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RefreshCw, Copy, Share2, Palette, Info, Loader2 } from 'lucide-react';

import Letter from './components/Letter';



const App = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen bg-rose-400 flex flex-col items-center justify-center p-4 font-sans selection:bg-rose-200">
      
      {/* Background Hearts Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: `${Math.random() * 100}vw` }}
            animate={{ y: '-10vh' }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
            className="absolute text-white"
          >
            <Heart size={`${Math.random() * 40 + 10}px`} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >
        <header className="text-center mb-6">
          <motion.h1
            className="text-4xl font-bold text-white drop-shadow-lg"
          >
            Love Letter AI 💌
          </motion.h1>
          <p className="text-rose-100 mt-2">A good message for your ❤️ one.</p>
        </header>

        <Letter 
          loading={loading}
          setLoading={setLoading}
        />



        <footer className="mt-8 text-center text-rose-100 text-sm">
          Built with ❤️ for your's loved ones.
          <br />
          © 2026 AI Love Letter. All rights reserved.
        </footer>
      </motion.div>
    </div>
  );
};

export default App;