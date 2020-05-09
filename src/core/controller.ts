import * as path from 'path';
import { ChildProcess, fork } from 'child_process';
import executor, { Executor } from './executor';

class ChildProcessController {
  private destroyed: boolean;
  private retained: { [key: number]: ChildProcess };

  constructor() {
    this.retained = {};
    this.destroyed = false;
  }

  async retain<T>(processFile: string): Promise<Executor> {
    if (this.destroyed) {
      throw new Error('Controller has been destroyed.');
    }

    const child = fork(path.resolve(__dirname, 'process.js'), [], {
      execArgv: process.execArgv,
    });

    this.retained[child.pid] = child;

    // initialize child process
    await new Promise((resolve: (error: Error | null) => void) =>
      child.send({ cmd: 'INIT', value: processFile }, resolve),
    );

    return executor(child, processFile, this);
  }

  remove(pid: number) {
    delete this.retained[pid];
  }

  isDestroyed() {
    return this.destroyed;
  }

  destroy() {
    this.destroyed = true;

    Object.values(this.retained).forEach((child: ChildProcess) => {
      this.remove(child.pid);
      child.kill('SIGTERM');
      child.removeAllListeners('exit');
    });

    this.retained = {};
  }
}

export { ChildProcessController };
