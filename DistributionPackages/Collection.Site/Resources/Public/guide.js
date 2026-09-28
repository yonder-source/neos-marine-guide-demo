(() => {
  'use strict';

  const initialized = new WeakSet();
  const audienceNames = ['children', 'adult', 'expert'];

  // Keep real server-rendered language links usable without JavaScript.
  // Only carry the public audience selection; never copy Neos backend arguments.
  function updateLanguageLinks(audience) {
    document.querySelectorAll('[data-language-link]').forEach((link) => {
      const url = new URL(link.href, window.location.href);
      url.searchParams.set('audience', audience);
      link.href = url.href;
    });
  }

  function initializeGuide(guide) {
    if (initialized.has(guide)) return;
    initialized.add(guide);
    const switcher = guide.querySelector('[data-audience-switch]');
    const tabs = Array.from(guide.querySelectorAll('[data-audience]'));
    const panels = Array.from(guide.querySelectorAll('[data-audience-panel]'));
    if (!switcher || tabs.length !== 3 || panels.length !== 3) return;

    const selectAudience = (audience, focus = false) => {
      if (!audienceNames.includes(audience)) return;
      const previousAudience = guide.dataset.activeAudience;
      tabs.forEach((tab) => {
        const active = tab.dataset.audience === audience;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => { panel.hidden = panel.dataset.audiencePanel !== audience; });
      guide.dataset.activeAudience = audience;
      updateLanguageLinks(audience);
      guide.dispatchEvent(new CustomEvent('audiencechange', {detail: {previousAudience}}));
    };

    switcher.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.addEventListener('click', () => selectAudience(tab.dataset.audience));
      tab.addEventListener('keydown', (event) => {
        let target;
        if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = tabs.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        selectAudience(tabs[target].dataset.audience, true);
      });
    });
    panels.forEach((panel) => {
      const tab = tabs.find((item) => item.dataset.audience === panel.dataset.audiencePanel);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
    });
    const requested = new URL(window.location.href).searchParams.get('audience');
    const initial = audienceNames.includes(requested) ? requested : guide.dataset.initialAudience;
    selectAudience(audienceNames.includes(initial) ? initial : 'adult');
    guide.dataset.enhanced = 'true';
    switcher.hidden = false;

    guide.querySelectorAll('[data-quiz]').forEach((quiz) => {
      const options = quiz.querySelector('[data-quiz-options]');
      const buttons = Array.from(quiz.querySelectorAll('[data-answer]'));
      const feedback = quiz.querySelector('[data-quiz-feedback]');
      const reset = quiz.querySelector('[data-quiz-reset]');
      const explanation = quiz.querySelector('.quiz-explanation');
      if (!options || !feedback || !reset || !explanation || !['a', 'b', 'c'].includes(quiz.dataset.correct)) return;
      options.hidden = false;
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          buttons.forEach((item) => { item.setAttribute('aria-pressed', 'false'); delete item.dataset.result; });
          const correct = button.dataset.answer === quiz.dataset.correct;
          button.setAttribute('aria-pressed', 'true');
          button.dataset.result = correct ? 'correct' : 'incorrect';
          feedback.textContent = correct
            ? `${quiz.dataset.feedbackCorrect}${explanation.querySelector('p')?.textContent || ''}`
            : quiz.dataset.feedbackIncorrect;
          quiz.dataset.completed = String(correct);
          reset.hidden = false;
        });
      });
      reset.addEventListener('click', () => {
        buttons.forEach((button) => { button.setAttribute('aria-pressed', 'false'); delete button.dataset.result; });
        feedback.textContent = '';
        delete quiz.dataset.completed;
        explanation.open = false;
        reset.hidden = true;
        buttons[0]?.focus();
      });
    });

    guide.querySelectorAll('[data-action-plan]').forEach((plan) => {
      const choices = [...plan.querySelectorAll('[data-action-check]')];
      const status = plan.querySelector('[data-action-status]');
      if (!status) return;
      const update = () => {
        const count = choices.filter((choice) => choice.checked).length;
        status.textContent = count > 0
          ? plan.dataset.selectedMessage.replace('{count}', String(count))
          : plan.dataset.emptyMessage;
        choices.forEach((choice) => choice.closest('.action-card')?.classList.toggle('is-selected', choice.checked));
      };
      plan.querySelectorAll('[data-action-choice]').forEach((choice) => { choice.hidden = false; });
      choices.forEach((choice) => choice.addEventListener('change', update));
      status.hidden = false;
      update();
    });
    guide.querySelectorAll('[data-hotspot]').forEach((button) => {
      const note = Array.from(guide.querySelectorAll('[data-observation]'))
        .find((item) => item.dataset.observation === button.dataset.hotspot);
      if (!note) return;
      button.hidden = false;
      button.addEventListener('click', () => {
        note.open = !note.open;
        button.setAttribute('aria-expanded', String(note.open));
      });
      note.addEventListener('toggle', () => button.setAttribute('aria-expanded', String(note.open)));
    });
  }

  function initializeDeck(guide) {
    const main = guide.closest('main');
    const hero = main?.querySelector('.hero');
    if (!hero || document.body.classList.contains('neos-backend')) return;
    const english = document.documentElement.lang.startsWith('en');
    const words = english
      ? {previous:'Previous', next:'Next', home:'Start over', cover:'Meet the hawksbill', observe:'Look closer', story:'Your perspective', quiz:'Try a question', actions:'Choose your actions', sources:'Sources & credits', more:'Keep wondering'}
      : {previous:'上一頁', next:'下一頁', home:'回到開場', cover:'遇見玳瑁', observe:'觀察玳瑁', story:'你的觀點', quiz:'情境挑戰', actions:'選擇保育行動', sources:'資料與圖片來源', more:'繼續想一想'};
    // Keep the existing audience controls visible on the cover and every slide.
    guide.querySelector('[data-audience-switch]').after(hero);
    document.body.classList.add('guide-deck');
    const pages = [];
    const add = (element, label, audience = null) => {
      if (!element) return;
      element.classList.add('deck-slide');
      element.tabIndex = -1;
      pages.push({element, label, audience});
    };
    add(hero, words.cover);
    add(guide.querySelector('.observation'), words.observe);
    guide.querySelectorAll('[data-audience-panel]').forEach(panel => {
      const audience = panel.dataset.audiencePanel;
      const story = document.createElement('section');
      panel.prepend(story);
      [...panel.children].filter(el => el.matches('.panel-label,h3,.guide-story,.children-illustration')).forEach(el => story.append(el));
      if (audience === 'children') story.classList.add('children-story-slide');
      add(story, words.story, audience);
      const actions = panel.querySelector('[data-action-plan]');
      add(actions, words.actions, audience);
      const evidence = panel.querySelector('[data-evidence]');
      if (evidence) {
        const overview = document.createElement('section');
        evidence.prepend(overview);
        [...evidence.children].filter(el => el.matches('h4,.evidence-updated,.evidence-metrics')).forEach(el => overview.append(el));
        add(overview, overview.querySelector('h4').textContent, audience);
        evidence.querySelectorAll('.evidence-section').forEach(detail => {
          const slide = document.createElement('section');
          const title = document.createElement('h4');
          title.textContent = detail.querySelector('summary').textContent;
          detail.replaceWith(slide);
          slide.append(title, detail.querySelector('div'));
          slide.classList.add('deck-evidence');
          add(slide, title.textContent, audience);
        });
      }
      const quiz = panel.querySelector('[data-quiz]');
      if (audience === 'children' && quiz) quiz.classList.add('children-quiz-slide');
      add(quiz, words.quiz, audience);
    });
    const followup = guide.querySelector('.followup');
    if (followup) {
      const friend = guide.querySelector('.children-illustration')?.cloneNode(true);
      if (friend) {friend.src = friend.src.replace('hawksbill-buddy.svg', 'hawksbill-question.svg'); friend.className = 'children-followup-illustration'; followup.append(friend);}
    }
    add(followup, words.more);
    add(guide.querySelector('.sources'), words.sources);
    const nav = document.createElement('nav');
    nav.className = 'deck-navigation';
    nav.setAttribute('aria-label', english ? 'Guide pages' : '導覽分頁');
    const button = (label, fn) => {
      const el = document.createElement('button'); el.type='button'; el.textContent=label;
      el.addEventListener('click', fn); nav.append(el); return el;
    };
    let index = 0;
    let sequence = [];
    const rememberedPage = new Map();
    const home = button(words.home, () => startOver()); home.dataset.deckHome = '';
    const previous = button('← '+words.previous, () => show(index-1)); previous.dataset.deckPrevious = '';
    const status = document.createElement('p'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); nav.append(status);
    const next = button(words.next+' →', () => show(index+1)); next.dataset.deckNext = '';
    document.body.append(nav);
    const audiencePages = () => pages.filter(page => {
      if (page.audience && page.audience !== guide.dataset.activeAudience) return false;
      return guide.dataset.activeAudience !== 'expert' || !page.element.matches('.observation, .followup');
    });
    function show(target, focus = true) {
      sequence = audiencePages();
      index = Math.max(0, Math.min(target, sequence.length-1));
      pages.forEach(page => {page.element.hidden = page !== sequence[index];});
      document.body.classList.toggle('deck-cover', index === 0);
      status.textContent = `${index+1} / ${sequence.length} · ${sequence[index].label}`;
      previous.disabled = index === 0; next.disabled = index === sequence.length-1;
      guide.dataset.deckPage = String(index);
      const currentPage = sequence[index];
      if (index > 0 && currentPage?.audience === guide.dataset.activeAudience) {
        rememberedPage.set(guide.dataset.activeAudience, currentPage.element);
      }
      if (focus) currentPage.element.focus({preventScroll:true});
    }
    function startOver() {
      rememberedPage.clear();
      guide.querySelectorAll('[data-quiz]').forEach(quiz => {
        quiz.querySelectorAll('[data-answer]').forEach(answer => {
          answer.setAttribute('aria-pressed', 'false');
          delete answer.dataset.result;
        });
        const feedback = quiz.querySelector('[data-quiz-feedback]');
        if (feedback) feedback.textContent = '';
        delete quiz.dataset.completed;
        const explanation = quiz.querySelector('.quiz-explanation');
        if (explanation) explanation.open = false;
        const reset = quiz.querySelector('[data-quiz-reset]');
        if (reset) reset.hidden = true;
      });
      guide.querySelectorAll('[data-action-plan]').forEach(plan => {
        plan.querySelectorAll('[data-action-check]').forEach(choice => {choice.checked = false;});
        const status = plan.querySelector('[data-action-status]');
        if (status) status.textContent = plan.dataset.emptyMessage;
        plan.querySelectorAll('.action-card').forEach(card => card.classList.remove('is-selected'));
      });
      guide.querySelectorAll('[data-observation], .evidence-section, .followup details').forEach(detail => {detail.open = false;});
      guide.querySelectorAll('[data-hotspot]').forEach(hotspot => hotspot.setAttribute('aria-expanded', 'false'));
      show(0);
    }
    guide.addEventListener('audiencechange', (event) => {
      if (event.detail.previousAudience === guide.dataset.activeAudience) return;
      const previousPage = sequence[index];
      if (index > 0 && previousPage?.audience === event.detail.previousAudience) {
        rememberedPage.set(event.detail.previousAudience, previousPage.element);
      }
      const targetSequence = audiencePages();
      const remembered = rememberedPage.get(guide.dataset.activeAudience);
      const rememberedIndex = remembered ? targetSequence.findIndex(page => page.element === remembered) : -1;
      show(index === 0 ? 0 : rememberedIndex >= 0 ? rememberedIndex : 0, false);
    });
    main.querySelectorAll('a[href="#guide"]').forEach(link => link.addEventListener('click', event => {event.preventDefault();show(1);}));
    document.querySelectorAll('a[href="#sources"]').forEach(link => link.addEventListener('click', event => {event.preventDefault();show(sequence.length-1);}));
    document.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="tablist"]')) return;
      const target = event.key === 'ArrowRight' || event.key === 'PageDown' ? index+1 : event.key === 'ArrowLeft' || event.key === 'PageUp' ? index-1 : null;
      if (target !== null) {event.preventDefault();show(target);}
    });
    show(0, false);
  }
  function scan(root) {
    if (root instanceof Element && root.matches('[data-guide]')) initializeGuide(root);
    root.querySelectorAll?.('[data-guide]').forEach(initializeGuide);
    root.querySelectorAll?.('[data-guide]').forEach(guide => {
      if (!guide.dataset.deckReady && guide.closest('main')?.querySelector('.hero')) {guide.dataset.deckReady = 'true'; initializeDeck(guide);}
    });
  }

  scan(document);
  // Neos can replace a content element without reloading the document.
  new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node instanceof Element) scan(node);
    }));
  }).observe(document.body, { childList: true, subtree: true });
})();
