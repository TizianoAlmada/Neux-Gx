import React from 'react';
import {
  X,
  Cpu,
  HardDrive,
  Zap,
  Moon,
  Flame,
  ShieldAlert,
  Layers,
  Power
} from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';

export const GXControlModal: React.FC = () => {
  const {
    systemMetrics,
    tabs,
    settings,
    updateGXControl,
    suspendTab,
    resumeTab,
    setActiveModal
  } = useBrowserStore();

  const gx = settings?.gxControl || {
    ramLimitEnabled: false,
    ramLimitMB: 2048,
    cpuLimitEnabled: false,
    cpuLimitPercent: 80,
    autoTabSuspendEnabled: true,
    tabIdleTimeoutMinutes: 15,
    profile: 'gaming'
  };

  const cpuPercent = systemMetrics?.cpuUsagePercent ?? 15;
  const ramPercent = systemMetrics?.ramUsagePercent ?? 50;
  const usedRamMB = systemMetrics?.usedRamMB ?? 4096;
  const totalRamMB = systemMetrics?.totalRamMB ?? 16384;

  const handleProfileChange = (profile: 'eco' | 'balanced' | 'gaming') => {
    soundEngine.playButtonClick();
    updateGXControl({ profile });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-[#12121e] border border-[var(--color-border,rgba(255,0,85,0.4))] rounded-2xl w-[680px] max-h-[85vh] shadow-neon p-6 relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[var(--color-primary,#ff0055)] animate-pulse" />
            <h2 className="text-white font-display font-bold text-lg tracking-wider">
              NEXUS <span className="text-[var(--color-primary,#ff0055)]">GX CONTROL</span>
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scroll space-y-6 py-4 flex-1 pr-1">
          {/* Performance Profiles */}
          <div>
            <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Perfil de rendimiento
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* ECO */}
              <button
                type="button"
                onClick={() => handleProfileChange('eco')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  gx.profile === 'eco'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-[#161624] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Moon className="w-5 h-5 mb-1 text-emerald-400" />
                <span className="text-xs font-bold font-mono">ECO SAVER</span>
                <span className="text-[10px] opacity-70">Ahorro máximo de batería</span>
              </button>

              {/* BALANCED */}
              <button
                type="button"
                onClick={() => handleProfileChange('balanced')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  gx.profile === 'balanced'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'bg-[#161624] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-5 h-5 mb-1 text-cyan-400" />
                <span className="text-xs font-bold font-mono">BALANCED</span>
                <span className="text-[10px] opacity-70">Uso equilibrado diario</span>
              </button>

              {/* GAMING ULTRA */}
              <button
                type="button"
                onClick={() => handleProfileChange('gaming')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  gx.profile === 'gaming'
                    ? 'bg-pink-950/40 border-[var(--color-primary,#ff0055)] text-[var(--color-primary,#ff0055)] shadow-neon'
                    : 'bg-[#161624] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Flame className="w-5 h-5 mb-1 text-[var(--color-primary,#ff0055)]" />
                <span className="text-xs font-bold font-mono">ULTRA GAMING</span>
                <span className="text-[10px] opacity-70">Máxima aceleración GPU</span>
              </button>
            </div>
          </div>

          {/* Real System Gauges */}
          <div className="grid grid-cols-2 gap-4">
            {/* CPU Gauge */}
            <div className="bg-[#161624] border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[var(--color-primary,#ff0055)]" />
                  <span className="text-xs font-bold text-white font-mono">USO DE CPU</span>
                </div>
                <span className="text-sm font-bold font-mono text-[var(--color-primary,#ff0055)]">
                  {cpuPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-secondary,#00f0ff)] to-[var(--color-primary,#ff0055)] transition-all duration-300 rounded-full"
                  style={{ width: `${cpuPercent}%` }}
                />
              </div>

              {/* Limiter control */}
              <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gx.cpuLimitEnabled}
                    onChange={(e) => updateGXControl({ cpuLimitEnabled: e.target.checked })}
                    className="accent-[var(--color-primary,#ff0055)]"
                  />
                  <span>Limitar CPU a</span>
                </label>
                <span className="text-xs font-mono text-cyan-400 font-bold">{gx.cpuLimitPercent}%</span>
              </div>
              {gx.cpuLimitEnabled && (
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={gx.cpuLimitPercent}
                  onChange={(e) => updateGXControl({ cpuLimitPercent: Number(e.target.value) })}
                  className="w-full accent-[var(--color-primary,#ff0055)] mt-2"
                />
              )}
            </div>

            {/* RAM Gauge */}
            <div className="bg-[#161624] border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[var(--color-secondary,#00f0ff)]" />
                  <span className="text-xs font-bold text-white font-mono">MEMORIA RAM</span>
                </div>
                <span className="text-sm font-bold font-mono text-[var(--color-secondary,#00f0ff)]">
                  {ramPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-[var(--color-secondary,#00f0ff)] transition-all duration-300 rounded-full"
                  style={{ width: `${ramPercent}%` }}
                />
              </div>

              {/* Limiter control */}
              <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gx.ramLimitEnabled}
                    onChange={(e) => updateGXControl({ ramLimitEnabled: e.target.checked })}
                    className="accent-[var(--color-secondary,#00f0ff)]"
                  />
                  <span>Limitar RAM a</span>
                </label>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {(gx.ramLimitMB / 1024).toFixed(1)} GB
                </span>
              </div>
              {gx.ramLimitEnabled && (
                <input
                  type="range"
                  min="1024"
                  max="16384"
                  step="512"
                  value={gx.ramLimitMB}
                  onChange={(e) => updateGXControl({ ramLimitMB: Number(e.target.value) })}
                  className="w-full accent-[var(--color-secondary,#00f0ff)] mt-2"
                />
              )}
            </div>
          </div>

          {/* Auto Tab Suspension */}
          <div className="bg-[#161624] border border-gray-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    SUSPENSIÓN INTELIGENTE DE PESTAÑAS (RAM SAVER)
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Libera memoria RAM descargando pestañas en segundo plano cuando están inactivas.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={gx.autoTabSuspendEnabled}
                onChange={(e) => updateGXControl({ autoTabSuspendEnabled: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-primary,#ff0055)]"
              />
            </div>

            {gx.autoTabSuspendEnabled && (
              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between gap-4">
                <span className="text-xs text-gray-400">Tiempo de inactividad antes de suspender:</span>
                <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={gx.tabIdleTimeoutMinutes}
                    onChange={(e) => updateGXControl({ tabIdleTimeoutMinutes: Number(e.target.value) })}
                    className="w-full accent-[var(--color-primary,#ff0055)]"
                  />
                  <span className="text-xs font-mono font-bold text-white w-12 text-right">
                    {gx.tabIdleTimeoutMinutes} min
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Per-Tab Process Monitor & Real Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--color-primary,#ff0055)]" />
                Pestañas y procesos activos ({tabs.length})
              </label>
              <span className="text-[10px] text-gray-500 font-mono">
                {systemMetrics?.activeProcessesCount ?? 1} procesos Chromium
              </span>
            </div>

            <div className="bg-[#161624] border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800/60 max-h-48 overflow-y-auto custom-scroll">
              {tabs.map((tab) => {
                const metric = systemMetrics?.tabMetrics?.find(m => m.id === tab.id);
                const memMB = metric?.memoryMB ?? (tab.isSuspended ? 4 : 45);
                const cpu = metric?.cpuPercent ?? 0;

                return (
                  <div
                    key={tab.id}
                    className="flex items-center justify-between px-3 py-2 text-xs hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
                      <span className="truncate text-gray-200 font-medium max-w-[240px]">
                        {tab.title || 'Nueva pestaña'}
                      </span>
                      {tab.isSuspended && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800">
                          Suspendida
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-mono text-gray-400 text-[11px]">
                        {memMB} MB RAM
                      </span>
                      <span className="font-mono text-gray-400 text-[11px] w-12 text-right">
                        {cpu}% CPU
                      </span>

                      {tab.isSuspended ? (
                        <button
                          onClick={() => {
                            soundEngine.playButtonClick();
                            resumeTab(tab.id);
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900 border border-emerald-700 text-[11px]"
                        >
                          Reanudar
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            soundEngine.playButtonClick();
                            suspendTab(tab.id);
                          }}
                          className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 hover:bg-red-950 hover:text-red-400 hover:border-red-800 border border-transparent text-[11px] transition-colors"
                        >
                          Suspender
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
