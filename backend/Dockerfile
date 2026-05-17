# 1. Use an official lightweight Node.js runtime environment as a parent image
FROM node:20-alpine

# 2. Set the working directory inside the virtual container
WORKDIR /app

# 3. Copy package.json and package-lock.json first to cache your dependencies
COPY package*.json ./

# 4. Install all the required NPM packages inside the container
RUN npm install

# 5. Copy the rest of your backend source code files into the container
COPY . .

# 6. Compile your TypeScript code into production-ready plain JavaScript
RUN npm run build

# 7. Expose the port your Express server listens on
EXPOSE 5000

# 8. Define the runtime command to start your backend server instance
CMD ["npm", "start"]