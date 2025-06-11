export function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    // Obtém o container interno da sidebar (a DIV inserida via sidebar.html)
    const sidebarContainer = sidebar.firstElementChild;
    if (!sidebarContainer) return;

    // Variável global para o estado da sidebar
    let collapsed = false;

    // Aplica o estado ativo aos links (apenas aos itens de navegação)
    function updateActiveState(clickedLink) {
        const navLinks = sidebar.querySelectorAll("nav a[data-view]");
        navLinks.forEach((link) => {
            link.classList.remove("bg-[#2D3A3B]");
            link.classList.remove("text-secondary");
            link.classList.add("text-tertiary");
            const chevron = link.querySelector("svg.lucide-chevron-right");
            if (chevron) {
                chevron.classList.add("hidden");
            }
        });
        clickedLink.classList.add("bg-[#2D3A3B]");
        clickedLink.classList.remove("text-tertiary");
        clickedLink.classList.add("text-secondary");
        const chevron = clickedLink.querySelector("svg.lucide-chevron-right");
        // Só exibe o chevron se a sidebar NÃO estiver colapsada
        if (chevron && !collapsed) {
            chevron.classList.remove("hidden");
        }
    }

    // Esconde os ícones chevron de todos os itens de navegação
    function hideAllChevrons() {
        const navLinks = sidebar.querySelectorAll("nav a[data-view]");
        navLinks.forEach((link) => {
            const chevron = link.querySelector("svg.lucide-chevron-right");
            if (chevron) {
                chevron.classList.add("hidden");
            }
        });
    }

    // Inicialização padrão: esconde os chevrons e define o link ativo default
    hideAllChevrons();
    const defaultLink = sidebar.querySelector('nav a[data-view="visao-geral"]');
    if (defaultLink) {
        updateActiveState(defaultLink);
    }

    // Delegação de cliques nos links de navegação da sidebar
    sidebar.addEventListener("click", (e) => {
        const clickedLink = e.target.closest("a[data-view]");
        if (clickedLink && sidebar.contains(clickedLink)) {
            e.preventDefault(); // Se for SPA/AJAX
            updateActiveState(clickedLink);
            // Aqui você pode acionar a troca de view
        }
    });

    // Comportamento de colapso/expansão da sidebar
    const toggleButton = document.getElementById("toggleSidebar");
    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            collapsed = !collapsed;
            if (collapsed) {
                // COLAPSAR:
                // Alternar a largura do container interno (não do <aside>)
                sidebarContainer.classList.add("w-[80px]");
                sidebarContainer.classList.remove("w-[260px]");

                // Ocultar os textos dos links dos itens de navegação
                sidebar.querySelectorAll("nav a[data-view] span").forEach((span) => {
                    span.classList.add("hidden");
                });

                // Remove a classe mr-3 dos ícones principais (exceto os chevron-right)
                sidebar.querySelectorAll("nav a[data-view] svg.mr-3").forEach((icon) => {
                    icon.classList.remove("mr-3");
                });

                // Oculta os chevron-right dos itens de navegação
                sidebar.querySelectorAll("nav a[data-view] svg.lucide-chevron-right").forEach((chevron) => {
                    chevron.classList.add("hidden");
                });

                // Alternar logos: oculta a expandida e exibe a colapsada
                const logoExpanded = sidebar.querySelector('a img[src="/assets/images/logo-h-whitebg.svg"]');
                const logoCollapsed = sidebar.querySelector('a img[src="/assets/images/brasao-secondary.svg"]');
                if (logoExpanded) logoExpanded.classList.add("hidden");
                if (logoCollapsed) logoCollapsed.classList.remove("hidden");

                // Atualiza os ícones do toggle button
                const chevronLeft = toggleButton.querySelector("svg.lucide-chevron-left");
                const chevronRight = toggleButton.querySelector("svg.lucide-chevron-right");
                if (chevronLeft) chevronLeft.classList.add("hidden");
                if (chevronRight) chevronRight.classList.remove("hidden");
            } else {
                // EXPANDIR:
                sidebarContainer.classList.add("w-[260px]");
                sidebarContainer.classList.remove("w-[80px]");

                // Mostrar os textos dos links dos itens de navegação
                sidebar.querySelectorAll("nav a[data-view] span").forEach((span) => {
                    span.classList.remove("hidden");
                });

                // Re-adiciona a classe mr-3 para os ícones (exceto os chevron-right)
                sidebar.querySelectorAll("nav a[data-view] svg:not(.lucide-chevron-right)").forEach((icon) => {
                    if (!icon.classList.contains("mr-3")) {
                        icon.classList.add("mr-3");
                    }
                });

                // Alternar logos: exibe a logo expandida e oculta a colapsada
                const logoExpanded = sidebar.querySelector('a img[src="/assets/images/logo-h-whitebg.svg"]');
                const logoCollapsed = sidebar.querySelector('a img[src="/assets/images/brasao-secondary.svg"]');
                if (logoExpanded) logoExpanded.classList.remove("hidden");
                if (logoCollapsed) logoCollapsed.classList.add("hidden");

                // Atualiza os ícones do toggle button
                const chevronLeft = toggleButton.querySelector("svg.lucide-chevron-left");
                const chevronRight = toggleButton.querySelector("svg.lucide-chevron-right");
                if (chevronLeft) chevronLeft.classList.remove("hidden");
                if (chevronRight) chevronRight.classList.add("hidden");

                // Reexibe o chevron-right somente para o link ativo
                const activeLink = sidebar.querySelector('nav a[data-view].bg-[#2D3A3B]');
                if (activeLink) {
                    updateActiveState(activeLink);
                }
            }
        });
    }

    // Adiciona os event listeners de hover aos itens do menu para exibir tooltips (quando colapsada)
    sidebar.querySelectorAll("nav a[data-view]").forEach((link) => {
        link.addEventListener("mouseenter", () => {
            if (collapsed) {
                const tooltipId = "tooltip-" + link.getAttribute("data-view");
                const tooltip = document.getElementById(tooltipId);
                if (tooltip) {
                    tooltip.classList.remove("hidden");
                }
            }
        });
        link.addEventListener("mouseleave", () => {
            if (collapsed) {
                const tooltipId = "tooltip-" + link.getAttribute("data-view");
                const tooltip = document.getElementById(tooltipId);
                if (tooltip) {
                    tooltip.classList.add("hidden");
                }
            }
        });
    });
}
