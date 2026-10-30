import React, { useRef, useEffect } from 'react';
import { bgmEngine } from '../../services/bgmEngine';

interface AudioVisualizerProps {
  width?: number;
  height?: number;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  width = 240,
  height = 50,
  barCount = 28
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = bgmEngine.getAnalyser();

    const draw = () => {
      animIdRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      const rootStyle = getComputedStyle(document.documentElement);
      const colorPrimary = rootStyle.getPropertyValue('--color-primary').trim() || '#ff0055';
      const colorSecondary = rootStyle.getPropertyValue('--color-secondary').trim() || '#00f0ff';

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, colorPrimary);
      gradient.addColorStop(1, colorSecondary);

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor((i / barCount) * (bufferLength / 2));
          const val = dataArray[index] || 0;
          const barHeight = Math.max(3, (val / 255) * (height - 4));

          ctx.fillStyle = gradient;
          ctx.shadowColor = colorPrimary;
          ctx.shadowBlur = 6;
          ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
        }
      } else {
        // Subtle ambient idle pulse
        const time = Date.now() * 0.003;
        const barWidth = (width / barCount) - 2;
        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(time + i * 0.3) * 0.5 + 0.5;
          const barHeight = Math.max(3, wave * 14);

          ctx.fillStyle = gradient;
          ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
        }
      }
    };

    draw();

    return () => {
      if (animIdRef.current !== null) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [width, height, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg bg-black/30 backdrop-blur-sm"
    />
  );
};
