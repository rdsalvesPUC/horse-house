import Modal from "/scripts/load-modal.js";

const modal = new Modal();


const TOKEN = localStorage.getItem("token");
let userId = null;
let userType = null;

async function acessoControle() {
    const res = await fetch("/api/loginExpirado", {
        headers: {Authorization: `Bearer ${TOKEN}`}
    });

    if (!res.ok) {
        const data = await res.json();
        window.location.href = data.login ? "/login" : "/home";
    }

    const payload = JSON.parse(atob(TOKEN.split('.')[1]));
    userId = payload.id;
}

async function carregarPerfil() {
    try {
        const res = await fetch(`/api/getUsuarioLogado/`, {
            headers: {Authorization: `Bearer ${TOKEN}`}
        });

        if (!res.ok) throw new Error("Erro ao carregar dados");
        const p = await res.json();
        userType = p.userType
        if (p.Foto) {
            document.getElementById("avatar").src = p.Foto;
        } else {
            document.getElementById("avatar").src = "/assets/images/user.png";
        }
        document.getElementById("cpf").value = p.CPF;
        document.getElementById("nomee").value = p.Nome;
        document.getElementById("sobrenome").value = p.Sobrenome;
        document.getElementById("telefone").value = p.Telefone ?? "";
        document.getElementById("data-nascimento").value = p.Data_Nascimento?.split("T")[0] ?? "";
        document.getElementById("email").value = p.Email;
        if (userType === "proprietario") {
            document.getElementById("cep").value = p.CEP;
            document.getElementById("estado").value = p.UF;
            document.getElementById("cidade").value = p.Cidade;
            document.getElementById("bairro").value = p.Bairro;
            document.getElementById("logradouro").value = p.Rua;
            document.getElementById("numero").value = p.Numero;
            document.getElementById("complemento").value = p.Complemento ?? "";
        } else {
            document.getElementById("container-cep").classList.add("hidden");
            document.getElementById("container-bairro").classList.add("hidden");
            document.getElementById("container-estado").classList.add("hidden");
            document.getElementById("container-rua").classList.add("hidden");
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        await modal.show("Erro ao carregar perfil.");
    }
}

document.getElementById("avatar-upload").addEventListener('input', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1]; // remove o "data:image/..;base64,"

        const formData = {
            foto: base64String
        };

        try {
            let url;
            if (userType === "proprietario") {
                url = `/api/proprietario/editar`;
            }
            else if (userType === "gerente") {
                url = `/api/editarGerente`;
            }
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${TOKEN}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Erro ao fazer upload do avatar");

            const data = await res.json();
            await modal.show("Avatar atualizado com sucesso!");
            document.getElementById("avatar").src = `data:image/jpeg;base64,${base64String}`;
            document.getElementById("foto").src = `data:image/jpeg;base64,${base64String}`;
        } catch (error) {
            console.error("Erro ao fazer upload do avatar:", error);
            await modal.show("Erro ao fazer upload do avatar.");
        }
    };

    reader.readAsDataURL(file); // dispara a conversão
});

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    let valido = true;
    if (userType === "proprietario") {
        if (!validarCampoTexto("nomee")) valido = false;
        if (!validarCampoTexto("sobrenome")) valido = false;
        if (!validarTelefone()) valido = false;
        if (!validarDataNascimento()) valido = false;
        if (!validarEmail()) valido = false;
        if (!await buscarEndereco()) valido = false;
        if (!validarNumero()) valido = false;

        const obrigatorios = ["cep", "logradouro", "bairro", "cidade", "estado"];
        obrigatorios.forEach(id => {
            const input = document.getElementById(id);
            const erro = document.getElementById(`${id}-erro`);
            if (!input.value.trim()) {
                erro?.classList.remove("hidden");
                valido = false;
            } else {
                erro?.classList.add("hidden");
            }
        });
    }

    if (!valido) return;
    const dados = {
        nome: document.getElementById("nomee").value.trim(),
        sobrenome: document.getElementById("sobrenome").value.trim(),
        telefone: document.getElementById("telefone").value.replace(/\D/g, ""),
        dataNascimento: document.getElementById("data-nascimento").value,
        email: document.getElementById("email").value.trim(),
    };
    let url;
    if (userType === "proprietario") {
        dados.cep = document.getElementById("cep").value.replace(/\D/g, "")
        dados.logradouro = document.getElementById("logradouro").value.trim()
        dados.numero = document.getElementById("numero").value.trim()
        dados.bairro = document.getElementById("bairro").value.trim()
        dados.complemento = document.getElementById("complemento").value.trim()
        url = `/api/proprietario/editar`;
    }
    else{
        url = `/api/editarGerente`;
    }
    try {
        console.log('s')
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`
            },
            body: JSON.stringify(dados)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Erro ao atualizar");
        await modal.show("Dados atualizados com sucesso!");
        location.reload();

    } catch (error) {
        await modal.show("Erro ao atualizar: " + error.message);
    }
});

// --------- MÁSCARAS E EVENTOS ---------
document.getElementById("cpf").addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    let formatted;
    if (value.length > 9) formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    else if (value.length > 6) formatted = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (value.length > 3) formatted = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    else formatted = value;
    this.value = formatted;
});

document.getElementById("telefone").addEventListener("input", function (e) {
    let value = this.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 10) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    this.value = value;
});

document.getElementById("cep").addEventListener("input", function () {
    let cep = this.value.replace(/\D/g, "").slice(0, 8);
    if (cep.length > 5) cep = cep.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    this.value = cep;
    document.getElementById("cep-erro")?.classList.add("hidden");
    if (!cep) limparCamposEndereco();
});

document.getElementById("cep").addEventListener("input", buscarEndereco);

function limparCamposEndereco() {
    ["logradouro", "bairro", "cidade", "estado", "numero"].forEach((id) => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = "";
            campo.removeAttribute("readonly");
        }
    });
}

function bloquearCampo(id, valor) {
    const campo = document.getElementById(id);
    if (campo) {
        campo.value = valor;
        campo.setAttribute("readonly", "true");
    }
}

async function buscarEndereco() {
    const cepInput = document.getElementById("cep");
    const cepInvalido = document.getElementById("cep-invalido");
    let cep = cepInput.value.replace(/\D/g, "");

    if (!/^\d{8}$/.test(cep)) {
        cepInvalido?.classList.remove("hidden");
        limparCamposEndereco();
        return false;
    }

    try {
        const response = await fetch(`/api/getCep/${cep}`);
        if (!response.ok) {
            if (response.status === 404) return await buscarViaCEP(cep);
            throw new Error("Erro na API");
        }
        const data = await response.json();
        bloquearCampo("logradouro", data.logradouro || "");
        bloquearCampo("bairro", data.bairro || "");
        bloquearCampo("cidade", data.Cidade);
        bloquearCampo("estado", data.UF);
        cepInvalido?.classList.add("hidden");
        return true;
    } catch (error) {
        return await buscarViaCEP(cep);
    }
}

async function buscarViaCEP(cep) {
    const cepInvalido = document.getElementById("cep-invalido");
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) throw new Error("CEP não encontrado");
        bloquearCampo("logradouro", data.logradouro);
        bloquearCampo("bairro", data.bairro);
        bloquearCampo("cidade", data.localidade);
        bloquearCampo("estado", data.uf);
        cepInvalido?.classList.add("hidden");
        return true;
    } catch (error) {
        cepInvalido?.classList.remove("hidden");
        limparCamposEndereco();
        return false;
    }
}

function validarCampoTexto(id, min = 3) {
    const input = document.getElementById(id);
    const erro = document.getElementById(`${id}-erro`);
    if (!input.value.trim() || input.value.length < min) {
        erro?.classList.remove("hidden");
        return false;
    }
    erro?.classList.add("hidden");
    return true;
}

function validarTelefone() {
    const tel = document.getElementById("telefone").value.replace(/\D/g, "");
    const erro = document.getElementById("telefone-invalido");
    if (tel.length < 10 || tel.length > 11) {
        erro?.classList.remove("hidden");
        return false;
    }
    erro?.classList.add("hidden");
    return true;
}

function validarEmail() {
    const input = document.getElementById("email");
    const erro = document.getElementById("email-invalido");
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(input.value.trim())) {
        erro?.classList.remove("hidden");
        return false;
    }
    erro?.classList.add("hidden");
    return true;
}

function validarDataNascimento() {
    const input = document.getElementById("data-nascimento");
    const valor = input.value.trim();
    const erroObrig = document.getElementById("data-nascimento-erro");
    const erroInval = document.getElementById("data-nascimento-invalida");

    if (!valor) {
        erroObrig?.classList.remove("hidden");
        erroInval?.classList.add("hidden");
        return false;
    }
    erroObrig?.classList.add("hidden");

    const data = new Date(valor);
    const hoje = new Date();
    const min = new Date();
    min.setFullYear(min.getFullYear() - 120);

    if (data > hoje || data < min) {
        erroInval?.classList.remove("hidden");
        return false;
    }
    erroInval?.classList.add("hidden");
    return true;
}

function validarNumero() {
    const input = document.getElementById("numero");
    const erro = document.getElementById("numero-erro");
    if (!input.value.trim()) {
        erro?.classList.remove("hidden");
        return false;
    }
    erro?.classList.add("hidden");
    return true;
}

// Executa ao carregar a página
acessoControle().then(carregarPerfil);