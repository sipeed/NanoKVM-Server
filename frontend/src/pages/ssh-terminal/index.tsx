import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { encrypt } from '@/lib/encrypt.ts';
import { Head } from '@/components/head.tsx';

import { Login } from './login.tsx';
import { Terminal } from './terminal.tsx';

export const SshTerminal = () => {
  const { t } = useTranslation();
  const [token, setToken] = useState(`?t=${encrypt('root')}`);

  return (
    <>
      <Head title={t('terminal')} />

      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <Terminal token={token} setToken={setToken} />
      )}
    </>
  );
};
