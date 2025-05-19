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
      document.getElementById("firstName").value = p.Nome;
      document.getElementById("lastName").value = p.Sobrenome;
      document.getElementById("phone").value = p.Telefone ?? "";
      document.getElementById("dob").value = p.Data_Nascimento?.split("T")[0] ?? "";
      document.getElementById("email").value = p.Email;
      document.getElementById("cep").value = p.CEP;
      document.getElementById("state").value = p.UF;
      document.getElementById("city").value = p.Cidade;
      document.getElementById("neighborhood").value = p.Bairro;
      document.getElementById("street").value = p.Rua;
      document.getElementById("number").value = p.Numero;
      document.getElementById("complemento").value = p.Complemento ?? "";

    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      alert("Erro ao carregar perfil.");
    }
  }

  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("firstName").value.trim(),
      sobrenome: document.getElementById("lastName").value.trim(),
      telefone: document.getElementById("phone").value.trim(),
      dataNascimento: document.getElementById("dob").value,
      email: document.getElementById("email").value.trim(),
      cep: document.getElementById("cep").value.trim(),
      rua: document.getElementById("street").value.trim(),
      numero: document.getElementById("number").value.trim(),
      bairro: document.getElementById("neighborhood").value.trim(),
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