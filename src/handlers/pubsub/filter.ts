import * as R from 'ramda';
import { Message } from '@google-cloud/pubsub';
import { InputGroup } from '../../config';
import { Publisher } from './publisher';
import { withTimeRecorder } from '../../util';

const createFilter = (publisher: Publisher, inputGroup: InputGroup) =>
  withTimeRecorder(`Filtering completed.`, async (message: Message) => {
    const { filterLabels, filterAttributeName = 'eventName' } = inputGroup;
    const label = message.attributes[filterAttributeName];

    try {
      if (R.isNil(label)) {
        throw new Error(
          `Missing "${filterAttributeName}" attribute in pubsub message "${message.id}".`,
        );
      }

      console.log(
        `${process.pid} filtering ${
          message.attributes[filterAttributeName]
        } - ${JSON.stringify(inputGroup)}`,
      );

      if (filterLabels.includes(label)) {
        await publisher.publish(message);
        console.info(
          `${process.pid} - "${message.id}" message with "${label}" label filtered.`,
        );
      }

      message.ack();
    } catch (e) {
      console.error(e.message);
      message.nack();
      // TODO: report to sentry
    }
  });

export { createFilter };
