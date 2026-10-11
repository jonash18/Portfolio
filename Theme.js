/* Light / dark theme switcher.
   Loaded in <head> so the saved theme is applied before the page paints (no flash). */
(function () {
    var root = document.documentElement;
    var theme = 'dark'; // default look of the site

    try {
        var saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') theme = saved;
    } catch (e) { /* storage blocked: keep default */ }

    function apply(t) {
        root.setAttribute('data-theme', t);
        root.setAttribute('data-bs-theme', t);

        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', t === 'light' ? '#d4dfe1' : '#052011');

        var btn = document.getElementById('themeToggle');
        if (btn) {
            var label = t === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
            btn.setAttribute('aria-label', label);
            btn.setAttribute('title', label);
        }
    }

    apply(theme);

    document.addEventListener('DOMContentLoaded', function () {
        apply(theme);

        // Mark the current page and add a smooth transition between portfolio pages.
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.site-nav a[href]').forEach(function (link) {
            var href = link.getAttribute('href') || '';
            if (href.indexOf('#') === 0) {
                var section = document.querySelector(href);
                if (section) {
                    link.addEventListener('click', function (event) {
                        event.preventDefault();
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        window.history.replaceState(null, '', href);
                    });
                }
                return;
            }

            if (href.indexOf('://') !== -1 || href.indexOf('mailto:') === 0) return;

            var linkPage = href.split('#')[0].split('?')[0] || 'index.html';
            if (linkPage === currentPage) {
                link.classList.add('is-current');
                link.setAttribute('aria-current', 'page');
            }

            link.addEventListener('click', function (event) {
                if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                if (link.target === '_blank' || link.hasAttribute('download')) return;

                var destination = new URL(link.href, window.location.href);
                if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;

                event.preventDefault();
                document.body.classList.add('page-leaving');
                window.setTimeout(function () {
                    window.location.href = destination.href;
                }, 240);
            });
        });

        if (window.location.hash === '#activities') {
            window.setTimeout(function () {
                var projectsSection = document.getElementById('activities');
                if (projectsSection) projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
        }

        var btn = document.getElementById('themeToggle');
        if (btn) {
            btn.addEventListener('click', function () {
                theme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                apply(theme);
                try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
            });
        }

        // Add a floating back-to-top control on every page.
        var backToTop = document.getElementById('backToTop');
        if (!backToTop) {
            backToTop = document.createElement('button');
            backToTop.id = 'backToTop';
            backToTop.className = 'back-to-top';
            backToTop.type = 'button';
            backToTop.setAttribute('aria-label', 'Back to top');
            backToTop.setAttribute('title', 'Back to top');
            backToTop.innerHTML = '<i class="ph ph-arrow-up" aria-hidden="true"></i>';
            document.body.appendChild(backToTop);
        }

        function updateBackToTop() {
            backToTop.classList.toggle('is-visible', window.scrollY > 420);
        }

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('scroll', updateBackToTop, { passive: true });
        updateBackToTop();

        var previewModal = document.getElementById('projectPreviewModal');
        var previewFrame = document.getElementById('projectPreviewFrame');
        var previewTitle = document.getElementById('previewModalTitle');
        var previewExternalLink = document.getElementById('previewExternalLink');
        var closePreview = document.getElementById('closePreview');
        var previewLinks = document.querySelectorAll('[data-live-preview]');
        var lastPreviewTrigger = null;

        if (previewModal && previewFrame && closePreview) {
            function hidePreview() {
                previewModal.hidden = true;
                document.body.classList.remove('preview-open');
                previewFrame.src = 'about:blank';
                if (lastPreviewTrigger) lastPreviewTrigger.focus();
            }

            previewLinks.forEach(function (link) {
                link.addEventListener('click', function (event) {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    lastPreviewTrigger = link;
                    previewTitle.textContent = link.getAttribute('data-preview-title') || 'Live project preview';
                    previewExternalLink.href = link.href;
                    previewFrame.title = previewTitle.textContent + ' live preview';
                    previewFrame.src = link.href;
                    previewModal.hidden = false;
                    document.body.classList.add('preview-open');
                    closePreview.focus();
                });
            });

            closePreview.addEventListener('click', hidePreview);
            previewModal.addEventListener('click', function (event) {
                if (event.target === previewModal) hidePreview();
            });
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && !previewModal.hidden) hidePreview();
            });
        }

        // Keep every project card in numerical order and normalize its label.
        // The capstone is already numbered 01 and is intentionally kept first.
        var workContainer = document.getElementById('content');
        if (workContainer) {
            Array.prototype.slice.call(workContainer.children)
                .filter(function (item) { return item.classList.contains('work-item'); })
                .sort(function (a, b) {
                    var aNumber = parseInt((a.querySelector('.work-num') || {}).textContent || '999', 10);
                    var bNumber = parseInt((b.querySelector('.work-num') || {}).textContent || '999', 10);
                    return aNumber - bNumber;
                })
                .forEach(function (item, index) {
                    var number = item.querySelector('.work-num');
                    if (number) number.textContent = String(index + 2).padStart(2, '0');
                    workContainer.appendChild(item);
                });
        }

        var workFilters = document.querySelectorAll('.work-filter');
        var filterableProjects = document.querySelectorAll('.capstone-feature[data-category], #content > .work-item[data-category]');

        function renumberVisibleProjects() {
            var visibleNumber = 1;
            Array.prototype.slice.call(document.querySelectorAll('#content > .capstone-feature[data-category], #content > .work-item[data-category]'))
                .forEach(function (project) {
                    var number = project.querySelector('.work-num');
                    if (!number || project.classList.contains('is-filtered')) return;
                    number.textContent = String(visibleNumber).padStart(2, '0');
                    visibleNumber += 1;
                });
        }

        workFilters.forEach(function (button) {
            button.addEventListener('click', function () {
                var selectedFilter = button.getAttribute('data-filter');
                workFilters.forEach(function (filterButton) {
                    var active = filterButton === button;
                    filterButton.classList.toggle('is-active', active);
                    filterButton.setAttribute('aria-pressed', active ? 'true' : 'false');
                });

                filterableProjects.forEach(function (project) {
                    var categories = (project.getAttribute('data-category') || '').split(' ');
                    var shouldShow = selectedFilter === 'all' || categories.indexOf(selectedFilter) !== -1;
                    project.classList.toggle('is-filtered', !shouldShow);
                });

                renumberVisibleProjects();
            });
        });

        var revealItems = document.querySelectorAll('main > section, main .glass-card, footer');
        if (!revealItems.length) return;

        revealItems.forEach(function (item, index) {
            item.classList.add('scroll-reveal');
            item.style.setProperty('--reveal-delay', Math.min(index % 4, 3) * 80 + 'ms');
        });

        if (!('IntersectionObserver' in window)) {
            revealItems.forEach(function (item) { item.classList.add('is-visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries, revealObserver) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

        revealItems.forEach(function (item) { observer.observe(item); });
    });
})();
