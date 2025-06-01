import Modal from "/scripts/load-modal.js";

export async function init(container) {
    const modal = new Modal();
    const TOKEN = localStorage.getItem("token");

    // Seleção de elementos da view
    const tipoUsuarioSelect = container.querySelector("#tipoUsuario");
    const containerHaras = container.querySelector("#container-haras");
    const selectHaras = container.querySelector("#select-haras");
    const campoCrmv = container.querySelector("#campo-crmv");
    const botaoCadastrar = container.querySelector("#botao-cadastrar-user");

    // Mostrar / ocultar campos conforme o tipo de usuário
    if (tipoUsuarioSelect) {
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
    }

    // Função para verificação de permissão
    async function acessoControle() {
        const r = await fetch("/api/requerProprietario", {
            headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!r.ok) {
            const result = await r.json();
            window.location.href = result.login ? "/login" : "/home";
        }
    }
    await acessoControle();

    // Carrega a lista de Haras no <select>
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
            selectHaras.innerHTML = '<option value="">Selecione o Haras</option>';
            haras.forEach((harasItem) => {
                const option = document.createElement("option");
                option.value = harasItem.ID;
                option.textContent = harasItem.Nome;
                selectHaras.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar haras:", error.message);
        }
    }

    // Máscaras e formatações
    const cpfInput = container.querySelector("#cpf");
    if (cpfInput) {
        cpfInput.addEventListener("input", function () {
            let value = this.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            let formattedCPF;
            if (value.length > 9) formattedCPF = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            else if (value.length > 6) formattedCPF = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
            else if (value.length > 3) formattedCPF = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
            else formattedCPF = value;
            this.value = formattedCPF;
        });
    }

    const telefoneInput = container.querySelector("#telefone");
    if (telefoneInput) {
        telefoneInput.addEventListener("input", function (e) {
            this.value = this.value.replace(/\D/g, "");
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            }
            if (value.length > 10) {
                value = `${value.slice(0, 10)}-${value.slice(10)}`;
            }
            e.target.value = value;
        });
    }

    // Funções de validação
    function validarNome() {
        const nomeEl = container.querySelector("#nome");
        nomeEl.value = nomeEl.value.replace(/[^a-zA-Záéíóúâêîôûãõç ]/g, "");
        const nome = nomeEl.value;
        const erroEl = container.querySelector("#nome-erro");
        if (nome.length < 3) {
            erroEl.classList.remove("hidden");
            return false;
        }
        erroEl.classList.add("hidden");
        return true;
    }

    function validarSobrenome() {
        const sobrenomeEl = container.querySelector("#sobrenome");
        sobrenomeEl.value = sobrenomeEl.value.replace(/[^a-zA-Záéíóúâêîôûãõç ]/g, "");
        const sobrenome = sobrenomeEl.value;
        const erroEl = container.querySelector("#sobrenome-erro");
        if (sobrenome.length < 3) {
            erroEl.classList.remove("hidden");
            return false;
        }
        erroEl.classList.add("hidden");
        return true;
    }

    function validarEmail() {
        const emailEl = container.querySelector("#email");
        const emailInvalido = container.querySelector("#email-invalido");
        const emailValue = emailEl.value.trim();
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(emailValue)) {
            emailInvalido.classList.remove("hidden");
            return false;
        }
        emailInvalido.classList.add("hidden");
        return true;
    }

    function validarCPF() {
        const cpfEl = container.querySelector("#cpf");
        let cpf = cpfEl.value;
        cpf = cpf.replace(/\D/g, "");
        const cpfInvalido = container.querySelector("#cpf-invalido");
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            cpfInvalido.classList.remove("hidden");
            return false;
        }
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf[i - 1]) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf[9])) {
            cpfInvalido.classList.remove("hidden");
            return false;
        }
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf[i - 1]) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf[10])) {
            cpfInvalido.classList.remove("hidden");
            return false;
        }
        cpfInvalido.classList.add("hidden");
        return true;
    }

    function validarSenha(s) {
        const reqMaiuscula = container.querySelector("#req-maiuscula");
        const reqNumero = container.querySelector("#req-numero");
        const reqEspecial = container.querySelector("#req-especial");
        const reqTamanho = container.querySelector("#req-tamanho");
        const maiuscula = /[A-Z]/.test(s);
        const numero = /\d/.test(s);
        const especial = /[!@#$%^&*(),.?":{}|<>]/.test(s);
        const tamanho = s.length >= 6;

        reqMaiuscula.classList.toggle("text-success", maiuscula);
        reqNumero.classList.toggle("text-success", numero);
        reqEspecial.classList.toggle("text-success", especial);
        reqTamanho.classList.toggle("text-success", tamanho);

        reqMaiuscula.classList.toggle("text-error", !maiuscula);
        reqNumero.classList.toggle("text-error", !numero);
        reqEspecial.classList.toggle("text-error", !especial);
        reqTamanho.classList.toggle("text-error", !tamanho);

        return maiuscula && numero && especial && tamanho;
    }

    function validarDataNascimento() {
        const dataInvalida = container.querySelector("#data-nascimento-invalida");
        const dataEl = container.querySelector("#dataNascimento");
        const data = dataEl.value;
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
        const crmvEl = container.querySelector("#crmv");
        if (!crmvEl) return true;
        const crmv = crmvEl.value;
        const erroCrmv = container.querySelector("#erro-crmv");
        const ehValido = /^\w{3,20}$/.test(crmv);
        if (ehValido) {
            erroCrmv.classList.add("hidden");
        } else {
            erroCrmv.classList.remove("hidden");
        }
        return ehValido;
    }

    // Eventos para validação nos inputs
    const emailInput = container.querySelector("#email");
    if (emailInput) emailInput.addEventListener("input", validarEmail);
    const nomeInput = container.querySelector("#nome");
    if (nomeInput) nomeInput.addEventListener("input", validarNome);
    const sobrenomeInput = container.querySelector("#sobrenome");
    if (sobrenomeInput) sobrenomeInput.addEventListener("input", validarSobrenome);
    const senhaInput = container.querySelector("#senha");
    if (senhaInput) {
        senhaInput.addEventListener("input", function () {
            validarSenha(this.value);
        });
    }
    const dataNascimentoInput = container.querySelector("#dataNascimento");
    if (dataNascimentoInput) {
        dataNascimentoInput.addEventListener("input", validarDataNascimento);
    }

    // Evento de submit do formulário
    const formCadastro = container.querySelector("#form-cadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", async function (event) {
            event.preventDefault();
            const nome = container.querySelector("#nome").value.trim();
            const sobrenome = container.querySelector("#sobrenome").value.trim();
            const email = container.querySelector("#email").value.trim();
            const senha = container.querySelector("#senha").value.trim();
            const telefone = container.querySelector("#telefone").value.replace(/\D/g, "");
            const cpf = container.querySelector("#cpf").value.trim();
            const dataNascimento = container.querySelector("#dataNascimento").value;
            const tipoUsuario = container.querySelector("#tipoUsuario").value;
            const crmvEl = container.querySelector("#crmv");
            const crmv = crmvEl ? crmvEl.value.trim() : "";
            const harasId = selectHaras ? selectHaras.value : "";

            let valido = true;
            if (!validarNome()) valido = false;
            if (!validarSobrenome()) valido = false;
            if (!validarEmail()) valido = false;
            if (!validarCPF()) valido = false;
            if (!validarSenha(senha)) {
                container.querySelector("#senha-erro").classList.remove("hidden");
                valido = false;
            } else {
                container.querySelector("#senha-erro").classList.add("hidden");
            }
            if (telefone.length < 10 || telefone.length > 11) {
                container.querySelector("#telefone-erro").classList.remove("hidden");
                valido = false;
            } else {
                container.querySelector("#telefone-erro").classList.add("hidden");
            }
            if (!dataNascimento) {
                container.querySelector("#data-nascimento-erro").classList.remove("hidden");
                valido = false;
            } else {
                container.querySelector("#data-nascimento-erro").classList.add("hidden");
            }
            if (!tipoUsuario) {
                container.querySelector("#erro-tipoUsuario").classList.remove("hidden");
                valido = false;
            } else {
                container.querySelector("#erro-tipoUsuario").classList.add("hidden");
            }
            if (tipoUsuario === "Gerente" && !harasId) {
                container.querySelector("#erro-haras").classList.remove("hidden");
                valido = false;
            } else {
                container.querySelector("#erro-haras").classList.add("hidden");
            }
            if (tipoUsuario === "Veterinario" && (!crmv || crmv.length < 3)) {
                container.querySelector("#erro-crmv").classList.remove("hidden");
                valido = false;
            } else {
                container.querySelector("#erro-crmv").classList.add("hidden");
            }
            if (!valido) return;

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
                if (window.loadView) {
                    window.loadView("usuarios");
                }
            } catch (error) {
                await modal.show("Erro ao cadastrar: " + error.message);
            }
        });
    }
}
