import { promisify } from 'util';
import { IPCMessage } from '../interfaces';

let processor: any;

const onMessage = async (msg: IPCMessage) => {
  switch (msg.cmd) {
    case 'INIT':
      processor = require(msg.value);

      if (processor.default) {
        // support es2015 module.
        processor = processor.default;
      }

      if (processor.length > 1) {
        processor = promisify(processor);
      } else {
        const origProcessor = processor;
        processor = function () {
          try {
            return Promise.resolve(origProcessor.apply(null, arguments));
          } catch (err) {
            return Promise.reject(err);
          }
        };
      }
      break;
    case 'EXECUTE':
      try {
        const result = await Promise.resolve(processor(msg.value));

        process.send!({
          cmd: 'SUCCESS',
          value: result,
        });
      } catch (err) {
        process.send!({
          cmd: 'FAILURE',
          value: err,
        });
      }
      break;
    default:
      // do nothing;
      break;
  }
};
process.on('message', onMessage);

const onUncaughtException = (e: Error) => {
  console.error(`${process.pid} uncaught exception.`, e);

  // re-throw
  throw e;
};
process.on('uncaughtException', onUncaughtException);

const onExit = () => {
  process.removeListener('uncaughtException', onUncaughtException);
  process.removeListener('message', onMessage);
  process.removeListener('exit', onExit);

  console.info(`${process.pid} exiting...`);
};
process.on('exit', onExit);
