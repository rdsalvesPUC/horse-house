// import { initUserMenuToggle } from "/scripts/topbar.js";

async function loadView(view) {
  const container = document.getElementById("views");
  try {
    const resp = await fetch(`/dashboard/views/${view}.html`);
    if (!resp.ok) throw new Error(`View "${view}" não encontrada (HTTP ${resp.status})`);
    const html = await resp.text();
    container.innerHTML = html;

    // Tenta importar o módulo específico da view em /scripts/views/
    try {
      const module = await import(`/scripts/${view}.js`);
      if (typeof module.init === "function") {
        // Garante que o init seja executado a cada navegação interna
        await module.init(container);
      }
    } catch (e) {
      console.info(`Nenhum script específico para a view "${view}"`, e);
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
