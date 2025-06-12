// Função para formatar valores em Real (BRL)
function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export async function init(container) {
    const form = container.querySelector("#form-simulador-custos");
    // Esses elementos (selectHaras e erroHaras) estão comentados na view, mas mantemos a referência se for necessário futuramente
    const selectHaras = form.querySelector("#select-haras");
    const erroHaras = form.querySelector("#erro-haras");

    // Seleciona os containers de resultados e totais
    const resultsContainer = container.querySelector("#resultados-geral");
    const costsTableContainer = container.querySelector("#costs-table");
    const totalMensalBox = container.querySelector("#big-total-mensal");
    const totalAnualBox = container.querySelector("#big-total-anual");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Se necessário, descomente a validação do select
        // if (!selectHaras.value) {
        //     erroHaras.classList.remove("hidden");
        //     return;
        // } else {
        //     erroHaras.classList.add("hidden");
        // }

        // Coleta dos valores dos inputs
        const numCavalos = parseFloat(form.querySelector("#numero-cavalos").value) || 0;
        const custoAlimentacao = parseFloat(form.querySelector("#custo-alimentacao").value) || 0;
        const visitasVet = parseFloat(form.querySelector("#visitas-vet-mes").value) || 0;
        const custoVisitas = parseFloat(form.querySelector("#custo-visitas").value) || 0;
        const numFuncionarios = parseFloat(form.querySelector("#numero-funcionarios").value) || 0;
        const salarioMedio = parseFloat(form.querySelector("#salario-medio-funcionario").value) || 0;
        const outrosCustos = parseFloat(form.querySelector("#outros-custos").value) || 0;

        // Cálculos mensais
        const custoAlimentacaoTotal = numCavalos * custoAlimentacao;
        const custoVeterinarioTotal = visitasVet * custoVisitas;
        const custoFuncionariosTotal = numFuncionarios * salarioMedio;
        const custoMensalTotal = custoAlimentacaoTotal + custoVeterinarioTotal + custoFuncionariosTotal + outrosCustos;

        // Cálculos anuais
        const custoAlimentacaoAnual = custoAlimentacaoTotal * 12;
        const custoVeterinarioAnual = custoVeterinarioTotal * 12;
        const custoFuncionariosAnual = custoFuncionariosTotal * 12;
        const outrosCustosAnual = outrosCustos * 12;
        const custoAnualTotal = custoMensalTotal * 12;

        // Atualiza a tabela de resultados
        const tableBody = `
            <tr class="border-b border-gray-200">
                <td class="p-4 align-middle font-medium">Alimentação</td>
                <td class="p-4 align-middle text-right">${formatCurrency(custoAlimentacaoTotal)}</td>
                <td class="p-4 align-middle text-right">${formatCurrency(custoAlimentacaoAnual)}</td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="p-4 align-middle font-medium">Veterinário</td>
                <td class="p-4 align-middle text-right">${formatCurrency(custoVeterinarioTotal)}</td>
                <td class="p-4 align-middle text-right">${formatCurrency(custoVeterinarioAnual)}</td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="p-4 align-middle font-medium">Funcionários</td>
                <td class="p-4 align-middle text-right">${formatCurrency(custoFuncionariosTotal)}</td>
                <td class="p-4 align-middle text-right">${formatCurrency(custoFuncionariosAnual)}</td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="p-4 align-middle font-medium">Outros</td>
                <td class="p-4 align-middle text-right">${formatCurrency(outrosCustos)}</td>
                <td class="p-4 align-middle text-right">${formatCurrency(outrosCustosAnual)}</td>
            </tr>
            <tr>
                <td class="p-4 align-middle font-medium">Total</td>
                <td class="p-4 align-middle text-right">${formatCurrency(custoMensalTotal)}</td>
                <td class="p-4 align-middle text-right">${formatCurrency(custoAnualTotal)}</td>
            </tr>
        `;
        costsTableContainer.innerHTML = `<table class="w-full">
            <thead class="bg-tertiary">
                <tr class="border-b border-gray-200">
                    <th class="h-12 px-4 text-left align-middle font-medium">Categoria</th>
                    <th class="h-12 px-4 text-right align-middle font-medium">Custo Mensal</th>
                    <th class="h-12 px-4 text-right align-middle font-medium">Custo Anual</th>
                </tr>
            </thead>
            <tbody>${tableBody}</tbody>
        </table>`;

        // Atualiza as caixas de totais
        totalMensalBox.querySelector("span").textContent = formatCurrency(custoMensalTotal);
        totalAnualBox.querySelector("span").textContent = formatCurrency(custoAnualTotal);

        // Exibe o container de resultados
        resultsContainer.classList.remove("hidden");

        // Dados para os gráficos
        const categories = ['Alimentação', 'Veterinário', 'Funcionários', 'Outros'];
        const monthlyData = [custoAlimentacaoTotal, custoVeterinarioTotal, custoFuncionariosTotal, outrosCustos];
        const annualData  = [custoAlimentacaoAnual, custoVeterinarioAnual, custoFuncionariosAnual, outrosCustosAnual];
        const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];
        const altColors = ["#E57373", "#64B5F6", "#FFB74D", "#4DB6AC"];

        // Criação do Pie Chart
        const pieContainer = container.querySelector("#resultado-grafico-pizza div");
        let pieCanvas = pieContainer.querySelector("canvas");
        if (!pieCanvas) {
            pieCanvas = document.createElement("canvas");
            pieContainer.appendChild(pieCanvas);
        }
        if (window.myPieChart) {
            window.myPieChart.destroy();
        }
        window.myPieChart = new Chart(pieCanvas, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: monthlyData,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true
            }
        });

        // Criação do Bar Chart (gráficos de barras para custo mensal e anual)
        const barContainer = container.querySelector("#resultado-grafico-barras div");
        let barCanvas = barContainer.querySelector("canvas");
        if (!barCanvas) {
            barCanvas = document.createElement("canvas");
            barContainer.appendChild(barCanvas);
        }
        if (window.myBarChart) {
            window.myBarChart.destroy();
        }
        window.myBarChart = new Chart(barCanvas, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Custo Mensal',
                    data: monthlyData,
                    backgroundColor: colors
                },
                {
                    label: 'Custo Anual',
                    data: annualData,
                    backgroundColor: altColors
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    });
}