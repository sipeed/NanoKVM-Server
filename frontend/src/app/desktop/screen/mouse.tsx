import { useEffect, useRef } from 'react';

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
  const positionRef = useRef<Position>({ x: 0, y: 0 });
  const prePositionRef = useRef<Position>({ x: 0, y: 0 });

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

    let frameId: number;
    frameId = requestAnimationFrame(sendPosition);

    // 鼠标按下事件
    function handleMouseDown(event: any) {
      disableEvent(event);

      const button = event.button === 1 ? 'wheel' : event.button === 2 ? 'right' : 'left';
      buttonRef.current = button;

      sendMouseData({ type: 'mousedown', button, x: 0, y: 0 });
    }

    // 鼠标抬起事件
    function handleMouseUp(event: any) {
      disableEvent(event);

      buttonRef.current = '';

      sendMouseData({ type: 'mouseup', button: '', x: 0, y: 0 });
    }

    // 鼠标移动事件
    function handleMouseMove(event: any) {
      disableEvent(event);

      const rect = canvas!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      positionRef.current = { x: x < 0 ? 0 : x, y: y < 0 ? 0 : y };
    }

    // 滚轮滚动事件
    function handleWheel(event: any) {
      disableEvent(event);

      const delta = Math.floor(event.deltaY);
      if (delta === 0) return;

      sendMouseData({ type: 'scroll', button: '', x: 0, y: delta });
    }

    // 定时发送鼠标移动坐标
    function sendPosition() {
      const isMoved =
        positionRef.current.x !== prePositionRef.current.x ||
        positionRef.current.y !== prePositionRef.current.y;

      if (isMoved) {
        const x = positionRef.current.x / width;
        const y = positionRef.current.y / height;
        const hexX = Math.floor(0x7fff * x) + 0x0001;
        const hexY = Math.floor(0x7fff * y) + 0x0001;

        const data: MouseData = {
          type: 'mousemove',
          button: buttonRef.current,
          x: hexX,
          y: hexY
        };
        sendMouseData(data);

        prePositionRef.current = positionRef.current;
      }

      frameId = requestAnimationFrame(sendPosition);
    }

    // 发送鼠标操作数据
    function sendMouseData(data: MouseData) {
      const url = `${baseURL}/api/events/mouse`;
      api.post(url, data, { timeout: 300 }).then(() => {
        // if (rsp.code !== 0) {
        //   console.log(rsp.msg);
        // }
      });
    }

    // 注销事件
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', disableEvent);
      canvas.removeEventListener('contextmenu', disableEvent);

      cancelAnimationFrame(frameId);
    };
  }, [baseURL, width, height]);

  // 禁用默认事件
  function disableEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  return <></>;
};
