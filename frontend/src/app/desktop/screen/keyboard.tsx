import { useEffect } from 'react';

import { KeyboardEvent } from '@/types';
import { api } from '@/lib/api.ts';

type KeyboardProps = {
  baseURL: string;
};

export const Keyboard = ({ baseURL }: KeyboardProps) => {
  const url = `${baseURL}/api/events/keyboard`;
  const config = { timeout: 500 };

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

      api.post(url, data, config);
    }

    // 抬起按键
    function handleKeyUp(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const data = { type: 'keyup', key: event.code };
      api.post(url, data, config);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [baseURL]);

  return <></>;
};
