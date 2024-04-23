import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";


const template = document.getElementById("ecg-ticker-template") as
    HTMLTemplateElement;

enum Attributes {
    HEART_RATE = "heart-rate",
}

export default class ECGTicker extends HTMLElement {
    static observedAttributes = [Attributes.HEART_RATE];

    private _content: DocumentFragment;
    $canvasContainer: HTMLElement;

    constructor() {
        super();

        this.attachShadow({mode: "open"});
        this._content = template.content.cloneNode(true) as DocumentFragment;
        this.$canvasContainer = this._content.getElementById("canvas-container")!;
    }

    connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.appendChild(this._content);
        } else {
            console.warn("No shadowRoot detected.");
        }

        this.initECGAnimation();
    }

    initECGAnimation() {
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(200, 300);
        this.$canvasContainer.appendChild(renderer.domElement);

        const scene = new THREE.Scene();

        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const orbit = new OrbitControls(camera, renderer.domElement);

        camera.position.set(1, 2, 5);
        orbit.update();

        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const boxMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        scene.add(box);

        let heart_amp = 0.0;

        function animate(x) {
            let sr = 120;
            let freq = 20;

            box.position.x = 0.01 * Math.sin(2 * Math.PI * freq * (x / sr));
            box.position.y = 0.02 * Math.sin(2 * Math.PI * (freq/2) * (x / sr));
            // box.position.z = 0.05 * Math.sin(2 * Math.PI * (freq/3) * (x / sr));
            box.position.z = heart_amp * 1;
            box.rotation.set(x/2000, x/2000, 0);
            // camera.position.x = 1 * Math.sin(2 * Math.PI * (freq/6) * (x / sr));
            // camera.position.y = 2 * Math.sin(2 * Math.PI * (freq/11) * (x / sr));
            // camera.position.z = 1 + Math.abs(15 * Math.sin(2 * Math.PI * (freq/75) * (x / sr)));

            renderer.render(scene, camera);
        }

        // const socket = new WebSocket(`${location.protocol === "https" ? "wss" : "ws"}://${location.hostname}:7890/ecg`);
        const socket = new WebSocket(`ws://localhost:7890/ecg`);
        socket.onmessage = (({data}) => {
            heart_amp = data;
            console.log(heart_amp);

        });

        renderer.setAnimationLoop(animate);
    }

    attributeChangedCallback(name: string, _prev: string, curr: string) {
        if (Attributes.HEART_RATE === name) {
            // send message via websocket to alter heart rate in real time
        }
    }
};

window.customElements.define("ecg-ticker", ECGTicker);

export {};