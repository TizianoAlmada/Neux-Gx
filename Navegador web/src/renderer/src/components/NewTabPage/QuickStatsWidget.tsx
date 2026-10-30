import React from 'react';
import { Cpu, Layers, HardDrive } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';

export const QuickStatsWidget: React.FC = () => {
  const { systemMetrics, tabs, setActiveModal } = useBrowserStore();

  const cpuPercent = systemMetrics?.cpuUsagePercent ?? 12;
  const ramPercent = systemMetrics?.ramUsagePercent ?? 45;
  const usedRamGB = ((systemMetrics?.usedRamMB ?? 4000) / 1024).toFixed(1);
  const totalRamGB = ((systemMetrics?.totalRamMB ?? 16000) / 1024).toFixed(0);

  return (
    <div
      onClick={() => {
        soundEngine.playButtonClick();
        setActiveModal('gx-control');
      }}
      onMouseEnter={() => soundEngine.playButtonHover()}
      className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-[#12121a]/80 backdrop-blur-md border border-gray-800 hover:border-[var(--color-primary,#ff0055)] hover:shadow-neon cursor-pointer transition-all duration-200 mt-6 select-none"
      title="Abrir GX Control"
    >
      {/* CPU */}
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-[var(--color-primary,#ff0055)]" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono text-gray-400">CPU</span>
          <span className="text-xs font-mono font-bold text-white">{cpuPercent}%</span>
        </div>
      </div>

      <div className="w-[1px] h-6 bg-gray-800" />

      {/* RAM */}
      <div className="flex items-center gap-2">
        <HardDrive className="w-4 h-4 text-[var(--color-secondary,#00f0ff)]" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono text-gray-400">RAM</span>
          <span className="text-xs font-mono font-bold text-white">
            {usedRamGB} / {totalRamGB} GB ({ramPercent}%)
          </span>
        </div>
      </div>

      <div className="w-[1px] h-6 bg-gray-800" />

      {/* Pestañas activas */}
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-purple-400" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono text-gray-400">Pestañas</span>
          <span className="text-xs font-mono font-bold text-white">{tabs.length} activas</span>
        </div>
      </div>
    </div>
  );
};
