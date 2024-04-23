const template = document.getElementById("nav-template") as
    HTMLTemplateElement;

const navItemTemplate = document.createElement("template");
navItemTemplate.innerHTML = `
<li class="menu-item">
    <a>
        <i class="material-icons" aria-hidden="true"></i>
        <span></span>
    </a>
</li>
`;

const displayModes = ["stack","flex","tab"] as const;
type DisplayMode = typeof displayModes[number];
export type MenuItem = {
    name: string;
    label: string;
    icon: string;
    href: string;
    selected?: boolean;
    spa?: boolean;
}

export default class Nav extends HTMLElement {

    static observedAttributes = ["display-mode"];

    _content: DocumentFragment;
    _selected?: MenuItem;
    _items: MenuItem[] = [];
    _styles: Record<DisplayMode,HTMLStyleElement> = {} as any;
    $nav: HTMLElement;
    $menu: HTMLUListElement;
    
    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this._content =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$nav =
            this._content.getElementById("nav") as
                HTMLElement;
        this.$menu =
            this._content.getElementById("menu") as
                HTMLUListElement;

        displayModes.forEach(mode => {
            this._styles[mode] =
                this._content.getElementById(mode) as
                    HTMLStyleElement;
        });

        this._clearStyles();
    }

    connectedCallback() {
        if (this._content.hasChildNodes()) {
            this.shadowRoot?.appendChild(this._content);
            this.displayMode = "none";    
        }
    }

    private _clearStyles() {
        displayModes.forEach(x => {
            const $style = this._styles[x];
            // parentNode is shadowRoot or null
            $style.parentNode?.removeChild($style);
        });
    }

    set displayMode(x: DisplayMode | "none") {
        if (!this.shadowRoot?.hasChildNodes()) {
            return;
        }
        const styles = document.createDocumentFragment();

        this.$nav.classList.add("hidden");
        this._clearStyles();

        switch(x) {
            case "none":
                return;
            case "tab":
                styles.appendChild(this._styles.tab);
                // no break
            case "flex":
                styles.prepend(this._styles.flex);
                // no break
            default:
                this.$nav.classList.remove("hidden");
                styles.prepend(this._styles.stack);
                this.shadowRoot?.insertBefore(styles, this.$nav);
                break;
        }
    }

    get selectedItem(): MenuItem | undefined {
        return this._selected;
    }
    set selected(name: string) {
        this.items.forEach(item => {
            if (item.name === name) {
                item.selected = true;
                this._selected = item;
            }
            else {
                item.selected = false;
            }
        });

        const selected = this.selectedItem;
        if (selected) {
            this.updateSelected(selected);
        }
    }

    updateSelected(item: MenuItem) {
        Array.from(this.$menu.querySelectorAll("a")).forEach($anchor => {
            $anchor.classList.remove("selected");
            if (
                $anchor.parentElement?.id ===
                    `menu-item__${item.name}`
            ) {
                $anchor.classList.add("selected");
            }
        });
    }

    get items() { return this._items }

    addItem(item: MenuItem) {
        this._items.push(item);
    }

    attributeChangedCallback(k: string, p: string, c: string) {
        switch (k) {
            case "display-mode":
                if (!displayModes.includes(c as any)) {
                    throw new Error(
                        `Attribute "display-mode" must be one of ${
                            JSON.stringify(displayModes)
                        }`
                    );
                }
                this.displayMode = c as DisplayMode || "stack";
                break;
        }
    }

    init() {
        while (this.$menu.firstElementChild)
            this.$menu.removeChild(this.$menu.lastElementChild as Node);

        this.items.forEach(item => {
            const $item =
                navItemTemplate.content.cloneNode(true) as
                    DocumentFragment;
            const $li = $item.querySelector("li") as HTMLLIElement;
            const $anchor = $item.querySelector("a") as HTMLAnchorElement;
            const $icon = $item.querySelector("i") as HTMLSpanElement;
            const $label = $item.querySelector("span") as HTMLSpanElement;

            $li.id = `menu-item__${item.name}`;
            $anchor.href = item.href;
            if (item.spa) {
                $anchor.addEventListener("click", e => {
                    e.preventDefault();
                    window.history.pushState({}, "", $anchor.href);
                    window.dispatchEvent(new Event("popstate"));
                    this.selected = item.name;
                });
            }
            if (item.selected) {
                $anchor.classList.add("selected");
            }
            $anchor.title = item.label;
            $icon.innerText = item.icon;
            $label.innerText = item.label;

            this.$menu.appendChild($item);
        });
    }
}

window.customElements.define("pj-nav", Nav);