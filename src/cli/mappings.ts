import { Path } from 'ramda';
import { Question } from './questions';

type Kind = 'deployment' | 'configmap' | 'hpa';

const QUESTION_RELEVANCE_MAPPING: {
  [K in Question]: { [T in Kind]: Path[] };
} = {
  APP_NAME: {
    deployment: [
      ['metadata', 'name'],
      ['metadata', 'labels', 'app'],
      ['spec', 'selector', 'matchLabels', 'app'],
      ['spec', 'template', 'metadata', 'labels', 'app'],
      ['spec', 'template', 'spec', 'containers', 0, 'name'],
      [
        'spec',
        'template',
        'spec',
        'containers',
        0,
        'envFrom',
        0,
        'configMapRef',
        'name',
      ],
    ],
    configmap: [
      ['metadata', 'name'],
      ['metadata', 'labels', 'app'],
      ['data', 'APP_NAME'],
    ],
    hpa: [
      ['metadata', 'name'],
      ['metadata', 'labels', 'app'],
      ['spec', 'scaleTargetRef', 'name'],
    ],
  },
  PROJECT_ID: {
    deployment: [['spec', 'template', 'spec', 'containers', 0, 'image']],
    configmap: [],
    hpa: [],
  },
  TEAM_NAME: {
    deployment: [['metadata', 'labels', 'team']],
    configmap: [['metadata', 'labels', 'team']],
    hpa: [['metadata', 'labels', 'team']],
  },
  NAMESPACE: {
    deployment: [['metadata', 'namespace']],
    configmap: [['metadata', 'namespace']],
    hpa: [['metadata', 'namespace']],
  },
  MAX_REPLICAS: {
    deployment: [],
    configmap: [],
    hpa: [['spec', 'maxReplicas']],
  },
  CPU_THRESHOLD: {
    deployment: [],
    configmap: [],
    hpa: [['spec', 'targetCPUUtilizationPercentage']],
  },
  REQUESTS_CPU: {
    deployment: [
      [
        'spec',
        'template',
        'spec',
        'containers',
        0,
        'resources',
        'requests',
        'cpu',
      ],
    ],
    configmap: [],
    hpa: [],
  },
  REQUESTS_MEMORY: {
    deployment: [
      [
        'spec',
        'template',
        'spec',
        'containers',
        0,
        'resources',
        'requests',
        'memory',
      ],
    ],
    configmap: [],
    hpa: [],
  },
  LIMITS_CPU: {
    deployment: [
      [
        'spec',
        'template',
        'spec',
        'containers',
        0,
        'resources',
        'limits',
        'cpu',
      ],
    ],
    configmap: [],
    hpa: [],
  },
  LIMITS_MEMORY: {
    deployment: [
      [
        'spec',
        'template',
        'spec',
        'containers',
        0,
        'resources',
        'limits',
        'memory',
      ],
    ],
    configmap: [],
    hpa: [],
  },
  FILTER_CONFIG: {
    deployment: [],
    configmap: [['data', 'FILTER_CONFIG']],
    hpa: [],
  },
  SENTRY_DSN: {
    deployment: [],
    configmap: [['data', 'SENTRY_DSN']],
    hpa: [],
  },
  OUTPUT_DIR: {
    deployment: [],
    configmap: [],
    hpa: [],
  },
};

export { Kind, QUESTION_RELEVANCE_MAPPING };
