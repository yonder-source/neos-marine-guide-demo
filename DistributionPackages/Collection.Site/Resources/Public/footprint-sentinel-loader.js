import FootprintSentinel from './footprint-sentinel/index.mjs';

const sentinelModulePath = new URL('./footprint-sentinel/', import.meta.url).href;

FootprintSentinel.getInstance({
  isActivated: true,
  skipResource: (resourceName) => resourceName === import.meta.url || resourceName.startsWith(sentinelModulePath),
});