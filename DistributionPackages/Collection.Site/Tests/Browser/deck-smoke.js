// Run in the homepage console or CDP, once for each language/audience route.
// Exercises the current route's deck without changing Neos content.
(async () => {
  const checks = [];
  const assert = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
  const guide = document.querySelector('[data-guide]');
  const next = document.querySelector('button[data-deck-next]');
  const previous = document.querySelector('button[data-deck-previous]');
  const home = document.querySelector('button[data-deck-home]');
  const audience = guide.dataset.audience;
  const english = document.documentElement.lang.startsWith('en');
  const decode = async img => {
    // sizes="auto" can select a new candidate as a previously hidden slide becomes visible.
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      try { await img.decode(); return; } catch {}
    }
    throw new Error('Image did not decode after its slide became visible');
  };
  const current = () => [...document.querySelectorAll('.deck-slide')].find(page => !page.hidden);
  const goTo = predicate => {
    home.click();
    for (let i = 0; i < 20; i++) {
      if (predicate(current())) return current();
      if (next.disabled) break;
      next.click();
    }
    throw new Error('Expected slide was unreachable');
  };
  assert(document.body.classList.contains('guide-deck'), 'Deck initialized');
  assert(document.querySelectorAll('.deck-navigation button').length === 3, 'Home, previous and next controls');
  assert(guide.querySelectorAll('[data-audience-panel]').length === 1, 'Current route renders one audience');
  assert([...guide.querySelectorAll('[data-audience-switch] a')].every(a => a.href), 'Audience links have routes');
  const hero = document.querySelector('.hero img');
  await decode(hero);
  assert(hero.naturalWidth > 0 && hero.alt.includes(english ? 'hawksbill' : '玳瑁'), 'Hawksbill Media image loaded');
  assert(hero.loading === 'eager' && hero.fetchPriority === 'high', 'Cover image has loading priority');
  assert(hero.srcset.split(',').some(candidate => candidate.trim().split(/\s+/)[0] === hero.currentSrc), 'Cover uses a declared responsive candidate');
  home.click();
  let count = 0;
  while (true) {
    const slide = current();
    if (audience === 'expert') assert(!slide.matches('.observation,.followup'), 'Expert route skips introductory slides');
    assert(document.querySelectorAll('.deck-slide:not([hidden])').length === 1, 'Exactly one page is visible');
    assert(slide.getBoundingClientRect().height > 0, 'Current page is rendered');
    assert(slide.scrollWidth <= slide.clientWidth + 1, 'No horizontal page overflow');
    if (innerWidth >= 1366 && innerHeight >= 768) assert(slide.scrollHeight <= slide.clientHeight + 1, `Page ${count + 1} fits display`);
    count++;
    if (next.disabled) break;
    next.click();
    assert(count < 20, 'Navigation terminates');
  }
  assert(count === {children: 6, adult: 7, expert: 10}[audience], 'Expected audience page sequence');
  const quiz = goTo(page => page.matches('[data-quiz]'));
  quiz.querySelector(`[data-answer]:not([data-answer="${quiz.dataset.correct}"])`).click();
  assert(quiz.dataset.completed === 'false', 'Incorrect answer');
  quiz.querySelector(`[data-answer="${quiz.dataset.correct}"]`).click();
  assert(quiz.dataset.completed === 'true', 'Correct answer');
  previous.click(); next.click();
  assert(quiz.dataset.completed === 'true', 'Answer survives page navigation');
  quiz.querySelector('[data-quiz-reset]').click();
  assert(!quiz.dataset.completed && document.activeElement.matches('[data-answer]'), 'Quiz reset and focus');
  if (guide.querySelector('[data-action-plan]')) {
    const plan = goTo(page => page.matches('[data-action-plan]'));
    const choices = [...plan.querySelectorAll('[data-action-check]')];
    choices[0].click(); choices[1].click();
    assert(plan.querySelector('[data-action-status]').textContent.includes('2'), 'Action selection count');
    next.click(); previous.click();
    assert(choices[0].checked && choices[1].checked, 'Actions survive navigation');
    choices[0].click(); choices[1].click();
  }
  if (audience !== 'expert') {
    const observation = goTo(page => page.matches('.observation'));
    const photo = observation.querySelector('img');
    await decode(photo);
    assert(photo.naturalWidth > 0 && photo.loading === 'lazy' && photo.sizes.startsWith('auto'), 'Observation image loads for its rendered size');
    const hotspot = observation.querySelector('[data-hotspot]');
    hotspot.click();
    assert(document.getElementById(hotspot.getAttribute('aria-controls')).open, 'Photo hotspot opens explanation');
    hotspot.click();
  }
  home.click();
  document.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
  assert(guide.dataset.deckPage === '1', 'Arrow key turns page');
  home.click();
  return {audience, language: document.documentElement.lang, passed: checks.length, checks};
})();
