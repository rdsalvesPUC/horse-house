// Verifica a URL atual
const path = window.location.pathname;

// Seleciona todos os links com data-view
document.querySelectorAll('[data-view]').forEach(link => {
  const href = link.getAttribute('href');

  // Se o href bater com o path atual, marca como ativo
  if (path === href) {
    // Adiciona destaque no link
    link.classList.add('bg-secondary/10', 'text-secondary');
    link.classList.remove('text-tertiary', 'hover:bg-secondary/10', 'hover:text-secondary');

    // Ícone (svg) recebe text-secondary também
    const icon = link.querySelector('svg');
    if (icon) icon.classList.remove('text-tertiary');

    // Texto do link (dentro do span)
    const span = link.querySelector('span');
    if (span) span.classList.remove('text-tertiary');
  }
});
