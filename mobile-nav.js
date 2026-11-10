(function () {
    const dock = document.querySelector('.mobile-bottom-nav');
    if (!dock) return;

    document.body.classList.add('has-mobile-bottom-nav');
    function updateDock() {
        const y = window.scrollY;
        dock.classList.toggle('is-visible', y > 72);
        dock.classList.toggle('is-compact', y > 260);
    }

    window.addEventListener('scroll', updateDock, { passive: true });
    updateDock();

    const links = [...dock.querySelectorAll('a[href]')];
    links.forEach(link => {
        const target = link.getAttribute('href').split('#')[1];
        const section = target && document.getElementById(target);
        if (!section) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                links.forEach(item => item.classList.remove('is-active'));
                link.classList.add('is-active');
            }
        }, { rootMargin: '-45% 0px -45% 0px' });
        observer.observe(section);
    });

    document.querySelectorAll('[data-brochure-placeholder]').forEach(link => {
        link.addEventListener('click', event => event.preventDefault());
    });
})();
