# 1. Use an official lightweight Node.js runtime environment as a parent image
FROM node:20-alpine

# 2. Set the working directory inside the virtual container
WORKDIR /app

# 3. Copy package.json and package-lock.json first to speed up container builds
COPY package*.json ./

# 4. Install all the required frontend NPM packages inside the container
RUN npm install

# 5. Copy the rest of your React frontend source code files
COPY . .

# 6. Expose the port Vite runs on locally
EXPOSE 5173

# 7. Define the runtime command to boot up the Vite local server instance
CMD ["npm", "run", "dev", "--", "--host"]