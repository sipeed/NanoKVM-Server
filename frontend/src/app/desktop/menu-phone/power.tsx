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

    // setTimeout(() => {
    //   setIsPowering(false);
    //   setIsPowerOn((value) => !value);
    // }, 3000);

    const url = `${baseURL}/api/vm/power`;
    const data = { type: isPowerOn ? 'off' : 'on' };

    api
      .post(url, data)
      .then((rsp: any) => {
        if (rsp.code !== 0) {
          console.log(rsp.msg);
          return;
        }
        setIsPowerOn((value) => !value);
      })
      .finally(() => {
        setIsPowering(false);
      });
  }

  const content = (
    <>
      <div
        className={clsx(
          'flex select-none items-center space-x-1 rounded-sm p-2 text-sm',
          isPowerOn ? 'cursor-pointer hover:bg-neutral-600' : 'cursor-not-allowed text-neutral-500'
        )}
        onClick={() => setIsPopoverOpen(false)}
      >
        <RotateCcwIcon size={18} />
        <span>{t('restart')}</span>
      </div>

      <div className="my-[2px]"></div>

      <div
        className="flex cursor-pointer select-none items-center space-x-1 rounded-sm p-2 text-sm hover:bg-neutral-600"
        onClick={powerOnOff}
      >
        {isPowerOn ? <PowerOffIcon size={18} /> : <PowerIcon size={18} />}
        <span>{isPowerOn ? t('powerOff') : t('powerOn')}</span>
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
