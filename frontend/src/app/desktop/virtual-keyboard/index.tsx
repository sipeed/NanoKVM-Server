import clsx from 'clsx';
import { Drawer } from 'vaul';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import { Wrapper } from './wrapper.tsx';

type KeyboardProps = {
  client: W3CWebSocket;
  isBigScreen: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const VirtualKeyboard = ({ client, isBigScreen, isOpen, setIsOpen }: KeyboardProps) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <Drawer.Portal>
        <Drawer.Content
          className={clsx(
            'fixed bottom-0 left-0 right-0 z-[999] mx-auto overflow-hidden rounded bg-white outline-none',
            isBigScreen ? 'w-[820px]' : 'w-[650px]'
          )}
        >
          <Wrapper client={client} isBigScreen={isBigScreen} setIsOpen={setIsOpen} />
        </Drawer.Content>
        <Drawer.Overlay />
      </Drawer.Portal>
    </Drawer.Root>
  );
};
