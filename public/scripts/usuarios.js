/* eslint-disable no-alert */
			const TOKEN = localStorage.getItem("token");
			acessoControle();
			/* elementos */
			const selectHaras = document.getElementById("select-haras");
			const tbody = document.getElementById("tbody-gerentes");

			const modal = document.getElementById("modal");
			const btnCancel = document.getElementById("btn-cancelar");
			const btnSalvar = document.getElementById("btn-salvar");

			const edNome = document.getElementById("edit-nome");
			const edSobrenome = document.getElementById("edit-sobrenome");
			const edEmail = document.getElementById("edit-email");
			const edTel = document.getElementById("edit-telefone");
			const edCpf = document.getElementById("edit-cpf");
			const edData = document.getElementById("edit-data");

			let idEdicao = null;

			/* helpers -------------------------------------------------------------- */
			function openModal(g) {
				idEdicao = g.ID;
				edNome.value = g.nome;
				edSobrenome.value = g.sobrenome;
				edEmail.value = g.email;
				edTel.value = g.telefone ?? "";
				edCpf.value = g.cpf;
				edData.value = g.data_nascimento?.split("T")[0] || "";
				modal.classList.remove("hidden");
				modal.classList.add("flex");
			}

			function closeModal() {
				modal.classList.add("hidden");
				modal.classList.remove("flex");
				idEdicao = null;
			}

			/* acesso controle */
			async function acessoControle() {
				const r = await fetch("/api/requerProprietario", {
					headers: { Authorization: `Bearer ${TOKEN}` },
				});
				if (!r.ok) {
					const result = await r.json();
					if (result.login) {
						window.location.href = "/login";
					} else {
						window.location.href = "/home";
					}
				}
			}

			/* carregar haras ------------------------------------------------------- */
			async function carregarHaras() {
				const r = await fetch("http://localhost:3000/api/getAllHaras", {
					headers: { Authorization: `Bearer ${TOKEN}` },
				});
				const lista = await r.json();
				selectHaras.innerHTML = '<option value="">Selecione o Haras</option>' + lista.map((h) => `<option value="${h.ID}">${h.Nome}</option>`).join("");
			}

			/* listar --------------------------------------------------------------- */
			async function listarGerentes(harasId) {
				if (!harasId) {
					tbody.innerHTML = "";
					return;
				}
				tbody.innerHTML = '<tr><td class="p-3" colspan="6">Carregando...</td></tr>';

				let url = `http://localhost:3000/api/gerentes/haras/${harasId}`;
				const params = new URLSearchParams();
				params.append("pesquisa", document.getElementById("search").value.trim());
				if (params.toString()) url += "?" + params.toString();

				const r = await fetch(url, {
					headers: { Authorization: `Bearer ${TOKEN}` },
				});
				const gerentes = await r.json();

				if (!Array.isArray(gerentes) || gerentes.length === 0) {
					tbody.innerHTML = '<tr><td class="p-3" colspan="6">Nenhum gerente encontrado.</td></tr>';
					return;
				}

				tbody.innerHTML = gerentes
					.map(
						(g) => `
        <tr class="odd:bg-white even:bg-gray-50">
          <td class="p-3">${g.nome}</td>
          <td class="p-3">${g.sobrenome}</td>
          <td class="p-3">${g.email}</td>
          <td class="p-3 telefone">${g.telefone ?? ""}</td>
          <td class="p-3 cpf">${g.cpf}</td>
          <td class="p-3">${g.data_nascimento?.split("T")[0] ?? ""}</td>
          <td class="p-3 text-center space-x-2">
            <button data-id="${g.ID}" class="edit text-blue-600 hover:underline">Editar</button>
            <button data-id="${g.ID}" class="del  text-red-600  hover:underline">Excluir</button>
          </td>
        </tr>
      `
					)
					.join("");

				/* eventos */
				tbody.querySelectorAll(".edit").forEach((btn) =>
					btn.addEventListener("click", async () => {
						const r2 = await fetch(`http://localhost:3000/api/gerente/${btn.dataset.id}`, {
							headers: { Authorization: `Bearer ${TOKEN}` },
						});
						openModal(await r2.json());
					})
				);
				tbody.querySelectorAll(".cpf").forEach((cpf) => (cpf.textContent = cpf.textContent.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")));
				tbody.querySelectorAll(".telefone").forEach((telefone) => (telefone.textContent.length === 11 ? (telefone.textContent = telefone.textContent.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")) : (telefone.textContent = telefone.textContent.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3"))));

				tbody.querySelectorAll(".del").forEach((btn) => btn.addEventListener("click", () => removerGerente(btn.dataset.id)));
			}

			/* delete --------------------------------------------------------------- */
			async function removerGerente(id) {
				if (!confirm("Confirma excluir o gerente?")) return;
				await fetch(`http://localhost:3000/api/deletarFuncionario/gerente/${id}`, {
					method: "DELETE",
					headers: { Authorization: `Bearer ${TOKEN}` },
				});
				console.log(`http://localhost:3000/api/gerente/${id}`);
				listarGerentes(selectHaras.value);
			}

			/* update ----------------------------------------------------------------*/
			btnSalvar.addEventListener("click", async () => {
				const dados = {
					nome: edNome.value.trim(),
					sobrenome: edSobrenome.value.trim(),
					email: edEmail.value.trim(),
					telefone: edTel.value.trim(),
					cpf: edCpf.value.trim().replace(/\D/g, ""),
					dataNascimento: edData.value,
				};
				await fetch(`http://localhost:3000/api/editarGerente/${idEdicao}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${TOKEN}`,
					},
					body: JSON.stringify(dados),
				});
				closeModal();
				listarGerentes(selectHaras.value);
			});
			btnCancel.addEventListener("click", closeModal);

			/* init ------------------------------------------------------------------*/
			carregarHaras().then(() => {
				selectHaras.addEventListener("change", (e) => {
					if (e.target.value) listarGerentes(e.target.value);
					else tbody.innerHTML = "";
				});
			});

			document.getElementById("pesquisa").addEventListener("input", (e) => {
				listarGerentes(selectHaras.value);
			});