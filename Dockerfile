# Build stage
FROM node:22-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
# If you're using yarn, copy yarn.lock instead:
# COPY package.json yarn.lock ./

# Install dependencies
RUN npm ci --only=production=false
# If using yarn:
# RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN npm run build
# If using yarn:
# RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional - see below)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]