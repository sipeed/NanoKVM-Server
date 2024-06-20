import { useEffect } from 'react';
import { Popover } from 'antd';
import clsx from 'clsx';
import {
  HandIcon,
  MouseIcon,
  MousePointerIcon,
  PlusIcon,
  PointerIcon,
  TextCursorIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getMouse, setMouse } from '@/lib/localstorage.ts';

type MouseProps = {
  mouseStyle: string;
  setMouseStyle: (style: string) => void;
};

export const Mouse = ({ mouseStyle, setMouseStyle }: MouseProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    const mouse = getMouse();
    if (mouse) {
      setMouseStyle(mouse);
    }
  }, []);

  function updateMouse(style: string) {
    setMouseStyle(style);
    setMouse(style);
  }

  const mouseTypes = [
    { name: t('cursor.default'), icon: <MousePointerIcon size={14} />, value: 'cursor-default' },
    { name: t('cursor.pointer'), icon: <PointerIcon size={14} />, value: 'cursor-pointer' },
    { name: t('cursor.cell'), icon: <PlusIcon size={14} />, value: 'cursor-cell' },
    { name: t('cursor.text'), icon: <TextCursorIcon size={14} />, value: 'cursor-text' },
    { name: t('cursor.grab'), icon: <HandIcon size={14} />, value: 'cursor-grab' },
    { name: t('cursor.hide'), icon: <></>, value: 'cursor-none' }
  ];

  const content = (
    <>
      {mouseTypes.map((mouse) => (
        <div
          key={mouse.value}
          className={clsx(
            'flex cursor-pointer select-none items-center space-x-1 rounded px-3 py-1.5 hover:bg-neutral-600',
            mouse.value === mouseStyle ? 'text-green-500' : 'text-white'
          )}
          onClick={() => updateMouse(mouse.value)}
        >
          <div className="flex h-[14px] w-[20px] items-end">{mouse.icon}</div>
          <span>{mouse.name}</span>
        </div>
      ))}
    </>
  );

  return (
    <Popover content={content} placement="bottomLeft" trigger="click">
      <div className="flex h-[30px] cursor-pointer items-center rounded px-3 text-neutral-300 hover:bg-neutral-700">
        <MouseIcon size={18} />
      </div>
    </Popover>
  );
};
