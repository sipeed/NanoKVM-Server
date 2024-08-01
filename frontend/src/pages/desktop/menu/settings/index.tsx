import { useState } from 'react';
import { Badge, Divider, Popover } from 'antd';
import { SettingsIcon } from 'lucide-react';

import { About } from './about.tsx';
import { ChangePassword } from './change-password.tsx';
import { Language } from './language.tsx';
import { Logout } from './logout.tsx';
import { Update } from './update.tsx';
import { VirtualDevice } from './virtual-device.tsx';

export const Settings = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);

  const content = (
    <>
      <Language />
      <About setIsPopoverOpen={setIsPopoverOpen} />
      <Update setIsPopoverOpen={setIsPopoverOpen} setIsBadgeVisible={setIsBadgeVisible} />
      <Divider style={{ margin: '10px 0' }} />

      <VirtualDevice />
      <Divider style={{ margin: '10px 0' }} />

      <ChangePassword />
      <Logout />
    </>
  );

  return (
    <>
      <Popover
        content={content}
        placement="bottomLeft"
        trigger="click"
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
      >
        <div className="flex h-[30px] cursor-pointer items-center justify-center space-x-1 rounded px-2 text-white hover:bg-neutral-700">
          <Badge dot={isBadgeVisible} color="blue" offset={[1, 0]}>
            <SettingsIcon size={18} />
          </Badge>
        </div>
      </Popover>
    </>
  );
};
