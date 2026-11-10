/* FAQ section + rule-based support chatbot. One data set feeds both. No backend needed. */
(function () {
  'use strict';

  var CONTACT = { email: 'careercafeke@gmail.com', phone: '+254720087837', phoneLabel: '+254 720 087837' };
  var REG_URL = 'https://careercafe.co.ke/africa-future-work-reset.html#registration';

  // TODO (Mark/client): confirm the items marked CONFIRM before launch.
  var FAQ = [
    { cat: 'Registration', q: 'How do I register for the VALUE Global Career Masterclass?',
      a: 'Open the masterclass page, fill in your name, email, phone number and profession, pick a payment method and submit. Then complete payment to secure your seat.',
      k: 'register registration sign up seat reserve join enroll book how' },
    { cat: 'Registration', q: 'When is the masterclass and how long is it?',
      a: 'It runs live online on 9th and 10th December 2026, from 5:00 PM to 9:00 PM EAT each day.',
      k: 'date dates when time schedule hours duration long december' },
    { cat: 'Registration', q: 'Is there pre-work?',
      a: 'Yes. Before Day 1 you complete a 25-point Career Diagnosis, which takes about 90 minutes. Between the two days you send one message you commit to.',
      k: 'prework pre-work diagnosis prepare preparation homework' },
    { cat: 'Registration', q: 'Can my employer, university or network buy seats for a team?',
      a: 'Yes. Group seats are available with direct invoicing. Email us at ' + CONTACT.email + ' with the number of seats.',
      k: 'group team employer company organisation organization bulk invoice university seats' },
    { cat: 'Payments', q: 'How much does it cost?',
      a: 'The subsidised price is $99 or KES 12,900 per seat. Seats are limited.',
      k: 'price cost fee how much pay amount kes usd dollars' },
    { cat: 'Payments', q: 'How do I pay by M-Pesa?',
      a: 'Go to Lipa na M-Pesa, then Paybill. Enter Paybill 542542 and account 558810 (account name: The Career Cafe Africa) and pay KES 12,900. Then email your M-Pesa confirmation message to ' + CONTACT.email + '.',
      k: 'mpesa m-pesa paybill pay mobile money 542542 558810 safaricom' },
    { cat: 'Payments', q: 'Can I pay by card?',
      a: 'Yes. Choose PesaPal on the registration form to pay by card or mobile money through the secure PesaPal checkout. Your receipt is emailed.',
      k: 'card visa mastercard pesapal credit debit international online' },
    { cat: 'Payments', q: 'My payment went through but my registration shows pending. What now?',
      a: 'For M-Pesa, make sure you emailed the confirmation message to ' + CONTACT.email + ', since seats are confirmed once we verify it. For PesaPal, return to the registration page and use Check status. If it still shows pending, email us your name, phone number and the transaction code.',
      k: 'pending failed not working stuck status payment went through deducted charged problem error issue' },
    { cat: 'Payments', q: 'What is your refund policy?',
      a: 'Full refund up to 7 days before Day 1. Half refund from 6 to 2 days before. No refund after that, but you can transfer your seat to a colleague. If we cancel or reschedule, you get a full refund.',
      k: 'refund cancel cancellation money back transfer seat colleague' },
    { cat: 'Confirmations', q: 'How will I know my registration is confirmed?',
      a: 'You receive a confirmation by email once your payment is verified. PesaPal payments also email a receipt instantly. Check your spam folder if you do not see it.', /* CONFIRM timing */
      k: 'confirmation confirmed email receipt verify did not receive no email spam' },
    { cat: 'Confirmations', q: 'I did not get a confirmation email. What should I do?',
      a: 'Check spam or promotions first. If it is not there, email ' + CONTACT.email + ' with the name and phone number you registered with, and we will resend it.',
      k: 'no email missing resend confirmation not received did not get' },
    { cat: 'Confirmations', q: 'I made a mistake on my registration form. Can I fix it?',
      a: 'Yes. Email ' + CONTACT.email + ' with the correct details and the email you registered with, and we will update your record.',
      k: 'mistake wrong typo correct change edit update details name email phone' },
    { cat: 'Event access', q: 'How do I join the live sessions?',
      a: 'The masterclass is fully online. After your registration is confirmed, you receive your joining details by email before Day 1. You join both live days with the same link or details.', /* CONFIRM platform + when link is sent */
      k: 'join link access zoom teams meet online virtual attend login how to join' },
    { cat: 'Event access', q: 'Will there be recordings?',
      a: 'Talk and teaching recordings reach you within 48 hours and stay available for 30 days. Group work and hot seats are not recorded, to protect confidentiality.',
      k: 'recording replay record miss missed watch later' },
    { cat: 'Event access', q: 'Do I get a certificate?',
      a: 'You get a completion certificate against set participation requirements. It is not an accreditation.',
      k: 'certificate certification accredited accreditation completion' },
    { cat: 'Event access', q: 'Who do I contact for urgent help on the event day?',
      a: 'Call ' + CONTACT.phoneLabel + ' or email ' + CONTACT.email + '.', /* CONFIRM day-of support channel */
      k: 'urgent help support contact day of problem cannot join phone call' }
  ];

  var CATS = ['Registration', 'Payments', 'Confirmations', 'Event access'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- FAQ section ---------- */
  function renderFaq() {
    var host = document.getElementById('faqRoot');
    if (!host) return;
    var tabs = el('div', 'faq-tabs');
    tabs.setAttribute('role', 'tablist');
    var list = el('div', 'faq-list');
    var current = 'Registration';

    function draw() {
      list.textContent = '';
      FAQ.filter(function (f) { return f.cat === current; }).forEach(function (f) {
        var d = el('details', 'faq-item');
        d.appendChild(el('summary', null, f.q));
        var a = el('div', 'faq-a');
        a.appendChild(el('p', null, f.a));
        d.appendChild(a);
        list.appendChild(d);
      });
      [].forEach.call(tabs.children, function (b) {
        b.setAttribute('aria-selected', String(b.textContent === current));
      });
    }

    CATS.forEach(function (c) {
      var b = el('button', 'faq-tab', c);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { current = c; draw(); });
      tabs.appendChild(b);
    });

    var more = el('p', 'faq-more');
    more.appendChild(document.createTextNode('Still stuck? '));
    var ask = el('button', null, 'Ask our assistant');
    ask.type = 'button';
    ask.addEventListener('click', function () { window.CareerCafeChat && window.CareerCafeChat.open(); });
    more.appendChild(ask);

    host.appendChild(tabs); host.appendChild(list); host.appendChild(more);
    draw();

    // FAQPage structured data for search
    var ld = {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(function (f) {
        return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } };
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ---------- Chatbot ---------- */
  var STOP = /\b(the|a|an|is|are|do|i|my|me|to|of|for|how|can|what|and|in|it|on|you|your|we|be)\b/g;
  function tokens(s) {
    return s.toLowerCase().replace(STOP, ' ').replace(/[^a-z0-9\- ]/g, ' ').split(/\s+/).filter(function (w) { return w.length > 1; });
  }
  function best(query) {
    var qt = tokens(query);
    if (!qt.length) return null;
    var top = null, topScore = 0;
    FAQ.forEach(function (f) {
      var kt = tokens(f.k + ' ' + f.q);
      var score = 0;
      qt.forEach(function (w) {
        if (kt.indexOf(w) !== -1) score += (f.k.toLowerCase().indexOf(w) !== -1 ? 2 : 1);
      });
      if (score > topScore) { topScore = score; top = f; }
    });
    return topScore >= 2 ? top : null;
  }

  function buildChat() {
    var launch = el('button', 'cc-launch');
    launch.type = 'button';
    launch.setAttribute('aria-label', 'Open support chat');
    launch.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Need help?</span>';

    var panel = el('section', 'cc-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Career Café support chat');
    var head = el('div', 'cc-head');
    var ht = el('div');
    ht.appendChild(el('strong', null, 'Career Café support'));
    ht.appendChild(el('span', null, 'Registration, payments and event access'));
    var x = el('button', 'cc-x', '\u00d7');
    x.type = 'button'; x.setAttribute('aria-label', 'Close chat');
    head.appendChild(ht); head.appendChild(x);

    var log = el('div', 'cc-log');
    log.setAttribute('aria-live', 'polite');
    var form = el('form', 'cc-form');
    var input = el('input');
    input.type = 'text'; input.placeholder = 'Type your question'; input.setAttribute('aria-label', 'Your question'); input.maxLength = 300;
    var send = el('button', null, 'Send');
    send.type = 'submit';
    form.appendChild(input); form.appendChild(send);
    panel.appendChild(head); panel.appendChild(log); panel.appendChild(form);
    document.body.appendChild(launch); document.body.appendChild(panel);

    function say(text, who) {
      var m = el('div', 'cc-msg ' + who, text);
      log.appendChild(m); log.scrollTop = log.scrollHeight;
    }
    function chips(items) {
      var row = el('div', 'cc-chips');
      items.forEach(function (it) {
        var c;
        if (it.href) { c = el('a', 'cc-chip', it.label); c.href = it.href; if (/^https?:/.test(it.href)) { c.target = '_blank'; c.rel = 'noopener'; } }
        else { c = el('button', 'cc-chip', it.label); c.type = 'button'; c.addEventListener('click', it.fn); }
        row.appendChild(c);
      });
      log.appendChild(row); log.scrollTop = log.scrollHeight;
    }
    function topics() {
      chips([
        { label: 'How to register', fn: function () { ask('How do I register?'); } },
        { label: 'Price and payment', fn: function () { ask('How much does it cost?'); } },
        { label: 'M-Pesa details', fn: function () { ask('How do I pay by M-Pesa?'); } },
        { label: 'Payment pending', fn: function () { ask('My payment went through but my registration shows pending'); } },
        { label: 'How to join', fn: function () { ask('How do I join the live sessions?'); } },
        { label: 'Refunds', fn: function () { ask('What is your refund policy?'); } }
      ]);
    }
    function handoff() {
      say('I could not find a clear answer. Our team can help directly:', 'bot');
      chips([
        { label: 'Email us', href: 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Masterclass support') },
        { label: 'Call ' + CONTACT.phoneLabel, href: 'tel:' + CONTACT.phone },
        { label: 'WhatsApp', href: 'https://wa.me/' + CONTACT.phone.replace('+', '') }, /* CONFIRM this number is on WhatsApp */
        { label: 'Browse FAQ', href: '#faq' }
      ]);
    }
    function ask(text) {
      say(text, 'me');
      var f = best(text);
      if (f) {
        say(f.a, 'bot');
        if (f.cat === 'Registration' || f.cat === 'Payments') chips([{ label: 'Register now', href: REG_URL }]);
      } else handoff();
    }

    function open() {
      panel.classList.add('open'); launch.style.display = 'none';
      if (!log.children.length) {
        say('Hi, I can help with registration, payments, confirmations and event access. Pick a topic or type your question.', 'bot');
        topics();
      }
      input.focus();
    }
    function close() { panel.classList.remove('open'); launch.style.display = ''; launch.focus(); }

    launch.addEventListener('click', open);
    x.addEventListener('click', close);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      input.value = '';
      ask(v);
    });
    window.CareerCafeChat = { open: open, close: close };
  }

  function init() { renderFaq(); buildChat(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();