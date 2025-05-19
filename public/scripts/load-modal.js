class Modal {
    constructor() {
        this.templateUrl = '/components/modal.html';
        this.loaded = false;
    }

    async load() {
        if (this.loaded) return;

        const res = await fetch(this.templateUrl);
        const html = await res.text();

        const templateContainer = document.createElement('div');
        templateContainer.innerHTML = html.trim();

        this.modal = templateContainer.firstElementChild;
        this.titleEl = this.modal.querySelector('.modal-title');
        this.messageEl = this.modal.querySelector('.modal-message');
        this.okButton = this.modal.querySelector('.modal-ok');

        this.okButton.addEventListener('click', () => this.hide());

        this.loaded = true;
    }

    async show(message, title = 'Aviso') {
        await this.load();

        this.titleEl.textContent = title;
        this.messageEl.textContent = message;

        document.body.appendChild(this.modal);
        return new Promise((resolve) => {
            this.okButton.addEventListener('click', () => {
                this.hide();
                resolve(); // Resolve a Promise quando o botão OK for clicado
            }, { once: true });
        });
    }

    hide() {
        this.modal.remove();
    }
}
export default Modal;
