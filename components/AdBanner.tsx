import React from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  return (
    <div
      className={`relative flex min-h-[100px] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 ${className}`}
    >
      <div className="text-center">
        <span className="block text-xs font-bold uppercase tracking-widest opacity-50">Advertisement</span>
        <span className="mt-1 block text-sm italic">Ad Slot: {slot || 'General'}</span>
      </div>
      {/* 
        In production, you would replace this with your ad network's script.
        Example for Google AdSense:
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
             data-ad-slot={slot}
             data-ad-format={format}
             data-full-width-responsive="true"></ins>
      */}
    </div>
  );
}
