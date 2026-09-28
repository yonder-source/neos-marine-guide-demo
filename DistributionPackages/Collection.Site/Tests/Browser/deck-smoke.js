// Run in the homepage console or CDP. Exercises the public display without changing Neos content.
(async () => {
  const checks = [];
  const assert = (condition, label) => {if (!condition) throw new Error(label);checks.push(label);};
  const guide = document.querySelector('[data-guide]');
  const next = document.querySelector('[data-deck-next]');
  const home = document.querySelector('[data-deck-home]');
  const current = () => [...document.querySelectorAll('.deck-slide')].find(page => !page.hidden);
  const goTo = predicate => {
    home.click();
    for (let i=0;i<20;i++) {if (predicate(current())) return current();if(next.disabled)break;next.click();}
    throw new Error('Expected slide was unreachable');
  };
  assert(document.body.classList.contains('guide-deck'), 'Deck initialized');
  assert(document.querySelectorAll('.deck-navigation button').length === 3, 'Only home, previous and next controls');
  assert(getComputedStyle(document.querySelector('.hero')).backgroundColor !== getComputedStyle(document.querySelector('.hero h1')).color, 'Cover title and background differ');
  document.querySelectorAll("img").forEach(img => {img.loading = "eager";});
  await Promise.all([...document.images].map(img => img.decode()));
  for (const audience of ['children','adult','expert']) {
    home.click(); next.click();
    guide.querySelector(`[data-audience="${audience}"]`).click();
    home.click();
    let count = 0;
    while (true) {
      const slide = current();
      if (audience === 'expert') assert(!slide.matches('.observation,.followup'), 'Expert route skips introductory observation and followup');
      assert([...guide.querySelectorAll('[data-audience]')].every(button => {
        const rect = button.getBoundingClientRect();
        return rect.width >= 48 && rect.height >= 48 && rect.top >= 0 && rect.bottom <= innerHeight;
      }), `${audience}: all audience touch controls visible on page ${count+1}`);
      assert(document.querySelectorAll('.deck-slide:not([hidden])').length === 1, `${audience}: exactly one page`);
      assert(slide.getBoundingClientRect().height > 0, `${audience}: page is rendered`);
      assert(slide.scrollWidth <= slide.clientWidth+1, `${audience}: no horizontal page overflow`);
      if (innerWidth >= 1366 && innerHeight >= 768) assert(slide.scrollHeight <= slide.clientHeight+1, `${audience}: page ${count+1} fits display`);
      count++;
      if(next.disabled)break;
      next.click();
      assert(count < 20, 'Navigation terminates');
    }
    assert(count === {children:6,adult:7,expert:10}[audience], `${audience}: expected page sequence`);
    const quiz = goTo(page => page.matches('[data-quiz]'));
    quiz.querySelector(`[data-answer]:not([data-answer="${quiz.dataset.correct}"])`).click();
    assert(quiz.dataset.completed === 'false', `${audience}: incorrect answer`);
    quiz.querySelector(`[data-answer="${quiz.dataset.correct}"]`).click();
    assert(quiz.dataset.completed === 'true', `${audience}: correct answer`);
    document.querySelector('[data-deck-previous]').click();next.click();
    assert(quiz.dataset.completed === 'true', `${audience}: answer survives page navigation`);
    quiz.querySelector('[data-quiz-reset]').click();
    assert(!quiz.dataset.completed && document.activeElement.matches('[data-answer]'), `${audience}: reset and focus`);
  }
  guide.querySelector('[data-audience="adult"]').click();
  const plan = goTo(page => page.matches('[data-action-plan]'));
  const choices = [...plan.querySelectorAll('[data-action-check]')];
  choices[0].click();choices[1].click();
  assert(plan.querySelector('[data-action-status]').textContent.includes('2'), 'Action selection count');
  next.click();document.querySelector('[data-deck-previous]').click();
  assert(choices[0].checked && choices[1].checked, 'Actions survive navigation');
  choices[0].click();choices[1].click();
  const observation = goTo(page => page.matches('.observation'));
  const hotspot = observation.querySelector('[data-hotspot]');hotspot.click();
  assert(document.getElementById(hotspot.getAttribute('aria-controls')).open, 'Photo hotspot opens explanation');
  hotspot.click();
  guide.querySelector('[data-audience="expert"]').click();
  assert([...document.querySelectorAll('[data-language-link]')].every(a => new URL(a.href).searchParams.get('audience')==='expert'), 'Language navigation preserves audience');
  home.click();
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  assert(guide.dataset.deckPage === '1', 'Arrow key turns page');
  assert(document.documentElement.scrollHeight <= innerHeight+1, 'Document does not scroll vertically');
  assert(document.documentElement.scrollWidth <= innerWidth+1, 'Document does not scroll horizontally');
  assert(document.querySelector('.hero img').alt.includes(english ? 'hawksbill' : '玳瑁'), 'Hawksbill demo image is active');
  assert([...document.images].every(img => img.naturalWidth>0), 'Photos loaded');
  home.click();
  return {passed:checks.length,checks};
})();
