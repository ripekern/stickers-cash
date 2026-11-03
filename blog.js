(function () {
  'use strict';

  /* mobile nav */
  var nav = document.getElementById('mainNav');
  var menuBtn = document.getElementById('menuBtn');
  if (nav && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  /* copy buttons + toast */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var value = btn.getAttribute('data-copy');
    var done = btn.getAttribute('data-copied') || 'Copied to clipboard';

    function ok() {
      toast(done);
      var old = btn.textContent;
      btn.textContent = 'Copied';
      btn.classList.add('done');
      setTimeout(function () { btn.textContent = old; btn.classList.remove('done'); }, 1600);
    }

    function legacyCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand('copy')) { ok(); }
        else { toast('Copy failed — select the address manually'); }
      } catch (err) {
        toast('Copy failed — select the address manually');
      }
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(ok).catch(function () { legacyCopy(value); });
    } else {
      legacyCopy(value);
    }
  });

  /* blog search */
  var searchInput = document.getElementById('blog-search-input');
  var searchClear = document.getElementById('blog-search-clear');
  var searchStatus = document.getElementById('blog-search-status');

  if (searchInput) {
    var allCards = Array.prototype.slice.call(document.querySelectorAll('.post-card'));
    var allBlocks = Array.prototype.slice.call(document.querySelectorAll('.series-block'));

    // Pre-compute searchable text for each card
    var cardData = allCards.map(function (card) {
      var h3 = card.querySelector('h3');
      var p = card.querySelector('p');
      var text = ((h3 ? h3.textContent : '') + ' ' + (p ? p.textContent : '')).toLowerCase();
      return { el: card, text: text };
    });

    function normalize(s) {
      return s.toLowerCase().trim().replace(/\s+/g, ' ');
    }

    function doSearch() {
      var query = normalize(searchInput.value);
      var hasQuery = query.length > 0;

      // Toggle clear button visibility
      if (searchClear) {
        searchClear.hidden = !hasQuery;
      }

      if (!hasQuery) {
        // Reset: show everything
        cardData.forEach(function (d) { d.el.classList.remove('search-hidden'); });
        allBlocks.forEach(function (b) { b.classList.remove('search-hidden'); });
        if (searchStatus) searchStatus.textContent = '';
        return;
      }

      // Split query into individual keywords — all must match
      var keywords = query.split(' ').filter(Boolean);

      var matchCount = 0;
      cardData.forEach(function (d) {
        var matches = keywords.every(function (kw) {
          return d.text.indexOf(kw) !== -1;
        });
        d.el.classList.toggle('search-hidden', !matches);
        if (matches) matchCount++;
      });

      // Hide series blocks with no visible cards
      allBlocks.forEach(function (block) {
        var visibleCards = block.querySelectorAll('.post-card:not(.search-hidden)');
        block.classList.toggle('search-hidden', visibleCards.length === 0);
      });

      // Update status message
      if (searchStatus) {
        if (matchCount === 0) {
          searchStatus.textContent = 'No posts match "' + searchInput.value.trim() + '"';
        } else if (matchCount === allCards.length) {
          searchStatus.textContent = '';
        } else {
          searchStatus.textContent = matchCount + ' of ' + allCards.length + ' posts';
        }
      }
    }

    searchInput.addEventListener('input', doSearch);

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        searchInput.value = '';
        doSearch();
        searchInput.focus();
      });
    }

    // Keyboard shortcut: press "/" to focus search
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== searchInput &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
})();
