#!/usr/bin/env bash

set -e # exit on error

# PROJECT_NAME is set from 'select-project.sh'
if [ -z ${PROJECT_NAME} ]; then
  echo "🚨 Unable to identify Project Name!"
  exit 1
fi

GCP_CIRCLE_KEY_NAME="GCLOUD_KEY_$(echo ${PROJECT_NAME} | sed 's/-/_/g' | tr 'a-z' 'A-Z')"

# Ensure there is a value set as an env var for this (hence the ! before the name).
if [ -z ${!GCP_CIRCLE_KEY_NAME} ]; then
  echo "🚨 GCLOUD KEY FOR ${GCP_CIRCLE_KEY_NAME} not found in CircleCI!"
  exit 1
fi

echo "✅ Figured out key name: ${GCP_CIRCLE_KEY_NAME}"

echo ${!GCP_CIRCLE_KEY_NAME} | base64 --decode > gcloud-key-${PROJECT_NAME}.json
gcloud auth activate-service-account --key-file=gcloud-key-${PROJECT_NAME}.json

# Get GCP project id and set it
GCP_PROJECT_ID="$(gcloud projects list --format="value(projectId)" --filter="name=${PROJECT_NAME}")"
gcloud config set project ${GCP_PROJECT_ID}

# Get GCP cluster information
GCP_CLUSTER="$(gcloud container clusters list --format="value(name)" --filter="name ~ ${GCP_PROJECT_ID}")"
GCP_CLUSTER_ZONE="$(gcloud container clusters list --format="value(location)" --filter="name ~ ${GCP_PROJECT_ID}")"

if [ -z ${GCP_CLUSTER} ]; then
  echo "🚨 Unable to figure out GCP cluster!"
  exit 1
fi

if [ -z ${GCP_CLUSTER_ZONE} ]; then
  echo "🚨 Unable to figure out GCP cluster zone!"
  exit 1
fi

if [ -z ${GCP_PROJECT_ID} ]; then
  echo "🚨 Unable to figure out GCP project id!"
  exit 1
fi

echo "✅ Selected Cluster: ${GCP_CLUSTER}"
echo "✅ Selected Cluster Zone 🗺: ${GCP_CLUSTER_ZONE}"
echo "✅ Selected Project Id: ${GCP_PROJECT_ID}"

echo "export GCP_PROJECT_ID=${GCP_PROJECT_ID}" >> $BASH_ENV
source $BASH_ENV

gcloud container clusters get-credentials ${GCP_CLUSTER} --zone ${GCP_CLUSTER_ZONE} --project ${GCP_PROJECT_ID}
cp gcloud-key-${PROJECT_NAME}.json ~/.config/gcloud/application_default_credentials.json
rm gcloud-key-${PROJECT_NAME}.json
