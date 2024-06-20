import { Popover } from 'antd';
import { CheckIcon, SquareActivityIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { api } from '@/lib/api.ts';
import { setQuality as setQualityCookie } from '@/lib/localstorage.ts';

type QualityProps = {
  baseURL: string;
  quality: number;
  setQuality: (quality: number) => void;
};

const qualityList = [
  { key: 95, label: '95%' },
  { key: 90, label: '90%' },
  { key: 85, label: '85%' },
  { key: 80, label: '80%' },
  { key: 70, label: '70%' },
  { key: 60, label: '60%' },
  { key: 51, label: '51%' }
];

export const Quality = ({ baseURL, quality, setQuality }: QualityProps) => {
  const { t } = useTranslation();

  function update(value: number) {
    const url = `${baseURL}/api/vm/screen`;
    const data = { type: 'quality', value };

    api.post(url, data).then((rsp: any) => {
      if (rsp.code !== 0) {
        console.log(rsp.msg);
        return;
      }

      setQuality(value);
      setQualityCookie(value);
    });
  }

  const content = (
    <>
      {qualityList.map((item) => (
        <div
          key={item.key}
          className="flex h-[30px] cursor-pointer select-none items-center space-x-1 rounded pl-1 pr-5 hover:bg-neutral-600"
          onClick={() => update(item.key)}
        >
          <div className="flex h-[14px] w-[20px] items-end">
            {item.key === quality && <CheckIcon size={14} />}
          </div>
          <span className="flex w-[32px]">{item.label}</span>
        </div>
      ))}
    </>
  );

  return (
    <Popover content={content} placement="rightTop">
      <div className="flex h-[30px] cursor-pointer items-center space-x-2 rounded px-3 text-neutral-300 hover:bg-neutral-700">
        <SquareActivityIcon size={18} />
        <span className="select-none text-sm">{t('quality')}</span>
      </div>
    </Popover>
  );
};
