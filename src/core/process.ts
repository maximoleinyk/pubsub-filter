import { promisify } from 'util';
import { IPCMessage } from '../interfaces';

let processor: any;

process.on('message', async (msg: IPCMessage) => {
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
});
