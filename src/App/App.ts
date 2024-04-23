import "/Pages/Pages.js";
import Pages from "../Pages/Pages.js";

import "../Layout/Layout.js";
import Layout from "../Layout/Layout.js";

import "../Nav/Nav.js";
import Nav, { MenuItem } from "../Nav/Nav.js";

import Route from "../Route/Route.js";
import * as utils from "../utils.js";

import "../MyCard/MyCard.js";

// import materialIcons from "../../material-icons-link.html";
// import commonCSS from "../styles/common.css";
// import logo from "../../assets/logo.svg";

const template = document.getElementById("app-template") as
    HTMLTemplateElement;

const navigationItems: MenuItem[] = [
    {
        name: "cards",
        label: "Cards",
        href: "/cards/",
        icon: "library_books",
        spa: true,
    },
    {
        name: "patients",
        label: "Patients",
        href: "/patients/",
        icon: "face",
        spa: true,
    },
];

enum Event {
    BAD_ROUTE = "pj:bad-route",
}

window.customElements.define("pj-app", class extends HTMLElement {
    private _content: DocumentFragment;
    $nav: Nav;
    $layout: Layout;
    $mainMenuButton: HTMLAnchorElement;
    $pages: Pages;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this._content = template.content.cloneNode(true) as
            DocumentFragment;

        this.$layout =
            this._content.getElementById("layout") as
                Layout;
        this.$nav =
            this._content.getElementById("nav") as
                Nav;
        this.$mainMenuButton =
            this._content.getElementById("main-menu") as
                HTMLAnchorElement;
        this.$pages =
            this._content.getElementById("pages") as
                Pages;

        // (this._content.getElementById("logo") as HTMLElement).innerHTML = logo;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this._content);

        this.bind();

        this.route(window.location.pathname);
    }

    bind() {
        this.addEventListener(Event.BAD_ROUTE, e => {
            this.$pages.select((e as CustomEvent).detail);
        });

        this.$mainMenuButton.addEventListener("click", e => {
            this.$layout.openDrawer("right");
        });

        this.initNavigation(navigationItems);
        this.initRouting();
        this.initMedTraceRequirement();
    }

    initMedTraceRequirement() {
        const cards = this.shadowRoot!.querySelectorAll("my-card");
        const $myButton = this.shadowRoot!.getElementById("my-button");

        $myButton?.addEventListener("click", () => {
            const msg = "button clicked";

            for (const $card of cards) {
                $card.setAttribute(
                    "message",
                    $card.getAttribute("message") === msg
                        ? ""
                        : msg,
                );
            }
        });
    }

    initRouting() {
        window.addEventListener("popstate", e => {
            // console.log("Dapp/top-level: popstate", window.location.href);
            this.route(window.location.pathname);
            this.$layout.closeDrawer("right");
        });
    }

    navRelocate(
        screenTallEnoughForFooterNav: boolean,
        screenWideEnoughForDrawer: boolean,
    ) {
        if (screenWideEnoughForDrawer) {
            this.$nav.slot = "right-drawer";
            this.$nav.setAttribute("display-mode", "stack");
        } else if (screenTallEnoughForFooterNav) {
            this.$nav.slot = "footer";
            this.$nav.setAttribute("display-mode", "flex");
        } else {
            this.$nav.slot = "right-drawer";
            this.$nav.setAttribute("display-mode", "stack");
        }

        if (this.$nav.slot === "right-drawer") {
            this.$mainMenuButton.classList.remove("hidden");
        } else {
            this.$mainMenuButton.classList.add("hidden");
            this.$layout.closeDrawer("right");
        }
    }

    initNavigation(navigationItems: MenuItem[]) {
        navigationItems.forEach(item => this.$nav.addItem(item));
        this.$nav.init();

        this.$layout.breakpointer.addHandler(this.navRelocate.bind(this));
    }

    async route(path?: string) {
        if (!path) {
            return this.$pages.select("not-found");
        }

        const route = new Route(`/:page`, path);
        const request = {
            // imbuer: this.imbuer,
            // accounts: this.accounts,
            // apiInfo: this.apiInfo,
        }

        console.log(path, route);

        if (!route.active) {
            /**
             * the path == `/app`, so we redirect to the default "app", which
             * is currently "/app/cards"
             */
            utils.redirect(
                this.getAttribute("default-route") || "/cards/"
            );
            return;
        }

        if (route.data?.page) {
            this.$nav.selected = route.data.page;
        }

        switch (route.data?.page) {
            case "cards":
                this.$pages.select("cards");
                // (this.$pages.selected as Cards).route(route.tail, request);
                break;
            case "patients":
                this.$pages.select("patients");
                // (this.$pages.selected as Patients).route(route.tail, request);
                break;
            default:
                this.$pages.select("not-found");
        }
    }
});