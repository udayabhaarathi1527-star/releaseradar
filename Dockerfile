FROM node:22-bookworm

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Application directory
WORKDIR /app

# Install Python ML dependencies
COPY requirements.txt ./requirements.txt
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

# Install Node backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy the application
COPY server ./server
COPY ml ./ml

# Render provides the PORT environment variable
ENV PYTHONUNBUFFERED=1

WORKDIR /app/server

CMD ["npm", "start"]
