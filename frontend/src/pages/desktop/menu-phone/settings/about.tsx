import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { BookOpenIcon, GithubIcon, LoaderCircleIcon, MessageSquareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getVersion } from '@/api/firmware';

type AboutPorps = {
  setIsPopoverOpen: (open: boolean) => void;
};

export const About = ({ setIsPopoverOpen }: AboutPorps) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  const communities = [
    { name: 'wiki', icon: <BookOpenIcon size={24} />, url: 'https://wiki.sipeed.com/nanokvm' },
    { name: 'github', icon: <GithubIcon size={24} />, url: 'https://github.com/sipeed/NanoKVM' },
    {
      name: 'discussion',
      icon: <MessageSquareIcon size={24} />,
      url: 'https://maixhub.com/discussion/nanokvm'
    }
  ];

  useEffect(() => {
    setLoading(true);

    getVersion('current')
      .then((rsp: any) => {
        if (rsp.code === 0) {
          setCurrentVersion(rsp.data.current);
        } else {
          setCurrentVersion(t('about.queryFailed'));
        }
      })
      .catch(() => {
        setCurrentVersion(t('about.queryFailed'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function showModal() {
    setIsModalOpen(true);
    setIsPopoverOpen(false);
  }

  function openPage(url: string) {
    window.open(url, '_blank');
  }

  return (
    <>
      <div
        className="flex cursor-pointer select-none items-center rounded px-3 py-1.5 hover:bg-neutral-600"
        onClick={showModal}
      >
        {t('about.title')}
      </div>

      <Modal
        title={t('about.title')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={350}
        footer={null}
        centered
      >
        <div className="my-5 h-[1px] bg-neutral-700/50" />
        <div className="flex items-start justify-between py-3">
          <div className="flex flex-col space-y-2">
            <span className="text-neutral-400">{t('about.version')}</span>
            {loading ? (
              <LoaderCircleIcon className="animate-spin" size={18} />
            ) : (
              <span>{currentVersion}</span>
            )}
          </div>
        </div>

        <div className="my-5 h-[1px] bg-neutral-700/50" />
        <div className="text-neutral-400">{t('about.community')}</div>
        <div className="my-3 flex space-x-5">
          {communities.map((community) => (
            <div
              key={community.name}
              className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center space-y-1 rounded text-neutral-400 outline outline-1 outline-neutral-700 hover:bg-neutral-800"
              onClick={() => openPage(community.url)}
            >
              {community.icon}
              <span className="text-xs text-neutral-300">{community.name}</span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};
