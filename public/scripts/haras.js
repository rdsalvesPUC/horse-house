import Modal from "/scripts/load-modal.js";

const modalAlert = new Modal();


acessoControle();
/* eslint-disable no-alert */
const TOKEN = localStorage.getItem("token");
/* elementos */
const tbody = document.getElementById("tbody-haras");
const modal = document.getElementById("modal");
const btnCancel = document.getElementById("btn-cancelar");
const btnSalvar = document.getElementById("btn-salvar");

const edNome = document.getElementById("edit-nome");
const edCnpj = document.getElementById("edit-cnpj");
const edCep = document.getElementById("edit-cep");
const edEstado = document.getElementById("edit-estado");
const edCidade = document.getElementById("edit-cidade");
const edBairro = document.getElementById("edit-bairro");
const edLogradouro = document.getElementById("edit-logradouro");
const edNumero = document.getElementById("edit-numero");
const edComplemento = document.getElementById("edit-complemento");

let idEdicao = null;

/* helpers -------------------------------------------------------------- */
function openModal(h) {
    console.log(h);
    idEdicao = h.ID;
    edNome.value = h.Nome;
    edCnpj.value = h.CNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
    edCep.value = h.Cep.replace(/(\d{5})(\d{3})/, "$1-$2");
    edEstado.value = h.Estado;
    edCidade.value = h.Cidade;
    edBairro.value = h.Bairro;
    edLogradouro.value = h.Rua;
    edNumero.value = h.Numero;
    edComplemento.value = h.Complemento;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}
function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    idEdicao = null;
}

function bloquearCampo(id, valor) {
    const campo = document.getElementById(id);
    if (valor) {
        campo.value = valor;
        campo.setAttribute("readonly", "true");
    } else {
        campo.value = "";
        campo.removeAttribute("readonly");
    }
}

async function buscarEndereco() {
    const cepInput = document.getElementById("edit-cep");
    //const cepInvalido = document.getElementById('cep-invalido');
    let cep = cepInput.value.replace(/\D/g, "");

    // Validação inicial do formato do CEP
    if (!/^\d{8}$/.test(cep)) {
        //cepInvalido.classList.remove('hidden');
        limparCamposEndereco();
        return false;
    }
    try {
        // Primeiro tenta buscar na API própria
        const response = await fetch(`/api/getCep/${cep}`);

        if (!response.ok) {
            if (response.status === 404) {
                // Se não encontrou na API própria, tenta ViaCEP
            }
            throw new Error("Erro na API");
        }

        const data = await response.json();
        //cepInvalido.classList.add('hidden');
        return true;
    } catch (error) {
        // Se falhar na API própria, tenta ViaCEP
        return await buscarViaCEP(cep);
    }
}

async function buscarViaCEP(cep) {
    //const cepInvalido = document.getElementById('cep-invalido');

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error("CEP não encontrado");
        }

        // Preenche os campos com dados dos Correios
        bloquearCampo("edit-logradouro", data.logradouro);
        bloquearCampo("edit-bairro", data.bairro);
        bloquearCampo("edit-cidade", data.localidade);
        bloquearCampo("edit-estado", data.estado);
        //cepInvalido.classList.add('hidden');
        return true;
    } catch (error) {
        //cepInvalido.classList.remove('hidden');
        limparCamposEndereco();
        return false;
    }
}

function limparCamposEndereco() {
    ["edit-logradouro", "edit-bairro"].forEach((id) => {
        //document.getElementById(id).value = '';
        document.getElementById(id).removeAttribute("readonly");
    });
}

function validarNome() {
    document.getElementById("edit-nome").value = document.getElementById("edit-nome").value.replace(/[^a-zA-Záéíóúâêîôûãõç ]/g, "");
    const nome = document.getElementById("edit-nome").value;

    if (nome.length < 3) {
        //document.getElementById('nome-erro').classList.remove('hidden');
        return false;
    }
    //document.getElementById('nome-erro').classList.add('hidden');
    return true;
}

function validarCNPJ() {
    let cnpj = document.getElementById("edit-cnpj").value;
    cnpj = cnpj.replace(/\D/g, ""); // Remove não números

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        //document.getElementById('cnpj-invalido').classList.remove('hidden');
        return false; // Bloqueia CNPJs com formato inválido ou todos os dígitos iguais
    }

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    // Valida primeiro dígito verificador
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
        //document.getElementById('cnpj-invalido').classList.remove('hidden');
        return false;
    }

    // Valida segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) {
        //document.getElementById('cnpj-invalido').classList.remove('hidden');
        return false;
    }

    //document.getElementById('cnpj-invalido').classList.add('hidden');
    return true;
}

document.getElementById("edit-cep").addEventListener("input", function () {
    let cepFormatado = this.value.replace(/\D/g, "").slice(0, 8);

    if (cepFormatado.length > 5) {
        cepFormatado = cepFormatado.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }

    this.value = cepFormatado;
    //document.getElementById('cep-erro').classList.add('hidden');

    if (this.value.length === 0) {
        limparCamposEndereco();
    }
});

document.getElementById("edit-cep").addEventListener("input", buscarEndereco);

document.getElementById("edit-cnpj").addEventListener("input", function () {
    let value = this.value.replace(/\D/g, ""); // impedir tudo que não for numero
    if (value.length > 14) value = value.slice(0, 14); // impede mais de 14 caracteres

    let formattedCNPJ;
    if (value.length > 12) formattedCNPJ = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
    else if (value.length > 8) formattedCNPJ = value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4");
    else if (value.length > 5) formattedCNPJ = value.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (value.length > 2) formattedCNPJ = value.replace(/(\d{2})(\d{1,3})/, "$1.$2");
    else formattedCNPJ = value;

    this.value = formattedCNPJ;
});

document.getElementById("edit-nome").addEventListener("input", validarNome);
document.getElementById("edit-cnpj").addEventListener("input", validarCNPJ);

/* acesso controle */
async function acessoControle() {

    const TOKEN = localStorage.getItem("token");
    const r = await fetch("/api/requerProprietario", {
        headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!r.ok) {
        const result = await r.json();
        if (result.login) {
            window.location.href = "/login";
        } else {
            window.location.href = "/dashboard";
        }
        document.getElementById("container-haras").classList.add("hidden");
    }
}
/* listar --------------------------------------------------------------- */
async function listarHaras() {
    tbody.innerHTML = '<tr><td class="p-3" colspan="6">Carregando...</td></tr>';

    const r = await fetch(`/api/getAllHaras`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const haras = await r.json();
    console.log(haras);

    if (!Array.isArray(haras) || haras.length === 0) {
        tbody.innerHTML = '<tr><td class="p-3" colspan="6">Nenhum haras encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = haras
        .map(
            (h) => `
        <tr class="odd:bg-white even:bg-gray-50">
          <td class="p-3">${h.Nome}</td>
          <td class="p-3 cnpj">${h.CNPJ}</td>
          <td class="p-3 cep">${h.Cep}</td>
          <td class="p-3">${h.Estado}</td>
          <td class="p-3">${h.Cidade}</td>
          <td class="p-3">${h.Bairro}</td>
          <td class="p-3">${h.Rua}</td>
          <td class="p-3">${h.Numero}</td>
          <td class="p-3">${h.Complemento}</td>
          <td class="p-3 text-center space-x-2">
            <button data-id="${h.ID}" class="edit text-blue-600 hover:underline">Editar</button>
            <button data-id="${h.ID}" class="del  text-red-600  hover:underline">Excluir</button>
          </td>
        </tr>
      `
        )
        .join("");

    /* eventos */
    tbody.querySelectorAll(".edit").forEach((btn) =>
        btn.addEventListener("click", async () => {
            const r2 = await fetch(`/api/haras/${btn.dataset.id}`, {
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            openModal(await r2.json());
        })
    );

    tbody.querySelectorAll(".cep").forEach((cep) => {
        cep.innerHTML = cep.innerHTML.replace(/(\d{5})(\d{3})/, "$1-$2");
    });
    tbody.querySelectorAll(".cnpj").forEach((cnpj) => {
        cnpj.innerHTML = cnpj.innerHTML.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
    });
    tbody.querySelectorAll(".del").forEach((btn) => btn.addEventListener("click", () => removerHaras(btn.dataset.id)));
}

/* delete --------------------------------------------------------------- */
async function removerHaras(id) {
    if (!confirm("Confirma excluir o Haras?")) return;
    await fetch(`/api/haras/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
    });
    listarHaras();
}

/* update ----------------------------------------------------------------*/
btnSalvar.addEventListener("click", async () => {
    if (!validarNome()) {
        modalAlert.show("Nome inválido");
        return;
    }
    if (!validarCNPJ()) {
        modalAlert.show("CNPJ inválido");
        return;
    }
    if (!(await buscarEndereco())) {
        modalAlert.show("CEP inválido");
        return;
    }

    const nome = edNome.value.trim();
    const cnpj = edCnpj.value.trim().replace(/\D/g, "");
    const cep = edCep.value.trim().replace(/\D/g, "");
    const bairo = edBairro.value.trim();
    const logradouro = edLogradouro.value.trim();
    const numero = edNumero.value.trim();
    const complemento = edComplemento.value.trim();
    if (!nome || !cnpj || !cep || !bairo || !logradouro || !numero) {
        modalAlert.show("Preencha todos os campos obrigatórios.");
        return;
    }
    const dados = {
        nome,
        cnpj,
        cep,
        bairro: bairo,
        logradouro,
        numero,
        complemento,
    };
    await fetch(`/api/Haras/${idEdicao}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(dados),
    });
    closeModal();
    listarHaras();
});
btnCancel.addEventListener("click", closeModal);
/* inicializa */
listarHaras()