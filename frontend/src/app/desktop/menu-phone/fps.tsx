import { Popover } from 'antd';
import clsx from 'clsx';
import { ScanBarcodeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { api } from '@/lib/api.ts';
import { setFps as setFpsCookie } from '@/lib/localstorage.ts';

type FpsProps = {
  baseURL: string;
  fps: number;
  setFps: (fps: number) => void;
};

const fpsList = [
  { key: 60, label: '60 Hz' },
  { key: 30, label: '30 Hz' },
  { key: 24, label: '24 Hz' },
  { key: 15, label: '15 Hz' },
  { key: 10, label: '10 Hz' }
];

export const Fps = ({ baseURL, fps, setFps }: FpsProps) => {
  const { t } = useTranslation();

  const updateFps = (value: number) => {
    if (value === fps) {
      return;
    }

    const url = `${baseURL}/api/vm/screen`;
    const data = { type: 'fps', value };

    api.post(url, data).then((rsp: any) => {
      if (rsp.code !== 0) {
        console.log(rsp.msg);
        return;
      }

      setFps(value);
      setFpsCookie(value);
    });
  };

  const content = (
    <>
      {/* 默认 fps 选择列表 */}
      {fpsList.map((item) => (
        <div
          key={item.key}
          className={clsx(
            'my-1 flex h-[30px] cursor-pointer select-none items-center space-x-1 rounded-sm px-5 text-sm',
            item.key === fps ? 'bg-blue-700' : 'hover:bg-neutral-700'
          )}
          onClick={() => updateFps(item.key)}
        >
          <span>{item.label}</span>
        </div>
      ))}
    </>
  );

  return (
    <Popover content={content} placement="right" trigger="click">
      <div className="flex h-[32px] cursor-pointer items-center space-x-1 rounded-sm pl-2 text-neutral-300 hover:bg-neutral-700">
        <ScanBarcodeIcon size={18} />
        <span className="select-none text-sm">{t('fps')}</span>
      </div>
    </Popover>
  );
};
