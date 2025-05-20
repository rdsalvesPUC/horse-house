import Modal from "/scripts/load-modal.js";

const modal = new Modal();

const TOKEN = localStorage.getItem("token");

const tipoUsuarioSelect = document.getElementById("tipoUsuario");
const containerHaras = document.getElementById("container-haras");
const selectHaras = document.getElementById("select-haras");
const campoCrmv = document.getElementById("campo-crmv");
const botaoCadastrar = document.getElementById("botao-cadastrar-user");

// Mostrar / ocultar campos de acordo com tipo de usuário
tipoUsuarioSelect.addEventListener("change", function () {
	if (this.value === "Veterinario") {
		campoCrmv.classList.remove("hidden");
		containerHaras.classList.add("hidden");
	} else if (this.value === "Gerente") {
		campoCrmv.classList.add("hidden");
		containerHaras.classList.remove("hidden");
		carregarHaras();
	} else {
		campoCrmv.classList.add("hidden");
		containerHaras.classList.add("hidden");
	}
});

async function acessoControle() {
	const TOKEN = localStorage.getItem("token");
	const r = await fetch("/api/requerProprietario", {
		headers: { Authorization: `Bearer ${TOKEN}` },
	});
	if (!r.ok) {
		const result = await r.json();
		window.location.href = result.login ? "/login" : "/home";
	}
}

acessoControle();

async function carregarHaras() {
	try {
		const response = await fetch("/api/getAllHaras", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Erro ao buscar haras");
		}

		const haras = await response.json();

		// Limpa e popula o select
		selectHaras.innerHTML = '<option value="">Selecione o Haras</option>';
		haras.forEach((harasItem) => {
			const option = document.createElement("option");
			option.value = harasItem.ID; // aqui precisa ser o id do haras
			option.textContent = harasItem.Nome;
			selectHaras.appendChild(option);
		});
	} catch (error) {
		console.error("Erro ao carregar haras:", error.message);
	}
}

// Máscaras e validações ao digitar
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

function validarSenha(s) {
	const maiuscula = /[A-Z]/.test(s);
	const numero = /\d/.test(s);
	const especial = /[!@#$%^&*(),.?":{}|<>]/.test(s);
	const tamanho = s.length >= 6;

	document.getElementById("req-maiuscula").classList.toggle("text-success", maiuscula);
	document.getElementById("req-numero").classList.toggle("text-success", numero);
	document.getElementById("req-especial").classList.toggle("text-success", especial);
	document.getElementById("req-tamanho").classList.toggle("text-success", tamanho);

	document.getElementById("req-maiuscula").classList.toggle("text-error", !maiuscula);
	document.getElementById("req-numero").classList.toggle("text-error", !numero);
	document.getElementById("req-especial").classList.toggle("text-error", !especial);
	document.getElementById("req-tamanho").classList.toggle("text-error", !tamanho);

	return maiuscula && numero && especial && tamanho;
}

function validarDataNascimento() {
	const dataInvalida = document.getElementById("data-nascimento-invalida");
	const data = document.getElementById("dataNascimento").value;
	const dataNascimento = new Date(data);
	const dataAtual = new Date();
	if (dataNascimento > dataAtual) {
		dataInvalida.classList.remove("hidden");
		return false;
	}
	const idadeMinima = new Date();
	idadeMinima.setFullYear(idadeMinima.getFullYear() - 120);
	if (dataNascimento < idadeMinima) {
		dataInvalida.classList.remove("hidden");
		return false;
	}

	dataInvalida.classList.add("hidden");
	return true;
}

function validarCRMV() {
	const crmv = document.getElementById("crmv").value;
	const ehValido = /^\w{3,20}$/.test(crmv);
	ehValido ? hide("erro-crmv") : show("erro-crmv");
	return ehValido;
}

document.getElementById("email").addEventListener("input", validarEmail);
document.getElementById("nome").addEventListener("input", validarNome);
document.getElementById("sobrenome").addEventListener("input", validarSobrenome);
document.getElementById("senha").addEventListener("input", function () {
	const senha = this.value;
	validarSenha(senha);
});
document.getElementById("dataNascimento").addEventListener("input", validarDataNascimento);
document.getElementById("cpf").addEventListener("input", validarCPF);
document.getElementById("form-cadastro").addEventListener("submit", async function (event) {
	event.preventDefault();

	const nome = document.getElementById("nome").value.trim();
	const sobrenome = document.getElementById("sobrenome").value.trim();
	const email = document.getElementById("email").value.trim();
	const senha = document.getElementById("senha").value.trim();
	const telefone = document.getElementById("telefone").value.replace(/\D/g, "");
	const cpf = document.getElementById("cpf").value.trim();
	const dataNascimento = document.getElementById("dataNascimento").value;
	const tipoUsuario = document.getElementById("tipoUsuario").value;
	const crmv = document.getElementById("crmv")?.value.trim();
	const harasId = selectHaras.value;

	let valido = true;

	if (!validarNome()) valido = false;
	if (!validarSobrenome()) valido = false;
	if (!validarEmail()) valido = false;
	if (!validarCPF()) valido = false;
	if (!validarSenha(senha)) {
		document.getElementById("senha-erro").classList.remove("hidden");
		valido = false;
	} else {
		document.getElementById("senha-erro").classList.add("hidden");
	}

	if (telefone.length < 10 || telefone.length > 11) {
		document.getElementById("telefone-erro").classList.remove("hidden");
		valido = false;
	} else {
		document.getElementById("telefone-erro").classList.add("hidden");
	}

	if (!dataNascimento) {
		document.getElementById("data-nascimento-erro").classList.remove("hidden");
		valido = false;
	} else {
		document.getElementById("data-nascimento-erro").classList.add("hidden");
	}

	if (!tipoUsuario) {
		document.getElementById("erro-tipoUsuario").classList.remove("hidden");
		valido = false;
	} else {
		document.getElementById("erro-tipoUsuario").classList.add("hidden");
	}

	if (tipoUsuario === "Gerente" && !harasId) {
		document.getElementById("erro-haras").classList.remove("hidden");
		valido = false;
	} else {
		document.getElementById("erro-haras").classList.add("hidden");
	}

	if (tipoUsuario === "Veterinario" && (!crmv || crmv.length < 3)) {
		document.getElementById("erro-crmv").classList.remove("hidden");
		valido = false;
	} else {
		document.getElementById("erro-crmv").classList.add("hidden");
	}

	if (!valido) return;

	// Monta dados para envio
	let endpoint = "";
	let dados = { nome, sobrenome, email, senha, telefone, cpf: cpf.replace(/\D/g, ""), dataNascimento };
	if (tipoUsuario === "Gerente") {
		endpoint = "criarGerente";
		dados.haras_id = harasId;
	} else if (tipoUsuario === "Treinador") {
		endpoint = "criarTreinador";
	} else if (tipoUsuario === "Tratador") {
		endpoint = "criarTratador";
	} else if (tipoUsuario === "Veterinario") {
		endpoint = "criarVeterinario";
		dados.crmv = crmv;
	}

	try {
		const response = await fetch(`/api/${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${TOKEN}`,
			},
			body: JSON.stringify(dados),
		});
		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || "Erro ao cadastrar.");
		}

		await modal.show(`${tipoUsuario} cadastrado com sucesso!`);
		history.pushState({ view: "usuarios" }, "", "/dashboard/usuarios");
		loadView("usuarios");
	} catch (error) {
		await modal.show("Erro ao cadastrar: " + error.message);
	}
});
