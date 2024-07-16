import { useEffect, useRef } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

type MouseProps = {
  client: W3CWebSocket;
  width: number;
  height: number;
};

enum MouseEvent {
  Up = 0,
  Down = 1,
  Move = 2,
  Scroll = 3
}

enum MouseButton {
  None = 0,
  Left = 1,
  Right = 2
}

export const Mouse = ({ client, width, height }: MouseProps) => {
  const buttonRef = useRef<MouseButton>(MouseButton.None);

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

      if (event.button === 0) {
        buttonRef.current = MouseButton.Left;
      } else if (event.button === 2) {
        buttonRef.current = MouseButton.Right;
      } else {
        return;
      }

      const data = [2, MouseEvent.Down, buttonRef.current, 0, 0];
      sendData(data);
    }

    // 鼠标抬起事件
    function handleMouseUp(event: any) {
      disableEvent(event);

      buttonRef.current = MouseButton.None;

      const data = [2, MouseEvent.Up, buttonRef.current, 0, 0];
      sendData(data);
    }

    // 鼠标移动事件
    function handleMouseMove(event: any) {
      disableEvent(event);

      const rect = canvas!.getBoundingClientRect();
      const x = (event.clientX - rect.left) / width;
      const y = (event.clientY - rect.top) / height;
      const hexX = x < 0 ? 0x0001 : Math.floor(0x7fff * x) + 0x0001;
      const hexY = y < 0 ? 0x0001 : Math.floor(0x7fff * y) + 0x0001;

      const data = [2, MouseEvent.Move, buttonRef.current, hexX, hexY];
      sendData(data);
    }

    // 滚轮滚动事件
    function handleWheel(event: any) {
      disableEvent(event);

      const delta = Math.floor(event.deltaY);
      if (delta === 0) return;

      const data = [2, MouseEvent.Scroll, 0, 0, delta];
      sendData(data);
    }

    return () => {
      // 注销事件
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', disableEvent);
      canvas.removeEventListener('contextmenu', disableEvent);
    };
  }, [width, height]);

  function sendData(data: number[]) {
    client.send(JSON.stringify(data));
  }

  // 禁用默认事件
  function disableEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  return <></>;
};
