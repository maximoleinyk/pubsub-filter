import { ProcessConfig } from '../../config';
import { publisher } from './publisher';
import { subscriber } from './subscriber';
import { createFilter } from './filter';

const main = async (config: ProcessConfig) => {
  try {
    const pub = await publisher(config);
    const sub = await subscriber(config);

    await sub.subscribe(createFilter(pub, config.inputGroup));

    process.on('SIGTERM', async () => {
      try {
        await Promise.all([pub.close(), sub.close()]);
        console.info(`${process.pid} Closed pubsub channel.`);
      } catch (e) {
        // TODO: report to sentry
        console.error(e);
      } finally {
        console.info(`${process.pid} Exit.`);
        process.exit(0);
      }
    });

    console.info(
      `${process.pid} subscription acquired "${config.inputGroup.subscription}" filtering message to "${config.outputTopic}".`,
    );
  } catch (e) {
    console.error(`${process.pid} initialization failed.`, e.message);
    throw e;
  }
};

export default main;
