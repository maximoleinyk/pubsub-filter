import * as path from 'path';
import * as http from 'http';
import * as dotenv from 'dotenv';
import { getConfig, InputGroup } from './config';
import { ChildProcessController } from './core/controller';
import { withTimeRecorder } from './util';

const main = withTimeRecorder(
  `Initialization completed.`,
  async (process: NodeJS.Process) => {
    let tcpServer: http.Server | undefined;
    const controller = new ChildProcessController();

    try {
      const {
        app: { tcpPort },
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
      console.info(`${process.pid} Sandbox processes created successfully.`);

      tcpServer = await new Promise((resolve: Function) => {
        const server = http
          .createServer((_: any, res: http.ServerResponse) => {
            res.writeHead(200);
            res.end('ok');
          })
          .listen(tcpPort, () => {
            console.info(
              `${process.pid} TCP server is running on port ${tcpPort}`,
            );
            resolve(server);
          });
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    process.on('SIGTERM', () => {
      if (typeof tcpServer !== 'undefined') {
        tcpServer.close();
        console.info(`${process.pid} TCP sockets closed.`);
      }

      controller.destroy();
      console.info(`${process.pid} Child processes terminated.`);

      process.removeAllListeners();
      process.exit(0);
    });

    process.on('uncaughtException', (e: Error) => {
      console.error(`Uncaught exception in parent process ${process.pid}.`, e);
      // report to Sentry
      process.exit(1);
    });
  },
);

if (require.main === module) {
  dotenv.config();
  main(process);
}
