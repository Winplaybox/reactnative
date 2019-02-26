FROM node:11.9-slim
# Create app directory
WORKDIR /app

COPY ./server_app/package.json /app

RUN npm install --only=production
# If you are building your code for production
# RUN npm install --only=production

COPY ./server_app /app

CMD node bin/www

EXPOSE 8082