import { ChildProcess } from 'child_process';
import { IPCMessage } from '../interfaces';
import { ProcessConfig } from '../config';
import { ChildProcessController } from './controller';

interface Executor {
  (config: ProcessConfig): Promise<any>;
}

const executor = (
  child: ChildProcess,
  processFile: string,
  controller: ChildProcessController,
): Executor => async (config: ProcessConfig) => {
  let messageHandler: any;

  const done = new Promise((resolve, reject) => {
    messageHandler = (msg: IPCMessage) => {
      switch (msg.cmd) {
        case 'SUCCESS':
          resolve(msg.value);
          break;
        case 'FAILURE':
          reject(msg.value);
          break;
      }
    };

    child.on('message', messageHandler);
  });
  const exitHandler = async () => {
    // remove current process
    controller.remove(child.pid);

    // parent process is about to be terminated
    if (controller.isDestroyed()) {
      child.removeListener('exit', exitHandler);
      return;
    }

    // create new process instead
    const start = await controller.retain(processFile);
    // execute immediately
    await start(config);
  };

  child.on('exit', exitHandler);
  child.send({
    cmd: 'EXECUTE',
    value: config,
  });

  try {
    await done;
  } finally {
    child.removeListener('message', messageHandler);
  }
};

export { Executor };

export default executor;
