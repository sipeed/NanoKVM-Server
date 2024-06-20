import { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { api } from '@/lib/api.ts';
import { setToken } from '@/lib/cookie.ts';
import { encrypt } from '@/lib/encrypt.ts';
import { Head } from '@/components/head.tsx';

import { ForgetPassword } from './forget-password.tsx';

export const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (msg) {
      setTimeout(() => setMsg(''), 3000);
    }
  }, [msg]);

  function login(values: any) {
    const base = `${window.location.protocol}//${window.location.hostname}:80`;
    const url = `${base}/api/auth/login`;

    const data = {
      username: values.username,
      password: encrypt(values.password)
    };

    api.post(url, data).then((rsp: any) => {
      if (rsp.code !== 0) {
        const err = rsp.code === -3 ? t('auth.invalidUser') : t('auth.error');
        setMsg(err);
        return;
      }

      setMsg('');
      setToken({
        username: values.username,
        password: values.password
      });

      navigate('/', { replace: true });
    });
  }

  return (
    <>
      <Head title={t('head.login')} />

      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-neutral-100">{t('auth.login')}</h2>

        <Form
          style={{ minWidth: 300, maxWidth: 500 }}
          initialValues={{ remember: true }}
          onFinish={login}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('auth.noEmptyUsername'), min: 1 }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t('auth.placeholderUsername')} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('auth.noEmptyPassword'), min: 1 }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder={t('auth.placeholderPassword')}
            />
          </Form.Item>

          <div className="text-red-500">{msg}</div>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              {t('auth.ok')}
            </Button>
          </Form.Item>

          <div className="flex justify-end pb-4 text-sm">
            <ForgetPassword />
          </div>
        </Form>
      </div>
    </>
  );
};
