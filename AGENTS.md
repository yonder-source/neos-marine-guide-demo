# AGENTS

## Development environment

- Use VS Code's `Dev Containers: Reopen in Container` as the primary development workflow.
- Run PHP, Composer, Flow, and Neos commands in the Dev Container terminal from `/app`.
- Keep the application and database stack in `compose.yaml`; do not require host PHP or MariaDB.
- VS Code extensions are configured in `.devcontainer/devcontainer.json`.
- Follow [README.md](README.md) for the initialization steps applicable to this revision.

## Project layout

- `DistributionPackages/Collection.Site/` contains the site code: NodeTypes, Fusion templates, PHP helpers, translations, and public assets.
- `Configuration/Development/Docker/Settings.yaml` contains local database settings.
- `Packages/` and `Build/` are populated by Composer. Make project changes in the site package rather than editing installed dependencies.

## Flow commands

Run commands as `./flow` from the workspace root inside the Dev Container:

- `./flow neos.flow:package:rescan` rescans packages after dependency changes.
- `./flow doctrine:migrate` applies database schema migrations.
- `./flow cr:setup --content-repository default` sets up the Content Repository.
- `./flow site:create` creates a new site; use the full command in README and do not recreate an existing site.
- `./flow flow:cache:flush` flushes Flow caches.
- `./flow resource:publish` publishes resources.

Database schema migrations and node migrations are separate operations. Follow the documented upgrade sequence when changing existing content.

## Verification

- Verify changes against the running site and, for content-model changes, the Neos backend.
- Check the affected language and audience variants when available.
- PHPUnit is a Composer development dependency, available as `./bin/phpunit` after installation. The site package currently has no PHPUnit test suite or project-specific PHPUnit configuration.
- Behat is not installed or configured for this project.
- Report the checks actually run and any checks that could not be completed. Do not claim tests passed without running them.
- Browser smoke checks are in `DistributionPackages/Collection.Site/Tests/Browser/deck-smoke.js`. Run the script in the homepage browser console or through CDP, against the guide version being tested. This is a browser script, not a standalone Node.js test runner.

## Git workflow

- Use a feature branch for new work, such as `feat/your-feature-name`.
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, or `chore:`.
- Keep unrelated user changes intact.
- Push branches and create PRs only when requested by the user.
