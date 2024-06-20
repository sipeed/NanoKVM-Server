import { KeyboardIcon } from 'lucide-react';

type KeyboardProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const Keyboard = ({ isOpen, setIsOpen }: KeyboardProps) => {
  return (
    <>
      <div
        className="flex h-[30px] cursor-pointer items-center justify-center rounded px-3 text-neutral-300 hover:bg-neutral-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <KeyboardIcon size={18} />
      </div>
    </>
  );
};
