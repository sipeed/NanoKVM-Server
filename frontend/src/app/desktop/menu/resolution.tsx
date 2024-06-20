import { Popover } from 'antd';
import { CheckIcon, RatioIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ScreenSize } from '@/types';
import { api } from '@/lib/api.ts';
import { setResolution } from '@/lib/localstorage.ts';

type ResolutionProps = {
  baseURL: string;
  resolution: number;
  setSize: (size: ScreenSize) => void;
};

type ResolutionItem = { key: number } & ScreenSize;

const resolutions: ResolutionItem[] = [
  { key: 1080, width: 1920, height: 1080 },
  { key: 720, width: 1280, height: 720 },
  { key: 600, width: 800, height: 600 },
  { key: 480, width: 640, height: 480 }
];

export const Resolution = ({ baseURL, resolution, setSize }: ResolutionProps) => {
  const { t } = useTranslation();

  function update(item: ResolutionItem) {
    const url = `${baseURL}/api/vm/screen`;
    const data = { type: 'resolution', value: item.key };

    api.post(url, data).then((rsp: any) => {
      if (rsp.code !== 0) {
        console.log(rsp.msg);
        return;
      }

      setSize({ width: item.width, height: item.height });
      setResolution(item.width, item.height);
    });
  }

  const content = (
    <>
      {resolutions.map((item) => (
        <div
          key={item.key}
          className="flex cursor-pointer select-none items-center space-x-1 rounded py-1.5 pl-1 pr-5 hover:bg-neutral-600"
          onClick={() => update(item)}
        >
          <div className="flex h-[14px] w-[20px] items-end">
            {item.key === resolution && <CheckIcon size={14} />}
          </div>
          <span className="flex w-[32px]">{item.width}</span>
          <span>x</span>
          <span className="w-[36px]">{item.height}</span>
        </div>
      ))}
    </>
  );

  return (
    <Popover content={content} placement="rightTop">
      <div className="flex h-[30px] cursor-pointer items-center space-x-2 rounded px-3 text-neutral-300 hover:bg-neutral-700">
        <RatioIcon size={18} />
        <span className="select-none text-sm">{t('resolution')}</span>
      </div>
    </Popover>
  );
};
