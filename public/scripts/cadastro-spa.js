import Modal from "/scripts/load-modal.js";

const modal = new Modal();

acessoControle();

/* acesso controle */
async function acessoControle() {
	const TOKEN = localStorage.getItem("token");
	const r = await fetch("/api/loginExpirado", {
		headers: { Authorization: `Bearer ${TOKEN}` },
	});
	if (r.ok) {
		window.location.href = "/dashboard";
	}
}

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
		numero: "Número",
		cadastrar: "Cadastrar",
		cepInvalido: "CEP inválido! Digite no formato 00000-000.",
		erroObrigatorio: "O campo {campo} é obrigatório.",
		dataInvalida: "Insira uma data de nascimento válida.",
		email: "E-mail",
		senha: "Senha",
		senhaConfirmacao: "Confirmar Senha",
		emailInvalido: "Insira um e-mail válido.",
		telefoneInvalido: "Insira um telefone válido(Deve ter entre 10 e 11 dígitos).",
		cpfInvalido: "CPF inválido! Digite um CPF válido.",
		senhaRequisitos: "A senha deve conter:",
		senhaMaiuscula: "Pelo menos uma letra maiúscula",
		senhaNumero: "Pelo menos um número",
		senhaEspecial: "Pelo menos um caractere especial",
		senhaMinLength: "Mínimo de 6 caracteres",
		senhasNaoCoincidem: "As senhas não coincidem",
		nomeErro: "Insira um nome válido",
		sobrenomeErro: "Insira um sobrenome válido"
	},
	en: {
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
		numero: "Number",
		cadastrar: "Register",
		cepInvalido: "Invalid ZIP Code! Use the format 00000-000.",
		erroObrigatorio: "The {campo} field is required.",
		dataInvalida: "Please enter a valid date of birth.",
		email: "E-mail",
		senha: "Password",
		senhaConfirmacao: "Confirm Password",
		emailInvalido: "Please enter a valid e-mail.",
		telefoneInvalido: "Please enter a valid phone number(Must have between 10 and 11 digits).",
		cpfInvalido: "Invalid CPF! Please enter a valid CPF.",
		senhaRequisitos: "Password must contain:",
		senhaMaiuscula: "At least one uppercase letter",
		senhaNumero: "At least one number",
		senhaEspecial: "At least one special character",
		senhaMinLength: "Minimum 6 characters",
		senhasNaoCoincidem: "Passwords do not match",
		nomeErro: "Please enter a valid name",
		sobrenomeErro: "Please enter a valid last name"
	},
};

function atualizarIdioma(idioma) {
	document.getElementById("titulo-cadastro").textContent = traducoes[idioma].titulo;
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
	document.getElementById("botao-cadastrar").textContent = traducoes[idioma].cadastrar;
	document.getElementById("cep-invalido").textContent = traducoes[idioma].cepInvalido;
	document.getElementById("data-nascimento-invalida").textContent = traducoes[idioma].dataInvalida;
	document.querySelector('label[for="numero"]').textContent = traducoes[idioma].numero;
	document.querySelector('label[for="email"]').textContent = traducoes[idioma].email;
	document.querySelector('label[for="senha"]').textContent = traducoes[idioma].senha;
	document.querySelector('label[for="senha-confirmacao"]').textContent = traducoes[idioma].senhaConfirmacao;
	document.getElementById("email-invalido").textContent = traducoes[idioma].emailInvalido;
	document.getElementById("telefone-invalido").textContent = traducoes[idioma].telefoneInvalido;
	document.getElementById("cpf-invalido").textContent = traducoes[idioma].cpfInvalido;
	document.getElementById("senha-requisitos").textContent = traducoes[idioma].senhaRequisitos;
	document.getElementById("req-maiuscula").textContent = traducoes[idioma].senhaMaiuscula;
	document.getElementById("req-numero").textContent = traducoes[idioma].senhaNumero;
	document.getElementById("req-especial").textContent = traducoes[idioma].senhaEspecial;
	document.getElementById("req-tamanho").textContent = traducoes[idioma].senhaMinLength;
	document.getElementById("senha-diferente").textContent = traducoes[idioma].senhasNaoCoincidem;
	document.getElementById("nome-erro").textContent = traducoes[idioma].nomeErro;
	document.getElementById('sobrenome-erro').textContent = traducoes[idioma].sobrenomeErro;

	const camposObrigatorios = [
		{id: "telefone", 		campo: traducoes[idioma].telefone,},
		{id: "data-nascimento", campo: traducoes[idioma].dataNascimento,},
		{id: "cep", 			campo: traducoes[idioma].cep,},
		{id: "logradouro", 		campo: traducoes[idioma].rua,},
		{id: "bairro", 			campo: traducoes[idioma].bairro,},
		{id: "cidade",			campo: traducoes[idioma].cidade,},
		{id: "estado",			campo: traducoes[idioma].estado,},
		{id: "numero",			campo: traducoes[idioma].numero,},
		{id: "email", 			campo: traducoes[idioma].email },
	];

	camposObrigatorios.forEach(({ id, campo }) => {
		const erroElemento = document.getElementById(`${id}-erro`);
		if (erroElemento) {
			erroElemento.textContent = traducoes[idioma].erroObrigatorio.replace("{campo}", campo);
		}
	});
}

document.getElementById("idioma").addEventListener("change", function () {
	const idiomaSelecionado = this.value;
	atualizarIdioma(idiomaSelecionado);
});

atualizarIdioma("pt");

// CONTROLE DE NAVEGAÇÃO ENTRE OS STEPS

function updateIndicators(currentStep) {
  document.querySelectorAll('[data-step-indicator]').forEach(wrapper => {
    const step = Number(wrapper.dataset.stepIndicator);
    const circle = wrapper.querySelector('div');   // o círculo
    const label  = wrapper.querySelector('span');  // a legenda

    // limpa todas as classes de estado
    circle.classList.remove(
      'bg-secondary','text-primary',
      'bg-tertiary','border-secondary','text-gray-400'
    );
    // restauramos o texto original ou o ✓
    if (step < currentStep) {
      // concluído
      circle.classList.add('bg-secondary','text-primary');
      circle.innerHTML = '✓';
		label.classList.replace('text-gray-400', 'text-secondary');
		// circle.classList.remove('border','border-secondary')
    }
    else if (step === currentStep) {
      // atual
      circle.classList.add('bg-secondary','text-primary');
      circle.textContent = step;
      label.classList.replace('text-gray-400','text-secondary');
    }
    else {
      // futuro
      circle.classList.add('bg-tertiary','text-primary','border-secondary');
      circle.textContent = step;
      label.classList.replace('text-secondary','text-gray-400');
    }
  });
}

function updateTitles(step) {
  const titulo    = document.getElementById('titulo-cadastro');
  const subtitulo = document.getElementById('subtitle-cadastro');

  switch (step) {
    case 1:
      titulo.textContent    = 'Vamos começar o cadastro';
      subtitulo.textContent = 'Preencha suas informações pessoais';
      break;
    case 2:
      titulo.textContent    = 'Informações de Contato';
      subtitulo.textContent = 'Como podemos entrar em contato com você?';
      break;
    case 3:
      titulo.textContent    = 'Endereço';
      subtitulo.textContent = 'Informe seu endereço completo';
      break;
    case 4:
      titulo.textContent    = 'Segurança da Conta';
      subtitulo.textContent = 'Crie uma senha forte para proteger sua conta';
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
	const sections = Array.from(document.querySelectorAll("section[data-step]"));
	let currentStep = 1;
	const totalSteps = sections.length;

	function showStep(n) {
		sections.forEach((sec) => {
			sec.classList.toggle("hidden", Number(sec.dataset.step) !== n);
		});
	}

	async function canAdvance(step) {
		switch (step) {
			case 1:
				return validarCPF() && validarNome();
			case 2:
				return validarTelefone() && validarEmail() && validarDataNascimento();
			case 3:
				return await buscarEndereco() && validarNumero();
			default:
				return true;
		}
	}

	// delega clique em todos os botões Next/Previous
	document.body.addEventListener("click", async (e) => {
		const btn = e.target;
		if (!btn.matches("button")) return;

		if (btn.classList.contains("btn-form-next")) {
			// antes de avançar, valida o step atual
			const ok = await canAdvance(currentStep);
			if (!ok) return; // não avança se falhar
			if (currentStep < totalSteps) {
				currentStep++;
				showStep(currentStep);
				showStep(currentStep);
				updateIndicators(currentStep);
				updateTitles(currentStep);
			}
		} else if (btn.classList.contains("btn-form-previous")) {
			if (currentStep > 1) {
				currentStep--;
				showStep(currentStep);
				showStep(currentStep);
				updateIndicators(currentStep);
				updateTitles(currentStep);
			}
		}
	});

	showStep(currentStep);
	showStep(currentStep);
	updateIndicators(currentStep);
	updateTitles(currentStep);
});



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

function getDataAtual() {
	const hoje = new Date();
	const ano = hoje.getFullYear();
	const mes = String(hoje.getMonth() + 1).padStart(2, "0");
	const dia = String(hoje.getDate()).padStart(2, "0");
	return `${ano}-${mes}-${dia}`;
}

document.getElementById("data-nascimento").max = getDataAtual();

async function buscarEndereco() {
	const cepInput = document.getElementById("cep");
	const cepInvalido = document.getElementById("cep-invalido");
	let cep = cepInput.value.replace(/\D/g, "");
	const idioma = document.getElementById("idioma").value;

	// Validação inicial do formato do CEP
	if (!/^\d{8}$/.test(cep)) {
		cepInvalido.textContent = traducoes[idioma].cepInvalido;
		cepInvalido.classList.remove("hidden");
		limparCamposEndereco();
		return false;
	}

	try {
		// Primeiro tenta buscar na API própria
		const response = await fetch(`/api/getCep/${cep}`);

		if (!response.ok) {
			if (response.status === 404) {
				// Se não encontrou na API própria, tenta ViaCEP
				return await buscarViaCEP(cep, idioma);
			}
			throw new Error("Erro na API");
		}

		const data = await response.json();

		// Preenche os campos com os dados da API própria
		bloquearCampo("logradouro", data.logradouro || "");
		bloquearCampo("bairro", data.bairro || "");
		bloquearCampo("cidade", data.Cidade);
		bloquearCampo("estado", data.UF);
		cepInvalido.classList.add("hidden");
		return true;
	} catch (error) {
		// Se falhar na API própria, tenta ViaCEP
		return await buscarViaCEP(cep, idioma);
	}
}

async function buscarViaCEP(cep, idioma) {
	const cepInvalido = document.getElementById("cep-invalido");

	try {
		const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
		const data = await response.json();

		if (data.erro) {
			throw new Error("CEP não encontrado");
		}

		// Preenche os campos com dados dos Correios
		bloquearCampo("logradouro", data.logradouro);
		bloquearCampo("bairro", data.bairro);
		bloquearCampo("cidade", data.localidade);
		bloquearCampo("estado", data.uf);
		cepInvalido.classList.add("hidden");
		return true;
	} catch (error) {
		cepInvalido.textContent = traducoes[idioma].cepInvalido;
		cepInvalido.classList.remove("hidden");
		limparCamposEndereco();
		return false;
	}
}

function validarNumero() {
  const input = document.getElementById('numero');
  const erro  = document.getElementById('numero-erro');

  if (!input.value.trim()) {
    erro.classList.remove('hidden');
    input.focus();
    return false;
  }
  erro.classList.add('hidden');
  return true;
}


function limparCamposEndereco() {
	["logradouro", "bairro", "cidade", "estado", "numero"].forEach((id) => {
		document.getElementById(id).value = "";
		document.getElementById(id).removeAttribute("readonly");
	});
}

function validarDataNascimento() {
	const input = document.getElementById("data-nascimento");
	const valor = input.value.trim();
	const erroObrigatorio = document.getElementById("data-nascimento-erro");
	const erroInvalida = document.getElementById("data-nascimento-invalida");

	if (!valor) {
		erroObrigatorio.classList.remove("hidden");
		erroInvalida.classList.add("hidden");
		return false;
	}
	erroObrigatorio.classList.add("hidden");

	const dataNascimento = new Date(valor);
	const dataAtual = new Date();

	if (dataNascimento > dataAtual) {
		erroInvalida.classList.remove("hidden");
		return false;
	}

	const idadeMinima = new Date();
	idadeMinima.setFullYear(idadeMinima.getFullYear() - 120);
	if (dataNascimento < idadeMinima) {
		erroInvalida.classList.remove("hidden");
		return false;
	}

	erroInvalida.classList.add("hidden");
	return true;
}

function validarTelefone() {
	const telefone = document.getElementById("telefone").value;
	const telefoneError = document.getElementById("telefone-invalido");

	// Remove todos os caracteres não numéricos
	const telefoneNumeros = telefone.replace(/\D/g, "");

	// Verifica se o telefone tem entre 10 e 11 dígitos após remoção dos não numéricos
	if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
		telefoneError.classList.remove("hidden");
		return false;
	}
	telefoneError.classList.add("hidden");
	return true;
}

function validarSenha() {
	const senha = document.getElementById("senha").value;
	const senhaConfirmacao = document.getElementById("senha-confirmacao").value;
	let valido = true;

	// Verificar maiúscula
	const temMaiuscula = /[A-Z]/.test(senha);
	document.getElementById("req-maiuscula").classList.toggle("text-success", temMaiuscula);
	document.getElementById("req-maiuscula").classList.toggle("text-error", !temMaiuscula);
	if (!temMaiuscula) valido = false;

	// Verificar número
	const temNumero = /\d/.test(senha);
	document.getElementById("req-numero").classList.toggle("text-success", temNumero);
	document.getElementById("req-numero").classList.toggle("text-error", !temNumero);
	if (!temNumero) valido = false;

	// Verificar caractere especial
	const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
	document.getElementById("req-especial").classList.toggle("text-success", temEspecial);
	document.getElementById("req-especial").classList.toggle("text-error", !temEspecial);
	if (!temEspecial) valido = false;

	// Verificar tamanho mínimo
	const temTamanho = senha.length >= 6;
	document.getElementById("req-tamanho").classList.toggle("text-success", temTamanho);
	document.getElementById("req-tamanho").classList.toggle("text-error", !temTamanho);

	if (!temTamanho) valido = false;
	const senhasIguais = senha === senhaConfirmacao && senha.length > 0;
	if (!senhasIguais) {
		valido = false;
	}
	document.getElementById("senha-diferente").classList.toggle("hidden", senhasIguais);

	return valido;
}

function validarNome() {
	document.getElementById("nome").value = document.getElementById("nome").value.replace(/[^a-zA-Záéíóúâêîôûãõç ]/g, "");
	const nome = document.getElementById("nome").value;

	if (nome.length < 3) {
		document.getElementById("nome-erro").classList.remove("hidden");
		return false;
	}
	document.getElementById("nome-erro").classList.add("hidden");
	return true;
}

function validarSobrenome() {
	document.getElementById("sobrenome").value = document.getElementById("sobrenome").value.replace(/[^a-zA-Záéíóúâêîôûãõç ]/g, "");
	const sobrenome = document.getElementById("sobrenome").value;
	if (sobrenome.length < 3) {
		document.getElementById("sobrenome-erro").classList.remove("hidden");
		return false;
	}
	document.getElementById("sobrenome-erro").classList.add("hidden");
	return true;
}

function validarCPF() {
	let cpf = document.getElementById("cpf").value;
	cpf = cpf.replace(/\D/g, ""); // Remove não números

	if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
		document.getElementById("cpf-invalido").classList.remove("hidden");
		return false; // Bloqueia CPFs com todos os números iguais (ex: 000.000.000-00)
	}

	let soma = 0,
		resto;

	// Valida primeiro dígito
	for (let i = 1; i <= 9; i++) {
		soma += parseInt(cpf[i - 1]) * (11 - i);
	}
	resto = (soma * 10) % 11;
	if (resto === 10 || resto === 11) resto = 0;
	if (resto !== parseInt(cpf[9])) {
		document.getElementById("cpf-invalido").classList.remove("hidden");
		return false;
	}

	// Valida segundo dígito
	soma = 0;
	for (let i = 1; i <= 10; i++) {
		soma += parseInt(cpf[i - 1]) * (12 - i);
	}
	resto = (soma * 10) % 11;
	if (resto === 10 || resto === 11) resto = 0;
	if (resto !== parseInt(cpf[10])) {
		document.getElementById("cpf-invalido").classList.remove("hidden");
		return false;
	}
	document.getElementById("cpf-invalido").classList.add("hidden");
	return true;
}

function validarEmail() {
	const email = document.getElementById("email");
	const emailInvalido = document.getElementById("email-invalido");
	const emailValue = email.value.trim();

	// Regex para validar o formato do e-mail
	const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!regexEmail.test(emailValue)) {
		emailInvalido.classList.remove("hidden");
		return false;
	}
	emailInvalido.classList.add("hidden"); // Esconde a mensagem de erro se o e-mail for válido
	return true;
}

document.getElementById("cep").addEventListener("input", function () {
	let cepFormatado = this.value.replace(/\D/g, "").slice(0, 8);

	if (cepFormatado.length > 5) {
		cepFormatado = cepFormatado.replace(/(\d{5})(\d{1,3})/, "$1-$2");
	}

	this.value = cepFormatado;
	document.getElementById("cep-erro").classList.add("hidden");

	if (this.value.length === 0) {
		limparCamposEndereco();
	}
});

document.getElementById("cep").addEventListener("input", buscarEndereco);
document.getElementById("telefone").addEventListener("input", function (e) {
	this.value = this.value.replace(/\D/g, "");
	let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
	if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

	// Aplica a máscara (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
	if (value.length > 2) {
		value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
	}
	if (value.length > 10) {
		value = `${value.slice(0, 10)}-${value.slice(10)}`;
	}

	e.target.value = value; // Atualiza o valor do campo
});

document.getElementById("cpf").addEventListener("input", function () {
	let value = this.value.replace(/\D/g, ""); // impedir tudo que não for numero
	if (value.length > 11) value = value.slice(0, 11); // impede mais de 11 caracteres

	let formattedCPF;
	if (value.length > 9) formattedCPF = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	else if (value.length > 6) formattedCPF = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
	else if (value.length > 3) formattedCPF = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
	else formattedCPF = value;

	this.value = formattedCPF;
});

document.getElementById("mostrar-senha").addEventListener("click", function (event) {
	event.preventDefault();
	const senha = document.getElementById("senha");
	if (senha.type === "password") {
		this.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 2L22 22" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
		senha.type = "text";
	} else {
		this.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="12" cy="12" r="3" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
		senha.type = "password";
	}
});

document.getElementById("mostrar-confirmacao-senha").addEventListener("click", function (event) {
	event.preventDefault();
	const senha = document.getElementById("senha-confirmacao");
	if (senha.type === "password") {
		this.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 2L22 22" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
		senha.type = "text";
	} else {
		this.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="12" cy="12" r="3" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
		senha.type = "password";
	}
});

document.getElementById("senha").addEventListener("input", validarSenha);
document.getElementById("senha-confirmacao").addEventListener("input", validarSenha);
document.getElementById("nome").addEventListener("input", validarNome);
document.getElementById('sobrenome').addEventListener('input', validarSobrenome);
document.getElementById("telefone").addEventListener("input", validarTelefone);
document.getElementById("email").addEventListener("input", validarEmail);
document.getElementById("cpf").addEventListener("input", validarCPF);

// 1) Definição da função de envio
async function enviarCadastro(event) {
  event.preventDefault();

  const camposObrigatorios = ["numero", "logradouro", "cidade", "bairro", "estado", "data-nascimento"];
  let formularioValido = true;

  // validações obrigatórias
  camposObrigatorios.forEach(id => {
    const input = document.getElementById(id);
    const erro  = document.getElementById(`${id}-erro`);
    if (input.value.trim() === "") {
      erro.classList.remove("hidden");
      input.focus();
      formularioValido = false;
    } else {
      erro.classList.add("hidden");
    }
  });

  // demais validações
  if (!validarDataNascimento()) formularioValido = false;
  const cepValido = await buscarEndereco();
  if (!cepValido) formularioValido = false;
  if (!validarTelefone()) formularioValido = false;
  if (!validarEmail()) formularioValido = false;
  if (!validarCPF()) formularioValido = false;
  if (!validarSenha()) formularioValido = false;
  if (!validarNome() && !validarSobrenome()) formularioValido = false;
  if (!validarNumero()) formularioValido = false;

  if (!formularioValido) {
    return; // sai se algo falhou
  }

  // coleta dados e faz o fetch
  const dados = {
    cpf:               document.getElementById("cpf").value.replace(/\D/g, ""),
    telefone:          document.getElementById("telefone").value.replace(/\D/g, ""),
    nome:              document.getElementById("nome").value,
	sobrenome:		   document.getElementById('sobrenome').value,
    dataNascimento:    document.getElementById("data-nascimento").value,
    email:             document.getElementById("email").value,
    cep:               document.getElementById("cep").value.replace(/\D/g, ""),
    estado:            document.getElementById("estado").value,
    bairro:            document.getElementById("bairro").value,
    cidade:            document.getElementById("cidade").value,
    rua:               document.getElementById("logradouro").value,
    numero:            document.getElementById("numero").value,
    senha:             document.getElementById("senha").value,
  };

  try {
    const response = await fetch("http://localhost:3000/api/criarProprietario", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(dados),
    });
    const result = await response.json();
    console.log("Resposta do servidor:", result);
    await modal.show("Cadastrado com sucesso!");
    window.location.href = "/home";
  } catch (error) {
    console.error("Erro ao cadastrar", error);
  }
}

document.getElementById("botao-cadastrar").addEventListener("click", enviarCadastro);