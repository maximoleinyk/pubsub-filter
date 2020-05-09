import { PubSub, Message, Subscription } from '@google-cloud/pubsub';
import { Closable } from '../../interfaces';
import { ProcessConfig } from '../../config';

interface Subscriber extends Closable {
  subscribe: (callback: (message: Message) => void) => Promise<void>;
}

const getSubscription = async (
  pubSub: PubSub,
  subscriptionName: string,
): Promise<Subscription> => {
  const subscription = pubSub.subscription(subscriptionName, {
    batching: {
      maxMessages: 1,
    },
  });
  const [exists] = await subscription.exists();

  if (exists) {
    return subscription;
  }

  // required for pubsub emulator
  let topic = pubSub.topic(subscriptionName);

  if (!(await topic.exists())[0]) {
    topic = (await topic.create())[0];
  }

  return (
    await pubSub.createSubscription(subscriptionName, subscriptionName)
  )[0];
};

const subscriber = async (config: ProcessConfig): Promise<Subscriber> => {
  const {
    pubSubKey: { projectId, clientEmail, privateKey },
    inputGroup: { subscription: subscriptionName },
  } = config;
  const pubSub = new PubSub({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
  const subscription = await getSubscription(pubSub, subscriptionName);

  return {
    subscribe: async (callback: (message: Message) => void) => {
      subscription.on('message', callback);
    },
    close: async () => {
      await pubSub.close();
    },
  };
};

export { Subscriber, subscriber };
