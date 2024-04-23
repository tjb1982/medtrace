const template = document.getElementById("my-card-template") as
    HTMLTemplateElement;

enum Attributes {
    MESSAGE = "message",
}

export default class ECGTicker extends HTMLElement {
    static observedAttributes = [Attributes.MESSAGE];

    private _content: DocumentFragment;
    $message: HTMLElement;

    constructor() {
        super();

        this.attachShadow({mode: "open"});
        this._content = template.content.cloneNode(true) as DocumentFragment;
        this.$message = this._content.getElementById("message")!;
    }

    connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.appendChild(this._content);
        } else {
            console.warn("No shadowRoot detected.");
        }
    }

    attributeChangedCallback(name: string, _prev: string, curr: string) {
        if (Attributes.MESSAGE === name) {
            while (this.$message.firstChild) {
                this.$message.removeChild(this.$message.lastChild!);
            }
            this.$message.appendChild(document.createTextNode(curr));
        }
    }
};

window.customElements.define("x-ecg-ticker", ECGTicker);

export {};