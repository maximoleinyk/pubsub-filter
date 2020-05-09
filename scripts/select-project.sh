#!/bin/sh

# Based on the branch currently in, select the GCP project and set it as an ENV var

if [ "${CIRCLE_BRANCH}" = "stage" ]; then
  echo "Selected STAGE environment."
  echo "export PROJECT_NAME=stage" >> $BASH_ENV
  echo "export ENV_VAR_PREFIX=STAGE" >> $BASH_ENV
elif [ "${CIRCLE_BRANCH}" = "master" ]; then
  echo "Selected PROD environment."
  echo "export PROJECT_NAME=prod" >> $BASH_ENV
  echo "export ENV_VAR_PREFIX=PROD" >> $BASH_ENV
else
  echo "Selected DEV environment."
  echo "export PROJECT_NAME=dev" >> $BASH_ENV
  echo "export ENV_VAR_PREFIX=DEV" >> $BASH_ENV
fi

source $BASH_ENV
