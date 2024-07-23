import { useEffect, useRef } from 'react';
import { message } from 'antd';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

import { client } from '@/lib/websocket.ts';
import { resolutionAtom } from '@/jotai/resolution.ts';

import { MouseButton, MouseEvent } from './constants';

export const Relative = () => {
  const { t } = useTranslation();
  const resolution = useAtomValue(resolutionAtom);

  const isLockedRef = useRef(false);
  const buttonRef = useRef<MouseButton>(MouseButton.None);

  const [messageApi, contextHolder] = message.useMessage();

  // 监听鼠标事件
  useEffect(() => {
    const canvas = document.getElementById('screen');
    if (!canvas) return;

    messageApi.open({
      type: 'info',
      content: t('cursor.requestPointer'),
      duration: 3,
      style: {
        marginTop: '40vh'
      }
    });

    document.addEventListener('pointerlockchange', handlePointerLockChange);

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('contextmenu', disableEvent);

    function handleClick(event: any) {
      disableEvent(event);

      if (!isLockedRef.current) {
        canvas!.requestPointerLock();
      }
    }

    function handlePointerLockChange() {
      isLockedRef.current = document.pointerLockElement === canvas;
    }

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

      buttonRef.current = button;
      const data = [2, MouseEvent.Down, button, 0, 0];
      client.send(data);
    }

    // 鼠标抬起事件
    function handleMouseUp(event: any) {
      disableEvent(event);

      buttonRef.current = MouseButton.None;
      const data = [2, MouseEvent.Up, MouseButton.None, 0, 0];
      client.send(data);
    }

    // 鼠标移动事件
    function handleMouseMove(event: any) {
      disableEvent(event);

      const x = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const y = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      if (x === 0 && y === 0) return;

      const data = [
        2,
        MouseEvent.MoveRelative,
        buttonRef.current,
        Math.abs(x) < 10 ? x * 2 : x,
        Math.abs(y) < 10 ? y * 2 : y
      ];
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
      document.removeEventListener('pointerlockchange', handlePointerLockChange);

      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', disableEvent);
    };
  }, [resolution]);

  // 禁用默认事件
  function disableEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  return <>{contextHolder}</>;
};
