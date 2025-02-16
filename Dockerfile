FROM node:23

# Set the working directory inside the container
WORKDIR /app

RUN apt update && apt install -y sudo

# # Copy the rest of the application files
COPY . .

# run entrypoint
RUN sh ./docker-entrypoint.sh

# Expose the application port
EXPOSE ${PORT}

CMD ["node", "dist/main.js"]