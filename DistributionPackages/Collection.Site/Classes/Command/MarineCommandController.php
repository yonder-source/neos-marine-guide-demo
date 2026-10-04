<?php

declare(strict_types=1);

namespace Collection\Site\Command;

use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindRootNodeAggregatesFilter;
use Neos\ContentRepository\Core\SharedModel\ContentRepository\ContentRepositoryId;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\Package\PackageManager;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Neos\Domain\Service\SiteImportService;

/** Imports the published bilingual demo without replacing existing content. */
final class MarineCommandController extends CommandController
{
    #[Flow\Inject]
    protected SiteRepository $siteRepository;

    #[Flow\Inject]
    protected ContentRepositoryRegistry $contentRepositoryRegistry;

    #[Flow\Inject]
    protected SiteImportService $siteImportService;

    #[Flow\Inject]
    protected PackageManager $packageManager;

    /**
     * Initialize the demo only when no sites or live content exist.
     *
     * Run doctrine:migrate and cr:setup first. Existing sites are left intact.
     */
    public function initializeDemoCommand(): void
    {
        if ($this->siteRepository->findAll()->count() !== 0) {
            $this->outputLine('Existing site found; demo import skipped. No content was changed.');
            return;
        }

        $repositoryId = ContentRepositoryId::fromString('default');
        $repository = $this->contentRepositoryRegistry->get($repositoryId);
        if ($repository->findWorkspaceByName(WorkspaceName::forLive()) !== null
            && count($repository->getContentGraph(WorkspaceName::forLive())->findRootNodeAggregates(
                FindRootNodeAggregatesFilter::create()
            )) !== 0
        ) {
            throw new \RuntimeException('Live content exists without a site record; refusing to import the demo.');
        }

        $path = $this->packageManager->getPackage('Collection.Site')->getResourcesPath() . 'Private/Content';
        $this->siteImportService->importFromPath(
            $repositoryId,
            $path,
            fn (string $processor) => $this->outputLine('%s...', [$processor]),
            fn ($severity, string $message) => $this->outputLine('%s', [$message])
        );
        $this->outputLine('Bilingual marine demo imported.');
    }
}
