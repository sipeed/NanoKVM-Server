import { useEffect, useState } from 'react';
import { Affix, Divider } from 'antd';
import clsx from 'clsx';
import { ListCollapseIcon, MenuIcon } from 'lucide-react';

import { ScreenSize } from '@/types';
import { api } from '@/lib/api.ts';

import { Fps } from './fps.tsx';
import { Fullscreen } from './fullscreen.tsx';
import { Keyboard as KeyboardMenu } from './keyboard.tsx';
import { Power } from './power.tsx';
import { Quality } from './quality.tsx';
import { Resolution } from './resolution.tsx';
import { Settings } from './settings.tsx';
import { Storage } from './storage.tsx';

type MenuProps = {
  baseURL: string;
  size: ScreenSize;
  setSize: (size: ScreenSize) => void;
  isKeyboardOpen: boolean;
  setIsKeyboardOpen: (open: boolean) => void;
};

export const Menu = ({ baseURL, size, setSize, isKeyboardOpen, setIsKeyboardOpen }: MenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [fps, setFps] = useState(30);
  const [quality, setQuality] = useState(80);

  // 初始化屏幕参数
  useEffect(() => {
    const screen = `${baseURL}/api/vm/screen`;
    api.post(screen, { type: 'resolution', value: size.height }).then();
    api.post(screen, { type: 'fps', value: fps }).then();
    api.post(screen, { type: 'quality', value: quality }).then();
  }, []);

  return (
    <Affix
      offsetTop={10}
      className={clsx(
        'absolute left-0 right-0 top-[10px] z-[999] mx-auto flex h-[40px] items-center justify-center',
        isMenuOpen ? 'w-[800px]' : 'w-[50px]'
      )}
    >
      {isMenuOpen && baseURL ? (
        <div className="flex h-[40px] w-full items-center justify-center rounded bg-neutral-800">
          <div className="flex h-[30px] select-none items-center px-3">
            <img src="/sipeed.ico" width={18} height={18} alt="sipeed" />
          </div>

          <Resolution baseURL={baseURL} resolution={size.height} setSize={setSize} />
          <Fps baseURL={baseURL} fps={fps} setFps={setFps} />
          <Quality baseURL={baseURL} quality={quality} setQuality={setQuality} />
          <Storage />
          <KeyboardMenu isOpen={isKeyboardOpen} setIsOpen={setIsKeyboardOpen} />

          <Divider type="vertical" />
          <Power baseURL={baseURL} />

          <Divider type="vertical" />
          <Settings />
          <Fullscreen />
          <ListCollapseIcon
            className="cursor-pointer px-3 text-[16px] text-white hover:text-white/80"
            onClick={() => setIsMenuOpen((o) => !o)}
          />
        </div>
      ) : (
        <div
          className="flex h-[30px] w-[50px] items-center justify-center rounded bg-neutral-800/80 text-white hover:bg-neutral-800"
          onClick={() => setIsMenuOpen((o) => !o)}
        >
          <MenuIcon />
        </div>
      )}
    </Affix>
  );
};
