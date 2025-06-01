async function acessoControle() {
    const TOKEN = localStorage.getItem("token");
    const res = await fetch("/api/loginExpirado", {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!res.ok) {
        const data = await res.json();
        window.location.href = data.login ? "/login" : "/home";
    }
}

async function carregarDadosUsuario() {
    await acessoControle();
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
    const logoutBtn = document.getElementById('logout');

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = "/login";
    });

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
    } else {
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
        // Sempre repopula o <select> ao chamar esta função
        select.innerHTML = "";
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.innerHTML = "Selecione um Haras";
        select.appendChild(defaultOption);
        haras.forEach(h => {
            const option = document.createElement('option');
            option.value = h.ID;
            option.innerHTML = h.Nome;
            select.appendChild(option);
        });
        // Sempre tenta restaurar a seleção salva
        const storedHaras = localStorage.getItem('selectedHaras');
        if (storedHaras) {
            select.value = storedHaras;
        }
        // Atualiza o localStorage quando o usuário altera a seleção
        select.onchange = () => {
            localStorage.setItem('selectedHaras', select.value);
        };
    }
}

export async function initUserMenuToggle() {
    const btn = document.getElementById('userMenuBtn');
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