import { useEffect, useState } from 'react';
import { Divider, Popover } from 'antd';
import clsx from 'clsx';
import {
  DiscIcon,
  FileBoxIcon,
  LoaderCircleIcon,
  PackageIcon,
  PackageSearchIcon,
  XIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import * as api from '@/api/storage';

export const Storage = () => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [mountingFile, setMountingFile] = useState('');
  const [mountedFile, setMountedFile] = useState('');

  useEffect(() => {
    getFiles();
  }, []);

  function handleOpenChange(_open: boolean) {
    if (_open) {
      getFiles();
    }

    setOpen(_open);
  }

  // 获取镜像列表
  function getFiles() {
    if (loading) return;
    setLoading(true);

    api
      .getImages()
      .then((rsp) => {
        if (rsp.code !== 0) {
          return;
        }

        const images = rsp.data.files;

        if (!images?.length) {
          setFiles([]);
          return;
        }

        setFiles(images);

        // 获取已挂载的镜像
        api.getMountedImage().then((rsp) => {
          if (rsp.code === 0 && rsp.data?.file && images.includes(rsp.data.file)) {
            setMountedFile(rsp.data.file);
          }
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // 挂载/取消挂载
  function mountFile(file: string) {
    if (mountingFile) return;
    setMountingFile(file);

    const filename = mountedFile === file ? '' : file;

    api
      .mountImage(filename)
      .then((rsp) => {
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
    <div className="min-w-[250px]">
      <div className="flex items-center justify-between px-2">
        <span className="text-base font-bold text-neutral-300">{t('images')}</span>
      </div>

      <Divider style={{ margin: '10px 0 15px 0' }} />

      {loading ? (
        <div className="flex items-center space-x-2 py-2 pl-2 pr-4 text-neutral-400">
          <LoaderCircleIcon className="animate-spin" size={18} />
          <span className="text-sm">{t('loading')}</span>
        </div>
      ) : files.length === 0 ? (
        <div className="flex items-center space-x-2 pl-2 pr-4 text-neutral-500">
          <PackageSearchIcon size={18} />
          <span className="text-sm">{t('empty')}</span>
        </div>
      ) : (
        files.map((file) => (
          <div
            key={file}
            className={clsx(
              'group my-1 flex h-[32px] max-w-[300px] cursor-pointer select-none items-center space-x-2 rounded pl-2 pr-4 hover:bg-neutral-600',
              { 'text-blue-500': mountedFile === file }
            )}
            onClick={() => mountFile(file)}
          >
            {mountedFile === file ? (
              <>
                <div className="h-[18px] w-[18px] group-hover:text-red-500">
                  <PackageIcon size={18} className="block group-hover:hidden" />
                  <XIcon size={18} className="hidden group-hover:block" />
                </div>
              </>
            ) : mountingFile === file ? (
              <LoaderCircleIcon className="animate-spin" size={18} />
            ) : (
              <FileBoxIcon size={18} />
            )}
            <span className="text-base">{file.replace(/^.*[\\/]/, '')}</span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      placement="bottomLeft"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <div className="flex h-[30px] cursor-pointer items-center justify-center rounded px-2 text-neutral-300 hover:bg-neutral-700">
        <div
          className={clsx('h-[18px] w-[18px]', !mountedFile ? 'text-neutral-300' : 'text-blue-500')}
        >
          <DiscIcon size={18} />
        </div>
      </div>
    </Popover>
  );
};
