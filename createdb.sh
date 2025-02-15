#!/bin/bash

# Charger les variables depuis le fichier .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi
# Créer le network s'il n'existe pas
if ! docker network ls | grep -q deploy_network; then
  docker network create deploy_network
fi

if ! docker ps | grep -q deploy_dev_db; then
  docker run -d \
    --name deploy_dev_db \
    --network deploy_network \
    -p $DATABASE_PORT:5432 \
    -e POSTGRES_USER=$DATABASE_USER \
    -e POSTGRES_PASSWORD=$DATABASE_PASSWORD \
    -e POSTGRES_DB=$DATABASE_NAME \
    -v deploy_dev_db:/var/lib/postgresql/data \
    postgres:latest
fi
