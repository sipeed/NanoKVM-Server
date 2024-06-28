import { useEffect, useRef } from 'react';
import Queue from 'yocto-queue';

import { api } from '@/lib/api.ts';

type MouseProps = {
  baseURL: string;
  width: number;
  height: number;
};

type MouseType = 'mousemove' | 'mousedown' | 'mouseup' | 'scroll';
type MouseButton = '' | 'left' | 'right' | 'wheel';
type Position = {
  x: number;
  y: number;
};
type MouseData = {
  type: MouseType;
  button: MouseButton;
} & Position;

export const Mouse = ({ baseURL, width, height }: MouseProps) => {
  const buttonRef = useRef<MouseButton>('');

  const url = `${baseURL}/api/events/mouse`;
  const config = { timeout: 300 };
  const clickQueue = new Queue<MouseData>();

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

      const button = event.button === 1 ? 'wheel' : event.button === 2 ? 'right' : 'left';
      buttonRef.current = button;

      clickQueue.enqueue({ type: 'mousedown', button, x: 0, y: 0 });
    }

    // 鼠标抬起事件
    function handleMouseUp(event: any) {
      disableEvent(event);

      buttonRef.current = '';

      clickQueue.enqueue({ type: 'mouseup', button: '', x: 0, y: 0 });
    }

    // 鼠标移动事件
    let skipMove = false;
    function handleMouseMove(event: any) {
      disableEvent(event);

      skipMove = !skipMove;
      if (skipMove) return;

      const rect = canvas!.getBoundingClientRect();
      const x = (event.clientX - rect.left) / width;
      const y = (event.clientY - rect.top) / height;

      const hexX = Math.floor(0x7fff * (x < 0 ? 0 : x)) + 0x0001;
      const hexY = Math.floor(0x7fff * (y < 0 ? 0 : y)) + 0x0001;

      const data: MouseData = {
        type: 'mousemove',
        button: buttonRef.current,
        x: hexX,
        y: hexY
      };
      api.post(url, data, config);
    }

    // 滚轮滚动事件
    function handleWheel(event: any) {
      disableEvent(event);

      const delta = Math.floor(event.deltaY);
      if (delta === 0) return;

      const data = { type: 'scroll', button: '', x: 0, y: delta };
      api.post(url, data, config);
    }

    function sendClickData() {
      const data = clickQueue.dequeue();
      if (!data) {
        setTimeout(sendClickData, 100);
        return;
      }

      api.post(url, data, config).finally(() => {
        sendClickData();
      });
    }

    sendClickData();

    return () => {
      // 注销事件
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', disableEvent);
      canvas.removeEventListener('contextmenu', disableEvent);

      clickQueue.clear();
    };
  }, [baseURL, width, height]);

  // 禁用默认事件
  function disableEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  return <></>;
};
