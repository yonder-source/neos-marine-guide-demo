import FootprintSentinel from './footprint-sentinel/index.mjs';

const sentinelStateKey = 'collection-site-footprint-sentinel';
const sentinelSetting = new URLSearchParams(window.location.search).get('sentinel');

if (sentinelSetting === 'off') {
  window.sessionStorage.setItem(sentinelStateKey, 'off');
} else if (sentinelSetting === 'on') {
  window.sessionStorage.removeItem(sentinelStateKey);
}

if (window.sessionStorage.getItem(sentinelStateKey) !== 'off') {
  const sentinelModulePath = new URL('./footprint-sentinel/', import.meta.url).href;

  FootprintSentinel.getInstance({
    isActivated: true,
    skipResource: (resourceName) => resourceName === import.meta.url || resourceName.startsWith(sentinelModulePath),
  });
}
