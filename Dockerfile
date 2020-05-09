FROM node:12

COPY package*.json /code/
WORKDIR /code

CMD [ "node", "dist/index.js" ]
ADD . /code
