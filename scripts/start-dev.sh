#!/bin/sh
set -eu

cd /app

# Use the committed lockfile, including development tools and Neos installer scripts.
composer install --no-interaction --prefer-dist
test -x ./flow

# Discover newly added package commands when reusing a development checkout.
./flow flow:cache:flush --force

# These commands also support an existing development database.
./flow doctrine:migrate
./flow cr:setup --content-repository default

./flow marine:initializedemo

./flow resource:publish
exec ./flow server:run --host 0.0.0.0 --port 8081
