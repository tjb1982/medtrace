/**
 * This could also be imported as a string or written here and attached to the
 * `document.body` as a `template` element, like
 * 
 *     const template = document.createElement("template");
 *     template.innerHTML = `<style>...</style><div>...</div>`;
 *     document.body.appendChild(template);
 * 
 * which would only be run here once, similar in performance to parsing it in
 * index.html file.
 */
const template = document.getElementById("my-card-template") as
    HTMLTemplateElement;

enum Attributes {
    MESSAGE = "message",
}

window.customElements.define("my-card", class extends HTMLElement {
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
});