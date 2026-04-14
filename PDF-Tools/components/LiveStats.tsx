'use client';

import React, { useState, useEffect } from 'react';

const stats = [
  { label: 'Files Processed', value: '2.4M+' },
  { label: 'Tools Available', value: '24' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Countries', value: '180+' },
];

export default function LiveStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto px-4 py-8">
      {stats.map((s) => (
        <div key={s.label} className="text-center p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>{s.value}</p>
          <p className="text-xs mt-1 opacity-60">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
