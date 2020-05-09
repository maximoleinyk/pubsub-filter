#!/bin/sh
set -e

BUILD_NUM=$(cat ./.build_num)

if [ -z "${BUILD_NUM}" ]; then
  echo "No build number to build with"
  exit 1
fi

APP_NAME="${1}"
BRANCH_NAME="${2}"

GCP_PROJECT_ID="$(gcloud projects list --format="value(projectId)" --filter="name=${PROJECT_NAME}")"
CONTAINER_BASE_NAME="eu.gcr.io/${GCP_PROJECT_ID}:${APP_NAME}"

docker build -t "${CONTAINER_BASE_NAME}:${BUILD_NUM}" . --no-cache --force-rm
docker push "${CONTAINER_BASE_NAME}:${BUILD_NUM}"

if [ "${BRANCH_NAME}" = "master" ]; then
  docker tag "${CONTAINER_BASE_NAME}:latest" "${CONTAINER_BASE_NAME}"
  docker push "${CONTAINER_BASE_NAME}"
fi
