import React from 'react';
import { useBrowserStore } from '../../stores/browserStore';
import { WallpaperBackground } from './WallpaperBackground';
import { DigitalClock } from './DigitalClock';
import { SearchWidget } from './SearchWidget';
import { SpeedDial } from './SpeedDial';
import { QuickStatsWidget } from './QuickStatsWidget';

export const NewTabPage: React.FC = () => {
  const { settings } = useBrowserStore();

  const wallpaper = settings?.wallpaper || {
    type: 'preset',
    presetName: 'cyber-grid',
    brightness: 85,
    blur: 0,
    position: 'cover',
    animated: true
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-8 px-4 overflow-y-auto custom-scroll">
      {/* Dynamic Animated Wallpaper */}
      <WallpaperBackground wallpaper={wallpaper} />

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center max-w-4xl my-auto">
        {/* Futuristic Glowing Clock */}
        <DigitalClock />

        {/* Central Search Bar */}
        <SearchWidget />

        {/* Speed Dial / Bookmarks Grid */}
        <SpeedDial />

        {/* GX Quick Status */}
        <QuickStatsWidget />
      </div>

      {/* Footer info */}
      <div className="relative z-10 text-[11px] text-gray-500 font-mono tracking-wider mt-6">
        NEXUS GX • MOTOR CHROMIUM DE ALTO RENDIMIENTO
      </div>
    </div>
  );
};
