/* Load AFTER the main inline script and the afwr promo script (end of body). */
(function () {
    const $ = id => document.getElementById(id);
    const v = id => ($(id)?.value || '').trim();

    async function send(path, payload, formId, modalId, btn, label, okMsg) {
        const form = $(formId);
        if (!form.reportValidity()) return;          // required fields + consent now enforced
        btn.disabled = true; btn.textContent = 'Submitting...';
        try {
            const res = await fetch(`${API_BASE}${path}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error();
            showFormToast(okMsg); form.reset(); closeModalById(modalId);
        } catch { showFormToast('Submission failed. Please try again.', true); }
        finally { btn.disabled = false; btn.textContent = label; }
    }

    // Original dropped location, career level, plan and consent
    window.submitMembership = () => send('/api/memberships', {
        fullName: v('memberFullName'), email: v('memberEmail'), phone: v('memberPhone'),
        location: v('memberLocation'), occupation: v('memberOccupation'), careerLevel: v('memberLevel'),
        reason: v('memberReason'), plan: v('membershipPlan'), consent: $('memberConsent').checked
    }, 'memberForm', 'memberModal', $('memberSubmit'), 'Join Now', 'Thank you. Your membership request has been received.');

    // Original dropped role and website
    window.submitPartnership = () => send('/api/partnerships', {
        fullName: v('partnerFullName'), email: v('partnerEmail'), phone: v('partnerPhone'),
        organization: v('partnerOrganization'), role: v('partnerRole'), website: v('partnerWebsite'),
        partnershipType: v('partnershipType'), message: v('partnerMessage'),
        consentsContact: $('partnerConsent').checked, recipientEmail: 'lebaiins@gmail.com'
    }, 'partnerForm', 'partnerModal', document.querySelector('#partnerForm .btn-primary'), 'Submit Request',
    'Thank you. Your partnership request has been received.');

    // Enter key in the one-field newsletter form reloaded the page
    [['newsletterForm', () => submitNewsletter()], ['memberForm', () => submitMembership()], ['partnerForm', () => submitPartnership()]]
        .forEach(([id, fn]) => $(id)?.addEventListener('submit', e => { e.preventDefault(); fn(); }));
    $('newsletterEmail')?.setAttribute('aria-label', 'Email address');
    document.addEventListener('keydown', e => { if (e.key === 'Escape') $('newsletterPopup').style.display = 'none'; });

    // Active nav link on scroll
    const links = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(a => { const s = $(a.getAttribute('href').slice(1)); if (s) io.observe(s); });

    const nav = document.querySelector('.navbar');
    addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });

    // Team cards: keyboard access
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.classList?.contains('team-card')) e.target.click();
    });
    new MutationObserver(() => document.querySelectorAll('.team-card:not([tabindex])')
        .forEach(c => { c.tabIndex = 0; c.setAttribute('role', 'button'); }))
        .observe($('teamGrid'), { childList: true });

    // Promo card covered the whole bottom of phones after 2.5s; start minimised there
    try { if (innerWidth <= 520 && sessionStorage.getItem('afwrMin') === null) sessionStorage.setItem('afwrMin', '1'); } catch (e) {}
})();