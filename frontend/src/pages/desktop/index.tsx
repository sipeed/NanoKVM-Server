import { useEffect, useState } from 'react';
import { Image, message, Spin } from 'antd';
import clsx from 'clsx';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

import NoConnection from '@/assets/images/monitor-x.svg';
import * as api from '@/api/firmware.ts';
import { getResolution } from '@/lib/localstorage.ts';
import { client } from '@/lib/websocket.ts';
import { isKeyboardEnableAtom } from '@/jotai/keyboard.ts';
import { mouseStyleAtom } from '@/jotai/mouse.ts';
import { resolutionAtom } from '@/jotai/resolution.ts';
import { Head } from '@/components/head.tsx';

import { Keyboard } from './keyboard';
import { VirtualKeyboard } from './keyboard/virtual-keyboard';
import { Menu } from './menu';
import { MenuPhone } from './menu-phone';
import { Mouse } from './mouse';

export const Desktop = () => {
  const { t } = useTranslation();
  const isBigScreen = useMediaQuery({ minWidth: 850 });
  const [messageApi, contextHolder] = message.useMessage();

  const mouseStyle = useAtomValue(mouseStyleAtom);
  const isKeyboardEnable = useAtomValue(isKeyboardEnableAtom);
  const [resolution, setResolution] = useAtom(resolutionAtom);

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getLib();

    const cookieResolution = getResolution();
    setResolution(cookieResolution ? cookieResolution : { width: 1280, height: 720 });

    const timer = setInterval(() => {
      client.send([0]);
    }, 1000 * 60);

    return () => {
      clearInterval(timer);
      client.close();
    };
  }, []);

  // 检查 lib 是否存在
  function getLib() {
    api.getLib().then((rsp) => {
      if (rsp.code !== 0) {
        showMessage(t('checkLibFailed'));
        return;
      }

      if (rsp.data.exist) {
        return;
      }

      downloadLib();
    });
  }

  // 更新 lib
  function downloadLib() {
    setIsUpdating(true);

    api
      .updateLib()
      .then((rsp) => {
        if (rsp.code !== 0) {
          showMessage(t('updateLibFailed'));
          return;
        }

        setTimeout(() => {
          window.location.reload();
        }, 6000);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }

  function showMessage(content: string) {
    messageApi.open({
      type: 'warning',
      content,
      duration: 10,
      style: {
        marginTop: '8vh'
      }
    });
  }

  return (
    <>
      {contextHolder}

      <Spin spinning={isUpdating} tip={t('updatingLib')} size="large" fullscreen />
      <Head title={t('head.desktop')} />

      {resolution && (
        <>
          {/* 菜单栏 */}
          {isBigScreen ? <Menu /> : <MenuPhone />}

          <div
            className="flex h-full w-full items-start justify-center xl:items-center"
            style={{ minWidth: `${resolution.width}px`, minHeight: `${resolution.height}px` }}
          >
            <>
              <Image
                id="screen"
                className={clsx(
                  'block select-none bg-neutral-950',
                  mouseStyle,
                  resolution.width === 800 ? 'object-cover' : 'object-none'
                )}
                width={resolution.width}
                height={resolution.height}
                src={`${window.location.protocol}//${window.location.host}/api/mjpeg`}
                fallback={NoConnection}
                preview={false}
              />

              {/* 监听键盘鼠标事件 */}
              <Mouse />
              {isKeyboardEnable && <Keyboard />}
            </>
          </div>
        </>
      )}

      {/* 虚拟键盘 */}
      <VirtualKeyboard isBigScreen={isBigScreen} />
    </>
  );
};
