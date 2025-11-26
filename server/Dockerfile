# Use official Node.js image
FROM node:20-slim

# 1. Install Google Chrome dependencies (Crucial for Puppeteer)
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 2. Set up App
WORKDIR /usr/src/app

# 3. Copy package files and install dependencies
COPY package*.json ./
# Install dependencies (including Puppeteer)
RUN npm ci

# 4. Copy the rest of the app
COPY . .

# 5. Expose the port
EXPOSE 5000

# 6. Start the server
CMD [ "node", "index.js" ]