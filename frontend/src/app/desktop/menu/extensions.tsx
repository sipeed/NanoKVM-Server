import { useEffect, useState } from 'react';
import { Popover } from 'antd';
import { BlocksIcon } from 'lucide-react';

import { api } from '@/lib/api.ts';

type Service = {
  name: string;
  port: number;
};

type ExtensionsProps = {
  baseURL: string;
};

export const Extensions = ({ baseURL }: ExtensionsProps) => {
  const [services, setServices] = useState<Service[]>([]);

  // 获取用户扩展服务
  useEffect(() => {
    const url = `${baseURL}/api/extensions/service`;
    api.get(url).then((rsp: any) => {
      if (rsp.data?.services?.length > 0) {
        setServices(rsp.data.services);
      }
    });
  }, []);

  function openService(port: number) {
    const url = `${window.location.protocol}//${window.location.hostname}:${port}`;
    window.open(url, '_blank');
  }

  return (
    <>
      {services.length > 0 && (
        <Popover
          content={
            <div>
              {services.map((service) => (
                <div
                  key={service.port}
                  className="flex cursor-pointer select-none items-center rounded p-1.5 hover:bg-neutral-600"
                  onClick={() => openService(service.port)}
                >
                  {service.name}
                </div>
              ))}
            </div>
          }
          placement="bottomLeft"
          trigger="click"
        >
          <div className="flex h-[30px] cursor-pointer items-center justify-center space-x-1 rounded px-2 text-white hover:bg-neutral-700">
            <BlocksIcon size={18} />
          </div>
        </Popover>
      )}
    </>
  );
};
