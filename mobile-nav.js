(function () {
    const dock = document.querySelector('.mobile-bottom-nav');
    if (!dock) return;

    const INSTAGRAM_URL = 'https://www.instagram.com/thecareercafeafrica/';
    const LINKEDIN_URL = 'https://www.linkedin.com/in/the-career-caf%C3%A9-africa-a63269370';
    const MOBILE = window.matchMedia('(max-width: 760px)');
    const isMasterclass = document.body.classList.contains('masterclass-page');

    document.body.classList.add('has-mobile-bottom-nav');
    if (!isMasterclass) document.body.classList.add('has-mobile-chrome');

    /* ── helpers ─────────────────────────────────────────────── */
    const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    /** "index.html#about" on index.html becomes "#about" so it scrolls instead of reloading. */
    function localHref(href) {
        const [file, hash] = href.split('#');
        if (hash && file && file.toLowerCase() === currentFile) return '#' + hash;
        return href;
    }

    function el(tag, attrs, html) {
        const node = document.createElement(tag);
        Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
        if (html != null) node.innerHTML = html;
        return node;
    }

    /* ── top pill: logo · Instagram · LinkedIn · Share ───────── */
    let pill = null;
    if (!isMasterclass) {
        pill = el('div', { class: 'cc-pill', id: 'ccPill', 'aria-label': 'Page actions' }, `
            <a class="cc-pill-logo" href="${localHref('index.html')}" aria-label="Career Café home"><img src="careerLogoNew.png" alt="" width="34" height="34"></a>
            <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" aria-label="Instagram @thecareercafeafrica"><i class="fab fa-instagram" aria-hidden="true"></i></a>
            <a href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a>
            <button type="button" class="cc-pill-share" aria-label="Share this page"><i class="fas fa-share-nodes" aria-hidden="true"></i></button>
            <span class="cc-pill-status" role="status" aria-live="polite"></span>`);
        document.body.appendChild(pill);

        const status = pill.querySelector('.cc-pill-status');
        let statusTimer;
        const flash = text => {
            status.textContent = text;
            status.classList.add('show');
            clearTimeout(statusTimer);
            statusTimer = setTimeout(() => status.classList.remove('show'), 2200);
        };
        pill.querySelector('.cc-pill-share').addEventListener('click', async () => {
            const data = { title: document.title, url: location.href.split('#')[0] };
            if (navigator.share) {
                try { await navigator.share(data); return; }
                catch (e) { if (e && e.name === 'AbortError') return; }
            }
            try { await navigator.clipboard.writeText(data.url); flash('Link copied'); }
            catch { flash(data.url); }
        });
    }

    /* ── bottom nav: first 4 tabs + "More" sheet ─────────────── */
    let sheet = null;
    if (!isMasterclass) {
        const tabs = [...dock.querySelectorAll(':scope > a')];
        tabs.slice(4).forEach(a => a.remove());
        tabs.slice(0, 4).forEach(a => a.setAttribute('href', localHref(a.getAttribute('href'))));

        const moreBtn = el('button', { type: 'button', class: 'cc-more-btn', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'ccMoreSheet' },
            '<i class="fas fa-bars" aria-hidden="true"></i><span>More</span>');
        dock.appendChild(moreBtn);

        sheet = el('div', { class: 'cc-sheet', id: 'ccMoreSheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'More navigation', hidden: '' }, `
            <div class="cc-sheet-backdrop" data-close></div>
            <div class="cc-sheet-panel">
                <div class="cc-sheet-grip" aria-hidden="true"></div>
                <div class="cc-sheet-head"><strong>Menu</strong><button type="button" class="cc-sheet-close" data-close aria-label="Close menu"><i class="fas fa-xmark" aria-hidden="true"></i></button></div>
                <div class="cc-sheet-body"></div>
                <div class="cc-sheet-social">
                    <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram" aria-hidden="true"></i> @thecareercafeafrica</a>
                    <a href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin-in" aria-hidden="true"></i> LinkedIn</a>
                </div>
            </div>`);
        document.body.appendChild(sheet);

        const SITE_LINKS = [
            ['index.html', 'Home', 'fa-house'],
            ['index.html#about', 'About us', 'fa-circle-info'],
            ['africa-future-work-reset.html', 'Masterclass', 'fa-star'],
            ['future-of-work-africa.html', 'Future of Work', 'fa-route'],
            ['career-conversations.html', 'Career Conversations', 'fa-microphone'],
            ['courses.html', 'Courses', 'fa-book-open'],
            ['articles.html', 'Articles', 'fa-newspaper'],
            ['index.html#events', 'Events', 'fa-calendar-days'],
            ['index.html#gallery', 'Gallery', 'fa-images'],
            ['index.html#team', 'Team', 'fa-users'],
            ['index.html#partners', 'Partners', 'fa-handshake'],
            ['index.html#contact', 'Contact', 'fa-envelope'],
        ];
        const TOP_NAV_LINKS = '.navbar .nav-menu a, body > nav.nav .nav-r a, .site-nav .nav-links a';

        const resolve = href => { try { return new URL(href, location.href).href; } catch { return href; } };
        const isVisible = a => !a.hidden && !a.closest('[hidden]');

        function item(label, icon, href) {
            return el('a', { href, class: 'cc-sheet-link' },
                `<i class="fas ${icon}" aria-hidden="true"></i><span></span>`);
        }

        function buildSheet() {
            const body = sheet.querySelector('.cc-sheet-body');
            body.innerHTML = '';
            const seen = new Set(tabs.slice(0, 4).map(a => resolve(a.getAttribute('href'))));

            // 1. This page's own top-nav links (the top nav is hidden on mobile, so keep them reachable).
            const pageGroup = el('div', { class: 'cc-sheet-group' }, '<p class="cc-sheet-label">On this page</p>');
            const grid = el('div', { class: 'cc-sheet-grid' });
            document.querySelectorAll(TOP_NAV_LINKS).forEach(orig => {
                if (orig.closest('.nav-social-group') || !isVisible(orig)) return;
                const label = orig.textContent.trim();
                const raw = orig.getAttribute('href') || '#';
                if (!label) return;
                const scripted = raw === '#' || !!orig.id || Object.keys(orig.dataset).length > 0; // wired up by page JS (modals, tabs, ...)
                const key = scripted ? 'js:' + label : resolve(raw);
                if (seen.has(key)) return;
                seen.add(key);
                const link = item(label, 'fa-angle-right', scripted ? '#' : localHref(raw));
                link.querySelector('span').textContent = label;
                if (orig.target) link.target = orig.target;
                if (orig.rel) link.rel = orig.rel;
                if (scripted) link.addEventListener('click', e => { e.preventDefault(); close(); orig.click(); });
                grid.appendChild(link);
            });
            if (grid.children.length) { pageGroup.appendChild(grid); body.appendChild(pageGroup); }

            // 2. Site-wide links.
            const siteGroup = el('div', { class: 'cc-sheet-group' }, '<p class="cc-sheet-label">Explore Career Café</p>');
            const siteGrid = el('div', { class: 'cc-sheet-grid' });
            SITE_LINKS.forEach(([href, label, icon]) => {
                const key = resolve(href);
                if (seen.has(key)) return;
                seen.add(key);
                const link = item(label, icon, localHref(href));
                link.querySelector('span').textContent = label;
                if (resolve(href).split('#')[0] === location.href.split('#')[0] && !href.includes('#')) {
                    link.setAttribute('aria-current', 'page');
                }
                siteGrid.appendChild(link);
            });
            siteGroup.appendChild(siteGrid);
            body.appendChild(siteGroup);
        }

        let lastFocus = null;
        function open() {
            buildSheet();
            lastFocus = document.activeElement;
            sheet.hidden = false;
            requestAnimationFrame(() => sheet.classList.add('is-open'));
            moreBtn.setAttribute('aria-expanded', 'true');
            document.documentElement.classList.add('cc-sheet-lock');
            sheet.querySelector('.cc-sheet-close').focus();
        }
        function close() {
            if (sheet.hidden) return;
            sheet.classList.remove('is-open');
            moreBtn.setAttribute('aria-expanded', 'false');
            document.documentElement.classList.remove('cc-sheet-lock');
            setTimeout(() => { sheet.hidden = true; }, 220);
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        moreBtn.addEventListener('click', () => (sheet.hidden ? open() : close()));
        sheet.addEventListener('click', e => {
            if (e.target.closest('[data-close]')) close();
            else if (e.target.closest('a.cc-sheet-link, .cc-sheet-social a')) setTimeout(close, 0);
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        MOBILE.addEventListener('change', e => { if (!e.matches) close(); });
    }

    /* ── scroll behaviour ──────────────────────────────────────
       Hide on scroll down, reappear on scroll up, shrink a little once off the top.
       Runs once per frame and needs a deliberate scroll (not 1–2px jitter) to flip,
       so the bars never flicker. */
    const pills = [pill, document.getElementById('mobilePill')].filter(Boolean);
    const HIDE_AFTER = 140;      // never hide near the top of the page
    const FLIP_DISTANCE = 14;    // px of travel in one direction before hiding/showing
    const COMPACT_AFTER = 80;
    const MASTERCLASS_REVEAL = 72; // masterclass dock stays out of the hero until scrolling starts

    let lastY = window.scrollY;
    let travel = 0;
    let hidden = false;
    let ticking = false;

    function pinned() {
        // Keep the bars on screen while the menu is open or someone is using them with the keyboard.
        return (sheet && !sheet.hidden)
            || dock.contains(document.activeElement)
            || pills.some(p => p.contains(document.activeElement));
    }

    function apply() {
        ticking = false;
        const y = Math.max(0, window.scrollY);
        const delta = y - lastY;
        lastY = y;
        const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 4;

        if (delta !== 0 && Math.sign(delta) !== Math.sign(travel)) travel = 0;
        travel += delta;

        if (y < HIDE_AFTER || atBottom || pinned()) hidden = false;
        else if (travel > FLIP_DISTANCE) hidden = true;
        else if (travel < -FLIP_DISTANCE) hidden = false;

        const dockHidden = hidden || (isMasterclass && y < MASTERCLASS_REVEAL);
        dock.classList.toggle('is-hidden', dockHidden);
        dock.classList.toggle('is-visible', !dockHidden); // legacy hook
        dock.classList.toggle('is-compact', y > COMPACT_AFTER);
        pills.forEach(p => {
            p.classList.toggle('is-hidden', hidden);
            if (p === pill) p.classList.toggle('is-compact', y > COMPACT_AFTER);
        });
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(apply), { passive: true });
    [dock, ...pills].forEach(n => n.addEventListener('focusin', () => requestAnimationFrame(apply)));
    apply();

    /* ── active tab follows the section in view ──────────────── */
    const links = [...dock.querySelectorAll('a[href]')];
    links.forEach(link => {
        const href = link.getAttribute('href');
        const target = href.startsWith('#') ? href.slice(1) : null;
        const section = target && document.getElementById(target);
        if (!section) {
            if (!href.includes('#') && resolve0(href) === location.href.split('#')[0]) link.classList.add('is-active');
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                links.forEach(item => item.classList.remove('is-active'));
                link.classList.add('is-active');
            }
        }, { rootMargin: '-45% 0px -45% 0px' });
        observer.observe(section);
    });
    function resolve0(href) { try { return new URL(href, location.href).href.split('#')[0]; } catch { return href; } }

    document.querySelectorAll('[data-brochure-placeholder]').forEach(link => {
        link.addEventListener('click', event => event.preventDefault());
    });
})();
