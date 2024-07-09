import { useEffect } from 'react';
import { Divider, Popover } from 'antd';
import clsx from 'clsx';
import {
  EyeOffIcon,
  HandIcon,
  MouseIcon,
  MousePointerIcon,
  PlusIcon,
  RefreshCwIcon,
  TextCursorIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { api } from '@/lib/api.ts';
import { getMouse, setMouse } from '@/lib/localstorage.ts';

type MouseProps = {
  baseURL: string;
  mouseStyle: string;
  setMouseStyle: (style: string) => void;
};

export const Mouse = ({ baseURL, mouseStyle, setMouseStyle }: MouseProps) => {
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

  function resetHid() {
    const url = `${baseURL}/api/storage/resethid`;
    api.post(url);
  }

  const mouseTypes = [
    { name: t('cursor.default'), icon: <MousePointerIcon size={14} />, value: 'cursor-default' },
    { name: t('cursor.grab'), icon: <HandIcon size={14} />, value: 'cursor-grab' },
    { name: t('cursor.cell'), icon: <PlusIcon size={14} />, value: 'cursor-cell' },
    { name: t('cursor.text'), icon: <TextCursorIcon size={14} />, value: 'cursor-text' },
    { name: t('cursor.hide'), icon: <EyeOffIcon size={14} />, value: 'cursor-none' }
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

      <Divider style={{ margin: '10px 0' }} />

      <div
        className="flex cursor-pointer select-none items-center space-x-1 rounded px-3 py-1.5 hover:bg-neutral-600"
        onClick={resetHid}
      >
        <div className="flex h-[14px] w-[20px] items-end">
          <RefreshCwIcon size={14} />
        </div>
        <span>{t('cursor.resetHid')}</span>
      </div>
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
