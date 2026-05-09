'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LogoKey() {
  const [turned, setTurned] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (turned) return;
    setTurned(true);
    setTimeout(() => router.push('/about'), 700);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Turn key"
      className="group relative shrink-0 focus:outline-none"
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
    >
      <Image
        src="/images/lp-logo-black.png"
        alt="LP"
        width={96}
        height={96}
        style={{
          transform: turned ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: turned ? 0.6 : 1,
        }}
        className="select-none opacity-80 transition-opacity group-hover:opacity-100"
      />
    </button>
  );
}
