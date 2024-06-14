import { useEffect, useState } from 'react';
import { Popover } from 'antd';
import clsx from 'clsx';
import {
  HardDriveIcon,
  LoaderCircleIcon,
  PowerIcon,
  PowerOffIcon,
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

        setIsPowerOn(rsp.data.power);
        setIsHddOn(rsp.data.hdd);
      });
    }

    getLedState();
    const interval = setInterval(getLedState, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [baseURL]);

  function powerOnOff() {
    if (isPowering) return;

    setIsPowering(true);
    setIsPopoverOpen(false);

    const url = `${baseURL}/api/vm/power`;
    const data = { type: isPowerOn ? 'off' : 'on' };

    api
      .post(url, data)
      .then((rsp: any) => {
        if (rsp.code !== 0) {
          console.log(rsp.msg);
          return;
        }
        setIsPowerOn(!isPowerOn);
      })
      .finally(() => {
        setIsPowering(false);
      });
  }

  const content = (
    <div className="flex flex-col space-y-1">
      <div
        className={clsx(
          'flex select-none items-center space-x-2 rounded px-3 py-1.5',
          isPowerOn ? 'cursor-pointer hover:bg-neutral-600' : 'cursor-not-allowed text-neutral-500'
        )}
        onClick={() => setIsPopoverOpen(false)}
      >
        <RotateCcwIcon size={16} />
        <span>{t('restart')}</span>
      </div>

      <div
        className="flex h-[30px] cursor-pointer select-none items-center space-x-2 rounded px-3 hover:bg-neutral-600"
        onClick={powerOnOff}
      >
        {isPowerOn ? <PowerOffIcon size={16} /> : <PowerIcon size={16} />}
        <span>{isPowerOn ? t('powerOff') : t('powerOn')}</span>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      placement="bottomLeft"
      trigger="click"
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
    >
      <div className="flex h-[30px] cursor-pointer items-center justify-center space-x-3 rounded px-3 hover:bg-neutral-700/80">
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
