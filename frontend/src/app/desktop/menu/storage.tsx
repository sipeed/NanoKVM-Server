import { Popover } from 'antd';
import { BoxIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const isoList = [{ key: '1', name: 'Ubuntu 24.04 LTS' }];

export const Storage = () => {
  const { t } = useTranslation();

  const content = (
    <div>
      {isoList.map((item) => (
        <div
          key={item.key}
          className="flex h-[30px] cursor-pointer select-none items-center space-x-1 rounded px-2 hover:bg-neutral-600"
        >
          <span className="flex">{item.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Popover content={content} placement="bottomLeft" trigger="click" style={{ padding: 0 }}>
      <div className="flex h-[30px] cursor-pointer items-center justify-center space-x-1 rounded px-2 text-neutral-300 hover:bg-neutral-700">
        <BoxIcon size={18} />
        <span className="select-none text-sm">{t('storage')}</span>
      </div>
    </Popover>
  );
};
