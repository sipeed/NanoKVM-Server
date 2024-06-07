import { useRef, useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, InputNumber, InputNumberProps, Popover } from 'antd';
import { CheckIcon, ScanBarcodeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { api } from '@/lib/api.ts';

type FpsProps = {
  baseURL: string;
  fps: number;
  setFps: (fps: number) => void;
};

const fpsList = [
  { key: 60, label: '60Hz' },
  { key: 30, label: '30Hz' },
  { key: 24, label: '24Hz' },
  { key: 15, label: '15Hz' },
  { key: 10, label: '10Hz' }
];

const defaultFps = [60, 30, 24, 15, 10];

export const Fps = ({ baseURL, fps, setFps }: FpsProps) => {
  const { t } = useTranslation();
  const [isCustomize, setIsCustomize] = useState(false);
  const customizeRef = useRef(0);

  const showCustomize = () => {
    customizeRef.current = fps;
    setIsCustomize(true);
  };

  const onChange: InputNumberProps['onChange'] = (value) => {
    const num = Number(value);
    if (num > 0 && num <= 60) {
      customizeRef.current = num;
    }
  };

  const updateFps = (value: number) => {
    if (customizeRef.current === fps) {
      setIsCustomize(false);
      return;
    }

    const url = `${baseURL}/api/vm/screen`;
    const data = { type: 'fps', value };

    api.post(url, data).then((rsp: any) => {
      if (rsp.code !== 0) {
        console.log(rsp.msg);
        return;
      }

      setFps(value);
      setIsCustomize(false);
    });
  };

  const content = (
    <div>
      {/* 默认 fps 选择列表 */}
      {fpsList.map((item) => (
        <div
          key={item.key}
          className="flex w-[140px] cursor-pointer select-none items-center space-x-1 rounded py-1.5 pl-1 hover:bg-neutral-600"
          onClick={() => updateFps(item.key)}
        >
          <div className="flex h-[14px] w-[20px] items-end">
            {item.key === fps && <CheckIcon size={14} />}
          </div>
          <span>{item.label}</span>
        </div>
      ))}

      {/* 自定义 fps */}
      <div
        className="flex w-[140px] cursor-pointer select-none items-center space-x-1 rounded py-1.5 pl-1 hover:bg-neutral-600"
        onClick={showCustomize}
      >
        {defaultFps.includes(fps) ? (
          <>
            <div className="flex h-[14px] w-[20px] items-end"></div>
            <span>{t('customize')}</span>
          </>
        ) : (
          <>
            <div className="flex h-[14px] w-[20px] items-end">
              <CheckIcon size={14} />
            </div>
            <span>{`Customize(${fps}Hz)`}</span>
          </>
        )}
      </div>

      {/* 输入框 */}
      {isCustomize && (
        <div className="flex items-center space-x-1 py-1">
          <InputNumber<number> defaultValue={fps} min={1} max={60} onChange={onChange} />
          <Button
            size="small"
            icon={<CheckOutlined />}
            onClick={() => updateFps(customizeRef.current)}
          />
          <Button size="small" icon={<CloseOutlined />} onClick={() => setIsCustomize(false)} />
        </div>
      )}
    </div>
  );

  return (
    <Popover content={content} placement="bottomLeft" trigger="click" style={{ padding: 0 }}>
      <div className="flex h-[30px] cursor-pointer items-center justify-center space-x-1 rounded px-2 text-neutral-300 hover:bg-neutral-700">
        <ScanBarcodeIcon size={18} />
        <span className="select-none text-sm">{t('fps')}</span>
      </div>
    </Popover>
  );
};
