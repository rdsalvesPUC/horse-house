document.addEventListener('click', (e) => {
  const btn = document.getElementById('userMenuBtn');
  const menu = document.getElementById('userMenu');
  
  if (btn.contains(e.target)) {
    // clicar no botão abre/fecha
    menu.classList.toggle('hidden');
  } else if (!menu.contains(e.target)) {
    // clicar fora sempre fecha
    menu.classList.add('hidden');
  }
});
