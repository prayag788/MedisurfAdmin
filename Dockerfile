# Create image based on the official Node image from dockerhub
FROM node:14.18

# Create app directory
WORKDIR /app/admin

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/admin/node_modules/.bin:$PATH

# Copy dependency definitions
COPY package.json /app/admin

# Install dependecies
#RUN npm set progress=false \
#    && npm config set depth 0 \
#    && npm i install
RUN npm i yarn 
RUN yarn install

# Get all the code needed to run the app
COPY . /app/admin

RUN yarn run build
# ==== RUN =======
# Set the env to "production"
# ENV NODE_ENV production

RUN npm install -g serve

# Set the command to start the node server.
CMD serve -s build

# Tell Docker about the port we'll run on.
EXPOSE 3000