import * as R from 'ramda';
import { Message } from '@google-cloud/pubsub';
import { InputGroup } from '../../config';
import { Publisher } from './publisher';

const createFilter = (publisher: Publisher, inputGroup: InputGroup) => async (
  message: Message,
) => {
  const { filterLabels, filterAttributeName = 'eventName' } = inputGroup;

  try {
    const label = message.attributes[filterAttributeName];

    if (R.isNil(label)) {
      throw new Error(
        `Missing "${filterAttributeName}" attribute in pubsub message "${message.id}".`,
      );
    }

    if (filterLabels.includes(label)) {
      await publisher.publish(message);
      console.log(
        `${process.pid} - "${message.id}" message with "${label}" label filtered.`,
      );
    }

    message.ack();
  } catch (e) {
    console.error(e.message);
    message.nack();
    // TODO: report to sentry
  }
};

export { createFilter };
