const TOKEN = localStorage.getItem("token");
const selectHaras = document.getElementById("select-haras");
const tbody = document.getElementById("tbody-cavalos");

const modal = document.getElementById("modal");
const edNome = document.getElementById("edit-nome");
const edData = document.getElementById("edit-data");
const edPeso = document.getElementById("edit-peso");
const edSexo = document.getElementById("edit-sexo");
const edPelagem = document.getElementById("edit-pelagem");
const edSangue = document.getElementById("edit-sangue");
const edSituacao = document.getElementById("edit-situacao");
const edStatus = document.getElementById("edit-status");
const edRegistro = document.getElementById("edit-registro");
const edCert = document.getElementById("edit-cert");
const edImp = document.getElementById("edit-imp");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancel = document.getElementById("btn-cancelar");

let idEdicao = null;

function openModal(c) {
	idEdicao = c.ID;
	edNome.value = c.Nome;
	edData.value = c.Data_Nascimento?.split("T")[0] ?? "";
	edPeso.value = c.Peso;
	edSexo.value = c.Sexo;
	edPelagem.value = c.Pelagem;
	edSangue.value = c.Sangue;
	edSituacao.value = c.Situacao;
	edStatus.value = c.Status;
	edRegistro.value = c.Registro;
	edCert.value = c.CERT;
	edImp.value = c.IMP;
	modal.classList.remove("hidden");
	modal.classList.add("flex");
}

function closeModal() {
	modal.classList.add("hidden");
	modal.classList.remove("flex");
	idEdicao = null;
}

async function acessoControle() {
	const r = await fetch("/api/requerProprietario", {
		headers: { Authorization: `Bearer ${TOKEN}` },
	});
	if (!r.ok) {
		const result = await r.json();
		window.location.href = result.login ? "/login" : "/home";
	}
}

async function carregarHaras() {
	const r = await fetch("/api/getAllHaras", {
		headers: { Authorization: `Bearer ${TOKEN}` },
	});
	const lista = await r.json();
	selectHaras.innerHTML = '<option value="">Selecione o Haras</option>' + lista.map((h) => `<option value="${h.ID}">${h.Nome}</option>`).join("");
}

async function listarCavalos(harasId) {
	tbody.innerHTML = '<tr><td class="p-3" colspan="12">Carregando...</td></tr>';
	const r = await fetch(`/api/cavalos/haras/${harasId}`, {
		headers: { Authorization: `Bearer ${TOKEN}` },
	});
	const cavalos = await r.json();
	console.log(cavalos);
	if (!Array.isArray(cavalos) || cavalos.length === 0) {
		tbody.innerHTML = '<tr><td class="p-3" colspan="12">Nenhum cavalo encontrado.</td></tr>';
		return;
	}
	tbody.innerHTML = cavalos
		.map(
			(c) => `
        <tr class="odd:bg-white even:bg-gray-50">
          <td class="p-3">${c.Nome}</td>
          <td class="p-3">${c.Data_Nascimento?.split("T")[0] ?? ""}</td>
          <td class="p-3">${c.Peso}</td>
          <td class="p-3">${c.Sexo}</td>
          <td class="p-3">${c.Pelagem}</td>
          <td class="p-3">${c.Sangue}</td>
          <td class="p-3">${c.Situacao}</td>
          <td class="p-3">${c.Status}</td>
          <td class="p-3">${c.Registro}</td>
          <td class="p-3">${c.CERT}</td>
          <td class="p-3">${c.IMP == 1 ? "Sim" : "Não"}</td>
          <td class="p-3 text-center space-x-2">
            <button data-id="${c.ID}" class="edit text-blue-600 hover:underline">Editar</button>
            <button data-id="${c.ID}" class="del text-red-600 hover:underline">Excluir</button>
          </td>
        </tr>`
		)
		.join("");

	tbody.querySelectorAll(".edit").forEach((btn) => {
		btn.addEventListener("click", async () => {
			const r2 = await fetch(`/api/cavalos/id/${btn.dataset.id}`, {
				headers: { Authorization: `Bearer ${TOKEN}` },
			});
			console.log(r2);
			openModal(await r2.json());
		});
	});

	tbody.querySelectorAll(".del").forEach((btn) => {
		btn.addEventListener("click", () => removerCavalo(btn.dataset.id));
	});
}

async function removerCavalo(id) {
	if (!confirm("Confirma excluir o cavalo?")) return;
	await fetch(`/api/deleteCavalos/${id}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${TOKEN}` },
	});
	listarCavalos(selectHaras.value);
}

btnSalvar.addEventListener("click", async () => {
	const dados = {
		nome: edNome.value.trim(),
		data_nascimento: edData.value,
		peso: edPeso.value.trim(),
		sexo: edSexo.value.trim(),
		pelagem: edPelagem.value.trim(),
		sangue: edSangue.value.trim(),
		situacao: edSituacao.value.trim(),
		status: edStatus.value.trim(),
		registro: edRegistro.value.trim(),
		cert: edCert.value.trim(),
		imp: parseInt(edImp.value),
	};
	await fetch(`/api/Cavalos/editar/${idEdicao}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${TOKEN}`,
		},
		body: JSON.stringify(dados),
	});
	closeModal();
	listarCavalos(selectHaras.value);
});

btnCancel.addEventListener("click", closeModal);

acessoControle();
carregarHaras().then(() => {
	selectHaras.addEventListener("change", (e) => {
		if (e.target.value) listarCavalos(e.target.value);
		else tbody.innerHTML = "";
	});
});
