import { Tooltip } from 'antd';
import { SquareTerminalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Terminal = () => {
  const { t } = useTranslation();

  function openTerminal() {
    window.open('/#terminal', '_blank');
  }

  return (
    <Tooltip placement="right" title={t('kvmTerminal')}>
      <div
        className="flex h-[30px] cursor-pointer items-center justify-center rounded px-2 text-neutral-300 hover:bg-neutral-700"
        onClick={openTerminal}
      >
        <SquareTerminalIcon size={18} />
      </div>
    </Tooltip>
  );
};
