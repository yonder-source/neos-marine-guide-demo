<?php

declare(strict_types=1);

namespace Collection\Site\Eel;

use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Eel\ProtectedContextAwareInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\Locale;
use Neos\Flow\I18n\Translator;

/** Exposes only the public guide fields declared in the guide mixin. */
#[Flow\Scope('singleton')]
final class GuideHelper implements ProtectedContextAwareInterface
{
    public function __construct(
        private readonly ContentRepositoryRegistry $contentRepositoryRegistry,
        private readonly Translator $translator
    )
    {
    }

    public function content(Node $node): array
    {
        $type = $this->contentRepositoryRegistry->get($node->contentRepositoryId)
            ->getNodeTypeManager()->getNodeType('Collection.Site:Mixin.Guide');
        $values = $type?->getDefaultValuesForProperties() ?? [];
        // Existing homepage nodes predate the guide fields. Use the same defaults
        // as newly created nodes, while respecting intentionally empty fields.
        foreach ($values as $name => $default) {
            if ($node->properties->offsetExists($name)) {
                $values[$name] = $node->getProperty($name);
            }
        }
        foreach ($values as $name => $value) {
            if (str_ends_with($name, 'Url')) {
                $values[$name] = $this->publicUrl($value);
            }
        }
        foreach (['observationOneX', 'observationOneY', 'observationTwoX', 'observationTwoY'] as $name) {
            $values[$name] = max(8, min(88, (int) ($values[$name] ?? 50)));
        }
        $values['actions'] = $this->sections($values, 'action', ['One', 'Two', 'Three'], ['Title', 'Body', 'Link', 'Url']);
        $values['metrics'] = $this->sections($values, 'metric', ['One', 'Two', 'Three'], ['Value', 'Label', 'Scope']);
        $values['evidence'] = $this->sections($values, 'evidence', ['One', 'Two', 'Three', 'Four', 'Five'], ['Title', 'Body', 'SourceTitle', 'SourceUrl', 'SecondaryTitle', 'SecondaryUrl']);
        return $values;
    }

    private function sections(array $values, string $prefix, array $slots, array $fields): array
    {
        $sections = [];
        foreach ($slots as $slot) {
            $section = ['key' => strtolower($slot)];
            foreach ($fields as $field) {
                $section[lcfirst($field)] = $values[$prefix . $slot . $field] ?? '';
            }
            // An editor can remove a card by clearing its title or metric label.
            if (($section['title'] ?? $section['label'] ?? '') !== '') {
                $sections[] = $section;
            }
        }
        return $sections;
    }

    public function language(Node $node): string
    {
        return $node->dimensionSpacePoint->coordinates['language'] ?? 'en';
    }

    public function label(string $id, Node $node): string
    {
        $locale = new Locale($this->language($node) === 'zh' ? 'zh_TW' : 'en');
        return $this->translator->translateById($id, [], null, $locale, 'Main', 'Collection.Site') ?? $id;
    }

    private function publicUrl(mixed $value): ?string
    {
        if (!is_string($value) || filter_var($value, FILTER_VALIDATE_URL) === false) {
            return null;
        }
        return in_array(strtolower((string) parse_url($value, PHP_URL_SCHEME)), ['https', 'http'], true)
            ? $value : null;
    }

    public function allowsCallOfMethod($methodName): bool
    {
        return in_array($methodName, ['content', 'language', 'label'], true);
    }
}