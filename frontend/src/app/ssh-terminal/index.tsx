import { useEffect } from 'react';
import { AttachAddon } from '@xterm/addon-attach';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useTranslation } from 'react-i18next';

import '@/assets/styles/xterm.css';

import { Head } from '@/components/head.tsx';

export const SshTerminal = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const terminalEle = document.getElementById('terminal');
    if (!terminalEle) {
      return;
    }

    const terminal = new Terminal();
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalEle);
    fitAddon.fit();

    const webSocket = new WebSocket('ws://' + window.location.host + '/api/vm/ws-ssh');

    const sendSize = () => {
      const windowSize = { high: terminal.rows, width: terminal.cols };
      const blob = new Blob([JSON.stringify(windowSize)], { type: 'application/json' });
      webSocket.send(blob);
    };

    webSocket.onopen = sendSize;

    const resizeScreen = () => {
      fitAddon.fit();
      sendSize();
    };
    window.addEventListener('resize', resizeScreen, false);

    const attachAddon = new AttachAddon(webSocket);
    terminal.loadAddon(attachAddon);

    return () => {
      webSocket.close();
    };
  }, []);

  return (
    <>
      <Head title={t('terminal')} />
      <div id="terminal" className="h-full"></div>;
    </>
  );
};
