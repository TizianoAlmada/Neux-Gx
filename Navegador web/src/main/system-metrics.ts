import { app } from 'electron';
import os from 'os';
import { SystemMetrics, TabMetric } from '../shared/types';

export class SystemMetricsManager {
  private lastCpuUsage: { idle: number; total: number } = { idle: 0, total: 0 };

  constructor() {
    this.lastCpuUsage = this.getCpuTimes();
  }

  private getCpuTimes(): { idle: number; total: number } {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    for (const cpu of cpus) {
      idle += cpu.times.idle;
      total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }
    return { idle, total };
  }

  public getSystemCpuPercent(): number {
    const current = this.getCpuTimes();
    const idleDiff = current.idle - this.lastCpuUsage.idle;
    const totalDiff = current.total - this.lastCpuUsage.total;
    this.lastCpuUsage = current;

    if (totalDiff === 0) return 0;
    const usage = 100 - Math.floor((idleDiff / totalDiff) * 100);
    return Math.max(0, Math.min(100, usage));
  }

  public getMetrics(tabPidMap: Map<string, number>): SystemMetrics {
    const totalRamBytes = os.totalmem();
    const freeRamBytes = os.freemem();
    const usedRamBytes = totalRamBytes - freeRamBytes;

    const totalRamMB = Math.round(totalRamBytes / (1024 * 1024));
    const usedRamMB = Math.round(usedRamBytes / (1024 * 1024));
    const freeRamMB = Math.round(freeRamBytes / (1024 * 1024));
    const ramUsagePercent = Math.round((usedRamBytes / totalRamBytes) * 100);

    const appMetrics = app.getAppMetrics();
    const activeProcessesCount = appMetrics.length;

    // Build map of PID -> metrics
    const pidMetricsMap = new Map<number, { cpu: number; memoryMB: number }>();
    for (const p of appMetrics) {
      const memoryMB = Math.round((p.memory.workingSetSize || 0) / 1024);
      const cpu = Math.round(p.cpu.percentCPUUsage || 0);
      pidMetricsMap.set(p.pid, { cpu, memoryMB });
    }

    const tabMetrics: TabMetric[] = [];
    for (const [tabId, pid] of tabPidMap.entries()) {
      const m = pidMetricsMap.get(pid) || { cpu: 0, memoryMB: 15 };
      tabMetrics.push({
        id: tabId,
        pid,
        cpuPercent: m.cpu,
        memoryMB: m.memoryMB
      });
    }

    const cpuUsagePercent = this.getSystemCpuPercent();

    return {
      totalRamMB,
      usedRamMB,
      freeRamMB,
      ramUsagePercent,
      cpuUsagePercent,
      activeProcessesCount,
      tabMetrics
    };
  }
}
