import { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { api, getUrl } from '@/lib/api.ts';
import { setToken } from '@/lib/cookie.ts';
import { Head } from '@/components/head.tsx';

export const ChangePassword = () => {
  const { t } = useTranslation();
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (msg) {
      setTimeout(() => setMsg(''), 3000);
    }
  }, [msg]);

  async function changePassword(values: any) {
    if (values.password !== values.password2) {
      setMsg(t('auth.differentPassword'));
      return;
    }
    if (!validateString(values.username)) {
      setMsg(t('auth.illegalUsername'));
      return;
    }
    if (!validateString(values.password)) {
      setMsg('auth.illegalPassword');
      return;
    }

    const url = getUrl('/api/auth/password');

    const data = {
      username: values.username,
      password: values.password
    };

    const rsp: any = await api.post(url, data);
    if (rsp.code !== 0) {
      console.log(rsp.msg);
      return;
    }

    setToken(data);
    navigate('/', { replace: true });
  }

  function validateString(str: string) {
    const regex = /['"\\/]/;
    return !regex.test(str);
  }

  return (
    <>
      <Head title={t('head.changePassword')} />

      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-neutral-100">{t('auth.changePassword')}</h2>

        <Form
          style={{ minWidth: 300, maxWidth: 500 }}
          initialValues={{ remember: true }}
          onFinish={changePassword}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('noEmptyUsername'), min: 1 }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t('auth.placeholderUsername')} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('noEmptyPassword'), min: 1 }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder={t('auth.placeholderPassword')}
            />
          </Form.Item>

          <Form.Item
            name="password2"
            rules={[{ required: true, message: t('noEmptyPassword'), min: 1 }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder={t('auth.placeholderPassword')}
            />
          </Form.Item>

          <span className="text-red-500">{msg}</span>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              {t('auth.ok')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};
