import { Mutex, debounce } from "../utils.js";

// import materialIcons from "../html/material-icons-link.html";
// import globe from "../../assets/world.svg";

export type Breakpoints = {
    minHeight: number;
    minWidth: number;
}

class Breakpointer {
    heightMatcher: MediaQueryList;
    widthMatcher: MediaQueryList;

    constructor(breakpoints: Breakpoints) {
        this.heightMatcher = matchMedia(`(min-height: ${breakpoints.minHeight}px)`);
        this.widthMatcher = matchMedia(`(min-width: ${breakpoints.minWidth}px)`);
    }

    addHandler(handler: (h: boolean, w: boolean) => void): void {
        const job = () => handler(
            this.heightMatcher.matches,
            this.widthMatcher.matches,
        );

        this.heightMatcher.addEventListener("change", job);
        this.widthMatcher.addEventListener("change", job);
        job();
    }
}

const template = document.getElementById("layout-template") as
    HTMLTemplateElement;

const DIVIDER = Symbol();
export {
    DIVIDER
}

type DrawerSide = "left"|"right";
type ClasslistMethod = "toggle"|"add"|"remove";


export default class Layout extends HTMLElement {

    private _content: DocumentFragment;
    
    $mainTitle: HTMLElement;
    $contextMenu: HTMLElement;
    $loadingModal: HTMLElement;
    $modal: HTMLElement;

    $header: HTMLElement;
    $footer: HTMLElement;

    $drawers: {
        left: HTMLElement;
        right: HTMLElement;
    }
    breakpointer: Breakpointer;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this._content =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$mainTitle =
            this._content.getElementById("main-title") as
                HTMLElement;

        this.$contextMenu =
            this._content.getElementById("context-menu") as
                HTMLElement;

        this.$loadingModal =
            this._content.getElementById("loading-modal") as
                HTMLElement;

        this.$header =
            this._content.getElementById("header-wrapper") as
                HTMLElement;
        this.$footer =
            this._content.getElementById("footer") as
                HTMLElement;

        this.$drawers = {
            left: this._content.getElementById("left-drawer") as
                HTMLElement,
            right: this._content.getElementById("right-drawer") as
                HTMLElement,
        };

        this.$modal =
            this._content.getElementById("modal") as
                HTMLElement;

        const drawerWidth = 500;
        const bottomNavHeight = 600;
        this.breakpointer = new Breakpointer({
            minHeight: bottomNavHeight,
            minWidth: drawerWidth,
        });

        this.bindDrawerListeners();
        this.bindAnimatedHeader();
        this.bindLoading();
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this._content);
        this.breakpointer.addHandler(this.handleBreakpoints.bind(this));
    }

    handleBreakpoints(minHeight: boolean, minWidth: boolean) {
        this.$footer.classList[
            minWidth ? "add" : "remove"
        ]("padded");

        this.$contextMenu.classList[
            minWidth ? "remove" : "add"
        ]("hidden");
    }

    bindLoading() {
        let loadingCount = 0;
        const mutex = new Mutex;

        this.addEventListener("loading-start", (async (e) => {
            const unlock = await mutex.lock();
            loadingCount++;
            this.$loadingModal.classList.add("show");
            unlock();
        }));

        this.addEventListener("loading-end", (async (e) => {
            const unlock = await mutex.lock();
            if (--loadingCount <= 0) {
                this.$loadingModal.classList.remove("show");
                loadingCount = 0;
            }
            unlock();
        }));
    }

    bindAnimatedHeader() {
        let lastWinTop = 0;
        window.addEventListener("scroll", debounce(() => {
            const headerHeight = this.$header.offsetHeight;
            const classList = this.$header.classList;
            const winTop = window.scrollY;
            if (winTop < 1) {
                classList.remove("sticky");
                classList.remove("hidden");
                classList.remove("hidden-transition");
            } else if (winTop < lastWinTop) {
                classList.add("sticky");
                classList.remove("hidden");
                if (lastWinTop > headerHeight)
                    classList.add("hidden-transition");
            } else if (winTop > headerHeight && winTop > lastWinTop) {
                classList.remove("sticky");
                classList.add("hidden");
            }

            this.$footer.className = "";
            classList.forEach(x => {
                if (x !== "padded")
                    this.$footer.classList.add(x)
            });

            lastWinTop = winTop;
        }, 10));
    }

    bindDrawerListeners() {
        this.$drawers.left.addEventListener("click", e => this.handleCloseClick(e, "left"));
        this.$modal.addEventListener("click", e => this.closeDrawers());
        window.addEventListener("keyup", e => {
            if (e.key === "Escape")
                this.closeDrawers();
        });
        this.addEventListener("layout-drawer-toggle", (e: Event) => {
            const {which, action} = (e as CustomEvent).detail;
            this.toggleDrawer(which, action);
        });
    }

    closeDrawers() {
        this.closeDrawer("left");
        this.closeDrawer("right");
    }
    toggleDrawer(which: DrawerSide, action: ClasslistMethod = "toggle") {
        this.$drawers[which].classList[action]("open");
        this.$modal.classList[action]("show");
        document.documentElement.classList[action]("modal");
    }
    closeDrawer(which: DrawerSide) { this.toggleDrawer(which, "remove"); }
    openDrawer(which: DrawerSide) { this.toggleDrawer(which, "add"); }

    handleCloseClick(e: Event, which: DrawerSide = "left", force?: boolean) {
        const $target = e.target as Element;
        if (!force && $target.slot === `${which}-drawer`)
            return;
        this.closeDrawer(which);
    }

    set title(src: string) {
        this.$mainTitle.innerHTML = src;
    }

    /**
     * `src` here is HTML that might be an SVG or an `img` tag with `src`
     * attribute set appropriately, etc.
     */
    set loadingModalImg(src: string) {
        this.$loadingModal.innerHTML = src;
    }
}

window.customElements.define("pj-layout", Layout);