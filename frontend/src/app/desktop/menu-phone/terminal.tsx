import { SquareTerminalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Terminal = () => {
  const { t } = useTranslation();

  function openTerminal() {
    window.open('/#terminal', '_blank');
  }

  return (
    <div
      className="flex h-[32px] cursor-pointer items-center space-x-1 rounded-sm pl-2 text-neutral-300 hover:bg-neutral-700"
      onClick={openTerminal}
    >
      <SquareTerminalIcon size={18} />
      <span className="select-none text-sm">{t('terminal')}</span>
    </div>
  );
};
