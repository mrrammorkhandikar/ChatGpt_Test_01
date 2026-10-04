document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

document.querySelectorAll('.details').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = document.getElementById(btn.dataset.target);
    const open = panel.classList.toggle('open');
    btn.textContent = open ? 'Hide architecture −' : 'View architecture +';
  });
});

document.querySelector('.copy-email')?.addEventListener('click', async (event) => {
  const email = event.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    event.currentTarget.textContent = 'Email copied ✓';
    setTimeout(() => event.currentTarget.textContent = 'Copy email', 1600);
  } catch {
    window.location.href = 'mailto:' + email;
  }
});