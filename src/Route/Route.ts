/**
 * class designed to take a `path` and a `pattern` and answer the questions:
 * 
 * Am I the active route? (Answered by `this.active === true`)
 * if active:
 *     Do I have sub-routes? (Answered by `this.tail !== void 0`)
 * 
 * These are recursive: `this.tail` provides the next `path`
 * to a possible subroute.
 * 
 * e.g., ```javascript
 * // window.location.pathname === "/posts/123/edit";
 * const route = new Route("/posts/:id");
 * if (route.active) {
 *     if (route.tail) {
 *         // handle subroute
 *         const id = router.data.id;
 *         const subroute = new Route("/:action", route.tail);
 *         switch (subroute.data?.action) {
 *         // ... ?
 *         }
 *     } else {
 *         // ... ?
 *     }
 * }
 * 
 * ```
 */
export default class Route {
    private _pattern: string = "";
    private _path: string = "";
    private _data: Record<string,string> = {};
    private _active: boolean = false;
    private _tail: string = "";

    /**
     * When constructed, the instance will always have a value for both `path`
     * and `pattern`, but we only want to `init` once, so we don't set
     * `this.path`, but `this._path` to ensure that we only `init` once.
     * 
     * After this, the instance will re-`init` whenever `this.path` or
     * `this.pattern` are set extrinsically.
     */
    constructor(pattern?: string, path?: string) {
        this._path = path !== void 0
            ? path
            : window.location.pathname;

        this.pattern = pattern || this._pattern;
    }

    get pattern() {
        return this._pattern;
    }

    set pattern(x: string) {
        this._pattern = x;
        this._init();
    }

    get path() {
        return this._path;
    }

    set path(x: string) {
        this._path = x;
        this._init();
    }

    /**
     * `init`'s job is to determine whether this route is active, and to
     * construct the tail based on the given pattern.
     * 
     * A pattern takes the form "/foo/:bar/baz" or "/:foo" or "/foo", etc.
     * The tail is the part of the path that begins after the first part of the
     * path that matches the `pattern`.
     * 
     * If it's not a match, `active` is false, and the tail accessor will
     * provide `null`.
     * 
     * `data` will be cached from the route as it's parsed, even if ultimately
     * there's no match, but the `get data` accessor will provide `null` if the
     * route isn't `active`, so those "cached" values will be inert.
     */
    private _init() {
        const pathParts = this.path.split("/");
        const patternParts = this.pattern.split("/");

        this._data = {};
        this._tail = "";
        
        this._active = patternParts.every(
            (x, idx) => {
                if (x.length > 1 && x.startsWith(":")) {
                    const part = pathParts[idx];
                    return (
                        this._data[x.substring(1)] =
                            part && decodeURIComponent(part)
                    );
                } else {
                    return x === pathParts[idx];
                }
            }
        );

        this._tail = pathParts.slice(patternParts.length).join("/");
    }

    get active() {
        return this._active;
    }

    get data() {
        return this._active
            ? this._data
            : null;
    }

    get tail() {
        return !this._active
            ? null
            : !this._tail.length
            ? null
            : `/${this._tail}`;
    }
}