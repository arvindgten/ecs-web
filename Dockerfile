FROM 370531249777.dkr.ecr.ap-south-1.amazonaws.com/node:8.3.0

# Install app dependencies
COPY package.json .
COPY util util
RUN npm install

# Bundle app source
COPY src src
COPY server.js .

EXPOSE 80
