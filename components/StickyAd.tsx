'use client';

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StickyAd() {
  const [isVisible, setIsVisible] = React.useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 z-40 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-800 shadow-2xl md:bottom-8 md:right-8"
        >
          <div className="relative p-4">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-2 top-2 rounded-full bg-gray-100 dark:bg-gray-800 p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:text-white"
            >
              <X size={14} />
            </button>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Sponsored</div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-black dark:text-white font-bold">
                AD
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Try PDFGEN Pro</h4>
                <p className="text-xs text-gray-500 dark:text-white">Get unlimited access to all premium tools.</p>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg bg-black py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800">
              Learn More
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
