#!/bin/bash
# Script to install PostgreSQL 17.10 on Ubuntu 24.04 (Noble)
set -e

PASSWORD="091122"

echo "=== PostgreSQL 17.10 Installation Script ==="

# 1. Update OS package lists and install prerequisites
echo "--> Installing prerequisites (curl, ca-certificates, gnupg)..."
echo "$PASSWORD" | sudo -S apt-get update
echo "$PASSWORD" | sudo -S apt-get install -y curl ca-certificates gnupg

# 2. Add the official PostgreSQL repository key
echo "--> Adding PostgreSQL official GPG key..."
echo "$PASSWORD" | sudo -S install -d /usr/share/postgresql-common/pgdg
echo "$PASSWORD" | sudo -S curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc

# 3. Create the repository source list
echo "--> Creating APT repository configuration..."
cat <<EOF > /home/smz/docs-zh/pgdg.sources
Types: deb
URIs: https://apt.postgresql.org/pub/repos/apt
Suites: noble-pgdg
Architectures: amd64
Components: main
Signed-By: /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
EOF
echo "$PASSWORD" | sudo -S mv /home/smz/docs-zh/pgdg.sources /etc/apt/sources.list.d/pgdg.sources

# 4. Update packages and install PostgreSQL 17
echo "--> Updating APT package index..."
echo "$PASSWORD" | sudo -S apt-get update

echo "--> Installing PostgreSQL 17.10..."
echo "$PASSWORD" | sudo -S apt-get install -y postgresql-17 postgresql-client-17

# 5. Modify postgres user password to postgres
echo "--> Changing postgres database user password to 'postgres'..."
# Wait a moment for the PostgreSQL service to initialize and start
sleep 5
echo "$PASSWORD" | sudo -S -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# 6. Check installation
echo "=== Verification ==="
installed_ver=$(psql --version)
echo "Installed client version: $installed_ver"

echo "Checking PostgreSQL service status..."
echo "$PASSWORD" | sudo -S systemctl status postgresql --no-pager

echo "--> Checking active PostgreSQL version..."
echo "$PASSWORD" | sudo -S -u postgres psql -c "SELECT version();"

echo "=== PostgreSQL 17.10 Installation Completed Successfully! ==="
