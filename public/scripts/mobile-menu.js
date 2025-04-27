const burger   = document.getElementById('burgerBtn');
const drawer   = document.getElementById('drawer');
const panel    = document.getElementById('panel');
const backdrop = document.getElementById('backdrop');
const closeBtn = document.getElementById('closeBtn');

function openDrawer() {
  drawer.classList.remove('hidden');
  requestAnimationFrame(() => {
	panel.classList.remove('-translate-x-full');
	backdrop.classList.remove('opacity-0');
  });
}
function closeDrawer() {
  panel.classList.add('-translate-x-full');
  backdrop.classList.add('opacity-0');
  // aguarda a transição antes de esconder
  setTimeout(() => drawer.classList.add('hidden'), 300);
}

burger.addEventListener('click', openDrawer);
closeBtn.addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);