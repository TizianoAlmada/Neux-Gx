import React, { useRef, useEffect } from 'react';
import { WallpaperSettings } from '../../../../shared/types';

interface WallpaperBackgroundProps {
  wallpaper: WallpaperSettings;
}

export const WallpaperBackground: React.FC<WallpaperBackgroundProps> = ({ wallpaper }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (wallpaper.type !== 'preset' || !wallpaper.animated) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Matrix rain setup
    const matrixChars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Grid animation setup
    let gridOffset = 0;

    // Stars / particles setup
    const starCount = 120;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.8 + 0.2
    }));

    const render = () => {
      animRef.current = requestAnimationFrame(render);

      const rootStyle = getComputedStyle(document.documentElement);
      const colorPrimary = rootStyle.getPropertyValue('--color-primary').trim() || '#ff0055';
      const colorSecondary = rootStyle.getPropertyValue('--color-secondary').trim() || '#00f0ff';

      if (wallpaper.presetName === 'matrix-rain') {
        ctx.fillStyle = 'rgba(5, 10, 8, 0.1)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00ff66';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      } else if (wallpaper.presetName === 'synth-wave') {
        // Dark retro gradient background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0c0714');
        bgGrad.addColorStop(0.5, '#1e0c2b');
        bgGrad.addColorStop(1, '#050308');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Synthwave Sun
        const sunRadius = Math.min(width, height) * 0.22;
        const sunX = width / 2;
        const sunY = height * 0.55;

        const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
        sunGrad.addColorStop(0, '#ffee55');
        sunGrad.addColorStop(0.5, '#ff0055');
        sunGrad.addColorStop(1, '#9d00ff');

        ctx.save();
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 40;
        ctx.fill();

        // Horizontal scanlines across the sun
        ctx.fillStyle = '#0c0714';
        const numBars = 7;
        for (let i = 0; i < numBars; i++) {
          const barY = sunY + (i / numBars) * sunRadius;
          const barH = 2 + i * 2.5;
          ctx.fillRect(sunX - sunRadius, barY, sunRadius * 2, barH);
        }
        ctx.restore();

        // Stars
        ctx.fillStyle = '#ffffff';
        stars.forEach((s) => {
          ctx.globalAlpha = s.opacity;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      } else {
        // Default: 'cyber-grid' / 'deep-space'
        // Deep background
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0a0a14');
        grad.addColorStop(1, '#050508');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Perspective grid at the bottom
        const horizon = height * 0.55;
        gridOffset = (gridOffset + 0.8) % 40;

        ctx.strokeStyle = colorPrimary;
        ctx.lineWidth = 1;
        ctx.shadowColor = colorPrimary;
        ctx.shadowBlur = 4;

        // Horizontal lines with perspective compression
        for (let y = horizon; y < height; y += 15) {
          const p = (y - horizon) / (height - horizon);
          const py = horizon + Math.pow(p, 1.8) * (height - horizon);
          ctx.globalAlpha = Math.min(0.6, p);
          ctx.beginPath();
          ctx.moveTo(0, py + (gridOffset * p));
          ctx.lineTo(width, py + (gridOffset * p));
          ctx.stroke();
        }

        // Vertical converging lines
        const vCols = 24;
        for (let i = -vCols; i <= vCols * 2; i++) {
          const xBottom = (i / vCols) * width;
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.moveTo(width / 2, horizon);
          ctx.lineTo(xBottom, height);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // Floating ambient stars/particles
        stars.forEach((s) => {
          s.y -= s.speed;
          if (s.y < 0) s.y = height;
          ctx.fillStyle = colorSecondary;
          ctx.shadowColor = colorSecondary;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [wallpaper]);

  const filterStyle = {
    filter: `brightness(${wallpaper.brightness}%) blur(${wallpaper.blur}px)`
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {wallpaper.type === 'preset' && (
        <canvas
          ref={canvasRef}
          style={filterStyle}
          className="w-full h-full object-cover"
        />
      )}

      {(wallpaper.type === 'custom-image' || wallpaper.type === 'custom-gif') && wallpaper.customUrl && (
        <img
          src={wallpaper.customUrl}
          alt="Wallpaper"
          style={filterStyle}
          className="w-full h-full object-cover"
        />
      )}

      {wallpaper.type === 'custom-video' && wallpaper.customUrl && (
        <video
          src={wallpaper.customUrl}
          autoPlay
          loop
          muted
          playsInline
          style={filterStyle}
          className="w-full h-full object-cover"
        />
      )}

      {/* Futuristic subtle vignette overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a0a0f]/40 to-[#0a0a0f]/90" />
    </div>
  );
};
