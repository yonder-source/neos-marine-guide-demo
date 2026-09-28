# Marine Guide Demo — Neos CMS

A Neos CMS demo built with the `Collection.Site` package. The marine guide uses a hawksbill turtle to demonstrate a slide-based experience for large displays, conservation actions, research evidence, and interactive questions. The guide supports English and Traditional Chinese content.

## Getting started

Install Docker with Compose support, VS Code, and the Dev Containers extension on the host. PHP, Composer, and MariaDB run in containers.

1. Clone this repository on the host using HTTPS and open the folder in VS Code.
2. Run `Dev Containers: Reopen in Container` from the Command Palette.
3. Wait for the container to build, then complete the initial setup below.
4. Open http://localhost:8081; the Neos backend is at http://localhost:8081/neos.

The Dev Container uses `compose.yaml` to start the application and database. You do not need to run `docker compose up` separately. Run all PHP, Composer, and Flow commands in the VS Code terminal inside the Dev Container.

For a fresh checkout of this version, temporarily set `"overrideCommand": true` in `.devcontainer/devcontainer.json` before reopening. This keeps the container running while you install dependencies and initialize the site.

The Traditional Chinese route is `/zh`.

## Initial setup

This version requires manual initialization inside the Dev Container.

Install the locked dependencies, configure the database, and create the site inside the Dev Container:

```bash
composer install
./flow neos.flow:package:rescan
./flow doctrine:migrate
./flow cr:setup
./flow site:create --node-name collection 'Marine Guide Demo' Collection.Site Collection.Site:Document.Homepage
./flow resource:publish
```

After initialization, start the development server in the container terminal:

```bash
./flow server:run --host 0.0.0.0 --port 8081
```

Keep this terminal running while using the site. Once the workspace is initialized, set `"overrideCommand": false` and run `Dev Containers: Rebuild and Reopen in Container` to let Compose start the server on subsequent launches.

Database connection settings are in `Configuration/Development/Docker/Settings.yaml` and use the local Compose `db` service. Do not recreate an existing site.

Create a local administrator inside the Dev Container:

```bash
./flow user:create <username> <password> <first-name> <last-name> --roles Administrator
```

A new site starts with demo defaults defined in the NodeTypes. To provide bilingual content, create the language variants in the Neos backend and edit their translations.

## Development measurement

Plumber is installed as a Composer development dependency. Generate page requests, then browse http://localhost:8081/plumber.

Footprint Sentinel modules are available in the site package’s `Resources/Public/footprint-sentinel/` directory but are not yet loaded on the homepage.
