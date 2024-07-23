import { useEffect, useRef } from 'react';

import { client } from '@/lib/websocket.ts';

import { KeyboardCodes } from './mappings.ts';

export const Keyboard = () => {
  const metaRef = useRef(false);

  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 按下按键
    function handleKeyDown(event: any) {
      disableEvent(event);

      if (event.code === 'MetaLeft' || event.code === 'MetaRight') {
        metaRef.current = true;
        return;
      }
      metaRef.current = false;

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
      client.send(data);
    }

    // 抬起按键
    function handleKeyUp(event: any) {
      disableEvent(event);

      if (metaRef.current) {
        client.send([1, KeyboardCodes.get('MetaLeft')!, 0, 0, 0, 1]);
        metaRef.current = false;
      }

      const data = [1, 0, 0, 0, 0, 0];
      client.send(data);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 禁用默认事件
  function disableEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  return <></>;
};
