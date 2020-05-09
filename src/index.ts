import * as path from 'path';
import * as dotenv from 'dotenv';
import { getConfig, InputGroup } from './config';
import { ChildProcessController } from './core/controller';

const main = async (process: NodeJS.Process) => {
  const controller = new ChildProcessController();

  console.info(`${process.pid} service initialization started.`);

  try {
    const {
      filterConfig: { inputGroups, outputTopic },
      pubSubKey,
    } = getConfig(process.env);

    await Promise.all(
      inputGroups.map(async (inputGroup: InputGroup) => {
        const start = await controller.retain(
          path.resolve(__dirname, 'handlers/pubsub/index.js'),
        );

        return start({
          inputGroup,
          outputTopic,
          pubSubKey,
        });
      }),
    );

    console.info(`${process.pid} service initialization completed.`);
  } catch (e) {
    console.error(`${process.pid} service initialization failed.`, e);
    process.exit(1);
  }

  process.on('SIGTERM', async () => {
    controller.destroy();
    console.info(`Main process exiting...`);
  });
};

if (require.main === module) {
  dotenv.config();
  main(process);
}
