#!/bin/bash

RACINE="$(dirname "$(dirname "$(realpath "$0")")")"  

# Charger les variables depuis le fichier .env
if [ -f $RACINE/.env ]; then
  export $(grep -v '^#' "$RACINE/.env" | xargs)
fi

# Arrêter le script en cas d'erreur
set -e

# echo "🚀 Mise à jour du système..."
sudo apt update

echo "📥 Installation des dépendances..."
sudo apt install -y wget gnupg2 lsb-release curl

echo "🔑 Ajout de la clé GPG du dépôt officiel PostgreSQL..."
wget -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/postgresql.asc

echo "📌 Détection de la version de Debian..."
DEBIAN_VERSION=$(lsb_release -cs)

echo "📥 Ajout du dépôt officiel PostgreSQL pour Debian $DEBIAN_VERSION..."
echo "deb http://apt.postgresql.org/pub/repos/apt ${DEBIAN_VERSION}-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

echo "🔄 Mise à jour de la liste des paquets..."
sudo apt update

echo "🐘 Installation de PostgreSQL..."
sudo apt install -y postgresql

echo "🛠 Activation et démarrage du service PostgreSQL..."
sudo service postgresql start

echo "✅ Vérification du statut du service PostgreSQL..."
sudo service postgresql status

echo "🔍 Vérification de la version installée..."
psql --version

echo "🚀 PostgreSQL installé avec succès ! 🎉"

# Vérification si l'utilisateur existe déjà, sinon création
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DATABASE_USER'" | grep -q 1; then
  echo "Création de l'utilisateur $DATABASE_USER..."
  sudo -u postgres psql -c "CREATE USER $DATABASE_USER WITH PASSWORD '$DATABASE_PASSWORD';"
fi

# Vérification si la base existe, sinon création
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DATABASE_NAME'" | grep -q 1; then
  echo "Création de la base de données $DATABASE_NAME..."
  sudo -u postgres createdb -O $DATABASE_USER $DATABASE_NAME
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DATABASE_NAME TO $DATABASE_USER;"
fi
