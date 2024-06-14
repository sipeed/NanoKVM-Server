import { KeyboardIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type KeyboardProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const Keyboard = ({ isOpen, setIsOpen }: KeyboardProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div
        className="flex h-[32px] cursor-pointer items-center space-x-1 rounded-sm pl-2 text-neutral-300 hover:bg-neutral-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <KeyboardIcon size={18} />
        <span className="select-none text-sm">{t('keyboard')}</span>
      </div>
    </>
  );
};
