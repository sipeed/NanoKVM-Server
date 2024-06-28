import { useEffect, useState } from 'react';
import { Image, message, Spin } from 'antd';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import NoConnection from '@/assets/images/monitor-x.svg';
import { ScreenSize } from '@/types';
import { api, getBaseURL } from '@/lib/api.ts';
import { getResolution } from '@/lib/localstorage.ts';
import { Head } from '@/components/head.tsx';
import { Menu } from '@/app/desktop/menu';
import { MenuPhone } from '@/app/desktop/menu-phone';

import { Keyboard } from './screen/keyboard';
import { Mouse } from './screen/mouse';
import { VirtualKeyboard } from './virtual-keyboard';

const client = new W3CWebSocket(`ws://${window.location.hostname}:80/api/ws`);

export const Desktop = () => {
  const { t } = useTranslation();
  const isBigScreen = useMediaQuery({ minWidth: 800 });
  const [messageApi, contextHolder] = message.useMessage();

  const [isUpdating, setIsUpdating] = useState(false);
  const [baseURL, setBaseURL] = useState('');
  const [size, setSize] = useState<ScreenSize>({ width: 1280, height: 720 });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [mouseStyle, setMouseStyle] = useState('cursor-default');

  useEffect(() => {
    const base = getBaseURL();
    setBaseURL(base);

    checkLibmaixcam(base);

    const resolution = getResolution();
    if (resolution?.width && resolution?.height) {
      setSize({ width: resolution.width, height: resolution.height });
    }
  }, []);

  // 检查 libmaixcam 库
  function checkLibmaixcam(base: string) {
    api.get(`${base}/api/firmware/libmaixcam`).then((rsp: any) => {
      if (rsp.code !== 0) {
        messageApi.open({
          type: 'warning',
          content: t('checkLibFailed'),
          duration: 10,
          className: 'check-class',
          style: {
            marginTop: '8vh'
          }
        });
        return;
      }

      if (rsp.data.exist) {
        return;
      }

      updateLibmaixcam(base);
    });
  }

  // 更新 libmaixcam 库
  function updateLibmaixcam(base: string) {
    setIsUpdating(true);
    api
      .post(`${base}/api/firmware/libmaixcam/update`)
      .then((rsp: any) => {
        if (rsp.code !== 0) {
          messageApi.open({
            type: 'warning',
            content: t('updateLibFailed'),
            duration: 10,
            className: 'update-class',
            style: {
              marginTop: '8vh'
            }
          });
          return;
        }

        setTimeout(() => {
          window.location.reload();
        }, 10000);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }

  return (
    <>
      {contextHolder}
      <Spin spinning={isUpdating} tip={t('updatingLib')} size="large" fullscreen />
      <Head title={t('head.desktop')} />

      {/* 菜单栏 */}
      {isBigScreen ? (
        <Menu
          baseURL={baseURL}
          size={size}
          setSize={setSize}
          isKeyboardOpen={isKeyboardOpen}
          setIsKeyboardOpen={setIsKeyboardOpen}
          mouseStyle={mouseStyle}
          setMouseStyle={setMouseStyle}
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
              className={clsx('block select-none bg-neutral-950', mouseStyle)}
              width={size.width}
              height={size.height}
              src={`${baseURL}/api/mjpeg`}
              fallback={NoConnection}
              preview={false}
            />

            {/* 监听键盘鼠标事件 */}
            <Mouse client={client} width={size.width} height={size.height} />
            <Keyboard client={client} />
          </>
        </div>
      )}

      {/* 虚拟键盘 */}
      <VirtualKeyboard
        client={client}
        isBigScreen={isBigScreen}
        isOpen={isKeyboardOpen}
        setIsOpen={setIsKeyboardOpen}
      />
    </>
  );
};
