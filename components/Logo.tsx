'use client';

import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
}

export function Logo({ variant = 'full', className = '' }: LogoProps) {
  const iconImg = <img src="/as.jpg" alt="AETHRA Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover border border-[#d4a847]/50 shadow-[0_0_10px_rgba(212,168,71,0.3)]" />;

  if (variant === 'icon') return <Link href="/" className={`flex items-center justify-center ${className}`}>{iconImg}</Link>;

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {iconImg}
      <div className="flex flex-col leading-none">
        <span className="font-brand text-lg md:text-xl font-bold tracking-wider text-[#f5f0e8]">AETHRA</span>
        <span className="font-brand text-[10px] md:text-xs tracking-[0.3em] text-[#d4a847] font-medium">STREAM</span>
      </div>
    </Link>
  );
}

export function LogoGold() {
  return (
    <div className="flex items-center gap-4">
      <img src="/as.jpg" alt="AETHRA Logo" className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border-2 border-[#d4a847]/50 shadow-[0_0_20px_rgba(212,168,71,0.3)]" />
      <div>
        <span className="font-brand text-2xl md:text-3xl font-bold tracking-wider text-[#f5f0e8] block">AETHRA</span>
        <span className="font-brand text-[10px] md:text-xs tracking-[0.4em] text-[#d4a847] font-medium block -mt-0.5">STREAM</span>
      </div>
    </div>
  );
}
