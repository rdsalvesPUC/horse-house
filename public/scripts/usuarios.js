// public/scripts/views/usuarios.js

const TOKEN = localStorage.getItem("token");

/* helpers DOM */
const selectHarasEl = () => document.getElementById("select-haras");
const tbodyEl       = () => document.getElementById("tbody-gerentes");
const modalEl       = () => document.getElementById("modal");
const btnCancelEl   = () => document.getElementById("btn-cancelar");
const btnSalvarEl   = () => document.getElementById("btn-salvar");
const edNome        = () => document.getElementById("edit-nome");
const edSobrenome   = () => document.getElementById("edit-sobrenome");
const edEmail       = () => document.getElementById("edit-email");
const edTel         = () => document.getElementById("edit-telefone");
const edCpf         = () => document.getElementById("edit-cpf");
const edData        = () => document.getElementById("edit-data");
const inputSearch   = () => document.getElementById("search");

/* Abre o modal com dados para edição */
function openModal(g) {
  // Armazena o ID para edição
  modalEl().dataset.idEdicao = g.ID;

  edNome().value       = g.nome;
  edSobrenome().value  = g.sobrenome;
  edEmail().value      = g.email;
  edTel().value        = g.telefone ?? "";
  edCpf().value        = g.cpf;
  edData().value       = g.data_nascimento?.split("T")[0] || "";
  modalEl().classList.remove("hidden");
  modalEl().classList.add("flex");
}

/* Fecha o modal */
function closeModal() {
  modalEl().classList.add("hidden");
  modalEl().classList.remove("flex");
}

/* Verifica permissão */
async function acessoControle() {
  const r = await fetch("/api/requerProprietario", {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!r.ok) {
    const result = await r.json();
    window.location.href = result.login ? "/login" : "/home";
  }
}

/* Carrega lista de Haras no <select> */
async function carregarHaras() {
  const r = await fetch("/api/getAllHaras", {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const lista = await r.json();
  const select = selectHarasEl();
  select.innerHTML =
    '<option value="">Selecione o Haras</option>' +
    lista
      .map((h) => `<option value="${h.ID}">${h.Nome}</option>`)
      .join("");
}

/* Exibe na tabela os gerentes do Haras selecionado */
async function listarGerentes(harasId) {
  const tbody = tbodyEl();
  if (!harasId) {
    tbody.innerHTML = "";
    return;
  }
  tbody.innerHTML = '<tr><td class="p-3" colspan="7">Carregando...</td></tr>';
  const url = `/api/gerentes/haras/${harasId}`;

  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const gerentes = await r.json();

  if (!Array.isArray(gerentes) || gerentes.length === 0) {
    tbody.innerHTML = '<tr><td class="p-3" colspan="7">Nenhum gerente encontrado.</td></tr>';
    return;
  }

  tbody.innerHTML = gerentes
    .map(
      (g) => `
      <tr class="odd:bg-white even:bg-gray-50">
        <td class="p-3">${g.nome}</td>
        <td class="p-3">${g.sobrenome}</td>
        <td class="p-3">${g.email}</td>
        <td class="p-3 telefone">${g.telefone ?? ""}</td>
        <td class="p-3 cpf">${g.cpf}</td>
        <td class="p-3">${g.data_nascimento?.split("T")[0] ?? ""}</td>
        <td class="p-3 text-center space-x-2">
          <button data-id="${g.ID}" class="edit text-blue-600 hover:underline">Editar</button>
          <button data-id="${g.ID}" class="del text-red-600 hover:underline">Excluir</button>
        </td>
      </tr>`
    )
    .join("");

  // bind eventos de editar e excluir
  tbody.querySelectorAll(".edit").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const r2 = await fetch(`/api/gerente/${btn.dataset.id}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      openModal(await r2.json());
    })
  );
  tbody.querySelectorAll(".del").forEach((btn) =>
    btn.addEventListener("click", () => removerGerente(btn.dataset.id))
  );
  // formatação de texto
  tbody.querySelectorAll(".cpf").forEach((cpfEl) =>
    (cpfEl.textContent = cpfEl.textContent.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"))
  );
  tbody.querySelectorAll(".telefone").forEach((telEl) =>
    (telEl.textContent = telEl.textContent.replace(
      telEl.textContent.length === 11
        ? /(\d{2})(\d{5})(\d{4})/
        : /(\d{2})(\d{4})(\d{4})/,
      "($1) $2-$3"
    ))
  );
}

/* Exclui gerente e recarrega tabela */
async function removerGerente(id) {
  if (!confirm("Confirma excluir o gerente?")) return;
  await fetch(`/api/deletarFuncionario/gerente/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  listarGerentes(selectHarasEl().value);
}

/* Salva edição e recarrega */
function initModalListeners() {
  btnSalvarEl().addEventListener("click", async () => {
    const idEdicao = modalEl().dataset.idEdicao;
    console.log("Salvando gerente com ID:", idEdicao);
    const dados = {
      nome: edNome().value.trim(),
      sobrenome: edSobrenome().value.trim(),
      email: edEmail().value.trim(),
      telefone: edTel().value.trim(),
      cpf: edCpf().value.trim().replace(/\D/g, ""),
      dataNascimento: edData().value,
    };
    await fetch(`/api/editarGerente/${idEdicao}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(dados),
    });
    closeModal();
    listarGerentes(selectHarasEl().value);
  });
  btnCancelEl().addEventListener("click", closeModal);
}

/**
 * Função de inicialização exportada.
 * Deve ser chamada **sempre** depois de injetar o HTML de usuarios.html.
 */
export async function init(container) {
  await acessoControle();
  await carregarHaras();

  // Quando mudar o select, lista
  selectHarasEl().addEventListener("change", () => {
    listarGerentes(selectHarasEl().value);
  });

  initModalListeners();
}
