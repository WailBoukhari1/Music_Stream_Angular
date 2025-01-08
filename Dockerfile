# Development stage
FROM node:20-alpine

WORKDIR /app

# Create app user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install Angular CLI globally
RUN npm install -g @angular/cli@latest

# Copy package files
COPY package*.json ./

# Set correct permissions
RUN chown -R appuser:appgroup /app

# Switch to app user
USER appuser

# Install dependencies
RUN npm install

# Copy project files with correct ownership
COPY --chown=appuser:appgroup . .

# Create and set permissions for .angular directory
RUN mkdir -p /app/.angular/cache && \
    chown -R appuser:appgroup /app/.angular

# Expose port 4200
EXPOSE 4200

# Start the app with host binding
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000"] 