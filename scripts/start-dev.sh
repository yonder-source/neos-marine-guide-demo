#!/bin/sh
set -eu

cd /app

# Use the committed lockfile, including development tools and Neos installer scripts.
composer install --no-interaction --prefer-dist
test -x ./flow

# These commands also support an existing development database.
./flow doctrine:migrate
./flow cr:setup --content-repository default

sites=$(./flow site:list)
if printf '%s\n' "$sites" | grep -q 'No sites available'; then
    ./flow site:create --node-name collection '典藏與分眾導覽' Collection.Site Collection.Site:Document.Homepage
fi

./flow resource:publish
exec ./flow server:run --host 0.0.0.0 --port 8081
