
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Skeleton\Header.svelte generated by Svelte v3.48.0 */

    const file$6 = "src\\Skeleton\\Header.svelte";

    function create_fragment$7(ctx) {
    	let header;
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "About me";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "My projects";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Contact me";
    			attr_dev(a0, "href", "#aboutme");
    			add_location(a0, file$6, 3, 33, 136);
    			attr_dev(li0, "class", "header__link");
    			add_location(li0, file$6, 3, 8, 111);
    			attr_dev(a1, "href", "#myprojects");
    			add_location(a1, file$6, 4, 33, 207);
    			attr_dev(li1, "class", "header__link");
    			add_location(li1, file$6, 4, 8, 182);
    			attr_dev(a2, "href", "#contactme");
    			add_location(a2, file$6, 5, 33, 284);
    			attr_dev(li2, "class", "header__link");
    			add_location(li2, file$6, 5, 8, 259);
    			attr_dev(ul, "class", "header__links");
    			add_location(ul, file$6, 2, 6, 75);
    			attr_dev(nav, "class", "header__nav");
    			add_location(nav, file$6, 1, 4, 42);
    			attr_dev(header, "class", "header card bg-blue");
    			add_location(header, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Skeleton\Main\AboutMe.svelte generated by Svelte v3.48.0 */

    const file$5 = "src\\Skeleton\\Main\\AboutMe.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let figure;
    	let a;
    	let img;
    	let img_src_value;
    	let t2;
    	let figcaption;
    	let h3;
    	let t4;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "About me";
    			t1 = space();
    			div0 = element("div");
    			figure = element("figure");
    			a = element("a");
    			img = element("img");
    			t2 = space();
    			figcaption = element("figcaption");
    			h3 = element("h3");
    			h3.textContent = "Ivan Chebykin";
    			t4 = space();
    			p = element("p");
    			p.textContent = "I love coding 👨‍💻, playing guitar 🎸 and speaking to people 🗣️. My\r\n          stack of technologies: python, java, web (html, css, js).";
    			attr_dev(h2, "id", "aboutme");
    			add_location(h2, file$5, 1, 4, 43);
    			if (!src_url_equal(img.src, img_src_value = "img/myself.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "photo of myself");
    			attr_dev(img, "class", "about-me__img");
    			add_location(img, file$5, 5, 10, 196);
    			attr_dev(a, "href", "#aboutme");
    			add_location(a, file$5, 4, 8, 165);
    			add_location(h3, file$5, 12, 10, 395);
    			attr_dev(figcaption, "class", "about-me__figcaption");
    			add_location(figcaption, file$5, 11, 8, 342);
    			add_location(p, file$5, 14, 8, 450);
    			attr_dev(figure, "class", "about-me__figure");
    			add_location(figure, file$5, 3, 6, 122);
    			attr_dev(div0, "class", "about-me__description");
    			add_location(div0, file$5, 2, 4, 79);
    			attr_dev(div1, "class", "about-me card bg-yellow");
    			add_location(div1, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, figure);
    			append_dev(figure, a);
    			append_dev(a, img);
    			append_dev(figure, t2);
    			append_dev(figure, figcaption);
    			append_dev(figcaption, h3);
    			append_dev(figure, t4);
    			append_dev(figure, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AboutMe', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AboutMe> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class AboutMe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutMe",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Skeleton\Main\MyProjects.svelte generated by Svelte v3.48.0 */

    const file$4 = "src\\Skeleton\\Main\\MyProjects.svelte";

    function create_fragment$5(ctx) {
    	let div17;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let div16;
    	let div5;
    	let figure0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let figcaption0;
    	let div0;
    	let span0;
    	let t6;
    	let div1;
    	let p1;
    	let t8;
    	let div4;
    	let div2;
    	let a1;
    	let t10;
    	let div3;
    	let a2;
    	let t12;
    	let div10;
    	let figure1;
    	let a3;
    	let img1;
    	let img1_src_value;
    	let t13;
    	let figcaption1;
    	let div6;
    	let span1;
    	let t15;
    	let div7;
    	let p2;
    	let t17;
    	let div9;
    	let div8;
    	let a4;
    	let t19;
    	let div15;
    	let figure2;
    	let a5;
    	let img2;
    	let img2_src_value;
    	let t20;
    	let figcaption2;
    	let div11;
    	let span2;
    	let t22;
    	let div12;
    	let p3;
    	let t24;
    	let div14;
    	let div13;
    	let a6;

    	const block = {
    		c: function create() {
    			div17 = element("div");
    			h2 = element("h2");
    			h2.textContent = "My projects";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "All further projects were made in team";
    			t3 = space();
    			div16 = element("div");
    			div5 = element("div");
    			figure0 = element("figure");
    			a0 = element("a");
    			img0 = element("img");
    			t4 = space();
    			figcaption0 = element("figcaption");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "TheQuiz";
    			t6 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "TheQuiz - is game, made on python";
    			t8 = space();
    			div4 = element("div");
    			div2 = element("div");
    			a1 = element("a");
    			a1.textContent = "github";
    			t10 = space();
    			div3 = element("div");
    			a2 = element("a");
    			a2.textContent = "youtube";
    			t12 = space();
    			div10 = element("div");
    			figure1 = element("figure");
    			a3 = element("a");
    			img1 = element("img");
    			t13 = space();
    			figcaption1 = element("figcaption");
    			div6 = element("div");
    			span1 = element("span");
    			span1.textContent = "GoGreen";
    			t15 = space();
    			div7 = element("div");
    			p2 = element("p");
    			p2.textContent = "GoGreen - is backend of further website, made on java";
    			t17 = space();
    			div9 = element("div");
    			div8 = element("div");
    			a4 = element("a");
    			a4.textContent = "github";
    			t19 = space();
    			div15 = element("div");
    			figure2 = element("figure");
    			a5 = element("a");
    			img2 = element("img");
    			t20 = space();
    			figcaption2 = element("figcaption");
    			div11 = element("div");
    			span2 = element("span");
    			span2.textContent = "Tetropentada";
    			t22 = space();
    			div12 = element("div");
    			p3 = element("p");
    			p3.textContent = "Tetropentada - is alternative website of brainly.com";
    			t24 = space();
    			div14 = element("div");
    			div13 = element("div");
    			a6 = element("a");
    			a6.textContent = "github";
    			attr_dev(h2, "id", "myprojects");
    			add_location(h2, file$4, 1, 4, 45);
    			add_location(p0, file$4, 2, 4, 87);
    			if (!src_url_equal(img0.src, img0_src_value = "img/my-projects/the_quiz.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "project__img");
    			add_location(img0, file$4, 7, 13, 279);
    			attr_dev(a0, "href", "#myprojects");
    			add_location(a0, file$4, 6, 10, 243);
    			add_location(span0, file$4, 14, 14, 517);
    			attr_dev(div0, "class", "project__name");
    			add_location(div0, file$4, 13, 12, 474);
    			add_location(p1, file$4, 17, 14, 621);
    			attr_dev(div1, "class", "project__description");
    			add_location(div1, file$4, 16, 12, 571);
    			attr_dev(a1, "href", "https://github.com/CicadaInc/thequiz");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			add_location(a1, file$4, 21, 16, 784);
    			attr_dev(div2, "class", "project__link");
    			add_location(div2, file$4, 20, 14, 739);
    			attr_dev(a2, "href", "https://youtu.be/VA0tBxHlNO4");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "rel", "noopener noreferrer");
    			add_location(a2, file$4, 29, 16, 1061);
    			attr_dev(div3, "class", "project__link");
    			add_location(div3, file$4, 28, 14, 1016);
    			attr_dev(div4, "class", "project__links");
    			add_location(div4, file$4, 19, 12, 695);
    			attr_dev(figcaption0, "class", "project_figcaption");
    			add_location(figcaption0, file$4, 12, 10, 421);
    			attr_dev(figure0, "class", "project__figure");
    			add_location(figure0, file$4, 5, 8, 199);
    			attr_dev(div5, "class", "project");
    			add_location(div5, file$4, 4, 6, 168);
    			if (!src_url_equal(img1.src, img1_src_value = "img/my-projects/go-green.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "project__img");
    			add_location(img1, file$4, 43, 13, 1467);
    			attr_dev(a3, "href", "#myprojects");
    			add_location(a3, file$4, 42, 10, 1431);
    			add_location(span1, file$4, 50, 14, 1705);
    			attr_dev(div6, "class", "project__name");
    			add_location(div6, file$4, 49, 12, 1662);
    			add_location(p2, file$4, 53, 14, 1809);
    			attr_dev(div7, "class", "project__description");
    			add_location(div7, file$4, 52, 12, 1759);
    			attr_dev(a4, "href", "https://github.com/Vldmr314/GoGreen");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "rel", "noopener noreferrer");
    			add_location(a4, file$4, 57, 16, 1992);
    			attr_dev(div8, "class", "project__link");
    			add_location(div8, file$4, 56, 14, 1947);
    			attr_dev(div9, "class", "project__links");
    			add_location(div9, file$4, 55, 12, 1903);
    			attr_dev(figcaption1, "class", "project_figcaption");
    			add_location(figcaption1, file$4, 48, 10, 1609);
    			attr_dev(figure1, "class", "project__figure");
    			add_location(figure1, file$4, 41, 8, 1387);
    			attr_dev(div10, "class", "project");
    			add_location(div10, file$4, 40, 6, 1356);
    			if (!src_url_equal(img2.src, img2_src_value = "img/my-projects/no_image.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "project__img");
    			add_location(img2, file$4, 71, 13, 2404);
    			attr_dev(a5, "href", "#myprojects");
    			add_location(a5, file$4, 70, 10, 2368);
    			add_location(span2, file$4, 78, 14, 2642);
    			attr_dev(div11, "class", "project__name");
    			add_location(div11, file$4, 77, 12, 2599);
    			add_location(p3, file$4, 81, 14, 2751);
    			attr_dev(div12, "class", "project__description");
    			add_location(div12, file$4, 80, 12, 2701);
    			attr_dev(a6, "href", "https://github.com/CicadaInc/tetropentada");
    			attr_dev(a6, "target", "_blank");
    			attr_dev(a6, "rel", "noopener noreferrer");
    			add_location(a6, file$4, 85, 16, 2933);
    			attr_dev(div13, "class", "project__link");
    			add_location(div13, file$4, 84, 14, 2888);
    			attr_dev(div14, "class", "project__links");
    			add_location(div14, file$4, 83, 12, 2844);
    			attr_dev(figcaption2, "class", "project_figcaption");
    			add_location(figcaption2, file$4, 76, 10, 2546);
    			attr_dev(figure2, "class", "project__figure");
    			add_location(figure2, file$4, 69, 8, 2324);
    			attr_dev(div15, "class", "project");
    			add_location(div15, file$4, 68, 6, 2293);
    			attr_dev(div16, "class", "projects");
    			add_location(div16, file$4, 3, 4, 138);
    			attr_dev(div17, "class", "my-projects card bg-green");
    			add_location(div17, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div17, anchor);
    			append_dev(div17, h2);
    			append_dev(div17, t1);
    			append_dev(div17, p0);
    			append_dev(div17, t3);
    			append_dev(div17, div16);
    			append_dev(div16, div5);
    			append_dev(div5, figure0);
    			append_dev(figure0, a0);
    			append_dev(a0, img0);
    			append_dev(figure0, t4);
    			append_dev(figure0, figcaption0);
    			append_dev(figcaption0, div0);
    			append_dev(div0, span0);
    			append_dev(figcaption0, t6);
    			append_dev(figcaption0, div1);
    			append_dev(div1, p1);
    			append_dev(figcaption0, t8);
    			append_dev(figcaption0, div4);
    			append_dev(div4, div2);
    			append_dev(div2, a1);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, a2);
    			append_dev(div16, t12);
    			append_dev(div16, div10);
    			append_dev(div10, figure1);
    			append_dev(figure1, a3);
    			append_dev(a3, img1);
    			append_dev(figure1, t13);
    			append_dev(figure1, figcaption1);
    			append_dev(figcaption1, div6);
    			append_dev(div6, span1);
    			append_dev(figcaption1, t15);
    			append_dev(figcaption1, div7);
    			append_dev(div7, p2);
    			append_dev(figcaption1, t17);
    			append_dev(figcaption1, div9);
    			append_dev(div9, div8);
    			append_dev(div8, a4);
    			append_dev(div16, t19);
    			append_dev(div16, div15);
    			append_dev(div15, figure2);
    			append_dev(figure2, a5);
    			append_dev(a5, img2);
    			append_dev(figure2, t20);
    			append_dev(figure2, figcaption2);
    			append_dev(figcaption2, div11);
    			append_dev(div11, span2);
    			append_dev(figcaption2, t22);
    			append_dev(figcaption2, div12);
    			append_dev(div12, p3);
    			append_dev(figcaption2, t24);
    			append_dev(figcaption2, div14);
    			append_dev(div14, div13);
    			append_dev(div13, a6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div17);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MyProjects', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MyProjects> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MyProjects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MyProjects",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Skeleton\Main\ContactMe.svelte generated by Svelte v3.48.0 */

    const file$3 = "src\\Skeleton\\Main\\ContactMe.svelte";

    function create_fragment$4(ctx) {
    	let div3;
    	let h2;
    	let t1;
    	let div2;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let div1;
    	let a1;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Contact me";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t2 = space();
    			div1 = element("div");
    			a1 = element("a");
    			img1 = element("img");
    			attr_dev(h2, "id", "contactme");
    			add_location(h2, file$3, 1, 4, 42);
    			if (!src_url_equal(img0.src, img0_src_value = "img/contact-me/github.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "github");
    			attr_dev(img0, "class", "contact-me__img");
    			add_location(img0, file$3, 9, 10, 295);
    			attr_dev(a0, "href", "https://github.com/doechon");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			add_location(a0, file$3, 4, 8, 161);
    			attr_dev(div0, "class", "contact-me__link");
    			add_location(div0, file$3, 3, 6, 121);
    			if (!src_url_equal(img1.src, img1_src_value = "img/contact-me/telegram.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "telegram");
    			attr_dev(img1, "class", "contact-me__img");
    			add_location(img1, file$3, 22, 10, 625);
    			attr_dev(a1, "href", "https://t.me/doechon");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			add_location(a1, file$3, 17, 8, 497);
    			attr_dev(div1, "class", "contact-me__link");
    			add_location(div1, file$3, 16, 6, 457);
    			attr_dev(div2, "class", "contact-me__links");
    			add_location(div2, file$3, 2, 4, 82);
    			attr_dev(div3, "class", "contact-me card bg-red");
    			add_location(div3, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h2);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContactMe', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContactMe> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ContactMe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactMe",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* src\Skeleton\Main\Quote.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file$2 = "src\\Skeleton\\Main\\Quote.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (44:4) {#each $drinkNames as drinkName}
    function create_each_block(ctx) {
    	let li;
    	let t_value = /*drinkName*/ ctx[3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 44, 6, 1243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$drinkNames*/ 2 && t_value !== (t_value = /*drinkName*/ ctx[3] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(44:4) {#each $drinkNames as drinkName}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let ul;
    	let each_value = /*$drinkNames*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Just name of random cocktail";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$2, 41, 4, 1150);
    			add_location(ul, file$2, 42, 4, 1193);
    			add_location(main, file$2, 40, 2, 1138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$drinkNames*/ 2) {
    				each_value = /*$drinkNames*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $drinkNames,
    		$$unsubscribe_drinkNames = noop,
    		$$subscribe_drinkNames = () => ($$unsubscribe_drinkNames(), $$unsubscribe_drinkNames = subscribe(drinkNames, $$value => $$invalidate(1, $drinkNames = $$value)), drinkNames);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_drinkNames());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Quote', slots, []);
    	const apiData = writable([]);

    	const drinkNames = derived(apiData, $apiData => {
    		if ($apiData.drinks) {
    			return $apiData.drinks.map(drink => drink.strDrink);
    		}

    		return [];
    	});

    	validate_store(drinkNames, 'drinkNames');
    	$$subscribe_drinkNames();

    	onMount(async () => {
    		fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php").then(response => response.json()).then(data => {
    			console.log(data);
    			apiData.set(data);
    		}).catch(error => {
    			console.log(error);
    			return [];
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Quote> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		writable,
    		derived,
    		apiData,
    		drinkNames,
    		$drinkNames
    	});

    	return [drinkNames, $drinkNames, apiData];
    }

    class Quote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { apiData: 2, drinkNames: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quote",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get apiData() {
    		return this.$$.ctx[2];
    	}

    	set apiData(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get drinkNames() {
    		return this.$$.ctx[0];
    	}

    	set drinkNames(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Skeleton\Fotter.svelte generated by Svelte v3.48.0 */

    const file$1 = "src\\Skeleton\\Fotter.svelte";

    function create_fragment$2(ctx) {
    	let footer;
    	let small;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			small = element("small");
    			small.textContent = "© Copyright 2022, Ivan Chebykin";
    			add_location(small, file$1, 1, 4, 29);
    			attr_dev(footer, "class", "footer svelte-btvup3");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, small);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fotter', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fotter> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Fotter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fotter",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Style.svelte generated by Svelte v3.48.0 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Style', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Style> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Style extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Style",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let div;
    	let aboutme;
    	let t1;
    	let myprojects;
    	let t2;
    	let contactme;
    	let t3;
    	let quote;
    	let t4;
    	let fotter;
    	let current;
    	header = new Header({ $$inline: true });
    	aboutme = new AboutMe({ $$inline: true });
    	myprojects = new MyProjects({ $$inline: true });
    	contactme = new ContactMe({ $$inline: true });
    	quote = new Quote({ $$inline: true });
    	fotter = new Fotter({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(aboutme.$$.fragment);
    			t1 = space();
    			create_component(myprojects.$$.fragment);
    			t2 = space();
    			create_component(contactme.$$.fragment);
    			t3 = space();
    			create_component(quote.$$.fragment);
    			t4 = space();
    			create_component(fotter.$$.fragment);
    			attr_dev(div, "class", "main");
    			add_location(div, file, 11, 1, 392);
    			add_location(main, file, 9, 0, 373);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			append_dev(main, div);
    			mount_component(aboutme, div, null);
    			append_dev(div, t1);
    			mount_component(myprojects, div, null);
    			append_dev(div, t2);
    			mount_component(contactme, div, null);
    			append_dev(div, t3);
    			mount_component(quote, div, null);
    			append_dev(main, t4);
    			mount_component(fotter, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(aboutme.$$.fragment, local);
    			transition_in(myprojects.$$.fragment, local);
    			transition_in(contactme.$$.fragment, local);
    			transition_in(quote.$$.fragment, local);
    			transition_in(fotter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(aboutme.$$.fragment, local);
    			transition_out(myprojects.$$.fragment, local);
    			transition_out(contactme.$$.fragment, local);
    			transition_out(quote.$$.fragment, local);
    			transition_out(fotter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(aboutme);
    			destroy_component(myprojects);
    			destroy_component(contactme);
    			destroy_component(quote);
    			destroy_component(fotter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		AboutMe,
    		MyProjects,
    		ContactMe,
    		Quote,
    		Fotter,
    		Style
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
