import React, { useEffect, useState } from "react";
import {
  Heart,
  RefreshCw,
  Copy,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// --- Frontend Configurations ---
const API_BASE_URL = import.meta.env.VITE_API_URI; // Deployed URL yahan ayega

const Letter = ({ loading, setLoading }) => {
  const [letter, setLetter] = useState("");
  // const [limit, setLimit] = useState(5);
  const [cardColor, setCardColor] = useState("bg-pink-50");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // fetching msg from backend
  const fetchNewLetter = async () => {
    setLoading(true);
    setError("");
    try {
      // API call to backend
      const response = await axios.post(`${API_BASE_URL}/api/letters/generate`);
      if (response.data.success) {
        console.log("RESPONSE GET SUCCESSFULLY!");
        // console.log("RESPONSE MSG : ", response.data.letter.content);
        setLetter(response.data.letter.content);
        setLoading(false);
      }else {
        throw new Error("AI Generation failed");
      }
    } catch (err) {
      if (err.response && err.response.status === 429) {
        setError("Aaj ki limit puri ho chuki hai!😟. New limit 12:00 AM per renew hogi ⌚. per aap dusro k likhe hue letter ko use kar skte hai 😊.Thank You 💕");
      }
      // console.log("AI Generation Error, fetching from Database backup...");
      try {
        // 2. Agar POST fail hua, toh GET request bhejo DB se random letter lene ke liye
        const backupResponse = await axios.get(`${API_BASE_URL}/api/letters`);
        if (backupResponse.data.success) {
          setLetter(backupResponse.data.letter.content);
          // User ko pata chale ki ye backup hai (Optional)
          // console.log("Loaded from DB backup successfully");
        } else {
          setLetter("Sabse pyare tum 💕. (Fallback)");
        }
      } catch (backupErr) {
        console.error("Backup fetch also failed:", backupErr);
        setError("Network slow hai, par mera pyaar nahi! ❤️");
        setLetter("Dil se dil tak ki baat, hamesha rahegi yaad.");
      } finally {
        setLoading(false);
      }
    }
  };
  // copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // color set
  const colors = [
    "bg-pink-50",
    "bg-red-50",
    "bg-purple-50",
    "bg-rose-100",
    "bg-white",
    "bg-amber-50",
  ];

  useEffect(() => {
    fetchNewLetter();
  }, []);
  return (
    <div
      className={`relative rounded-3xl shadow-2xl overflow-hidden transition-colors duration-500 ${cardColor} border-4 border-white`}
    >
      {/* Heartbeat Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-rose-500 mb-4"
            >
              <Heart size={80} fill="currentColor" />
            </motion.div>
            <p className="text-rose-600 font-medium animate-pulse">
              Soch rha hu 🤔. Plz wait 🫠 ...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter Body */}
      <div className="p-8 min-h-[350px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
            Valentine Special
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCardColor(
                  colors[(colors.indexOf(cardColor) + 1) % colors.length],
                )
              }
              className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-500"
              title="Change Color"
            >
              <Palette size={20} />
            </button>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-500"
              title="Copy Text"
            >
              {copied ? (
                <span className="text-xs font-bold">Copied!</span>
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex-grow">
          <motion.p
            key={letter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-800 text-lg leading-relaxed italic font-serif text-center whitespace-pre-wrap"
          >
            "{letter || "Loading magic..."}"
          </motion.p>
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm mt-4 bg-red-50 p-2 rounded-lg border border-red-100">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => fetchNewLetter()}
            disabled={loading}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all active:scale-95 bg-rose-500 hover:bg-rose-600`}
            // ${
            //   limit <= 0
            //     ? "bg-gray-400 cursor-not-allowed"
            //     : "bg-rose-500 hover:bg-rose-600"
            // }
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            Agla Letter Likho
          </button>

          {/* <div className="flex items-center gap-2 text-rose-400 text-sm font-medium">
            <Info size={14} />
            Aaj ke bache hue chances: {limit} / 5
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Letter;
