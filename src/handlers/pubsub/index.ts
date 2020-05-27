import { ProcessConfig } from '../../config';
import { publisher } from './publisher';
import { subscriber } from './subscriber';
import { createFilter } from './filter';

const main = async (config: ProcessConfig) => {
  try {
    const pub = await publisher(config);
    const sub = await subscriber(config);

    const sigtermHandler = async () => {
      process.removeListener('SIGTERM', sigtermHandler);

      try {
        await Promise.all([pub.close(), sub.close()]);
        console.info(`${process.pid} PubSub channel closed.`);

        process.exit(0);
      } catch (e) {
        console.error(`${process.pid} PubSub channel failed to close.`, e);
        // TODO: report to sentry
        process.exit(1);
      }
    };

    await sub.subscribe(createFilter(pub, config.inputGroup));
    console.info(
      `${process.pid} - "${config.inputGroup.subscription}" subscription acquired.`,
    );

    process.on('SIGTERM', sigtermHandler);
  } catch (e) {
    console.error(`${process.pid} initialization failed.`, e.message);
    throw e;
  }
};

export default main;
