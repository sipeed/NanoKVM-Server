import clsx from 'clsx';
import { useAtom } from 'jotai';
import { Drawer } from 'vaul';

import { isKeyboardOpenAtom } from '@/jotai/keyboard.ts';

import { Wrapper } from './wrapper.tsx';

type KeyboardProps = {
  isBigScreen: boolean;
};

export const VirtualKeyboard = ({ isBigScreen }: KeyboardProps) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useAtom(isKeyboardOpenAtom);

  return (
    <Drawer.Root open={isKeyboardOpen} onOpenChange={setIsKeyboardOpen} modal={false}>
      <Drawer.Portal>
        <Drawer.Content
          className={clsx(
            'fixed bottom-0 left-0 right-0 z-[999] mx-auto overflow-hidden rounded bg-white outline-none',
            isBigScreen ? 'w-[820px]' : 'w-[650px]'
          )}
        >
          <Wrapper isBigScreen={isBigScreen} />
        </Drawer.Content>
        <Drawer.Overlay />
      </Drawer.Portal>
    </Drawer.Root>
  );
};
