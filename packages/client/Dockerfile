# development
FROM node:18 
WORKDIR /app
COPY package*.json ./
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
    then yarn install; \
    else yarn install --only=production; \
    fi
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]

