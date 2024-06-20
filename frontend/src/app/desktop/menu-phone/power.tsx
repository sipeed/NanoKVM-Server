import { useEffect, useState } from 'react';
import { Popover } from 'antd';
import clsx from 'clsx';
import {
  CirclePowerIcon,
  HardDriveIcon,
  LoaderCircleIcon,
  PowerIcon,
  RotateCcwIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { api } from '@/lib/api';

type PowerProps = {
  baseURL: string;
};

export const Power = ({ baseURL }: PowerProps) => {
  const { t } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isHddOn, setIsHddOn] = useState(false);
  const [isPowering, setIsPowering] = useState(false);

  useEffect(() => {
    function getLedState() {
      api.get(`${baseURL}/api/vm/led`).then((rsp: any) => {
        if (rsp.code !== 0) {
          console.log(rsp.msg);
          return;
        }

        setIsPowerOn(rsp.data.pwr);
        setIsHddOn(rsp.data.hdd);
      });
    }

    getLedState();
    const interval = setInterval(getLedState, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [baseURL]);

  function clickButton(button: 'restart' | 'power-short' | 'power-long') {
    if (isPowering) return;

    setIsPowering(true);
    setIsPopoverOpen(false);

    const url = `${baseURL}/api/vm/power`;

    api
      .post(url, { type: button })
      .then((rsp: any) => {
        if (rsp.code !== 0) {
          console.log(rsp.msg);
          return;
        }
      })
      .finally(() => {
        setIsPowering(false);
      });
  }

  const content = (
    <>
      <div
        className="flex h-[32px] cursor-pointer select-none items-center space-x-2 rounded px-3 hover:bg-neutral-600"
        onClick={() => clickButton('restart')}
      >
        <RotateCcwIcon size={16} />
        <span>{t('restart')}</span>
      </div>

      <div
        className="flex h-[32px] cursor-pointer select-none items-center space-x-2 rounded px-3 hover:bg-neutral-600"
        onClick={() => clickButton('power-short')}
      >
        <PowerIcon size={16} />
        <span>{t('powerShort')}</span>
      </div>

      <div
        className="flex h-[32px] cursor-pointer select-none items-center space-x-2 rounded px-3 hover:bg-neutral-600"
        onClick={() => clickButton('power-long')}
      >
        <CirclePowerIcon size={16} />
        <span>{t('powerLong')}</span>
      </div>
    </>
  );

  return (
    <Popover
      content={content}
      placement="right"
      trigger="click"
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
    >
      <div className="flex h-[32px] cursor-pointer items-center space-x-3 rounded-sm pl-2 text-neutral-300 hover:bg-neutral-700">
        <div
          className={clsx('h-[18px] w-[18px]', isPowerOn ? 'text-green-600' : 'text-neutral-500')}
        >
          {isPowering ? (
            <LoaderCircleIcon className="animate-spin" size={18} />
          ) : (
            <PowerIcon size={18} />
          )}
        </div>

        <div className={clsx('h-[18px] w-[18px]', isHddOn ? 'text-green-600' : 'text-neutral-500')}>
          <HardDriveIcon size={18} />
        </div>
      </div>
    </Popover>
  );
};
