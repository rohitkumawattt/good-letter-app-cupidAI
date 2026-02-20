import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Cake,
  Stars,
  Sparkles,
  Sun,
  Moon,
  CloudMoon,
  Plane,
  Frown,
  HeartOff,
  Globe,
  Search,
  ChevronDown ,
  
} from "lucide-react";
import Letter from "./components/Letter";
import axios from "axios";
import { useEffect } from "react";
import { useMemo } from "react";

// Hardcoded HEX values for inline styles to ensure visibility & dynamic updates
const colorMap = {
  rose: { hex: "#f43f5e", lightBg: "#fff1f2" },
  amber: { hex: "#f59e0b", lightBg: "#fffbeb" },
  purple: { hex: "#a855f7", lightBg: "#faf5ff" },
  pink: { hex: "#ec4899", lightBg: "#fdf2f8" },
  blue: { hex: "#3b82f6", lightBg: "#eff6ff" },
  indigo: { hex: "#6366f1", lightBg: "#eef2ff" },
  teal: { hex: "#14b8a6", lightBg: "#f0fdfa" },
  slate: { hex: "#64748b", lightBg: "#f8fafc" },
};

const languages = [
  "Hinglish",
  "Hindi",
  "English",
  "Bengali",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Odia",
  "Malayalam",
  "Punjabi",
  "Assamese",
  "Maithili",
  "Sanskrit",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Korean",
  "Chinese",
  "Arabic",
  "Russian",
  "Portuguese",
  "Italian",
  "Turkish",
  "Vietnamese",
  "Thai",
  "Dutch",
  "Greek",
];

const categories = [
  {
    id: "valentine",
    label: "Valentine",
    icon: <Heart size={18} />,
    color: "rose",
    particle: Heart,
  },
  {
    id: "birthday",
    label: "Birthday",
    icon: <Cake size={18} />,
    color: "amber",
    particle: Cake,
  },
  {
    id: "anniversary",
    label: "Anniversary",
    icon: <Stars size={18} />,
    color: "purple",
    particle: Stars,
  },
  {
    id: "flirty",
    label: "Flirty",
    icon: <Sparkles size={18} />,
    color: "pink",
    particle: Sparkles,
  },
  {
    id: "sorry",
    label: "Sorry",
    icon: <Frown size={18} />,
    color: "blue",
    particle: Frown,
  },
  {
    id: "longdistance",
    label: "Distance",
    icon: <Plane size={18} />,
    color: "indigo",
    particle: Plane,
  },
  {
    id: "daily",
    label: "Morning/Night",
    icon: <CloudMoon size={18} />,
    color: "teal",
    particle: CloudMoon,
  },
  {
    id: "healing",
    label: "Healing",
    icon: <HeartOff size={18} />,
    color: "slate",
    particle: HeartOff,
  },
];

// --- Frontend Configurations ---
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://cupid-ai-xnpm.onrender.com";

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [hoveredLang, setHoveredLang] = useState(null);

  const scrollRef = useRef(null);
  const langRef = useRef(null);

  const fetchLetter = async (
    category = selectedCategory.id,
    lang = selectedLanguage,
  ) => {
    setLoading(true);
    setError("");
    try {
      // API call to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/letters/generate`,
        { category, language: lang },
      );
      if (response.data.success) {
        console.log("RESPONSE GET SUCCESSFULLY!");
        setLetter(response.data.letter.content);
        setLoading(false);
      } else {
        throw new Error("AI Generation failed");
      }
    } catch (err) {
      if (err.response && err.response.status === 429) {
        setError(
          "Aaj ki limit puri ho chuki hai!😟. New limit 12:00 AM per renew hogi ⌚. per aap dusro k likhe hue letter ko use kar skte hai 😊.Thank You 💕",
        );
      }
      // console.log("AI Generation Error, fetching from Database backup...");
      try {
        // 2. Agar POST fail hua, toh GET request bhejo DB se random letter lene ke liye
        const backupResponse = await axios.get(
          `${API_BASE_URL}/api/letters/categoryAndLanguage`,
          {
            params: { category },
          },
        );
        if (backupResponse.data.success) {
          setLetter(backupResponse.data.letter.content);
          // User ko pata chale ki ye backup hai (Optional)
          // console.log("Loaded from DB backup successfully");
        } else {
          throw new Error("Empty DB letter.");
        }
      } catch (backupErr) {
        if (backupErr.response && backupErr.response.status === 404) {
          setError("Network problem ho rhi h. Kuch bhi letters aa rhe h. Sorry.... 😟");
        }
        try {
          const defaultLetter = await axios.get(`${API_BASE_URL}/api/letters/default`);
          setLetter(defaultLetter.data.letter.content);
        } catch (error) {
          setError("main kho gaya hu 😟.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLetter();
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target))
        setIsLangOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Function to handle mouse wheel horizontal scrolling
  const handleWheel = (e) => {
    if (scrollRef.current) {
      if (e.deltaY === 0) return;
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // filter the langauge while searching 
  const filteredLangs = useMemo(() => {
    return languages.filter(l => l.toLowerCase().includes(langSearch.toLowerCase()));
  }, [langSearch]);

  const theme = useMemo(() => {
    const config = colorMap[selectedCategory.color];
    if (darkMode) {
      return {
        bgStyle: { backgroundColor: "#020617" }, // slate-950
        bg: "bg-slate-950",
        card: "bg-slate-900/90 border-slate-800",
        text: "text-slate-100",
        accentColor: config.hex,
        particleOpacity: 0.25,
      };
    }
    return {
      bg: `transition-colors duration-1000`,
      bgStyle: { backgroundColor: config.lightBg },
      card: "bg-white/95 border-white",
      text: "text-slate-800",
      accentColor: config.hex,
      particleOpacity: 0.35,
    };
  }, [selectedCategory, darkMode]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden transition-all duration-1000 ease-in-out`}
      style={theme.bgStyle}
    >
      {/* Dynamic Background Particles */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 pointer-events-none z-0"
        >
          {[...Array(18)].map((_, i) => {
            const ParticleIcon = selectedCategory.particle;
            const startX = i * 5.5 + Math.random() * 5;
            const duration = 12 + (i % 8) * 2;

            return (
              <motion.div
                key={`${selectedCategory.id}-particle-${i}`}
                initial={{
                  y: "110vh",
                  x: `${startX}vw`,
                  rotate: 0,
                  scale: 0.4,
                  opacity: 0,
                }}
                animate={{
                  y: "-20vh",
                  rotate: 360,
                  scale: [0.4, 1.1, 0.6],
                  opacity: [0, theme.particleOpacity, theme.particleOpacity, 0],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.6,
                }}
                className="absolute"
                style={{ color: theme.accentColor }}
              >
                <ParticleIcon
                  size={28 + (i % 5) * 12}
                  strokeWidth={1.5}
                  fill="currentColor"
                  style={{
                    filter: `drop-shadow(0 0 12px ${theme.accentColor}66)`,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Header Section */}
      <div className="z-20 w-full max-w-lg mb-8 flex justify-between items-center px-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-500/30">
            <Heart size={26} fill="currentColor" />
          </div>
          <div>
            <h1
              className={`text-2xl font-black tracking-tight leading-none ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Cupid<span className="text-rose-500">AI</span>
            </h1>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-600" : "text-slate-400"}`}
            >
              Smart Emotions
            </span>
          </div>
        </motion.div>

        
        <div className="flex gap-2">
          {/* Enhanced Searchable Language Selector */}
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm border ${darkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-white'}`}
            >
              <Globe size={14} style={{ color: theme.accentColor }} />
              <span className="max-w-[80px] truncate">{selectedLanguage}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute right-0 mt-3 w-64 rounded-[2rem] shadow-2xl z-50 overflow-hidden border p-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                >
                  <div className="p-2 mb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search 30+ Languages..."
                        className={`w-full pl-9 pr-4 py-3 text-xs rounded-2xl transition-all focus:outline-none focus:ring-2 ${darkMode ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-50 text-slate-600 placeholder:text-slate-400'}`}
                        style={{'--tw-ring-color': `${theme.accentColor}33`}}
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto no-scrollbar pb-2">
                    {filteredLangs.length > 0 ? filteredLangs.map(lang => {
                      const isSelected = selectedLanguage === lang;
                      const isHovered = hoveredLang === lang;
                      return (
                        <button 
                        key={lang}
                        onMouseEnter={() => setHoveredLang(lang)}
                        onMouseLeave={() => setHoveredLang(null)}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setIsLangOpen(false);
                          setLangSearch("");
                          fetchLetter(selectedCategory.id, lang);
                        }}
                        className={`w-full text-left px-5 py-3 text-xs font-bold transition-all rounded-xl mb-1 ${isSelected ? 'text-white shadow-lg' : darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                        style={{
                            backgroundColor: isSelected ? theme.accentColor : (isHovered ? `${theme.accentColor}15` : 'transparent'),
                            color: isSelected ? '#fff' : (isHovered ? theme.accentColor : undefined)
                          }}
                      >
                        {lang}
                      </button>
                      )}) : (
                      <p className="text-center py-4 text-xs text-slate-400 font-medium">No language found 🔍</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-2xl transition-all ${darkMode ? 'bg-slate-900 text-yellow-400 border border-slate-800' : 'bg-white text-slate-600 shadow-sm border-white'} border`}
          >
            {darkMode ? <Sun size={18} fill="currentColor" /> : <Moon size={18} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex gap-3 overflow-x-auto pb-8 no-scrollbar snap-x px-4 cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory.id === cat.id;
            const catHex = colorMap[cat.color].hex;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  fetchLetter(cat.id);
                  // console.log(cat)
                }}
                className={`flex-shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold transition-all border-2 snap-start ${
                  isActive
                    ? "text-white border-transparent shadow-lg scale-105"
                    : darkMode
                      ? "bg-slate-900 border-slate-800 text-slate-500"
                      : "bg-white border-transparent text-slate-400 shadow-sm"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: catHex,
                        boxShadow: `0 10px 15px -3px ${catHex}44`,
                      }
                    : {}
                }
              >
                <span className={isActive ? "animate-bounce" : ""}>
                  {cat.icon}
                </span>
                <span className="text-sm font-black whitespace-nowrap">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* letter conatiner  */}
        <Letter
          loading={loading}
          setLoading={setLoading}
          letter={letter}
          error={error}
          theme={theme}
          selectedCategory={selectedCategory}
          darkMode={darkMode}
          fetchLetter={fetchLetter}
        />
      </motion.div>
      {/* Footer Tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <div
          className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full backdrop-blur-xl border ${darkMode ? "bg-white/5 border-white/10 text-slate-600" : "bg-slate-200/50 border-slate-300/50 text-slate-400"}`}
        >
          <p className="md:text-[11px] text-[8px] font-black uppercase tracking-[0.25em]">
            Built with ❤️ for your's loved ones.
            <br />© 2026 CupidAI. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
