import { useEffect } from 'react';

import { KeyboardEvent } from '@/types';
import { api } from '@/lib/api.ts';

type KeyboardProps = {
  baseURL: string;
};

export const Keyboard = ({ baseURL }: KeyboardProps) => {
  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 按下按键
    function handleKeyDown(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const data: KeyboardEvent = {
        type: 'keydown',
        key: event.code,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey
      };

      sendKeyboardData(data);
    }

    // 抬起按键
    function handleKeyUp(event: any) {
      event.preventDefault();
      event.stopPropagation();

      sendKeyboardData({ type: 'keyup', key: event.code });
    }

    // 发送键盘数据
    function sendKeyboardData(data: KeyboardEvent) {
      const url = `${baseURL}/api/events/keyboard`;
      const config = { timeout: 500 };

      api.post(url, data, config);
      // .then((rsp: any) => {
      //   if (rsp.code !== 0) {
      //     console.log(rsp.msg);
      //   }
      // });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [baseURL]);

  return <></>;
};
