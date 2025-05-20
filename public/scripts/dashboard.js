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

async function carregarDadosUsuario() {
    const TOKEN = localStorage.getItem('token');
    const response = await fetch(`/api/getUsuarioLogado`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        }
    });
    const userData = await response.json();
    const nome = document.getElementById('nome');
    const cargo = document.getElementById('cargo');
    const foto = document.getElementById('foto');
    const select = document.getElementById('container-haras');
    switch (userData.userType) {
        case "gerente":
            cargo.innerHTML = "Gerente";
            select.classList.add('hidden');
            break;
        case "treinador":
            cargo.innerHTML = "Treinador";
            select.classList.add('hidden');
            break;
        case "veterinario":
            cargo.innerHTML = "Veterinário";
            select.classList.add('hidden');
            break;
        case "tratador":
            cargo.innerHTML = "Tratador";
            select.classList.add('hidden');
            break;
        case "proprietario":
            cargo.innerHTML = "Proprietário";
            carregarHaras();
            break;
        default:
            cargo.innerHTML = "Usuário Desconhecido";
    }
    nome.innerHTML = `${userData.Nome} ${userData.Sobrenome}`;
    if (userData.Foto) {
        foto.src = userData.Foto;
    }
    else {
        foto.src = "/assets/images/user.png";
    }
}
async function carregarHaras() {
    const TOKEN = localStorage.getItem('token');
    const response = await fetch(`/api/getAllHaras`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        }
    });
    const haras = await response.json();
    const select = document.getElementById('select-haras');
    if (select) {
        select.innerHTML = "";
        const option = document.createElement('option');
        option.value = "";
        option.innerHTML = "Selecione um Haras";
        select.appendChild(option);
        haras.forEach(h => {
            const option = document.createElement('option');
            option.value = h.ID;
            option.innerHTML = h.Nome;
            select.appendChild(option);
        });
    }
}

export async function initUserMenuToggle() {
  const btn  = document.getElementById('userMenuBtn');
  const menu = document.getElementById('userMenu');
  if (!btn || !menu) return;

  // Abre/fecha ao clicar no botão
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  // Fecha se clicar fora do menu
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
    await carregarDadosUsuario();
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
