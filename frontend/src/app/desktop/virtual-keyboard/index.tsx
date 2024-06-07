import { Drawer } from 'vaul';

import { Wrapper } from './wrapper.tsx';

type KeyboardProps = {
  baseURL: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const VirtualKeyboard = ({ baseURL, isOpen, setIsOpen }: KeyboardProps) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <Drawer.Portal>
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[999] mx-auto w-[820px] rounded bg-white outline-none">
          <Wrapper baseURL={baseURL} setIsOpen={setIsOpen} />
        </Drawer.Content>
        <Drawer.Overlay />
      </Drawer.Portal>
    </Drawer.Root>
  );
};
