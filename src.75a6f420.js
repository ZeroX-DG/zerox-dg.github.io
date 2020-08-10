// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/mithril/render/vnode.js":[function(require,module,exports) {
"use strict"

function Vnode(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node == null || typeof node === "boolean") return null
	if (typeof node === "object") return node
	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
	var children = []
	if (input.length) {
		var isKeyed = input[0] != null && input[0].key != null
		// Note: this is a *very* perf-sensitive check.
		// Fun fact: merging the loop like this is somehow faster than splitting
		// it, noticeably so.
		for (var i = 1; i < input.length; i++) {
			if ((input[i] != null && input[i].key != null) !== isKeyed) {
				throw new TypeError("Vnodes must either always have keys or never have keys!")
			}
		}
		for (var i = 0; i < input.length; i++) {
			children[i] = Vnode.normalize(input[i])
		}
	}
	return children
}

module.exports = Vnode

},{}],"node_modules/mithril/render/hyperscriptVnode.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

// Call via `hyperscriptVnode.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript` and `fragment` factories and define this as
// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// module.exports = function(attrs, ...children) {
//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
//     } else {
//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
//         attrs = undefined
//     }
//
//     if (attrs == null) attrs = {}
//     return Vnode("", attrs.key, attrs, children)
// }
module.exports = function() {
	var attrs = arguments[this], start = this + 1, children

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = this
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}

	return Vnode("", attrs.key, attrs, children)
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js"}],"node_modules/mithril/render/hyperscript.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty

function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}

function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var children = Vnode.normalizeChildren(vnode.children)
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className

	vnode.tag = state.tag
	vnode.attrs = null
	vnode.children = undefined

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}

		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}

		attrs = newAttrs
	}

	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null

	if (hasClass) attrs.class = null

	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}

	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		vnode.text = children[0].children
	} else {
		vnode.children = children
	}

	return vnode
}

function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}

	var vnode = hyperscriptVnode.apply(1, arguments)

	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	vnode.tag = selector
	return vnode
}

module.exports = hyperscript

},{"../render/vnode":"node_modules/mithril/render/vnode.js","./hyperscriptVnode":"node_modules/mithril/render/hyperscriptVnode.js"}],"node_modules/mithril/render/trust.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js"}],"node_modules/mithril/render/fragment.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

module.exports = function() {
	var vnode = hyperscriptVnode.apply(0, arguments)

	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js","./hyperscriptVnode":"node_modules/mithril/render/hyperscriptVnode.js"}],"node_modules/mithril/hyperscript.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./render/hyperscript")

hyperscript.trust = require("./render/trust")
hyperscript.fragment = require("./render/fragment")

module.exports = hyperscript

},{"./render/hyperscript":"node_modules/mithril/render/hyperscript.js","./render/trust":"node_modules/mithril/render/trust.js","./render/fragment":"node_modules/mithril/render/fragment.js"}],"node_modules/mithril/promise/polyfill.js":[function(require,module,exports) {
"use strict"
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")

	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}

	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}

module.exports = PromisePolyfill

},{}],"node_modules/mithril/promise/promise.js":[function(require,module,exports) {
var global = arguments[3];
"use strict"

var PromisePolyfill = require("./polyfill")

if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = global.Promise
} else {
	module.exports = PromisePolyfill
}

},{"./polyfill":"node_modules/mithril/promise/polyfill.js"}],"node_modules/mithril/render/render.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function($window) {
	var $doc = $window && $window.document
	var currentRedraw

	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}

	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}

	//sanity check to discourage people from doing `vnode.state = ...`
	function checkState(vnode, original) {
		if (vnode.state !== original) throw new Error("`vnode.state` must not be modified")
	}

	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode` is the first argument in
	//all lifecycle methods.
	function callHook(vnode) {
		var original = vnode.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode, original)
		}
	}

	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": createText(parent, vnode, nextSibling); break
				case "<": createHTML(parent, vnode, ns, nextSibling); break
				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
				default: createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode, ns, nextSibling) {
		var match = vnode.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode.children
		}
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		// Capture nodes to remove, so we don't confuse them.
		vnode.instance = []
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			vnode.instance.push(child)
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs = vnode.attrs
		var is = attrs && attrs.is

		ns = getNameSpace(vnode) || ns

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element

		if (attrs != null) {
			setAttrs(vnode, attrs, ns)
		}

		insertNode(parent, element, nextSibling)

		if (!maybeSetContentEditable(vnode)) {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs)
			}
		}
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		initLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
		}
		else {
			vnode.domSize = 0
		}
	}

	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.

	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.

	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
	// over the new list and for each new vnode, find the corresponding vnode in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next sibling (cached in the `nextSibling` variable).


	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.

	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
		else {
			var isOldKeyed = old[0] != null && old[0].key != null
			var isKeyed = vnodes[0] != null && vnodes[0].key != null
			var start = 0, oldStart = 0
			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++
			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
			if (isOldKeyed !== isKeyed) {
				removeNodes(parent, old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(parent, o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(parent, old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o.key !== v.key) break
					oldStart++, start++
					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (start === end) break
					if (o.key !== ve.key || oe.key !== v.key) break
					topSibling = getNextSibling(old, oldStart, nextSibling)
					moveNodes(parent, oe, topSibling)
					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
					if (++start <= --end) moveNodes(parent, o, nextSibling)
					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldStart++; oldEnd--
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						var oldIndex = map[ve.key]
						if (oldIndex != null) {
							pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
							oldIndices[i-start] = oldIndex
							oe = old[oldIndex]
							old[oldIndex] = null
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
							if (ve.dom != null) nextSibling = ve.dom
							matched++
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else moveNodes(parent, v, nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode.events = old.events
			if (shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
		}
		else {
			removeNode(parent, old)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, ns, nextSibling) {
		if (old.children !== vnode.children) {
			removeHTML(parent, old)
			createHTML(parent, vnode, ns, nextSibling)
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
		}
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns

		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (!maybeSetContentEditable(vnode)) {
			if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
			}
			else {
				if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
				if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
				updateNodes(element, old.children, vnode.children, hooks, null, ns)
			}
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(parent, old.instance)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode = vnodes[start]
			if (vnode != null) {
				var key = vnode.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequece
	var lisTemp = []
	function makeLisIndices(a) {
		var result = [0]
		var u = 0, v = 0, i = 0
		var il = lisTemp.length = a.length
		for (var i = 0; i < il; i++) lisTemp[i] = a[i]
		for (var i = 0; i < il; ++i) {
			if (a[i] === -1) continue
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				lisTemp[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				// Fast integer average without overflow.
				// eslint-disable-next-line no-bitwise
				var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) lisTemp[i] = result[u - 1]
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = lisTemp[v]
		}
		lisTemp.length = 0
		return result
	}

	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}

	// This covers a really specific edge case:
	// - Parent node is keyed and contains child
	// - Child is removed, returns unresolved promise in `onbeforeremove`
	// - Parent node is moved in keyed diff
	// - Remaining children still need moved appropriately
	//
	// Ideally, I'd track removed nodes as well, but that introduces a lot more
	// complexity and I'm not exactly interested in doing that.
	function moveNodes(parent, vnode, nextSibling) {
		var frag = $doc.createDocumentFragment()
		moveChildToFrag(parent, frag, vnode)
		insertNode(parent, frag, nextSibling)
	}
	function moveChildToFrag(parent, frag, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				for (var i = 0; i < vnode.instance.length; i++) {
					frag.appendChild(vnode.instance[i])
				}
			} else if (vnode.tag !== "[") {
				// Don't recurse for text nodes *or* elements, just fragments
				frag.appendChild(vnode.dom)
			} else if (vnode.children.length === 1) {
				vnode = vnode.children[0]
				if (vnode != null) continue
			} else {
				for (var i = 0; i < vnode.children.length; i++) {
					var child = vnode.children[i]
					if (child != null) moveChildToFrag(parent, frag, child)
				}
			}
			break
		}
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}

	function maybeSetContentEditable(vnode) {
		if (vnode.attrs == null || (
			vnode.attrs.contenteditable == null && // attribute
			vnode.attrs.contentEditable == null // property
		)) return false
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
		return true
	}

	//remove
	function removeNodes(parent, vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) removeNode(parent, vnode)
		}
	}
	function removeNode(parent, vnode) {
		var mask = 0
		var original = vnode.state
		var stateResult, attrsResult
		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
			var result = callHook.call(vnode.state.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				mask = 1
				stateResult = result
			}
		}
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode.attrs.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				// eslint-disable-next-line no-bitwise
				mask |= 2
				attrsResult = result
			}
		}
		checkState(vnode, original)

		// If we can, try to fast-path it and avoid all the overhead of awaiting
		if (!mask) {
			onremove(vnode)
			removeChild(parent, vnode)
		} else {
			if (stateResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 1) { mask &= 2; if (!mask) reallyRemove() }
				}
				stateResult.then(next, next)
			}
			if (attrsResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 2) { mask &= 1; if (!mask) reallyRemove() }
				}
				attrsResult.then(next, next)
			}
		}

		function reallyRemove() {
			checkState(vnode, original)
			onremove(vnode)
			removeChild(parent, vnode)
		}
	}
	function removeHTML(parent, vnode) {
		for (var i = 0; i < vnode.instance.length; i++) {
			parent.removeChild(vnode.instance[i])
		}
	}
	function removeChild(parent, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				removeHTML(parent, vnode)
			} else {
				if (vnode.tag !== "[") {
					parent.removeChild(vnode.dom)
					if (!Array.isArray(vnode.children)) break
				}
				if (vnode.children.length === 1) {
					vnode = vnode.children[0]
					if (vnode != null) continue
				} else {
					for (var i = 0; i < vnode.children.length; i++) {
						var child = vnode.children[i]
						if (child != null) removeChild(parent, child)
					}
				}
			}
			break
		}
	}
	function onremove(vnode) {
		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode)
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode)
		if (typeof vnode.tag !== "string") {
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode, attrs, ns) {
		for (var key in attrs) {
			setAttr(vnode, key, null, attrs[key], ns)
		}
	}
	function setAttr(vnode, key, old, value, ns) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode.dom, old, value)
		else if (hasPropertyKey(vnode, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && vnode.dom === activeElement()) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
				/* eslint-enable no-implicit-coercion */
			}
			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
			if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value)
			else vnode.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode.dom.setAttribute(key, "")
				else vnode.dom.removeAttribute(key)
			}
			else vnode.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined)
		else if (key === "style") updateStyle(vnode.dom, old, null)
		else if (
			hasPropertyKey(vnode, key, ns)
			&& key !== "className"
			&& !(key === "value" && (
				vnode.tag === "option"
				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
			))
			&& !(vnode.tag === "input" && key === "type")
		) {
			vnode.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode, attrs) {
		if ("value" in attrs) {
			if(attrs.value === null) {
				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
			} else {
				var normalized = "" + attrs.value // eslint-disable-line no-implicit-coercion
				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
					vnode.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
	}
	function updateAttrs(vnode, old, attrs, ns) {
		if (attrs != null) {
			for (var key in attrs) {
				setAttr(vnode, key, old && old[key], attrs[key], ns)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(vnode, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw
	}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this["on" + ev.type]
		var result
		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev)
		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev)
		if (this._ && ev.redraw !== false) (0, this._)()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = value
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode.events = new EventDict()
			vnode.dom.addEventListener(key.slice(2), vnode.events, false)
			vnode.events[key] = value
		}
	}

	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		do {
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode.dom = old.dom
		vnode.domSize = old.domSize
		vnode.instance = old.instance
		// One would think having the actual latest attributes would be ideal,
		// but it doesn't let us properly diff based on our current internal
		// representation. We have to save not only the old DOM info, but also
		// the attributes used to create it, as we diff *that*, not against the
		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
		// need to save the children and text as they are conceptually not
		// unlike special "attributes" internally.
		vnode.attrs = old.attrs
		vnode.children = old.children
		vnode.text = old.text
		return true
	}

	return function(dom, vnodes, redraw) {
		if (!dom) throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI

		// First time rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""

		vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
		var prevRedraw = currentRedraw
		try {
			currentRedraw = typeof redraw === "function" ? redraw : undefined
			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		} finally {
			currentRedraw = prevRedraw
		}
		dom.vnodes = vnodes
		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js"}],"node_modules/mithril/render.js":[function(require,module,exports) {
"use strict"

module.exports = require("./render/render")(window)

},{"./render/render":"node_modules/mithril/render/render.js"}],"node_modules/mithril/api/mount-redraw.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(render, schedule, console) {
	var subscriptions = []
	var rendering = false
	var pending = false

	function sync() {
		if (rendering) throw new Error("Nested m.redraw.sync() call")
		rendering = true
		for (var i = 0; i < subscriptions.length; i += 2) {
			try { render(subscriptions[i], Vnode(subscriptions[i + 1]), redraw) }
			catch (e) { console.error(e) }
		}
		rendering = false
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root, component) {
		if (component != null && component.view == null && typeof component !== "function") {
			throw new TypeError("m.mount(element, component) expects a component, not a vnode")
		}

		var index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			render(root, [], redraw)
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js"}],"node_modules/mithril/mount-redraw.js":[function(require,module,exports) {
"use strict"

var render = require("./render")

module.exports = require("./api/mount-redraw")(render, requestAnimationFrame, console)

},{"./render":"node_modules/mithril/render.js","./api/mount-redraw":"node_modules/mithril/api/mount-redraw.js"}],"node_modules/mithril/querystring/build.js":[function(require,module,exports) {
"use strict"

module.exports = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}

},{}],"node_modules/mithril/pathname/assign.js":[function(require,module,exports) {
"use strict"

module.exports = Object.assign || function(target, source) {
	if(source) Object.keys(source).forEach(function(key) { target[key] = source[key] })
}

},{}],"node_modules/mithril/pathname/build.js":[function(require,module,exports) {
"use strict"

var buildQueryString = require("../querystring/build")
var assign = require("./assign")

// Returns `path` from `template` + `params`
module.exports = function(template, params) {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError("Template parameter names *must* be separated")
	}
	if (params == null) return template
	var queryIndex = template.indexOf("?")
	var hashIndex = template.indexOf("#")
	var queryEnd = hashIndex < 0 ? template.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = template.slice(0, pathEnd)
	var query = {}

	assign(query, params)

	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	var newQueryIndex = resolved.indexOf("?")
	var newHashIndex = resolved.indexOf("#")
	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	var result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
	var querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
	return result
}

},{"../querystring/build":"node_modules/mithril/querystring/build.js","./assign":"node_modules/mithril/pathname/assign.js"}],"node_modules/mithril/request/request.js":[function(require,module,exports) {
"use strict"

var buildPathname = require("../pathname/build")

module.exports = function($window, Promise, oncompletion) {
	var callbackCount = 0

	function PromiseProxy(executor) {
		return new Promise(executor)
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto

	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise = new Promise(function(resolve, reject) {
				factory(buildPathname(url, args.params), args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise) {
				var then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				promise.constructor = PromiseProxy
				promise.then = function() {
					count++
					var next = then.apply(promise, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}

	function hasHeader(args, name) {
		for (var key in args.headers) {
			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
		}
		return false
	}

	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var body = args.body
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData)
			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			var xhr = new $window.XMLHttpRequest(), aborted = false
			var original = xhr, replacedAbort
			var abort = xhr.abort

			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, /^content-type$/i)) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						var response = ev.target.response, message

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText)
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}
						if (success) resolve(response)
						else {
							try { message = ev.target.responseText }
							catch (e) { message = response }
							var error = new Error(message)
							error.code = ev.target.status
							error.response = response
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				resolve(data)
			}
			script.onerror = function() {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
			}
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
	}
}

},{"../pathname/build":"node_modules/mithril/pathname/build.js"}],"node_modules/mithril/request.js":[function(require,module,exports) {
"use strict"

var PromisePolyfill = require("./promise/promise")
var mountRedraw = require("./mount-redraw")

module.exports = require("./request/request")(window, PromisePolyfill, mountRedraw.redraw)

},{"./promise/promise":"node_modules/mithril/promise/promise.js","./mount-redraw":"node_modules/mithril/mount-redraw.js","./request/request":"node_modules/mithril/request/request.js"}],"node_modules/mithril/querystring/parse.js":[function(require,module,exports) {
"use strict"

module.exports = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	var entries = string.split("&"), counters = {}, data = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		var levels = key.split(/\]\[?|\[/)
		var cursor = data
		if (key.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			if (level === "") {
				var key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				level = counters[key]++
			}
			// Disallow direct prototype pollution
			else if (level === "__proto__") break
			if (j === levels.length - 1) cursor[level] = value
			else {
				// Read own properties exclusively to disallow indirect
				// prototype pollution
				var desc = Object.getOwnPropertyDescriptor(cursor, level)
				if (desc != null) desc = desc.value
				if (desc == null) cursor[level] = desc = isNumber ? [] : {}
				cursor = desc
			}
		}
	}
	return data
}

},{}],"node_modules/mithril/pathname/parse.js":[function(require,module,exports) {
"use strict"

var parseQueryString = require("../querystring/parse")

// Returns `{path, params}` from `url`
module.exports = function(url) {
	var queryIndex = url.indexOf("?")
	var hashIndex = url.indexOf("#")
	var queryEnd = hashIndex < 0 ? url.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1)
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}

},{"../querystring/parse":"node_modules/mithril/querystring/parse.js"}],"node_modules/mithril/pathname/compileTemplate.js":[function(require,module,exports) {
"use strict"

var parsePathname = require("./parse")

// Compiles a template into a function that takes a resolved path (without query
// strings) and returns an object containing the template parameters with their
// parsed values. This expects the input of the compiled template to be the
// output of `parsePathname`. Note that it does *not* remove query parameters
// specified in the template.
module.exports = function(template) {
	var templateData = parsePathname(template)
	var templateKeys = Object.keys(templateData.params)
	var keys = []
	var regexp = new RegExp("^" + templateData.path.replace(
		// I escape literal text so people can use things like `:file.:ext` or
		// `:lang-:locale` in routes. This is all merged into one pass so I
		// don't also accidentally escape `-` and make it harder to detect it to
		// ban it from template parameters.
		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
		function(m, key, extra) {
			if (key == null) return "\\" + m
			keys.push({k: key, r: extra === "..."})
			if (extra === "...") return "(.*)"
			if (extra === ".") return "([^/]+)\\."
			return "([^/]+)" + (extra || "")
		}
	) + "$")
	return function(data) {
		// First, check the params. Usually, there isn't any, and it's just
		// checking a static set.
		for (var i = 0; i < templateKeys.length; i++) {
			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
		}
		// If no interpolations exist, let's skip all the ceremony
		if (!keys.length) return regexp.test(data.path)
		var values = regexp.exec(data.path)
		if (values == null) return false
		for (var i = 0; i < keys.length; i++) {
			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
		}
		return true
	}
}

},{"./parse":"node_modules/mithril/pathname/parse.js"}],"node_modules/mithril/api/router.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var m = require("../render/hyperscript")
var Promise = require("../promise/promise")

var buildPathname = require("../pathname/build")
var parsePathname = require("../pathname/parse")
var compileTemplate = require("../pathname/compileTemplate")
var assign = require("../pathname/assign")

var sentinel = {}

module.exports = function($window, mountRedraw) {
	var fireAsync

	function setPath(path, data, options) {
		path = buildPathname(path, data)
		if (fireAsync != null) {
			fireAsync()
			var state = options ? options.state : null
			var title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}

	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate

	var SKIP = route.SKIP = {}

	function route(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		// 0 = start
		// 1 = init
		// 2 = ready
		var state = 0

		var compiled = Object.keys(routes).map(function(route) {
			if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
				throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
			}
			return {
				route: route,
				component: routes[route],
				check: compileTemplate(route),
			}
		})
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
		var p = Promise.resolve()
		var scheduled = false
		var onremove

		fireAsync = null

		if (defaultRoute != null) {
			var defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function (i) { return i.check(defaultData) })) {
				throw new ReferenceError("Default route doesn't match any known routes")
			}
		}

		function resolveRoute() {
			scheduled = false
			// Consider the pathname holistically. The prefix might even be invalid,
			// but that's not our problem.
			var prefix = $window.location.hash
			if (route.prefix[0] !== "#") {
				prefix = $window.location.search + prefix
				if (route.prefix[0] !== "?") {
					prefix = $window.location.pathname + prefix
					if (prefix[0] !== "/") prefix = "/" + prefix
				}
			}
			// This seemingly useless `.concat()` speeds up the tests quite a bit,
			// since the representation is consistently a relatively poorly
			// optimized cons string.
			var path = prefix.concat()
				.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
				.slice(route.prefix.length)
			var data = parsePathname(path)

			assign(data.params, $window.history.state)

			function fail() {
				if (path === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
				setPath(defaultRoute, null, {replace: true})
			}

			loop(0)
			function loop(i) {
				// 0 = init
				// 1 = scheduled
				// 2 = done
				for (; i < compiled.length; i++) {
					if (compiled[i].check(data)) {
						var payload = compiled[i].component
						var matchedRoute = compiled[i].route
						var localComp = payload
						var update = lastUpdate = function(comp) {
							if (update !== lastUpdate) return
							if (comp === SKIP) return loop(i + 1)
							component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
							attrs = data.params, currentPath = path, lastUpdate = null
							currentResolver = payload.render ? payload : null
							if (state === 2) mountRedraw.redraw()
							else {
								state = 2
								mountRedraw.redraw.sync()
							}
						}
						// There's no understating how much I *wish* I could
						// use `async`/`await` here...
						if (payload.view || typeof payload === "function") {
							payload = {}
							update(localComp)
						}
						else if (payload.onmatch) {
							p.then(function () {
								return payload.onmatch(data.params, path, matchedRoute)
							}).then(update, fail)
						}
						else update("div")
						return
					}
				}
				fail()
			}
		}

		// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
		// even if neither `pushState` nor `hashchange` are supported. It's
		// cleared if `hashchange` is used, since that makes it automatically
		// async.
		fireAsync = function() {
			if (!scheduled) {
				scheduled = true
				callAsync(resolveRoute)
			}
		}

		if (typeof $window.history.pushState === "function") {
			onremove = function() {
				$window.removeEventListener("popstate", fireAsync, false)
			}
			$window.addEventListener("popstate", fireAsync, false)
		} else if (route.prefix[0] === "#") {
			fireAsync = null
			onremove = function() {
				$window.removeEventListener("hashchange", resolveRoute, false)
			}
			$window.addEventListener("hashchange", resolveRoute, false)
		}

		return mountRedraw.mount(root, {
			onbeforeupdate: function() {
				state = state ? 2 : 1
				return !(!state || sentinel === currentResolver)
			},
			oncreate: resolveRoute,
			onremove: onremove,
			view: function() {
				if (!state || sentinel === currentResolver) return
				// Wrap in a fragment to preserve existing key semantics
				var vnode = [Vnode(component, attrs.key, attrs)]
				if (currentResolver) vnode = currentResolver.render(vnode[0])
				return vnode
			},
		})
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = "#!"
	route.Link = {
		view: function(vnode) {
			var options = vnode.attrs.options
			// Remove these so they don't get overwritten
			var attrs = {}, onclick, href
			assign(attrs, vnode.attrs)
			// The first two are internal, but the rest are magic attributes
			// that need censored to not screw up rendering.
			attrs.selector = attrs.options = attrs.key = attrs.oninit =
			attrs.oncreate = attrs.onbeforeupdate = attrs.onupdate =
			attrs.onbeforeremove = attrs.onremove = null

			// Do this now so we can get the most current `href` and `disabled`.
			// Those attributes may also be specified in the selector, and we
			// should honor that.
			var child = m(vnode.attrs.selector || "a", attrs, vnode.children)

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
				child.attrs.href = null
				child.attrs["aria-disabled"] = "true"
				// If you *really* do want to do this on a disabled link, use
				// an `oncreate` hook to add it.
				child.attrs.onclick = null
			} else {
				onclick = child.attrs.onclick
				href = child.attrs.href
				child.attrs.href = route.prefix + href
				child.attrs.onclick = function(e) {
					var result
					if (typeof onclick === "function") {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== "object") {
						// do nothing
					} else if (typeof onclick.handleEvent === "function") {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						e.preventDefault()
						e.redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key) {
		return attrs && key != null ? attrs[key] : attrs
	}

	return route
}

},{"../render/vnode":"node_modules/mithril/render/vnode.js","../render/hyperscript":"node_modules/mithril/render/hyperscript.js","../promise/promise":"node_modules/mithril/promise/promise.js","../pathname/build":"node_modules/mithril/pathname/build.js","../pathname/parse":"node_modules/mithril/pathname/parse.js","../pathname/compileTemplate":"node_modules/mithril/pathname/compileTemplate.js","../pathname/assign":"node_modules/mithril/pathname/assign.js"}],"node_modules/mithril/route.js":[function(require,module,exports) {
"use strict"

var mountRedraw = require("./mount-redraw")

module.exports = require("./api/router")(window, mountRedraw)

},{"./mount-redraw":"node_modules/mithril/mount-redraw.js","./api/router":"node_modules/mithril/api/router.js"}],"node_modules/mithril/index.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./hyperscript")
var request = require("./request")
var mountRedraw = require("./mount-redraw")

var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.mount = mountRedraw.mount
m.route = require("./route")
m.render = require("./render")
m.redraw = mountRedraw.redraw
m.request = request.request
m.jsonp = request.jsonp
m.parseQueryString = require("./querystring/parse")
m.buildQueryString = require("./querystring/build")
m.parsePathname = require("./pathname/parse")
m.buildPathname = require("./pathname/build")
m.vnode = require("./render/vnode")
m.PromisePolyfill = require("./promise/polyfill")

module.exports = m

},{"./hyperscript":"node_modules/mithril/hyperscript.js","./request":"node_modules/mithril/request.js","./mount-redraw":"node_modules/mithril/mount-redraw.js","./route":"node_modules/mithril/route.js","./render":"node_modules/mithril/render.js","./querystring/parse":"node_modules/mithril/querystring/parse.js","./querystring/build":"node_modules/mithril/querystring/build.js","./pathname/parse":"node_modules/mithril/pathname/parse.js","./pathname/build":"node_modules/mithril/pathname/build.js","./render/vnode":"node_modules/mithril/render/vnode.js","./promise/polyfill":"node_modules/mithril/promise/polyfill.js"}],"node_modules/animejs/lib/anime.es.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * anime.js v3.2.0
 * (c) 2020 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */
// Defaults
var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};
var defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};
var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d']; // Caching

var cache = {
  CSS: {},
  springs: {}
}; // Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

function applyArguments(func, args) {
  return func.apply(null, args);
}

var is = {
  arr: function (a) {
    return Array.isArray(a);
  },
  obj: function (a) {
    return stringContains(Object.prototype.toString.call(a), 'Object');
  },
  pth: function (a) {
    return is.obj(a) && a.hasOwnProperty('totalLength');
  },
  svg: function (a) {
    return a instanceof SVGElement;
  },
  inp: function (a) {
    return a instanceof HTMLInputElement;
  },
  dom: function (a) {
    return a.nodeType || is.svg(a);
  },
  str: function (a) {
    return typeof a === 'string';
  },
  fnc: function (a) {
    return typeof a === 'function';
  },
  und: function (a) {
    return typeof a === 'undefined';
  },
  hex: function (a) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
  },
  rgb: function (a) {
    return /^rgb/.test(a);
  },
  hsl: function (a) {
    return /^hsl/.test(a);
  },
  col: function (a) {
    return is.hex(a) || is.rgb(a) || is.hsl(a);
  },
  key: function (a) {
    return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes';
  }
}; // Easings

function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) {
    return parseFloat(p);
  }) : [];
} // Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js


function spring(string, duration) {
  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  var velocity = minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    var progress = duration ? duration * t / 1000 : t;

    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }

    if (t === 0 || t === 1) {
      return t;
    }

    return 1 - progress;
  }

  function getDuration() {
    var cached = cache.springs[string];

    if (cached) {
      return cached;
    }

    var frame = 1 / 6;
    var elapsed = 0;
    var rest = 0;

    while (true) {
      elapsed += frame;

      if (solver(elapsed) === 1) {
        rest++;

        if (rest >= 16) {
          break;
        }
      } else {
        rest = 0;
      }
    }

    var duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;
} // Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function


function steps(steps) {
  if (steps === void 0) steps = 10;
  return function (t) {
    return Math.ceil(minMax(t, 0.000001, 1) * steps) * (1 / steps);
  };
} // BezierEasing https://github.com/gre/bezier-easing


var bezier = function () {
  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
  }

  function B(aA1, aA2) {
    return 3.0 * aA2 - 6.0 * aA1;
  }

  function C(aA1) {
    return 3.0 * aA1;
  }

  function calcBezier(aT, aA1, aA2) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
  }

  function getSlope(aT, aA1, aA2) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX,
        currentT,
        i = 0;

    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;

      if (currentX > 0.0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);

    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);

      if (currentSlope === 0.0) {
        return aGuessT;
      }

      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }

    return aGuessT;
  }

  function bezier(mX1, mY1, mX2, mY2) {
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
      return;
    }

    var sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {
      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;
      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }
    }

    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) {
        return x;
      }

      if (x === 0 || x === 1) {
        return x;
      }

      return calcBezier(getTForX(x), mY1, mY2);
    };
  }

  return bezier;
}();

var penner = function () {
  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)
  var eases = {
    linear: function () {
      return function (t) {
        return t;
      };
    }
  };
  var functionEasings = {
    Sine: function () {
      return function (t) {
        return 1 - Math.cos(t * Math.PI / 2);
      };
    },
    Circ: function () {
      return function (t) {
        return 1 - Math.sqrt(1 - t * t);
      };
    },
    Back: function () {
      return function (t) {
        return t * t * (3 * t - 2);
      };
    },
    Bounce: function () {
      return function (t) {
        var pow2,
            b = 4;

        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {}

        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
      };
    },
    Elastic: function (amplitude, period) {
      if (amplitude === void 0) amplitude = 1;
      if (period === void 0) period = .5;
      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, .1, 2);
      return function (t) {
        return t === 0 || t === 1 ? t : -a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - p / (Math.PI * 2) * Math.asin(1 / a)) * (Math.PI * 2) / p);
      };
    }
  };
  var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];
  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () {
      return function (t) {
        return Math.pow(t, i + 2);
      };
    };
  });
  Object.keys(functionEasings).forEach(function (name) {
    var easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;

    eases['easeOut' + name] = function (a, b) {
      return function (t) {
        return 1 - easeIn(a, b)(1 - t);
      };
    };

    eases['easeInOut' + name] = function (a, b) {
      return function (t) {
        return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
      };
    };
  });
  return eases;
}();

function parseEasings(easing, duration) {
  if (is.fnc(easing)) {
    return easing;
  }

  var name = easing.split('(')[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);

  switch (name) {
    case 'spring':
      return spring(easing, duration);

    case 'cubicBezier':
      return applyArguments(bezier, args);

    case 'steps':
      return applyArguments(steps, args);

    default:
      return applyArguments(ease, args);
  }
} // Strings


function selectString(str) {
  try {
    var nodes = document.querySelectorAll(str);
    return nodes;
  } catch (e) {
    return;
  }
} // Arrays


function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];

  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];

      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }

  return result;
}

function flattenArray(arr) {
  return arr.reduce(function (a, b) {
    return a.concat(is.arr(b) ? flattenArray(b) : b);
  }, []);
}

function toArray(o) {
  if (is.arr(o)) {
    return o;
  }

  if (is.str(o)) {
    o = selectString(o) || o;
  }

  if (o instanceof NodeList || o instanceof HTMLCollection) {
    return [].slice.call(o);
  }

  return [o];
}

function arrayContains(arr, val) {
  return arr.some(function (a) {
    return a === val;
  });
} // Objects


function cloneObject(o) {
  var clone = {};

  for (var p in o) {
    clone[p] = o[p];
  }

  return clone;
}

function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);

  for (var p in o1) {
    o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
  }

  return o;
}

function mergeObjects(o1, o2) {
  var o = cloneObject(o1);

  for (var p in o2) {
    o[p] = is.und(o1[p]) ? o2[p] : o1[p];
  }

  return o;
} // Colors


function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? "rgba(" + rgb[1] + ",1)" : rgbValue;
}

function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return "rgba(" + r + "," + g + "," + b + ",1)";
}

function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;

  function hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }

    if (t > 1) {
      t -= 1;
    }

    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }

    if (t < 1 / 2) {
      return q;
    }

    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }

    return p;
  }

  var r, g, b;

  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
}

function colorToRgb(val) {
  if (is.rgb(val)) {
    return rgbToRgba(val);
  }

  if (is.hex(val)) {
    return hexToRgba(val);
  }

  if (is.hsl(val)) {
    return hslToRgba(val);
  }
} // Units


function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);

  if (split) {
    return split[1];
  }
}

function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') {
    return 'px';
  }

  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) {
    return 'deg';
  }
} // Values


function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) {
    return val;
  }

  return val(animatable.target, animatable.id, animatable.total);
}

function getAttribute(el, prop) {
  return el.getAttribute(prop);
}

function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);

  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) {
    return value;
  }

  var cached = cache.CSS[value + unit];

  if (!is.und(cached)) {
    return cached;
  }

  var baseline = 100;
  var tempEl = document.createElement(el.tagName);
  var parentEl = el.parentNode && el.parentNode !== document ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  var factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  var convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (getAttribute(el, prop) || is.svg(el) && el[prop])) {
    return 'attribute';
  }

  if (is.dom(el) && arrayContains(validTransforms, prop)) {
    return 'transform';
  }

  if (is.dom(el) && prop !== 'transform' && getCSSValue(el, prop)) {
    return 'css';
  }

  if (el[prop] != null) {
    return 'object';
  }
}

function getElementTransforms(el) {
  if (!is.dom(el)) {
    return;
  }

  var str = el.style.transform || '';
  var reg = /(\w+)\(([^)]*)\)/g;
  var transforms = new Map();
  var m;

  while (m = reg.exec(str)) {
    transforms.set(m[1], m[2]);
  }

  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;

  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }

  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform':
      return getTransformValue(target, propName, animatable, unit);

    case 'css':
      return getCSSValue(target, propName, unit);

    case 'attribute':
      return getAttribute(target, propName);

    default:
      return target[propName] || 0;
  }
}

function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);

  if (!operator) {
    return to;
  }

  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ''));

  switch (operator[0][0]) {
    case '+':
      return x + y + u;

    case '-':
      return x - y + u;

    case '*':
      return x * y + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) {
    return colorToRgb(val);
  }

  if (/\s/g.test(val)) {
    return val;
  }

  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;

  if (unit) {
    return unitLess + unit;
  }

  return unitLess;
} // getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744


function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}

function getRectLength(el) {
  return getAttribute(el, 'width') * 2 + getAttribute(el, 'height') * 2;
}

function getLineLength(el) {
  return getDistance({
    x: getAttribute(el, 'x1'),
    y: getAttribute(el, 'y1')
  }, {
    x: getAttribute(el, 'x2'),
    y: getAttribute(el, 'y2')
  });
}

function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;

  for (var i = 0; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);

    if (i > 0) {
      totalLength += getDistance(previousPos, currentPos);
    }

    previousPos = currentPos;
  }

  return totalLength;
}

function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
} // Path animation


function getTotalLength(el) {
  if (el.getTotalLength) {
    return el.getTotalLength();
  }

  switch (el.tagName.toLowerCase()) {
    case 'circle':
      return getCircleLength(el);

    case 'rect':
      return getRectLength(el);

    case 'line':
      return getLineLength(el);

    case 'polyline':
      return getPolylineLength(el);

    case 'polygon':
      return getPolygonLength(el);
  }
}

function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
} // Motion path


function getParentSvgEl(el) {
  var parentEl = el.parentNode;

  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) {
      break;
    }

    parentEl = parentEl.parentNode;
  }

  return parentEl;
}

function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width / viewBox[2],
    h: height / viewBox[3]
  };
}

function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function (property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    };
  };
}

function getPathProgress(path, progress) {
  function point(offset) {
    if (offset === void 0) offset = 0;
    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }

  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(+1);

  switch (path.property) {
    case 'x':
      return (p.x - svg.x) * svg.w;

    case 'y':
      return (p.y - svg.y) * svg.h;

    case 'angle':
      return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
} // Decompose value


function decomposeValue(val, unit) {
  // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation

  var value = validateValue(is.pth(val) ? val.totalLength : val, unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: is.str(val) || unit ? value.split(rgx) : []
  };
} // Animatables


function parseTargets(targets) {
  var targetsArray = targets ? flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets)) : [];
  return filterArray(targetsArray, function (item, pos, self) {
    return self.indexOf(item) === pos;
  });
}

function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function (t, i) {
    return {
      target: t,
      id: i,
      total: parsed.length,
      transforms: {
        list: getElementTransforms(t)
      }
    };
  });
} // Properties


function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings); // Override duration if easing is a spring

  if (/^spring/.test(settings.easing)) {
    settings.duration = spring(settings.easing);
  }

  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = l === 2 && !is.obj(prop[0]);

    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) {
        settings.duration = tweenSettings.duration / l;
      }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {
        value: prop
      };
    }
  }

  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    var obj = is.obj(v) && !is.pth(v) ? v : {
      value: v
    }; // Default delay value should only be applied to the first tween

    if (is.und(obj.delay)) {
      obj.delay = !i ? tweenSettings.delay : 0;
    } // Default endDelay value should only be applied to the last tween


    if (is.und(obj.endDelay)) {
      obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0;
    }

    return obj;
  }).map(function (k) {
    return mergeObjects(k, settings);
  });
}

function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function (key) {
    return Object.keys(key);
  })), function (p) {
    return is.key(p);
  }).reduce(function (a, b) {
    if (a.indexOf(b) < 0) {
      a.push(b);
    }

    return a;
  }, []);
  var properties = {};

  var loop = function (i) {
    var propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      var newKey = {};

      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) {
            newKey.value = key[p];
          }
        } else {
          newKey[p] = key[p];
        }
      }

      return newKey;
    });
  };

  for (var i = 0; i < propertyNames.length; i++) loop(i);

  return properties;
}

function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;

  if (keyframes) {
    params = mergeObjects(flattenKeyframes(keyframes), params);
  }

  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }

  return properties;
} // Tweens


function normalizeTweenValues(tween, animatable) {
  var t = {};

  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);

    if (is.arr(value)) {
      value = value.map(function (v) {
        return getFunctionValue(v, animatable);
      });

      if (value.length === 1) {
        value = value[0];
      }
    }

    t[p] = value;
  }

  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}

function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function (t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;

    if (is.und(to)) {
      to = previousValue;
    }

    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isColor = is.col(tween.from.original);

    if (tween.isColor) {
      tween.round = 1;
    }

    previousTween = tween;
    return tween;
  });
} // Tween progress


var setProgressValue = {
  css: function (t, p, v) {
    return t.style[p] = v;
  },
  attribute: function (t, p, v) {
    return t.setAttribute(p, v);
  },
  object: function (t, p, v) {
    return t[p] = v;
  },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);

    if (p === transforms.last || manual) {
      var str = '';
      transforms.list.forEach(function (value, prop) {
        str += prop + "(" + value + ") ";
      });
      t.style.transform = str;
    }
  }
}; // Set Value helper

function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
} // Animations


function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);

  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    };
  }
}

function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) {
    return !is.und(a);
  });
} // Create Instance


function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;

  var getTlOffset = function (anim) {
    return anim.timelineOffset ? anim.timelineOffset : 0;
  };

  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) {
    return getTlOffset(anim) + anim.duration;
  })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) {
    return getTlOffset(anim) + anim.delay;
  })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) {
    return getTlOffset(anim) + anim.duration - anim.endDelay;
  })) : tweenSettings.endDelay;
  return timings;
}

var instanceID = 0;

function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
} // Core


var activeInstances = [];
var pausedInstances = [];
var raf;

var engine = function () {
  function play() {
    raf = requestAnimationFrame(step);
  }

  function step(t) {
    var activeInstancesLength = activeInstances.length;

    if (activeInstancesLength) {
      var i = 0;

      while (i < activeInstancesLength) {
        var activeInstance = activeInstances[i];

        if (!activeInstance.paused) {
          activeInstance.tick(t);
        } else {
          var instanceIndex = activeInstances.indexOf(activeInstance);

          if (instanceIndex > -1) {
            activeInstances.splice(instanceIndex, 1);
            activeInstancesLength = activeInstances.length;
          }
        }

        i++;
      }

      play();
    } else {
      raf = cancelAnimationFrame(raf);
    }
  }

  return play;
}();

function handleVisibilityChange() {
  if (document.hidden) {
    activeInstances.forEach(function (ins) {
      return ins.pause();
    });
    pausedInstances = activeInstances.slice(0);
    anime.running = activeInstances = [];
  } else {
    pausedInstances.forEach(function (ins) {
      return ins.play();
    });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
} // Public Instance


function anime(params) {
  if (params === void 0) params = {};
  var startTime = 0,
      lastTime = 0,
      now = 0;
  var children,
      childrenLength = 0;
  var resolve = null;

  function makePromise(instance) {
    var promise = window.Promise && new Promise(function (_resolve) {
      return resolve = _resolve;
    });
    instance.finished = promise;
    return promise;
  }

  var instance = createNewInstance(params);
  var promise = makePromise(instance);

  function toggleInstanceDirection() {
    var direction = instance.direction;

    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }

    instance.reversed = !instance.reversed;
    children.forEach(function (child) {
      return child.reversed = instance.reversed;
    });
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }

  function seekChild(time, child) {
    if (child) {
      child.seek(time - child.timelineOffset);
    }
  }

  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) {
        seekChild(time, children[i]);
      }
    } else {
      for (var i$1 = childrenLength; i$1--;) {
        seekChild(time, children[i$1]);
      }
    }
  }

  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;

    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength]; // Only check for keyframes if there is more than one tween

      if (tweenLength) {
        tween = filterArray(tweens, function (t) {
          return insTime < t.end;
        })[0] || tween;
      }

      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = void 0;

      for (var n = 0; n < toNumbersLength; n++) {
        var value = void 0;
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;

        if (!tween.isPath) {
          value = fromNumber + eased * (toNumber - fromNumber);
        } else {
          value = getPathProgress(tween.value, eased * toNumber);
        }

        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }

        numbers.push(value);
      } // Manual Array.reduce for better performances


      var stringsLength = strings.length;

      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];

        for (var s = 0; s < stringsLength; s++) {
          var a = strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];

          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }

      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) {
      instance[cb](instance);
    }
  }

  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }

  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax(insTime / insDuration * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;

    if (children) {
      syncInstanceChildren(insTime);
    }

    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback('begin');
    }

    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback('loopBegin');
    }

    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }

    if (insTime >= insEndDelay && instance.currentTime !== insDuration || !insDuration) {
      setAnimationsProgress(insDuration);
    }

    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback('changeBegin');
      }

      setCallback('change');
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback('changeComplete');
      }
    }

    instance.currentTime = minMax(insTime, 0, insDuration);

    if (instance.began) {
      setCallback('update');
    }

    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();

      if (!instance.remaining) {
        instance.paused = true;

        if (!instance.completed) {
          instance.completed = true;
          setCallback('loopComplete');
          setCallback('complete');

          if (!instance.passThrough && 'Promise' in window) {
            resolve();
            promise = makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback('loopComplete');
        instance.loopBegan = false;

        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
  }

  instance.reset = function () {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;

    for (var i = childrenLength; i--;) {
      instance.children[i].reset();
    }

    if (instance.reversed && instance.loop !== true || direction === 'alternate' && instance.loop === 1) {
      instance.remaining++;
    }

    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  }; // Set Value helper


  instance.set = function (targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };

  instance.tick = function (t) {
    now = t;

    if (!startTime) {
      startTime = now;
    }

    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };

  instance.seek = function (time) {
    setInstanceProgress(adjustTime(time));
  };

  instance.pause = function () {
    instance.paused = true;
    resetTime();
  };

  instance.play = function () {
    if (!instance.paused) {
      return;
    }

    if (instance.completed) {
      instance.reset();
    }

    instance.paused = false;
    activeInstances.push(instance);
    resetTime();

    if (!raf) {
      engine();
    }
  };

  instance.reverse = function () {
    toggleInstanceDirection();
    instance.completed = instance.reversed ? false : true;
    resetTime();
  };

  instance.restart = function () {
    instance.reset();
    instance.play();
  };

  instance.reset();

  if (instance.autoplay) {
    instance.play();
  }

  return instance;
} // Remove targets from animation


function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargets(targets) {
  var targetsArray = parseTargets(targets);

  for (var i = activeInstances.length; i--;) {
    var instance = activeInstances[i];
    var animations = instance.animations;
    var children = instance.children;
    removeTargetsFromAnimations(targetsArray, animations);

    for (var c = children.length; c--;) {
      var child = children[c];
      var childAnimations = child.animations;
      removeTargetsFromAnimations(targetsArray, childAnimations);

      if (!childAnimations.length && !child.children.length) {
        children.splice(c, 1);
      }
    }

    if (!animations.length && !children.length) {
      instance.pause();
    }
  }
} // Stagger helpers


function stagger(val, params) {
  if (params === void 0) params = {};
  var direction = params.direction || 'normal';
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === 'first';
  var fromCenter = fromIndex === 'center';
  var fromLast = fromIndex === 'last';
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function (el, i, t) {
    if (fromFirst) {
      fromIndex = 0;
    }

    if (fromCenter) {
      fromIndex = (t - 1) / 2;
    }

    if (fromLast) {
      fromIndex = t - 1;
    }

    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
          var fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
          var toX = index % grid[0];
          var toY = Math.floor(index / grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

          if (axis === 'x') {
            value = -distanceX;
          }

          if (axis === 'y') {
            value = -distanceY;
          }

          values.push(value);
        }

        maxValue = Math.max.apply(Math, values);
      }

      if (easing) {
        values = values.map(function (val) {
          return easing(val / maxValue) * maxValue;
        });
      }

      if (direction === 'reverse') {
        values = values.map(function (val) {
          return axis ? val < 0 ? val * -1 : -val : Math.abs(maxValue - val);
        });
      }
    }

    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
  };
} // Timeline


function timeline(params) {
  if (params === void 0) params = {};
  var tl = anime(params);
  tl.duration = 0;

  tl.add = function (instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;

    if (tlIndex > -1) {
      activeInstances.splice(tlIndex, 1);
    }

    function passThrough(ins) {
      ins.passThrough = true;
    }

    for (var i = 0; i < children.length; i++) {
      passThrough(children[i]);
    }

    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();

    if (tl.autoplay) {
      tl.play();
    }

    return tl;
  };

  return tl;
}

anime.version = '3.2.0';
anime.speed = 1;
anime.running = activeInstances;
anime.remove = removeTargets;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;

anime.random = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var _default = anime;
exports.default = _default;
},{}],"node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"src/styles/components/menu.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/menu.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

require("../styles/components/menu.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    onupdate: function onupdate(vnode) {
      var open;
      open = vnode.attrs.open;

      if (open) {
        return (0, _animeEs.default)({
          targets: vnode.dom,
          height: '100%',
          easing: 'easeInOutQuint'
        });
      } else {
        return (0, _animeEs.default)({
          targets: vnode.dom,
          height: '0',
          easing: 'easeInOutQuint'
        });
      }
    },
    view: function view(vnode) {
      var onclick;
      onclick = vnode.attrs.onclick;
      return (0, _mithril.default)(".menu", [(0, _mithril.default)('.menu-content', [(0, _mithril.default)('ul.main-menu', [(0, _mithril.default)('li.menu-item', [(0, _mithril.default)('a', {
        href: '#!/',
        onclick: onclick
      }, 'About')]), (0, _mithril.default)('li.menu-item', [(0, _mithril.default)('a', {
        href: '#!/projects',
        onclick: onclick
      }, 'Works')])]), (0, _mithril.default)('.other', [(0, _mithril.default)('.social.contact-method', [(0, _mithril.default)('a.social-media', {
        href: 'https://github.com/ZeroX-DG',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-github')]), (0, _mithril.default)('a.social-media', {
        href: 'https://twitter.com/',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-twitter')]), (0, _mithril.default)('a.social-media', {
        href: 'https://www.linkedin.com/in/v-hung/',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-linkedin')])])])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","../styles/components/menu.sass":"src/styles/components/menu.sass"}],"src/styles/components/menu-button.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/menu-button.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

require("../styles/components/menu-button.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    view: function view(vnode) {
      var onclick, open;
      var _vnode$attrs = vnode.attrs;
      onclick = _vnode$attrs.onclick;
      open = _vnode$attrs.open;
      return (0, _mithril.default)(".menu-button".concat(open ? '.open' : ''), {
        onclick: onclick
      }, [(0, _mithril.default)('.col', [(0, _mithril.default)('.dot'), (0, _mithril.default)('.dot.dynamic'), (0, _mithril.default)('.dot')]), (0, _mithril.default)('.col', [(0, _mithril.default)('.dot.dynamic'), (0, _mithril.default)('.dot'), (0, _mithril.default)('.dot.dynamic')]), (0, _mithril.default)('.col', [(0, _mithril.default)('.dot'), (0, _mithril.default)('.dot.dynamic'), (0, _mithril.default)('.dot')])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","../styles/components/menu-button.sass":"src/styles/components/menu-button.sass"}],"src/styles/components/contact.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/contact.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

require("../styles/components/contact.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    oncreate: function oncreate(vnode) {
      var actionList, _render;

      actionList = vnode.dom.querySelector('.actions ul');

      _render = function render() {
        return requestAnimationFrame(function () {
          (0, _animeEs.default)({
            targets: actionList,
            marginTop: '-28px',
            complete: function complete() {
              actionList.appendChild(actionList.firstChild);
              return actionList.style.marginTop = "";
            }
          });
          return setTimeout(function () {
            return _render();
          }, 2000);
        });
      };

      return _render();
    },
    view: function view() {
      return (0, _mithril.default)('.contact.section', [(0, _mithril.default)('.left', [(0, _mithril.default)('h1.title', 'Contact me')]), (0, _mithril.default)('.right', [(0, _mithril.default)('.short-words', [(0, _mithril.default)('p', 'Don\'t hesitate to contact me'), (0, _mithril.default)('p', ['I\'m available for ', (0, _mithril.default)('span.actions', (0, _mithril.default)('ul', [(0, _mithril.default)('li.action', 'work.'), (0, _mithril.default)('li.action', 'a chat!'), (0, _mithril.default)('li.action', 'collaborations.')]))])]), (0, _mithril.default)('.primary.contact-method', [(0, _mithril.default)('a.content', {
        href: 'mailto:viethungax@gmail.com'
      }, 'viethungax@gmail.com')]), (0, _mithril.default)('.social.contact-method', [(0, _mithril.default)('a.social-media', {
        href: 'https://github.com/ZeroX-DG',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-github')]), (0, _mithril.default)('a.social-media', {
        href: 'https://twitter.com/ZeroX_Hung',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-twitter')]), (0, _mithril.default)('a.social-media', {
        href: 'https://www.linkedin.com/in/v-hung/',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-linkedin')])])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","../styles/components/contact.sass":"src/styles/components/contact.sass"}],"node_modules/mobile-detect/mobile-detect.js":[function(require,module,exports) {
var define;
// THIS FILE IS GENERATED - DO NOT EDIT!
/*!mobile-detect v1.4.4 2019-09-21*/
/*global module:false, define:false*/
/*jshint latedef:false*/
/*!@license Copyright 2013, Heinrich Goebl, License: MIT, see https://github.com/hgoebl/mobile-detect.js*/
(function (define, undefined) {
define(function () {
    'use strict';

    var impl = {};

    impl.mobileDetectRules = {
    "phones": {
        "iPhone": "\\biPhone\\b|\\biPod\\b",
        "BlackBerry": "BlackBerry|\\bBB10\\b|rim[0-9]+|\\b(BBA100|BBB100|BBD100|BBE100|BBF100|STH100)\\b-[0-9]+",
        "HTC": "HTC|HTC.*(Sensation|Evo|Vision|Explorer|6800|8100|8900|A7272|S510e|C110e|Legend|Desire|T8282)|APX515CKT|Qtek9090|APA9292KT|HD_mini|Sensation.*Z710e|PG86100|Z715e|Desire.*(A8181|HD)|ADR6200|ADR6400L|ADR6425|001HT|Inspire 4G|Android.*\\bEVO\\b|T-Mobile G1|Z520m|Android [0-9.]+; Pixel",
        "Nexus": "Nexus One|Nexus S|Galaxy.*Nexus|Android.*Nexus.*Mobile|Nexus 4|Nexus 5|Nexus 6",
        "Dell": "Dell[;]? (Streak|Aero|Venue|Venue Pro|Flash|Smoke|Mini 3iX)|XCD28|XCD35|\\b001DL\\b|\\b101DL\\b|\\bGS01\\b",
        "Motorola": "Motorola|DROIDX|DROID BIONIC|\\bDroid\\b.*Build|Android.*Xoom|HRI39|MOT-|A1260|A1680|A555|A853|A855|A953|A955|A956|Motorola.*ELECTRIFY|Motorola.*i1|i867|i940|MB200|MB300|MB501|MB502|MB508|MB511|MB520|MB525|MB526|MB611|MB612|MB632|MB810|MB855|MB860|MB861|MB865|MB870|ME501|ME502|ME511|ME525|ME600|ME632|ME722|ME811|ME860|ME863|ME865|MT620|MT710|MT716|MT720|MT810|MT870|MT917|Motorola.*TITANIUM|WX435|WX445|XT300|XT301|XT311|XT316|XT317|XT319|XT320|XT390|XT502|XT530|XT531|XT532|XT535|XT603|XT610|XT611|XT615|XT681|XT701|XT702|XT711|XT720|XT800|XT806|XT860|XT862|XT875|XT882|XT883|XT894|XT901|XT907|XT909|XT910|XT912|XT928|XT926|XT915|XT919|XT925|XT1021|\\bMoto E\\b|XT1068|XT1092|XT1052",
        "Samsung": "\\bSamsung\\b|SM-G950F|SM-G955F|SM-G9250|GT-19300|SGH-I337|BGT-S5230|GT-B2100|GT-B2700|GT-B2710|GT-B3210|GT-B3310|GT-B3410|GT-B3730|GT-B3740|GT-B5510|GT-B5512|GT-B5722|GT-B6520|GT-B7300|GT-B7320|GT-B7330|GT-B7350|GT-B7510|GT-B7722|GT-B7800|GT-C3010|GT-C3011|GT-C3060|GT-C3200|GT-C3212|GT-C3212I|GT-C3262|GT-C3222|GT-C3300|GT-C3300K|GT-C3303|GT-C3303K|GT-C3310|GT-C3322|GT-C3330|GT-C3350|GT-C3500|GT-C3510|GT-C3530|GT-C3630|GT-C3780|GT-C5010|GT-C5212|GT-C6620|GT-C6625|GT-C6712|GT-E1050|GT-E1070|GT-E1075|GT-E1080|GT-E1081|GT-E1085|GT-E1087|GT-E1100|GT-E1107|GT-E1110|GT-E1120|GT-E1125|GT-E1130|GT-E1160|GT-E1170|GT-E1175|GT-E1180|GT-E1182|GT-E1200|GT-E1210|GT-E1225|GT-E1230|GT-E1390|GT-E2100|GT-E2120|GT-E2121|GT-E2152|GT-E2220|GT-E2222|GT-E2230|GT-E2232|GT-E2250|GT-E2370|GT-E2550|GT-E2652|GT-E3210|GT-E3213|GT-I5500|GT-I5503|GT-I5700|GT-I5800|GT-I5801|GT-I6410|GT-I6420|GT-I7110|GT-I7410|GT-I7500|GT-I8000|GT-I8150|GT-I8160|GT-I8190|GT-I8320|GT-I8330|GT-I8350|GT-I8530|GT-I8700|GT-I8703|GT-I8910|GT-I9000|GT-I9001|GT-I9003|GT-I9010|GT-I9020|GT-I9023|GT-I9070|GT-I9082|GT-I9100|GT-I9103|GT-I9220|GT-I9250|GT-I9300|GT-I9305|GT-I9500|GT-I9505|GT-M3510|GT-M5650|GT-M7500|GT-M7600|GT-M7603|GT-M8800|GT-M8910|GT-N7000|GT-S3110|GT-S3310|GT-S3350|GT-S3353|GT-S3370|GT-S3650|GT-S3653|GT-S3770|GT-S3850|GT-S5210|GT-S5220|GT-S5229|GT-S5230|GT-S5233|GT-S5250|GT-S5253|GT-S5260|GT-S5263|GT-S5270|GT-S5300|GT-S5330|GT-S5350|GT-S5360|GT-S5363|GT-S5369|GT-S5380|GT-S5380D|GT-S5560|GT-S5570|GT-S5600|GT-S5603|GT-S5610|GT-S5620|GT-S5660|GT-S5670|GT-S5690|GT-S5750|GT-S5780|GT-S5830|GT-S5839|GT-S6102|GT-S6500|GT-S7070|GT-S7200|GT-S7220|GT-S7230|GT-S7233|GT-S7250|GT-S7500|GT-S7530|GT-S7550|GT-S7562|GT-S7710|GT-S8000|GT-S8003|GT-S8500|GT-S8530|GT-S8600|SCH-A310|SCH-A530|SCH-A570|SCH-A610|SCH-A630|SCH-A650|SCH-A790|SCH-A795|SCH-A850|SCH-A870|SCH-A890|SCH-A930|SCH-A950|SCH-A970|SCH-A990|SCH-I100|SCH-I110|SCH-I400|SCH-I405|SCH-I500|SCH-I510|SCH-I515|SCH-I600|SCH-I730|SCH-I760|SCH-I770|SCH-I830|SCH-I910|SCH-I920|SCH-I959|SCH-LC11|SCH-N150|SCH-N300|SCH-R100|SCH-R300|SCH-R351|SCH-R400|SCH-R410|SCH-T300|SCH-U310|SCH-U320|SCH-U350|SCH-U360|SCH-U365|SCH-U370|SCH-U380|SCH-U410|SCH-U430|SCH-U450|SCH-U460|SCH-U470|SCH-U490|SCH-U540|SCH-U550|SCH-U620|SCH-U640|SCH-U650|SCH-U660|SCH-U700|SCH-U740|SCH-U750|SCH-U810|SCH-U820|SCH-U900|SCH-U940|SCH-U960|SCS-26UC|SGH-A107|SGH-A117|SGH-A127|SGH-A137|SGH-A157|SGH-A167|SGH-A177|SGH-A187|SGH-A197|SGH-A227|SGH-A237|SGH-A257|SGH-A437|SGH-A517|SGH-A597|SGH-A637|SGH-A657|SGH-A667|SGH-A687|SGH-A697|SGH-A707|SGH-A717|SGH-A727|SGH-A737|SGH-A747|SGH-A767|SGH-A777|SGH-A797|SGH-A817|SGH-A827|SGH-A837|SGH-A847|SGH-A867|SGH-A877|SGH-A887|SGH-A897|SGH-A927|SGH-B100|SGH-B130|SGH-B200|SGH-B220|SGH-C100|SGH-C110|SGH-C120|SGH-C130|SGH-C140|SGH-C160|SGH-C170|SGH-C180|SGH-C200|SGH-C207|SGH-C210|SGH-C225|SGH-C230|SGH-C417|SGH-C450|SGH-D307|SGH-D347|SGH-D357|SGH-D407|SGH-D415|SGH-D780|SGH-D807|SGH-D980|SGH-E105|SGH-E200|SGH-E315|SGH-E316|SGH-E317|SGH-E335|SGH-E590|SGH-E635|SGH-E715|SGH-E890|SGH-F300|SGH-F480|SGH-I200|SGH-I300|SGH-I320|SGH-I550|SGH-I577|SGH-I600|SGH-I607|SGH-I617|SGH-I627|SGH-I637|SGH-I677|SGH-I700|SGH-I717|SGH-I727|SGH-i747M|SGH-I777|SGH-I780|SGH-I827|SGH-I847|SGH-I857|SGH-I896|SGH-I897|SGH-I900|SGH-I907|SGH-I917|SGH-I927|SGH-I937|SGH-I997|SGH-J150|SGH-J200|SGH-L170|SGH-L700|SGH-M110|SGH-M150|SGH-M200|SGH-N105|SGH-N500|SGH-N600|SGH-N620|SGH-N625|SGH-N700|SGH-N710|SGH-P107|SGH-P207|SGH-P300|SGH-P310|SGH-P520|SGH-P735|SGH-P777|SGH-Q105|SGH-R210|SGH-R220|SGH-R225|SGH-S105|SGH-S307|SGH-T109|SGH-T119|SGH-T139|SGH-T209|SGH-T219|SGH-T229|SGH-T239|SGH-T249|SGH-T259|SGH-T309|SGH-T319|SGH-T329|SGH-T339|SGH-T349|SGH-T359|SGH-T369|SGH-T379|SGH-T409|SGH-T429|SGH-T439|SGH-T459|SGH-T469|SGH-T479|SGH-T499|SGH-T509|SGH-T519|SGH-T539|SGH-T559|SGH-T589|SGH-T609|SGH-T619|SGH-T629|SGH-T639|SGH-T659|SGH-T669|SGH-T679|SGH-T709|SGH-T719|SGH-T729|SGH-T739|SGH-T746|SGH-T749|SGH-T759|SGH-T769|SGH-T809|SGH-T819|SGH-T839|SGH-T919|SGH-T929|SGH-T939|SGH-T959|SGH-T989|SGH-U100|SGH-U200|SGH-U800|SGH-V205|SGH-V206|SGH-X100|SGH-X105|SGH-X120|SGH-X140|SGH-X426|SGH-X427|SGH-X475|SGH-X495|SGH-X497|SGH-X507|SGH-X600|SGH-X610|SGH-X620|SGH-X630|SGH-X700|SGH-X820|SGH-X890|SGH-Z130|SGH-Z150|SGH-Z170|SGH-ZX10|SGH-ZX20|SHW-M110|SPH-A120|SPH-A400|SPH-A420|SPH-A460|SPH-A500|SPH-A560|SPH-A600|SPH-A620|SPH-A660|SPH-A700|SPH-A740|SPH-A760|SPH-A790|SPH-A800|SPH-A820|SPH-A840|SPH-A880|SPH-A900|SPH-A940|SPH-A960|SPH-D600|SPH-D700|SPH-D710|SPH-D720|SPH-I300|SPH-I325|SPH-I330|SPH-I350|SPH-I500|SPH-I600|SPH-I700|SPH-L700|SPH-M100|SPH-M220|SPH-M240|SPH-M300|SPH-M305|SPH-M320|SPH-M330|SPH-M350|SPH-M360|SPH-M370|SPH-M380|SPH-M510|SPH-M540|SPH-M550|SPH-M560|SPH-M570|SPH-M580|SPH-M610|SPH-M620|SPH-M630|SPH-M800|SPH-M810|SPH-M850|SPH-M900|SPH-M910|SPH-M920|SPH-M930|SPH-N100|SPH-N200|SPH-N240|SPH-N300|SPH-N400|SPH-Z400|SWC-E100|SCH-i909|GT-N7100|GT-N7105|SCH-I535|SM-N900A|SGH-I317|SGH-T999L|GT-S5360B|GT-I8262|GT-S6802|GT-S6312|GT-S6310|GT-S5312|GT-S5310|GT-I9105|GT-I8510|GT-S6790N|SM-G7105|SM-N9005|GT-S5301|GT-I9295|GT-I9195|SM-C101|GT-S7392|GT-S7560|GT-B7610|GT-I5510|GT-S7582|GT-S7530E|GT-I8750|SM-G9006V|SM-G9008V|SM-G9009D|SM-G900A|SM-G900D|SM-G900F|SM-G900H|SM-G900I|SM-G900J|SM-G900K|SM-G900L|SM-G900M|SM-G900P|SM-G900R4|SM-G900S|SM-G900T|SM-G900V|SM-G900W8|SHV-E160K|SCH-P709|SCH-P729|SM-T2558|GT-I9205|SM-G9350|SM-J120F|SM-G920F|SM-G920V|SM-G930F|SM-N910C|SM-A310F|GT-I9190|SM-J500FN|SM-G903F|SM-J330F",
        "LG": "\\bLG\\b;|LG[- ]?(C800|C900|E400|E610|E900|E-900|F160|F180K|F180L|F180S|730|855|L160|LS740|LS840|LS970|LU6200|MS690|MS695|MS770|MS840|MS870|MS910|P500|P700|P705|VM696|AS680|AS695|AX840|C729|E970|GS505|272|C395|E739BK|E960|L55C|L75C|LS696|LS860|P769BK|P350|P500|P509|P870|UN272|US730|VS840|VS950|LN272|LN510|LS670|LS855|LW690|MN270|MN510|P509|P769|P930|UN200|UN270|UN510|UN610|US670|US740|US760|UX265|UX840|VN271|VN530|VS660|VS700|VS740|VS750|VS910|VS920|VS930|VX9200|VX11000|AX840A|LW770|P506|P925|P999|E612|D955|D802|MS323|M257)|LM-G710",
        "Sony": "SonyST|SonyLT|SonyEricsson|SonyEricssonLT15iv|LT18i|E10i|LT28h|LT26w|SonyEricssonMT27i|C5303|C6902|C6903|C6906|C6943|D2533",
        "Asus": "Asus.*Galaxy|PadFone.*Mobile",
        "NokiaLumia": "Lumia [0-9]{3,4}",
        "Micromax": "Micromax.*\\b(A210|A92|A88|A72|A111|A110Q|A115|A116|A110|A90S|A26|A51|A35|A54|A25|A27|A89|A68|A65|A57|A90)\\b",
        "Palm": "PalmSource|Palm",
        "Vertu": "Vertu|Vertu.*Ltd|Vertu.*Ascent|Vertu.*Ayxta|Vertu.*Constellation(F|Quest)?|Vertu.*Monika|Vertu.*Signature",
        "Pantech": "PANTECH|IM-A850S|IM-A840S|IM-A830L|IM-A830K|IM-A830S|IM-A820L|IM-A810K|IM-A810S|IM-A800S|IM-T100K|IM-A725L|IM-A780L|IM-A775C|IM-A770K|IM-A760S|IM-A750K|IM-A740S|IM-A730S|IM-A720L|IM-A710K|IM-A690L|IM-A690S|IM-A650S|IM-A630K|IM-A600S|VEGA PTL21|PT003|P8010|ADR910L|P6030|P6020|P9070|P4100|P9060|P5000|CDM8992|TXT8045|ADR8995|IS11PT|P2030|P6010|P8000|PT002|IS06|CDM8999|P9050|PT001|TXT8040|P2020|P9020|P2000|P7040|P7000|C790",
        "Fly": "IQ230|IQ444|IQ450|IQ440|IQ442|IQ441|IQ245|IQ256|IQ236|IQ255|IQ235|IQ245|IQ275|IQ240|IQ285|IQ280|IQ270|IQ260|IQ250",
        "Wiko": "KITE 4G|HIGHWAY|GETAWAY|STAIRWAY|DARKSIDE|DARKFULL|DARKNIGHT|DARKMOON|SLIDE|WAX 4G|RAINBOW|BLOOM|SUNSET|GOA(?!nna)|LENNY|BARRY|IGGY|OZZY|CINK FIVE|CINK PEAX|CINK PEAX 2|CINK SLIM|CINK SLIM 2|CINK +|CINK KING|CINK PEAX|CINK SLIM|SUBLIM",
        "iMobile": "i-mobile (IQ|i-STYLE|idea|ZAA|Hitz)",
        "SimValley": "\\b(SP-80|XT-930|SX-340|XT-930|SX-310|SP-360|SP60|SPT-800|SP-120|SPT-800|SP-140|SPX-5|SPX-8|SP-100|SPX-8|SPX-12)\\b",
        "Wolfgang": "AT-B24D|AT-AS50HD|AT-AS40W|AT-AS55HD|AT-AS45q2|AT-B26D|AT-AS50Q",
        "Alcatel": "Alcatel",
        "Nintendo": "Nintendo (3DS|Switch)",
        "Amoi": "Amoi",
        "INQ": "INQ",
        "OnePlus": "ONEPLUS",
        "GenericPhone": "Tapatalk|PDA;|SAGEM|\\bmmp\\b|pocket|\\bpsp\\b|symbian|Smartphone|smartfon|treo|up.browser|up.link|vodafone|\\bwap\\b|nokia|Series40|Series60|S60|SonyEricsson|N900|MAUI.*WAP.*Browser"
    },
    "tablets": {
        "iPad": "iPad|iPad.*Mobile",
        "NexusTablet": "Android.*Nexus[\\s]+(7|9|10)",
        "GoogleTablet": "Android.*Pixel C",
        "SamsungTablet": "SAMSUNG.*Tablet|Galaxy.*Tab|SC-01C|GT-P1000|GT-P1003|GT-P1010|GT-P3105|GT-P6210|GT-P6800|GT-P6810|GT-P7100|GT-P7300|GT-P7310|GT-P7500|GT-P7510|SCH-I800|SCH-I815|SCH-I905|SGH-I957|SGH-I987|SGH-T849|SGH-T859|SGH-T869|SPH-P100|GT-P3100|GT-P3108|GT-P3110|GT-P5100|GT-P5110|GT-P6200|GT-P7320|GT-P7511|GT-N8000|GT-P8510|SGH-I497|SPH-P500|SGH-T779|SCH-I705|SCH-I915|GT-N8013|GT-P3113|GT-P5113|GT-P8110|GT-N8010|GT-N8005|GT-N8020|GT-P1013|GT-P6201|GT-P7501|GT-N5100|GT-N5105|GT-N5110|SHV-E140K|SHV-E140L|SHV-E140S|SHV-E150S|SHV-E230K|SHV-E230L|SHV-E230S|SHW-M180K|SHW-M180L|SHW-M180S|SHW-M180W|SHW-M300W|SHW-M305W|SHW-M380K|SHW-M380S|SHW-M380W|SHW-M430W|SHW-M480K|SHW-M480S|SHW-M480W|SHW-M485W|SHW-M486W|SHW-M500W|GT-I9228|SCH-P739|SCH-I925|GT-I9200|GT-P5200|GT-P5210|GT-P5210X|SM-T311|SM-T310|SM-T310X|SM-T210|SM-T210R|SM-T211|SM-P600|SM-P601|SM-P605|SM-P900|SM-P901|SM-T217|SM-T217A|SM-T217S|SM-P6000|SM-T3100|SGH-I467|XE500|SM-T110|GT-P5220|GT-I9200X|GT-N5110X|GT-N5120|SM-P905|SM-T111|SM-T2105|SM-T315|SM-T320|SM-T320X|SM-T321|SM-T520|SM-T525|SM-T530NU|SM-T230NU|SM-T330NU|SM-T900|XE500T1C|SM-P605V|SM-P905V|SM-T337V|SM-T537V|SM-T707V|SM-T807V|SM-P600X|SM-P900X|SM-T210X|SM-T230|SM-T230X|SM-T325|GT-P7503|SM-T531|SM-T330|SM-T530|SM-T705|SM-T705C|SM-T535|SM-T331|SM-T800|SM-T700|SM-T537|SM-T807|SM-P907A|SM-T337A|SM-T537A|SM-T707A|SM-T807A|SM-T237|SM-T807P|SM-P607T|SM-T217T|SM-T337T|SM-T807T|SM-T116NQ|SM-T116BU|SM-P550|SM-T350|SM-T550|SM-T9000|SM-P9000|SM-T705Y|SM-T805|GT-P3113|SM-T710|SM-T810|SM-T815|SM-T360|SM-T533|SM-T113|SM-T335|SM-T715|SM-T560|SM-T670|SM-T677|SM-T377|SM-T567|SM-T357T|SM-T555|SM-T561|SM-T713|SM-T719|SM-T813|SM-T819|SM-T580|SM-T355Y?|SM-T280|SM-T817A|SM-T820|SM-W700|SM-P580|SM-T587|SM-P350|SM-P555M|SM-P355M|SM-T113NU|SM-T815Y|SM-T585|SM-T285|SM-T825|SM-W708|SM-T835|SM-T830|SM-T837V|SM-T720|SM-T510|SM-T387V",
        "Kindle": "Kindle|Silk.*Accelerated|Android.*\\b(KFOT|KFTT|KFJWI|KFJWA|KFOTE|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|WFJWAE|KFSAWA|KFSAWI|KFASWI|KFARWI|KFFOWI|KFGIWI|KFMEWI)\\b|Android.*Silk\/[0-9.]+ like Chrome\/[0-9.]+ (?!Mobile)",
        "SurfaceTablet": "Windows NT [0-9.]+; ARM;.*(Tablet|ARMBJS)",
        "HPTablet": "HP Slate (7|8|10)|HP ElitePad 900|hp-tablet|EliteBook.*Touch|HP 8|Slate 21|HP SlateBook 10",
        "AsusTablet": "^.*PadFone((?!Mobile).)*$|Transformer|TF101|TF101G|TF300T|TF300TG|TF300TL|TF700T|TF700KL|TF701T|TF810C|ME171|ME301T|ME302C|ME371MG|ME370T|ME372MG|ME172V|ME173X|ME400C|Slider SL101|\\bK00F\\b|\\bK00C\\b|\\bK00E\\b|\\bK00L\\b|TX201LA|ME176C|ME102A|\\bM80TA\\b|ME372CL|ME560CG|ME372CG|ME302KL| K010 | K011 | K017 | K01E |ME572C|ME103K|ME170C|ME171C|\\bME70C\\b|ME581C|ME581CL|ME8510C|ME181C|P01Y|PO1MA|P01Z|\\bP027\\b|\\bP024\\b|\\bP00C\\b",
        "BlackBerryTablet": "PlayBook|RIM Tablet",
        "HTCtablet": "HTC_Flyer_P512|HTC Flyer|HTC Jetstream|HTC-P715a|HTC EVO View 4G|PG41200|PG09410",
        "MotorolaTablet": "xoom|sholest|MZ615|MZ605|MZ505|MZ601|MZ602|MZ603|MZ604|MZ606|MZ607|MZ608|MZ609|MZ615|MZ616|MZ617",
        "NookTablet": "Android.*Nook|NookColor|nook browser|BNRV200|BNRV200A|BNTV250|BNTV250A|BNTV400|BNTV600|LogicPD Zoom2",
        "AcerTablet": "Android.*; \\b(A100|A101|A110|A200|A210|A211|A500|A501|A510|A511|A700|A701|W500|W500P|W501|W501P|W510|W511|W700|G100|G100W|B1-A71|B1-710|B1-711|A1-810|A1-811|A1-830)\\b|W3-810|\\bA3-A10\\b|\\bA3-A11\\b|\\bA3-A20\\b|\\bA3-A30",
        "ToshibaTablet": "Android.*(AT100|AT105|AT200|AT205|AT270|AT275|AT300|AT305|AT1S5|AT500|AT570|AT700|AT830)|TOSHIBA.*FOLIO",
        "LGTablet": "\\bL-06C|LG-V909|LG-V900|LG-V700|LG-V510|LG-V500|LG-V410|LG-V400|LG-VK810\\b",
        "FujitsuTablet": "Android.*\\b(F-01D|F-02F|F-05E|F-10D|M532|Q572)\\b",
        "PrestigioTablet": "PMP3170B|PMP3270B|PMP3470B|PMP7170B|PMP3370B|PMP3570C|PMP5870C|PMP3670B|PMP5570C|PMP5770D|PMP3970B|PMP3870C|PMP5580C|PMP5880D|PMP5780D|PMP5588C|PMP7280C|PMP7280C3G|PMP7280|PMP7880D|PMP5597D|PMP5597|PMP7100D|PER3464|PER3274|PER3574|PER3884|PER5274|PER5474|PMP5097CPRO|PMP5097|PMP7380D|PMP5297C|PMP5297C_QUAD|PMP812E|PMP812E3G|PMP812F|PMP810E|PMP880TD|PMT3017|PMT3037|PMT3047|PMT3057|PMT7008|PMT5887|PMT5001|PMT5002",
        "LenovoTablet": "Lenovo TAB|Idea(Tab|Pad)( A1|A10| K1|)|ThinkPad([ ]+)?Tablet|YT3-850M|YT3-X90L|YT3-X90F|YT3-X90X|Lenovo.*(S2109|S2110|S5000|S6000|K3011|A3000|A3500|A1000|A2107|A2109|A1107|A5500|A7600|B6000|B8000|B8080)(-|)(FL|F|HV|H|)|TB-X103F|TB-X304X|TB-X304F|TB-X304L|TB-X505F|TB-X505L|TB-X505X|TB-X605F|TB-X605L|TB-8703F|TB-8703X|TB-8703N|TB-8704N|TB-8704F|TB-8704X|TB-8704V|TB-7304F|TB-7304I|TB-7304X|Tab2A7-10F|Tab2A7-20F|TB2-X30L|YT3-X50L|YT3-X50F|YT3-X50M|YT-X705F|YT-X703F|YT-X703L|YT-X705L|YT-X705X|TB2-X30F|TB2-X30L|TB2-X30M|A2107A-F|A2107A-H|TB3-730F|TB3-730M|TB3-730X|TB-7504F|TB-7504X",
        "DellTablet": "Venue 11|Venue 8|Venue 7|Dell Streak 10|Dell Streak 7",
        "YarvikTablet": "Android.*\\b(TAB210|TAB211|TAB224|TAB250|TAB260|TAB264|TAB310|TAB360|TAB364|TAB410|TAB411|TAB420|TAB424|TAB450|TAB460|TAB461|TAB464|TAB465|TAB467|TAB468|TAB07-100|TAB07-101|TAB07-150|TAB07-151|TAB07-152|TAB07-200|TAB07-201-3G|TAB07-210|TAB07-211|TAB07-212|TAB07-214|TAB07-220|TAB07-400|TAB07-485|TAB08-150|TAB08-200|TAB08-201-3G|TAB08-201-30|TAB09-100|TAB09-211|TAB09-410|TAB10-150|TAB10-201|TAB10-211|TAB10-400|TAB10-410|TAB13-201|TAB274EUK|TAB275EUK|TAB374EUK|TAB462EUK|TAB474EUK|TAB9-200)\\b",
        "MedionTablet": "Android.*\\bOYO\\b|LIFE.*(P9212|P9514|P9516|S9512)|LIFETAB",
        "ArnovaTablet": "97G4|AN10G2|AN7bG3|AN7fG3|AN8G3|AN8cG3|AN7G3|AN9G3|AN7dG3|AN7dG3ST|AN7dG3ChildPad|AN10bG3|AN10bG3DT|AN9G2",
        "IntensoTablet": "INM8002KP|INM1010FP|INM805ND|Intenso Tab|TAB1004",
        "IRUTablet": "M702pro",
        "MegafonTablet": "MegaFon V9|\\bZTE V9\\b|Android.*\\bMT7A\\b",
        "EbodaTablet": "E-Boda (Supreme|Impresspeed|Izzycomm|Essential)",
        "AllViewTablet": "Allview.*(Viva|Alldro|City|Speed|All TV|Frenzy|Quasar|Shine|TX1|AX1|AX2)",
        "ArchosTablet": "\\b(101G9|80G9|A101IT)\\b|Qilive 97R|Archos5|\\bARCHOS (70|79|80|90|97|101|FAMILYPAD|)(b|c|)(G10| Cobalt| TITANIUM(HD|)| Xenon| Neon|XSK| 2| XS 2| PLATINUM| CARBON|GAMEPAD)\\b",
        "AinolTablet": "NOVO7|NOVO8|NOVO10|Novo7Aurora|Novo7Basic|NOVO7PALADIN|novo9-Spark",
        "NokiaLumiaTablet": "Lumia 2520",
        "SonyTablet": "Sony.*Tablet|Xperia Tablet|Sony Tablet S|SO-03E|SGPT12|SGPT13|SGPT114|SGPT121|SGPT122|SGPT123|SGPT111|SGPT112|SGPT113|SGPT131|SGPT132|SGPT133|SGPT211|SGPT212|SGPT213|SGP311|SGP312|SGP321|EBRD1101|EBRD1102|EBRD1201|SGP351|SGP341|SGP511|SGP512|SGP521|SGP541|SGP551|SGP621|SGP641|SGP612|SOT31|SGP771|SGP611|SGP612|SGP712",
        "PhilipsTablet": "\\b(PI2010|PI3000|PI3100|PI3105|PI3110|PI3205|PI3210|PI3900|PI4010|PI7000|PI7100)\\b",
        "CubeTablet": "Android.*(K8GT|U9GT|U10GT|U16GT|U17GT|U18GT|U19GT|U20GT|U23GT|U30GT)|CUBE U8GT",
        "CobyTablet": "MID1042|MID1045|MID1125|MID1126|MID7012|MID7014|MID7015|MID7034|MID7035|MID7036|MID7042|MID7048|MID7127|MID8042|MID8048|MID8127|MID9042|MID9740|MID9742|MID7022|MID7010",
        "MIDTablet": "M9701|M9000|M9100|M806|M1052|M806|T703|MID701|MID713|MID710|MID727|MID760|MID830|MID728|MID933|MID125|MID810|MID732|MID120|MID930|MID800|MID731|MID900|MID100|MID820|MID735|MID980|MID130|MID833|MID737|MID960|MID135|MID860|MID736|MID140|MID930|MID835|MID733|MID4X10",
        "MSITablet": "MSI \\b(Primo 73K|Primo 73L|Primo 81L|Primo 77|Primo 93|Primo 75|Primo 76|Primo 73|Primo 81|Primo 91|Primo 90|Enjoy 71|Enjoy 7|Enjoy 10)\\b",
        "SMiTTablet": "Android.*(\\bMID\\b|MID-560|MTV-T1200|MTV-PND531|MTV-P1101|MTV-PND530)",
        "RockChipTablet": "Android.*(RK2818|RK2808A|RK2918|RK3066)|RK2738|RK2808A",
        "FlyTablet": "IQ310|Fly Vision",
        "bqTablet": "Android.*(bq)?.*\\b(Elcano|Curie|Edison|Maxwell|Kepler|Pascal|Tesla|Hypatia|Platon|Newton|Livingstone|Cervantes|Avant|Aquaris ([E|M]10|M8))\\b|Maxwell.*Lite|Maxwell.*Plus",
        "HuaweiTablet": "MediaPad|MediaPad 7 Youth|IDEOS S7|S7-201c|S7-202u|S7-101|S7-103|S7-104|S7-105|S7-106|S7-201|S7-Slim|M2-A01L|BAH-L09|BAH-W09|AGS-L09|CMR-AL19",
        "NecTablet": "\\bN-06D|\\bN-08D",
        "PantechTablet": "Pantech.*P4100",
        "BronchoTablet": "Broncho.*(N701|N708|N802|a710)",
        "VersusTablet": "TOUCHPAD.*[78910]|\\bTOUCHTAB\\b",
        "ZyncTablet": "z1000|Z99 2G|z930|z990|z909|Z919|z900",
        "PositivoTablet": "TB07STA|TB10STA|TB07FTA|TB10FTA",
        "NabiTablet": "Android.*\\bNabi",
        "KoboTablet": "Kobo Touch|\\bK080\\b|\\bVox\\b Build|\\bArc\\b Build",
        "DanewTablet": "DSlide.*\\b(700|701R|702|703R|704|802|970|971|972|973|974|1010|1012)\\b",
        "TexetTablet": "NaviPad|TB-772A|TM-7045|TM-7055|TM-9750|TM-7016|TM-7024|TM-7026|TM-7041|TM-7043|TM-7047|TM-8041|TM-9741|TM-9747|TM-9748|TM-9751|TM-7022|TM-7021|TM-7020|TM-7011|TM-7010|TM-7023|TM-7025|TM-7037W|TM-7038W|TM-7027W|TM-9720|TM-9725|TM-9737W|TM-1020|TM-9738W|TM-9740|TM-9743W|TB-807A|TB-771A|TB-727A|TB-725A|TB-719A|TB-823A|TB-805A|TB-723A|TB-715A|TB-707A|TB-705A|TB-709A|TB-711A|TB-890HD|TB-880HD|TB-790HD|TB-780HD|TB-770HD|TB-721HD|TB-710HD|TB-434HD|TB-860HD|TB-840HD|TB-760HD|TB-750HD|TB-740HD|TB-730HD|TB-722HD|TB-720HD|TB-700HD|TB-500HD|TB-470HD|TB-431HD|TB-430HD|TB-506|TB-504|TB-446|TB-436|TB-416|TB-146SE|TB-126SE",
        "PlaystationTablet": "Playstation.*(Portable|Vita)",
        "TrekstorTablet": "ST10416-1|VT10416-1|ST70408-1|ST702xx-1|ST702xx-2|ST80208|ST97216|ST70104-2|VT10416-2|ST10216-2A|SurfTab",
        "PyleAudioTablet": "\\b(PTBL10CEU|PTBL10C|PTBL72BC|PTBL72BCEU|PTBL7CEU|PTBL7C|PTBL92BC|PTBL92BCEU|PTBL9CEU|PTBL9CUK|PTBL9C)\\b",
        "AdvanTablet": "Android.* \\b(E3A|T3X|T5C|T5B|T3E|T3C|T3B|T1J|T1F|T2A|T1H|T1i|E1C|T1-E|T5-A|T4|E1-B|T2Ci|T1-B|T1-D|O1-A|E1-A|T1-A|T3A|T4i)\\b ",
        "DanyTechTablet": "Genius Tab G3|Genius Tab S2|Genius Tab Q3|Genius Tab G4|Genius Tab Q4|Genius Tab G-II|Genius TAB GII|Genius TAB GIII|Genius Tab S1",
        "GalapadTablet": "Android.*\\bG1\\b(?!\\))",
        "MicromaxTablet": "Funbook|Micromax.*\\b(P250|P560|P360|P362|P600|P300|P350|P500|P275)\\b",
        "KarbonnTablet": "Android.*\\b(A39|A37|A34|ST8|ST10|ST7|Smart Tab3|Smart Tab2)\\b",
        "AllFineTablet": "Fine7 Genius|Fine7 Shine|Fine7 Air|Fine8 Style|Fine9 More|Fine10 Joy|Fine11 Wide",
        "PROSCANTablet": "\\b(PEM63|PLT1023G|PLT1041|PLT1044|PLT1044G|PLT1091|PLT4311|PLT4311PL|PLT4315|PLT7030|PLT7033|PLT7033D|PLT7035|PLT7035D|PLT7044K|PLT7045K|PLT7045KB|PLT7071KG|PLT7072|PLT7223G|PLT7225G|PLT7777G|PLT7810K|PLT7849G|PLT7851G|PLT7852G|PLT8015|PLT8031|PLT8034|PLT8036|PLT8080K|PLT8082|PLT8088|PLT8223G|PLT8234G|PLT8235G|PLT8816K|PLT9011|PLT9045K|PLT9233G|PLT9735|PLT9760G|PLT9770G)\\b",
        "YONESTablet": "BQ1078|BC1003|BC1077|RK9702|BC9730|BC9001|IT9001|BC7008|BC7010|BC708|BC728|BC7012|BC7030|BC7027|BC7026",
        "ChangJiaTablet": "TPC7102|TPC7103|TPC7105|TPC7106|TPC7107|TPC7201|TPC7203|TPC7205|TPC7210|TPC7708|TPC7709|TPC7712|TPC7110|TPC8101|TPC8103|TPC8105|TPC8106|TPC8203|TPC8205|TPC8503|TPC9106|TPC9701|TPC97101|TPC97103|TPC97105|TPC97106|TPC97111|TPC97113|TPC97203|TPC97603|TPC97809|TPC97205|TPC10101|TPC10103|TPC10106|TPC10111|TPC10203|TPC10205|TPC10503",
        "GUTablet": "TX-A1301|TX-M9002|Q702|kf026",
        "PointOfViewTablet": "TAB-P506|TAB-navi-7-3G-M|TAB-P517|TAB-P-527|TAB-P701|TAB-P703|TAB-P721|TAB-P731N|TAB-P741|TAB-P825|TAB-P905|TAB-P925|TAB-PR945|TAB-PL1015|TAB-P1025|TAB-PI1045|TAB-P1325|TAB-PROTAB[0-9]+|TAB-PROTAB25|TAB-PROTAB26|TAB-PROTAB27|TAB-PROTAB26XL|TAB-PROTAB2-IPS9|TAB-PROTAB30-IPS9|TAB-PROTAB25XXL|TAB-PROTAB26-IPS10|TAB-PROTAB30-IPS10",
        "OvermaxTablet": "OV-(SteelCore|NewBase|Basecore|Baseone|Exellen|Quattor|EduTab|Solution|ACTION|BasicTab|TeddyTab|MagicTab|Stream|TB-08|TB-09)|Qualcore 1027",
        "HCLTablet": "HCL.*Tablet|Connect-3G-2.0|Connect-2G-2.0|ME Tablet U1|ME Tablet U2|ME Tablet G1|ME Tablet X1|ME Tablet Y2|ME Tablet Sync",
        "DPSTablet": "DPS Dream 9|DPS Dual 7",
        "VistureTablet": "V97 HD|i75 3G|Visture V4( HD)?|Visture V5( HD)?|Visture V10",
        "CrestaTablet": "CTP(-)?810|CTP(-)?818|CTP(-)?828|CTP(-)?838|CTP(-)?888|CTP(-)?978|CTP(-)?980|CTP(-)?987|CTP(-)?988|CTP(-)?989",
        "MediatekTablet": "\\bMT8125|MT8389|MT8135|MT8377\\b",
        "ConcordeTablet": "Concorde([ ]+)?Tab|ConCorde ReadMan",
        "GoCleverTablet": "GOCLEVER TAB|A7GOCLEVER|M1042|M7841|M742|R1042BK|R1041|TAB A975|TAB A7842|TAB A741|TAB A741L|TAB M723G|TAB M721|TAB A1021|TAB I921|TAB R721|TAB I720|TAB T76|TAB R70|TAB R76.2|TAB R106|TAB R83.2|TAB M813G|TAB I721|GCTA722|TAB I70|TAB I71|TAB S73|TAB R73|TAB R74|TAB R93|TAB R75|TAB R76.1|TAB A73|TAB A93|TAB A93.2|TAB T72|TAB R83|TAB R974|TAB R973|TAB A101|TAB A103|TAB A104|TAB A104.2|R105BK|M713G|A972BK|TAB A971|TAB R974.2|TAB R104|TAB R83.3|TAB A1042",
        "ModecomTablet": "FreeTAB 9000|FreeTAB 7.4|FreeTAB 7004|FreeTAB 7800|FreeTAB 2096|FreeTAB 7.5|FreeTAB 1014|FreeTAB 1001 |FreeTAB 8001|FreeTAB 9706|FreeTAB 9702|FreeTAB 7003|FreeTAB 7002|FreeTAB 1002|FreeTAB 7801|FreeTAB 1331|FreeTAB 1004|FreeTAB 8002|FreeTAB 8014|FreeTAB 9704|FreeTAB 1003",
        "VoninoTablet": "\\b(Argus[ _]?S|Diamond[ _]?79HD|Emerald[ _]?78E|Luna[ _]?70C|Onyx[ _]?S|Onyx[ _]?Z|Orin[ _]?HD|Orin[ _]?S|Otis[ _]?S|SpeedStar[ _]?S|Magnet[ _]?M9|Primus[ _]?94[ _]?3G|Primus[ _]?94HD|Primus[ _]?QS|Android.*\\bQ8\\b|Sirius[ _]?EVO[ _]?QS|Sirius[ _]?QS|Spirit[ _]?S)\\b",
        "ECSTablet": "V07OT2|TM105A|S10OT1|TR10CS1",
        "StorexTablet": "eZee[_']?(Tab|Go)[0-9]+|TabLC7|Looney Tunes Tab",
        "VodafoneTablet": "SmartTab([ ]+)?[0-9]+|SmartTabII10|SmartTabII7|VF-1497|VFD 1400",
        "EssentielBTablet": "Smart[ ']?TAB[ ]+?[0-9]+|Family[ ']?TAB2",
        "RossMoorTablet": "RM-790|RM-997|RMD-878G|RMD-974R|RMT-705A|RMT-701|RME-601|RMT-501|RMT-711",
        "iMobileTablet": "i-mobile i-note",
        "TolinoTablet": "tolino tab [0-9.]+|tolino shine",
        "AudioSonicTablet": "\\bC-22Q|T7-QC|T-17B|T-17P\\b",
        "AMPETablet": "Android.* A78 ",
        "SkkTablet": "Android.* (SKYPAD|PHOENIX|CYCLOPS)",
        "TecnoTablet": "TECNO P9|TECNO DP8D",
        "JXDTablet": "Android.* \\b(F3000|A3300|JXD5000|JXD3000|JXD2000|JXD300B|JXD300|S5800|S7800|S602b|S5110b|S7300|S5300|S602|S603|S5100|S5110|S601|S7100a|P3000F|P3000s|P101|P200s|P1000m|P200m|P9100|P1000s|S6600b|S908|P1000|P300|S18|S6600|S9100)\\b",
        "iJoyTablet": "Tablet (Spirit 7|Essentia|Galatea|Fusion|Onix 7|Landa|Titan|Scooby|Deox|Stella|Themis|Argon|Unique 7|Sygnus|Hexen|Finity 7|Cream|Cream X2|Jade|Neon 7|Neron 7|Kandy|Scape|Saphyr 7|Rebel|Biox|Rebel|Rebel 8GB|Myst|Draco 7|Myst|Tab7-004|Myst|Tadeo Jones|Tablet Boing|Arrow|Draco Dual Cam|Aurix|Mint|Amity|Revolution|Finity 9|Neon 9|T9w|Amity 4GB Dual Cam|Stone 4GB|Stone 8GB|Andromeda|Silken|X2|Andromeda II|Halley|Flame|Saphyr 9,7|Touch 8|Planet|Triton|Unique 10|Hexen 10|Memphis 4GB|Memphis 8GB|Onix 10)",
        "FX2Tablet": "FX2 PAD7|FX2 PAD10",
        "XoroTablet": "KidsPAD 701|PAD[ ]?712|PAD[ ]?714|PAD[ ]?716|PAD[ ]?717|PAD[ ]?718|PAD[ ]?720|PAD[ ]?721|PAD[ ]?722|PAD[ ]?790|PAD[ ]?792|PAD[ ]?900|PAD[ ]?9715D|PAD[ ]?9716DR|PAD[ ]?9718DR|PAD[ ]?9719QR|PAD[ ]?9720QR|TelePAD1030|Telepad1032|TelePAD730|TelePAD731|TelePAD732|TelePAD735Q|TelePAD830|TelePAD9730|TelePAD795|MegaPAD 1331|MegaPAD 1851|MegaPAD 2151",
        "ViewsonicTablet": "ViewPad 10pi|ViewPad 10e|ViewPad 10s|ViewPad E72|ViewPad7|ViewPad E100|ViewPad 7e|ViewSonic VB733|VB100a",
        "VerizonTablet": "QTAQZ3|QTAIR7|QTAQTZ3|QTASUN1|QTASUN2|QTAXIA1",
        "OdysTablet": "LOOX|XENO10|ODYS[ -](Space|EVO|Xpress|NOON)|\\bXELIO\\b|Xelio10Pro|XELIO7PHONETAB|XELIO10EXTREME|XELIOPT2|NEO_QUAD10",
        "CaptivaTablet": "CAPTIVA PAD",
        "IconbitTablet": "NetTAB|NT-3702|NT-3702S|NT-3702S|NT-3603P|NT-3603P|NT-0704S|NT-0704S|NT-3805C|NT-3805C|NT-0806C|NT-0806C|NT-0909T|NT-0909T|NT-0907S|NT-0907S|NT-0902S|NT-0902S",
        "TeclastTablet": "T98 4G|\\bP80\\b|\\bX90HD\\b|X98 Air|X98 Air 3G|\\bX89\\b|P80 3G|\\bX80h\\b|P98 Air|\\bX89HD\\b|P98 3G|\\bP90HD\\b|P89 3G|X98 3G|\\bP70h\\b|P79HD 3G|G18d 3G|\\bP79HD\\b|\\bP89s\\b|\\bA88\\b|\\bP10HD\\b|\\bP19HD\\b|G18 3G|\\bP78HD\\b|\\bA78\\b|\\bP75\\b|G17s 3G|G17h 3G|\\bP85t\\b|\\bP90\\b|\\bP11\\b|\\bP98t\\b|\\bP98HD\\b|\\bG18d\\b|\\bP85s\\b|\\bP11HD\\b|\\bP88s\\b|\\bA80HD\\b|\\bA80se\\b|\\bA10h\\b|\\bP89\\b|\\bP78s\\b|\\bG18\\b|\\bP85\\b|\\bA70h\\b|\\bA70\\b|\\bG17\\b|\\bP18\\b|\\bA80s\\b|\\bA11s\\b|\\bP88HD\\b|\\bA80h\\b|\\bP76s\\b|\\bP76h\\b|\\bP98\\b|\\bA10HD\\b|\\bP78\\b|\\bP88\\b|\\bA11\\b|\\bA10t\\b|\\bP76a\\b|\\bP76t\\b|\\bP76e\\b|\\bP85HD\\b|\\bP85a\\b|\\bP86\\b|\\bP75HD\\b|\\bP76v\\b|\\bA12\\b|\\bP75a\\b|\\bA15\\b|\\bP76Ti\\b|\\bP81HD\\b|\\bA10\\b|\\bT760VE\\b|\\bT720HD\\b|\\bP76\\b|\\bP73\\b|\\bP71\\b|\\bP72\\b|\\bT720SE\\b|\\bC520Ti\\b|\\bT760\\b|\\bT720VE\\b|T720-3GE|T720-WiFi",
        "OndaTablet": "\\b(V975i|Vi30|VX530|V701|Vi60|V701s|Vi50|V801s|V719|Vx610w|VX610W|V819i|Vi10|VX580W|Vi10|V711s|V813|V811|V820w|V820|Vi20|V711|VI30W|V712|V891w|V972|V819w|V820w|Vi60|V820w|V711|V813s|V801|V819|V975s|V801|V819|V819|V818|V811|V712|V975m|V101w|V961w|V812|V818|V971|V971s|V919|V989|V116w|V102w|V973|Vi40)\\b[\\s]+|V10 \\b4G\\b",
        "JaytechTablet": "TPC-PA762",
        "BlaupunktTablet": "Endeavour 800NG|Endeavour 1010",
        "DigmaTablet": "\\b(iDx10|iDx9|iDx8|iDx7|iDxD7|iDxD8|iDsQ8|iDsQ7|iDsQ8|iDsD10|iDnD7|3TS804H|iDsQ11|iDj7|iDs10)\\b",
        "EvolioTablet": "ARIA_Mini_wifi|Aria[ _]Mini|Evolio X10|Evolio X7|Evolio X8|\\bEvotab\\b|\\bNeura\\b",
        "LavaTablet": "QPAD E704|\\bIvoryS\\b|E-TAB IVORY|\\bE-TAB\\b",
        "AocTablet": "MW0811|MW0812|MW0922|MTK8382|MW1031|MW0831|MW0821|MW0931|MW0712",
        "MpmanTablet": "MP11 OCTA|MP10 OCTA|MPQC1114|MPQC1004|MPQC994|MPQC974|MPQC973|MPQC804|MPQC784|MPQC780|\\bMPG7\\b|MPDCG75|MPDCG71|MPDC1006|MP101DC|MPDC9000|MPDC905|MPDC706HD|MPDC706|MPDC705|MPDC110|MPDC100|MPDC99|MPDC97|MPDC88|MPDC8|MPDC77|MP709|MID701|MID711|MID170|MPDC703|MPQC1010",
        "CelkonTablet": "CT695|CT888|CT[\\s]?910|CT7 Tab|CT9 Tab|CT3 Tab|CT2 Tab|CT1 Tab|C820|C720|\\bCT-1\\b",
        "WolderTablet": "miTab \\b(DIAMOND|SPACE|BROOKLYN|NEO|FLY|MANHATTAN|FUNK|EVOLUTION|SKY|GOCAR|IRON|GENIUS|POP|MINT|EPSILON|BROADWAY|JUMP|HOP|LEGEND|NEW AGE|LINE|ADVANCE|FEEL|FOLLOW|LIKE|LINK|LIVE|THINK|FREEDOM|CHICAGO|CLEVELAND|BALTIMORE-GH|IOWA|BOSTON|SEATTLE|PHOENIX|DALLAS|IN 101|MasterChef)\\b",
        "MediacomTablet": "M-MPI10C3G|M-SP10EG|M-SP10EGP|M-SP10HXAH|M-SP7HXAH|M-SP10HXBH|M-SP8HXAH|M-SP8MXA",
        "MiTablet": "\\bMI PAD\\b|\\bHM NOTE 1W\\b",
        "NibiruTablet": "Nibiru M1|Nibiru Jupiter One",
        "NexoTablet": "NEXO NOVA|NEXO 10|NEXO AVIO|NEXO FREE|NEXO GO|NEXO EVO|NEXO 3G|NEXO SMART|NEXO KIDDO|NEXO MOBI",
        "LeaderTablet": "TBLT10Q|TBLT10I|TBL-10WDKB|TBL-10WDKBO2013|TBL-W230V2|TBL-W450|TBL-W500|SV572|TBLT7I|TBA-AC7-8G|TBLT79|TBL-8W16|TBL-10W32|TBL-10WKB|TBL-W100",
        "UbislateTablet": "UbiSlate[\\s]?7C",
        "PocketBookTablet": "Pocketbook",
        "KocasoTablet": "\\b(TB-1207)\\b",
        "HisenseTablet": "\\b(F5281|E2371)\\b",
        "Hudl": "Hudl HT7S3|Hudl 2",
        "TelstraTablet": "T-Hub2",
        "GenericTablet": "Android.*\\b97D\\b|Tablet(?!.*PC)|BNTV250A|MID-WCDMA|LogicPD Zoom2|\\bA7EB\\b|CatNova8|A1_07|CT704|CT1002|\\bM721\\b|rk30sdk|\\bEVOTAB\\b|M758A|ET904|ALUMIUM10|Smartfren Tab|Endeavour 1010|Tablet-PC-4|Tagi Tab|\\bM6pro\\b|CT1020W|arc 10HD|\\bTP750\\b|\\bQTAQZ3\\b|WVT101|TM1088|KT107"
    },
    "oss": {
        "AndroidOS": "Android",
        "BlackBerryOS": "blackberry|\\bBB10\\b|rim tablet os",
        "PalmOS": "PalmOS|avantgo|blazer|elaine|hiptop|palm|plucker|xiino",
        "SymbianOS": "Symbian|SymbOS|Series60|Series40|SYB-[0-9]+|\\bS60\\b",
        "WindowsMobileOS": "Windows CE.*(PPC|Smartphone|Mobile|[0-9]{3}x[0-9]{3})|Windows Mobile|Windows Phone [0-9.]+|WCE;",
        "WindowsPhoneOS": "Windows Phone 10.0|Windows Phone 8.1|Windows Phone 8.0|Windows Phone OS|XBLWP7|ZuneWP7|Windows NT 6.[23]; ARM;",
        "iOS": "\\biPhone.*Mobile|\\biPod|\\biPad|AppleCoreMedia",
        "iPadOS": "CPU OS 13",
        "MeeGoOS": "MeeGo",
        "MaemoOS": "Maemo",
        "JavaOS": "J2ME\/|\\bMIDP\\b|\\bCLDC\\b",
        "webOS": "webOS|hpwOS",
        "badaOS": "\\bBada\\b",
        "BREWOS": "BREW"
    },
    "uas": {
        "Chrome": "\\bCrMo\\b|CriOS|Android.*Chrome\/[.0-9]* (Mobile)?",
        "Dolfin": "\\bDolfin\\b",
        "Opera": "Opera.*Mini|Opera.*Mobi|Android.*Opera|Mobile.*OPR\/[0-9.]+$|Coast\/[0-9.]+",
        "Skyfire": "Skyfire",
        "Edge": "Mobile Safari\/[.0-9]* Edge",
        "IE": "IEMobile|MSIEMobile",
        "Firefox": "fennec|firefox.*maemo|(Mobile|Tablet).*Firefox|Firefox.*Mobile|FxiOS",
        "Bolt": "bolt",
        "TeaShark": "teashark",
        "Blazer": "Blazer",
        "Safari": "Version.*Mobile.*Safari|Safari.*Mobile|MobileSafari",
        "WeChat": "\\bMicroMessenger\\b",
        "UCBrowser": "UC.*Browser|UCWEB",
        "baiduboxapp": "baiduboxapp",
        "baidubrowser": "baidubrowser",
        "DiigoBrowser": "DiigoBrowser",
        "Mercury": "\\bMercury\\b",
        "ObigoBrowser": "Obigo",
        "NetFront": "NF-Browser",
        "GenericBrowser": "NokiaBrowser|OviBrowser|OneBrowser|TwonkyBeamBrowser|SEMC.*Browser|FlyFlow|Minimo|NetFront|Novarra-Vision|MQQBrowser|MicroMessenger",
        "PaleMoon": "Android.*PaleMoon|Mobile.*PaleMoon"
    },
    "props": {
        "Mobile": "Mobile\/[VER]",
        "Build": "Build\/[VER]",
        "Version": "Version\/[VER]",
        "VendorID": "VendorID\/[VER]",
        "iPad": "iPad.*CPU[a-z ]+[VER]",
        "iPhone": "iPhone.*CPU[a-z ]+[VER]",
        "iPod": "iPod.*CPU[a-z ]+[VER]",
        "Kindle": "Kindle\/[VER]",
        "Chrome": [
            "Chrome\/[VER]",
            "CriOS\/[VER]",
            "CrMo\/[VER]"
        ],
        "Coast": [
            "Coast\/[VER]"
        ],
        "Dolfin": "Dolfin\/[VER]",
        "Firefox": [
            "Firefox\/[VER]",
            "FxiOS\/[VER]"
        ],
        "Fennec": "Fennec\/[VER]",
        "Edge": "Edge\/[VER]",
        "IE": [
            "IEMobile\/[VER];",
            "IEMobile [VER]",
            "MSIE [VER];",
            "Trident\/[0-9.]+;.*rv:[VER]"
        ],
        "NetFront": "NetFront\/[VER]",
        "NokiaBrowser": "NokiaBrowser\/[VER]",
        "Opera": [
            " OPR\/[VER]",
            "Opera Mini\/[VER]",
            "Version\/[VER]"
        ],
        "Opera Mini": "Opera Mini\/[VER]",
        "Opera Mobi": "Version\/[VER]",
        "UCBrowser": [
            "UCWEB[VER]",
            "UC.*Browser\/[VER]"
        ],
        "MQQBrowser": "MQQBrowser\/[VER]",
        "MicroMessenger": "MicroMessenger\/[VER]",
        "baiduboxapp": "baiduboxapp\/[VER]",
        "baidubrowser": "baidubrowser\/[VER]",
        "SamsungBrowser": "SamsungBrowser\/[VER]",
        "Iron": "Iron\/[VER]",
        "Safari": [
            "Version\/[VER]",
            "Safari\/[VER]"
        ],
        "Skyfire": "Skyfire\/[VER]",
        "Tizen": "Tizen\/[VER]",
        "Webkit": "webkit[ \/][VER]",
        "PaleMoon": "PaleMoon\/[VER]",
        "Gecko": "Gecko\/[VER]",
        "Trident": "Trident\/[VER]",
        "Presto": "Presto\/[VER]",
        "Goanna": "Goanna\/[VER]",
        "iOS": " \\bi?OS\\b [VER][ ;]{1}",
        "Android": "Android [VER]",
        "BlackBerry": [
            "BlackBerry[\\w]+\/[VER]",
            "BlackBerry.*Version\/[VER]",
            "Version\/[VER]"
        ],
        "BREW": "BREW [VER]",
        "Java": "Java\/[VER]",
        "Windows Phone OS": [
            "Windows Phone OS [VER]",
            "Windows Phone [VER]"
        ],
        "Windows Phone": "Windows Phone [VER]",
        "Windows CE": "Windows CE\/[VER]",
        "Windows NT": "Windows NT [VER]",
        "Symbian": [
            "SymbianOS\/[VER]",
            "Symbian\/[VER]"
        ],
        "webOS": [
            "webOS\/[VER]",
            "hpwOS\/[VER];"
        ]
    },
    "utils": {
        "Bot": "Googlebot|facebookexternalhit|Google-AMPHTML|s~amp-validator|AdsBot-Google|Google Keyword Suggestion|Facebot|YandexBot|YandexMobileBot|bingbot|ia_archiver|AhrefsBot|Ezooms|GSLFbot|WBSearchBot|Twitterbot|TweetmemeBot|Twikle|PaperLiBot|Wotbox|UnwindFetchor|Exabot|MJ12bot|YandexImages|TurnitinBot|Pingdom|contentkingapp",
        "MobileBot": "Googlebot-Mobile|AdsBot-Google-Mobile|YahooSeeker\/M1A1-R2D2",
        "DesktopMode": "WPDesktop",
        "TV": "SonyDTV|HbbTV",
        "WebKit": "(webkit)[ \/]([\\w.]+)",
        "Console": "\\b(Nintendo|Nintendo WiiU|Nintendo 3DS|Nintendo Switch|PLAYSTATION|Xbox)\\b",
        "Watch": "SM-V700"
    }
};

    // following patterns come from http://detectmobilebrowsers.com/
    impl.detectMobileBrowsers = {
        fullPattern: /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,
        shortPattern: /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,
        tabletPattern: /android|ipad|playbook|silk/i
    };

    var hasOwnProp = Object.prototype.hasOwnProperty,
        isArray;

    impl.FALLBACK_PHONE = 'UnknownPhone';
    impl.FALLBACK_TABLET = 'UnknownTablet';
    impl.FALLBACK_MOBILE = 'UnknownMobile';

    isArray = ('isArray' in Array) ?
        Array.isArray : function (value) { return Object.prototype.toString.call(value) === '[object Array]'; };

    function equalIC(a, b) {
        return a != null && b != null && a.toLowerCase() === b.toLowerCase();
    }

    function containsIC(array, value) {
        var valueLC, i, len = array.length;
        if (!len || !value) {
            return false;
        }
        valueLC = value.toLowerCase();
        for (i = 0; i < len; ++i) {
            if (valueLC === array[i].toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    function convertPropsToRegExp(object) {
        for (var key in object) {
            if (hasOwnProp.call(object, key)) {
                object[key] = new RegExp(object[key], 'i');
            }
        }
    }

    function prepareUserAgent(userAgent) {
        return (userAgent || '').substr(0, 500); // mitigate vulnerable to ReDoS
    }

    (function init() {
        var key, values, value, i, len, verPos, mobileDetectRules = impl.mobileDetectRules;
        for (key in mobileDetectRules.props) {
            if (hasOwnProp.call(mobileDetectRules.props, key)) {
                values = mobileDetectRules.props[key];
                if (!isArray(values)) {
                    values = [values];
                }
                len = values.length;
                for (i = 0; i < len; ++i) {
                    value = values[i];
                    verPos = value.indexOf('[VER]');
                    if (verPos >= 0) {
                        value = value.substring(0, verPos) + '([\\w._\\+]+)' + value.substring(verPos + 5);
                    }
                    values[i] = new RegExp(value, 'i');
                }
                mobileDetectRules.props[key] = values;
            }
        }
        convertPropsToRegExp(mobileDetectRules.oss);
        convertPropsToRegExp(mobileDetectRules.phones);
        convertPropsToRegExp(mobileDetectRules.tablets);
        convertPropsToRegExp(mobileDetectRules.uas);
        convertPropsToRegExp(mobileDetectRules.utils);

        // copy some patterns to oss0 which are tested first (see issue#15)
        mobileDetectRules.oss0 = {
            WindowsPhoneOS: mobileDetectRules.oss.WindowsPhoneOS,
            WindowsMobileOS: mobileDetectRules.oss.WindowsMobileOS
        };
    }());

    /**
     * Test userAgent string against a set of rules and find the first matched key.
     * @param {Object} rules (key is String, value is RegExp)
     * @param {String} userAgent the navigator.userAgent (or HTTP-Header 'User-Agent').
     * @returns {String|null} the matched key if found, otherwise <tt>null</tt>
     * @private
     */
    impl.findMatch = function(rules, userAgent) {
        for (var key in rules) {
            if (hasOwnProp.call(rules, key)) {
                if (rules[key].test(userAgent)) {
                    return key;
                }
            }
        }
        return null;
    };

    /**
     * Test userAgent string against a set of rules and return an array of matched keys.
     * @param {Object} rules (key is String, value is RegExp)
     * @param {String} userAgent the navigator.userAgent (or HTTP-Header 'User-Agent').
     * @returns {Array} an array of matched keys, may be empty when there is no match, but not <tt>null</tt>
     * @private
     */
    impl.findMatches = function(rules, userAgent) {
        var result = [];
        for (var key in rules) {
            if (hasOwnProp.call(rules, key)) {
                if (rules[key].test(userAgent)) {
                    result.push(key);
                }
            }
        }
        return result;
    };

    /**
     * Check the version of the given property in the User-Agent.
     *
     * @param {String} propertyName
     * @param {String} userAgent
     * @return {String} version or <tt>null</tt> if version not found
     * @private
     */
    impl.getVersionStr = function (propertyName, userAgent) {
        var props = impl.mobileDetectRules.props, patterns, i, len, match;
        if (hasOwnProp.call(props, propertyName)) {
            patterns = props[propertyName];
            len = patterns.length;
            for (i = 0; i < len; ++i) {
                match = patterns[i].exec(userAgent);
                if (match !== null) {
                    return match[1];
                }
            }
        }
        return null;
    };

    /**
     * Check the version of the given property in the User-Agent.
     * Will return a float number. (eg. 2_0 will return 2.0, 4.3.1 will return 4.31)
     *
     * @param {String} propertyName
     * @param {String} userAgent
     * @return {Number} version or <tt>NaN</tt> if version not found
     * @private
     */
    impl.getVersion = function (propertyName, userAgent) {
        var version = impl.getVersionStr(propertyName, userAgent);
        return version ? impl.prepareVersionNo(version) : NaN;
    };

    /**
     * Prepare the version number.
     *
     * @param {String} version
     * @return {Number} the version number as a floating number
     * @private
     */
    impl.prepareVersionNo = function (version) {
        var numbers;

        numbers = version.split(/[a-z._ \/\-]/i);
        if (numbers.length === 1) {
            version = numbers[0];
        }
        if (numbers.length > 1) {
            version = numbers[0] + '.';
            numbers.shift();
            version += numbers.join('');
        }
        return Number(version);
    };

    impl.isMobileFallback = function (userAgent) {
        return impl.detectMobileBrowsers.fullPattern.test(userAgent) ||
            impl.detectMobileBrowsers.shortPattern.test(userAgent.substr(0,4));
    };

    impl.isTabletFallback = function (userAgent) {
        return impl.detectMobileBrowsers.tabletPattern.test(userAgent);
    };

    impl.prepareDetectionCache = function (cache, userAgent, maxPhoneWidth) {
        if (cache.mobile !== undefined) {
            return;
        }
        var phone, tablet, phoneSized;

        // first check for stronger tablet rules, then phone (see issue#5)
        tablet = impl.findMatch(impl.mobileDetectRules.tablets, userAgent);
        if (tablet) {
            cache.mobile = cache.tablet = tablet;
            cache.phone = null;
            return; // unambiguously identified as tablet
        }

        phone = impl.findMatch(impl.mobileDetectRules.phones, userAgent);
        if (phone) {
            cache.mobile = cache.phone = phone;
            cache.tablet = null;
            return; // unambiguously identified as phone
        }

        // our rules haven't found a match -> try more general fallback rules
        if (impl.isMobileFallback(userAgent)) {
            phoneSized = MobileDetect.isPhoneSized(maxPhoneWidth);
            if (phoneSized === undefined) {
                cache.mobile = impl.FALLBACK_MOBILE;
                cache.tablet = cache.phone = null;
            } else if (phoneSized) {
                cache.mobile = cache.phone = impl.FALLBACK_PHONE;
                cache.tablet = null;
            } else {
                cache.mobile = cache.tablet = impl.FALLBACK_TABLET;
                cache.phone = null;
            }
        } else if (impl.isTabletFallback(userAgent)) {
            cache.mobile = cache.tablet = impl.FALLBACK_TABLET;
            cache.phone = null;
        } else {
            // not mobile at all!
            cache.mobile = cache.tablet = cache.phone = null;
        }
    };

    // t is a reference to a MobileDetect instance
    impl.mobileGrade = function (t) {
        // impl note:
        // To keep in sync w/ Mobile_Detect.php easily, the following code is tightly aligned to the PHP version.
        // When changes are made in Mobile_Detect.php, copy this method and replace:
        //     $this-> / t.
        //     self::MOBILE_GRADE_(.) / '$1'
        //     , self::VERSION_TYPE_FLOAT / (nothing)
        //     isIOS() / os('iOS')
        //     [reg] / (nothing)   <-- jsdelivr complaining about unescaped unicode character U+00AE
        var $isMobile = t.mobile() !== null;

        if (
            // Apple iOS 3.2-5.1 - Tested on the original iPad (4.3 / 5.0), iPad 2 (4.3), iPad 3 (5.1), original iPhone (3.1), iPhone 3 (3.2), 3GS (4.3), 4 (4.3 / 5.0), and 4S (5.1)
            t.os('iOS') && t.version('iPad')>=4.3 ||
            t.os('iOS') && t.version('iPhone')>=3.1 ||
            t.os('iOS') && t.version('iPod')>=3.1 ||

            // Android 2.1-2.3 - Tested on the HTC Incredible (2.2), original Droid (2.2), HTC Aria (2.1), Google Nexus S (2.3). Functional on 1.5 & 1.6 but performance may be sluggish, tested on Google G1 (1.5)
            // Android 3.1 (Honeycomb)  - Tested on the Samsung Galaxy Tab 10.1 and Motorola XOOM
            // Android 4.0 (ICS)  - Tested on a Galaxy Nexus. Note: transition performance can be poor on upgraded devices
            // Android 4.1 (Jelly Bean)  - Tested on a Galaxy Nexus and Galaxy 7
            ( t.version('Android')>2.1 && t.is('Webkit') ) ||

            // Windows Phone 7-7.5 - Tested on the HTC Surround (7.0) HTC Trophy (7.5), LG-E900 (7.5), Nokia Lumia 800
            t.version('Windows Phone OS')>=7.0 ||

            // Blackberry 7 - Tested on BlackBerry Torch 9810
            // Blackberry 6.0 - Tested on the Torch 9800 and Style 9670
            t.is('BlackBerry') && t.version('BlackBerry')>=6.0 ||
            // Blackberry Playbook (1.0-2.0) - Tested on PlayBook
            t.match('Playbook.*Tablet') ||

            // Palm WebOS (1.4-2.0) - Tested on the Palm Pixi (1.4), Pre (1.4), Pre 2 (2.0)
            ( t.version('webOS')>=1.4 && t.match('Palm|Pre|Pixi') ) ||
            // Palm WebOS 3.0  - Tested on HP TouchPad
            t.match('hp.*TouchPad') ||

            // Firefox Mobile (12 Beta) - Tested on Android 2.3 device
            ( t.is('Firefox') && t.version('Firefox')>=12 ) ||

            // Chrome for Android - Tested on Android 4.0, 4.1 device
            ( t.is('Chrome') && t.is('AndroidOS') && t.version('Android')>=4.0 ) ||

            // Skyfire 4.1 - Tested on Android 2.3 device
            ( t.is('Skyfire') && t.version('Skyfire')>=4.1 && t.is('AndroidOS') && t.version('Android')>=2.3 ) ||

            // Opera Mobile 11.5-12: Tested on Android 2.3
            ( t.is('Opera') && t.version('Opera Mobi')>11 && t.is('AndroidOS') ) ||

            // Meego 1.2 - Tested on Nokia 950 and N9
            t.is('MeeGoOS') ||

            // Tizen (pre-release) - Tested on early hardware
            t.is('Tizen') ||

            // Samsung Bada 2.0 - Tested on a Samsung Wave 3, Dolphin browser
            // @todo: more tests here!
            t.is('Dolfin') && t.version('Bada')>=2.0 ||

            // UC Browser - Tested on Android 2.3 device
            ( (t.is('UC Browser') || t.is('Dolfin')) && t.version('Android')>=2.3 ) ||

            // Kindle 3 and Fire  - Tested on the built-in WebKit browser for each
            ( t.match('Kindle Fire') ||
                t.is('Kindle') && t.version('Kindle')>=3.0 ) ||

            // Nook Color 1.4.1 - Tested on original Nook Color, not Nook Tablet
            t.is('AndroidOS') && t.is('NookTablet') ||

            // Chrome Desktop 11-21 - Tested on OS X 10.7 and Windows 7
            t.version('Chrome')>=11 && !$isMobile ||

            // Safari Desktop 4-5 - Tested on OS X 10.7 and Windows 7
            t.version('Safari')>=5.0 && !$isMobile ||

            // Firefox Desktop 4-13 - Tested on OS X 10.7 and Windows 7
            t.version('Firefox')>=4.0 && !$isMobile ||

            // Internet Explorer 7-9 - Tested on Windows XP, Vista and 7
            t.version('MSIE')>=7.0 && !$isMobile ||

            // Opera Desktop 10-12 - Tested on OS X 10.7 and Windows 7
            // @reference: http://my.opera.com/community/openweb/idopera/
            t.version('Opera')>=10 && !$isMobile

            ){
            return 'A';
        }

        if (
            t.os('iOS') && t.version('iPad')<4.3 ||
            t.os('iOS') && t.version('iPhone')<3.1 ||
            t.os('iOS') && t.version('iPod')<3.1 ||

            // Blackberry 5.0: Tested on the Storm 2 9550, Bold 9770
            t.is('Blackberry') && t.version('BlackBerry')>=5 && t.version('BlackBerry')<6 ||

            //Opera Mini (5.0-6.5) - Tested on iOS 3.2/4.3 and Android 2.3
            ( t.version('Opera Mini')>=5.0 && t.version('Opera Mini')<=6.5 &&
                (t.version('Android')>=2.3 || t.is('iOS')) ) ||

            // Nokia Symbian^3 - Tested on Nokia N8 (Symbian^3), C7 (Symbian^3), also works on N97 (Symbian^1)
            t.match('NokiaN8|NokiaC7|N97.*Series60|Symbian/3') ||

            // @todo: report this (tested on Nokia N71)
            t.version('Opera Mobi')>=11 && t.is('SymbianOS')
            ){
            return 'B';
        }

        if (
        // Blackberry 4.x - Tested on the Curve 8330
            t.version('BlackBerry')<5.0 ||
            // Windows Mobile - Tested on the HTC Leo (WinMo 5.2)
            t.match('MSIEMobile|Windows CE.*Mobile') || t.version('Windows Mobile')<=5.2

            ){
            return 'C';
        }

        //All older smartphone platforms and featurephones - Any device that doesn't support media queries
        //will receive the basic, C grade experience.
        return 'C';
    };

    impl.detectOS = function (ua) {
        return impl.findMatch(impl.mobileDetectRules.oss0, ua) ||
            impl.findMatch(impl.mobileDetectRules.oss, ua);
    };

    impl.getDeviceSmallerSide = function () {
        return window.screen.width < window.screen.height ?
            window.screen.width :
            window.screen.height;
    };

    /**
     * Constructor for MobileDetect object.
     * <br>
     * Such an object will keep a reference to the given user-agent string and cache most of the detect queries.<br>
     * <div style="background-color: #d9edf7; border: 1px solid #bce8f1; color: #3a87ad; padding: 14px; border-radius: 2px; margin-top: 20px">
     *     <strong>Find information how to download and install:</strong>
     *     <a href="https://github.com/hgoebl/mobile-detect.js/">github.com/hgoebl/mobile-detect.js/</a>
     * </div>
     *
     * @example <pre>
     *     var md = new MobileDetect(window.navigator.userAgent);
     *     if (md.mobile()) {
     *         location.href = (md.mobileGrade() === 'A') ? '/mobile/' : '/lynx/';
     *     }
     * </pre>
     *
     * @param {string} userAgent typically taken from window.navigator.userAgent or http_header['User-Agent']
     * @param {number} [maxPhoneWidth=600] <strong>only for browsers</strong> specify a value for the maximum
     *        width of smallest device side (in logical "CSS" pixels) until a device detected as mobile will be handled
     *        as phone.
     *        This is only used in cases where the device cannot be classified as phone or tablet.<br>
     *        See <a href="http://developer.android.com/guide/practices/screens_support.html">Declaring Tablet Layouts
     *        for Android</a>.<br>
     *        If you provide a value < 0, then this "fuzzy" check is disabled.
     * @constructor
     * @global
     */
    function MobileDetect(userAgent, maxPhoneWidth) {
        this.ua = prepareUserAgent(userAgent);
        this._cache = {};
        //600dp is typical 7" tablet minimum width
        this.maxPhoneWidth = maxPhoneWidth || 600;
    }

    MobileDetect.prototype = {
        constructor: MobileDetect,

        /**
         * Returns the detected phone or tablet type or <tt>null</tt> if it is not a mobile device.
         * <br>
         * For a list of possible return values see {@link MobileDetect#phone} and {@link MobileDetect#tablet}.<br>
         * <br>
         * If the device is not detected by the regular expressions from Mobile-Detect, a test is made against
         * the patterns of <a href="http://detectmobilebrowsers.com/">detectmobilebrowsers.com</a>. If this test
         * is positive, a value of <code>UnknownPhone</code>, <code>UnknownTablet</code> or
         * <code>UnknownMobile</code> is returned.<br>
         * When used in browser, the decision whether phone or tablet is made based on <code>screen.width/height</code>.<br>
         * <br>
         * When used server-side (node.js), there is no way to tell the difference between <code>UnknownTablet</code>
         * and <code>UnknownMobile</code>, so you will get <code>UnknownMobile</code> here.<br>
         * Be aware that since v1.0.0 in this special case you will get <code>UnknownMobile</code> only for:
         * {@link MobileDetect#mobile}, not for {@link MobileDetect#phone} and {@link MobileDetect#tablet}.
         * In versions before v1.0.0 all 3 methods returned <code>UnknownMobile</code> which was tedious to use.
         * <br>
         * In most cases you will use the return value just as a boolean.
         *
         * @returns {String} the key for the phone family or tablet family, e.g. "Nexus".
         * @function MobileDetect#mobile
         */
        mobile: function () {
            impl.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth);
            return this._cache.mobile;
        },

        /**
         * Returns the detected phone type/family string or <tt>null</tt>.
         * <br>
         * The returned tablet (family or producer) is one of following keys:<br>
         * <br><tt>iPhone, BlackBerry, HTC, Nexus, Dell, Motorola, Samsung, LG, Sony, Asus,
         * NokiaLumia, Micromax, Palm, Vertu, Pantech, Fly, Wiko, iMobile, SimValley,
         * Wolfgang, Alcatel, Nintendo, Amoi, INQ, OnePlus, GenericPhone</tt><br>
         * <br>
         * If the device is not detected by the regular expressions from Mobile-Detect, a test is made against
         * the patterns of <a href="http://detectmobilebrowsers.com/">detectmobilebrowsers.com</a>. If this test
         * is positive, a value of <code>UnknownPhone</code> or <code>UnknownMobile</code> is returned.<br>
         * When used in browser, the decision whether phone or tablet is made based on <code>screen.width/height</code>.<br>
         * <br>
         * When used server-side (node.js), there is no way to tell the difference between <code>UnknownTablet</code>
         * and <code>UnknownMobile</code>, so you will get <code>null</code> here, while {@link MobileDetect#mobile}
         * will return <code>UnknownMobile</code>.<br>
         * Be aware that since v1.0.0 in this special case you will get <code>UnknownMobile</code> only for:
         * {@link MobileDetect#mobile}, not for {@link MobileDetect#phone} and {@link MobileDetect#tablet}.
         * In versions before v1.0.0 all 3 methods returned <code>UnknownMobile</code> which was tedious to use.
         * <br>
         * In most cases you will use the return value just as a boolean.
         *
         * @returns {String} the key of the phone family or producer, e.g. "iPhone"
         * @function MobileDetect#phone
         */
        phone: function () {
            impl.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth);
            return this._cache.phone;
        },

        /**
         * Returns the detected tablet type/family string or <tt>null</tt>.
         * <br>
         * The returned tablet (family or producer) is one of following keys:<br>
         * <br><tt>iPad, NexusTablet, GoogleTablet, SamsungTablet, Kindle, SurfaceTablet,
         * HPTablet, AsusTablet, BlackBerryTablet, HTCtablet, MotorolaTablet, NookTablet,
         * AcerTablet, ToshibaTablet, LGTablet, FujitsuTablet, PrestigioTablet,
         * LenovoTablet, DellTablet, YarvikTablet, MedionTablet, ArnovaTablet,
         * IntensoTablet, IRUTablet, MegafonTablet, EbodaTablet, AllViewTablet,
         * ArchosTablet, AinolTablet, NokiaLumiaTablet, SonyTablet, PhilipsTablet,
         * CubeTablet, CobyTablet, MIDTablet, MSITablet, SMiTTablet, RockChipTablet,
         * FlyTablet, bqTablet, HuaweiTablet, NecTablet, PantechTablet, BronchoTablet,
         * VersusTablet, ZyncTablet, PositivoTablet, NabiTablet, KoboTablet, DanewTablet,
         * TexetTablet, PlaystationTablet, TrekstorTablet, PyleAudioTablet, AdvanTablet,
         * DanyTechTablet, GalapadTablet, MicromaxTablet, KarbonnTablet, AllFineTablet,
         * PROSCANTablet, YONESTablet, ChangJiaTablet, GUTablet, PointOfViewTablet,
         * OvermaxTablet, HCLTablet, DPSTablet, VistureTablet, CrestaTablet,
         * MediatekTablet, ConcordeTablet, GoCleverTablet, ModecomTablet, VoninoTablet,
         * ECSTablet, StorexTablet, VodafoneTablet, EssentielBTablet, RossMoorTablet,
         * iMobileTablet, TolinoTablet, AudioSonicTablet, AMPETablet, SkkTablet,
         * TecnoTablet, JXDTablet, iJoyTablet, FX2Tablet, XoroTablet, ViewsonicTablet,
         * VerizonTablet, OdysTablet, CaptivaTablet, IconbitTablet, TeclastTablet,
         * OndaTablet, JaytechTablet, BlaupunktTablet, DigmaTablet, EvolioTablet,
         * LavaTablet, AocTablet, MpmanTablet, CelkonTablet, WolderTablet, MediacomTablet,
         * MiTablet, NibiruTablet, NexoTablet, LeaderTablet, UbislateTablet,
         * PocketBookTablet, KocasoTablet, HisenseTablet, Hudl, TelstraTablet,
         * GenericTablet</tt><br>
         * <br>
         * If the device is not detected by the regular expressions from Mobile-Detect, a test is made against
         * the patterns of <a href="http://detectmobilebrowsers.com/">detectmobilebrowsers.com</a>. If this test
         * is positive, a value of <code>UnknownTablet</code> or <code>UnknownMobile</code> is returned.<br>
         * When used in browser, the decision whether phone or tablet is made based on <code>screen.width/height</code>.<br>
         * <br>
         * When used server-side (node.js), there is no way to tell the difference between <code>UnknownTablet</code>
         * and <code>UnknownMobile</code>, so you will get <code>null</code> here, while {@link MobileDetect#mobile}
         * will return <code>UnknownMobile</code>.<br>
         * Be aware that since v1.0.0 in this special case you will get <code>UnknownMobile</code> only for:
         * {@link MobileDetect#mobile}, not for {@link MobileDetect#phone} and {@link MobileDetect#tablet}.
         * In versions before v1.0.0 all 3 methods returned <code>UnknownMobile</code> which was tedious to use.
         * <br>
         * In most cases you will use the return value just as a boolean.
         *
         * @returns {String} the key of the tablet family or producer, e.g. "SamsungTablet"
         * @function MobileDetect#tablet
         */
        tablet: function () {
            impl.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth);
            return this._cache.tablet;
        },

        /**
         * Returns the (first) detected user-agent string or <tt>null</tt>.
         * <br>
         * The returned user-agent is one of following keys:<br>
         * <br><tt>Chrome, Dolfin, Opera, Skyfire, Edge, IE, Firefox, Bolt, TeaShark, Blazer,
         * Safari, WeChat, UCBrowser, baiduboxapp, baidubrowser, DiigoBrowser, Mercury,
         * ObigoBrowser, NetFront, GenericBrowser, PaleMoon</tt><br>
         * <br>
         * In most cases calling {@link MobileDetect#userAgent} will be sufficient. But there are rare
         * cases where a mobile device pretends to be more than one particular browser. You can get the
         * list of all matches with {@link MobileDetect#userAgents} or check for a particular value by
         * providing one of the defined keys as first argument to {@link MobileDetect#is}.
         *
         * @returns {String} the key for the detected user-agent or <tt>null</tt>
         * @function MobileDetect#userAgent
         */
        userAgent: function () {
            if (this._cache.userAgent === undefined) {
                this._cache.userAgent = impl.findMatch(impl.mobileDetectRules.uas, this.ua);
            }
            return this._cache.userAgent;
        },

        /**
         * Returns all detected user-agent strings.
         * <br>
         * The array is empty or contains one or more of following keys:<br>
         * <br><tt>Chrome, Dolfin, Opera, Skyfire, Edge, IE, Firefox, Bolt, TeaShark, Blazer,
         * Safari, WeChat, UCBrowser, baiduboxapp, baidubrowser, DiigoBrowser, Mercury,
         * ObigoBrowser, NetFront, GenericBrowser, PaleMoon</tt><br>
         * <br>
         * In most cases calling {@link MobileDetect#userAgent} will be sufficient. But there are rare
         * cases where a mobile device pretends to be more than one particular browser. You can get the
         * list of all matches with {@link MobileDetect#userAgents} or check for a particular value by
         * providing one of the defined keys as first argument to {@link MobileDetect#is}.
         *
         * @returns {Array} the array of detected user-agent keys or <tt>[]</tt>
         * @function MobileDetect#userAgents
         */
        userAgents: function () {
            if (this._cache.userAgents === undefined) {
                this._cache.userAgents = impl.findMatches(impl.mobileDetectRules.uas, this.ua);
            }
            return this._cache.userAgents;
        },

        /**
         * Returns the detected operating system string or <tt>null</tt>.
         * <br>
         * The operating system is one of following keys:<br>
         * <br><tt>AndroidOS, BlackBerryOS, PalmOS, SymbianOS, WindowsMobileOS, WindowsPhoneOS,
         * iOS, iPadOS, MeeGoOS, MaemoOS, JavaOS, webOS, badaOS, BREWOS</tt><br>
         *
         * @returns {String} the key for the detected operating system.
         * @function MobileDetect#os
         */
        os: function () {
            if (this._cache.os === undefined) {
                this._cache.os = impl.detectOS(this.ua);
            }
            return this._cache.os;
        },

        /**
         * Get the version (as Number) of the given property in the User-Agent.
         * <br>
         * Will return a float number. (eg. 2_0 will return 2.0, 4.3.1 will return 4.31)
         *
         * @param {String} key a key defining a thing which has a version.<br>
         *        You can use one of following keys:<br>
         * <br><tt>Mobile, Build, Version, VendorID, iPad, iPhone, iPod, Kindle, Chrome, Coast,
         * Dolfin, Firefox, Fennec, Edge, IE, NetFront, NokiaBrowser, Opera, Opera Mini,
         * Opera Mobi, UCBrowser, MQQBrowser, MicroMessenger, baiduboxapp, baidubrowser,
         * SamsungBrowser, Iron, Safari, Skyfire, Tizen, Webkit, PaleMoon, Gecko, Trident,
         * Presto, Goanna, iOS, Android, BlackBerry, BREW, Java, Windows Phone OS, Windows
         * Phone, Windows CE, Windows NT, Symbian, webOS</tt><br>
         *
         * @returns {Number} the version as float or <tt>NaN</tt> if User-Agent doesn't contain this version.
         *          Be careful when comparing this value with '==' operator!
         * @function MobileDetect#version
         */
        version: function (key) {
            return impl.getVersion(key, this.ua);
        },

        /**
         * Get the version (as String) of the given property in the User-Agent.
         * <br>
         *
         * @param {String} key a key defining a thing which has a version.<br>
         *        You can use one of following keys:<br>
         * <br><tt>Mobile, Build, Version, VendorID, iPad, iPhone, iPod, Kindle, Chrome, Coast,
         * Dolfin, Firefox, Fennec, Edge, IE, NetFront, NokiaBrowser, Opera, Opera Mini,
         * Opera Mobi, UCBrowser, MQQBrowser, MicroMessenger, baiduboxapp, baidubrowser,
         * SamsungBrowser, Iron, Safari, Skyfire, Tizen, Webkit, PaleMoon, Gecko, Trident,
         * Presto, Goanna, iOS, Android, BlackBerry, BREW, Java, Windows Phone OS, Windows
         * Phone, Windows CE, Windows NT, Symbian, webOS</tt><br>
         *
         * @returns {String} the "raw" version as String or <tt>null</tt> if User-Agent doesn't contain this version.
         *
         * @function MobileDetect#versionStr
         */
        versionStr: function (key) {
            return impl.getVersionStr(key, this.ua);
        },

        /**
         * Global test key against userAgent, os, phone, tablet and some other properties of userAgent string.
         *
         * @param {String} key the key (case-insensitive) of a userAgent, an operating system, phone or
         *        tablet family.<br>
         *        For a complete list of possible values, see {@link MobileDetect#userAgent},
         *        {@link MobileDetect#os}, {@link MobileDetect#phone}, {@link MobileDetect#tablet}.<br>
         *        Additionally you have following keys:<br>
         * <br><tt>Bot, MobileBot, DesktopMode, TV, WebKit, Console, Watch</tt><br>
         *
         * @returns {boolean} <tt>true</tt> when the given key is one of the defined keys of userAgent, os, phone,
         *                    tablet or one of the listed additional keys, otherwise <tt>false</tt>
         * @function MobileDetect#is
         */
        is: function (key) {
            return containsIC(this.userAgents(), key) ||
                   equalIC(key, this.os()) ||
                   equalIC(key, this.phone()) ||
                   equalIC(key, this.tablet()) ||
                   containsIC(impl.findMatches(impl.mobileDetectRules.utils, this.ua), key);
        },

        /**
         * Do a quick test against navigator::userAgent.
         *
         * @param {String|RegExp} pattern the pattern, either as String or RegExp
         *                        (a string will be converted to a case-insensitive RegExp).
         * @returns {boolean} <tt>true</tt> when the pattern matches, otherwise <tt>false</tt>
         * @function MobileDetect#match
         */
        match: function (pattern) {
            if (!(pattern instanceof RegExp)) {
                pattern = new RegExp(pattern, 'i');
            }
            return pattern.test(this.ua);
        },

        /**
         * Checks whether the mobile device can be considered as phone regarding <code>screen.width</code>.
         * <br>
         * Obviously this method makes sense in browser environments only (not for Node.js)!
         * @param {number} [maxPhoneWidth] the maximum logical pixels (aka. CSS-pixels) to be considered as phone.<br>
         *        The argument is optional and if not present or falsy, the value of the constructor is taken.
         * @returns {boolean|undefined} <code>undefined</code> if screen size wasn't detectable, else <code>true</code>
         *          when screen.width is less or equal to maxPhoneWidth, otherwise <code>false</code>.<br>
         *          Will always return <code>undefined</code> server-side.
         */
        isPhoneSized: function (maxPhoneWidth) {
            return MobileDetect.isPhoneSized(maxPhoneWidth || this.maxPhoneWidth);
        },

        /**
         * Returns the mobile grade ('A', 'B', 'C').
         *
         * @returns {String} one of the mobile grades ('A', 'B', 'C').
         * @function MobileDetect#mobileGrade
         */
        mobileGrade: function () {
            if (this._cache.grade === undefined) {
                this._cache.grade = impl.mobileGrade(this);
            }
            return this._cache.grade;
        }
    };

    // environment-dependent
    if (typeof window !== 'undefined' && window.screen) {
        MobileDetect.isPhoneSized = function (maxPhoneWidth) {
            return maxPhoneWidth < 0 ? undefined : impl.getDeviceSmallerSide() <= maxPhoneWidth;
        };
    } else {
        MobileDetect.isPhoneSized = function () {};
    }

    // should not be replaced by a completely new object - just overwrite existing methods
    MobileDetect._impl = impl;
    
    MobileDetect.version = '1.4.4 2019-09-21';

    return MobileDetect;
}); // end of call of define()
})((function (undefined) {
    if (typeof module !== 'undefined' && module.exports) {
        return function (factory) { module.exports = factory(); };
    } else if (typeof define === 'function' && define.amd) {
        return define;
    } else if (typeof window !== 'undefined') {
        return function (factory) { window.MobileDetect = factory(); };
    } else {
        // please file a bug if you get this error!
        throw new Error('unknown environment');
    }
})());
},{}],"src/styles/components/mobile-block.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/mobile-block.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

require("../styles/components/mobile-block.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    view: function view() {
      return (0, _mithril.default)('.mobile-block', [(0, _mithril.default)('h2.greeting', ['Hi! My name is ', (0, _mithril.default)('span.name', 'Viet-Hung')]), (0, _mithril.default)('p.view-work', 'To view my works, please use a desktop device.'), (0, _mithril.default)('p', 'I\'m a full-stack developer who loves working on cool projects.'), (0, _mithril.default)('p', 'I work mostly with web technology but I also love expanding my comfort zone, thus, I have been working some project with Rust and Python recently. '), (0, _mithril.default)('p', 'I\'m currently looking for a full-time position as a full-stack developer in Wellington, NZ.'), (0, _mithril.default)('h2', 'Contact me'), (0, _mithril.default)('.social.contact-method', [(0, _mithril.default)('a.social-media', {
        href: 'mailto:viethungax@gmail.com',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-envelope')]), (0, _mithril.default)('a.social-media', {
        href: 'https://github.com/ZeroX-DG',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-github')]), (0, _mithril.default)('a.social-media', {
        href: 'https://twitter.com/',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-twitter')]), (0, _mithril.default)('a.social-media', {
        href: 'https://www.linkedin.com/in/v-hung/',
        target: '_blank'
      }, [(0, _mithril.default)('i.fa.fa-linkedin')])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","../styles/components/mobile-block.sass":"src/styles/components/mobile-block.sass"}],"src/components/layout.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _menu = _interopRequireDefault(require("./menu"));

var _menuButton = _interopRequireDefault(require("./menu-button"));

var _contact = _interopRequireDefault(require("./contact"));

var _mobileDetect = _interopRequireDefault(require("mobile-detect"));

var _mobileBlock = _interopRequireDefault(require("./mobile-block"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  var isMenuOpen, isMobile;
  isMenuOpen = false;
  isMobile = false;
  return {
    oninit: function oninit() {
      var md;
      md = new _mobileDetect.default(window.navigator.userAgent);

      if (md.mobile()) {
        return isMobile = true;
      }
    },
    view: function view(vnode) {
      if (isMobile) {
        return (0, _mithril.default)(_mobileBlock.default);
      }

      return (0, _mithril.default)('.wrapper', [vnode.children, (0, _mithril.default)(_menu.default, {
        open: isMenuOpen,
        onclick: function onclick(e) {
          isMenuOpen = !isMenuOpen;
          return true;
        }
      }), (0, _mithril.default)(_menuButton.default, {
        open: isMenuOpen,
        onclick: function onclick() {
          return isMenuOpen = !isMenuOpen;
        }
      }), (0, _mithril.default)(_contact.default)]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","./menu":"src/components/menu.coffee","./menu-button":"src/components/menu-button.coffee","./contact":"src/components/contact.coffee","mobile-detect":"node_modules/mobile-detect/mobile-detect.js","./mobile-block":"src/components/mobile-block.coffee"}],"static/intro-vector.svg":[function(require,module,exports) {
module.exports = "/intro-vector.a46aa586.svg";
},{}],"static/me_queenstown.jpg":[function(require,module,exports) {
module.exports = "/me_queenstown.5e56b53e.jpg";
},{}],"src/styles/index/intro.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/parts/index/intro.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

var _introVector = _interopRequireDefault(require("../../../static/intro-vector.svg"));

var _me_queenstown = _interopRequireDefault(require("../../../static/me_queenstown.jpg"));

require("../../styles/index/intro.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    oncreate: function oncreate(vnode) {
      var i, introTimeline, len, text, textWrapper;
      textWrapper = vnode.dom.querySelectorAll('.letters');

      for (i = 0, len = textWrapper.length; i < len; i++) {
        text = textWrapper[i];
        text.innerHTML = text.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
      } // intro animation


      introTimeline = _animeEs.default.timeline();
      introTimeline.add({
        targets: '#intro-svg',
        width: ['0', '60%'],
        duration: 750,
        easing: 'easeInOutQuad'
      });
      introTimeline.add({
        targets: '#image-wrapper',
        translateY: ['-100px', '0'],
        opacity: [0, 1],
        duration: 1500,
        easing: "easeOutExpo"
      });
      introTimeline.add({
        targets: '#name .letter',
        translateY: ["1.1em", 0],
        translateX: ["0.55em", 0],
        translateZ: 0,
        rotateZ: [180, 0],
        duration: 500,
        easing: "easeOutExpo",
        delay: _animeEs.default.stagger(50)
      }, '-=1000');
      introTimeline.add({
        targets: '#overall .letter',
        translateY: ["1.1em", 0],
        translateX: ["0.55em", 0],
        translateZ: 0,
        rotateZ: [180, 0],
        duration: 400,
        easing: "easeOutExpo",
        delay: _animeEs.default.stagger(50)
      }, '-=500');
      introTimeline.add({
        targets: '#name-underline',
        width: '12%'
      });
      return introTimeline.add({
        targets: '#scroll-down-button',
        opacity: [0, 1],
        easing: 'linear',
        duration: 300
      });
    },
    view: function view() {
      return (0, _mithril.default)('.intro.section', {
        style: "height:".concat(window.innerHeight, "px")
      }, [(0, _mithril.default)('img#intro-svg', {
        src: _introVector.default
      }), (0, _mithril.default)('#intro-content', [(0, _mithril.default)('#left-part', [(0, _mithril.default)('#image-wrapper', (0, _mithril.default)('img#intro-me', {
        src: _me_queenstown.default
      }))]), (0, _mithril.default)('#right-part', [(0, _mithril.default)('#name', [(0, _mithril.default)('span.text-wrapper', (0, _mithril.default)('span.letters', 'Viet-Hung')), (0, _mithril.default)('br'), (0, _mithril.default)('span.text-wrapper', (0, _mithril.default)('span.letters', 'Nguyen')), (0, _mithril.default)('#name-underline')]), (0, _mithril.default)('#overall', [(0, _mithril.default)('span.text-wrapper', (0, _mithril.default)('span.letters', 'Web developer /')), (0, _mithril.default)('br'), (0, _mithril.default)('span.text-wrapper', (0, _mithril.default)('span.letters', 'Open-source enthusiast /')), (0, _mithril.default)('br'), (0, _mithril.default)('span.text-wrapper', (0, _mithril.default)('span.letters', 'Blogger'))])])]), (0, _mithril.default)('#scroll-down-button')]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","../../../static/intro-vector.svg":"static/intro-vector.svg","../../../static/me_queenstown.jpg":"static/me_queenstown.jpg","../../styles/index/intro.sass":"src/styles/index/intro.sass"}],"node_modules/@terwanerik/scrolltrigger/dist/ScrollTrigger.js":[function(require,module,exports) {
var define;
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function webpackUniversalModuleDefinition(root, factory) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') module.exports = factory();else if (typeof define === 'function' && define.amd) define("ScrollTrigger", [], factory);else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') exports["ScrollTrigger"] = factory();else root["ScrollTrigger"] = factory();
})(window, function () {
  return (
    /******/
    function (modules) {
      // webpackBootstrap

      /******/
      // The module cache

      /******/
      var installedModules = {};
      /******/

      /******/
      // The require function

      /******/

      function __webpack_require__(moduleId) {
        /******/

        /******/
        // Check if module is in cache

        /******/
        if (installedModules[moduleId]) {
          /******/
          return installedModules[moduleId].exports;
          /******/
        }
        /******/
        // Create a new module (and put it into the cache)

        /******/


        var module = installedModules[moduleId] = {
          /******/
          i: moduleId,

          /******/
          l: false,

          /******/
          exports: {}
          /******/

        };
        /******/

        /******/
        // Execute the module function

        /******/

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/

        /******/
        // Flag the module as loaded

        /******/

        module.l = true;
        /******/

        /******/
        // Return the exports of the module

        /******/

        return module.exports;
        /******/
      }
      /******/

      /******/

      /******/
      // expose the modules object (__webpack_modules__)

      /******/


      __webpack_require__.m = modules;
      /******/

      /******/
      // expose the module cache

      /******/

      __webpack_require__.c = installedModules;
      /******/

      /******/
      // define getter function for harmony exports

      /******/

      __webpack_require__.d = function (exports, name, getter) {
        /******/
        if (!__webpack_require__.o(exports, name)) {
          /******/
          Object.defineProperty(exports, name, {
            enumerable: true,
            get: getter
          });
          /******/
        }
        /******/

      };
      /******/

      /******/
      // define __esModule on exports

      /******/


      __webpack_require__.r = function (exports) {
        /******/
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
          /******/
          Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module'
          });
          /******/
        }
        /******/


        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        /******/
      };
      /******/

      /******/
      // create a fake namespace object

      /******/
      // mode & 1: value is a module id, require it

      /******/
      // mode & 2: merge all properties of value into the ns

      /******/
      // mode & 4: return value when already ns object

      /******/
      // mode & 8|1: behave like require

      /******/


      __webpack_require__.t = function (value, mode) {
        /******/
        if (mode & 1) value = __webpack_require__(value);
        /******/

        if (mode & 8) return value;
        /******/

        if (mode & 4 && _typeof(value) === 'object' && value && value.__esModule) return value;
        /******/

        var ns = Object.create(null);
        /******/

        __webpack_require__.r(ns);
        /******/


        Object.defineProperty(ns, 'default', {
          enumerable: true,
          value: value
        });
        /******/

        if (mode & 2 && typeof value != 'string') for (var key in value) {
          __webpack_require__.d(ns, key, function (key) {
            return value[key];
          }.bind(null, key));
        }
        /******/

        return ns;
        /******/
      };
      /******/

      /******/
      // getDefaultExport function for compatibility with non-harmony modules

      /******/


      __webpack_require__.n = function (module) {
        /******/
        var getter = module && module.__esModule ?
        /******/
        function getDefault() {
          return module['default'];
        } :
        /******/
        function getModuleExports() {
          return module;
        };
        /******/

        __webpack_require__.d(getter, 'a', getter);
        /******/


        return getter;
        /******/
      };
      /******/

      /******/
      // Object.prototype.hasOwnProperty.call

      /******/


      __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      /******/

      /******/
      // __webpack_public_path__

      /******/


      __webpack_require__.p = "";
      /******/

      /******/

      /******/
      // Load entry module and return exports

      /******/

      return __webpack_require__(__webpack_require__.s = 2);
      /******/
    }(
    /************************************************************************/

    /******/
    [
    /* 0 */

    /***/
    function (module, exports) {
      /*!
       * object-extend
       * A well-tested function to deep extend (or merge) JavaScript objects without further dependencies.
       *
       * http://github.com/bernhardw
       *
       * Copyright 2013, Bernhard Wanger <mail@bernhardwanger.com>
       * Released under the MIT license.
       *
       * Date: 2013-04-10
       */

      /**
       * Extend object a with object b.
       *
       * @param {Object} a Source object.
       * @param {Object} b Object to extend with.
       * @returns {Object} a Extended object.
       */
      module.exports = function extend(a, b) {
        // Don't touch 'null' or 'undefined' objects.
        if (a == null || b == null) {
          return a;
        } // TODO: Refactor to use for-loop for performance reasons.


        Object.keys(b).forEach(function (key) {
          // Detect object without array, date or null.
          // TODO: Performance test:
          // a) b.constructor === Object.prototype.constructor
          // b) Object.prototype.toString.call(b) == '[object Object]'
          if (Object.prototype.toString.call(b[key]) == '[object Object]') {
            if (Object.prototype.toString.call(a[key]) != '[object Object]') {
              a[key] = b[key];
            } else {
              a[key] = extend(a[key], b[key]);
            }
          } else {
            a[key] = b[key];
          }
        });
        return a;
      };
      /***/

    },
    /* 1 */

    /***/
    function (module, exports) {
      /**
       * Faster than .forEach
       * @param {(function())} fn The function to call
       */
      Array.prototype.each = function (fn) {
        var l = this.length;

        for (var i = 0; i < l; i++) {
          var e = this[i];

          if (e) {
            fn(e, i);
          }
        }
      };
      /**
       * Give NodeList some Array functions
       */


      NodeList.prototype.each = Array.prototype.each;
      NodeList.prototype.filter = Array.prototype.filter;
      /***/
    },
    /* 2 */

    /***/
    function (module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__); // CONCATENATED MODULE: ./src/config/DefaultOptions.js

      /**
       * Default options for ScrollTrigger
       */

      /* harmony default export */


      var DefaultOptions = function () {
        /**
         * The default options for a trigger
         *
         * @type {
         * {
         *  once: boolean,
         *  offset: {
         *    viewport: {
         *      x: number|(function(frame, direction)),
         *      y: number|(function(frame, direction))
         *    },
         *    element: {
         *      x: number|(function(rect, direction)),
         *      y: number|(function(rect, direction))
         *    }
         *  },
         *  toggle: {
         *    class: {
         *      in: string|string[],
         *      out: string|string[]
         *    },
         *  callback: {
         *    in: {TriggerInCallback},
            *    visible: (function()),
         *    out: (function())
         *  }
         * }
         * }}
         */
        this.trigger = {
          once: false,
          offset: {
            viewport: {
              x: 0,
              y: 0
            },
            element: {
              x: 0,
              y: 0
            }
          },
          toggle: {
            "class": {
              "in": 'visible',
              out: 'invisible'
            },
            callback: {
              "in": null,
              visible: null,
              out: null
            }
          }
        };
        /**
         * The `in` callback is called when the element enters the viewport
         * @callback TriggerInCallback
         * @param {{x: Number, y: Number}} position
         * @param {string} direction
         */

        /**
         * The default options for the scroll behaviour
         * @type {
         * {
         *  sustain: number,
         *  element: Window|HTMLDocument|HTMLElement,
         *  callback: {ScrollCallback},
         *  start: (function()),
         *  stop: (function()),
         *  directionChange: (function(direction: {string}))
         * }
         * }
         */

        this.scroll = {
          sustain: 300,
          element: window,
          callback: function callback() {},
          start: function start() {},
          stop: function stop() {},
          directionChange: function directionChange() {}
        };
        /**
         * The scroll callback is called when the user scrolls
         * @callback ScrollCallback
         * @param {{x: Number, y: Number}} position
         * @param {string} direction
         */
      }; // EXTERNAL MODULE: ./node_modules/object-extend/lib/extend.js


      var extend = __webpack_require__(0);

      var extend_default = /*#__PURE__*/__webpack_require__.n(extend); // EXTERNAL MODULE: ./src/extensions/Array.js


      var extensions_Array = __webpack_require__(1); // CONCATENATED MODULE: ./src/scripts/Trigger.js


      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      function isInt(n) {
        return Number(n) === n && n % 1 === 0;
      }

      function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
      }

      var Trigger_Trigger = /*#__PURE__*/function () {
        /**
         * Creates a new Trigger from the given element and options
         *
         * @param {Element|HTMLElement} element
         * @param {DefaultOptions.trigger} [options=DefaultOptions.trigger] options
         */
        function Trigger(element, options) {
          _classCallCheck(this, Trigger);

          this.element = element;
          options = extend_default()(new DefaultOptions().trigger, options);
          this.offset = options.offset;
          this.toggle = options.toggle;
          this.once = options.once;
          this.visible = null;
          this.active = true;
        }
        /**
         * Checks if the Trigger is in the viewport, calls the callbacks and toggles the classes
         * @param {HTMLElement|HTMLDocument|Window} parent
         * @param {string} direction top, bottom, left, right
         * @returns {boolean} If the element is visible
         */


        _createClass(Trigger, [{
          key: "checkVisibility",
          value: function checkVisibility(parent, direction) {
            if (!this.active) {
              return this.visible;
            }

            var parentWidth = parent.offsetWidth || parent.innerWidth || 0;
            var parentHeight = parent.offsetHeight || parent.innerHeight || 0;
            var parentFrame = {
              w: parentWidth,
              h: parentHeight
            };
            var rect = this.getBounds();

            var visible = this._checkVisibility(rect, parentFrame, direction);

            if (visible !== this.visible) {
              this.visible = visible;

              var response = this._toggleCallback();

              if (response instanceof Promise) {
                response.then(this._toggleClass.bind(this))["catch"](function (e) {
                  console.error('Trigger promise failed');
                  console.error(e);
                });
              } else {
                this._toggleClass();
              }

              if (this.visible && this.once) {
                this.active = false;
              }
            } else if (visible) {
              if (typeof this.toggle.callback.visible == 'function') {
                return this.toggle.callback.visible.call(this.element, this);
              }
            }

            return visible;
          }
          /**
           * Get the bounds of this element
           * @return {ClientRect | DOMRect}
           */

        }, {
          key: "getBounds",
          value: function getBounds() {
            return this.element.getBoundingClientRect();
          }
          /**
           * Get the calculated offset to place on the element
           * @param {ClientRect} rect
           * @param {string} direction top, bottom, left, right
           * @returns {{x: number, y: number}}
           * @private
           */

        }, {
          key: "_getElementOffset",
          value: function _getElementOffset(rect, direction) {
            var offset = {
              x: 0,
              y: 0
            };

            if (typeof this.offset.element.x === 'function') {
              offset.x = rect.width * this.offset.element.x(this, rect, direction);
            } else if (isFloat(this.offset.element.x)) {
              offset.x = rect.width * this.offset.element.x;
            } else if (isInt(this.offset.element.x)) {
              offset.x = this.offset.element.x;
            }

            if (typeof this.offset.element.y === 'function') {
              offset.y = rect.height * this.offset.element.y(this, rect, direction);
            } else if (isFloat(this.offset.element.y)) {
              offset.y = rect.height * this.offset.element.y;
            } else if (isInt(this.offset.element.y)) {
              offset.y = this.offset.element.y;
            }

            return offset;
          }
          /**
           * Get the calculated offset to place on the viewport
           * @param {{w: number, h: number}} parent
           * @param {string} direction top, bottom, left, right
           * @returns {{x: number, y: number}}
           * @private
           */

        }, {
          key: "_getViewportOffset",
          value: function _getViewportOffset(parent, direction) {
            var offset = {
              x: 0,
              y: 0
            };

            if (typeof this.offset.viewport.x === 'function') {
              offset.x = parent.w * this.offset.viewport.x(this, parent, direction);
            } else if (isFloat(this.offset.viewport.x)) {
              offset.x = parent.w * this.offset.viewport.x;
            } else if (isInt(this.offset.viewport.x)) {
              offset.x = this.offset.viewport.x;
            }

            if (typeof this.offset.viewport.y === 'function') {
              offset.y = parent.h * this.offset.viewport.y(this, parent, direction);
            } else if (isFloat(this.offset.viewport.y)) {
              offset.y = parent.h * this.offset.viewport.y;
            } else if (isInt(this.offset.viewport.y)) {
              offset.y = this.offset.viewport.y;
            }

            return offset;
          }
          /**
           * Check the visibility of the trigger in the viewport, with offsets applied
           * @param {ClientRect} rect
           * @param {{w: number, h: number}} parent
           * @param {string} direction top, bottom, left, right
           * @returns {boolean}
           * @private
           */

        }, {
          key: "_checkVisibility",
          value: function _checkVisibility(rect, parent, direction) {
            var elementOffset = this._getElementOffset(rect, direction);

            var viewportOffset = this._getViewportOffset(parent, direction);

            var visible = true;

            if (rect.left - viewportOffset.x < -(rect.width - elementOffset.x)) {
              visible = false;
            }

            if (rect.left + viewportOffset.x > parent.w - elementOffset.x) {
              visible = false;
            }

            if (rect.top - viewportOffset.y < -(rect.height - elementOffset.y)) {
              visible = false;
            }

            if (rect.top + viewportOffset.y > parent.h - elementOffset.y) {
              visible = false;
            }

            return visible;
          }
          /**
           * Toggles the classes
           * @private
           */

        }, {
          key: "_toggleClass",
          value: function _toggleClass() {
            var _this = this;

            if (this.visible) {
              if (Array.isArray(this.toggle["class"]["in"])) {
                this.toggle["class"]["in"].each(function (className) {
                  _this.element.classList.add(className);
                });
              } else {
                this.element.classList.add(this.toggle["class"]["in"]);
              }

              if (Array.isArray(this.toggle["class"].out)) {
                this.toggle["class"].out.each(function (className) {
                  _this.element.classList.remove(className);
                });
              } else {
                this.element.classList.remove(this.toggle["class"].out);
              }

              return;
            }

            if (Array.isArray(this.toggle["class"]["in"])) {
              this.toggle["class"]["in"].each(function (className) {
                _this.element.classList.remove(className);
              });
            } else {
              this.element.classList.remove(this.toggle["class"]["in"]);
            }

            if (Array.isArray(this.toggle["class"].out)) {
              this.toggle["class"].out.each(function (className) {
                _this.element.classList.add(className);
              });
            } else {
              this.element.classList.add(this.toggle["class"].out);
            }
          }
          /**
           * Toggles the callback
           * @private
           * @return null|Promise
           */

        }, {
          key: "_toggleCallback",
          value: function _toggleCallback() {
            if (this.visible) {
              if (typeof this.toggle.callback["in"] == 'function') {
                return this.toggle.callback["in"].call(this.element, this);
              }
            } else {
              if (typeof this.toggle.callback.out == 'function') {
                return this.toggle.callback.out.call(this.element, this);
              }
            }
          }
        }]);

        return Trigger;
      }(); // CONCATENATED MODULE: ./src/scripts/TriggerCollection.js


      function TriggerCollection_classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      function TriggerCollection_defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function TriggerCollection_createClass(Constructor, protoProps, staticProps) {
        if (protoProps) TriggerCollection_defineProperties(Constructor.prototype, protoProps);
        if (staticProps) TriggerCollection_defineProperties(Constructor, staticProps);
        return Constructor;
      }

      var TriggerCollection_TriggerCollection = /*#__PURE__*/function () {
        /**
         * Initializes the collection
         * @param {Trigger[]} [triggers=[]] triggers A set of triggers to init with, optional
         */
        function TriggerCollection(triggers) {
          TriggerCollection_classCallCheck(this, TriggerCollection);
          /**
           * @member {Trigger[]}
           */

          this.triggers = triggers instanceof Array ? triggers : [];
        }
        /**
         * Adds one or multiple Trigger objects
         * @param {Trigger|Trigger[]} objects
         */


        TriggerCollection_createClass(TriggerCollection, [{
          key: "add",
          value: function add(objects) {
            var _this = this;

            if (objects instanceof Trigger_Trigger) {
              // single
              return this.triggers.push(objects);
            }

            objects.each(function (trigger) {
              if (trigger instanceof Trigger_Trigger) {
                _this.triggers.push(trigger);
              } else {
                console.error('Object added to TriggerCollection is not a Trigger. Object: ', trigger);
              }
            });
          }
          /**
           * Removes one or multiple Trigger objects
           * @param {Trigger|Trigger[]} objects
           */

        }, {
          key: "remove",
          value: function remove(objects) {
            if (objects instanceof Trigger_Trigger) {
              objects = [objects];
            }

            this.triggers = this.triggers.filter(function (trigger) {
              var hit = false;
              objects.each(function (object) {
                if (object == trigger) {
                  hit = true;
                }
              });
              return !hit;
            });
          }
          /**
           * Lookup one or multiple triggers by a query string
           * @param {string} selector
           * @returns {Trigger[]}
           */

        }, {
          key: "query",
          value: function query(selector) {
            return this.triggers.filter(function (trigger) {
              var element = trigger.element;
              var parent = element.parentNode;
              var nodes = [].slice.call(parent.querySelectorAll(selector));
              return nodes.indexOf(element) > -1;
            });
          }
          /**
           * Lookup one or multiple triggers by a certain HTMLElement or NodeList
           * @param {HTMLElement|HTMLElement[]|NodeList} element
           * @returns {Trigger|Trigger[]|null}
           */

        }, {
          key: "search",
          value: function search(element) {
            var found = this.triggers.filter(function (trigger) {
              if (element instanceof NodeList || Array.isArray(element)) {
                var hit = false;
                element.each(function (el) {
                  if (trigger.element == el) {
                    hit = true;
                  }
                });
                return hit;
              }

              return trigger.element == element;
            });
            return found.length == 0 ? null : found.length > 1 ? found : found[0];
          }
          /**
           * Calls a function on all triggers
           * @param {(function())} callback
           */

        }, {
          key: "call",
          value: function call(callback) {
            this.triggers.each(callback);
          }
        }]);
        return TriggerCollection;
      }(); // CONCATENATED MODULE: ./src/scripts/ScrollAnimationLoop.js


      function ScrollAnimationLoop_classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      function ScrollAnimationLoop_defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function ScrollAnimationLoop_createClass(Constructor, protoProps, staticProps) {
        if (protoProps) ScrollAnimationLoop_defineProperties(Constructor.prototype, protoProps);
        if (staticProps) ScrollAnimationLoop_defineProperties(Constructor, staticProps);
        return Constructor;
      }

      var ScrollAnimationLoop_ScrollAnimationLoop = /*#__PURE__*/function () {
        /**
         * ScrollAnimationLoop constructor.
         * Starts a requestAnimationFrame loop as long as the user has scrolled the scrollElement. Stops after a certain time.
         *
         * @param {DefaultOptions.scroll} [options=DefaultOptions.scroll] options The options for the loop
         * @param {ScrollCallback} callback [loop=null] The loop callback
         */
        function ScrollAnimationLoop(options, callback) {
          ScrollAnimationLoop_classCallCheck(this, ScrollAnimationLoop);

          this._parseOptions(options);

          if (typeof callback === 'function') {
            this.callback = callback;
          }

          this.direction = 'none';
          this.position = this.getPosition();
          this.lastAction = this._getTimestamp();

          this._startRun();

          this._boundListener = this._didScroll.bind(this);
          this.element.addEventListener('scroll', this._boundListener);
        }
        /**
         * Parses the options
         *
         * @param {DefaultOptions.scroll} [options=DefaultOptions.scroll] options The options for the loop
         * @private
         */


        ScrollAnimationLoop_createClass(ScrollAnimationLoop, [{
          key: "_parseOptions",
          value: function _parseOptions(options) {
            var defaults = new DefaultOptions().scroll;

            if (typeof options != 'function') {
              defaults.callback = function () {};

              defaults = extend_default()(defaults, options);
            } else {
              defaults.callback = options;
            }

            this.element = defaults.element;
            this.sustain = defaults.sustain;
            this.callback = defaults.callback;
            this.startCallback = defaults.start;
            this.stopCallback = defaults.stop;
            this.directionChange = defaults.directionChange;
          }
          /**
           * Callback when the user scrolled the element
           * @private
           */

        }, {
          key: "_didScroll",
          value: function _didScroll() {
            var newPosition = this.getPosition();

            if (this.position !== newPosition) {
              var newDirection = this.direction;

              if (newPosition.x !== this.position.x) {
                newDirection = newPosition.x > this.position.x ? 'right' : 'left';
              } else if (newPosition.y !== this.position.y) {
                newDirection = newPosition.y > this.position.y ? 'bottom' : 'top';
              } else {
                newDirection = 'none';
              }

              if (newDirection !== this.direction) {
                this.direction = newDirection;

                if (typeof this.directionChange === 'function') {
                  this.directionChange(this.direction);
                }
              }

              this.position = newPosition;
              this.lastAction = this._getTimestamp();
            } else {
              this.direction = 'none';
            }

            if (!this.running) {
              this._startRun();
            }
          }
          /**
           * Starts the loop, calls the start callback
           * @private
           */

        }, {
          key: "_startRun",
          value: function _startRun() {
            this.running = true;

            if (typeof this.startCallback === 'function') {
              this.startCallback();
            }

            this._loop();
          }
          /**
           * Stops the loop, calls the stop callback
           * @private
           */

        }, {
          key: "_stopRun",
          value: function _stopRun() {
            this.running = false;

            if (typeof this.stopCallback === 'function') {
              this.stopCallback();
            }
          }
          /**
           * The current position of the element
           * @returns {{x: number, y: number}}
           */

        }, {
          key: "getPosition",
          value: function getPosition() {
            var left = this.element.pageXOffset || this.element.scrollLeft || document.documentElement.scrollLeft || 0;
            var top = this.element.pageYOffset || this.element.scrollTop || document.documentElement.scrollTop || 0;
            return {
              x: left,
              y: top
            };
          }
          /**
           * The current timestamp in ms
           * @returns {number}
           * @private
           */

        }, {
          key: "_getTimestamp",
          value: function _getTimestamp() {
            return Number(Date.now());
          }
          /**
           * One single tick of the animation
           * @private
           */

        }, {
          key: "_tick",
          value: function _tick() {
            this.callback(this.position, this.direction);

            var now = this._getTimestamp();

            if (now - this.lastAction > this.sustain) {
              this._stopRun();
            }

            if (this.running) {
              this._loop();
            }
          }
          /**
           * Requests an animation frame
           * @private
           */

        }, {
          key: "_loop",
          value: function _loop() {
            var frame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (callback) {
              setTimeout(callback, 1000 / 60);
            };

            frame(this._tick.bind(this));
          }
          /**
           * Kills the loop forever
           */

        }, {
          key: "kill",
          value: function kill() {
            this.running = false;
            this.element.removeEventListener('scroll', this._boundListener);
          }
        }]);
        return ScrollAnimationLoop;
      }(); // CONCATENATED MODULE: ./src/ScrollTrigger.js

      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "Trigger", function () {
        return ScrollTrigger_Trigger;
      });
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "TriggerCollection", function () {
        return ScrollTrigger_TriggerCollection;
      });
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "ScrollAnimationLoop", function () {
        return ScrollTrigger_ScrollAnimationLoop;
      });
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "default", function () {
        return ScrollTrigger_ScrollTrigger;
      });

      function ScrollTrigger_classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      function ScrollTrigger_defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function ScrollTrigger_createClass(Constructor, protoProps, staticProps) {
        if (protoProps) ScrollTrigger_defineProperties(Constructor.prototype, protoProps);
        if (staticProps) ScrollTrigger_defineProperties(Constructor, staticProps);
        return Constructor;
      }
      /*!
       * ScrollTrigger
       *
       *
       * http://github.com/terwanerik
       *
       * Copyright 2017, Erik Terwan <erik@erikterwan.com>
       * Released under the MIT license.
       *
       * Date: 2017-07-09
       */

      /**
       * Created by Erik on 09/07/2017.
       */


      var ScrollTrigger_Trigger = Trigger_Trigger;
      var ScrollTrigger_TriggerCollection = TriggerCollection_TriggerCollection;
      var ScrollTrigger_ScrollAnimationLoop = ScrollAnimationLoop_ScrollAnimationLoop;

      var ScrollTrigger_ScrollTrigger = /*#__PURE__*/function () {
        /**
         * Constructor for the scroll trigger
         * @param {DefaultOptions} [options=DefaultOptions] options
         */
        function ScrollTrigger(options) {
          ScrollTrigger_classCallCheck(this, ScrollTrigger);

          this._parseOptions(options);

          this._initCollection();

          this._initLoop();
        }
        /**
         * Parses the options
         * @param {DefaultOptions} [options=DefaultOptions] options
         * @private
         */


        ScrollTrigger_createClass(ScrollTrigger, [{
          key: "_parseOptions",
          value: function _parseOptions(options) {
            options = extend_default()(new DefaultOptions(), options);
            this.defaultTrigger = options.trigger;
            this.scrollOptions = options.scroll;
          }
          /**
           * Initializes the collection, picks all [data-scroll] elements as initial elements
           * @private
           */

        }, {
          key: "_initCollection",
          value: function _initCollection() {
            var scrollAttributes = document.querySelectorAll('[data-scroll]');
            var elements = [];

            if (scrollAttributes.length > 0) {
              elements = this.createTriggers(scrollAttributes);
            }

            this.collection = new ScrollTrigger_TriggerCollection(elements);
          }
          /**
           * Initializes the scroll loop
           * @private
           */

        }, {
          key: "_initLoop",
          value: function _initLoop() {
            var _this = this;

            this.loop = new ScrollTrigger_ScrollAnimationLoop({
              sustain: this.scrollOptions.sustain,
              element: this.scrollOptions.element,
              callback: function callback(position, direction) {
                _this._scrollCallback(position, direction);
              },
              start: function start() {
                _this._scrollStart();
              },
              stop: function stop() {
                _this._scrollStop();
              },
              directionChange: function directionChange(direction) {
                _this._scrollDirectionChange(direction);
              }
            });
          }
          /**
           * Callback for checking triggers
           * @param {{x: number, y: number}} position
           * @param {string} direction
           * @private
           */

        }, {
          key: "_scrollCallback",
          value: function _scrollCallback(position, direction) {
            var _this2 = this;

            this.collection.call(function (trigger) {
              trigger.checkVisibility(_this2.scrollOptions.element, direction);
            });
            this.scrollOptions.callback(position, direction);
          }
          /**
           * When the scrolling started
           * @private
           */

        }, {
          key: "_scrollStart",
          value: function _scrollStart() {
            this.scrollOptions.start();
          }
          /**
           * When the scrolling stopped
           * @private
           */

        }, {
          key: "_scrollStop",
          value: function _scrollStop() {
            this.scrollOptions.stop();
          }
          /**
           * When the direction changes
           * @param {string} direction
           * @private
           */

        }, {
          key: "_scrollDirectionChange",
          value: function _scrollDirectionChange(direction) {
            this.scrollOptions.directionChange(direction);
          }
          /**
           * Creates a Trigger object from a given element and optional option set
           * @param {HTMLElement} element
           * @param {DefaultOptions.trigger} [options=DefaultOptions.trigger] options
           * @returns Trigger
           */

        }, {
          key: "createTrigger",
          value: function createTrigger(element, options) {
            return new ScrollTrigger_Trigger(element, extend_default()(this.defaultTrigger, options));
          }
          /**
           * Creates an array of triggers
           * @param {HTMLElement[]|NodeList} elements
           * @param {Object} [options=null] options
           * @returns {Trigger[]} Array of triggers
           */

        }, {
          key: "createTriggers",
          value: function createTriggers(elements, options) {
            var _this3 = this;

            var triggers = [];
            elements.each(function (element) {
              triggers.push(_this3.createTrigger(element, options));
            });
            return triggers;
          }
          /**
           * Adds triggers
           * @param {string|HTMLElement|NodeList|Trigger|Trigger[]} objects A list of objects or a query
           * @param {Object} [options=null] options
           * @returns {ScrollTrigger}
           */

        }, {
          key: "add",
          value: function add(objects, options) {
            if (objects instanceof HTMLElement) {
              this.collection.add(this.createTrigger(objects, options));
              return this;
            }

            if (objects instanceof ScrollTrigger_Trigger) {
              this.collection.add(objects);
              return this;
            }

            if (objects instanceof NodeList) {
              this.collection.add(this.createTriggers(objects, options));
              return this;
            }

            if (Array.isArray(objects) && objects.length && objects[0] instanceof ScrollTrigger_Trigger) {
              this.collection.add(objects);
              return this;
            }

            if (Array.isArray(objects) && objects.length && objects[0] instanceof HTMLElement) {
              this.collection.add(this.createTriggers(objects, options));
              return this;
            } // assume it's a query string


            this.collection.add(this.createTriggers(document.querySelectorAll(objects), options));
            return this;
          }
          /**
           * Removes triggers
           * @param {string|HTMLElement|NodeList|Trigger|Trigger[]} objects A list of objects or a query
           * @returns {ScrollTrigger}
           */

        }, {
          key: "remove",
          value: function remove(objects) {
            if (objects instanceof ScrollTrigger_Trigger) {
              this.collection.remove(objects);
              return this;
            }

            if (Array.isArray(objects) && objects.length && objects[0] instanceof ScrollTrigger_Trigger) {
              this.collection.remove(objects);
              return this;
            }

            if (objects instanceof HTMLElement) {
              this.collection.remove(this.search(objects));
              return this;
            }

            if (Array.isArray(objects) && objects.length && objects[0] instanceof HTMLElement) {
              this.collection.remove(this.search(objects));
              return this;
            }

            if (objects instanceof NodeList) {
              this.collection.remove(this.search(objects));
              return this;
            }

            if (Array.isArray(objects) && objects.length && objects[0] instanceof ScrollTrigger_Trigger) {
              this.collection.remove(objects);
              return this;
            } // assume it's a query string


            this.collection.remove(this.query(objects.toString()));
            return this;
          }
          /**
           * Lookup one or multiple triggers by a query string
           * @param {string} selector
           * @returns {Trigger[]}
           */

        }, {
          key: "query",
          value: function query(selector) {
            return this.collection.query(selector);
          }
          /**
           * Lookup one or multiple triggers by a certain HTMLElement or NodeList
           * @param {HTMLElement|HTMLElement[]|NodeList} element
           * @returns {Trigger|Trigger[]|null}
           */

        }, {
          key: "search",
          value: function search(element) {
            return this.collection.search(element);
          }
          /**
           * Reattaches the scroll listener
           */

        }, {
          key: "listen",
          value: function listen() {
            if (this.loop) {
              return;
            }

            this._initLoop();
          }
          /**
           * Kills the scroll listener
           */

        }, {
          key: "kill",
          value: function kill() {
            this.loop.kill();
            this.loop = null;
          }
        }]);
        return ScrollTrigger;
      }();
      /***/

    }
    /******/
    ])
  );
});
},{}],"src/styles/index/about.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/parts/index/about.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _scrolltrigger = _interopRequireDefault(require("@terwanerik/scrolltrigger"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

require("../../styles/index/about.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var textfacts;
// text facts
textfacts = [{
  title: 'Neovim',
  description: 'I’m a big fan of neovim and have been using it as my go-to editor for more than a year. I do coding and blog-writing all from my terminal.'
}, {
  title: 'Web technology',
  description: 'I believe web is an elegant solution to most problems. Thus, I have been working closely with web apps since I started programming.'
}, {
  title: 'Self-taught',
  description: 'I’m a self-taught developer since I was 12. After that, I skiped high school to study for my Higher Diploma in Software Engineering in 2016 then went on to do my Bachelor in IT in 2019.'
}, {
  title: 'Movies & music',
  description: 'I can’t work without music and live my life with headphones on my ears. I’m also a huge fan of movies, especially classic 70s/80s/90s movies that existed years before I was even born.'
}];

function _default() {
  return {
    oncreate: function oncreate(vnode) {
      var inner, j, k, len, len1, textWrappers0, textWrappers1, trigger, wrapper;
      trigger = new _scrolltrigger.default({
        trigger: {
          once: true,
          offset: {
            element: {
              y: function y() {
                return 0.3;
              }
            }
          }
        }
      });
      textWrappers0 = vnode.dom.querySelectorAll('.reveal-0');

      for (j = 0, len = textWrappers0.length; j < len; j++) {
        wrapper = textWrappers0[j];
        wrapper.innerHTML = wrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
      }

      textWrappers1 = vnode.dom.querySelectorAll(".reveal-1");

      for (k = 0, len1 = textWrappers1.length; k < len1; k++) {
        wrapper = textWrappers1[k];
        inner = document.createElement('span');
        inner.textContent = wrapper.textContent;
        wrapper.textContent = '';
        wrapper.appendChild(inner);
      }

      trigger.add('.about .reveal-0', {
        toggle: {
          callback: {
            in: function _in() {
              var letters;
              letters = this.querySelectorAll('.letter');
              return _animeEs.default.timeline().add({
                targets: letters,
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 1200,
                delay: function delay(el, i) {
                  return 5 * i;
                }
              });
            }
          }
        }
      });
      trigger.add('.about .reveal-1', {
        toggle: {
          callback: {
            in: function _in() {
              var span;
              span = this.querySelector('span');
              return _animeEs.default.timeline().add({
                targets: span,
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                duration: 1200,
                easing: "easeOutExpo"
              });
            }
          }
        }
      });
      return trigger.add('.about .reveal-2', {
        toggle: {
          callback: {
            in: function _in() {
              return _animeEs.default.timeline().add({
                targets: this,
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                duration: 1300,
                easing: "easeOutExpo"
              });
            }
          }
        }
      });
    },
    view: function view() {
      return (0, _mithril.default)('.about.section', [(0, _mithril.default)('.row', [(0, _mithril.default)('.left-side', [(0, _mithril.default)('h1.title.reveal-1', 'About me')]), (0, _mithril.default)('.right-side', [(0, _mithril.default)('p#overall', [(0, _mithril.default)('span.reveal-0', 'I was born on October 5, 2001 in Saigon, Vietnam. I started writing '), (0, _mithril.default)('span.reveal-0', 'instructions for computer since the age of 12, and at the moment, '), (0, _mithril.default)('span.reveal-0', 'I’m living and studying in New Zealand.')])])]), (0, _mithril.default)('.row', [(0, _mithril.default)('.left-side', [(0, _mithril.default)('.number-fact', [(0, _mithril.default)('.number.reveal-1', '29'), (0, _mithril.default)('.description.reveal-2', 'Open-source projects')])]), (0, _mithril.default)('.right-side', textfacts.slice(0, 2).map(function (fact) {
        return (0, _mithril.default)('.text-fact', [(0, _mithril.default)('.title.reveal-1', fact.title), (0, _mithril.default)('.description.reveal-2', fact.description)]);
      }))]), (0, _mithril.default)('.row', [(0, _mithril.default)('.left-side', [(0, _mithril.default)('.number-fact', [(0, _mithril.default)('.number.reveal-1', '0'), (0, _mithril.default)('.description.reveal-2', 'Cups of coffee')])]), (0, _mithril.default)('.right-side', textfacts.slice(2).map(function (fact) {
        return (0, _mithril.default)('.text-fact', [(0, _mithril.default)('.title.reveal-1', fact.title), (0, _mithril.default)('.description.reveal-2', fact.description)]);
      }))])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","@terwanerik/scrolltrigger":"node_modules/@terwanerik/scrolltrigger/dist/ScrollTrigger.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","../../styles/index/about.sass":"src/styles/index/about.sass"}],"static/snippetstore.png":[function(require,module,exports) {
module.exports = "/snippetstore.91c0b14d.png";
},{}],"static/boostnote.png":[function(require,module,exports) {
module.exports = "/boostnote.1bb558a1.png";
},{}],"static/mymovielist.jpg":[function(require,module,exports) {
module.exports = "/mymovielist.6802cb36.jpg";
},{}],"static/velocitynet.jpg":[function(require,module,exports) {
module.exports = "/velocitynet.350bf9fa.jpg";
},{}],"static/project-vector.svg":[function(require,module,exports) {
module.exports = "/project-vector.5ad8cd5f.svg";
},{}],"src/styles/index/projects.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/parts/index/projects.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

var _scrolltrigger = _interopRequireDefault(require("@terwanerik/scrolltrigger"));

var _snippetstore = _interopRequireDefault(require("../../../static/snippetstore.png"));

var _boostnote = _interopRequireDefault(require("../../../static/boostnote.png"));

var _mymovielist = _interopRequireDefault(require("../../../static/mymovielist.jpg"));

var _velocitynet = _interopRequireDefault(require("../../../static/velocitynet.jpg"));

var _projectVector = _interopRequireDefault(require("../../../static/project-vector.svg"));

require("../../styles/index/projects.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var projects;
projects = [{
  name: 'SnippetStore',
  img: _snippetstore.default,
  year: '2018',
  role: 'Developer',
  context: 'Open-source',
  link: '#!/snippetstore'
}, {
  name: 'Boostnote',
  img: _boostnote.default,
  year: '2018',
  role: 'Maintainer',
  context: 'Open-source',
  link: '#!/boostnote'
}, {
  name: 'VelocityNet',
  img: _velocitynet.default,
  year: '2019',
  role: 'Fullstack developer',
  context: 'Contractor',
  link: '#!/velocitynet'
}, {
  name: 'My movie list',
  img: _mymovielist.default,
  year: '2020',
  role: 'Developer',
  context: 'Open-source',
  link: 'https://github.com/ZeroX-DG/MyWatchList'
}];

function _default() {
  var activeIndex;
  activeIndex = 0;
  return {
    oncreate: function oncreate(vnode) {
      var trigger;
      trigger = new _scrolltrigger.default({
        trigger: {
          once: true,
          offset: {
            element: {
              y: function y() {
                return 0.3;
              }
            }
          }
        }
      });
      trigger.add('.projects .reveal-0', {
        toggle: {
          callback: {
            in: function _in() {
              return _animeEs.default.timeline().add({
                targets: this,
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 1200
              });
            }
          }
        }
      });
      return trigger.add('.projects .reveal-1', {
        toggle: {
          callback: {
            in: function _in() {
              var els;
              els = this.querySelectorAll('.project-selector');
              return (0, _animeEs.default)({
                targets: els,
                translateY: [100, 0],
                opacity: [0, 1],
                easing: "linear",
                delay: _animeEs.default.stagger(300)
              });
            }
          }
        }
      });
    },
    view: function view() {
      var activeProject;
      activeProject = projects[activeIndex];
      return (0, _mithril.default)('.projects.section', [(0, _mithril.default)('h1.title.reveal-0', ['Recent works', (0, _mithril.default)('a.see-more', {
        href: '#!/projects'
      }, ['All projects', (0, _mithril.default)('span.icon-container', (0, _mithril.default)('i.fa.fa-long-arrow-right'))])]), (0, _mithril.default)('p.overall.reveal-0', 'Most of my projects are open-source apps but I’m also starting to creating close-source apps for monitizing.'), (0, _mithril.default)('.row', [(0, _mithril.default)('.project-selectors.reveal-1', projects.map(function (project, index) {
        var isActive;
        isActive = index === activeIndex;
        return (0, _mithril.default)("a.project-selector".concat(isActive ? '.active' : ''), {
          href: project.link,
          onmouseover: function onmouseover() {
            if (!isActive) {
              return (0, _animeEs.default)({
                targets: '.project-detail',
                opacity: 0,
                easing: 'linear',
                duration: 300,
                complete: function complete() {
                  activeIndex = index;

                  _mithril.default.redraw();

                  return (0, _animeEs.default)({
                    targets: '.project-detail',
                    opacity: 1,
                    duration: 300,
                    easing: 'linear'
                  });
                }
              });
            }
          }
        }, [(0, _mithril.default)('span.project-number', "0".concat(index + 1)), (0, _mithril.default)('span.separator'), (0, _mithril.default)('span.project-name', project.name)]);
      })), (0, _mithril.default)('.project-detail.reveal-0', [(0, _mithril.default)('img.feature-img', {
        src: activeProject.img
      }), (0, _mithril.default)('.mask'), (0, _mithril.default)('.project-info', [(0, _mithril.default)('p.project-title', activeProject.name), (0, _mithril.default)('p.project-overview', [(0, _mithril.default)('span.year', activeProject.year), (0, _mithril.default)('span', ' | '), (0, _mithril.default)('span.role', activeProject.role), (0, _mithril.default)('span', ' | '), (0, _mithril.default)('span.context', activeProject.context)])])])]), (0, _mithril.default)('img.vector', {
        src: _projectVector.default
      })]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","@terwanerik/scrolltrigger":"node_modules/@terwanerik/scrolltrigger/dist/ScrollTrigger.js","../../../static/snippetstore.png":"static/snippetstore.png","../../../static/boostnote.png":"static/boostnote.png","../../../static/mymovielist.jpg":"static/mymovielist.jpg","../../../static/velocitynet.jpg":"static/velocitynet.jpg","../../../static/project-vector.svg":"static/project-vector.svg","../../styles/index/projects.sass":"src/styles/index/projects.sass"}],"static/sit.jpg":[function(require,module,exports) {
module.exports = "/sit.f6f70248.jpg";
},{}],"static/fpt.jpg":[function(require,module,exports) {
module.exports = "/fpt.0372c23e.jpg";
},{}],"src/styles/index/education.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/parts/index/education.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

var _scrolltrigger = _interopRequireDefault(require("@terwanerik/scrolltrigger"));

var _sit = _interopRequireDefault(require("../../../static/sit.jpg"));

var _fpt = _interopRequireDefault(require("../../../static/fpt.jpg"));

require("../../styles/index/education.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    oncreate: function oncreate(vnode) {
      var trigger;
      trigger = new _scrolltrigger.default({
        trigger: {
          once: true,
          offset: {
            element: {
              y: function y() {
                return 0.3;
              }
            }
          }
        }
      });
      return trigger.add('.education .reveal-0', {
        toggle: {
          callback: {
            in: function _in() {
              return _animeEs.default.timeline().add({
                targets: this,
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 1200
              });
            }
          }
        }
      });
    },
    view: function view() {
      return (0, _mithril.default)('.education.section', [(0, _mithril.default)('h1.title.reveal-0', 'Education'), (0, _mithril.default)('.row', [(0, _mithril.default)('.col', [(0, _mithril.default)('.education-group', [(0, _mithril.default)('.duration.reveal-0', 'Feb 2019 - Jun 2020'), (0, _mithril.default)('.name.reveal-0', 'Bachelor of Information Technology'), (0, _mithril.default)('.school.reveal-0', '@ Southern Institute of Technology, New Zealand'), (0, _mithril.default)('.overview.reveal-0', 'Studying abroad alone at 17 was a scary idea for me, and I\'m glad that I have chosen the Southern Institute of Technology. At SIT, the course was challenging and fascinating. However, what I enjoy the most about the course were the awesome friends that I made, who helped me a lot when I move to a new country for the first time and jump right into the last year of the course.')])]), (0, _mithril.default)('.col', [(0, _mithril.default)('img.education-img.reveal-0', {
        src: _sit.default
      }), (0, _mithril.default)('span.year.reveal-0', '2019')]), (0, _mithril.default)('.col', [(0, _mithril.default)('.education-group', [(0, _mithril.default)('.duration.reveal-0', 'Aug 2016 - Jun 2018'), (0, _mithril.default)('.name.reveal-0', 'Higher Diploma in Software Engineering'), (0, _mithril.default)('.school.reveal-0', '@ FPT Aptech, Vietnam'), (0, _mithril.default)('.overview.reveal-0', 'The picture on the right was taken when I got the highest score in the class. I was 15 at the time and was relieved that not only I can keep up with the course but also get the highest score. During this time, I meet some of my best friends, and since this is the first time I travel to the city center to attend my course, they make sure that we do the craziest things to celebrate the start of my marvellous youth.')])]), (0, _mithril.default)('.col', [(0, _mithril.default)('img.education-img.reveal-0', {
        src: _fpt.default
      }), (0, _mithril.default)('span.year.reveal-0', '2016')])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","@terwanerik/scrolltrigger":"node_modules/@terwanerik/scrolltrigger/dist/ScrollTrigger.js","../../../static/sit.jpg":"static/sit.jpg","../../../static/fpt.jpg":"static/fpt.jpg","../../styles/index/education.sass":"src/styles/index/education.sass"}],"src/styles/index/index.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/page/index.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

var _layout = _interopRequireDefault(require("../components/layout"));

var _intro = _interopRequireDefault(require("../parts/index/intro"));

var _about = _interopRequireDefault(require("../parts/index/about"));

var _projects = _interopRequireDefault(require("../parts/index/projects"));

var _education = _interopRequireDefault(require("../parts/index/education"));

require("../styles/index/index.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    onbeforeremove: function onbeforeremove(vnode) {
      return new Promise(function (resolve) {
        (0, _animeEs.default)({
          targets: vnode.dom,
          opacity: 0,
          easing: 'linear',
          duration: 300,
          complete: resolve
        });
        return setTimeout(function () {
          return document.documentElement.scrollTop = 0;
        }, 290);
      });
    },
    view: function view() {
      return (0, _mithril.default)(_layout.default, (0, _mithril.default)('.index-page', [(0, _mithril.default)(_intro.default), (0, _mithril.default)(_about.default), (0, _mithril.default)(_projects.default), (0, _mithril.default)(_education.default)]));
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","../components/layout":"src/components/layout.coffee","../parts/index/intro":"src/parts/index/intro.coffee","../parts/index/about":"src/parts/index/about.coffee","../parts/index/projects":"src/parts/index/projects.coffee","../parts/index/education":"src/parts/index/education.coffee","../styles/index/index.sass":"src/styles/index/index.sass"}],"static/work-intro-vector.svg":[function(require,module,exports) {
module.exports = "/work-intro-vector.34d5e330.svg";
},{}],"static/work-box-white.svg":[function(require,module,exports) {
module.exports = "/work-box-white.c3d34ab7.svg";
},{}],"static/shadow.png":[function(require,module,exports) {
module.exports = "/shadow.193baa0c.png";
},{}],"src/styles/projects/intro.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/parts/projects/intro.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

var _scrolltrigger = _interopRequireDefault(require("@terwanerik/scrolltrigger"));

var _workIntroVector = _interopRequireDefault(require("../../../static/work-intro-vector.svg"));

var _workBoxWhite = _interopRequireDefault(require("../../../static/work-box-white.svg"));

var _shadow = _interopRequireDefault(require("../../../static/shadow.png"));

require("../../styles/projects/intro.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    oncreate: function oncreate() {
      var trigger;
      (0, _animeEs.default)({
        targets: '#floating-box-1 .box',
        translateY: 20,
        easing: 'linear',
        direction: 'alternate',
        loop: true
      });
      (0, _animeEs.default)({
        targets: '#floating-box-2 .box',
        translateY: [20, 0],
        easing: 'linear',
        direction: 'alternate',
        loop: true
      });
      trigger = new _scrolltrigger.default({
        trigger: {
          once: true,
          offset: {
            element: {
              y: function y() {
                return 0.3;
              }
            }
          }
        }
      });
      return trigger.add('.intro .reveal-0', {
        toggle: {
          callback: {
            in: function _in() {
              return _animeEs.default.timeline().add({
                targets: this,
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 1200
              });
            }
          }
        }
      });
    },
    view: function view() {
      return (0, _mithril.default)('.intro', [(0, _mithril.default)('.left', [(0, _mithril.default)('h1.title.reveal-0', 'Works'), (0, _mithril.default)('p.description.reveal-0', 'I love building things and pushing my limits. Every project of mine is a great teacher, and this is a list of lessons that I have learnt.')]), (0, _mithril.default)('.right', [(0, _mithril.default)('img.intro-vector.reveal-0', {
        src: _workIntroVector.default
      }), (0, _mithril.default)('.floating-box#floating-box-1', [(0, _mithril.default)('img.box', {
        src: _workBoxWhite.default
      }), (0, _mithril.default)('img.shadow', {
        src: _shadow.default
      })]), (0, _mithril.default)('.floating-box#floating-box-2', [(0, _mithril.default)('img.box', {
        src: _workBoxWhite.default
      }), (0, _mithril.default)('img.shadow', {
        src: _shadow.default
      })])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","@terwanerik/scrolltrigger":"node_modules/@terwanerik/scrolltrigger/dist/ScrollTrigger.js","../../../static/work-intro-vector.svg":"static/work-intro-vector.svg","../../../static/work-box-white.svg":"static/work-box-white.svg","../../../static/shadow.png":"static/shadow.png","../../styles/projects/intro.sass":"src/styles/projects/intro.sass"}],"static/maddog.jpg":[function(require,module,exports) {
module.exports = "/maddog.6af17acf.jpg";
},{}],"static/sonalus.png":[function(require,module,exports) {
module.exports = "/sonalus.22fff106.png";
},{}],"static/rsn.png":[function(require,module,exports) {
module.exports = "/rsn.f31a452e.png";
},{}],"static/spacechess.png":[function(require,module,exports) {
module.exports = "/spacechess.c48c0e32.png";
},{}],"src/styles/projects/project-list.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/parts/projects/project-list.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

var _scrolltrigger = _interopRequireDefault(require("@terwanerik/scrolltrigger"));

var _snippetstore = _interopRequireDefault(require("../../../static/snippetstore.png"));

var _boostnote = _interopRequireDefault(require("../../../static/boostnote.png"));

var _velocitynet = _interopRequireDefault(require("../../../static/velocitynet.jpg"));

var _maddog = _interopRequireDefault(require("../../../static/maddog.jpg"));

var _sonalus = _interopRequireDefault(require("../../../static/sonalus.png"));

var _mymovielist = _interopRequireDefault(require("../../../static/mymovielist.jpg"));

var _rsn = _interopRequireDefault(require("../../../static/rsn.png"));

var _spacechess = _interopRequireDefault(require("../../../static/spacechess.png"));

require("../../styles/projects/project-list.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var leftProjects, projects, rightProjects;
projects = [{
  side: 'left',
  title: 'SnippetStore',
  color: 'blue',
  description: 'A code snippet manager for developers built with electron and React.js',
  image: _snippetstore.default,
  link: '!#/snippetstore'
}, {
  side: 'right',
  title: 'Boostnote',
  color: 'green',
  description: 'A markdown-based note-taking app for developers',
  image: _boostnote.default,
  link: '!#/boostnote'
}, {
  side: 'right',
  title: 'VelocityNet',
  color: 'red',
  description: 'A website for a New Zealand ISP with integration to management system and automate customer sign up processing',
  image: _velocitynet.default,
  link: '!#/velocitynet'
}, {
  side: 'left',
  title: 'Maddog',
  color: 'yellow',
  description: 'A simple shooting game controlled using hand gestures for my Human-Computer interaction class.',
  image: _maddog.default,
  link: '!#/maddog'
}, {
  side: 'right',
  title: 'Sonalus',
  color: 'purple',
  description: 'A simple WYSIWYG markdown editor. Inspired by Boostnote, Typora and Marktext.',
  image: _sonalus.default,
  link: 'https://zerox-dg.github.io/Sonalus/index.html'
}, {
  side: 'left',
  title: 'MyMovieList',
  color: 'blue',
  description: 'A simple movie list that allows keeping track of the watch count and synchronize with multiple devices via Github gist.',
  image: _mymovielist.default,
  link: 'https://github.com/ZeroX-DG/MyWatchList'
}, {
  side: 'right',
  title: 'RSN',
  color: 'black',
  description: 'A simple TUI rss reader written in Rust. This is my first ever project with Rust.',
  image: _rsn.default,
  link: 'https://github.com/ZeroX-DG/rsn'
}, {
  side: 'left',
  title: 'Spacechess',
  color: 'yellow',
  description: 'A simple experiment with three.js. In this experimement, I tried to load 3d models and play around with lighting in three.js',
  image: _spacechess.default,
  link: 'https://github.com/ZeroX-DG/spacechess'
}];

var _projects$reduce = projects.reduce(function (acc, current) {
  var index;
  index = current.side === 'left' ? 0 : 1;
  acc[index].push(current);
  return acc;
}, [[], []]);

var _projects$reduce2 = _slicedToArray(_projects$reduce, 2);

leftProjects = _projects$reduce2[0];
rightProjects = _projects$reduce2[1];

function _default() {
  return {
    oncreate: function oncreate(vnode) {
      var trigger;
      trigger = new _scrolltrigger.default({
        trigger: {
          once: true,
          offset: {
            element: {
              y: function y() {
                return 0.5;
              }
            }
          }
        }
      });
      trigger.add('.project-list .reveal-0', {
        toggle: {
          callback: {
            in: function _in() {
              return _animeEs.default.timeline().add({
                targets: this,
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 1200
              });
            }
          }
        }
      });
      return trigger.add('.project-list .reveal-1', {
        toggle: {
          callback: {
            in: function _in() {
              return _animeEs.default.timeline().add({
                targets: this,
                translateY: [100, 0],
                opacity: [0, 0.5],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 1000
              });
            }
          }
        }
      });
    },
    view: function view() {
      return (0, _mithril.default)('.project-list', [(0, _mithril.default)('.left-column', [(0, _mithril.default)('.short-word.reveal-0', 'These projects are ordered based on how interesting they are to me instead of the year they were made because my inspiration went on vacation since 2019, and it hasn’t come back yet.'), leftProjects.map(function (project) {
        return (0, _mithril.default)("a.project.".concat(project.color, ".reveal-1"), {
          href: project.link
        }, [(0, _mithril.default)('h2.title', project.title), (0, _mithril.default)('p.description', project.description), (0, _mithril.default)('.image', (0, _mithril.default)('img', {
          src: project.image
        }))]);
      })]), (0, _mithril.default)('.right-column', [rightProjects.map(function (project) {
        return (0, _mithril.default)("a.project.".concat(project.color, ".reveal-1"), {
          href: project.link
        }, [(0, _mithril.default)('h2.title', project.title), (0, _mithril.default)('p.description', project.description), (0, _mithril.default)('.image', (0, _mithril.default)('img', {
          src: project.image
        }))]);
      })])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","@terwanerik/scrolltrigger":"node_modules/@terwanerik/scrolltrigger/dist/ScrollTrigger.js","../../../static/snippetstore.png":"static/snippetstore.png","../../../static/boostnote.png":"static/boostnote.png","../../../static/velocitynet.jpg":"static/velocitynet.jpg","../../../static/maddog.jpg":"static/maddog.jpg","../../../static/sonalus.png":"static/sonalus.png","../../../static/mymovielist.jpg":"static/mymovielist.jpg","../../../static/rsn.png":"static/rsn.png","../../../static/spacechess.png":"static/spacechess.png","../../styles/projects/project-list.sass":"src/styles/projects/project-list.sass"}],"static/work-box-blue.svg":[function(require,module,exports) {
module.exports = "/work-box-blue.4271825e.svg";
},{}],"src/styles/projects/index.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/page/projects.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _layout = _interopRequireDefault(require("../components/layout"));

var _intro = _interopRequireDefault(require("../parts/projects/intro.coffee"));

var _projectList = _interopRequireDefault(require("../parts/projects/project-list.coffee"));

var _workBoxWhite = _interopRequireDefault(require("../../static/work-box-white.svg"));

var _workBoxBlue = _interopRequireDefault(require("../../static/work-box-blue.svg"));

require("../styles/projects/index.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    onbeforeremove: function onbeforeremove(vnode) {
      return document.documentElement.scrollTop = 0;
    },
    view: function view() {
      return (0, _mithril.default)(_layout.default, (0, _mithril.default)('.projects-page', [(0, _mithril.default)(_intro.default), (0, _mithril.default)(_projectList.default), (0, _mithril.default)('img.decorate-box#box-1', {
        src: _workBoxWhite.default
      }), (0, _mithril.default)('img.decorate-box#box-2', {
        src: _workBoxBlue.default
      }), (0, _mithril.default)('img.decorate-box#box-3', {
        src: _workBoxWhite.default
      }), (0, _mithril.default)('img.decorate-box#box-4', {
        src: _workBoxWhite.default
      }), (0, _mithril.default)('img.decorate-box#box-5', {
        src: _workBoxWhite.default
      }), (0, _mithril.default)('img.decorate-box#box-6', {
        src: _workBoxWhite.default
      }), (0, _mithril.default)('img.decorate-box#box-7', {
        src: _workBoxBlue.default
      })]));
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","../components/layout":"src/components/layout.coffee","../parts/projects/intro.coffee":"src/parts/projects/intro.coffee","../parts/projects/project-list.coffee":"src/parts/projects/project-list.coffee","../../static/work-box-white.svg":"static/work-box-white.svg","../../static/work-box-blue.svg":"static/work-box-blue.svg","../styles/projects/index.sass":"src/styles/projects/index.sass"}],"src/styles/project.sass":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/project-layout.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _animeEs = _interopRequireDefault(require("animejs/lib/anime.es.js"));

var _scrolltrigger = _interopRequireDefault(require("@terwanerik/scrolltrigger"));

var _layout = _interopRequireDefault(require("./layout.coffee"));

require("../styles/project.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    oncreate: function oncreate(vnode) {
      var trigger;
      trigger = new _scrolltrigger.default({
        trigger: {
          once: true,
          offset: {
            element: {
              y: function y() {
                return 0.3;
              }
            }
          }
        }
      });

      _animeEs.default.timeline().add({
        targets: vnode.dom.querySelector('.header img'),
        translateY: [100, 0],
        opacity: [0, 1],
        translateZ: 0,
        easing: "easeOutExpo",
        duration: 1200
      }).add({
        targets: vnode.dom.querySelector('.header h1'),
        translateY: [-100, 0],
        opacity: [0, 1],
        translateZ: 0,
        easing: "easeOutExpo",
        duration: 1200
      }, '-=800').add({
        targets: vnode.dom.querySelector('.float-info-box'),
        translateY: [100, 0],
        opacity: [0, 1],
        translateZ: 0,
        easing: "easeOutExpo",
        duration: 1200
      }, '-=800');

      trigger.add('.content p, .content h2, .content li', {
        toggle: {
          callback: {
            in: function _in() {
              return _animeEs.default.timeline().add({
                targets: this,
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 1200
              });
            }
          }
        }
      });
      return trigger.add('.stack', {
        toggle: {
          callback: {
            in: function _in() {
              return _animeEs.default.timeline().add({
                targets: this.querySelectorAll('.tech-stack'),
                translateY: [100, 0],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 600,
                delay: _animeEs.default.stagger(100)
              });
            }
          }
        }
      });
    },
    view: function view(vnode) {
      var headerImg, headerTitle;
      var _vnode$attrs = vnode.attrs;
      headerImg = _vnode$attrs.headerImg;
      headerTitle = _vnode$attrs.headerTitle;
      return (0, _mithril.default)(_layout.default, (0, _mithril.default)(".project-detail.".concat(vnode.attrs.class), [vnode.children]));
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","animejs/lib/anime.es.js":"node_modules/animejs/lib/anime.es.js","@terwanerik/scrolltrigger":"node_modules/@terwanerik/scrolltrigger/dist/ScrollTrigger.js","./layout.coffee":"src/components/layout.coffee","../styles/project.sass":"src/styles/project.sass"}],"src/components/project-header.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    view: function view(vnode) {
      var headerImg, headerTitle;
      var _vnode$attrs = vnode.attrs;
      headerImg = _vnode$attrs.headerImg;
      headerTitle = _vnode$attrs.headerTitle;
      return (0, _mithril.default)('.header', [(0, _mithril.default)('.content', [(0, _mithril.default)('img', {
        src: headerImg
      }), (0, _mithril.default)('.info', [(0, _mithril.default)('h1.title', headerTitle)])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js"}],"src/components/project-float-info.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    view: function view(vnode) {
      var context, role, year;
      var _vnode$attrs = vnode.attrs;
      role = _vnode$attrs.role;
      year = _vnode$attrs.year;
      context = _vnode$attrs.context;
      return (0, _mithril.default)('.float-info-box', [(0, _mithril.default)('.part', [(0, _mithril.default)('span.label', 'Roles'), (0, _mithril.default)('span.value', role)]), (0, _mithril.default)('.part', [(0, _mithril.default)('span.label', 'Year'), (0, _mithril.default)('span.value', year)]), (0, _mithril.default)('.part', [(0, _mithril.default)('span.label', 'Context'), (0, _mithril.default)('span.value', context)])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js"}],"static/boostnote-app.png":[function(require,module,exports) {
module.exports = "/boostnote-app.ba1ab5a1.png";
},{}],"static/maintainer.png":[function(require,module,exports) {
module.exports = "/maintainer.f995257b.png";
},{}],"static/react.svg":[function(require,module,exports) {
module.exports = "/react.29f81f5b.svg";
},{}],"static/electron.png":[function(require,module,exports) {
module.exports = "/electron.39532c48.png";
},{}],"static/codemirror.svg":[function(require,module,exports) {
module.exports = "/codemirror.4265056d.svg";
},{}],"static/redux.png":[function(require,module,exports) {
module.exports = "/redux.41c15c2f.png";
},{}],"src/page/boostnote.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _projectLayout = _interopRequireDefault(require("../components/project-layout.coffee"));

var _projectHeader = _interopRequireDefault(require("../components/project-header.coffee"));

var _projectFloatInfo = _interopRequireDefault(require("../components/project-float-info.coffee"));

var _boostnote = _interopRequireDefault(require("../../static/boostnote.png"));

var _boostnoteApp = _interopRequireDefault(require("../../static/boostnote-app.png"));

var _maintainer = _interopRequireDefault(require("../../static/maintainer.png"));

var _react = _interopRequireDefault(require("../../static/react.svg"));

var _electron = _interopRequireDefault(require("../../static/electron.png"));

var _codemirror = _interopRequireDefault(require("../../static/codemirror.svg"));

var _redux = _interopRequireDefault(require("../../static/redux.png"));

require("../styles/project.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    onbeforeremove: function onbeforeremove(vnode) {
      return document.documentElement.scrollTop = 0;
    },
    view: function view() {
      return (0, _mithril.default)(_projectLayout.default, {
        class: 'boostnote'
      }, [(0, _mithril.default)(_projectHeader.default, {
        headerImg: _boostnote.default,
        headerTitle: 'Boostnote'
      }), (0, _mithril.default)(_projectFloatInfo.default, {
        role: 'Maintainer',
        year: '2018',
        context: 'Freelance'
      }), (0, _mithril.default)('.content', [(0, _mithril.default)('.section', [(0, _mithril.default)('p.overview', 'Boostnote is an open-source markdown-based note taking app for developer. After a few weeks contributing to the project, the company behind Boostnote-BoostIO offered me a part-time maintainer position for the project.')]), (0, _mithril.default)('.section', [(0, _mithril.default)('h2.subtitle', 'Tech stack'), (0, _mithril.default)('.stack', {
        style: 'margin: 50px 0'
      }, [(0, _mithril.default)('a.tech-stack', {
        href: 'https://reactjs.org/'
      }, [(0, _mithril.default)('img', {
        src: _react.default
      }), (0, _mithril.default)('span.tech-name', 'React')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://www.electronjs.org/'
      }, [(0, _mithril.default)('img', {
        src: _electron.default
      }), (0, _mithril.default)('span.tech-name', 'Electron')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://redux.js.org/'
      }, [(0, _mithril.default)('img', {
        src: _redux.default
      }), (0, _mithril.default)('span.tech-name', 'Redux')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://codemirror.net/'
      }, [(0, _mithril.default)('img', {
        src: _codemirror.default
      }), (0, _mithril.default)('span.tech-name', 'CodeMirror')])])]), (0, _mithril.default)('.section', [(0, _mithril.default)('.left-part', (0, _mithril.default)('h2.subtitle', 'Improve the app'), (0, _mithril.default)('p', 'Working as a maintainer, I help improve the app by adding bug fixes, new features as well as listening and discussing with the community about their ideas for the new features.')), (0, _mithril.default)('.right-part', [(0, _mithril.default)('img', {
        src: _boostnoteApp.default
      })])]), (0, _mithril.default)('.section', [(0, _mithril.default)('.right-part', [(0, _mithril.default)('img', {
        src: _maintainer.default
      })]), (0, _mithril.default)('.left-part', [(0, _mithril.default)('h2.subtitle', 'Being maintainer for the first time'), (0, _mithril.default)('p', 'After two years of being a maintainer for a popular note-taking app, I still feel as proud as the 16-year-old me when I first started. The fact that what I do create a significant impact on people all around the globe motivates me a lot. Being able to help users half the world away from you drags me out of bed in the morning.')])])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","../components/project-layout.coffee":"src/components/project-layout.coffee","../components/project-header.coffee":"src/components/project-header.coffee","../components/project-float-info.coffee":"src/components/project-float-info.coffee","../../static/boostnote.png":"static/boostnote.png","../../static/boostnote-app.png":"static/boostnote-app.png","../../static/maintainer.png":"static/maintainer.png","../../static/react.svg":"static/react.svg","../../static/electron.png":"static/electron.png","../../static/codemirror.svg":"static/codemirror.svg","../../static/redux.png":"static/redux.png","../styles/project.sass":"src/styles/project.sass"}],"static/mobx.png":[function(require,module,exports) {
module.exports = "/mobx.40c17f0f.png";
},{}],"static/snippetstore-product-hunt.png":[function(require,module,exports) {
module.exports = "/snippetstore-product-hunt.aba9ad6c.png";
},{}],"static/snippetstore-repo.png":[function(require,module,exports) {
module.exports = "/snippetstore-repo.59eec983.png";
},{}],"src/page/snippetstore.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _projectLayout = _interopRequireDefault(require("../components/project-layout.coffee"));

var _projectHeader = _interopRequireDefault(require("../components/project-header.coffee"));

var _projectFloatInfo = _interopRequireDefault(require("../components/project-float-info.coffee"));

var _snippetstore = _interopRequireDefault(require("../../static/snippetstore.png"));

var _react = _interopRequireDefault(require("../../static/react.svg"));

var _electron = _interopRequireDefault(require("../../static/electron.png"));

var _mobx = _interopRequireDefault(require("../../static/mobx.png"));

var _codemirror = _interopRequireDefault(require("../../static/codemirror.svg"));

var _snippetstoreProductHunt = _interopRequireDefault(require("../../static/snippetstore-product-hunt.png"));

var _snippetstoreRepo = _interopRequireDefault(require("../../static/snippetstore-repo.png"));

require("../styles/project.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    onbeforeremove: function onbeforeremove(vnode) {
      return document.documentElement.scrollTop = 0;
    },
    view: function view() {
      return (0, _mithril.default)(_projectLayout.default, {
        class: 'snippetstore'
      }, [(0, _mithril.default)(_projectHeader.default, {
        headerImg: _snippetstore.default,
        headerTitle: 'SnippetStore'
      }), (0, _mithril.default)(_projectFloatInfo.default, {
        role: 'Maintainer',
        year: '2018',
        context: 'Side project'
      }), (0, _mithril.default)('.content', [(0, _mithril.default)('.section', [(0, _mithril.default)('p.overview', 'SnippetStore is a side project that I created after being inspired by the snippet note feature of Boostnote. I later launch this project on ProductHunt and received many positive responses from the community.')]), (0, _mithril.default)('.section', [(0, _mithril.default)('h2.subtitle', 'Tech stack'), (0, _mithril.default)('.stack', {
        style: 'margin: 50px 0'
      }, [(0, _mithril.default)('a.tech-stack', {
        href: 'https://reactjs.org/'
      }, [(0, _mithril.default)('img', {
        src: _react.default
      }), (0, _mithril.default)('span.tech-name', 'React')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://www.electronjs.org/'
      }, [(0, _mithril.default)('img', {
        src: _electron.default
      }), (0, _mithril.default)('span.tech-name', 'Electron')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://mobx.js.org/'
      }, [(0, _mithril.default)('img', {
        src: _mobx.default
      }), (0, _mithril.default)('span.tech-name', 'MobX')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://codemirror.net/'
      }, [(0, _mithril.default)('img', {
        src: _codemirror.default
      }), (0, _mithril.default)('span.tech-name', 'CodeMirror')])])]), (0, _mithril.default)('.section', [(0, _mithril.default)('.left-part', (0, _mithril.default)('h2.subtitle', {
        style: 'white-space: pre-wrap'
      }, 'It get famous\n ...unexpectedly'), (0, _mithril.default)('p', 'I launched this project in the afternoon after finding out about ProductHunt in the morning that day. Quite unexpectedly, people love the app, and it becomes the #5 project of the day.')), (0, _mithril.default)('.right-part', {
        style: 'padding-left: 50px; box-sizing: border-box'
      }, [(0, _mithril.default)('img', {
        style: 'box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25)',
        src: _snippetstoreProductHunt.default
      })])]), (0, _mithril.default)('.section', [(0, _mithril.default)('.right-part', {
        style: 'padding-right: 50px; box-sizing: border-box'
      }, (0, _mithril.default)('img', {
        src: _snippetstoreRepo.default,
        style: 'width: 100%; display: block; margin: auto'
      })), (0, _mithril.default)('.left-part', [(0, _mithril.default)('h2.subtitle', 'It\'s open-source'), (0, _mithril.default)('p', ['My app is open-source on Github, feel free to check it out ', (0, _mithril.default)('a', {
        href: 'https://github.com/ZeroX-DG/SnippetStore'
      }, 'here')])])])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","../components/project-layout.coffee":"src/components/project-layout.coffee","../components/project-header.coffee":"src/components/project-header.coffee","../components/project-float-info.coffee":"src/components/project-float-info.coffee","../../static/snippetstore.png":"static/snippetstore.png","../../static/react.svg":"static/react.svg","../../static/electron.png":"static/electron.png","../../static/mobx.png":"static/mobx.png","../../static/codemirror.svg":"static/codemirror.svg","../../static/snippetstore-product-hunt.png":"static/snippetstore-product-hunt.png","../../static/snippetstore-repo.png":"static/snippetstore-repo.png","../styles/project.sass":"src/styles/project.sass"}],"static/nodejs.png":[function(require,module,exports) {
module.exports = "/nodejs.66924671.png";
},{}],"static/php.svg":[function(require,module,exports) {
module.exports = "/php.34c69f1c.svg";
},{}],"static/python.png":[function(require,module,exports) {
module.exports = "/python.01af8b64.png";
},{}],"static/rust.png":[function(require,module,exports) {
module.exports = "/rust.22d030fb.png";
},{}],"static/flutter.png":[function(require,module,exports) {
module.exports = "/flutter.af8a780c.png";
},{}],"static/velocitynet2.png":[function(require,module,exports) {
module.exports = "/velocitynet2.56695b5c.png";
},{}],"static/velocitynet3.png":[function(require,module,exports) {
module.exports = "/velocitynet3.80aaacb7.png";
},{}],"static/velocitynet4.png":[function(require,module,exports) {
module.exports = "/velocitynet4.6e8dbda3.png";
},{}],"src/page/velocitynet.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _projectLayout = _interopRequireDefault(require("../components/project-layout.coffee"));

var _projectHeader = _interopRequireDefault(require("../components/project-header.coffee"));

var _projectFloatInfo = _interopRequireDefault(require("../components/project-float-info.coffee"));

var _react = _interopRequireDefault(require("../../static/react.svg"));

var _nodejs = _interopRequireDefault(require("../../static/nodejs.png"));

var _php = _interopRequireDefault(require("../../static/php.svg"));

var _python = _interopRequireDefault(require("../../static/python.png"));

var _velocitynet = _interopRequireDefault(require("../../static/velocitynet.jpg"));

var _rust = _interopRequireDefault(require("../../static/rust.png"));

var _flutter = _interopRequireDefault(require("../../static/flutter.png"));

var _velocitynet2 = _interopRequireDefault(require("../../static/velocitynet2.png"));

var _velocitynet3 = _interopRequireDefault(require("../../static/velocitynet3.png"));

var _velocitynet4 = _interopRequireDefault(require("../../static/velocitynet4.png"));

require("../styles/project.sass");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    onbeforeremove: function onbeforeremove(vnode) {
      return document.documentElement.scrollTop = 0;
    },
    view: function view() {
      return (0, _mithril.default)(_projectLayout.default, {
        class: 'velocitynet'
      }, [(0, _mithril.default)(_projectHeader.default, {
        headerImg: _velocitynet.default,
        headerTitle: 'VelocityNet'
      }), (0, _mithril.default)(_projectFloatInfo.default, {
        role: 'Full-stack, UI/UX',
        year: '2020',
        context: 'Contractor'
      }), (0, _mithril.default)('.content', [(0, _mithril.default)('.section', [(0, _mithril.default)('p.overview', 'VelocityNet is an Internet Service Provider company located in Invercargill, New Zealand. Through a recommendation of a friend, I joined VelocityNet near the end of my first year of college to work as a full-stack developer.')]), (0, _mithril.default)('.section', [(0, _mithril.default)('h2.subtitle', 'Tech stack'), (0, _mithril.default)('.stack', {
        style: 'margin: 50px 0'
      }, [(0, _mithril.default)('a.tech-stack', {
        href: 'https://reactjs.org/'
      }, [(0, _mithril.default)('img', {
        src: _react.default
      }), (0, _mithril.default)('span.tech-name', 'React')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://nodejs.org/en/'
      }, [(0, _mithril.default)('img', {
        src: _nodejs.default
      }), (0, _mithril.default)('span.tech-name', 'NodeJs')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://www.php.net/'
      }, [(0, _mithril.default)('img', {
        src: _php.default
      }), (0, _mithril.default)('span.tech-name', 'PHP')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://www.python.org/'
      }, [(0, _mithril.default)('img', {
        src: _python.default
      }), (0, _mithril.default)('span.tech-name', 'Python')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://www.rust-lang.org/'
      }, [(0, _mithril.default)('img', {
        src: _rust.default
      }), (0, _mithril.default)('span.tech-name', 'Rust')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://flutter.dev/'
      }, [(0, _mithril.default)('img', {
        src: _flutter.default,
        style: 'width: 50px; margin: auto'
      }), (0, _mithril.default)('span.tech-name', 'Flutter')])])]), (0, _mithril.default)('.section', {
        'style': 'margin-top: -80px'
      }, [(0, _mithril.default)('h2.subtitle', 'Exciting projects and freedom of choice'), (0, _mithril.default)('p', 'The thing I love the most when working for VelocityNet is the freedom of choice. My manager-Trevor Fulton gave me the freedom to do anything that can improve the business process and choose whatever technology that I\'m comfortable working with. Thus, I have rewritten their new website from scratch with React and PHP. Also, I created various small scripts to automate some business processes and worked on a hardware project using OrangePI and RaspberryPI for the company.')]), (0, _mithril.default)('.section', [(0, _mithril.default)('h2.subtitle', 'Website rewrite'), (0, _mithril.default)('p', 'When I first joined the company, all of its business processes still using the traditional pen and paper method. When I was tasked to improve their website, I thought this is a great chance to digitalize their business project. Thus, after rewriting the website UI, I created a back-end system that allows new customers to fill in their Internet contract with the company online via the website. The customer info is then collected by the back-end to generate a PDF contract file and store it in the company CRM system, making the life of both the customer and the staff easier.'), (0, _mithril.default)('img', {
        style: 'width: 100%; display: block; box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25); margin-top: 120px',
        src: _velocitynet2.default
      }), (0, _mithril.default)('img', {
        style: 'width: 100%; display: block; box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25); margin-top: 120px',
        src: _velocitynet3.default
      }), (0, _mithril.default)('img', {
        style: 'width: 100%; display: block; box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25); margin-top: 120px',
        src: _velocitynet4.default
      })])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","../components/project-layout.coffee":"src/components/project-layout.coffee","../components/project-header.coffee":"src/components/project-header.coffee","../components/project-float-info.coffee":"src/components/project-float-info.coffee","../../static/react.svg":"static/react.svg","../../static/nodejs.png":"static/nodejs.png","../../static/php.svg":"static/php.svg","../../static/python.png":"static/python.png","../../static/velocitynet.jpg":"static/velocitynet.jpg","../../static/rust.png":"static/rust.png","../../static/flutter.png":"static/flutter.png","../../static/velocitynet2.png":"static/velocitynet2.png","../../static/velocitynet3.png":"static/velocitynet3.png","../../static/velocitynet4.png":"static/velocitynet4.png","../styles/project.sass":"src/styles/project.sass"}],"static/csharp.svg":[function(require,module,exports) {
module.exports = "/csharp.2e3acd3d.svg";
},{}],"static/unity.svg":[function(require,module,exports) {
module.exports = "/unity.cb590852.svg";
},{}],"static/maddog-test.MOV":[function(require,module,exports) {
module.exports = "/maddog-test.b69c38ed.MOV";
},{}],"static/maddog-demo.MP4":[function(require,module,exports) {
module.exports = "/maddog-demo.3e295d4a.MP4";
},{}],"src/page/maddog.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mithril = _interopRequireDefault(require("mithril"));

var _projectLayout = _interopRequireDefault(require("../components/project-layout.coffee"));

var _projectHeader = _interopRequireDefault(require("../components/project-header.coffee"));

var _projectFloatInfo = _interopRequireDefault(require("../components/project-float-info.coffee"));

var _maddog = _interopRequireDefault(require("../../static/maddog.jpg"));

var _csharp = _interopRequireDefault(require("../../static/csharp.svg"));

var _unity = _interopRequireDefault(require("../../static/unity.svg"));

var _maddogTest = _interopRequireDefault(require("../../static/maddog-test.MOV"));

var _maddogDemo = _interopRequireDefault(require("../../static/maddog-demo.MP4"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    onbeforeremove: function onbeforeremove(vnode) {
      return document.documentElement.scrollTop = 0;
    },
    view: function view() {
      return (0, _mithril.default)(_projectLayout.default, {
        class: 'maddog'
      }, [(0, _mithril.default)(_projectHeader.default, {
        headerImg: _maddog.default,
        headerTitle: 'Maddog'
      }), (0, _mithril.default)(_projectFloatInfo.default, {
        role: 'Developer',
        year: '2019',
        context: 'School project'
      }), (0, _mithril.default)('.content', [(0, _mithril.default)('.section', [(0, _mithril.default)('p.overview', 'Maddog is a small shooting game for my year 3 school project. The game is controlled via hand gestures using the Kinect depth map and it\'s the result after 1 month of researching and coding with my friend/teammate Eden Park.')]), (0, _mithril.default)('.section', [(0, _mithril.default)('h2.subtitle', 'Tech stack'), (0, _mithril.default)('.stack', {
        style: 'margin: 50px 0'
      }, [(0, _mithril.default)('a.tech-stack', {
        href: 'https://en.wikipedia.org/wiki/C_Sharp_(programming_language)'
      }, [(0, _mithril.default)('img', {
        src: _csharp.default
      }), (0, _mithril.default)('span.tech-name', 'C#')]), (0, _mithril.default)('a.tech-stack', {
        href: 'https://unity.com/'
      }, [(0, _mithril.default)('img', {
        src: _unity.default
      }), (0, _mithril.default)('span.tech-name', 'Unity')])])]), (0, _mithril.default)('.section', [(0, _mithril.default)('h2.subtitle', 'Our struggles'), (0, _mithril.default)('p', 'While developing this game, me and my teammate have faced many difficult problems. One of the main problems was the fact that none of us has previous experience with computer vision, specifically hand gestures recognition.'), (0, _mithril.default)('p', 'This led to some difficulties that we have to overcome:'), (0, _mithril.default)('ul', [(0, _mithril.default)('li', 'We only have 1 month to finish the project so the pressure is quite high.'), (0, _mithril.default)('li', 'The hand gestures recognition algorithm is quite buggy and keep recognizing the wrong thing, hence the name "maddog".'), (0, _mithril.default)('li', 'The hand gestures recognition algorithm can only recognize some certain gestures which limit the number actions you can do in the game.')])]), (0, _mithril.default)('.section', [(0, _mithril.default)('h2.subtitle', 'Learning is exciting!'), (0, _mithril.default)('p', 'One of the most interesting aspects of this project is we get to learn a new technology that we have never used before. For me, learning new thing without knowing where it will lead to is always an exciting thing to do. For the first 2 weeks, little progress was made. I often find myself researching and experimenting in the computer lab alone. But at the start of week 3, there was a breakthrough in my experiment. My algorithm finally works!'), (0, _mithril.default)('video', {
        src: _maddogTest.default,
        style: 'width: 500px; margin: 0 auto; display: block; margin-top: 80px;',
        controls: true
      })]), (0, _mithril.default)('.section', [(0, _mithril.default)('h2.subtitle', 'Final product'), (0, _mithril.default)('p', 'Somehow we was able to meet the project deadline, wrote a document and make a demo video for the project. I\'m very proud and thankful for my teammate to pull through this project with me. If you are wondering how the final product looks like, here is our small demo video:'), (0, _mithril.default)('video', {
        src: _maddogDemo.default,
        style: 'width: 500px; margin: 0 auto; display: block; margin-top: 80px;',
        controls: true
      })])])]);
    }
  };
}

;
},{"mithril":"node_modules/mithril/index.js","../components/project-layout.coffee":"src/components/project-layout.coffee","../components/project-header.coffee":"src/components/project-header.coffee","../components/project-float-info.coffee":"src/components/project-float-info.coffee","../../static/maddog.jpg":"static/maddog.jpg","../../static/csharp.svg":"static/csharp.svg","../../static/unity.svg":"static/unity.svg","../../static/maddog-test.MOV":"static/maddog-test.MOV","../../static/maddog-demo.MP4":"static/maddog-demo.MP4"}],"src/index.coffee":[function(require,module,exports) {
"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _index = _interopRequireDefault(require("./page/index"));

var _projects = _interopRequireDefault(require("./page/projects"));

var _boostnote = _interopRequireDefault(require("./page/boostnote"));

var _snippetstore = _interopRequireDefault(require("./page/snippetstore"));

var _velocitynet = _interopRequireDefault(require("./page/velocitynet"));

var _maddog = _interopRequireDefault(require("./page/maddog"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root;
root = document.getElementById('app');

_mithril.default.route(root, '/', {
  '/': _index.default,
  '/projects': _projects.default,
  '/boostnote': _boostnote.default,
  '/snippetstore': _snippetstore.default,
  '/velocitynet': _velocitynet.default,
  '/maddog': _maddog.default
});
},{"mithril":"node_modules/mithril/index.js","./page/index":"src/page/index.coffee","./page/projects":"src/page/projects.coffee","./page/boostnote":"src/page/boostnote.coffee","./page/snippetstore":"src/page/snippetstore.coffee","./page/velocitynet":"src/page/velocitynet.coffee","./page/maddog":"src/page/maddog.coffee"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "36455" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.coffee"], null)
//# sourceMappingURL=/src.75a6f420.js.map