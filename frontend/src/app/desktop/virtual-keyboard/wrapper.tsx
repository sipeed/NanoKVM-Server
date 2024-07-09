import { useRef, useState } from 'react';
import { XIcon } from 'lucide-react';
import Keyboard from 'react-simple-keyboard';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import 'react-simple-keyboard/build/css/index.css';
import '@/assets/styles/keyboard.css';

import { KeyboardCodes } from '@/lib/keyboard-codes.ts';

import {
  doubleKeys,
  functionKeys,
  keyboardArrowsOptions,
  keyboardControlPadOptions,
  keyboardOptions,
  specialKeyMap
} from './keys.ts';

type WrapperProps = {
  client: W3CWebSocket;
  isBigScreen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const Wrapper = ({ client, isBigScreen, setIsOpen }: WrapperProps) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const keyboardRef = useRef<any>(null);

  // 按下按键
  function onKeyPress(key: string) {
    // 按下功能键
    if (functionKeys.includes(key)) {
      if (!activeKeys.includes(key)) {
        // 激活功能键
        setActiveKeys([...activeKeys, key]);
        sendKeydown(key);
      } else {
        // 取消功能键
        setActiveKeys(activeKeys.filter((k) => k !== key));
        sendKeyup();
      }

      return;
    }

    // 按下非功能键
    if (key === '{capslock}') {
      // 大写键
      setActiveKeys(
        activeKeys.includes(key) ? activeKeys.filter((k) => k !== key) : [...activeKeys, key]
      );
    }

    sendKeydown(key);
  }

  // 释放按键
  function onKeyReleased(key: string) {
    if (functionKeys.includes(key)) {
      return;
    }

    sendKeyup();
  }

  function sendKeydown(key: string) {
    const specialKey = specialKeyMap.get(key);
    const realKey = specialKey ? specialKey : key;
    const code = KeyboardCodes.get(realKey);
    if (!code) {
      console.log('unknown code: ', realKey);
      return;
    }

    const ctrl = existFunctionKey('ctrl') ? 1 : 0;
    const shift = existFunctionKey('shift') ? 1 : 0;
    const alt = existFunctionKey('alt') ? 1 : 0;
    const meta = existFunctionKey('meta') ? 1 : 0;

    const data = [1, code, ctrl, shift, alt, meta];
    client.send(JSON.stringify(data));
  }

  function sendKeyup() {
    const data = [1, 0, 0, 0, 0, 0];
    client.send(JSON.stringify(data));
  }

  function existFunctionKey(key: string) {
    return activeKeys.includes(`{${key}left}`) || activeKeys.includes(`{${key}right}`);
  }

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between px-3 py-1">
        <div className="w-[100px] text-sm font-bold text-neutral-500">Keyboard</div>
        <div className="h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300" />
        <div className="flex w-[100px] items-center justify-end">
          <div
            className="flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded text-neutral-600 hover:bg-neutral-300 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <XIcon size={18} />
          </div>
        </div>
      </div>
      <div className="h-px flex-shrink-0 border-b bg-neutral-300" />

      <div className="keyboardContainer w-full">
        {/* 主键盘 */}
        <Keyboard
          buttonTheme={
            activeKeys.length > 0
              ? [
                  { class: 'hg-double', buttons: doubleKeys.join(' ') },
                  { class: 'hg-highlight', buttons: activeKeys.join(' ') }
                ]
              : [{ class: 'hg-double', buttons: doubleKeys.join(' ') }]
          }
          keyboardRef={(r) => (keyboardRef.current = r)}
          onKeyPress={onKeyPress}
          onKeyReleased={onKeyReleased}
          {...keyboardOptions}
        />

        {/* 控制键 */}
        {isBigScreen && (
          <div className="controlArrows">
            <Keyboard
              onKeyPress={onKeyPress}
              onKeyReleased={onKeyReleased}
              {...keyboardControlPadOptions}
            />

            <Keyboard
              onKeyPress={onKeyPress}
              onKeyReleased={onKeyReleased}
              {...keyboardArrowsOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
};
