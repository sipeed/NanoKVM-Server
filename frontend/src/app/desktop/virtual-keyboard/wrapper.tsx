import { useRef, useState } from 'react';
import { XIcon } from 'lucide-react';
import Keyboard from 'react-simple-keyboard';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import 'react-simple-keyboard/build/css/index.css';
import '@/assets/styles/keyboard.css';

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

type KeyEvent = 'keydown' | 'keyup';

export const Wrapper = ({ client, isBigScreen, setIsOpen }: WrapperProps) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const keyboardRef = useRef<any>(null);

  // 按下按键
  function onKeyPress(key: string) {
    let event: KeyEvent;

    if (functionKeys.includes(key)) {
      // 功能键：如果未激活则按下按键;如果已激活则抬起按键
      if (!activeKeys.includes(key)) {
        setActiveKeys([...activeKeys, key]);
        event = 'keydown';
      } else {
        setActiveKeys(activeKeys.filter((k) => k !== key));
        event = 'keyup';
      }
    } else {
      // 非功能键
      event = 'keydown';

      if (key === '{capslock}') {
        // 大写键
        setActiveKeys(
          activeKeys.includes(key) ? activeKeys.filter((k) => k !== key) : [...activeKeys, key]
        );
      }
    }

    sendKeyboardData(event, key);
  }

  // 释放按键
  function onKeyReleased(key: string) {
    if (functionKeys.includes(key)) {
      return;
    }

    sendKeyboardData('keyup', key);
  }

  // 发送键盘数据
  function sendKeyboardData(event: KeyEvent, key: string) {
    const specialKey = specialKeyMap.get(key);
    const realKey = specialKey ? specialKey : key;

    const type = event === 'keydown' ? 1 : 0;
    const ctrl = existFunctionKey('ctrl') ? 1 : 0;
    const shift = existFunctionKey('shift') ? 1 : 0;
    const alt = existFunctionKey('alt') ? 1 : 0;
    const meta = existFunctionKey('meta') ? 1 : 0;

    const message = JSON.stringify({
      key: realKey,
      array: [type, ctrl, shift, alt, meta]
    });

    client.send(message);
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
