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
		//window.location.href = "/redirecionarParaAMainLogada";
	}
}
document.addEventListener("DOMContentLoaded", () => {
	const form       = document.getElementById("loginForm");      // <form id="loginForm">
	const toggleBtn  = document.getElementById("togglePassword"); // <button id="togglePassword">
	const emailInput = document.getElementById("Email");          // <input id="Email">
	const pwdInput   = document.getElementById("Senha");          // <input id="Senha">
	const emailErr   = document.getElementById("emailError");     // <span id="emailError">
	const pwdErr     = document.getElementById("passwordError");  // <span id="passwordError">
  
	// 1) Toggle visibilidade da senha
	toggleBtn.addEventListener("click", () => {
	  pwdInput.type = pwdInput.type === "password" ? "text" : "password";
	});
  
	// 2) Validação simples + envio via fetch
	form.addEventListener("submit", async (e) => {
	  e.preventDefault();
	  // limpa mensagens de erro
	  emailErr.classList.add("hidden");
	  pwdErr.classList.add("hidden");
  
	  let valid = true;
	  if (!emailInput.value) {
		emailErr.textContent = "Email é obrigatório";
		emailErr.classList.remove("hidden");
		valid = false;
	  }
	  if (!pwdInput.value) {
		pwdErr.textContent = "Senha é obrigatória";
		pwdErr.classList.remove("hidden");
		valid = false;
	  }
	  if (!valid) return;
  
	  // 3) Chama sua API de login
	  try {
		const res = await fetch("http://localhost:3000/api/login", {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({
			email: emailInput.value,
			senha: pwdInput.value,
		  }),
		});
		if (!res.ok) throw new Error("Login inválido");
		const data = await res.json();
  
		// sucesso: guarda token e redireciona
		localStorage.setItem("token", data.token);
		localStorage.setItem("userType", data.userType);
		window.location.href = "/create-users";
	  } catch (err) {
		modal.show("Email ou senha incorretos.");
		console.error(err);
	  }
	});
  });
  