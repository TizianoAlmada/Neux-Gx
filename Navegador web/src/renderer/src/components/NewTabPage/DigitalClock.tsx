import React, { useState, useEffect } from 'react';

export const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dateStr = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col items-center select-none my-4">
      <div className="flex items-baseline font-display font-black text-6xl md:text-7xl tracking-widest text-white drop-shadow-[0_0_25px_var(--glow-color,rgba(255,0,85,0.6))]">
        <span>{hours}</span>
        <span className="text-[var(--color-primary,#ff0055)] animate-pulse mx-1">:</span>
        <span>{minutes}</span>
        <span className="text-xl md:text-2xl font-mono text-[var(--color-secondary,#00f0ff)] ml-3 opacity-90">
          {seconds}
        </span>
      </div>
      <div className="text-xs md:text-sm uppercase tracking-widest text-gray-300 font-mono mt-1 opacity-80">
        {dateStr}
      </div>
    </div>
  );
};
