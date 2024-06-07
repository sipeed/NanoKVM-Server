import { useEffect, useState } from 'react';
import { Image } from 'antd';
import { useTranslation } from 'react-i18next';

import NoConnection from '@/assets/images/monitor-x.svg';
import { ScreenSize } from '@/types';
import { getBaseUrl } from '@/lib/api.ts';
import { Head } from '@/components/head.tsx';
import { Menu } from '@/app/desktop/menu';

import { Keyboard } from './screen/keyboard';
import { Mouse } from './screen/mouse';
import { VirtualKeyboard } from './virtual-keyboard';

export const Desktop = () => {
  const { t } = useTranslation();
  const [baseURL, setBaseURL] = useState('');
  const [streamURL, setStreamURL] = useState('');
  const [size, setSize] = useState<ScreenSize>({ width: 1280, height: 720 });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const base = getBaseUrl();

    setBaseURL(`${base}:80`);
    setStreamURL(`${base}:8000/stream`);
  }, []);

  return (
    <>
      <Head title={t('head.desktop')} />

      {/* 菜单栏 */}
      <Menu
        baseURL={baseURL}
        size={size}
        setSize={setSize}
        isKeyboardOpen={isKeyboardOpen}
        setIsKeyboardOpen={setIsKeyboardOpen}
      />

      {baseURL && (
        <div className="relative flex h-full w-full select-none items-center justify-center">
          {/* 远程桌面 */}
          <Image
            className="cursor-none bg-neutral-950 object-none"
            width={size.width}
            height={size.height}
            src={`${streamURL}/stream`}
            fallback={NoConnection}
            preview={false}
          />

          {/* 键盘鼠标 */}
          <Mouse baseURL={baseURL} width={size.width} height={size.height} />
          <Keyboard baseURL={baseURL} />
        </div>
      )}

      {/* 虚拟键盘 */}
      <VirtualKeyboard baseURL={baseURL} isOpen={isKeyboardOpen} setIsOpen={setIsKeyboardOpen} />
    </>
  );
};
