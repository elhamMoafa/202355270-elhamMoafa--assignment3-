'use strict';

const storage = {
  get(key, fallback = '') {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }
};

function initAppearance() {
  const root = document.documentElement;
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');
  const greeting = document.getElementById('greeting');

  // Theme preference persists between visits when browser storage is available.
  const savedTheme = storage.get('portfolio-theme', 'light');
  root.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
  function updateThemeButton() {
    const dark = root.dataset.theme === 'dark';
    themeToggle.textContent = dark ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  updateThemeButton();
  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    storage.set('portfolio-theme', root.dataset.theme);
    updateThemeButton();
  });

  function setMenuOpen(isOpen) {
    navLinks.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  }
  navToggle.addEventListener('click', () => setMenuOpen(!navLinks.classList.contains('open')));
  navLinks.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !navLinks.classList.contains('open')) return;
    setMenuOpen(false);
    const target = document.querySelector(link.hash);
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  });
  navLinks.closest('nav').addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !navLinks.classList.contains('open')) return;
    setMenuOpen(false);
    navToggle.focus();
  });

  const hour = new Date().getHours();
  greeting.textContent = hour < 12 ? 'Good morning, welcome to my portfolio.' : hour < 18 ? 'Good afternoon, welcome to my portfolio.' : 'Good evening, welcome to my portfolio.';
}

function initProjects() {
  const projectSearch = document.getElementById('projectSearch');
  const projectSort = document.getElementById('projectSort');
  const projectGrid = document.getElementById('projectGrid');
  const projectCards = [...document.querySelectorAll('.project-card')];
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const resultsMessage = document.getElementById('resultsMessage');
  const emptyState = document.getElementById('emptyState');

  // Filtering, searching, and sorting operate together on the same project list.
  const items = projectCards.map((card) => ({
    card,
    categories: card.dataset.category.split(' '),
    date: card.dataset.date,
    title: card.querySelector('h3').textContent.trim(),
    searchText: (card.dataset.search + ' ' + card.textContent).toLowerCase().replace(/\s+/g, ' ')
  }));
  let activeFilter = 'all';
  let previousSort;
  function updateProjects() {
    const query = projectSearch.value.trim().toLowerCase();
    const sortMode = projectSort.value;
    if (sortMode !== previousSort) {
      items.sort((a, b) => {
        if (sortMode === 'title') return a.title.localeCompare(b.title);
        return sortMode === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      });
      projectGrid.append(...items.map(({ card }) => card));
      previousSort = sortMode;
    }
    let visibleCount = 0;
    items.forEach(({ card, categories, searchText }) => {
      const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
      const matchesSearch = searchText.includes(query);
      card.hidden = !(matchesFilter && matchesSearch);
      if (!card.hidden) visibleCount += 1;
    });
    emptyState.hidden = visibleCount !== 0;
    resultsMessage.textContent = visibleCount ? `Showing ${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'}.` : 'No matching projects.';
  }
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    updateProjects();
  }));
  projectSearch.addEventListener('input', updateProjects);
  projectSort.addEventListener('change', updateProjects);
  document.getElementById('resetProjects').addEventListener('click', () => {
    activeFilter = 'all';
    projectSearch.value = '';
    projectSort.value = 'newest';
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === 'all';
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    updateProjects();
    projectSearch.focus();
  });
  updateProjects();
}

function initGitHub() {
  // GitHub's public REST API; the username is entered by the visitor, not assumed.
  const githubForm = document.getElementById('githubForm');
  const githubUsername = document.getElementById('githubUsername');
  const githubStatus = document.getElementById('githubStatus');
  const githubRepos = document.getElementById('githubRepos');
  let activeRequest;
  githubForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = githubUsername.value.trim();
    activeRequest?.abort();
    activeRequest = undefined;
    githubRepos.replaceChildren();
    if (!/^[A-Za-z0-9-]{1,39}$/.test(username) || username.startsWith('-') || username.endsWith('-') || username.includes('--')) {
      githubStatus.textContent = 'Enter a valid GitHub username (letters, numbers, or single hyphens).';
      return;
    }
    githubStatus.textContent = 'Loading public repositories…';
    const controller = new AbortController();
    activeRequest = controller;
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6&type=owner`, {
        headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal
      });
      if (response.status === 404) throw new Error('No GitHub account was found for that username. Check the spelling and try again.');
      if (response.status === 403 || response.status === 429) throw new Error('GitHub is temporarily limiting requests. Please try again in a few minutes.');
      if (!response.ok) throw new Error('GitHub could not load the repositories. Please try again later.');
      const repos = await response.json();
      if (activeRequest !== controller) return;
      if (!Array.isArray(repos)) throw new Error('GitHub returned an unexpected response. Please try again later.');
      if (!repos.length) {
        githubStatus.textContent = 'This account has no public repositories to display yet.';
        return;
      }
      const fragment = document.createDocumentFragment();
      repos.forEach((repo) => {
        const article = document.createElement('article');
        article.className = 'repo-card';
        const title = document.createElement('h3');
        const link = document.createElement('a');
        link.href = 'https://github.com/' + encodeURIComponent(username) + '/' + encodeURIComponent(repo.name);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = repo.name;
        title.append(link);
        const description = document.createElement('p');
        description.textContent = repo.description || 'No description provided.';
        const details = document.createElement('small');
        const language = repo.language || 'Language not specified';
        details.textContent = `${language} · Updated ${new Date(repo.updated_at).toLocaleDateString()}`;
        article.append(title, description, details);
        fragment.append(article);
      });
      githubRepos.append(fragment);
      githubStatus.textContent = `Showing ${repos.length} recent public repositories for @${username}.`;
    } catch (error) {
      if (activeRequest !== controller) return;
      if (controller.signal.aborted) {
        githubStatus.textContent = 'The request took too long. Check your connection and try again.';
      } else if (error instanceof TypeError) {
        githubStatus.textContent = 'Could not reach GitHub. Check your connection and try again.';
      } else {
        githubStatus.textContent = error.message;
      }
    } finally {
      window.clearTimeout(timeout);
      if (activeRequest === controller) activeRequest = undefined;
    }
  });
}

function initVisitor() {
  // Visitor settings are a local demonstration and are not sent to a server.
  const visitorForm = document.getElementById('visitorForm');
  const visitorName = document.getElementById('visitorName');
  const visitorGreeting = document.getElementById('visitorGreeting');
  const visitorStatus = document.getElementById('visitorStatus');
  const statusToggle = document.getElementById('visitorStatusToggle');
  const savedName = storage.get('portfolio-visitor-name');
  visitorName.value = savedName;
  function showVisitorName(name) {
    visitorGreeting.textContent = name ? `Welcome, ${name}.` : 'Welcome to my portfolio.';
  }
  showVisitorName(savedName);
  visitorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = visitorName.value.trim();
    if (!name) {
      visitorGreeting.textContent = 'Please enter a name before saving.';
      visitorName.focus();
      return;
    }
    const stored = storage.set('portfolio-visitor-name', name);
    showVisitorName(name);
    if (!stored) visitorGreeting.textContent += ' (Storage is unavailable; this will last for this visit only.)';
  });
  let signedIn = storage.get('portfolio-demo-signed-in') === 'true';
  function updateVisitorStatus() {
    visitorStatus.textContent = signedIn ? 'Demo signed-in state (local only)' : 'Visitor mode';
    statusToggle.textContent = signedIn ? 'Simulate sign out' : 'Simulate sign in';
  }
  statusToggle.addEventListener('click', () => {
    signedIn = !signedIn;
    storage.set('portfolio-demo-signed-in', String(signedIn));
    updateVisitorStatus();
  });
  updateVisitorStatus();
  const visitTimer = document.getElementById('visitTimer');
  const pageStartedAt = Date.now();
  function updateTimer() {
    const total = Math.floor((Date.now() - pageStartedAt) / 1000);
    visitTimer.textContent = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }
  let timer;
  function syncTimer() {
    window.clearInterval(timer);
    if (document.hidden) return;
    updateTimer();
    timer = window.setInterval(updateTimer, 1000);
  }
  document.addEventListener('visibilitychange', syncTimer);
  syncTimer();
}

function initContact() {
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  // Client-side feedback only. No contact details leave this browser.
  contactForm.addEventListener('input', (event) => {
    event.target.removeAttribute('aria-invalid');
  });
  function showError(field, message) {
    formMessage.textContent = message;
    formMessage.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  }
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formMessage.classList.remove('error');
    contactForm.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
    const name = contactForm.elements.name.value.trim();
    const emailInput = contactForm.elements.email;
    const message = contactForm.elements.message.value.trim();
    if (name.length < 2) {
      showError(contactForm.elements.name, 'Please enter your name (at least 2 characters).');
      return;
    }
    if (!emailInput.value.trim() || !emailInput.validity.valid) {
      showError(emailInput, 'Please enter a valid email address.');
      return;
    }
    if (message.length < 10) {
      showError(contactForm.elements.message, 'Please write a message with at least 10 characters.');
      return;
    }
    formMessage.textContent = `Thank you, ${name}. Your details passed validation. This demo does not send email.`;
    contactForm.reset();
  });
}

function initReveal() {
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries, currentObserver) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }
}

initAppearance();
initProjects();
initGitHub();
initVisitor();
initContact();
initReveal();
document.getElementById('currentYear').textContent = new Date().getFullYear();
