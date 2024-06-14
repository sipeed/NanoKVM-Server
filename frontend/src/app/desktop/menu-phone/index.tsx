import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { MenuIcon } from 'lucide-react';

import { ScreenSize } from '@/types';
import { api } from '@/lib/api.ts';
import { getFps, getQuality } from '@/lib/cookie.ts';

import { Fps } from './fps';
import { Keyboard } from './keyboard';
import { Power } from './power';
import { Quality } from './quality';
import { Resolution } from './resolution';
import { Settings } from './settings';
import { Storage } from './storage';
import { Terminal } from './terminal';

type MenuPhoneProps = {
  baseURL: string;
  size: ScreenSize;
  setSize: (size: ScreenSize) => void;
  isKeyboardOpen: boolean;
  setIsKeyboardOpen: (open: boolean) => void;
};

export const MenuPhone = ({
  baseURL,
  size,
  setSize,
  isKeyboardOpen,
  setIsKeyboardOpen
}: MenuPhoneProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fps, setFps] = useState(30);
  const [quality, setQuality] = useState(80);

  // 初始化屏幕参数
  useEffect(() => {
    let currentFps = fps;
    let currentQuality = quality;

    const cookieFps = getFps();
    if (cookieFps) {
      currentFps = cookieFps;
      setFps(cookieFps);
    }

    const cookieQuality = getQuality();
    if (cookieQuality) {
      currentQuality = cookieQuality;
      setQuality(cookieQuality);
    }

    const screen = `${baseURL}/api/vm/screen`;
    api.post(screen, { type: 'resolution', value: size.height }).then();
    api.post(screen, { type: 'fps', value: currentFps }).then();
    api.post(screen, { type: 'quality', value: currentQuality }).then();
  }, []);

  return (
    <div className="fixed left-[5px] top-[5px] z-[1000]">
      <div className="sticky left-[5px] top-[5px]">
        <div
          className="mb-1 flex h-[24px] w-[30px] items-center justify-center rounded-sm bg-neutral-800/80 text-white hover:bg-neutral-800"
          onClick={() => setIsMenuOpen((o) => !o)}
        >
          <div className={clsx('h-[20px] w-[20px] transition', { 'rotate-90': isMenuOpen })}>
            <MenuIcon size={20} />
          </div>
        </div>

        {isMenuOpen && baseURL && (
          <div className="flex w-[120px] flex-col space-y-1 rounded-sm bg-neutral-800 p-1">
            <Settings />
            <Resolution baseURL={baseURL} resolution={size.height} setSize={setSize} />
            <Fps baseURL={baseURL} fps={fps} setFps={setFps} />
            <Quality baseURL={baseURL} quality={quality} setQuality={setQuality} />
            <Storage baseURL={baseURL} />
            <Keyboard isOpen={isKeyboardOpen} setIsOpen={setIsKeyboardOpen} />
            <Terminal />

            <Power baseURL={baseURL} />
          </div>
        )}
      </div>
    </div>
  );
};
