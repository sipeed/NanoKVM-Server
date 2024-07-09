import { useEffect } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import { KeyboardCodes } from '@/lib/keyboard-codes.ts';

type KeyboardProps = {
  client: W3CWebSocket;
};

export const Keyboard = ({ client }: KeyboardProps) => {
  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 按下按键
    function handleKeyDown(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const code = KeyboardCodes.get(event.code);
      if (!code) {
        console.log('unknown code: ', event.code);
        return;
      }

      const ctrl = event.ctrlKey ? 1 : 0;
      const shift = event.shiftKey ? 1 : 0;
      const alt = event.altKey ? 1 : 0;
      const meta = event.metaKey ? 1 : 0;

      const data = [1, code, ctrl, shift, alt, meta];
      client.send(JSON.stringify(data));
    }

    // 抬起按键
    function handleKeyUp(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const data = [1, 0, 0, 0, 0, 0];
      client.send(JSON.stringify(data));
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <></>;
};
