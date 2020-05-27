import * as R from 'ramda';

interface Config {
  app: AppConfig;
  pubSubKey: ServiceAccountKey;
  filterConfig: FilterConfig;
}

interface AppConfig {
  name: string;
  tcpPort: number;
}

interface FilterConfig {
  version: string;
  inputGroups: InputGroup[];
  outputTopic: string;
}

interface InputGroup {
  subscription: string;
  filterAttributeName?: string;
  filterLabels: string[];
}

interface ProcessConfig {
  pubSubKey: ServiceAccountKey;
  inputGroup: InputGroup;
  outputTopic: string;
}

interface ServiceAccountKey {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

const getOrError = (
  prop: string,
): (<T>(o: Record<string, T>) => string | number) =>
  R.compose(
    R.ifElse(
      R.isNil,
      () => {
        throw new Error(
          `ENV var ${prop} is undefined! Has .env.example been updated with any new env vars?`,
        );
      },
      R.identity,
    ),
    R.prop(prop),
  );

const decodeBase64 = R.compose(JSON.parse, (value: string) =>
  Buffer.from(value, 'base64').toString(),
);

const getPubSubKey = R.compose(
  R.converge(
    (projectId: string, privateKey: string, clientEmail: string) => ({
      projectId,
      privateKey,
      clientEmail,
    }),
    [
      R.propOr('', 'project_id'),
      R.propOr('', 'private_key'),
      R.propOr('', 'client_email'),
    ],
  ),
  decodeBase64,
  getOrError('SERVICE_ACCOUNT') as (o: {}) => string,
);

const getFilterConfig = R.compose(
  R.ifElse(
    (o: { version: string }) => o.version === 'v1',
    R.identity, // return as is
    R.identity, // v2 might have changes
  ),
  decodeBase64,
  getOrError('FILTER_CONFIG') as (o: {}) => string,
);

const getSentryDSN = getOrError('SENTRY_DSN');
const appConfig = R.converge(
  (name: string, tcpPort: number) => ({ name, tcpPort }),
  [getOrError('APP_NAME'), getOrError('TCP_PORT')],
);

const getConfig = R.converge(
  (
    app: AppConfig,
    pubSubKey: ServiceAccountKey,
    filterConfig: FilterConfig,
    sentryDSN: string,
  ) => ({
    app,
    pubSubKey,
    filterConfig,
    sentryDSN,
  }),
  [appConfig, getPubSubKey, getFilterConfig, getSentryDSN],
);

export { Config, ProcessConfig, InputGroup, getConfig };
