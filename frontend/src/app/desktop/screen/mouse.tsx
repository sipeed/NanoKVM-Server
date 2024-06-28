import { useEffect, useRef } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

type MouseProps = {
  client: W3CWebSocket;
  width: number;
  height: number;
};

// 鼠标事件为四个数字组成：
// 第一个数字-事件类型：0-鼠标抬起，1-鼠标按下，2-鼠标移动，3-滚轮滚动
// 第二个数字-鼠标按键：0-左键，1-中键，2-右键
// 第三个数字-x坐标
// 第四个数字-y坐标

export const Mouse = ({ client, width, height }: MouseProps) => {
  const buttonRef = useRef(0);

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
      if (event.button > 2) return;

      buttonRef.current = event.button;
      sendData([1, event.button, 0, 0]);
    }

    // 鼠标抬起事件
    function handleMouseUp(event: any) {
      disableEvent(event);
      buttonRef.current = 0;
      sendData([0, 0, 0, 0]);
    }

    // 鼠标移动事件
    let skipMove = 0;
    function handleMouseMove(event: any) {
      disableEvent(event);

      skipMove = (skipMove + 1) % Number.MAX_VALUE;
      if (skipMove % 3 !== 0) return;

      const rect = canvas!.getBoundingClientRect();
      const x = (event.clientX - rect.left) / width;
      const y = (event.clientY - rect.top) / height;

      const hexX = Math.floor(0x7fff * (x < 0 ? 0 : x)) + 0x0001;
      const hexY = Math.floor(0x7fff * (y < 0 ? 0 : y)) + 0x0001;

      const data = [2, buttonRef.current, hexX, hexY];
      sendData(data);
    }

    // 滚轮滚动事件
    function handleWheel(event: any) {
      disableEvent(event);

      const delta = Math.floor(event.deltaY);
      if (delta === 0) return;

      const data = [3, 0, 0, delta];
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
    const message = JSON.stringify({
      key: '',
      array: data
    });

    client.send(message);
  }

  // 禁用默认事件
  function disableEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  return <></>;
};
