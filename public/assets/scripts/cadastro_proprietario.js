const traducoes = {
    pt: {
        titulo: "Cadastro",
        cpf: "CPF",
        nome: "Nome",
        sobrenome: "Sobrenome",
        telefone: "Telefone",
        dataNascimento: "Data de Nascimento",
        cep: "CEP",
        rua: "Rua",
        bairro: "Bairro",
        cidade: "Cidade",
        estado: "Estado",
        cadastrar: "Cadastrar",
        cepInvalido: "CEP inválido! Digite no formato 00000-000.",
        erroObrigatorio: "O campo {campo} é obrigatório.",
        dataInvalida: "Insira uma data de nascimento válida.",
        numero: "numero"
    }, en: {
        titulo: "Registration",
        cpf: "CPF",
        nome: "First Name",
        sobrenome: "Last Name",
        telefone: "Phone",
        dataNascimento: "Date of Birth",
        cep: "ZIP Code",
        rua: "Street",
        bairro: "Neighborhood",
        cidade: "City",
        estado: "State",
        cadastrar: "Register",
        cepInvalido: "Invalid ZIP Code! Use the format 00000-000.",
        erroObrigatorio: "The {campo} field is required.",
        dataInvalida: "Please enter a valid date of birth."

    }
};

function atualizarIdioma(idioma) {
    document.getElementById('titulo-cadastro').textContent = traducoes[idioma].titulo;
    document.querySelector('label[for="cpf"]').textContent = traducoes[idioma].cpf;
    document.querySelector('label[for="nome"]').textContent = traducoes[idioma].nome;
    document.querySelector('label[for="sobrenome"]').textContent = traducoes[idioma].sobrenome;
    document.querySelector('label[for="telefone"]').textContent = traducoes[idioma].telefone;
    document.querySelector('label[for="data-nascimento"]').textContent = traducoes[idioma].dataNascimento;
    document.querySelector('label[for="cep"]').textContent = traducoes[idioma].cep;
    document.querySelector('label[for="logradouro"]').textContent = traducoes[idioma].rua;
    document.querySelector('label[for="bairro"]').textContent = traducoes[idioma].bairro;
    document.querySelector('label[for="cidade"]').textContent = traducoes[idioma].cidade;
    document.querySelector('label[for="estado"]').textContent = traducoes[idioma].estado;
    document.getElementById('botao-cadastrar').textContent = traducoes[idioma].cadastrar;
    document.getElementById('cep-invalido').textContent = traducoes[idioma].cepInvalido;
    document.getElementById('data-nascimento-invalida').textContent = traducoes[idioma].dataInvalida;
    const camposObrigatorios = [{id: 'cpf', campo: traducoes[idioma].cpf}, {
        id: 'nome', campo: traducoes[idioma].nome
    }, {id: 'sobrenome', campo: traducoes[idioma].sobrenome}, {
        id: 'telefone', campo: traducoes[idioma].telefone
    }, {id: 'data-nascimento', campo: traducoes[idioma].dataNascimento}, {
        id: 'cep', campo: traducoes[idioma].cep
    }, {id: 'logradouro', campo: traducoes[idioma].rua}, {id: 'bairro', campo: traducoes[idioma].bairro}, {
        id: 'cidade', campo: traducoes[idioma].cidade
    }, {
        id: 'estado', campo: traducoes[idioma].estado
    }, {id: 'numero', campo: traducoes[idioma].numero}];

    camposObrigatorios.forEach(({id, campo}) => {
        const erroElemento = document.getElementById(`${id}-erro`);
        if (erroElemento) {
            erroElemento.textContent = traducoes[idioma].erroObrigatorio.replace('{campo}', campo);
        }
    });
}

document.getElementById('idioma').addEventListener('change', function () {
    const idiomaSelecionado = this.value;
    atualizarIdioma(idiomaSelecionado);
});

atualizarIdioma('pt');

function bloquearCampo(id, valor) {
    const campo = document.getElementById(id);
    if (valor) {
        campo.value = valor;
        campo.setAttribute('readonly', true);
    } else {
        campo.value = '';
        campo.removeAttribute('readonly');
    }
}
function getDataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

document.getElementById('data-nascimento').max = getDataAtual();

function buscarEndereco() {
    const cepInput = document.getElementById('cep');
    const cepInvalido = document.getElementById('cep-invalido');
    let cep = cepInput.value.replace(/\D/g, '');

    if (/^\d{5}-\d{3}$/.test(cepInput.value) || /^\d{8}$/.test(cep)) {
        cepInvalido.classList.add('hidden');
        cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
        cepInput.value = cep;

        fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    bloquearCampo('logradouro', data.logradouro);
                    bloquearCampo('bairro', data.bairro);
                    bloquearCampo('cidade', data.localidade);
                    bloquearCampo('estado', data.uf);
                    return true
                } else {
                    cepInvalido.textContent = traducoes[document.getElementById('idioma').value].cepInvalido;
                    cepInvalido.classList.remove('hidden');
                    return false
                }
            })
            .catch(() => {
                cepInvalido.textContent = traducoes[document.getElementById('idioma').value].cepInvalido;
                cepInvalido.classList.remove('hidden');
                return false
            });
    } else {
        cepInvalido.classList.remove('hidden');
        limparCamposEndereco();
        return false
    }
    return true
}

function limparCamposEndereco() {
    ['logradouro', 'bairro', 'cidade', 'estado'].forEach(id => {
        document.getElementById(id).value = '';
        document.getElementById(id).removeAttribute('readonly');
    });
}

function validarDataNascimento() {
    const dataInvalida = document.getElementById('data-nascimento-invalida');
    const data = document.getElementById('data-nascimento').value;
    const dataNascimento = new Date(data);
    const dataAtual = new Date();
    if (dataNascimento > dataAtual) {
        dataInvalida.classList.remove('hidden');
        return false;
    }
    const idadeMinima = new Date();
    idadeMinima.setFullYear(idadeMinima.getFullYear() - 120);
    if (dataNascimento < idadeMinima) {
        dataInvalida.classList.remove('hidden');
        return false;
    }

    dataInvalida.classList.add('hidden');
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

document.getElementById('cep').addEventListener('blur', buscarEndereco);

document.getElementById('form-cadastro').addEventListener('submit', function (event) {
    event.preventDefault();

    const camposObrigatorios = ["logradouro", "cidade", "bairro", "estado", "cep", "data-nascimento", "telefone", "sobrenome", "nome", "cpf", "numero"];
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
    if (!validarDataNascimento()) {
        formularioValido = false;
    }
    if (!buscarEndereco()) {
        formularioValido = false
    }

    if (formularioValido) {
        this.submit();
    }
});