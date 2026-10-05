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

To use a different host port, e.g., port 8083, set `NEOS_HTTP_PORT=8083` in an untracked `.env` file in the repository root, then run `Dev Containers: Rebuild and Reopen in Container`. Open http://localhost:8083; the Neos backend is at http://localhost:8083/neos. The expected Docker port mapping is `8083:8081`: the application still listens on port 8081 inside the container.

Changing `.env` or restarting the existing container does not update its published ports. If the mapping still shows `8081:8081`, run the following command from a host terminal in the repository root, then reopen the Dev Container:

```bash
docker compose up -d --force-recreate neos
```

This recreates the application container with the configured port and preserves the database volume.

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

Footprint Sentinel is disabled by default. Use `?sentinel=on` to enable local measurement for the current tab, including subsequent navigation. It reports resource transfer bytes and highlights large resources, excluding its own modules from the measurements. Use `?sentinel=off` to hide it for the current tab, including subsequent navigation. To remove it after measurement, remove the `footprintSentinel` script include from `Page.fusion`.

The homepage cover and guide observation use the image selected in the Neos Media field. `Collection.Site:Presentation.GuideImage` passes that asset to Kaleidoscope, which asks Neos Media for 320, 480, 640, 768, 1024, and 1280 pixel thumbnails and renders a `srcset`. The cover's `sizes` follows its full-width mobile and half-width desktop slide layout. The lazy observation image uses `sizes="auto"` to select for its actual rendered width, with explicit sizes for browsers without that support. The cover loads eagerly with high priority. If the image field is empty, the bundled hawksbill image is used as a fallback. Replacing the Media asset in the Neos backend updates both images without editing Fusion. The source image limits the largest useful candidate; the imported hawksbill photo is 1280 pixels wide.

JPEG quality 55 is a deliberate tradeoff for this demo photo: the 1280 pixel derivative is about 196 KiB instead of the original 435 KiB; the 1024 pixel derivative is about 92 KiB. Inspect visual quality when changing the source asset, since this quality setting does not guarantee a byte limit for every photo. The vendored Sentinel matches images by `currentSrc`, so a loaded candidate does not flag other images merely because they list that URL in their `srcset`.

For the responsive-image demo, Sentinel uses the same default thresholds at every viewport width: a 200 KiB per-resource cap and 10 KiB per 100 × 100 physical pixels of rendered area. The lower limit wins. These are diagnostic warnings, not a rule that every image must pass; the overall page rating uses separate thresholds.

To compare, open `/?sentinel=on`, select a 390 CSS-pixel mobile viewport at DPR 2, disable the browser cache, and reload. Inspect `.hero-visual img` in DevTools: `currentSrc` should point to a smaller Neos Media thumbnail. Then use a 1440 CSS-pixel desktop viewport and reload to see a larger candidate. Reloading matters because browsers may retain a previously loaded larger candidate after a resize. A desktop or DPR 3 mobile image may still trigger Sentinel's 200 KiB warning; compare actual transfer bytes, displayed dimensions, DPR, and visual quality before deciding whether a change is warranted.

## Running without VS Code

As an alternative to the Dev Container workflow, run the same stack from the host:

```bash
docker compose up -d --build
docker compose logs -f neos
```

Run application commands with `docker compose exec neos`, for example `docker compose exec neos ./flow cache:flush`.
