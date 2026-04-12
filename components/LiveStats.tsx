'use client';

import React from 'react';
import { Users, Eye, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function LiveStats() {
  const [mounted, setMounted] = React.useState(false);
  const [stats, setStats] = React.useState({
    activeUsers: 132,
    totalViews: 15694,
    toolsUsed: 863,
  });

  // Initialize and persist stats
  React.useEffect(() => {
    setMounted(true);
    const savedStats = localStorage.getItem('pdfgen_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    const interval = setInterval(() => {
      setStats(prev => {
        const newStats = {
          activeUsers: Math.max(120, prev.activeUsers + (Math.random() > 0.5 ? 1 : -1)),
          totalViews: prev.totalViews + Math.floor(Math.random() * 2),
          toolsUsed: prev.toolsUsed + (Math.random() > 0.95 ? 1 : 0),
        };
        localStorage.setItem('pdfgen_stats', JSON.stringify(newStats));
        return newStats;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
      <div key={i} className="h-20 animate-pulse rounded-2xl border border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatItem
        icon={Users}
        label="Active Users"
        value={stats.activeUsers}
        color="text-green-500"
        bgColor="bg-green-500/10"
      />
      <StatItem
        icon={Eye}
        label="Total Views"
        value={stats.totalViews.toLocaleString()}
        color="text-blue-500"
        bgColor="bg-blue-500/10"
      />
      <StatItem
        icon={Zap}
        label="Tools Used"
        value={stats.toolsUsed.toLocaleString()}
        color="text-amber-500"
        bgColor="bg-amber-500/10"
      />
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-2xl border border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/5 p-4 shadow-sm backdrop-blur-sm"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-black uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-black">{value}</p>
      </div>
    </motion.div>
  );
}
