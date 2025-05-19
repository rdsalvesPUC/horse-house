async function loadView(view) {
	const container = document.getElementById("views");
	try {
		const resp = await fetch(`/dashboard/views/${view}.html`);
		if (!resp.ok) throw new Error(`View "${view}" não encontrada (HTTP ${resp.status})`);
		const html = await resp.text();
		container.innerHTML = html;
		try {
			const module = await import(`/scripts/${view}.js`);
			if (typeof module.init === "function") {
				module.init(container);
			}
		} catch (e) {
			console.info(`Nenhum script específico para a view "${view}"`);
		}
	} catch (err) {
		console.error(err);
		container.innerHTML = `
      <div class="p-6 text-red-500">
        Erro ao carregar a página “${view}”. Tente novamente.
      </div>
    `;
	}
}

function getViewFromPath() {
	const parts = location.pathname.split("/");
	return parts[2] || "visao-geral";
}

export function initUserMenuToggle() {
	const btn = document.getElementById("userMenuBtn");
	const menu = document.getElementById("userMenu");
	if (!btn || !menu) return;

	// Abre/fecha ao clicar no botão
	btn.addEventListener("click", (e) => {
		e.stopPropagation();
		menu.classList.toggle("hidden");
	});

	// Fecha se clicar fora do menu
	document.addEventListener("click", (e) => {
		if (!menu.contains(e.target)) {
			menu.classList.add("hidden");
		}
	});
}

// Passo inicial: carregar a view correta conforme a URL
window.addEventListener("DOMContentLoaded", () => {
	const initialView = getViewFromPath();
	loadView(initialView);
	initUserMenuToggle();
});

// Captura cliques em links com [data-view] para roteamento interno
document.body.addEventListener("click", (e) => {
	const link = e.target.closest("[data-view]");
	if (!link) return;

	e.preventDefault();
	const view = link.dataset.view;
	const href = link.getAttribute("href");

	history.pushState({ view }, "", href);
	loadView(view);
});

// Trata Voltar/Avançar do navegador
window.addEventListener("popstate", (e) => {
	const view = e.state?.view || getViewFromPath();
	loadView(view);
});
