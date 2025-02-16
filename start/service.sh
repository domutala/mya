#!/bin/bash

# Variables
SERVICE_NAME="mya.service"
SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME"
NODEJS_APP_PATH="$(dirname "$(dirname "$(realpath "$0")")")"  # Use the current directory as the path to the Node.js app
NODEJS_EXEC="/usr/bin/node"  # Path to Node.js, adjust if necessary
NPM_EXEC="/usr/bin/npm"

cd $NODEJS_APP_PATH
$NPM_EXEC install
$NPM_EXEC build

# Create the service file
echo "Creating the systemd service..."

sudo systemctl stop $SERVICE_NAME

cat <<EOL > $SERVICE_PATH
[Unit]
Description=Node.js Service for mya application
After=network.target

[Service]
ExecStart=$NODEJS_EXEC -r tsconfig-paths/register dist/main.js
WorkingDirectory=$NODEJS_APP_PATH
Restart=always
User=nobody  # You can adjust the user according to your setup
Group=nogroup  # You can adjust the group according to your setup
Environment=NODE_ENV=production  # Add other environment variables if needed

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd services
echo "Reloading systemd services..."
systemctl daemon-reload

# Enable and start the service
echo "Enabling and starting the service..."
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

echo "Service $SERVICE_NAME created, enabled, and started."
