import * as fs from 'fs';
import { PromptModule, Answers } from 'inquirer';

type Question =
  | 'APP_NAME'
  | 'PROJECT_ID'
  | 'TEAM_NAME'
  | 'NAMESPACE'
  | 'MAX_REPLICAS'
  | 'CPU_THRESHOLD'
  | 'REQUESTS_CPU'
  | 'REQUESTS_MEMORY'
  | 'LIMITS_CPU'
  | 'LIMITS_MEMORY'
  | 'FILTER_CONFIG'
  | 'SENTRY_DSN'
  | 'OUTPUT_DIR';

const askQuestions = async (
  prompt: PromptModule,
  config: { appName: string },
): Promise<Answers> =>
  await prompt<{ [K in Question]: any }>([
    {
      name: 'APP_NAME',
      type: 'input',
      message: 'Service name (i.e. app-name):',
      suffix: `-${config.appName}`,
    },
    {
      name: 'PROJECT_ID',
      type: 'input',
      message: 'GCP Project ID (i.e. bulb-platform-dev-fd41):',
      default: 'bulb-platform-dev-fd41',
      validate: (v: string) => !!v,
    },
    {
      name: 'TEAM_NAME',
      type: 'input',
      message: 'Team name (i.e. pod-platform):',
    },
    {
      name: 'NAMESPACE',
      type: 'input',
      message: 'Namespace (default):',
      default: 'default',
    },
    {
      name: 'MAX_REPLICAS',
      type: 'input',
      message: 'Max number of deployment instances:',
      default: 20,
      filter: Number,
    },
    {
      name: 'CPU_THRESHOLD',
      type: 'input',
      message: 'CPU threshold (0 to 100):',
      default: 60,
      filter: Number,
    },
    {
      name: 'REQUESTS_CPU',
      type: 'input',
      message: 'Requests CPU (i.e 0.1 or 1):',
      default: 1,
    },
    {
      name: 'REQUESTS_MEMORY',
      type: 'input',
      message: 'Requests memory (i.e 1Gi):',
      default: '1Gi',
    },
    {
      name: 'LIMITS_CPU',
      type: 'input',
      message: 'Limits CPU (i.e 0.1 or 1):',
      default: 1,
    },
    {
      name: 'LIMITS_MEMORY',
      type: 'input',
      message: 'Limits memory (i.e 1Gi):',
      default: '1Gi',
    },
    {
      name: 'FILTER_CONFIG',
      type: 'input',
      message: 'Config file path:',
      validate: (path: string) => fs.existsSync(path),
    },
    {
      name: 'SENTRY_DSN',
      type: 'input',
      message: 'Sentry DSN:',
      validate: (value: string) => !!value.trim().length,
    },
    {
      name: 'OUTPUT_DIR',
      type: 'input',
      message: 'Output file directory:',
    },
  ]);

export { Question, askQuestions };
