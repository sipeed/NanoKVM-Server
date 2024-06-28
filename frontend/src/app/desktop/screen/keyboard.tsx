import { useEffect } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

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

      const ctrl = event.ctrlKey ? 1 : 0;
      const shift = event.shiftKey ? 1 : 0;
      const alt = event.altKey ? 1 : 0;
      const meta = event.metaKey ? 1 : 0;

      const data = JSON.stringify({
        key: event.code,
        array: [1, ctrl, shift, alt, meta]
      });
      client.send(data);
    }

    // 抬起按键
    function handleKeyUp(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const data = JSON.stringify({
        key: event.code,
        array: [0, 0, 0, 0, 0]
      });
      client.send(data);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <></>;
};
