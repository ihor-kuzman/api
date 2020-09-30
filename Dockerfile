FROM node:12.13.0

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --network-timeout 100000

COPY . .

RUN NODE_ENV=development NODE_OPTIONS=--max_old_space_size=4096 yarn build

CMD node build/api.bundle
