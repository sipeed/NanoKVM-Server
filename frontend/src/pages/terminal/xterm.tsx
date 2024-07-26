import { useEffect } from 'react';
import { AttachAddon } from '@xterm/addon-attach';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XtermTerminal } from '@xterm/xterm';

import '@/assets/styles/xterm.css';

type TerminalProps = {
  token: string;
  setToken: (token: string) => void;
};

export const Xterm = ({ token, setToken }: TerminalProps) => {
  useEffect(() => {
    const terminalEle = document.getElementById('terminal');
    if (!terminalEle) return;

    const terminal = new XtermTerminal();
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalEle);
    fitAddon.fit();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/api/vm/ssh${token}`;
    const webSocket = new WebSocket(url);

    const sendSize = () => {
      const windowSize = { high: terminal.rows, width: terminal.cols };
      const blob = new Blob([JSON.stringify(windowSize)], { type: 'application/json' });
      webSocket.send(blob);
    };

    const resizeScreen = () => {
      fitAddon.fit();
      sendSize();
    };
    window.addEventListener('resize', resizeScreen, false);

    const attachAddon = new AttachAddon(webSocket);
    terminal.loadAddon(attachAddon);

    webSocket.onopen = sendSize;
    webSocket.onerror = () => {
      setToken('');
    };
    webSocket.onclose = () => {
      setToken('');
    };

    return () => {
      if (webSocket.readyState === 1) {
        webSocket.close();
      }
    };
  }, []);

  return (
    <div className="h-full w-full overflow-hidden">
      <div id="terminal" className="h-full p-2"></div>
    </div>
  );
};
