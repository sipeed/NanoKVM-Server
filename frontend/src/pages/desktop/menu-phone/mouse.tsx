import { useEffect, useState } from 'react';
import { Divider, Popover } from 'antd';
import clsx from 'clsx';
import { useAtom } from 'jotai';
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

import * as api from '@/api/storage';
import * as ls from '@/lib/localstorage';
import { client } from '@/lib/websocket.ts';
import { mouseStyleAtom } from '@/jotai/mouse.ts';

export const Mouse = () => {
  const { t } = useTranslation();
  const [mouseStyle, setMouseStyle] = useAtom(mouseStyleAtom);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const mouse = ls.getMouseStyle();
    if (mouse && mouse !== mouseStyle) {
      setMouseStyle(mouse);
    }
  }, []);

  function updateMouse(style: string) {
    setMouseStyle(style);
    ls.setMouseStyle(style);
  }

  function resetHid() {
    setIsPopoverOpen(false);

    client.close();

    api.resetHid().finally(() => {
      client.connect();
    });
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
    <Popover
      content={content}
      placement="rightBottom"
      trigger="click"
      arrow={false}
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
    >
      <div className="flex h-[30px] cursor-pointer items-center rounded px-3 text-neutral-300 hover:bg-neutral-700">
        <MouseIcon size={18} />
      </div>
    </Popover>
  );
};
