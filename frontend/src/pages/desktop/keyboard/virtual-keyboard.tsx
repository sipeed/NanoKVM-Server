import { useRef, useState } from 'react';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { XIcon } from 'lucide-react';
import Keyboard, { KeyboardButtonTheme } from 'react-simple-keyboard';
import { Drawer } from 'vaul';

import 'react-simple-keyboard/build/css/index.css';
import '@/assets/styles/keyboard.css';

import { KeyboardCodes } from '@/lib/keyboard-codes.ts';
import { client } from '@/lib/websocket.ts';
import { isKeyboardOpenAtom } from '@/jotai/keyboard.ts';

import {
  doubleKeys,
  functionKeys,
  keyboardArrowsOptions,
  keyboardControlPadOptions,
  keyboardOptions,
  specialKeyMap
} from './virtual-keys.ts';

type KeyboardProps = {
  isBigScreen: boolean;
};

export const VirtualKeyboard = ({ isBigScreen }: KeyboardProps) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useAtom(isKeyboardOpenAtom);

  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isCapsLock, setIsCapsLock] = useState(false);

  const keyboardRef = useRef<any>(null);

  // 按下按键
  function onKeyPress(key: string) {
    // 功能键
    if (functionKeys.includes(key)) {
      if (!activeKeys.includes(key)) {
        setActiveKeys([...activeKeys, key]);
      } else {
        sendKeydown(key);
        sendKeyup();
      }

      return;
    }

    // 大写键
    if (key === '{capslock}') {
      setIsCapsLock(!isCapsLock);
    }

    // 其他按键
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

    setActiveKeys([]);

    const data = [1, code, ctrl, shift, alt, meta];
    client.send(data);
  }

  function sendKeyup() {
    const data = [1, 0, 0, 0, 0, 0];
    client.send(data);
  }

  function existFunctionKey(key: string) {
    return activeKeys.includes(`{${key}left}`) || activeKeys.includes(`{${key}right}`);
  }

  function getButtonTheme(): KeyboardButtonTheme[] {
    const theme = [{ class: 'hg-double', buttons: doubleKeys.join(' ') }];

    if (activeKeys.length > 0 || isCapsLock) {
      const buttons = [...activeKeys];
      isCapsLock && buttons.push('{capslock}');
      theme.push({ class: 'hg-highlight', buttons: buttons.join(' ') });
    }

    return theme;
  }

  return (
    <Drawer.Root open={isKeyboardOpen} onOpenChange={setIsKeyboardOpen} modal={false}>
      <Drawer.Portal>
        <Drawer.Content
          className={clsx(
            'fixed bottom-0 left-0 right-0 z-[999] mx-auto overflow-hidden rounded bg-white outline-none',
            isBigScreen ? 'w-[820px]' : 'w-[650px]'
          )}
        >
          {/* header */}
          <div className="flex items-center justify-between px-3 py-1">
            <div className="w-[100px] text-sm font-bold text-neutral-500">Keyboard</div>
            <div className="h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300" />
            <div className="flex w-[100px] items-center justify-end">
              <div
                className="flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded text-neutral-600 hover:bg-neutral-300 hover:text-white"
                onClick={() => setIsKeyboardOpen(false)}
              >
                <XIcon size={18} />
              </div>
            </div>
          </div>
          <div className="h-px flex-shrink-0 border-b bg-neutral-300" />

          <div className="keyboardContainer w-full">
            {/* 主键盘 */}
            <Keyboard
              buttonTheme={getButtonTheme()}
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
        </Drawer.Content>
        <Drawer.Overlay />
      </Drawer.Portal>
    </Drawer.Root>
  );
};
