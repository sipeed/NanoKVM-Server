import { useState } from 'react';
import { Popover } from 'antd';
import { LanguagesIcon, SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { removeToken, setLanguage } from '@/lib/cookie.ts';

export const Settings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  function openWiki() {
    setIsPopoverOpen(false);
    window.open('https://wiki.sipeed.com/nanokvm', '_blank');
  }

  function changeLanguage() {
    const lng = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(lng).then();
    setLanguage(lng);
  }

  function changePassword() {
    setIsPopoverOpen(false);
    navigate('/auth/password');
  }

  function logout() {
    removeToken();
    navigate('/auth/login');
  }

  const content = (
    <div>
      <div
        className="flex cursor-pointer select-none items-center space-x-1 rounded p-1.5 text-white hover:bg-neutral-600"
        onClick={changeLanguage}
      >
        <LanguagesIcon size={16} />
        <span>{t('language')}</span>
      </div>

      <div
        className="flex cursor-pointer select-none items-center rounded p-1.5 hover:bg-neutral-600"
        onClick={openWiki}
      >
        {t('about')}
      </div>

      <div
        className="flex cursor-pointer select-none items-center rounded p-1.5 hover:bg-neutral-600"
        onClick={changePassword}
      >
        {t('changePassword')}
      </div>

      <div
        className="flex cursor-pointer select-none items-center rounded p-1.5 hover:bg-neutral-600"
        onClick={logout}
      >
        {t('logout')}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      placement="bottomLeft"
      trigger="click"
      style={{ padding: 0 }}
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
    >
      <div className="flex h-[30px] cursor-pointer items-center justify-center space-x-1 rounded px-2 text-white hover:bg-neutral-700">
        <SettingsIcon size={18} />
      </div>
    </Popover>
  );
};
