import { useEffect, useState } from 'react';
import { Popover } from 'antd';
import { useAtomValue } from 'jotai';
import { MonitorIcon } from 'lucide-react';

import { updateScreen } from '@/api/vm';
import * as cookie from '@/lib/localstorage';
import { resolutionAtom } from '@/jotai/resolution';

import { Fps } from './fps';
import { Quality } from './quality';
import { Resolution } from './resolution';

export const Screen = () => {
  const resolution = useAtomValue(resolutionAtom);
  const [fps, setFps] = useState(30);
  const [quality, setQuality] = useState(80);

  useEffect(() => {
    updateScreen('resolution', resolution!.height);

    const cookieFps = cookie.getFps();
    if (cookieFps) {
      updateScreen('fps', cookieFps).then((rsp) => {
        if (rsp.code === 0) {
          setFps(cookieFps);
        }
      });
    }

    const cookieQuality = cookie.getQuality();
    if (cookieQuality) {
      updateScreen('quality', cookieQuality).then((rsp) => {
        if (rsp.code === 0) {
          setQuality(cookieQuality);
        }
      });
    }
  }, []);

  return (
    <Popover
      content={
        <div className="flex flex-col space-y-1">
          <Resolution />
          <Fps fps={fps} setFps={setFps} />
          <Quality quality={quality} setQuality={setQuality} />
        </div>
      }
      placement="rightBottom"
      trigger="click"
      arrow={false}
    >
      <div className="flex h-[32px] cursor-pointer items-center justify-center rounded px-3 text-neutral-300 hover:bg-neutral-700/80">
        <MonitorIcon size={18} />
      </div>
    </Popover>
  );
};
