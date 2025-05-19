  const TOKEN = localStorage.getItem("token");
  let userId = null;

  async function acessoControle() {
    const res = await fetch("/api/loginExpirado", {
      headers: { Authorization: `Bearer ${TOKEN}` }
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
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      if (!res.ok) throw new Error("Erro ao carregar dados");

      const p = await res.json();
      console.log(p)
      document.getElementById("cpf").value = p.CPF;
      document.getElementById("nome").value = p.Nome;
      document.getElementById("sobrenome").value = p.Sobrenome;
      document.getElementById("telefone").value = p.Telefone ?? "";
      document.getElementById("data-nascimento").value = p.Data_Nascimento?.split("T")[0] ?? "";
      document.getElementById("email").value = p.Email;
      document.getElementById("cep").value = p.CEP;
      document.getElementById("estado").value = p.UF;
      document.getElementById("cidade").value = p.Cidade;
      document.getElementById("bairro").value = p.Bairro;
      document.getElementById("logradouro").value = p.Rua;
      document.getElementById("numero").value = p.Numero;
      document.getElementById("complemento").value = p.Complemento ?? "";

    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      alert("Erro ao carregar perfil.");
    }
  }

  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value.trim(),
      sobrenome: document.getElementById("sobrenome").value.trim(),
      telefone: document.getElementById("telefone").value.trim(),
      dataNascimento: document.getElementById("data-nascimento").value,
      email: document.getElementById("email").value.trim(),
      cep: document.getElementById("cep").value.trim(),
      rua: document.getElementById("rua").value.trim(),
      numero: document.getElementById("numero").value.trim(),
      bairro: document.getElementById("bairro").value.trim(),
      complemento: document.getElementById("complemento").value.trim()
    };

    try {
      const res = await fetch("/api/proprietario/editar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify(dados)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Erro ao atualizar");

      alert("Dados atualizados com sucesso!");
      location.reload();

    } catch (error) {
      alert("Erro ao atualizar: " + error.message);
    }
  });

  // Executa ao carregar a página
  acessoControle().then(carregarPerfil);