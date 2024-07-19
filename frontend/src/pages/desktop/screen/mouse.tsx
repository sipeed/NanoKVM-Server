import { useEffect } from 'react';
import { useAtomValue } from 'jotai';

import { client } from '@/lib/websocket.ts';
import { resolutionAtom } from '@/jotai/resolution.ts';

enum MouseEvent {
  Up = 0,
  Down = 1,
  Move = 2,
  Scroll = 3
}

enum MouseButton {
  None = 0,
  Left = 1,
  Right = 2,
  Wheel = 3
}

export const Mouse = () => {
  const resolution = useAtomValue(resolutionAtom);

  // 监听鼠标事件
  useEffect(() => {
    const canvas = document.getElementById('screen');
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('click', disableEvent);
    canvas.addEventListener('contextmenu', disableEvent);

    // 鼠标按下事件
    function handleMouseDown(event: any) {
      disableEvent(event);

      let button: MouseButton;
      switch (event.button) {
        case 0:
          button = MouseButton.Left;
          break;
        case 1:
          button = MouseButton.Wheel;
          break;
        case 2:
          button = MouseButton.Right;
          break;
        default:
          console.log(`unknown button ${event.button}`);
          return;
      }

      const data = [2, MouseEvent.Down, button, 0, 0];
      client.send(data);
    }

    // 鼠标抬起事件
    function handleMouseUp(event: any) {
      disableEvent(event);

      const data = [2, MouseEvent.Up, MouseButton.None, 0, 0];
      client.send(data);
    }

    // 鼠标移动事件
    function handleMouseMove(event: any) {
      disableEvent(event);

      const rect = canvas!.getBoundingClientRect();
      const x = (event.clientX - rect.left) / resolution!.width;
      const y = (event.clientY - rect.top) / resolution!.height;
      const hexX = x < 0 ? 0x0001 : Math.floor(0x7fff * x) + 0x0001;
      const hexY = y < 0 ? 0x0001 : Math.floor(0x7fff * y) + 0x0001;

      const data = [2, MouseEvent.Move, MouseButton.None, hexX, hexY];
      client.send(data);
    }

    // 滚轮滚动事件
    function handleWheel(event: any) {
      disableEvent(event);

      const delta = Math.floor(event.deltaY);
      if (delta === 0) return;

      const data = [2, MouseEvent.Scroll, 0, 0, delta];
      client.send(data);
    }

    return () => {
      // 注销事件
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', disableEvent);
      canvas.removeEventListener('contextmenu', disableEvent);
    };
  }, [resolution]);

  // 禁用默认事件
  function disableEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  return <></>;
};
