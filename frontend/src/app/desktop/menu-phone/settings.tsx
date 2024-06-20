import { useState } from 'react';
import { Popover } from 'antd';
import { LanguagesIcon, SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { removeToken } from '@/lib/cookie.ts';
import { setLanguage } from '@/lib/localstorage.ts';

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
    <div className="flex flex-col space-y-1 text-sm text-neutral-300">
      <div className="flex select-none items-center space-x-1 px-2 py-1.5" onClick={changeLanguage}>
        <LanguagesIcon size={18} />
        <span>{t('language')}</span>
      </div>

      <div className="flex select-none items-center px-2 py-1.5" onClick={openWiki}>
        {t('about')}
      </div>

      <div className="flex select-none items-center px-2 py-1.5" onClick={changePassword}>
        {t('changePassword')}
      </div>

      <div className="flex select-none items-center px-2 py-1.5" onClick={logout}>
        {t('logout')}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      placement="right"
      trigger="click"
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
    >
      <div className="flex h-[32px] cursor-pointer items-center space-x-1 rounded-sm pl-2 text-neutral-300 hover:bg-neutral-700">
        <SettingsIcon size={18} />
        <span className="select-none text-sm">{t('settings')}</span>
      </div>
    </Popover>
  );
};
