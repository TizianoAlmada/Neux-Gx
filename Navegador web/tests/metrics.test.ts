import { describe, it, expect } from 'vitest';
import os from 'os';

describe('Nexus GX System Metrics Engine', () => {
  it('should read total and free RAM', () => {
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();
    const totalMB = Math.round(totalBytes / (1024 * 1024));
    const freeMB = Math.round(freeBytes / (1024 * 1024));

    expect(totalMB).toBeGreaterThan(1000);
    expect(freeMB).toBeGreaterThan(0);
    expect(totalMB).toBeGreaterThan(freeMB);
  });

  it('should detect CPU count', () => {
    const cpus = os.cpus();
    expect(cpus.length).toBeGreaterThan(0);
    expect(cpus[0].model).toBeDefined();
  });
});
