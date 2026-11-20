/* Career Café first-party analytics.
   Anonymous: a random visitor id in this browser, no cookies, no IP storage, and never the
   text people type into forms (only which field they clicked). */
(function () {
    'use strict';
    if (window.__ccAnalytics) return;
    window.__ccAnalytics = true;
    if (!/^https?:$/.test(location.protocol) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

    var API = (window.CAREER_CAFE_API_BASE || 'https://careercafe-backend-j998.onrender.com') + '/api/analytics/collect';
    var SESSION_TIMEOUT = 30 * 60 * 1000;
    var PAGE_EVENTS = {
        'africa-future-work-reset.html': 'masterclass',
        'career-conversations.html': 'career-conversations'
    };

    /* ── ids ─────────────────────────────────────────────────── */
    function rid() {
        try { if (crypto.randomUUID) return crypto.randomUUID().replace(/-/g, ''); } catch (e) { /* ignore */ }
        return (Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 32);
    }
    function store(kind) { try { return window[kind]; } catch (e) { return null; } }
    var ls = store('localStorage');
    function get(k) { try { return ls && ls.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { if (ls) ls.setItem(k, v); } catch (e) { /* ignore */ } }

    /* Career Café's own domains: moving between them is one visit by one visitor, not a referral. */
    var OWN_DOMAINS = ['careercafe.co.ke', 'careercafe.africa', 'thecareercafe.africa'];
    function bareHost(h) { return String(h || '').toLowerCase().replace(/^www\./, ''); }
    function isOwnHost(h) { return OWN_DOMAINS.indexOf(bareHost(h)) !== -1; }

    // Cross-domain hand-off: links to our other domains carry ?_ccid=<visitor>.<session>.<time>
    var handoff = null;
    try {
        var hp = new URLSearchParams(location.search);
        var raw = hp.get('_ccid');
        if (raw) {
            var parts = raw.split('.');
            if (parts.length === 3 && /^[A-Za-z0-9_-]{8,64}$/.test(parts[0]) && /^[A-Za-z0-9_-]{8,64}$/.test(parts[1])
                && Math.abs(Date.now() - Number(parts[2])) < 2 * 60 * 1000) {
                handoff = { v: parts[0], s: parts[1] };
            }
            hp.delete('_ccid');
            var clean = location.pathname + (hp.toString() ? '?' + hp.toString() : '') + location.hash;
            history.replaceState(history.state, '', clean); // keep the id out of shared/bookmarked links
        }
    } catch (e) { /* ignore */ }

    var isNewVisitor = false;
    var visitor = handoff ? handoff.v : get('cc_vid');
    if (handoff) set('cc_vid', visitor);
    if (!visitor || !/^[A-Za-z0-9_-]{8,64}$/.test(visitor)) { visitor = rid(); isNewVisitor = true; set('cc_vid', visitor); }

    var now = Date.now();
    var session = null, sessionSource = null;
    try { var s = JSON.parse(get('cc_sess') || 'null'); if (s && s.id && now - s.last < SESSION_TIMEOUT) { session = s.id; sessionSource = s.src; } } catch (e) { /* ignore */ }
    if (handoff && handoff.s !== session) {
        // Continue the visit started on our other domain; its traffic source was already recorded there.
        session = handoff.s;
        sessionSource = { ref: '' };
    }

    var params = new URLSearchParams(location.search);
    var utm = {
        us: params.get('utm_source'), um: params.get('utm_medium'), uc: params.get('utm_campaign'),
        uct: params.get('utm_content'), ut: params.get('utm_term')
    };
    var externalRef = '';
    try {
        if (document.referrer) {
            var refHost = new URL(document.referrer).host;
            if (refHost !== location.host && !isOwnHost(refHost)) externalRef = document.referrer;
        }
    } catch (e) { /* ignore */ }
    // A new campaign link starts a new session, as in GA.
    if (session && utm.us && sessionSource && utm.us !== sessionSource.us) session = null;
    if (!session) {
        session = rid();
        sessionSource = { ref: externalRef, us: utm.us, um: utm.um, uc: utm.uc, uct: utm.uct, ut: utm.ut };
    }
    function touchSession() { set('cc_sess', JSON.stringify({ id: session, last: Date.now(), src: sessionSource })); }
    touchSession();

    var pageview = rid();
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var pageEvent = (document.body && document.body.getAttribute('data-cc-event')) || PAGE_EVENTS[file] || null;
    var path = location.pathname || '/';

    /* ── queue ───────────────────────────────────────────────── */
    var queue = [];
    var sentNew = false;
    function push(hit) {
        hit.pv = pageview;
        hit.path = path;
        if (!('ek' in hit)) hit.ek = pageEvent;
        queue.push(hit);
        touchSession();
        if (queue.length >= 20) flush();
    }
    function payload(hits) {
        var p = {
            v: visitor, s: session, n: isNewVisitor && !sentNew,
            sw: screen.width, sh: screen.height,
            lang: navigator.language || '', tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
            src: sessionSource, hits: hits
        };
        sentNew = true;
        return JSON.stringify(p);
    }
    function flush(useBeacon) {
        if (!queue.length) return;
        var body = payload(queue.splice(0, 40));
        try {
            if (useBeacon && navigator.sendBeacon && navigator.sendBeacon(API, new Blob([body], { type: 'text/plain' }))) return;
            fetch(API, { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain' }, keepalive: true, credentials: 'omit' }).catch(function () { });
        } catch (e) { /* ignore */ }
        if (queue.length) flush(useBeacon);
    }
    setInterval(function () { flush(false); }, 5000);

    /* ── page view, engagement time, scroll depth ───────────── */
    push({ type: 'pageview', title: document.title });
    flush(false);

    var engaged = 0, visibleSince = document.hidden ? null : Date.now(), maxScroll = 0;
    function engagedMs() { return engaged + (visibleSince ? Date.now() - visibleSince : 0); }
    function updateScroll() {
        var doc = document.documentElement;
        var h = Math.max(doc.scrollHeight - window.innerHeight, 1);
        var pct = Math.min(100, Math.round(((window.scrollY || doc.scrollTop) / h) * 100));
        if (doc.scrollHeight <= window.innerHeight + 4) pct = 100;
        if (pct > maxScroll) maxScroll = pct;
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    function sendEngagement(beacon) {
        push({ type: 'engagement', ms: engagedMs(), sd: maxScroll, ek: pageEvent });
        flush(beacon);
    }
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            if (visibleSince) { engaged += Date.now() - visibleSince; visibleSince = null; }
            sendEngagement(true);
        } else {
            visibleSince = Date.now();
        }
    });
    window.addEventListener('pagehide', function () { sendEngagement(true); });

    /* ── clicks ──────────────────────────────────────────────── */
    function eventKeyFor(el) {
        var holder = el.closest && el.closest('[data-cc-event]');
        return holder ? holder.getAttribute('data-cc-event') : pageEvent;
    }
    function labelOf(el) {
        var t = el.getAttribute('aria-label') || el.getAttribute('data-cc-label') || (el.innerText || el.textContent || '').trim()
            || el.getAttribute('title') || (el.querySelector && el.querySelector('img[alt]') ? el.querySelector('img[alt]').alt : '')
            || el.value || '';
        return t.replace(/\s+/g, ' ').trim().slice(0, 120);
    }
    function formIdOf(el) {
        var f = el.form || el.closest('form');
        if (f) return f.id || f.getAttribute('name') || 'form';
        var section = el.closest('section[id], [id]');
        return section ? section.id : 'form';
    }
    function fieldName(el) {
        var name = el.name || el.id || el.getAttribute('aria-label') || el.type || el.tagName.toLowerCase();
        if ((el.type === 'radio' || el.type === 'checkbox') && el.value && el.value !== 'on') name += ': ' + el.value;
        return name.slice(0, 120);
    }
    var FIELD = 'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]),select,textarea';
    var lastField = { el: null, at: 0 };

    document.addEventListener('click', function (e) {
        var el = e.target && e.target.closest ? e.target.closest(FIELD + ',a[href],button,[role=button],summary,label,input[type=submit],input[type=button]') : null;
        if (!el) return;

        // A click on a <label> is re-dispatched by the browser to its input; count only that one.
        if (el.tagName === 'LABEL') return;

        if (el.matches(FIELD)) {
            // One press on a form input = exactly one form click.
            var t = Date.now();
            if (lastField.el === el && t - lastField.at < 300) return; // the label->input echo of the same press
            lastField = { el: el, at: t };
            push({ type: 'form_click', tg: fieldName(el), fid: formIdOf(el), ek: eventKeyFor(el) });
            return;
        }

        var href = el.tagName === 'A' ? el.getAttribute('href') || '' : '';
        var outbound = false;
        if (href) {
            try {
                var u = new URL(href, location.href);
                var crossOwn = /^https?:$/.test(u.protocol) && u.host !== location.host && isOwnHost(u.host);
                if (crossOwn) {
                    // Carry the visitor and session across to our other domain.
                    u.searchParams.set('_ccid', visitor + '.' + session + '.' + Date.now());
                    el.setAttribute('href', u.href);
                    setTimeout(function () { try { var c = new URL(el.href); c.searchParams.delete('_ccid'); el.setAttribute('href', c.href); } catch (er) { /* ignore */ } }, 1500);
                    u.searchParams.delete('_ccid');
                }
                outbound = /^https?:$/.test(u.protocol) && u.host !== location.host && !crossOwn;
                href = u.protocol === 'mailto:' || u.protocol === 'tel:' ? u.protocol.replace(':', '') : u.href;
            } catch (err) { /* keep raw */ }
        }
        push({ type: outbound ? 'outbound' : 'click', tg: labelOf(el), href: href.slice(0, 500), ek: eventKeyFor(el) });
        if (outbound) flush(true);
    }, true);

    var startedForms = {};
    function onFormInput(e) {
        var el = e.target;
        if (!el || !el.matches || !el.matches(FIELD)) return;
        var fid = formIdOf(el);
        if (startedForms[fid]) return;
        startedForms[fid] = true;
        push({ type: 'form_start', fid: fid, tg: fieldName(el), ek: eventKeyFor(el) });
    }
    document.addEventListener('input', onFormInput, true);
    document.addEventListener('change', onFormInput, true);
    document.addEventListener('submit', function (e) {
        var f = e.target;
        push({ type: 'form_submit', fid: (f && (f.id || f.getAttribute('name'))) || 'form', ek: eventKeyFor(f) });
        flush(true);
    }, true);

    /* ── impressions of event cards ([data-cc-event] blocks inside a page) ── */
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                io.unobserve(en.target);
                var key = en.target.getAttribute('data-cc-event');
                if (key && key !== pageEvent) push({ type: 'impression', ek: key, tg: en.target.getAttribute('data-cc-name') || '' });
            });
        }, { threshold: 0.5 });
        var watch = function () {
            document.querySelectorAll('[data-cc-event]:not([data-cc-watched])').forEach(function (n) {
                if (n === document.body) return;
                n.setAttribute('data-cc-watched', '');
                io.observe(n);
            });
        };
        watch();
        var pending = null;
        if ('MutationObserver' in window) new MutationObserver(function () {
            if (pending) return;
            pending = setTimeout(function () { pending = null; watch(); }, 400);
        }).observe(document.documentElement, { childList: true, subtree: true });
    }
})();
