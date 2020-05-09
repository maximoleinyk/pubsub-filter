import { PubSub, Message } from '@google-cloud/pubsub';
import { Closable } from '../../interfaces';
import { ProcessConfig } from '../../config';

interface Publisher extends Closable {
  publish: (message: Message) => Promise<void>;
}

const publisher = async (config: ProcessConfig): Promise<Publisher> => {
  const {
    pubSubKey: { projectId, clientEmail, privateKey },
    outputTopic,
  } = config;
  const pubSub = new PubSub({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
  const topic = pubSub.topic(outputTopic, {
    batching: {
      maxMessages: 1,
    },
  });

  return {
    publish: async (message: Message) => {
      await topic.publish(message.data, message.attributes);
    },
    close: async () => {
      await pubSub.close();
    },
  };
};

export { Publisher, publisher };
