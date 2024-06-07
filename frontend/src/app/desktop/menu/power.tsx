import { useEffect, useState } from 'react';
import { Popover, Tooltip } from 'antd';
import clsx from 'clsx';
import {
  CirclePowerIcon,
  LoaderCircleIcon,
  PowerIcon,
  PowerOffIcon,
  RotateCcwIcon
} from 'lucide-react';

import '@/assets/styles/led.css';

import { useTranslation } from 'react-i18next';

import { api } from '@/lib/api';

import { Terminal } from './terminal';

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

    api.post(url, data).then((rsp: any) => {
      if (rsp.code !== 0) {
        console.log(rsp.msg)
        return
      }
      setIsPowerOn((value) => !value);
    }).finally(() => {
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
    <div className="flex items-center space-x-1 px-1">
      <Popover
        content={content}
        placement="bottomLeft"
        trigger="click"
        style={{ padding: 0 }}
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
      >
        <div className="flex h-[30px] cursor-pointer items-center justify-center space-x-1 rounded px-2 text-neutral-300 hover:bg-neutral-700">
          {isPowering ? (
            <LoaderCircleIcon className="animate-spin" size={18} />
          ) : (
            <CirclePowerIcon size={18} />
          )}
          <span className="select-none text-sm">{t('power')}</span>
        </div>
      </Popover>

      <Terminal />
      <div></div>

      <Tooltip placement="bottom" title={t('powerLed')}>
        <div
          className={clsx('led', isPowering ? 'red animate-pulse' : isPowerOn ? 'red' : 'white')}
        />
      </Tooltip>

      <div></div>

      <Tooltip placement="bottom" title={t('hddLed')}>
        <div className={clsx('led', isHddOn ? 'green' : 'white')} />
      </Tooltip>
    </div>
  );
};
