interface IPCMessage {
  cmd: 'INIT' | 'EXECUTE' | 'SUCCESS' | 'FAILURE';
  value: any;
}

interface Closable {
  close: () => Promise<void>;
}

export { IPCMessage, Closable };
