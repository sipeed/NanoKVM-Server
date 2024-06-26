import { useEffect, useState } from 'react';
import { Badge, Button, message, Modal, Popover, Spin } from 'antd';
import { LanguagesIcon, SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { api } from '@/lib/api.ts';
import { removeToken } from '@/lib/cookie.ts';
import { getSkipUpdate, setLanguage, setSkipUpdate } from '@/lib/localstorage.ts';

type SettingsProps = {
  baseURL: string;
};

export const Settings = ({ baseURL }: SettingsProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const skip = getSkipUpdate();
    if (!skip) {
      checkUpdate();
    }
  }, []);

  // 切换语言
  function changeLanguage() {
    const lng = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(lng).then();
    setLanguage(lng);
  }

  // 打开 wiki
  function openWiki() {
    setIsPopoverOpen(false);
    window.open('https://wiki.sipeed.com/nanokvm', '_blank');
  }

  // 检查更新
  function checkUpdate() {
    if (isChecking) return;
    setIsChecking(true);

    api
      .get(`${baseURL}/api/firmware/version`)
      .then((rsp: any) => {
        if (rsp.code === 0) {
          setHasUpdate(rsp.data.hasUpdate);
        }
      })
      .finally(() => {
        setIsChecking(false);
      });
  }

  // 显示更新弹窗
  async function showUpdateModal() {
    if (!hasUpdate) {
      checkUpdate();
    }

    setIsPopoverOpen(false);
    setIsModalOpen(true);
  }

  // 确认更新
  function updateConfirm() {
    if (!hasUpdate) {
      setIsModalOpen(false);
      return;
    }

    const url = `${baseURL}/api/firmware/update`;
    api.post(url).then(() => {
      setHasUpdate(false);
      setIsModalOpen(false);
      messageApi.info(t('startUpdate'));
    });
  }

  // 取消更新
  function updateCancel() {
    setHasUpdate(false);
    setIsModalOpen(false);
    setSkipUpdate(true);
  }

  // 修改密码
  function changePassword() {
    setIsPopoverOpen(false);
    navigate('/auth/password');
  }

  // 登出
  function logout() {
    removeToken();
    navigate('/auth/login');
  }

  const content = (
    <div>
      <div
        className="flex cursor-pointer select-none items-center space-x-1 rounded px-3 py-1.5 text-white hover:bg-neutral-600"
        onClick={changeLanguage}
      >
        <LanguagesIcon size={16} />
        <span>{t('language')}</span>
      </div>

      <div
        className="flex cursor-pointer select-none items-center rounded px-3 py-1.5 hover:bg-neutral-600"
        onClick={openWiki}
      >
        {t('about')}
      </div>

      <div
        className="flex cursor-pointer select-none items-center rounded px-3 py-1.5 hover:bg-neutral-600"
        onClick={showUpdateModal}
      >
        <Badge dot={hasUpdate} color="blue" offset={[5, 5]}>
          {t('checkForUpdate')}
        </Badge>
      </div>

      <div
        className="flex cursor-pointer select-none items-center rounded px-3 py-1.5 hover:bg-neutral-600"
        onClick={changePassword}
      >
        {t('changePassword')}
      </div>

      <div
        className="flex cursor-pointer select-none items-center rounded px-3 py-1.5 hover:bg-neutral-600"
        onClick={logout}
      >
        {t('logout')}
      </div>
    </div>
  );

  return (
    <>
      {contextHolder}

      <Popover
        content={content}
        placement="bottomLeft"
        trigger="click"
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
      >
        <div className="flex h-[30px] cursor-pointer items-center justify-center space-x-1 rounded px-2 text-white hover:bg-neutral-700">
          <Badge dot={hasUpdate} color="blue" offset={[1, 0]}>
            <SettingsIcon size={18} />
          </Badge>
        </div>
      </Popover>

      {/* 更新确认弹窗 */}
      <Modal
        title={t('checkForUpdate')}
        open={isModalOpen}
        width={380}
        footer={null}
        closable={false}
        centered
      >
        <div className="flex flex-col items-center justify-center pb-5 pt-10">
          {isChecking ? (
            <Spin />
          ) : (
            <>
              <div>{hasUpdate ? t('hasUpdate') : t('noUpdate')}</div>

              <div className="mt-10 flex items-center space-x-3">
                <Button type="primary" onClick={updateConfirm}>
                  Confirm
                </Button>
                {hasUpdate && (
                  <Button type="default" onClick={updateCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
