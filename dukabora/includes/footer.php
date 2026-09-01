</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.querySelector('[data-dashboard-trigger]');
    const panel = document.getElementById('dashboardPanel');
    const closers = document.querySelectorAll('[data-dashboard-close]');

    if (!trigger || !panel) return;

    const closePanel = () => {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('dashboard-open');
    };

    const openPanel = () => {
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.classList.add('dashboard-open');
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = panel.classList.contains('is-open');
      isOpen ? closePanel() : openPanel();
    });

    closers.forEach((element) => {
      element.addEventListener('click', closePanel);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    });
  });
</script>
</body>
</html>
