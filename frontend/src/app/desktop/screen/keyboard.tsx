import { useEffect } from 'react';
import Queue from 'yocto-queue';

import { KeyboardEvent } from '@/types';
import { api } from '@/lib/api.ts';

type KeyboardProps = {
  baseURL: string;
};

export const Keyboard = ({ baseURL }: KeyboardProps) => {
  const url = `${baseURL}/api/events/keyboard`;
  const config = { timeout: 500 };
  const queue = new Queue();

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

      queue.enqueue(data);
    }

    // 抬起按键
    function handleKeyUp(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const data = { type: 'keyup', key: event.code };
      queue.enqueue(data);
    }

    function sendData() {
      const data = queue.dequeue();
      if (data) {
        api.post(url, data, config).finally(() => {
          sendData();
        });
      } else {
        setTimeout(sendData, 300);
      }
    }

    setTimeout(sendData, 300);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      queue.clear();
    };
  }, [baseURL]);

  return <></>;
};
