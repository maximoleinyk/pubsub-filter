# What is this for?

PubSub-filter helps to reduce your service resource utilisation by offloading message filtering process into separate process. Having a separate process that deals with event filtering of high volumes of pubsub messages allows you to create only one topic per service. As a result boilerplate code would be removedd from your service codebase.

![Architecture Overview](https://github.com/maximoleinyk/pubsub-filter/blob/master/image.png 'Architecture Overview')

## Functional Requirements

- messages that are not specified in the config must be filtered out from the output topic
- messages published to multiple topics should be routed into a single output topic specified in the config

## Non-functional Requirements

- the service must guarantee the delivery of the filtered messages
- the service must be auto-scaled
- the service must provide 99.95% SLO
- the service must handle every input topic subscription in its own sandboxed process
- the service must implement a fault tolerant mechanism for event handling (shall any event handling process dies unexpectedly the new process is spawned instead)

## General Usage Requirements

- created solution must produce a single docker image
- consumers must be able to deploy instance group by only using k8s manifest
- interactive shell tool must be provided to ease the process of YAML file generation

## PubSub Message Requirements

Here's an example of a PubSub message schema:

```
{
  "data": string;
  "attributes": {
    "eventName": string;
  };
  "messageId": string;
  "publishTime": string;
}
```

The only requirement for a message is to have a field in the `"attributes"` object that represents a message label. Messages would be routed from the input topics to the output topic based on the labels provided in the service config. Messages whose labels don't match would not be published to the output topic.

## Config Schema

Here's a filter config schema:

```
Config {
  "version": "v1",
  "inputGroups": List<{
    "subscription": string;
    "filterAttributeName": string;
    "filterLabels": List<RegExp>;
  }>;
  "outputTopic": string;
}
```

Config is versioned which makes it easy to add changes in future.

## Build Outputs

- CircleCI build uploads a docker image called `pubsub-filter:latest`
- every successful push to the GCR is followed by a release of the CLI package

## How can I use it?

1. Download pubsub-filter CLI:

```bash
yarn install pubsub-filter
```

2. Generate k8s manifest by running:

```bash
yarn pubsub-filter
```

3. Update CI build config:

```yaml
- run:
    name: Deploy PubSub Filter
    command: kubectl apply -f ${PUBSUB_FILTER_MANIFEST}
```

4. Job done.

## Manifest Genarator (CLI)

CLI tool must provide an ability to configure these k8s paramenters:

- service name
- config file path
- min/max instances
- requests CPU/RAM
- limits CPU/RAM
- output directory

## Manifest Anatomy

k8s manifest consists of:

- 1 pod config
- 1 configmap
- 1 secret

Configmap holds these keys:

- filterLabelName: `string`;
- config: `Base64String`;

## Testing Environment

Testing environment would require few things to be deployed in the k8s cluster:

- pubsub-filter service itself
- a service that subscribes to a single (filtered) topic
- a service that generates pubsub messages

In terms of topics we would need:

- three input topics (with subscriptions) that would be used by the pubsub-filter pods
- one output topic that would be used by the receiver service pods

