(() => {
  'use strict';

  const initialized = new WeakSet();
  function pageKey(guide) {
    return `guide:${guide.id}:${guide.dataset.language}:${guide.dataset.audience}`;
  }

  function interactionKey(guide) {
    return `${pageKey(guide)}:interactions`;
  }

  function clearGuideState(guide) {
    const keyPrefix = `guide:${guide.id}:${guide.dataset.language}:`;
    for (let index = sessionStorage.length - 1; index >= 0; index--) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(keyPrefix)) sessionStorage.removeItem(key);
    }
  }

  function saveInteractions(guide) {
    const state = {
      quizzes: Object.fromEntries([...guide.querySelectorAll('[data-quiz]')].map((quiz) => [
        quiz.id,
        {
          answer: quiz.querySelector('[data-answer][aria-pressed="true"]')?.dataset.answer || null,
          explanationOpen: Boolean(quiz.querySelector('.quiz-explanation')?.open),
        },
      ])),
      actions: [...guide.querySelectorAll('[data-action-plan]')].map((plan) =>
        [...plan.querySelectorAll('[data-action-check]')].map((choice) => choice.checked)),
      openDetails: [...guide.querySelectorAll('details[open]')].map((details) => details.id).filter(Boolean),
    };
    sessionStorage.setItem(interactionKey(guide), JSON.stringify(state));
  }

  function restoreInteractions(guide) {
    let state;
    try {
      state = JSON.parse(sessionStorage.getItem(interactionKey(guide)) || '{}');
    } catch {
      return;
    }
    Object.entries(state.quizzes || {}).forEach(([id, quizState]) => {
      const quiz = document.getElementById(id);
      const answer = quizState?.answer && quiz?.querySelector(`[data-answer="${quizState.answer}"]`);
      if (answer) answer.click();
      const explanation = quiz?.querySelector('.quiz-explanation');
      if (explanation) explanation.open = Boolean(quizState?.explanationOpen);
    });
    (state.actions || []).forEach((choices, planIndex) => {
      const plan = guide.querySelectorAll('[data-action-plan]')[planIndex];
      if (!plan) return;
      plan.querySelectorAll('[data-action-check]').forEach((choice, index) => {
        choice.checked = Boolean(choices[index]);
        choice.dispatchEvent(new Event('change', {bubbles: true}));
      });
    });
    (state.openDetails || []).forEach((id) => {
      const details = document.getElementById(id);
      if (details) details.open = true;
    });
  }

  function initializeGuide(guide) {
    if (initialized.has(guide)) return;
    initialized.add(guide);
    const switcher = guide.querySelector('[data-audience-switch]');
    const panels = Array.from(guide.querySelectorAll('[data-audience-panel]'));
    if (!switcher || panels.length !== 1) return;
    guide.dataset.activeAudience = guide.dataset.audience;
    panels[0].setAttribute('role', 'region');
    guide.dataset.enhanced = 'true';

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
          saveInteractions(guide);
        });
      });
      reset.addEventListener('click', () => {
        buttons.forEach((button) => { button.setAttribute('aria-pressed', 'false'); delete button.dataset.result; });
        feedback.textContent = '';
        delete quiz.dataset.completed;
        explanation.open = false;
        reset.hidden = true;
        buttons[0]?.focus();
        saveInteractions(guide);
      });
      explanation.addEventListener('toggle', () => saveInteractions(guide));
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
      choices.forEach((choice) => choice.addEventListener('change', () => {
        update();
        saveInteractions(guide);
      }));
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
      note.addEventListener('toggle', () => saveInteractions(guide));
    });
    guide.querySelectorAll('.evidence-section, .followup details').forEach((details) => {
      details.addEventListener('toggle', () => saveInteractions(guide));
    });
    restoreInteractions(guide);
  }

  function initializeDeck(guide) {
    const main = guide.closest('main');
    const hero = main?.querySelector('.hero');
    if (!hero || document.body.classList.contains('neos-backend')) return;
    const words = Object.fromEntries(
      ['previous', 'next', 'home', 'cover', 'observe', 'story', 'quiz', 'actions', 'sources', 'more', 'navigation']
        .map(key => [key, guide.getAttribute(`data-deck-${key}`)])
    );
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
    nav.setAttribute('aria-label', words.navigation);
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
      sessionStorage.setItem(pageKey(guide), String(index));
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
      clearGuideState(guide);
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
    const savedPage = Number(sessionStorage.getItem(pageKey(guide)));
    show(Number.isInteger(savedPage) ? savedPage : 0, false);
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
