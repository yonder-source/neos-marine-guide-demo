# Marine Guide Demo — Neos CMS

A Neos CMS demo built with the `Collection.Site` package. The marine guide uses a hawksbill turtle to demonstrate a slide-based experience for large displays, conservation actions, research evidence, and interactive questions. Content supports English and Traditional Chinese, with children, adult, and expert audiences.

## Getting started

Install Docker with Compose support, VS Code, and the Dev Containers extension on the host. PHP, Composer, and MariaDB run in containers.

1. Clone this repository on the host using HTTPS and open the folder in VS Code.
2. Run `Dev Containers: Reopen in Container` from the Command Palette.
3. Wait for the container to build and finish initialization.
4. Open http://localhost:8081; the Neos backend is at http://localhost:8081/neos.

The Dev Container uses `compose.yaml` to start the application and database. You do not need to run `docker compose up` separately. Run all PHP, Composer, and Flow commands in the VS Code terminal inside the Dev Container.

On startup, the container installs the dependencies pinned in `composer.lock`, runs database migrations, sets up the Content Repository, imports the complete bilingual Collection demo if no site exists, and publishes resources. Existing sites are preserved. If dependency installation or initialization fails, the container stops and logs the error.

View startup output in the Dev Containers log (`Dev Containers: Show Container Log`).

The Traditional Chinese route is `/zh`. English adult content uses `/`; children and expert content use `/children` and `/experts`.

Dev Containers can reuse the host’s configured HTTPS Git credential helper. SSH agent forwarding is not configured by this project.

If port 8081 is in use, set `NEOS_HTTP_PORT=8082` in an untracked `.env` file before reopening the Dev Container, then open port 8082 instead.

## Initial setup

Compose and the Dev Container share `scripts/start-dev.sh` for initialization. After changing the Dev Container configuration, run `Dev Containers: Rebuild and Reopen in Container`. The first build may take several minutes to download dependencies.

After changing Composer packages, rescan packages inside the Dev Container:

```bash
./flow neos.flow:package:rescan
```

Database connection settings are in `Configuration/Development/Docker/Settings.yaml` and use the local Compose `db` service. Do not recreate an existing site.

Create a local administrator inside the Dev Container:

```bash
./flow user:create <username> <password> <first-name> <last-name> --roles Administrator
```

The committed `DistributionPackages/Collection.Site/Resources/Private/Content/` contains the original published English and Traditional Chinese demo, all three audiences, and the referenced image, recovered from the legacy Neos database. It uses Neos 9.1's native content export format; XLIFF supplies interface labels.

On first startup with an empty database, `scripts/start-dev.sh` runs `./flow marine:initializedemo` after database migrations and Content Repository setup. This imports all six language/audience variants automatically. English routes are `/`, `/children`, `/experts`; Traditional Chinese routes are `/zh`, `/zh-children`, `/zh-experts`.

For manual initialization after `./flow doctrine:migrate` and `./flow cr:setup --content-repository default`, run:

```bash
./flow marine:initializedemo
./flow resource:publish
```

Existing sites are skipped and their content is preserved. Content without a site record causes initialization to stop. To reproduce the demo, use a fresh database volume; this command does not update an existing site's text. The imported demo already uses the current audience model and does not need the legacy migrations below.

## Upgrading an existing site to audience dimensions

This sequence is for an existing site with English and Chinese content created before the audience dimension was introduced. It is not part of fresh-site initialization. Back up the database and resources before upgrading, and run the commands in order inside the Dev Container:

```bash
./flow nodemigration:execute 20260928120001
./flow content:createvariantsrecursively '{"language":"en","audience":"adult"}' '{"language":"en","audience":"children"}'
./flow content:createvariantsrecursively '{"language":"en","audience":"adult"}' '{"language":"en","audience":"expert"}'
./flow content:createvariantsrecursively '{"language":"zh","audience":"adult"}' '{"language":"zh","audience":"children"}'
./flow content:createvariantsrecursively '{"language":"zh","audience":"adult"}' '{"language":"zh","audience":"expert"}'
./flow nodemigration:execute 20260928120002
./flow workspace:rebaseoutdated
./flow flow:cache:flush
```

`Version20260928120001` moves existing language content to the adult dimension and adds shine-through for children and experts. The next commands create independent audience variants. `Version20260928120002` then renames the audience-specific editorial properties to shared property names. Migration definitions are in `DistributionPackages/Collection.Site/Migrations/ContentRepository/`.

## Development measurement

Plumber is installed as a Composer development dependency. Generate page requests, then browse http://localhost:8081/plumber.

Footprint Sentinel is loaded on the homepage for local measurement. It reports resource transfer bytes and highlights large resources, excluding its own modules from the measurements. Use `?sentinel=off` to hide it for the current tab, including subsequent navigation; use `?sentinel=on` to show it again. To remove it after measurement, remove the `footprintSentinel` script include from `Page.fusion`.

## Running without VS Code

As an alternative to the Dev Container workflow, run the same stack from the host:

```bash
docker compose up -d --build
docker compose logs -f neos
```

Run application commands with `docker compose exec neos`, for example `docker compose exec neos ./flow cache:flush`.
