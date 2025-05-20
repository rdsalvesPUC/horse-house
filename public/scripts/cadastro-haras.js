import Modal from "/scripts/load-modal.js";

const modal = new Modal();
/* acesso controle */
async function acessoControle() {
    const TOKEN = localStorage.getItem("token");
    const r = await fetch("/api/requerProprietario", {
        headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!r.ok) {
        const result = await r.json();
        if (result.login){
            window.location.href = "/login";
        }
        else{
            window.location.href = "/home";
        }

    }
}
function bloquearCampo(id, valor) {
    const campo = document.getElementById(id);
    if (valor) {
        campo.value = valor;
        campo.setAttribute('readonly', "true");
    } else {
        campo.value = '';
        campo.removeAttribute('readonly');
    }
}
async function buscarEndereco() {
    const cepInput = document.getElementById('cep');
    const cepInvalido = document.getElementById('cep-invalido');
    let cep = cepInput.value.replace(/\D/g, '');

    // Validação inicial do formato do CEP
    if (!/^\d{8}$/.test(cep)) {
        cepInvalido.classList.remove('hidden');
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
            throw new Error('Erro na API');
        }

        const data = await response.json();
        bloquearCampo('cidade', data.Cidade);
        bloquearCampo('estado', data.Estado);
        cepInvalido.classList.add('hidden');
        return true;

    } catch (error) {
        // Se falhar na API própria, tenta ViaCEP
        return await buscarViaCEP(cep);
    }
}

async function buscarViaCEP(cep) {
    const cepInvalido = document.getElementById('cep-invalido');

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error('CEP não encontrado');
        }

        // Preenche os campos com dados dos Correios
        bloquearCampo('logradouro', data.logradouro);
        bloquearCampo('bairro', data.bairro);
        bloquearCampo('cidade', data.localidade);
        bloquearCampo('estado', data.estado);
        cepInvalido.classList.add('hidden');
        return true;

    } catch (error) {
        cepInvalido.classList.remove('hidden');
        limparCamposEndereco();
        return false;
    }
}

function limparCamposEndereco() {
    ['logradouro', 'bairro', 'cidade', 'estado'].forEach(id => {
        document.getElementById(id).value = '';
        document.getElementById(id).removeAttribute('readonly');
    });
}

function validarNome() {

    document.getElementById('nome').value = document.getElementById('nome').value.replace(/[^a-zA-Záéíóúâêîôûãõç ]/g, '');
    const nome = document.getElementById('nome').value;

    if (nome.length < 3) {
        document.getElementById('nome-erro').classList.remove('hidden');
        return false;
    }
    document.getElementById('nome-erro').classList.add('hidden');
    return true;
}

function validarCNPJ() {
    let cnpj = document.getElementById('cnpj').value;
    cnpj = cnpj.replace(/\D/g, ""); // Remove não números

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        document.getElementById('cnpj-invalido').classList.remove('hidden');
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
        document.getElementById('cnpj-invalido').classList.remove('hidden');
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
        document.getElementById('cnpj-invalido').classList.remove('hidden');
        return false;
    }

    document.getElementById('cnpj-invalido').classList.add('hidden');
    return true;
}

document.getElementById('cep').addEventListener('input', function () {
    let cepFormatado = this.value.replace(/\D/g, '').slice(0, 8);

    if (cepFormatado.length > 5) {
        cepFormatado = cepFormatado.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }

    this.value = cepFormatado;
    document.getElementById('cep-erro').classList.add('hidden');

    if (this.value.length === 0) {
        limparCamposEndereco();
    }
});

document.getElementById('cep').addEventListener('input', buscarEndereco);

document.getElementById('cnpj').addEventListener('input', function () {
    let value = this.value.replace(/\D/g, ''); // impedir tudo que não for numero
    if (value.length > 14) value = value.slice(0, 14); // impede mais de 14 caracteres

    let formattedCNPJ;
    if (value.length > 12) formattedCNPJ = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
    else if (value.length > 8) formattedCNPJ = value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4");
    else if (value.length > 5) formattedCNPJ = value.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (value.length > 2) formattedCNPJ = value.replace(/(\d{2})(\d{1,3})/, "$1.$2");
    else formattedCNPJ = value;

    this.value = formattedCNPJ;
});

document.getElementById('nome').addEventListener('input', validarNome);
document.getElementById('cnpj').addEventListener('input', validarCNPJ);
document.addEventListener('DOMContentLoaded', acessoControle);
document.getElementById('form-haras').addEventListener('submit', async function (event) {
    event.preventDefault();

    const camposObrigatorios = ["numero", "logradouro", "cidade", "bairro", "estado"];
    let formularioValido = true;

    camposObrigatorios.forEach(id => {
        const input = document.getElementById(id);
        const erro = document.getElementById(`${id}-erro`);

        if (input.value.trim() === "") {
            erro.classList.remove('hidden');
            input.focus();
            formularioValido = false;
        } else {
            erro.classList.add('hidden');
        }
    });
    const cepValido = await buscarEndereco();
    if (!cepValido) formularioValido = false;

    if (!validarCNPJ()) {
        formularioValido = false;
    }

    if (!validarNome()) {
        formularioValido = false;
    }

    if (formularioValido) {
        // Captura os valores do formulário.
        const cnpj = document.getElementById("cnpj").value.replace(/\D/g, "");
        const nome = document.getElementById("nome").value;
        const cep = document.getElementById("cep").value.replace(/\D/g, "");
        const estado = document.getElementById("estado").value;
        const bairro = document.getElementById("bairro").value;
        const cidade = document.getElementById("cidade").value;
        const rua = document.getElementById("logradouro").value;
        const numero = document.getElementById("numero").value;
        const complemento = document.getElementById("complemento").value;



        const dados = {
            cnpj,
            nome,
            cep,
            estado,
            bairro,
            cidade,
            rua,
            numero,
            complemento
        };

        fetch("/api/criarHaras", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(dados)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error("Erro ao cadastrar");
                }
                modal.show("Haras cadastrado com sucesso!");
                window.location.href = "/dashboard/haras";
            })
            .catch(error => {
                modal.show("Eroo ao cadastrar haras.")
                console.error("Erro ao cadastrar", error);
            });
        this.submit();
    }
});
