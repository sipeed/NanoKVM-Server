import { useEffect, useState } from 'react';
import { Divider, Popover } from 'antd';
import { MenuIcon, MonitorIcon, XIcon } from 'lucide-react';

import { ScreenSize } from '@/types';
import { api } from '@/lib/api.ts';
import { getFps, getQuality } from '@/lib/localstorage.ts';
import { Extensions } from '@/app/desktop/menu/extensions.tsx';

import { Fps } from './fps.tsx';
import { Fullscreen } from './fullscreen.tsx';
import { Keyboard } from './keyboard.tsx';
import { Mouse } from './mouse.tsx';
import { Power } from './power.tsx';
import { Quality } from './quality.tsx';
import { Resolution } from './resolution.tsx';
import { Settings } from './settings.tsx';
import { Storage } from './storage.tsx';
import { Terminal } from './terminal';

type MenuProps = {
  baseURL: string;
  size: ScreenSize;
  setSize: (size: ScreenSize) => void;
  isKeyboardOpen: boolean;
  setIsKeyboardOpen: (open: boolean) => void;
  mouseStyle: string;
  setMouseStyle: (style: string) => void;
};

export const Menu = ({
  baseURL,
  size,
  setSize,
  isKeyboardOpen,
  setIsKeyboardOpen,
  mouseStyle,
  setMouseStyle
}: MenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
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
    <div className="fixed left-1/2 top-[10px] z-[1000] -translate-x-1/2">
      <div className="sticky top-[10px]">
        {isMenuOpen && baseURL ? (
          <div className="flex h-[40px] items-center justify-between rounded bg-neutral-800/90">
            <div className="flex h-[30px] select-none items-center px-3">
              <img src="/sipeed.ico" width={18} height={18} alt="sipeed" />
            </div>

            {/* screen menu */}
            <Popover
              content={
                <div className="flex flex-col space-y-1">
                  <Resolution baseURL={baseURL} resolution={size.height} setSize={setSize} />
                  <Fps baseURL={baseURL} fps={fps} setFps={setFps} />
                  <Quality baseURL={baseURL} quality={quality} setQuality={setQuality} />
                </div>
              }
              placement="bottomLeft"
              trigger="click"
            >
              <div className="flex h-[32px] cursor-pointer items-center justify-center rounded px-3 text-neutral-300 hover:bg-neutral-700/80">
                <MonitorIcon size={18} />
              </div>
            </Popover>

            <Keyboard isOpen={isKeyboardOpen} setIsOpen={setIsKeyboardOpen} />
            <Mouse mouseStyle={mouseStyle} setMouseStyle={setMouseStyle} />
            <Divider type="vertical" />

            <Storage baseURL={baseURL} />
            <Terminal />
            <Divider type="vertical" />

            <Power baseURL={baseURL} />
            <Divider type="vertical" />

            <Extensions baseURL={baseURL} />
            <Settings baseURL={baseURL} />
            <Fullscreen />
            <div
              className="mr-2 flex h-[30px] cursor-pointer items-center justify-center space-x-1 rounded px-2 text-white hover:bg-neutral-700"
              onClick={() => setIsMenuOpen((o) => !o)}
            >
              <XIcon size={20} />
            </div>
          </div>
        ) : (
          <div
            className="flex h-[30px] w-[50px] items-center justify-center rounded bg-neutral-800/80 text-white hover:bg-neutral-800"
            onClick={() => setIsMenuOpen((o) => !o)}
          >
            <MenuIcon />
          </div>
        )}
      </div>
    </div>
  );
};
