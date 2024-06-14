import { useEffect, useState } from 'react';
import { Image } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

import NoConnection from '@/assets/images/monitor-x.svg';
import { ScreenSize } from '@/types';
import { getBaseUrl } from '@/lib/api.ts';
import { getResolution } from '@/lib/cookie.ts';
import { Head } from '@/components/head.tsx';
import { Menu } from '@/app/desktop/menu';
import { MenuPhone } from '@/app/desktop/menu-phone';

import { Keyboard } from './screen/keyboard';
import { Mouse } from './screen/mouse';
import { VirtualKeyboard } from './virtual-keyboard';

export const Desktop = () => {
  const { t } = useTranslation();
  const isBigScreen = useMediaQuery({ minWidth: 800 });
  const [baseURL, setBaseURL] = useState('');
  const [streamURL, setStreamURL] = useState('');
  const [size, setSize] = useState<ScreenSize>({ width: 1280, height: 720 });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const resolution = getResolution();
    if (resolution?.width && resolution?.height) {
      setSize({ width: resolution.width, height: resolution.height });
    }

    const base = getBaseUrl();

    setBaseURL(`${base}:80`);
    setStreamURL(`${base}:8000/stream`);
  }, []);

  return (
    <>
      <Head title={t('head.desktop')} />

      {/* 菜单栏 */}
      {isBigScreen ? (
        <Menu
          baseURL={baseURL}
          size={size}
          setSize={setSize}
          isKeyboardOpen={isKeyboardOpen}
          setIsKeyboardOpen={setIsKeyboardOpen}
        />
      ) : (
        <MenuPhone
          baseURL={baseURL}
          size={size}
          setSize={setSize}
          isKeyboardOpen={isKeyboardOpen}
          setIsKeyboardOpen={setIsKeyboardOpen}
        />
      )}

      {baseURL && (
        <div
          className="flex h-full w-full items-start justify-center xl:items-center"
          style={{ minWidth: `${size.width}px`, minHeight: `${size.height}px` }}
        >
          <>
            <Image
              id="screen"
              className="block bg-neutral-950"
              width={size.width}
              height={size.height}
              src={`${streamURL}/stream`}
              fallback={NoConnection}
              preview={false}
            />

            {/* 监听键盘鼠标事件 */}
            <Mouse baseURL={baseURL} width={size.width} height={size.height} />
            <Keyboard baseURL={baseURL} />
          </>
          {/*<img*/}
          {/*  className="block bg-neutral-950"*/}
          {/*  src="/src/assets/images/monitor-x.svg"*/}
          {/*  width={size.width}*/}
          {/*  height={size.height}*/}
          {/*  alt="power off"*/}
          {/*/>*/}
        </div>
      )}

      {/* 虚拟键盘 */}
      <VirtualKeyboard
        baseURL={baseURL}
        isBigScreen={isBigScreen}
        isOpen={isKeyboardOpen}
        setIsOpen={setIsKeyboardOpen}
      />
    </>
  );
};
