import { useEffect, useState } from 'react';
import { Popover, Tooltip } from 'antd';
import clsx from 'clsx';
import {
  CirclePowerIcon,
  HardDriveIcon,
  LoaderCircleIcon,
  PowerIcon,
  RotateCcwIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import * as api from '@/api/vm';

export const Power = () => {
  const { t } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isHddOn, setIsHddOn] = useState(false);
  const [isPowering, setIsPowering] = useState(false);

  useEffect(() => {
    getLed();
    const interval = setInterval(getLed, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  function getLed() {
    api.getLed().then((rsp: any) => {
      if (rsp.code !== 0) {
        console.log(rsp.msg);
        return;
      }

      setIsPowerOn(rsp.data.pwr);
      setIsHddOn(rsp.data.hdd);
    });
  }

  function clickButton(button: 'restart' | 'power-short' | 'power-long') {
    if (isPowering) return;

    setIsPowering(true);
    setIsPopoverOpen(false);

    api
      .power(button)
      // .then((rsp) => {})
      .finally(() => {
        setIsPowering(false);
      });
  }

  const content = (
    <div className="flex flex-col space-y-1">
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
    </div>
  );

  return (
    <>
      <Popover
        content={content}
        placement="rightBottom"
        trigger="click"
        arrow={false}
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
      >
        <div className="flex h-[32px] cursor-pointer items-center justify-center rounded px-2 hover:bg-neutral-700/80">
          <div
            className={clsx('h-[18px] w-[18px]', isPowerOn ? 'text-green-600' : 'text-neutral-500')}
          >
            {isPowering ? (
              <LoaderCircleIcon className="animate-spin" size={18} />
            ) : (
              <PowerIcon size={18} />
            )}
          </div>
        </div>
      </Popover>

      <Tooltip placement="right" title={t('hddLed')}>
        <div
          className={clsx(
            'flex h-[32px] items-center justify-center px-2',
            isHddOn ? 'text-green-600' : 'text-neutral-500'
          )}
        >
          <HardDriveIcon size={18} />
        </div>
      </Tooltip>
    </>
  );
};
