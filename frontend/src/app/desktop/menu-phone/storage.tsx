import { useEffect, useState } from 'react';
import { Popover } from 'antd';
import clsx from 'clsx';
import {
  BoxIcon,
  FileBoxIcon,
  LoaderCircleIcon,
  PackageIcon,
  PackageSearchIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { api } from '@/lib/api.ts';

type StorageProps = {
  baseURL: string;
};

export const Storage = ({ baseURL }: StorageProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [mountingFile, setMountingFile] = useState('');
  const [mountedFile, setMountedFile] = useState('');

  useEffect(() => {
    setLoading(true);

    // 获取镜像列表
    api
      .get(`${baseURL}/api/storage/iso`)
      .then((rsp: any) => {
        if (rsp.code !== 0) {
          console.log(rsp.msg);
          return;
        }

        if (rsp.data.files?.length > 0) {
          const isoList = rsp.data.files;

          setFiles(isoList);

          // 获取已挂载的镜像
          api.get(`${baseURL}/api/storage/iso/mounted`).then((rsp: any) => {
            if (rsp.code === 0 && rsp.data?.file && isoList.includes(rsp.data.file)) {
              setMountedFile(rsp.data.file);
            }
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 挂载/取消挂载
  function mountFile(file: string) {
    if (mountingFile) return;
    setMountingFile(file);

    const filename = mountedFile === file ? '' : file;

    api
      .post(`${baseURL}/api/storage/iso`, { file: filename })
      .then((rsp: any) => {
        if (rsp.code !== 0) {
          console.log(rsp.msg);
          return;
        }

        setMountedFile(filename);
      })
      .finally(() => {
        setMountingFile('');
      });
  }

  const content = (
    <>
      {loading ? (
        <div className="flex items-center space-x-1">
          <LoaderCircleIcon className="animate-spin" size={18} />
          <span className="text-sm">{t('loading')}</span>
        </div>
      ) : files.length === 0 ? (
        <div className="flex items-center space-x-2 py-3 pr-3 text-neutral-500">
          <PackageSearchIcon size={18} />
          <span className="text-sm">{t('empty')}</span>
        </div>
      ) : (
        files.map((file) => (
          <div
            key={file}
            className={clsx(
              'my-1 flex h-[32px] cursor-pointer select-none items-center space-x-2 rounded pl-2 pr-4 hover:bg-neutral-600',
              { 'text-green-500': mountedFile === file }
            )}
            onClick={() => mountFile(file)}
          >
            {mountedFile === file ? (
              <PackageIcon size={18} />
            ) : mountingFile === file ? (
              <LoaderCircleIcon className="animate-spin" size={18} />
            ) : (
              <FileBoxIcon size={18} />
            )}
            <span className="text-base">{file.replace(/^.*[\\/]/, '')}</span>
          </div>
        ))
      )}
    </>
  );

  return (
    <Popover content={content} placement="right" trigger="click">
      <div className="flex h-[32px] cursor-pointer items-center space-x-1 rounded-sm pl-2 text-neutral-300 hover:bg-neutral-700">
        <div
          className={clsx('h-[18px] w-[18px]', !mountedFile ? 'text-neutral-300' : 'text-blue-500')}
        >
          <BoxIcon size={18} />
        </div>
        <span className="select-none text-sm">{t('storage')}</span>
      </div>
    </Popover>
  );
};
