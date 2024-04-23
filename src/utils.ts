export class Mutex {

    private _current: Promise<void>;

    constructor() {
        this._current = Promise.resolve();
    }

    lock() {
        let _resolve: () => void;

        const p = new Promise(resolve => {
            _resolve = () => resolve(void 0);
        });
        // Caller gets a promise that resolves when the current outstanding
        // lock resolves
        const rv = this._current.then(() => _resolve);
        // Don't allow the next request until the new promise is done
        this._current = p as Promise<void>;
        // Return the new promise
        return rv;
    };
}


export const debounce = (func: CallableFunction, ms: number) => {
	let timeout: any;
	return (...args: any[]) => {
		const later = () => {
			timeout = null;
            func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, ms);
	};
};

export const redirect = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
};