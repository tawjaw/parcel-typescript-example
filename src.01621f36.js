// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
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

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
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
  return newRequire;
})({"../node_modules/lit-html/lib/dom.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = exports.isCEPolyfill = typeof window !== 'undefined' && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== undefined;
/**
 * Reparents nodes, starting from `start` (inclusive) to `end` (exclusive),
 * into another container (could be the same container), before `before`. If
 * `before` is null, it appends the nodes to the container.
 */
const reparentNodes = exports.reparentNodes = (container, start, end = null, before = null) => {
    while (start !== end) {
        const n = start.nextSibling;
        container.insertBefore(start, before);
        start = n;
    }
};
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */
const removeNodes = exports.removeNodes = (container, start, end = null) => {
    while (start !== end) {
        const n = start.nextSibling;
        container.removeChild(start);
        start = n;
    }
};
//# sourceMappingURL=dom.js.map
},{}],"../node_modules/lit-html/lib/template.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = exports.marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */
const nodeMarker = exports.nodeMarker = `<!--${marker}-->`;
const markerRegex = exports.markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */
const boundAttributeSuffix = exports.boundAttributeSuffix = '$lit$';
/**
 * An updatable Template that tracks the location of dynamic parts.
 */
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        const nodesToRemove = [];
        const stack = [];
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        // Keeps track of the last index associated with a part. We try to delete
        // unnecessary nodes, but we never want to associate two different parts
        // to the same index. They must have a constant node between.
        let lastPartIndex = 0;
        let index = -1;
        let partIndex = 0;
        const { strings, values: { length } } = result;
        while (partIndex < length) {
            const node = walker.nextNode();
            if (node === null) {
                // We've exhausted the content inside a nested template element.
                // Because we still have parts (the outer for-loop), we know:
                // - There is a template in the stack
                // - The walker will find a nextNode outside the template
                walker.currentNode = stack.pop();
                continue;
            }
            index++;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                    if (node.hasAttributes()) {
                        const attributes = node.attributes;
                        const { length } = attributes;
                        // Per
                        // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                        // attributes are not guaranteed to be returned in document order.
                        // In particular, Edge/IE can return them out of order, so we cannot
                        // assume a correspondence between part index and attribute index.
                        let count = 0;
                        for (let i = 0; i < length; i++) {
                            if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                                count++;
                            }
                        }
                        while (count-- > 0) {
                            // Get the template literal section leading up to the first
                            // expression in this attribute
                            const stringForPart = strings[partIndex];
                            // Find the attribute name
                            const name = lastAttributeNameRegex.exec(stringForPart)[2];
                            // Find the corresponding attribute
                            // All bound attributes have had a suffix added in
                            // TemplateResult#getHTML to opt out of special attribute
                            // handling. To look up the attribute value we also need to add
                            // the suffix.
                            const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                            const attributeValue = node.getAttribute(attributeLookupName);
                            node.removeAttribute(attributeLookupName);
                            const statics = attributeValue.split(markerRegex);
                            this.parts.push({ type: 'attribute', index, name, strings: statics });
                            partIndex += statics.length - 1;
                        }
                    }
                    if (node.tagName === 'TEMPLATE') {
                        stack.push(node);
                        walker.currentNode = node.content;
                    }
                } else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                    const data = node.data;
                    if (data.indexOf(marker) >= 0) {
                        const parent = node.parentNode;
                        const strings = data.split(markerRegex);
                        const lastIndex = strings.length - 1;
                        // Generate a new text node for each literal section
                        // These nodes are also used as the markers for node parts
                        for (let i = 0; i < lastIndex; i++) {
                            let insert;
                            let s = strings[i];
                            if (s === '') {
                                insert = createMarker();
                            } else {
                                const match = lastAttributeNameRegex.exec(s);
                                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                    s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                                }
                                insert = document.createTextNode(s);
                            }
                            parent.insertBefore(insert, node);
                            this.parts.push({ type: 'node', index: ++index });
                        }
                        // If there's no text, we must insert a comment to mark our place.
                        // Else, we can trust it will stick around after cloning.
                        if (strings[lastIndex] === '') {
                            parent.insertBefore(createMarker(), node);
                            nodesToRemove.push(node);
                        } else {
                            node.data = strings[lastIndex];
                        }
                        // We have a part for each match found
                        partIndex += lastIndex;
                    }
                } else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                    if (node.data === marker) {
                        const parent = node.parentNode;
                        // Add a new marker node to be the startNode of the Part if any of
                        // the following are true:
                        //  * We don't have a previousSibling
                        //  * The previousSibling is already the start of a previous part
                        if (node.previousSibling === null || index === lastPartIndex) {
                            index++;
                            parent.insertBefore(createMarker(), node);
                        }
                        lastPartIndex = index;
                        this.parts.push({ type: 'node', index });
                        // If we don't have a nextSibling, keep this node so we have an end.
                        // Else, we can remove it to save future costs.
                        if (node.nextSibling === null) {
                            node.data = '';
                        } else {
                            nodesToRemove.push(node);
                            index--;
                        }
                        partIndex++;
                    } else {
                        let i = -1;
                        while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            // Comment node has a binding marker inside, make an inactive part
                            // The binding won't work, but subsequent bindings will
                            // TODO (justinfagnani): consider whether it's even worth it to
                            // make bindings in comments work
                            this.parts.push({ type: 'node', index: -1 });
                            partIndex++;
                        }
                    }
                }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
exports.Template = Template;
const endsWith = (str, suffix) => {
    const index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
};
const isTemplatePartActive = exports.isTemplatePartActive = part => part.index !== -1;
// Allows `document.createComment('')` to be renamed for a
// small manual size-savings.
const createMarker = exports.createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const lastAttributeNameRegex =
// eslint-disable-next-line no-control-regex
exports.lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
//# sourceMappingURL=template.js.map
},{}],"../node_modules/lit-html/lib/modify-template.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.removeNodesFromTemplate = removeNodesFromTemplate;
exports.insertNodeIntoTemplate = insertNodeIntoTemplate;

var _template = require('./template.js');

const walkerNodeFilter = 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;
/**
 * Removes the list of nodes from a Template safely. In addition to removing
 * nodes from the Template, the Template part indices are updated to match
 * the mutated Template DOM.
 *
 * As the template is walked the removal state is tracked and
 * part indices are adjusted as needed.
 *
 * div
 *   div#1 (remove) <-- start removing (removing node is div#1)
 *     div
 *       div#2 (remove)  <-- continue removing (removing node is still div#1)
 *         div
 * div <-- stop removing since previous sibling is the removing node (div#1,
 * removed 4 nodes)
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @module shady-render
 */
function removeNodesFromTemplate(template, nodesToRemove) {
    const { element: { content }, parts } = template;
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while (walker.nextNode()) {
        nodeIndex++;
        const node = walker.currentNode;
        // End removal if stepped past the removing node
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        // A node to remove was found in the template
        if (nodesToRemove.has(node)) {
            nodesToRemoveInTemplate.push(node);
            // Track node we're removing
            if (currentRemovingNode === null) {
                currentRemovingNode = node;
            }
        }
        // When removing, increment count by which to adjust subsequent part indices
        if (currentRemovingNode !== null) {
            removeCount++;
        }
        while (part !== undefined && part.index === nodeIndex) {
            // If part is in a removed node deactivate it by setting index to -1 or
            // adjust the index as needed.
            part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
            // go to the next active part.
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            part = parts[partIndex];
        }
    }
    nodesToRemoveInTemplate.forEach(n => n.parentNode.removeChild(n));
}
const countNodes = node => {
    let count = node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ ? 0 : 1;
    const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
    while (walker.nextNode()) {
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
    for (let i = startIndex + 1; i < parts.length; i++) {
        const part = parts[i];
        if ((0, _template.isTemplatePartActive)(part)) {
            return i;
        }
    }
    return -1;
};
/**
 * Inserts the given node into the Template, optionally before the given
 * refNode. In addition to inserting the node into the Template, the Template
 * part indices are updated to match the mutated Template DOM.
 */
function insertNodeIntoTemplate(template, node, refNode = null) {
    const { element: { content }, parts } = template;
    // If there's no refNode, then put node at end of template.
    // No part indices need to be shifted in this case.
    if (refNode === null || refNode === undefined) {
        content.appendChild(node);
        return;
    }
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while (walker.nextNode()) {
        walkerIndex++;
        const walkerNode = walker.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
            // If we've inserted the node, simply adjust all subsequent parts
            if (insertCount > 0) {
                while (partIndex !== -1) {
                    parts[partIndex].index += insertCount;
                    partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                }
                return;
            }
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }
    }
}
//# sourceMappingURL=modify-template.js.map
},{"./template.js":"../node_modules/lit-html/lib/template.js"}],"../node_modules/lit-html/lib/directive.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
/**
 * Brands a function as a directive factory function so that lit-html will call
 * the function during template rendering, rather than passing as a value.
 *
 * A _directive_ is a function that takes a Part as an argument. It has the
 * signature: `(part: Part) => void`.
 *
 * A directive _factory_ is a function that takes arguments for data and
 * configuration and returns a directive. Users of directive usually refer to
 * the directive factory as the directive. For example, "The repeat directive".
 *
 * Usually a template author will invoke a directive factory in their template
 * with relevant arguments, which will then return a directive function.
 *
 * Here's an example of using the `repeat()` directive factory that takes an
 * array and a function to render an item:
 *
 * ```js
 * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
 * ```
 *
 * When `repeat` is invoked, it returns a directive function that closes over
 * `items` and the template function. When the outer template is rendered, the
 * return directive function is called with the Part for the expression.
 * `repeat` then performs it's custom logic to render multiple items.
 *
 * @param f The directive factory function. Must be a function that returns a
 * function of the signature `(part: Part) => void`. The returned function will
 * be called with the part object.
 *
 * @example
 *
 * import {directive, html} from 'lit-html';
 *
 * const immutable = directive((v) => (part) => {
 *   if (part.value !== v) {
 *     part.setValue(v)
 *   }
 * });
 */
const directive = exports.directive = f => (...args) => {
  const d = f(...args);
  directives.set(d, true);
  return d;
};
const isDirective = exports.isDirective = o => {
  return typeof o === 'function' && directives.has(o);
};
//# sourceMappingURL=directive.js.map
},{}],"../node_modules/lit-html/lib/part.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = exports.noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */
const nothing = exports.nothing = {};
//# sourceMappingURL=part.js.map
},{}],"../node_modules/lit-html/lib/template-instance.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TemplateInstance = undefined;

var _dom = require('./dom.js');

var _template = require('./template.js');

/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @module lit-html
 */
class TemplateInstance {
    constructor(template, processor, options) {
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        // There are a number of steps in the lifecycle of a template instance's
        // DOM fragment:
        //  1. Clone - create the instance fragment
        //  2. Adopt - adopt into the main document
        //  3. Process - find part markers and create parts
        //  4. Upgrade - upgrade custom elements
        //  5. Update - set node, attribute, property, etc., values
        //  6. Connect - connect to the document. Optional and outside of this
        //     method.
        //
        // We have a few constraints on the ordering of these steps:
        //  * We need to upgrade before updating, so that property values will pass
        //    through any property setters.
        //  * We would like to process before upgrading so that we're sure that the
        //    cloned fragment is inert and not disturbed by self-modifying DOM.
        //  * We want custom elements to upgrade even in disconnected fragments.
        //
        // Given these constraints, with full custom elements support we would
        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
        //
        // But Safari does not implement CustomElementRegistry#upgrade, so we
        // can not implement that order and still have upgrade-before-update and
        // upgrade disconnected fragments. So we instead sacrifice the
        // process-before-upgrade constraint, since in Custom Elements v1 elements
        // must not modify their light DOM in the constructor. We still have issues
        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
        // that don't strictly adhere to the no-modification rule because shadow
        // DOM, which may be created in the constructor, is emulated by being placed
        // in the light DOM.
        //
        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
        // in one step.
        //
        // The Custom Elements v1 polyfill supports upgrade(), so the order when
        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
        // Connect.
        const fragment = _dom.isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
        const stack = [];
        const parts = this.template.parts;
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        let partIndex = 0;
        let nodeIndex = 0;
        let part;
        let node = walker.nextNode();
        // Loop through all the nodes and parts of a template
        while (partIndex < parts.length) {
            part = parts[partIndex];
            if (!(0, _template.isTemplatePartActive)(part)) {
                this.__parts.push(undefined);
                partIndex++;
                continue;
            }
            // Progress the tree walker until we find our next part's node.
            // Note that multiple parts may share the same node (attribute parts
            // on a single element), so this loop may not run at all.
            while (nodeIndex < part.index) {
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
                if ((node = walker.nextNode()) === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    node = walker.nextNode();
                }
            }
            // We've arrived at our part's node.
            if (part.type === 'node') {
                const part = this.processor.handleTextExpression(this.options);
                part.insertAfterNode(node.previousSibling);
                this.__parts.push(part);
            } else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex++;
        }
        if (_dom.isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}
exports.TemplateInstance = TemplateInstance; //# sourceMappingURL=template-instance.js.map
},{"./dom.js":"../node_modules/lit-html/lib/dom.js","./template.js":"../node_modules/lit-html/lib/template.js"}],"../node_modules/lit-html/lib/template-result.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SVGTemplateResult = exports.TemplateResult = undefined;

var _dom = require('./dom.js');

var _template = require('./template.js');

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @module lit-html
 */
const commentMarker = ` ${_template.marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isCommentBinding = false;
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            // For each binding we want to determine the kind of marker to insert
            // into the template source before it's parsed by the browser's HTML
            // parser. The marker type is based on whether the expression is in an
            // attribute, text, or comment position.
            //   * For node-position bindings we insert a comment with the marker
            //     sentinel as its text content, like <!--{{lit-guid}}-->.
            //   * For attribute bindings we insert just the marker sentinel for the
            //     first binding, so that we support unquoted attribute bindings.
            //     Subsequent bindings can use a comment marker because multi-binding
            //     attributes must be quoted.
            //   * For comment bindings we insert just the marker sentinel so we don't
            //     close the comment.
            //
            // The following code scans the template source, but is *not* an HTML
            // parser. We don't need to track the tree structure of the HTML, only
            // whether a binding is inside a comment, and if not, if it appears to be
            // the first binding in an attribute.
            const commentOpen = s.lastIndexOf('<!--');
            // We're in comment position if we have a comment open with no following
            // comment close. Because <-- can appear in an attribute value there can
            // be false positives.
            isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf('-->', commentOpen + 1) === -1;
            // Check to see if we have an attribute-like sequence preceding the
            // expression. This can match "name=value" like structures in text,
            // comments, and attribute values, so there can be false-positives.
            const attributeMatch = _template.lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                // We're only in this branch if we don't have a attribute-like
                // preceding sequence. For comments, this guards against unusual
                // attribute values like <div foo="<!--${'bar'}">. Cases like
                // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                // below.
                html += s + (isCommentBinding ? commentMarker : _template.nodeMarker);
            } else {
                // For attributes we use just a marker sentinel, and also append a
                // $lit$ suffix to the name to opt-out of attribute-specific parsing
                // that IE and Edge do for style and certain SVG attributes.
                html += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + _template.boundAttributeSuffix + attributeMatch[3] + _template.marker;
            }
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    }
}
exports.TemplateResult = TemplateResult; /**
                                          * A TemplateResult for SVG fragments.
                                          *
                                          * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
                                          * SVG namespace, then modifies the template to remove the `<svg>` tag so that
                                          * clones only container the original fragment.
                                          */

class SVGTemplateResult extends TemplateResult {
    getHTML() {
        return `<svg>${super.getHTML()}</svg>`;
    }
    getTemplateElement() {
        const template = super.getTemplateElement();
        const content = template.content;
        const svgElement = content.firstChild;
        content.removeChild(svgElement);
        (0, _dom.reparentNodes)(content, svgElement.firstChild);
        return template;
    }
}
exports.SVGTemplateResult = SVGTemplateResult; //# sourceMappingURL=template-result.js.map
},{"./dom.js":"../node_modules/lit-html/lib/dom.js","./template.js":"../node_modules/lit-html/lib/template.js"}],"../node_modules/lit-html/lib/parts.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EventPart = exports.PropertyPart = exports.PropertyCommitter = exports.BooleanAttributePart = exports.NodePart = exports.AttributePart = exports.AttributeCommitter = exports.isIterable = exports.isPrimitive = undefined;

var _directive = require('./directive.js');

var _dom = require('./dom.js');

var _part = require('./part.js');

var _templateInstance = require('./template-instance.js');

var _templateResult = require('./template-result.js');

var _template = require('./template.js');

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @module lit-html
 */
const isPrimitive = exports.isPrimitive = value => {
    return value === null || !(typeof value === 'object' || typeof value === 'function');
};
const isIterable = exports.isIterable = value => {
    return Array.isArray(value) ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(value && value[Symbol.iterator]);
};
/**
 * Writes attribute values to the DOM for a group of AttributeParts bound to a
 * single attribute. The value is only set once even if there are multiple parts
 * for an attribute.
 */
class AttributeCommitter {
    constructor(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (let i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }
    /**
     * Creates a single part. Override this to create a differnt type of part.
     */
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        let text = '';
        for (let i = 0; i < l; i++) {
            text += strings[i];
            const part = this.parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (isPrimitive(v) || !isIterable(v)) {
                    text += typeof v === 'string' ? v : String(v);
                } else {
                    for (const t of v) {
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
exports.AttributeCommitter = AttributeCommitter; /**
                                                  * A Part that controls all or part of an attribute value.
                                                  */

class AttributePart {
    constructor(committer) {
        this.value = undefined;
        this.committer = committer;
    }
    setValue(value) {
        if (value !== _part.noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            // If the value is a not a directive, dirty the committer so that it'll
            // call setAttribute. If the value is a directive, it'll dirty the
            // committer if it calls setValue().
            if (!(0, _directive.isDirective)(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while ((0, _directive.isDirective)(this.value)) {
            const directive = this.value;
            this.value = _part.noChange;
            directive(this);
        }
        if (this.value === _part.noChange) {
            return;
        }
        this.committer.commit();
    }
}
exports.AttributePart = AttributePart; /**
                                        * A Part that controls a location within a Node tree. Like a Range, NodePart
                                        * has start and end locations and can set and update the Nodes between those
                                        * locations.
                                        *
                                        * NodeParts support several value types: primitives, Nodes, TemplateResults,
                                        * as well as arrays and iterables of those types.
                                        */

class NodePart {
    constructor(options) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
    }
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendInto(container) {
        this.startNode = container.appendChild((0, _template.createMarker)());
        this.endNode = container.appendChild((0, _template.createMarker)());
    }
    /**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendIntoPart(part) {
        part.__insert(this.startNode = (0, _template.createMarker)());
        part.__insert(this.endNode = (0, _template.createMarker)());
    }
    /**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterPart(ref) {
        ref.__insert(this.startNode = (0, _template.createMarker)());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        if (this.startNode.parentNode === null) {
            return;
        }
        while ((0, _directive.isDirective)(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = _part.noChange;
            directive(this);
        }
        const value = this.__pendingValue;
        if (value === _part.noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        } else if (value instanceof _templateResult.TemplateResult) {
            this.__commitTemplateResult(value);
        } else if (value instanceof Node) {
            this.__commitNode(value);
        } else if (isIterable(value)) {
            this.__commitIterable(value);
        } else if (value === _part.nothing) {
            this.value = _part.nothing;
            this.clear();
        } else {
            // Fallback, will render the string representation
            this.__commitText(value);
        }
    }
    __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    }
    __commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        // If `value` isn't already a string, we explicitly convert it here in case
        // it can't be implicitly converted - i.e. it's a symbol.
        const valueAsString = typeof value === 'string' ? value : String(value);
        if (node === this.endNode.previousSibling && node.nodeType === 3 /* Node.TEXT_NODE */) {
                // If we only have a single text node between the markers, we can just
                // set its value, rather than replacing it.
                // TODO(justinfagnani): Can we just check if this.value is primitive?
                node.data = valueAsString;
            } else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    }
    __commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value instanceof _templateInstance.TemplateInstance && this.value.template === template) {
            this.value.update(value.values);
        } else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            const instance = new _templateInstance.TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    }
    __commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            // Try to reuse an existing part
            itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                } else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        (0, _dom.removeNodes)(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
exports.NodePart = NodePart; /**
                              * Implements a boolean attribute, roughly as defined in the HTML
                              * specification.
                              *
                              * If the value is truthy, then the attribute is present with a value of
                              * ''. If the value is falsey, the attribute is removed.
                              */

class BooleanAttributePart {
    constructor(element, name, strings) {
        this.value = undefined;
        this.__pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while ((0, _directive.isDirective)(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = _part.noChange;
            directive(this);
        }
        if (this.__pendingValue === _part.noChange) {
            return;
        }
        const value = !!this.__pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            } else {
                this.element.removeAttribute(this.name);
            }
            this.value = value;
        }
        this.__pendingValue = _part.noChange;
    }
}
exports.BooleanAttributePart = BooleanAttributePart; /**
                                                      * Sets attribute values for PropertyParts, so that the value is only set once
                                                      * even if there are multiple parts for a property.
                                                      *
                                                      * If an expression controls the whole property value, then the value is simply
                                                      * assigned to the property under control. If there are string literals or
                                                      * multiple expressions, then the strings are expressions are interpolated into
                                                      * a string first.
                                                      */

class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings) {
        super(element, name, strings);
        this.single = strings.length === 2 && strings[0] === '' && strings[1] === '';
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.element[this.name] = this._getValue();
        }
    }
}
exports.PropertyCommitter = PropertyCommitter;
class PropertyPart extends AttributePart {}
exports.PropertyPart = PropertyPart; // Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the third
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.

let eventOptionsSupported = false;
// Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
// blocks right into the body of a module
(() => {
    try {
        const options = {
            get capture() {
                eventOptionsSupported = true;
                return false;
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener('test', options, options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.removeEventListener('test', options, options);
    } catch (_e) {
        // event options not supported
    }
})();
class EventPart {
    constructor(element, eventName, eventContext) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = e => this.handleEvent(e);
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while ((0, _directive.isDirective)(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = _part.noChange;
            directive(this);
        }
        if (this.__pendingValue === _part.noChange) {
            return;
        }
        const newListener = this.__pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        this.value = newListener;
        this.__pendingValue = _part.noChange;
    }
    handleEvent(event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        } else {
            this.value.handleEvent(event);
        }
    }
}
exports.EventPart = EventPart; // We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.

const getOptions = o => o && (eventOptionsSupported ? { capture: o.capture, passive: o.passive, once: o.once } : o.capture);
//# sourceMappingURL=parts.js.map
},{"./directive.js":"../node_modules/lit-html/lib/directive.js","./dom.js":"../node_modules/lit-html/lib/dom.js","./part.js":"../node_modules/lit-html/lib/part.js","./template-instance.js":"../node_modules/lit-html/lib/template-instance.js","./template-result.js":"../node_modules/lit-html/lib/template-result.js","./template.js":"../node_modules/lit-html/lib/template.js"}],"../node_modules/lit-html/lib/template-factory.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.templateCaches = undefined;
exports.templateFactory = templateFactory;

var _template = require('./template.js');

/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    // If the TemplateStringsArray is new, generate a key from the strings
    // This key is shared between all templates with identical content
    const key = result.strings.join(_template.marker);
    // Check if we already have a Template for this key
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        // If we have not seen this key before, create a new Template
        template = new _template.Template(result, result.getTemplateElement());
        // Cache the Template for this key
        templateCache.keyString.set(key, template);
    }
    // Cache all future queries for this TemplateStringsArray
    templateCache.stringsArray.set(result.strings, template);
    return template;
} /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
const templateCaches = exports.templateCaches = new Map();
//# sourceMappingURL=template-factory.js.map
},{"./template.js":"../node_modules/lit-html/lib/template.js"}],"../node_modules/lit-html/lib/render.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = exports.parts = undefined;

var _dom = require('./dom.js');

var _parts = require('./parts.js');

var _templateFactory = require('./template-factory.js');

const parts = exports.parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @module lit-html
 */
const render = exports.render = (result, container, options) => {
  let part = parts.get(container);
  if (part === undefined) {
    (0, _dom.removeNodes)(container, container.firstChild);
    parts.set(container, part = new _parts.NodePart(Object.assign({ templateFactory: _templateFactory.templateFactory }, options)));
    part.appendInto(container);
  }
  part.setValue(result);
  part.commit();
};
//# sourceMappingURL=render.js.map
},{"./dom.js":"../node_modules/lit-html/lib/dom.js","./parts.js":"../node_modules/lit-html/lib/parts.js","./template-factory.js":"../node_modules/lit-html/lib/template-factory.js"}],"../node_modules/lit-html/lib/default-template-processor.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultTemplateProcessor = exports.DefaultTemplateProcessor = undefined;

var _parts = require('./parts.js');

/**
 * Creates Parts when a template is instantiated.
 */
class DefaultTemplateProcessor {
    /**
     * Create parts for an attribute-position binding, given the event, attribute
     * name, and string literals.
     *
     * @param element The element containing the binding
     * @param name  The attribute name
     * @param strings The string literals. There are always at least two strings,
     *   event for fully-controlled bindings with a single expression.
     */
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const committer = new _parts.PropertyCommitter(element, name.slice(1), strings);
            return committer.parts;
        }
        if (prefix === '@') {
            return [new _parts.EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new _parts.BooleanAttributePart(element, name.slice(1), strings)];
        }
        const committer = new _parts.AttributeCommitter(element, name, strings);
        return committer.parts;
    }
    /**
     * Create parts for a text-position binding.
     * @param templateFactory
     */
    handleTextExpression(options) {
        return new _parts.NodePart(options);
    }
}
exports.DefaultTemplateProcessor = DefaultTemplateProcessor; /**
                                                              * @license
                                                              * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                                                              * This code may only be used under the BSD style license found at
                                                              * http://polymer.github.io/LICENSE.txt
                                                              * The complete set of authors may be found at
                                                              * http://polymer.github.io/AUTHORS.txt
                                                              * The complete set of contributors may be found at
                                                              * http://polymer.github.io/CONTRIBUTORS.txt
                                                              * Code distributed by Google as part of the polymer project is also
                                                              * subject to an additional IP rights grant found at
                                                              * http://polymer.github.io/PATENTS.txt
                                                              */

const defaultTemplateProcessor = exports.defaultTemplateProcessor = new DefaultTemplateProcessor();
//# sourceMappingURL=default-template-processor.js.map
},{"./parts.js":"../node_modules/lit-html/lib/parts.js"}],"../node_modules/lit-html/lit-html.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.svg = exports.html = exports.Template = exports.isTemplatePartActive = exports.createMarker = exports.TemplateResult = exports.SVGTemplateResult = exports.TemplateInstance = exports.templateFactory = exports.templateCaches = exports.render = exports.parts = exports.PropertyPart = exports.PropertyCommitter = exports.NodePart = exports.isPrimitive = exports.isIterable = exports.EventPart = exports.BooleanAttributePart = exports.AttributePart = exports.AttributeCommitter = exports.nothing = exports.noChange = exports.reparentNodes = exports.removeNodes = exports.isDirective = exports.directive = exports.defaultTemplateProcessor = exports.DefaultTemplateProcessor = undefined;

var _defaultTemplateProcessor = require('./lib/default-template-processor.js');

Object.defineProperty(exports, 'DefaultTemplateProcessor', {
  enumerable: true,
  get: function () {
    return _defaultTemplateProcessor.DefaultTemplateProcessor;
  }
});
Object.defineProperty(exports, 'defaultTemplateProcessor', {
  enumerable: true,
  get: function () {
    return _defaultTemplateProcessor.defaultTemplateProcessor;
  }
});

var _directive = require('./lib/directive.js');

Object.defineProperty(exports, 'directive', {
  enumerable: true,
  get: function () {
    return _directive.directive;
  }
});
Object.defineProperty(exports, 'isDirective', {
  enumerable: true,
  get: function () {
    return _directive.isDirective;
  }
});

var _dom = require('./lib/dom.js');

Object.defineProperty(exports, 'removeNodes', {
  enumerable: true,
  get: function () {
    return _dom.removeNodes;
  }
});
Object.defineProperty(exports, 'reparentNodes', {
  enumerable: true,
  get: function () {
    return _dom.reparentNodes;
  }
});

var _part = require('./lib/part.js');

Object.defineProperty(exports, 'noChange', {
  enumerable: true,
  get: function () {
    return _part.noChange;
  }
});
Object.defineProperty(exports, 'nothing', {
  enumerable: true,
  get: function () {
    return _part.nothing;
  }
});

var _parts = require('./lib/parts.js');

Object.defineProperty(exports, 'AttributeCommitter', {
  enumerable: true,
  get: function () {
    return _parts.AttributeCommitter;
  }
});
Object.defineProperty(exports, 'AttributePart', {
  enumerable: true,
  get: function () {
    return _parts.AttributePart;
  }
});
Object.defineProperty(exports, 'BooleanAttributePart', {
  enumerable: true,
  get: function () {
    return _parts.BooleanAttributePart;
  }
});
Object.defineProperty(exports, 'EventPart', {
  enumerable: true,
  get: function () {
    return _parts.EventPart;
  }
});
Object.defineProperty(exports, 'isIterable', {
  enumerable: true,
  get: function () {
    return _parts.isIterable;
  }
});
Object.defineProperty(exports, 'isPrimitive', {
  enumerable: true,
  get: function () {
    return _parts.isPrimitive;
  }
});
Object.defineProperty(exports, 'NodePart', {
  enumerable: true,
  get: function () {
    return _parts.NodePart;
  }
});
Object.defineProperty(exports, 'PropertyCommitter', {
  enumerable: true,
  get: function () {
    return _parts.PropertyCommitter;
  }
});
Object.defineProperty(exports, 'PropertyPart', {
  enumerable: true,
  get: function () {
    return _parts.PropertyPart;
  }
});

var _render = require('./lib/render.js');

Object.defineProperty(exports, 'parts', {
  enumerable: true,
  get: function () {
    return _render.parts;
  }
});
Object.defineProperty(exports, 'render', {
  enumerable: true,
  get: function () {
    return _render.render;
  }
});

var _templateFactory = require('./lib/template-factory.js');

Object.defineProperty(exports, 'templateCaches', {
  enumerable: true,
  get: function () {
    return _templateFactory.templateCaches;
  }
});
Object.defineProperty(exports, 'templateFactory', {
  enumerable: true,
  get: function () {
    return _templateFactory.templateFactory;
  }
});

var _templateInstance = require('./lib/template-instance.js');

Object.defineProperty(exports, 'TemplateInstance', {
  enumerable: true,
  get: function () {
    return _templateInstance.TemplateInstance;
  }
});

var _templateResult = require('./lib/template-result.js');

Object.defineProperty(exports, 'SVGTemplateResult', {
  enumerable: true,
  get: function () {
    return _templateResult.SVGTemplateResult;
  }
});
Object.defineProperty(exports, 'TemplateResult', {
  enumerable: true,
  get: function () {
    return _templateResult.TemplateResult;
  }
});

var _template = require('./lib/template.js');

Object.defineProperty(exports, 'createMarker', {
  enumerable: true,
  get: function () {
    return _template.createMarker;
  }
});
Object.defineProperty(exports, 'isTemplatePartActive', {
  enumerable: true,
  get: function () {
    return _template.isTemplatePartActive;
  }
});
Object.defineProperty(exports, 'Template', {
  enumerable: true,
  get: function () {
    return _template.Template;
  }
});

// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
if (typeof window !== 'undefined') {
  (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.2.1');
}
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
const html = exports.html = (strings, ...values) => new _templateResult.TemplateResult(strings, values, 'html', _defaultTemplateProcessor.defaultTemplateProcessor);
/**
 * Interprets a template literal as an SVG template that can efficiently
 * render to and update a container.
 */
const svg = exports.svg = (strings, ...values) => new _templateResult.SVGTemplateResult(strings, values, 'svg', _defaultTemplateProcessor.defaultTemplateProcessor);
//# sourceMappingURL=lit-html.js.map
},{"./lib/default-template-processor.js":"../node_modules/lit-html/lib/default-template-processor.js","./lib/template-result.js":"../node_modules/lit-html/lib/template-result.js","./lib/directive.js":"../node_modules/lit-html/lib/directive.js","./lib/dom.js":"../node_modules/lit-html/lib/dom.js","./lib/part.js":"../node_modules/lit-html/lib/part.js","./lib/parts.js":"../node_modules/lit-html/lib/parts.js","./lib/render.js":"../node_modules/lit-html/lib/render.js","./lib/template-factory.js":"../node_modules/lit-html/lib/template-factory.js","./lib/template-instance.js":"../node_modules/lit-html/lib/template-instance.js","./lib/template.js":"../node_modules/lit-html/lib/template.js"}],"../node_modules/lit-html/lib/shady-render.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.render = exports.TemplateResult = exports.svg = exports.html = undefined;

var _litHtml = require('../lit-html.js');

Object.defineProperty(exports, 'html', {
    enumerable: true,
    get: function () {
        return _litHtml.html;
    }
});
Object.defineProperty(exports, 'svg', {
    enumerable: true,
    get: function () {
        return _litHtml.svg;
    }
});
Object.defineProperty(exports, 'TemplateResult', {
    enumerable: true,
    get: function () {
        return _litHtml.TemplateResult;
    }
});

var _dom = require('./dom.js');

var _modifyTemplate = require('./modify-template.js');

var _render = require('./render.js');

var _templateFactory = require('./template-factory.js');

var _templateInstance = require('./template-instance.js');

var _template = require('./template.js');

// Get a key to lookup in `templateCaches`.
const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
} else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected. ` + `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` + `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
/**
 * Template factory which scopes template DOM using ShadyCSS.
 * @param scopeName {string}
 */
const shadyTemplateFactory = scopeName => result => {
    const cacheKey = getTemplateCacheKey(result.type, scopeName);
    let templateCache = _templateFactory.templateCaches.get(cacheKey);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        _templateFactory.templateCaches.set(cacheKey, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    const key = result.strings.join(_template.marker);
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        const element = result.getTemplateElement();
        if (compatibleShadyCSSVersion) {
            window.ShadyCSS.prepareTemplateDom(element, scopeName);
        }
        template = new _template.Template(result, element);
        templateCache.keyString.set(key, template);
    }
    templateCache.stringsArray.set(result.strings, template);
    return template;
};
const TEMPLATE_TYPES = ['html', 'svg'];
/**
 * Removes all style elements from Templates for the given scopeName.
 */
const removeStylesFromLitTemplates = scopeName => {
    TEMPLATE_TYPES.forEach(type => {
        const templates = _templateFactory.templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.keyString.forEach(template => {
                const { element: { content } } = template;
                // IE 11 doesn't support the iterable param Set constructor
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach(s => {
                    styles.add(s);
                });
                (0, _modifyTemplate.removeNodesFromTemplate)(template, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
/**
 * For the given scope name, ensures that ShadyCSS style scoping is performed.
 * This is done just once per scope name so the fragment and template cannot
 * be modified.
 * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
 * to be scoped and appended to the document
 * (2) removes style elements from all lit-html Templates for this scope name.
 *
 * Note, <style> elements can only be placed into templates for the
 * initial rendering of the scope. If <style> elements are included in templates
 * dynamically rendered to the scope (after the first scope render), they will
 * not be scoped and the <style> will be left in the template and rendered
 * output.
 */
const prepareTemplateStyles = (scopeName, renderedDOM, template) => {
    shadyRenderSet.add(scopeName);
    // If `renderedDOM` is stamped from a Template, then we need to edit that
    // Template's underlying template element. Otherwise, we create one here
    // to give to ShadyCSS, which still requires one while scoping.
    const templateElement = !!template ? template.element : document.createElement('template');
    // Move styles out of rendered DOM and store.
    const styles = renderedDOM.querySelectorAll('style');
    const { length } = styles;
    // If there are no styles, skip unnecessary work
    if (length === 0) {
        // Ensure prepareTemplateStyles is called to support adding
        // styles via `prepareAdoptedCssText` since that requires that
        // `prepareTemplateStyles` is called.
        //
        // ShadyCSS will only update styles containing @apply in the template
        // given to `prepareTemplateStyles`. If no lit Template was given,
        // ShadyCSS will not be able to update uses of @apply in any relevant
        // template. However, this is not a problem because we only create the
        // template for the purpose of supporting `prepareAdoptedCssText`,
        // which doesn't support @apply at all.
        window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
        return;
    }
    const condensedStyle = document.createElement('style');
    // Collect styles into a single style. This helps us make sure ShadyCSS
    // manipulations will not prevent us from being able to fix up template
    // part indices.
    // NOTE: collecting styles is inefficient for browsers but ShadyCSS
    // currently does this anyway. When it does not, this should be changed.
    for (let i = 0; i < length; i++) {
        const style = styles[i];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    // Remove styles from nested templates in this scope.
    removeStylesFromLitTemplates(scopeName);
    // And then put the condensed style into the "root" template passed in as
    // `template`.
    const content = templateElement.content;
    if (!!template) {
        (0, _modifyTemplate.insertNodeIntoTemplate)(template, condensedStyle, content.firstChild);
    } else {
        content.insertBefore(condensedStyle, content.firstChild);
    }
    // Note, it's important that ShadyCSS gets the template that `lit-html`
    // will actually render so that it can update the style inside when
    // needed (e.g. @apply native Shadow DOM case).
    window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
    const style = content.querySelector('style');
    if (window.ShadyCSS.nativeShadow && style !== null) {
        // When in native Shadow DOM, ensure the style created by ShadyCSS is
        // included in initially rendered output (`renderedDOM`).
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    } else if (!!template) {
        // When no style is left in the template, parts will be broken as a
        // result. To fix this, we put back the style node ShadyCSS removed
        // and then tell lit to remove that node from the template.
        // There can be no style in the template in 2 cases (1) when Shady DOM
        // is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
        // is in use ShadyCSS removes the style if it contains no content.
        // NOTE, ShadyCSS creates its own style so we can safely add/remove
        // `condensedStyle` here.
        content.insertBefore(condensedStyle, content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        (0, _modifyTemplate.removeNodesFromTemplate)(template, removes);
    }
};
/**
 * Extension to the standard `render` method which supports rendering
 * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
 * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
 * or when the webcomponentsjs
 * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
 *
 * Adds a `scopeName` option which is used to scope element DOM and stylesheets
 * when native ShadowDOM is unavailable. The `scopeName` will be added to
 * the class attribute of all rendered DOM. In addition, any style elements will
 * be automatically re-written with this `scopeName` selector and moved out
 * of the rendered DOM and into the document `<head>`.
 *
 * It is common to use this render method in conjunction with a custom element
 * which renders a shadowRoot. When this is done, typically the element's
 * `localName` should be used as the `scopeName`.
 *
 * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
 * custom properties (needed only on older browsers like IE11) and a shim for
 * a deprecated feature called `@apply` that supports applying a set of css
 * custom properties to a given location.
 *
 * Usage considerations:
 *
 * * Part values in `<style>` elements are only applied the first time a given
 * `scopeName` renders. Subsequent changes to parts in style elements will have
 * no effect. Because of this, parts in style elements should only be used for
 * values that will never change, for example parts that set scope-wide theme
 * values or parts which render shared style elements.
 *
 * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
 * custom element's `constructor` is not supported. Instead rendering should
 * either done asynchronously, for example at microtask timing (for example
 * `Promise.resolve()`), or be deferred until the first time the element's
 * `connectedCallback` runs.
 *
 * Usage considerations when using shimmed custom properties or `@apply`:
 *
 * * Whenever any dynamic changes are made which affect
 * css custom properties, `ShadyCSS.styleElement(element)` must be called
 * to update the element. There are two cases when this is needed:
 * (1) the element is connected to a new parent, (2) a class is added to the
 * element that causes it to match different custom properties.
 * To address the first case when rendering a custom element, `styleElement`
 * should be called in the element's `connectedCallback`.
 *
 * * Shimmed custom properties may only be defined either for an entire
 * shadowRoot (for example, in a `:host` rule) or via a rule that directly
 * matches an element with a shadowRoot. In other words, instead of flowing from
 * parent to child as do native css custom properties, shimmed custom properties
 * flow only from shadowRoots to nested shadowRoots.
 *
 * * When using `@apply` mixing css shorthand property names with
 * non-shorthand names (for example `border` and `border-width`) is not
 * supported.
 */
const render = exports.render = (result, container, options) => {
    if (!options || typeof options !== 'object' || !options.scopeName) {
        throw new Error('The `scopeName` option is required.');
    }
    const scopeName = options.scopeName;
    const hasRendered = _render.parts.has(container);
    const needsScoping = compatibleShadyCSSVersion && container.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ && !!container.host;
    // Handle first render to a scope specially...
    const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
    // On first scope render, render into a fragment; this cannot be a single
    // fragment that is reused since nested renders can occur synchronously.
    const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
    (0, _render.render)(result, renderContainer, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
    // When performing first scope render,
    // (1) We've rendered into a fragment so that there's a chance to
    // `prepareTemplateStyles` before sub-elements hit the DOM
    // (which might cause them to render based on a common pattern of
    // rendering in a custom element's `connectedCallback`);
    // (2) Scope the template with ShadyCSS one time only for this scope.
    // (3) Render the fragment into the container and make sure the
    // container knows its `part` is the one we just rendered. This ensures
    // DOM will be re-used on subsequent renders.
    if (firstScopeRender) {
        const part = _render.parts.get(renderContainer);
        _render.parts.delete(renderContainer);
        // ShadyCSS might have style sheets (e.g. from `prepareAdoptedCssText`)
        // that should apply to `renderContainer` even if the rendered value is
        // not a TemplateInstance. However, it will only insert scoped styles
        // into the document if `prepareTemplateStyles` has already been called
        // for the given scope name.
        const template = part.value instanceof _templateInstance.TemplateInstance ? part.value.template : undefined;
        prepareTemplateStyles(scopeName, renderContainer, template);
        (0, _dom.removeNodes)(container, container.firstChild);
        container.appendChild(renderContainer);
        _render.parts.set(container, part);
    }
    // After elements have hit the DOM, update styling if this is the
    // initial render to this container.
    // This is needed whenever dynamic changes are made so it would be
    // safest to do every render; however, this would regress performance
    // so we leave it up to the user to call `ShadyCSS.styleElement`
    // for dynamic changes.
    if (!hasRendered && needsScoping) {
        window.ShadyCSS.styleElement(container.host);
    }
};
//# sourceMappingURL=shady-render.js.map
},{"./dom.js":"../node_modules/lit-html/lib/dom.js","./modify-template.js":"../node_modules/lit-html/lib/modify-template.js","./render.js":"../node_modules/lit-html/lib/render.js","./template-factory.js":"../node_modules/lit-html/lib/template-factory.js","./template-instance.js":"../node_modules/lit-html/lib/template-instance.js","./template.js":"../node_modules/lit-html/lib/template.js","../lit-html.js":"../node_modules/lit-html/lit-html.js"}],"../node_modules/lit-element/lib/updating-element.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var _a;
/**
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */
window.JSCompiler_renameProperty = (prop, _obj) => prop;
const defaultConverter = exports.defaultConverter = {
    toAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value ? '' : null;
            case Object:
            case Array:
                // if the value is `null` or `undefined` pass this through
                // to allow removing/no change behavior.
                return value == null ? value : JSON.stringify(value);
        }
        return value;
    },
    fromAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value !== null;
            case Number:
                return value === null ? null : Number(value);
            case Object:
            case Array:
                return JSON.parse(value);
        }
        return value;
    }
};
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */
const notEqual = exports.notEqual = (value, old) => {
    // This ensures (old==NaN, value==NaN) always returns false
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: defaultConverter,
    reflect: false,
    hasChanged: notEqual
};
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
/**
 * The Closure JS Compiler doesn't currently have good support for static
 * property semantics where "this" is dynamic (e.g.
 * https://github.com/google/closure-compiler/issues/3177 and others) so we use
 * this hack to bypass any rewriting by the compiler.
 */
const finalized = 'finalized';
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclassers to render updates as desired.
 */
class UpdatingElement extends HTMLElement {
    constructor() {
        super();
        this._updateState = 0;
        this._instanceProperties = undefined;
        // Initialize to an unresolved Promise so we can make sure the element has
        // connected before first update.
        this._updatePromise = new Promise(res => this._enableUpdatingResolver = res);
        /**
         * Map with keys for any properties that have changed since the last
         * update cycle with previous values.
         */
        this._changedProperties = new Map();
        /**
         * Map with keys of properties that should be reflected when updated.
         */
        this._reflectingProperties = undefined;
        this.initialize();
    }
    /**
     * Returns a list of attributes corresponding to the registered properties.
     * @nocollapse
     */
    static get observedAttributes() {
        // note: piggy backing on this to ensure we're finalized.
        this.finalize();
        const attributes = [];
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this._classProperties.forEach((v, p) => {
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        });
        return attributes;
    }
    /**
     * Ensures the private `_classProperties` property metadata is created.
     * In addition to `finalize` this is also called in `createProperty` to
     * ensure the `@property` decorator can add property metadata.
     */
    /** @nocollapse */
    static _ensureClassProperties() {
        // ensure private storage for property declarations.
        if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
            this._classProperties = new Map();
            // NOTE: Workaround IE11 not supporting Map constructor argument.
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k) => this._classProperties.set(k, v));
            }
        }
    }
    /**
     * Creates a property accessor on the element prototype if one does not exist
     * and stores a PropertyDeclaration for the property with the given options.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update.
     *
     * This method may be overridden to customize properties; however,
     * when doing so, it's important to call `super.createProperty` to ensure
     * the property is setup correctly. This method calls
     * `getPropertyDescriptor` internally to get a descriptor to install.
     * To customize what properties do when they are get or set, override
     * `getPropertyDescriptor`. To customize the options for a property,
     * implement `createProperty` like this:
     *
     * static createProperty(name, options) {
     *   options = Object.assign(options, {myOption: true});
     *   super.createProperty(name, options);
     * }
     *
     * @nocollapse
     */
    static createProperty(name, options = defaultPropertyDeclaration) {
        // Note, since this can be called by the `@property` decorator which
        // is called before `finalize`, we ensure storage exists for property
        // metadata.
        this._ensureClassProperties();
        this._classProperties.set(name, options);
        // Do not generate an accessor if the prototype already has one, since
        // it would be lost otherwise and that would never be the user's intention;
        // Instead, we expect users to call `requestUpdate` themselves from
        // user-defined accessors. Note that if the super has an accessor we will
        // still overwrite it
        if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        const descriptor = this.getPropertyDescriptor(name, key, options);
        if (descriptor !== undefined) {
            Object.defineProperty(this.prototype, name, descriptor);
        }
    }
    /**
     * Returns a property descriptor to be defined on the given named property.
     * If no descriptor is returned, the property will not become an accessor.
     * For example,
     *
     *   class MyElement extends LitElement {
     *     static getPropertyDescriptor(name, key, options) {
     *       const defaultDescriptor =
     *           super.getPropertyDescriptor(name, key, options);
     *       const setter = defaultDescriptor.set;
     *       return {
     *         get: defaultDescriptor.get,
     *         set(value) {
     *           setter.call(this, value);
     *           // custom action.
     *         },
     *         configurable: true,
     *         enumerable: true
     *       }
     *     }
     *   }
     *
     * @nocollapse
     */
    static getPropertyDescriptor(name, key, _options) {
        return {
            // tslint:disable-next-line:no-any no symbol in index
            get() {
                return this[key];
            },
            set(value) {
                const oldValue = this[name];
                this[key] = value;
                this._requestUpdate(name, oldValue);
            },
            configurable: true,
            enumerable: true
        };
    }
    /**
     * Returns the property options associated with the given property.
     * These options are defined with a PropertyDeclaration via the `properties`
     * object or the `@property` decorator and are registered in
     * `createProperty(...)`.
     *
     * Note, this method should be considered "final" and not overridden. To
     * customize the options for a given property, override `createProperty`.
     *
     * @nocollapse
     * @final
     */
    static getPropertyOptions(name) {
        return this._classProperties && this._classProperties.get(name) || defaultPropertyDeclaration;
    }
    /**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized.
     * @nocollapse
     */
    static finalize() {
        // finalize any superclasses
        const superCtor = Object.getPrototypeOf(this);
        if (!superCtor.hasOwnProperty(finalized)) {
            superCtor.finalize();
        }
        this[finalized] = true;
        this._ensureClassProperties();
        // initialize Map populated in observedAttributes
        this._attributeToPropertyMap = new Map();
        // make any properties
        // Note, only process "own" properties since this element will inherit
        // any properties defined on the superClass, and finalization ensures
        // the entire prototype chain is finalized.
        if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
            const props = this.properties;
            // support symbols in properties (IE11 does not support this)
            const propKeys = [...Object.getOwnPropertyNames(props), ...(typeof Object.getOwnPropertySymbols === 'function' ? Object.getOwnPropertySymbols(props) : [])];
            // This for/of is ok because propKeys is an array
            for (const p of propKeys) {
                // note, use of `any` is due to TypeSript lack of support for symbol in
                // index types
                // tslint:disable-next-line:no-any no symbol in index
                this.createProperty(p, props[p]);
            }
        }
    }
    /**
     * Returns the property name for the given attribute `name`.
     * @nocollapse
     */
    static _attributeNameForProperty(name, options) {
        const attribute = options.attribute;
        return attribute === false ? undefined : typeof attribute === 'string' ? attribute : typeof name === 'string' ? name.toLowerCase() : undefined;
    }
    /**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check.
     * @nocollapse
     */
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    /**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's
     * `converter` or `converter.fromAttribute` property option.
     * @nocollapse
     */
    static _propertyValueFromAttribute(value, options) {
        const type = options.type;
        const converter = options.converter || defaultConverter;
        const fromAttribute = typeof converter === 'function' ? converter : converter.fromAttribute;
        return fromAttribute ? fromAttribute(value, type) : value;
    }
    /**
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     * @nocollapse
     */
    static _propertyValueToAttribute(value, options) {
        if (options.reflect === undefined) {
            return;
        }
        const type = options.type;
        const converter = options.converter;
        const toAttribute = converter && converter.toAttribute || defaultConverter.toAttribute;
        return toAttribute(value, type);
    }
    /**
     * Performs element initialization. By default captures any pre-set values for
     * registered properties.
     */
    initialize() {
        this._saveInstanceProperties();
        // ensures first update will be caught by an early access of
        // `updateComplete`
        this._requestUpdate();
    }
    /**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default).
     */
    _saveInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this.constructor._classProperties.forEach((_v, p) => {
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        });
    }
    /**
     * Applies previously saved instance properties.
     */
    _applyInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        // tslint:disable-next-line:no-any
        this._instanceProperties.forEach((v, p) => this[p] = v);
        this._instanceProperties = undefined;
    }
    connectedCallback() {
        // Ensure first connection completes an update. Updates cannot complete
        // before connection.
        this.enableUpdating();
    }
    enableUpdating() {
        if (this._enableUpdatingResolver !== undefined) {
            this._enableUpdatingResolver();
            this._enableUpdatingResolver = undefined;
        }
    }
    /**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     */
    disconnectedCallback() {}
    /**
     * Synchronizes property values when attributes change.
     */
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attr = ctor._attributeNameForProperty(name, options);
        if (attr !== undefined) {
            const attrValue = ctor._propertyValueToAttribute(value, options);
            // an undefined value does not change the attribute.
            if (attrValue === undefined) {
                return;
            }
            // Track if the property is being reflected to avoid
            // setting the property again via `attributeChangedCallback`. Note:
            // 1. this takes advantage of the fact that the callback is synchronous.
            // 2. will behave incorrectly if multiple attributes are in the reaction
            // stack at time of calling. However, since we process attributes
            // in `update` this should not be possible (or an extreme corner case
            // that we'd like to discover).
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
            if (attrValue == null) {
                this.removeAttribute(attr);
            } else {
                this.setAttribute(attr, attrValue);
            }
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
        }
    }
    _attributeToProperty(name, value) {
        // Use tracking info to avoid deserializing attribute value if it was
        // just set from a property setter.
        if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
            return;
        }
        const ctor = this.constructor;
        // Note, hint this as an `AttributeMap` so closure clearly understands
        // the type; it has issues with tracking types through statics
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const propName = ctor._attributeToPropertyMap.get(name);
        if (propName !== undefined) {
            const options = ctor.getPropertyOptions(propName);
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
            this[propName] =
            // tslint:disable-next-line:no-any
            ctor._propertyValueFromAttribute(value, options);
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
        }
    }
    /**
     * This private version of `requestUpdate` does not access or return the
     * `updateComplete` promise. This promise can be overridden and is therefore
     * not free to access.
     */
    _requestUpdate(name, oldValue) {
        let shouldRequestUpdate = true;
        // If we have a property key, perform property update steps.
        if (name !== undefined) {
            const ctor = this.constructor;
            const options = ctor.getPropertyOptions(name);
            if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                if (!this._changedProperties.has(name)) {
                    this._changedProperties.set(name, oldValue);
                }
                // Add to reflecting properties set.
                // Note, it's important that every change has a chance to add the
                // property to `_reflectingProperties`. This ensures setting
                // attribute + property reflects correctly.
                if (options.reflect === true && !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                    if (this._reflectingProperties === undefined) {
                        this._reflectingProperties = new Map();
                    }
                    this._reflectingProperties.set(name, options);
                }
            } else {
                // Abort the request if the property should not be considered changed.
                shouldRequestUpdate = false;
            }
        }
        if (!this._hasRequestedUpdate && shouldRequestUpdate) {
            this._updatePromise = this._enqueueUpdate();
        }
    }
    /**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */
    requestUpdate(name, oldValue) {
        this._requestUpdate(name, oldValue);
        return this.updateComplete;
    }
    /**
     * Sets up the element to asynchronously update.
     */
    async _enqueueUpdate() {
        this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
        try {
            // Ensure any previous update has resolved before updating.
            // This `await` also ensures that property changes are batched.
            await this._updatePromise;
        } catch (e) {
            // Ignore any previous errors. We only care that the previous cycle is
            // done. Any error should have been handled in the previous update.
        }
        const result = this.performUpdate();
        // If `performUpdate` returns a Promise, we await it. This is done to
        // enable coordinating updates with a scheduler. Note, the result is
        // checked to avoid delaying an additional microtask unless we need to.
        if (result != null) {
            await result;
        }
        return !this._hasRequestedUpdate;
    }
    get _hasRequestedUpdate() {
        return this._updateState & STATE_UPDATE_REQUESTED;
    }
    get hasUpdated() {
        return this._updateState & STATE_HAS_UPDATED;
    }
    /**
     * Performs an element update. Note, if an exception is thrown during the
     * update, `firstUpdated` and `updated` will not be called.
     *
     * You can override this method to change the timing of updates. If this
     * method is overridden, `super.performUpdate()` must be called.
     *
     * For instance, to schedule updates to occur just before the next frame:
     *
     * ```
     * protected async performUpdate(): Promise<unknown> {
     *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
     *   super.performUpdate();
     * }
     * ```
     */
    performUpdate() {
        // Mixin instance properties once, if they exist.
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        let shouldUpdate = false;
        const changedProperties = this._changedProperties;
        try {
            shouldUpdate = this.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                this.update(changedProperties);
            } else {
                this._markUpdated();
            }
        } catch (e) {
            // Prevent `firstUpdated` and `updated` from running when there's an
            // update exception.
            shouldUpdate = false;
            // Ensure element can accept additional updates after an exception.
            this._markUpdated();
            throw e;
        }
        if (shouldUpdate) {
            if (!(this._updateState & STATE_HAS_UPDATED)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    /**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. If the Promise is rejected, an
     * exception was thrown during the update.
     *
     * To await additional asynchronous work, override the `_getUpdateComplete`
     * method. For example, it is sometimes useful to await a rendered element
     * before fulfilling this Promise. To do this, first await
     * `super._getUpdateComplete()`, then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */
    get updateComplete() {
        return this._getUpdateComplete();
    }
    /**
     * Override point for the `updateComplete` promise.
     *
     * It is not safe to override the `updateComplete` getter directly due to a
     * limitation in TypeScript which means it is not possible to call a
     * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
     * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
     * This method should be overridden instead. For example:
     *
     *   class MyElement extends LitElement {
     *     async _getUpdateComplete() {
     *       await super._getUpdateComplete();
     *       await this._myChild.updateComplete;
     *     }
     *   }
     */
    _getUpdateComplete() {
        return this._updatePromise;
    }
    /**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    shouldUpdate(_changedProperties) {
        return true;
    }
    /**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated element DOM.
     * Setting properties inside this method will *not* trigger
     * another update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined && this._reflectingProperties.size > 0) {
            // Use forEach so this works even if for/of loops are compiled to for
            // loops expecting arrays
            this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
            this._reflectingProperties = undefined;
        }
        this._markUpdated();
    }
    /**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    updated(_changedProperties) {}
    /**
     * Invoked when the element is first updated. Implement to perform one time
     * work on the element after update.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    firstUpdated(_changedProperties) {}
}
exports.UpdatingElement = UpdatingElement;
_a = finalized;
/**
 * Marks class as having finished creating properties.
 */
UpdatingElement[_a] = true;
//# sourceMappingURL=updating-element.js.map
},{}],"../node_modules/lit-element/lib/decorators.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.property = property;
exports.internalProperty = internalProperty;
exports.query = query;
exports.queryAsync = queryAsync;
exports.queryAll = queryAll;
exports.eventOptions = eventOptions;
exports.queryAssignedNodes = queryAssignedNodes;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const legacyCustomElement = (tagName, clazz) => {
    window.customElements.define(tagName, clazz);
    // Cast as any because TS doesn't recognize the return type as being a
    // subtype of the decorated class when clazz is typed as
    // `Constructor<HTMLElement>` for some reason.
    // `Constructor<HTMLElement>` is helpful to make sure the decorator is
    // applied to elements however.
    // tslint:disable-next-line:no-any
    return clazz;
};
const standardCustomElement = (tagName, descriptor) => {
    const { kind, elements } = descriptor;
    return {
        kind,
        elements,
        // This callback is called once the class is otherwise fully defined
        finisher(clazz) {
            window.customElements.define(tagName, clazz);
        }
    };
};
/**
 * Class decorator factory that defines the decorated class as a custom element.
 *
 * ```
 * @customElement('my-element')
 * class MyElement {
 *   render() {
 *     return html``;
 *   }
 * }
 * ```
 *
 * @param tagName The name of the custom element to define.
 */
const customElement = exports.customElement = tagName => classOrDescriptor => typeof classOrDescriptor === 'function' ? legacyCustomElement(tagName, classOrDescriptor) : standardCustomElement(tagName, classOrDescriptor);
const standardProperty = (options, element) => {
    // When decorating an accessor, pass it through and add property metadata.
    // Note, the `hasOwnProperty` check in `createProperty` ensures we don't
    // stomp over the user's accessor.
    if (element.kind === 'method' && element.descriptor && !('value' in element.descriptor)) {
        return Object.assign(Object.assign({}, element), { finisher(clazz) {
                clazz.createProperty(element.key, options);
            } });
    } else {
        // createProperty() takes care of defining the property, but we still
        // must return some kind of descriptor, so return a descriptor for an
        // unused prototype field. The finisher calls createProperty().
        return {
            kind: 'field',
            key: Symbol(),
            placement: 'own',
            descriptor: {},
            // When @babel/plugin-proposal-decorators implements initializers,
            // do this instead of the initializer below. See:
            // https://github.com/babel/babel/issues/9260 extras: [
            //   {
            //     kind: 'initializer',
            //     placement: 'own',
            //     initializer: descriptor.initializer,
            //   }
            // ],
            initializer() {
                if (typeof element.initializer === 'function') {
                    this[element.key] = element.initializer.call(this);
                }
            },
            finisher(clazz) {
                clazz.createProperty(element.key, options);
            }
        };
    }
};
const legacyProperty = (options, proto, name) => {
    proto.constructor.createProperty(name, options);
};
/**
 * A property decorator which creates a LitElement property which reflects a
 * corresponding attribute value. A `PropertyDeclaration` may optionally be
 * supplied to configure property features.
 *
 * This decorator should only be used for public fields. Private or protected
 * fields should use the internalProperty decorator.
 *
 * @example
 *
 *     class MyElement {
 *       @property({ type: Boolean })
 *       clicked = false;
 *     }
 *
 * @ExportDecoratedItems
 */
function property(options) {
    // tslint:disable-next-line:no-any decorator
    return (protoOrDescriptor, name) => name !== undefined ? legacyProperty(options, protoOrDescriptor, name) : standardProperty(options, protoOrDescriptor);
}
/**
 * Declares a private or protected property that still triggers updates to the
 * element when it changes.
 *
 * Properties declared this way must not be used from HTML or HTML templating
 * systems, they're solely for properties internal to the element. These
 * properties may be renamed by optimization tools like closure compiler.
 */
function internalProperty(options) {
    return property({ attribute: false, hasChanged: options === null || options === void 0 ? void 0 : options.hasChanged });
}
/**
 * A property decorator that converts a class property into a getter that
 * executes a querySelector on the element's renderRoot.
 *
 * @param selector A DOMString containing one or more selectors to match.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 *
 * @example
 *
 *     class MyElement {
 *       @query('#first')
 *       first;
 *
 *       render() {
 *         return html`
 *           <div id="first"></div>
 *           <div id="second"></div>
 *         `;
 *       }
 *     }
 *
 */
function query(selector) {
    return (protoOrDescriptor,
    // tslint:disable-next-line:no-any decorator
    name) => {
        const descriptor = {
            get() {
                return this.renderRoot.querySelector(selector);
            },
            enumerable: true,
            configurable: true
        };
        return name !== undefined ? legacyQuery(descriptor, protoOrDescriptor, name) : standardQuery(descriptor, protoOrDescriptor);
    };
}
// Note, in the future, we may extend this decorator to support the use case
// where the queried element may need to do work to become ready to interact
// with (e.g. load some implementation code). If so, we might elect to
// add a second argument defining a function that can be run to make the
// queried element loaded/updated/ready.
/**
 * A property decorator that converts a class property into a getter that
 * returns a promise that resolves to the result of a querySelector on the
 * element's renderRoot done after the element's `updateComplete` promise
 * resolves. When the queried property may change with element state, this
 * decorator can be used instead of requiring users to await the
 * `updateComplete` before accessing the property.
 *
 * @param selector A DOMString containing one or more selectors to match.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 *
 * @example
 *
 *     class MyElement {
 *       @queryAsync('#first')
 *       first;
 *
 *       render() {
 *         return html`
 *           <div id="first"></div>
 *           <div id="second"></div>
 *         `;
 *       }
 *     }
 *
 *     // external usage
 *     async doSomethingWithFirst() {
 *      (await aMyElement.first).doSomething();
 *     }
 */
function queryAsync(selector) {
    return (protoOrDescriptor,
    // tslint:disable-next-line:no-any decorator
    name) => {
        const descriptor = {
            async get() {
                await this.updateComplete;
                return this.renderRoot.querySelector(selector);
            },
            enumerable: true,
            configurable: true
        };
        return name !== undefined ? legacyQuery(descriptor, protoOrDescriptor, name) : standardQuery(descriptor, protoOrDescriptor);
    };
}
/**
 * A property decorator that converts a class property into a getter
 * that executes a querySelectorAll on the element's renderRoot.
 *
 * @param selector A DOMString containing one or more selectors to match.
 *
 * See:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
 *
 * @example
 *
 *     class MyElement {
 *       @queryAll('div')
 *       divs;
 *
 *       render() {
 *         return html`
 *           <div id="first"></div>
 *           <div id="second"></div>
 *         `;
 *       }
 *     }
 */
function queryAll(selector) {
    return (protoOrDescriptor,
    // tslint:disable-next-line:no-any decorator
    name) => {
        const descriptor = {
            get() {
                return this.renderRoot.querySelectorAll(selector);
            },
            enumerable: true,
            configurable: true
        };
        return name !== undefined ? legacyQuery(descriptor, protoOrDescriptor, name) : standardQuery(descriptor, protoOrDescriptor);
    };
}
const legacyQuery = (descriptor, proto, name) => {
    Object.defineProperty(proto, name, descriptor);
};
const standardQuery = (descriptor, element) => ({
    kind: 'method',
    placement: 'prototype',
    key: element.key,
    descriptor
});
const standardEventOptions = (options, element) => {
    return Object.assign(Object.assign({}, element), { finisher(clazz) {
            Object.assign(clazz.prototype[element.key], options);
        } });
};
const legacyEventOptions =
// tslint:disable-next-line:no-any legacy decorator
(options, proto, name) => {
    Object.assign(proto[name], options);
};
/**
 * Adds event listener options to a method used as an event listener in a
 * lit-html template.
 *
 * @param options An object that specifies event listener options as accepted by
 * `EventTarget#addEventListener` and `EventTarget#removeEventListener`.
 *
 * Current browsers support the `capture`, `passive`, and `once` options. See:
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Parameters
 *
 * @example
 *
 *     class MyElement {
 *       clicked = false;
 *
 *       render() {
 *         return html`
 *           <div @click=${this._onClick}`>
 *             <button></button>
 *           </div>
 *         `;
 *       }
 *
 *       @eventOptions({capture: true})
 *       _onClick(e) {
 *         this.clicked = true;
 *       }
 *     }
 */
function eventOptions(options) {
    // Return value typed as any to prevent TypeScript from complaining that
    // standard decorator function signature does not match TypeScript decorator
    // signature
    // TODO(kschaaf): unclear why it was only failing on this decorator and not
    // the others
    return (protoOrDescriptor, name) => name !== undefined ? legacyEventOptions(options, protoOrDescriptor, name) : standardEventOptions(options, protoOrDescriptor);
}
/**
 * A property decorator that converts a class property into a getter that
 * returns the `assignedNodes` of the given named `slot`. Note, the type of
 * this property should be annotated as `NodeListOf<HTMLElement>`.
 *
 */
function queryAssignedNodes(slotName = '', flatten = false) {
    return (protoOrDescriptor,
    // tslint:disable-next-line:no-any decorator
    name) => {
        const descriptor = {
            get() {
                const selector = `slot${slotName ? `[name=${slotName}]` : ''}`;
                const slot = this.renderRoot.querySelector(selector);
                return slot && slot.assignedNodes({ flatten });
            },
            enumerable: true,
            configurable: true
        };
        return name !== undefined ? legacyQuery(descriptor, protoOrDescriptor, name) : standardQuery(descriptor, protoOrDescriptor);
    };
}
//# sourceMappingURL=decorators.js.map
},{}],"../node_modules/lit-element/lib/css-tag.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const supportsAdoptingStyleSheets = exports.supportsAdoptingStyleSheets = 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;
const constructionToken = Symbol();
class CSSResult {
    constructor(cssText, safeToken) {
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
    }
    // Note, this is a getter so that it's lazy. In practice, this means
    // stylesheets are not created until the first element instance is made.
    get styleSheet() {
        if (this._styleSheet === undefined) {
            // Note, if `adoptedStyleSheets` is supported then we assume CSSStyleSheet
            // is constructable.
            if (supportsAdoptingStyleSheets) {
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.cssText);
            } else {
                this._styleSheet = null;
            }
        }
        return this._styleSheet;
    }
    toString() {
        return this.cssText;
    }
}
exports.CSSResult = CSSResult; /**
                                * Wrap a value for interpolation in a css tagged template literal.
                                *
                                * This is unsafe because untrusted CSS text can be used to phone home
                                * or exfiltrate data to an attacker controlled site. Take care to only use
                                * this with trusted input.
                                */

const unsafeCSS = exports.unsafeCSS = value => {
    return new CSSResult(String(value), constructionToken);
};
const textFromCSSResult = value => {
    if (value instanceof CSSResult) {
        return value.cssText;
    } else if (typeof value === 'number') {
        return value;
    } else {
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
    }
};
/**
 * Template tag which which can be used with LitElement's `style` property to
 * set element styles. For security reasons, only literal string values may be
 * used. To incorporate non-literal values `unsafeCSS` may be used inside a
 * template string part.
 */
const css = exports.css = (strings, ...values) => {
    const cssText = values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
    return new CSSResult(cssText, constructionToken);
};
//# sourceMappingURL=css-tag.js.map
},{}],"../node_modules/lit-element/lit-element.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LitElement = exports.SVGTemplateResult = exports.TemplateResult = exports.svg = exports.html = undefined;

var _updatingElement = require('./lib/updating-element.js');

Object.keys(_updatingElement).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _updatingElement[key];
        }
    });
});

var _decorators = require('./lib/decorators.js');

Object.keys(_decorators).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _decorators[key];
        }
    });
});

var _litHtml = require('lit-html/lit-html.js');

Object.defineProperty(exports, 'html', {
    enumerable: true,
    get: function () {
        return _litHtml.html;
    }
});
Object.defineProperty(exports, 'svg', {
    enumerable: true,
    get: function () {
        return _litHtml.svg;
    }
});
Object.defineProperty(exports, 'TemplateResult', {
    enumerable: true,
    get: function () {
        return _litHtml.TemplateResult;
    }
});
Object.defineProperty(exports, 'SVGTemplateResult', {
    enumerable: true,
    get: function () {
        return _litHtml.SVGTemplateResult;
    }
});

var _cssTag = require('./lib/css-tag.js');

Object.keys(_cssTag).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _cssTag[key];
        }
    });
});

var _shadyRender = require('lit-html/lib/shady-render.js');

// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time
(window['litElementVersions'] || (window['litElementVersions'] = [])).push('2.3.1');
/**
 * Sentinal value used to avoid calling lit-html's render function when
 * subclasses do not implement `render`
 */
const renderNotImplemented = {};
class LitElement extends _updatingElement.UpdatingElement {
    /**
     * Return the array of styles to apply to the element.
     * Override this method to integrate into a style management system.
     *
     * @nocollapse
     */
    static getStyles() {
        return this.styles;
    }
    /** @nocollapse */
    static _getUniqueStyles() {
        // Only gather styles once per class
        if (this.hasOwnProperty(JSCompiler_renameProperty('_styles', this))) {
            return;
        }
        // Take care not to call `this.getStyles()` multiple times since this
        // generates new CSSResults each time.
        // TODO(sorvell): Since we do not cache CSSResults by input, any
        // shared styles will generate new stylesheet objects, which is wasteful.
        // This should be addressed when a browser ships constructable
        // stylesheets.
        const userStyles = this.getStyles();
        if (userStyles === undefined) {
            this._styles = [];
        } else if (Array.isArray(userStyles)) {
            // De-duplicate styles preserving the _last_ instance in the set.
            // This is a performance optimization to avoid duplicated styles that can
            // occur especially when composing via subclassing.
            // The last item is kept to try to preserve the cascade order with the
            // assumption that it's most important that last added styles override
            // previous styles.
            const addStyles = (styles, set) => styles.reduceRight((set, s) =>
            // Note: On IE set.add() does not return the set
            Array.isArray(s) ? addStyles(s, set) : (set.add(s), set), set);
            // Array.from does not work on Set in IE, otherwise return
            // Array.from(addStyles(userStyles, new Set<CSSResult>())).reverse()
            const set = addStyles(userStyles, new Set());
            const styles = [];
            set.forEach(v => styles.unshift(v));
            this._styles = styles;
        } else {
            this._styles = [userStyles];
        }
    }
    /**
     * Performs element initialization. By default this calls `createRenderRoot`
     * to create the element `renderRoot` node and captures any pre-set values for
     * registered properties.
     */
    initialize() {
        super.initialize();
        this.constructor._getUniqueStyles();
        this.renderRoot = this.createRenderRoot();
        // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
        // element's getRootNode(). While this could be done, we're choosing not to
        // support this now since it would require different logic around de-duping.
        if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
            this.adoptStyles();
        }
    }
    /**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */
    createRenderRoot() {
        return this.attachShadow({ mode: 'open' });
    }
    /**
     * Applies styling to the element shadowRoot using the `static get styles`
     * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
     * available and will fallback otherwise. When Shadow DOM is polyfilled,
     * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
     * is available but `adoptedStyleSheets` is not, styles are appended to the
     * end of the `shadowRoot` to [mimic spec
     * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
     */
    adoptStyles() {
        const styles = this.constructor._styles;
        if (styles.length === 0) {
            return;
        }
        // There are three separate cases here based on Shadow DOM support.
        // (1) shadowRoot polyfilled: use ShadyCSS
        // (2) shadowRoot.adoptedStyleSheets available: use it.
        // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
        // rendering
        if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
            window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map(s => s.cssText), this.localName);
        } else if (_cssTag.supportsAdoptingStyleSheets) {
            this.renderRoot.adoptedStyleSheets = styles.map(s => s.styleSheet);
        } else {
            // This must be done after rendering so the actual style insertion is done
            // in `update`.
            this._needsShimAdoptedStyleSheets = true;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        // Note, first update/render handles styleElement so we only call this if
        // connected after first update.
        if (this.hasUpdated && window.ShadyCSS !== undefined) {
            window.ShadyCSS.styleElement(this);
        }
    }
    /**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * @param _changedProperties Map of changed properties with old values
     */
    update(changedProperties) {
        // Setting properties in `render` should not trigger an update. Since
        // updates are allowed after super.update, it's important to call `render`
        // before that.
        const templateResult = this.render();
        super.update(changedProperties);
        // If render is not implemented by the component, don't call lit-html render
        if (templateResult !== renderNotImplemented) {
            this.constructor.render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
        }
        // When native Shadow DOM is used but adoptedStyles are not supported,
        // insert styling after rendering to ensure adoptedStyles have highest
        // priority.
        if (this._needsShimAdoptedStyleSheets) {
            this._needsShimAdoptedStyleSheets = false;
            this.constructor._styles.forEach(s => {
                const style = document.createElement('style');
                style.textContent = s.cssText;
                this.renderRoot.appendChild(style);
            });
        }
    }
    /**
     * Invoked on each update to perform rendering tasks. This method may return
     * any value renderable by lit-html's NodePart - typically a TemplateResult.
     * Setting properties inside this method will *not* trigger the element to
     * update.
     */
    render() {
        return renderNotImplemented;
    }
}
exports.LitElement = LitElement; /**
                                  * Ensure this class is marked as `finalized` as an optimization ensuring
                                  * it will not needlessly try to `finalize`.
                                  *
                                  * Note this property name is a string to prevent breaking Closure JS Compiler
                                  * optimizations. See updating-element.ts for more information.
                                  */

LitElement['finalized'] = true;
/**
 * Render method used to render the value to the element's DOM.
 * @param result The value to render.
 * @param container Node into which to render.
 * @param options Element name.
 * @nocollapse
 */
LitElement.render = _shadyRender.render;
//# sourceMappingURL=lit-element.js.map
},{"lit-html/lib/shady-render.js":"../node_modules/lit-html/lib/shady-render.js","./lib/updating-element.js":"../node_modules/lit-element/lib/updating-element.js","./lib/decorators.js":"../node_modules/lit-element/lib/decorators.js","lit-html/lit-html.js":"../node_modules/lit-html/lit-html.js","./lib/css-tag.js":"../node_modules/lit-element/lib/css-tag.js"}],"../node_modules/@wokwi/elements/dist/esm/led-element.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LEDElement = undefined;

var _litElement = require("lit-element");

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

const lightColors = {
  red: '#ff8080',
  green: '#80ff80',
  blue: '#8080ff',
  yellow: '#ffff80',
  orange: '#ffcf80',
  white: '#ffffff'
};
let LEDElement = class LEDElement extends _litElement.LitElement {
  constructor() {
    super(...arguments);
    this.value = false;
    this.brightness = 1.0;
    this.color = 'red';
    this.lightColor = null;
    this.label = '';
  }
  static get styles() {
    return _litElement.css`
      :host {
        display: inline-block;
      }

      .led-container {
        display: flex;
        flex-direction: column;
        width: 40px;
      }

      .led-label {
        font-size: 10px;
        text-align: center;
        color: gray;
        position: relative;
        line-height: 1;
        top: -8px;
      }
    `;
  }
  render() {
    const { color, lightColor } = this;
    const lightColorActual = lightColor || lightColors[color] || '#ff8080';
    const opacity = this.brightness ? 0.3 + this.brightness * 0.7 : 0;
    const lightOn = this.value && this.brightness > Number.EPSILON;
    return _litElement.html`
      <div class="led-container">
        <svg
          width="40"
          height="50"
          version="1.2"
          viewBox="-10 -5 35.456 39.618"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="light1" x="-0.8" y="-0.8" height="2.2" width="2.8">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="light2" x="-0.8" y="-0.8" height="2.2" width="2.8">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <rect x="3.451" y="19.379" width="2.1514" height="9.8273" fill="#8c8c8c" />
          <path
            d="m12.608 29.618c0-1.1736-0.86844-2.5132-1.8916-3.4024-0.41616-0.3672-1.1995-1.0015-1.1995-1.4249v-5.4706h-2.1614v5.7802c0 1.0584 0.94752 1.8785 1.9462 2.7482 0.44424 0.37584 1.3486 1.2496 1.3486 1.7694"
            fill="#8c8c8c"
          />
          <path
            d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
            opacity=".3"
          />
          <path
            d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
            fill="#e6e6e6"
            opacity=".5"
          />
          <path
            d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v4.6296c1.4738 1.6517 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586l-4e-5 -1.5235c-7e-4 -1.1419-0.4744-2.2032-1.283-3.1054z"
            fill="#d1d1d1"
            opacity=".9"
          />
          <g>
            <path
              d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v4.6296c1.4738 1.6517 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586l-4e-5 -1.5235c-7e-4 -1.1419-0.4744-2.2032-1.283-3.1054z"
              opacity=".7"
            />
            <path
              d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v3.1054c1.4738 1.6502 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586-7.4e-4 -1.1412-0.47444-2.2025-1.283-3.1047z"
              opacity=".25"
            />
            <ellipse cx="7.0877" cy="16.106" rx="7.087" ry="4.9608" opacity=".25" />
          </g>
          <polygon
            points="2.2032 16.107 3.1961 16.107 3.1961 13.095 6.0156 13.095 10.012 8.8049 3.407 8.8049 2.2032 9.648"
            fill="#666666"
          />
          <polygon
            points="11.215 9.0338 7.4117 13.095 11.06 13.095 11.06 16.107 11.974 16.107 11.974 8.5241 10.778 8.5241"
            fill="#666666"
          />
          <path
            d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
            fill="${color}"
            opacity=".65"
          />
          <g fill="#ffffff">
            <path
              d="m10.388 3.7541 1.4364-0.2736c-0.84168-1.1318-2.0822-1.9577-3.5417-2.2385l0.25416 1.0807c0.76388 0.27072 1.4068 0.78048 1.8511 1.4314z"
              opacity=".5"
            />
            <path
              d="m0.76824 19.926v1.5199c0.64872 0.5292 1.4335 0.97632 2.3076 1.3169v-1.525c-0.8784-0.33624-1.6567-0.78194-2.3076-1.3118z"
              opacity=".5"
            />
            <path
              d="m11.073 20.21c-0.2556 0.1224-0.52992 0.22968-0.80568 0.32976-0.05832 0.01944-0.11736 0.04032-0.17784 0.05832-0.56376 0.17928-1.1614 0.31896-1.795 0.39456-0.07488 0.0094-0.1512 0.01872-0.22464 0.01944-0.3204 0.03024-0.64368 0.05832-0.97056 0.05832-0.14832 0-0.30744-0.01512-0.4716-0.02376-1.2002-0.05688-2.3306-0.31464-3.2976-0.73944l-2e-5 -8.3895v-4.8254c0-1.471 0.84816-2.7295 2.0736-3.3494l-0.02232-0.05328-1.2478-1.512c-1.6697 1.003-2.79 2.8224-2.79 4.9118v11.905c-0.04968-0.04968-0.30816-0.30888-0.48024-0.52992l-0.30744 0.6876c1.4011 1.4818 3.8088 2.4617 6.5426 2.4617 1.6798 0 3.2371-0.37368 4.5115-1.0022l-0.52704-0.40896-0.01006 0.0072z"
              opacity=".5"
            />
          </g>
          <g class="light" style="display: ${lightOn ? '' : 'none'}">
            <ellipse
              cx="8"
              cy="10"
              rx="10"
              ry="10"
              fill="${lightColorActual}"
              filter="url(#light2)"
              style="opacity: ${opacity}"
            ></ellipse>
            <ellipse cx="8" cy="10" rx="2" ry="2" fill="white" filter="url(#light1)"></ellipse>
            <ellipse
              cx="8"
              cy="10"
              rx="3"
              ry="3"
              fill="white"
              filter="url(#light1)"
              style="opacity: ${opacity}"
            ></ellipse>
          </g>
        </svg>
        <span class="led-label">${this.label}</span>
      </div>
    `;
  }
};
__decorate([(0, _litElement.property)()], LEDElement.prototype, "value", void 0);
__decorate([(0, _litElement.property)()], LEDElement.prototype, "brightness", void 0);
__decorate([(0, _litElement.property)()], LEDElement.prototype, "color", void 0);
__decorate([(0, _litElement.property)()], LEDElement.prototype, "lightColor", void 0);
__decorate([(0, _litElement.property)()], LEDElement.prototype, "label", void 0);
exports.LEDElement = LEDElement = __decorate([(0, _litElement.customElement)('wokwi-led')], LEDElement);
exports.LEDElement = LEDElement;
},{"lit-element":"../node_modules/lit-element/lit-element.js"}],"../node_modules/@wokwi/elements/dist/esm/pushbutton-element.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PushbuttonElement = undefined;

var _litElement = require("lit-element");

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

const SPACE_KEY = 32;
let PushbuttonElement = class PushbuttonElement extends _litElement.LitElement {
  constructor() {
    super(...arguments);
    this.color = 'red';
    this.pressed = false;
  }
  static get styles() {
    return _litElement.css`
      button {
        border: none;
        background: none;
        padding: 0;
        margin: 0;
        text-decoration: none;
        -webkit-appearance: none;
        -moz-appearance: none;
      }

      button:active .button-circle {
        fill: url(#grad-down);
      }

      .clickable-element {
        cursor: pointer;
      }
    `;
  }
  render() {
    const { color } = this;
    return _litElement.html`
      <button
        aria-label="${color} pushbutton"
        @mousedown=${this.down}
        @mouseup=${this.up}
        @touchstart=${this.down}
        @touchend=${this.up}
        @keydown=${e => e.keyCode === SPACE_KEY && this.down()}
        @keyup=${e => e.keyCode === SPACE_KEY && this.up()}
      >
        <svg
          width="18mm"
          height="12mm"
          version="1.1"
          viewBox="-3 0 18 12"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <defs>
            <linearGradient id="grad-up" x1="0" x2="1" y1="0" y2="1">
              <stop stop-color="#ffffff" offset="0" />
              <stop stop-color="${color}" offset="0.3" />
              <stop stop-color="${color}" offset="0.5" />
              <stop offset="1" />
            </linearGradient>
            <linearGradient
              id="grad-down"
              xlink:href="#grad-up"
              gradientTransform="rotate(180,0.5,0.5)"
            ></linearGradient>
          </defs>
          <rect x="0" y="0" width="12" height="12" rx=".44" ry=".44" fill="#464646" />
          <rect x=".75" y=".75" width="10.5" height="10.5" rx=".211" ry=".211" fill="#eaeaea" />
          <g fill="#1b1b1">
            <circle cx="1.767" cy="1.7916" r=".37" />
            <circle cx="10.161" cy="1.7916" r=".37" />
            <circle cx="10.161" cy="10.197" r=".37" />
            <circle cx="1.767" cy="10.197" r=".37" />
          </g>
          <g fill="#eaeaea">
            <path
              d="m-0.3538 1.4672c-0.058299 0-0.10523 0.0469-0.10523 0.10522v0.38698h-2.1504c-0.1166 0-0.21045 0.0938-0.21045 0.21045v0.50721c0 0.1166 0.093855 0.21045 0.21045 0.21045h2.1504v0.40101c0 0.0583 0.046928 0.10528 0.10523 0.10528h0.35723v-1.9266z"
            />
            <path
              d="m-0.35376 8.6067c-0.058299 0-0.10523 0.0469-0.10523 0.10523v0.38697h-2.1504c-0.1166 0-0.21045 0.0939-0.21045 0.21045v0.50721c0 0.1166 0.093855 0.21046 0.21045 0.21046h2.1504v0.401c0 0.0583 0.046928 0.10528 0.10523 0.10528h0.35723v-1.9266z"
            />
            <path
              d="m12.354 1.4672c0.0583 0 0.10522 0.0469 0.10523 0.10522v0.38698h2.1504c0.1166 0 0.21045 0.0938 0.21045 0.21045v0.50721c0 0.1166-0.09385 0.21045-0.21045 0.21045h-2.1504v0.40101c0 0.0583-0.04693 0.10528-0.10523 0.10528h-0.35723v-1.9266z"
            />
            <path
              d="m12.354 8.6067c0.0583 0 0.10523 0.0469 0.10523 0.10522v0.38698h2.1504c0.1166 0 0.21045 0.0938 0.21045 0.21045v0.50721c0 0.1166-0.09386 0.21045-0.21045 0.21045h-2.1504v0.40101c0 0.0583-0.04693 0.10528-0.10523 0.10528h-0.35723v-1.9266z"
            />
          </g>
          <g class="clickable-element">
            <circle class="button-circle" cx="6" cy="6" r="3.822" fill="url(#grad-up)" />
            <circle
              cx="6"
              cy="6"
              r="2.9"
              fill="${color}"
              stroke="#2f2f2f"
              stroke-opacity=".47"
              stroke-width=".08"
            />
          </g>
        </svg>
      </button>
    `;
  }
  down() {
    if (!this.pressed) {
      this.pressed = true;
      this.dispatchEvent(new Event('button-press'));
    }
  }
  up() {
    if (this.pressed) {
      this.pressed = false;
      this.dispatchEvent(new Event('button-release'));
    }
  }
};
__decorate([(0, _litElement.property)()], PushbuttonElement.prototype, "color", void 0);
__decorate([(0, _litElement.property)()], PushbuttonElement.prototype, "pressed", void 0);
exports.PushbuttonElement = PushbuttonElement = __decorate([(0, _litElement.customElement)('wokwi-pushbutton')], PushbuttonElement);
exports.PushbuttonElement = PushbuttonElement;
},{"lit-element":"../node_modules/lit-element/lit-element.js"}],"../node_modules/@wokwi/elements/dist/esm/resistor-element.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ResistorElement = undefined;

var _litElement = require("lit-element");

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

const bandColors = {
    [-2]: 'silver',
    [-1]: '#c4a000',
    0: 'black',
    1: 'brown',
    2: 'red',
    3: 'orange',
    4: 'yellow',
    5: 'green',
    6: 'blue',
    7: 'violet',
    8: 'gray',
    9: 'white'
};
let ResistorElement = class ResistorElement extends _litElement.LitElement {
    constructor() {
        super(...arguments);
        this.value = '1000';
    }
    breakValue(value) {
        const exponent = value >= 1e10 ? 9 : value >= 1e9 ? 8 : value >= 1e8 ? 7 : value >= 1e7 ? 6 : value >= 1e6 ? 5 : value >= 1e5 ? 4 : value >= 1e4 ? 3 : value >= 1e3 ? 2 : value >= 1e2 ? 1 : value >= 1e1 ? 0 : value >= 1 ? -1 : -2;
        const base = Math.round(value / 10 ** exponent);
        if (value === 0) {
            return [0, 0];
        }
        if (exponent < 0 && base % 10 === 0) {
            return [base / 10, exponent + 1];
        }
        return [Math.round(base % 100), exponent];
    }
    render() {
        const { value } = this;
        const numValue = parseFloat(value);
        const [base, exponent] = this.breakValue(numValue);
        const band1Color = bandColors[Math.floor(base / 10)];
        const band2Color = bandColors[base % 10];
        const band3Color = bandColors[exponent];
        return _litElement.html`
      <svg
        width="15.645mm"
        height="3mm"
        version="1.1"
        viewBox="0 0 15.645 3"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <linearGradient
            id="a"
            x2="0"
            y1="22.332"
            y2="38.348"
            gradientTransform="matrix(.14479 0 0 .14479 -23.155 -4.0573)"
            gradientUnits="userSpaceOnUse"
            spreadMethod="reflect"
          >
            <stop stop-color="#323232" offset="0" />
            <stop stop-color="#fff" stop-opacity=".42268" offset="1" />
          </linearGradient>
        </defs>
        <rect y="1.1759" width="15.645" height=".63826" fill="#eaeaea" />
        <g stroke-width=".14479">
          <path
            d="m4.6918 0c-1.0586 0-1.9185 0.67468-1.9185 1.5022 0 0.82756 0.85995 1.4978 1.9185 1.4978 0.4241 0 0.81356-0.11167 1.1312-0.29411h4.0949c0.31802 0.18313 0.71075 0.29411 1.1357 0.29411 1.0586 0 1.9185-0.67015 1.9185-1.4978 0-0.8276-0.85995-1.5022-1.9185-1.5022-0.42499 0-0.81773 0.11098-1.1357 0.29411h-4.0949c-0.31765-0.18244-0.7071-0.29411-1.1312-0.29411z"
            fill="#d5b597"
          />
          <path
            d="m4.6918 0c-1.0586 0-1.9185 0.67468-1.9185 1.5022 0 0.82756 0.85995 1.4978 1.9185 1.4978 0.4241 0 0.81356-0.11167 1.1312-0.29411h4.0949c0.31802 0.18313 0.71075 0.29411 1.1357 0.29411 1.0586 0 1.9185-0.67015 1.9185-1.4978 0-0.8276-0.85995-1.5022-1.9185-1.5022-0.42499 0-0.81773 0.11098-1.1357 0.29411h-4.0949c-0.31765-0.18244-0.7071-0.29411-1.1312-0.29411z"
            fill="url(#a)"
            opacity=".44886"
          />
          <path
            d="m4.6917 0c-0.10922 0-0.21558 0.00884-0.31985 0.022624v2.955c0.10426 0.013705 0.21063 0.02234 0.31985 0.02234 0.15603 0 0.3074-0.015363 0.4522-0.043551v-2.9129c-0.1448-0.028193-0.29617-0.043551-0.4522-0.043552z"
            fill="${band1Color}"
          />
          <path d="m6.4482 0.29411v2.4117h0.77205v-2.4117z" fill="${band2Color}" />
          <path d="m8.5245 0.29411v2.4117h0.77205v-2.4117z" fill="${band3Color}" />
          <path
            d="m11.054 0c-0.15608 0-0.30749 0.015253-0.45277 0.043268v2.9134c0.14527 0.028012 0.29669 0.043268 0.45277 0.043268 0.10912 0 0.21539-0.00867 0.31957-0.02234v-2.955c-0.10418-0.013767-0.21044-0.022624-0.31957-0.022624z"
            fill="#c4a000"
          />
        </g>
      </svg>
    `;
    }
};
__decorate([(0, _litElement.property)()], ResistorElement.prototype, "value", void 0);
exports.ResistorElement = ResistorElement = __decorate([(0, _litElement.customElement)('wokwi-resistor')], ResistorElement);
exports.ResistorElement = ResistorElement;
},{"lit-element":"../node_modules/lit-element/lit-element.js"}],"../node_modules/@wokwi/elements/dist/esm/7segment-element.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SevenSegmentElement = undefined;

var _litElement = require("lit-element");

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let SevenSegmentElement = class SevenSegmentElement extends _litElement.LitElement {
    constructor() {
        super(...arguments);
        this.color = 'red';
        this.values = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    static get styles() {
        return _litElement.css`
      polygon {
        transform: scale(0.9);
        transform-origin: 50% 50%;
        transform-box: fill-box;
      }
    `;
    }
    render() {
        const { color, values } = this;
        const fill = index => values[index] ? color : '#ddd';
        return _litElement.html`
      <svg
        width="12mm"
        height="18.5mm"
        version="1.1"
        viewBox="0 0 12 18.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="skewX(-8) translate(2, 0)">
          <polygon points="2 0 8 0 9 1 8 2 2 2 1 1" fill="${fill(0)}" />
          <polygon points="10 2 10 8 9 9 8 8 8 2 9 1" fill="${fill(1)}" />
          <polygon points="10 10 10 16 9 17 8 16 8 10 9 9" fill="${fill(2)}" />
          <polygon points="8 18 2 18 1 17 2 16 8 16 9 17" fill="${fill(3)}" />
          <polygon points="0 16 0 10 1 9 2 10 2 16 1 17" fill="${fill(4)}" />
          <polygon points="0 8 0 2 1 1 2 2 2 8 1 9" fill=${fill(5)} />
          <polygon points="2 8 8 8 9 9 8 10 2 10 1 9" fill=${fill(6)} />
        </g>
        <circle cx="11" cy="17" r="1.1" fill="${fill(7)}" />
      </svg>
    `;
    }
};
__decorate([(0, _litElement.property)()], SevenSegmentElement.prototype, "color", void 0);
__decorate([(0, _litElement.property)({ type: Array })], SevenSegmentElement.prototype, "values", void 0);
exports.SevenSegmentElement = SevenSegmentElement = __decorate([(0, _litElement.customElement)('wokwi-7segment')], SevenSegmentElement);
exports.SevenSegmentElement = SevenSegmentElement;
},{"lit-element":"../node_modules/lit-element/lit-element.js"}],"../node_modules/@wokwi/elements/dist/esm/lcd1602-font-a00.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
// Font rasterized from datasheet: https://www.sparkfun.com/datasheets/LCD/HD44780.pdf
// prettier-ignore
const fontA00 = exports.fontA00 = new Uint8Array([
/* 0 */0, 0, 0, 0, 0, 0, 0, 0,
/* 1 */0, 0, 0, 0, 0, 0, 0, 0,
/* 2 */0, 0, 0, 0, 0, 0, 0, 0,
/* 3 */0, 0, 0, 0, 0, 0, 0, 0,
/* 4 */0, 0, 0, 0, 0, 0, 0, 0,
/* 5 */0, 0, 0, 0, 0, 0, 0, 0,
/* 6 */0, 0, 0, 0, 0, 0, 0, 0,
/* 7 */0, 0, 0, 0, 0, 0, 0, 0,
/* 8 */0, 0, 0, 0, 0, 0, 0, 0,
/* 9 */0, 0, 0, 0, 0, 0, 0, 0,
/* 10 */0, 0, 0, 0, 0, 0, 0, 0,
/* 11 */0, 0, 0, 0, 0, 0, 0, 0,
/* 12 */0, 0, 0, 0, 0, 0, 0, 0,
/* 13 */0, 0, 0, 0, 0, 0, 0, 0,
/* 14 */0, 0, 0, 0, 0, 0, 0, 0,
/* 15 */0, 0, 0, 0, 0, 0, 0, 0,
/* 16 */0, 0, 0, 0, 0, 0, 0, 0,
/* 17 */0, 0, 0, 0, 0, 0, 0, 0,
/* 18 */0, 0, 0, 0, 0, 0, 0, 0,
/* 19 */0, 0, 0, 0, 0, 0, 0, 0,
/* 20 */0, 0, 0, 0, 0, 0, 0, 0,
/* 21 */0, 0, 0, 0, 0, 0, 0, 0,
/* 22 */0, 0, 0, 0, 0, 0, 0, 0,
/* 23 */0, 0, 0, 0, 0, 0, 0, 0,
/* 24 */0, 0, 0, 0, 0, 0, 0, 0,
/* 25 */0, 0, 0, 0, 0, 0, 0, 0,
/* 26 */0, 0, 0, 0, 0, 0, 0, 0,
/* 27 */0, 0, 0, 0, 0, 0, 0, 0,
/* 28 */0, 0, 0, 0, 0, 0, 0, 0,
/* 29 */0, 0, 0, 0, 0, 0, 0, 0,
/* 30 */0, 0, 0, 0, 0, 0, 0, 0,
/* 31 */0, 0, 0, 0, 0, 0, 0, 0,
/* 32 */0, 0, 0, 0, 0, 0, 0, 0,
/* 33 */4, 4, 4, 4, 0, 0, 4, 0,
/* 34 */10, 10, 10, 0, 0, 0, 0, 0,
/* 35 */10, 10, 31, 10, 31, 10, 10, 0,
/* 36 */4, 30, 5, 14, 20, 15, 4, 0,
/* 37 */3, 19, 8, 4, 2, 25, 24, 0,
/* 38 */6, 9, 5, 2, 21, 9, 22, 0,
/* 39 */6, 4, 2, 0, 0, 0, 0, 0,
/* 40 */8, 4, 2, 2, 2, 4, 8, 0,
/* 41 */2, 4, 8, 8, 8, 4, 2, 0,
/* 42 */0, 4, 21, 14, 21, 4, 0, 0,
/* 43 */0, 4, 4, 31, 4, 4, 0, 0,
/* 44 */0, 0, 0, 0, 6, 4, 2, 0,
/* 45 */0, 0, 0, 31, 0, 0, 0, 0,
/* 46 */0, 0, 0, 0, 0, 6, 6, 0,
/* 47 */0, 16, 8, 4, 2, 1, 0, 0,
/* 48 */14, 17, 25, 21, 19, 17, 14, 0,
/* 49 */4, 6, 4, 4, 4, 4, 14, 0,
/* 50 */14, 17, 16, 8, 4, 2, 31, 0,
/* 51 */31, 8, 4, 8, 16, 17, 14, 0,
/* 52 */8, 12, 10, 9, 31, 8, 8, 0,
/* 53 */31, 1, 15, 16, 16, 17, 14, 0,
/* 54 */12, 2, 1, 15, 17, 17, 14, 0,
/* 55 */31, 17, 16, 8, 4, 4, 4, 0,
/* 56 */14, 17, 17, 14, 17, 17, 14, 0,
/* 57 */14, 17, 17, 30, 16, 8, 6, 0,
/* 58 */0, 6, 6, 0, 6, 6, 0, 0,
/* 59 */0, 6, 6, 0, 6, 4, 2, 0,
/* 60 */8, 4, 2, 1, 2, 4, 8, 0,
/* 61 */0, 0, 31, 0, 31, 0, 0, 0,
/* 62 */2, 4, 8, 16, 8, 4, 2, 0,
/* 63 */14, 17, 16, 8, 4, 0, 4, 0,
/* 64 */14, 17, 16, 22, 21, 21, 14, 0,
/* 65 */14, 17, 17, 17, 31, 17, 17, 0,
/* 66 */15, 17, 17, 15, 17, 17, 15, 0,
/* 67 */14, 17, 1, 1, 1, 17, 14, 0,
/* 68 */7, 9, 17, 17, 17, 9, 7, 0,
/* 69 */31, 1, 1, 15, 1, 1, 31, 0,
/* 70 */31, 1, 1, 15, 1, 1, 1, 0,
/* 71 */14, 17, 1, 29, 17, 17, 30, 0,
/* 72 */17, 17, 17, 31, 17, 17, 17, 0,
/* 73 */14, 4, 4, 4, 4, 4, 14, 0,
/* 74 */28, 8, 8, 8, 8, 9, 6, 0,
/* 75 */17, 9, 5, 3, 5, 9, 17, 0,
/* 76 */1, 1, 1, 1, 1, 1, 31, 0,
/* 77 */17, 27, 21, 21, 17, 17, 17, 0,
/* 78 */17, 17, 19, 21, 25, 17, 17, 0,
/* 79 */14, 17, 17, 17, 17, 17, 14, 0,
/* 80 */15, 17, 17, 15, 1, 1, 1, 0,
/* 81 */14, 17, 17, 17, 21, 9, 22, 0,
/* 82 */15, 17, 17, 15, 5, 9, 17, 0,
/* 83 */30, 1, 1, 14, 16, 16, 15, 0,
/* 84 */31, 4, 4, 4, 4, 4, 4, 0,
/* 85 */17, 17, 17, 17, 17, 17, 14, 0,
/* 86 */17, 17, 17, 17, 17, 10, 4, 0,
/* 87 */17, 17, 17, 21, 21, 21, 10, 0,
/* 88 */17, 17, 10, 4, 10, 17, 17, 0,
/* 89 */17, 17, 17, 10, 4, 4, 4, 0,
/* 90 */31, 16, 8, 4, 2, 1, 31, 0,
/* 91 */7, 1, 1, 1, 1, 1, 7, 0,
/* 92 */17, 10, 31, 4, 31, 4, 4, 0,
/* 93 */14, 8, 8, 8, 8, 8, 14, 0,
/* 94 */4, 10, 17, 0, 0, 0, 0, 0,
/* 95 */0, 0, 0, 0, 0, 0, 31, 0,
/* 96 */2, 4, 8, 0, 0, 0, 0, 0,
/* 97 */0, 0, 14, 16, 30, 17, 30, 0,
/* 98 */1, 1, 13, 19, 17, 17, 15, 0,
/* 99 */0, 0, 14, 1, 1, 17, 14, 0,
/* 100 */16, 16, 22, 25, 17, 17, 30, 0,
/* 101 */0, 0, 14, 17, 31, 1, 14, 0,
/* 102 */12, 18, 2, 7, 2, 2, 2, 0,
/* 103 */0, 30, 17, 17, 30, 16, 14, 0,
/* 104 */1, 1, 13, 19, 17, 17, 17, 0,
/* 105 */4, 0, 6, 4, 4, 4, 14, 0,
/* 106 */8, 0, 12, 8, 8, 9, 6, 0,
/* 107 */1, 1, 9, 5, 3, 5, 9, 0,
/* 108 */6, 4, 4, 4, 4, 4, 14, 0,
/* 109 */0, 0, 11, 21, 21, 17, 17, 0,
/* 110 */0, 0, 13, 19, 17, 17, 17, 0,
/* 111 */0, 0, 14, 17, 17, 17, 14, 0,
/* 112 */0, 0, 15, 17, 15, 1, 1, 0,
/* 113 */0, 0, 22, 25, 30, 16, 16, 0,
/* 114 */0, 0, 13, 19, 1, 1, 1, 0,
/* 115 */0, 0, 14, 1, 14, 16, 15, 0,
/* 116 */2, 2, 7, 2, 2, 18, 12, 0,
/* 117 */0, 0, 17, 17, 17, 25, 22, 0,
/* 118 */0, 0, 17, 17, 17, 10, 4, 0,
/* 119 */0, 0, 17, 21, 21, 21, 10, 0,
/* 120 */0, 0, 17, 10, 4, 10, 17, 0,
/* 121 */0, 0, 17, 17, 30, 16, 14, 0,
/* 122 */0, 0, 31, 8, 4, 2, 31, 0,
/* 123 */8, 4, 4, 2, 4, 4, 8, 0,
/* 124 */4, 4, 4, 4, 4, 4, 4, 0,
/* 125 */2, 4, 4, 8, 4, 4, 2, 0,
/* 126 */0, 4, 8, 31, 8, 4, 0, 0,
/* 127 */0, 4, 2, 31, 2, 4, 0, 0,
/* 128 */0, 0, 0, 0, 0, 0, 0, 0,
/* 129 */0, 0, 0, 0, 0, 0, 0, 0,
/* 130 */0, 0, 0, 0, 0, 0, 0, 0,
/* 131 */0, 0, 0, 0, 0, 0, 0, 0,
/* 132 */0, 0, 0, 0, 0, 0, 0, 0,
/* 133 */0, 0, 0, 0, 0, 0, 0, 0,
/* 134 */0, 0, 0, 0, 0, 0, 0, 0,
/* 135 */0, 0, 0, 0, 0, 0, 0, 0,
/* 136 */0, 0, 0, 0, 0, 0, 0, 0,
/* 137 */0, 0, 0, 0, 0, 0, 0, 0,
/* 138 */0, 0, 0, 0, 0, 0, 0, 0,
/* 139 */0, 0, 0, 0, 0, 0, 0, 0,
/* 140 */0, 0, 0, 0, 0, 0, 0, 0,
/* 141 */0, 0, 0, 0, 0, 0, 0, 0,
/* 142 */0, 0, 0, 0, 0, 0, 0, 0,
/* 143 */0, 0, 0, 0, 0, 0, 0, 0,
/* 144 */0, 0, 0, 0, 0, 0, 0, 0,
/* 145 */0, 0, 0, 0, 0, 0, 0, 0,
/* 146 */0, 0, 0, 0, 0, 0, 0, 0,
/* 147 */0, 0, 0, 0, 0, 0, 0, 0,
/* 148 */0, 0, 0, 0, 0, 0, 0, 0,
/* 149 */0, 0, 0, 0, 0, 0, 0, 0,
/* 150 */0, 0, 0, 0, 0, 0, 0, 0,
/* 151 */0, 0, 0, 0, 0, 0, 0, 0,
/* 152 */0, 0, 0, 0, 0, 0, 0, 0,
/* 153 */0, 0, 0, 0, 0, 0, 0, 0,
/* 154 */0, 0, 0, 0, 0, 0, 0, 0,
/* 155 */0, 0, 0, 0, 0, 0, 0, 0,
/* 156 */0, 0, 0, 0, 0, 0, 0, 0,
/* 157 */0, 0, 0, 0, 0, 0, 0, 0,
/* 158 */0, 0, 0, 0, 0, 0, 0, 0,
/* 159 */0, 0, 0, 0, 0, 0, 0, 0,
/* 160 */0, 0, 0, 0, 0, 0, 0, 0,
/* 161 */0, 0, 0, 0, 7, 5, 7, 0,
/* 162 */28, 4, 4, 4, 0, 0, 0, 0,
/* 163 */0, 0, 0, 4, 4, 4, 7, 0,
/* 164 */0, 0, 0, 0, 1, 2, 4, 0,
/* 165 */0, 0, 0, 6, 6, 0, 0, 0,
/* 166 */0, 31, 16, 31, 16, 8, 4, 0,
/* 167 */0, 0, 31, 16, 12, 4, 2, 0,
/* 168 */0, 0, 8, 4, 6, 5, 4, 0,
/* 169 */0, 0, 4, 31, 17, 16, 12, 0,
/* 170 */0, 0, 31, 4, 4, 4, 31, 0,
/* 171 */0, 0, 8, 31, 12, 10, 9, 0,
/* 172 */0, 0, 2, 31, 18, 10, 2, 0,
/* 173 */0, 0, 0, 14, 8, 8, 31, 0,
/* 174 */0, 0, 15, 8, 15, 8, 15, 0,
/* 175 */0, 0, 0, 21, 21, 16, 12, 0,
/* 176 */0, 0, 0, 31, 0, 0, 0, 0,
/* 177 */31, 16, 20, 12, 4, 4, 2, 0,
/* 178 */16, 8, 4, 6, 5, 4, 4, 0,
/* 179 */4, 31, 17, 17, 16, 8, 4, 0,
/* 180 */0, 31, 4, 4, 4, 4, 31, 0,
/* 181 */8, 31, 8, 12, 10, 9, 8, 0,
/* 182 */2, 31, 18, 18, 18, 18, 9, 0,
/* 183 */4, 31, 4, 31, 4, 4, 4, 0,
/* 184 */0, 30, 18, 17, 16, 8, 6, 0,
/* 185 */2, 30, 9, 8, 8, 8, 4, 0,
/* 186 */0, 31, 16, 16, 16, 16, 31, 0,
/* 187 */10, 31, 10, 10, 8, 4, 2, 0,
/* 188 */0, 3, 16, 19, 16, 8, 7, 0,
/* 189 */0, 31, 16, 8, 4, 10, 17, 0,
/* 190 */2, 31, 18, 10, 2, 2, 28, 0,
/* 191 */0, 17, 17, 18, 16, 8, 6, 0,
/* 192 */0, 30, 18, 21, 24, 8, 6, 0,
/* 193 */8, 7, 4, 31, 4, 4, 2, 0,
/* 194 */0, 21, 21, 21, 16, 8, 4, 0,
/* 195 */14, 0, 31, 4, 4, 4, 2, 0,
/* 196 */2, 2, 2, 6, 10, 2, 2, 0,
/* 197 */4, 4, 31, 4, 4, 2, 1, 0,
/* 198 */0, 14, 0, 0, 0, 0, 31, 0,
/* 199 */0, 31, 16, 10, 4, 10, 1, 0,
/* 200 */4, 31, 8, 4, 14, 21, 4, 0,
/* 201 */8, 8, 8, 8, 8, 4, 2, 0,
/* 202 */0, 4, 8, 17, 17, 17, 17, 0,
/* 203 */1, 1, 31, 1, 1, 1, 30, 0,
/* 204 */0, 31, 16, 16, 16, 8, 6, 0,
/* 205 */0, 2, 5, 8, 16, 16, 0, 0,
/* 206 */4, 31, 4, 4, 21, 21, 4, 0,
/* 207 */0, 31, 16, 16, 10, 4, 8, 0,
/* 208 */0, 14, 0, 14, 0, 14, 16, 0,
/* 209 */0, 4, 2, 1, 17, 31, 16, 0,
/* 210 */0, 16, 16, 10, 4, 10, 1, 0,
/* 211 */0, 31, 2, 31, 2, 2, 28, 0,
/* 212 */2, 2, 31, 18, 10, 2, 2, 0,
/* 213 */0, 14, 8, 8, 8, 8, 31, 0,
/* 214 */0, 31, 16, 31, 16, 16, 31, 0,
/* 215 */14, 0, 31, 16, 16, 8, 4, 0,
/* 216 */9, 9, 9, 9, 8, 4, 2, 0,
/* 217 */0, 4, 5, 5, 21, 21, 13, 0,
/* 218 */0, 1, 1, 17, 9, 5, 3, 0,
/* 219 */0, 31, 17, 17, 17, 17, 31, 0,
/* 220 */0, 31, 17, 17, 16, 8, 4, 0,
/* 221 */0, 3, 0, 16, 16, 8, 7, 0,
/* 222 */4, 9, 2, 0, 0, 0, 0, 0,
/* 223 */7, 5, 7, 0, 0, 0, 0, 0,
/* 224 */0, 0, 18, 21, 9, 9, 22, 0,
/* 225 */10, 0, 14, 16, 30, 17, 30, 0,
/* 226 */0, 0, 14, 17, 15, 17, 15, 1,
/* 227 */0, 0, 14, 1, 6, 17, 14, 0,
/* 228 */0, 0, 17, 17, 17, 25, 23, 1,
/* 229 */0, 0, 30, 5, 9, 17, 14, 0,
/* 230 */0, 0, 12, 18, 17, 17, 15, 1,
/* 231 */0, 0, 30, 17, 17, 17, 30, 16,
/* 232 */0, 0, 28, 4, 4, 5, 2, 0,
/* 233 */0, 8, 11, 8, 0, 0, 0, 0,
/* 234 */8, 0, 12, 8, 8, 8, 8, 8,
/* 235 */0, 5, 2, 5, 0, 0, 0, 0,
/* 236 */0, 4, 14, 5, 21, 14, 4, 0,
/* 237 */2, 2, 7, 2, 7, 2, 30, 0,
/* 238 */14, 0, 13, 19, 17, 17, 17, 0,
/* 239 */10, 0, 14, 17, 17, 17, 14, 0,
/* 240 */0, 0, 13, 19, 17, 17, 15, 1,
/* 241 */0, 0, 22, 25, 17, 17, 30, 16,
/* 242 */0, 14, 17, 31, 17, 17, 14, 0,
/* 243 */0, 0, 0, 26, 21, 11, 0, 0,
/* 244 */0, 0, 14, 17, 17, 10, 27, 0,
/* 245 */10, 0, 17, 17, 17, 17, 25, 22,
/* 246 */31, 1, 2, 4, 2, 1, 31, 0,
/* 247 */0, 0, 31, 10, 10, 10, 25, 0,
/* 248 */31, 0, 17, 10, 4, 10, 17, 0,
/* 249 */0, 0, 17, 17, 17, 17, 30, 16,
/* 250 */0, 16, 15, 4, 31, 4, 4, 0,
/* 251 */0, 0, 31, 2, 30, 18, 17, 0,
/* 252 */0, 0, 31, 21, 31, 17, 17, 0,
/* 253 */0, 4, 0, 31, 0, 4, 0, 0,
/* 254 */0, 0, 0, 0, 0, 0, 0, 0,
/* 255 */31, 31, 31, 31, 31, 31, 31, 31]);
},{}],"../node_modules/@wokwi/elements/dist/esm/lcd1602-element.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LCD1602Element = undefined;

var _litElement = require("lit-element");

var _lcd1602FontA = require("./lcd1602-font-a00");

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

const ROWS = 2;
const COLS = 16;
const charXSpacing = 3.55;
const charYSpacing = 5.95;
const backgroundColors = {
    green: '#6cb201',
    blue: '#000eff'
};
let LCD1602Element = class LCD1602Element extends _litElement.LitElement {
    constructor() {
        super(...arguments);
        this.color = 'black';
        this.background = 'green';
        this.characters = new Uint8Array(32);
        this.font = _lcd1602FontA.fontA00;
        this.cursor = false;
        this.blink = false;
        this.cursorX = 0;
        this.cursorY = 0;
        this.backlight = true;
    }
    static get styles() {
        return _litElement.css`
      .cursor-blink {
        animation: cursor-blink;
      }

      @keyframes cursor-blink {
        from {
          opacity: 0;
        }
        25% {
          opacity: 1;
        }
        75% {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;
    }
    path(characters) {
        const xSpacing = 0.6;
        const ySpacing = 0.7;
        const result = [];
        for (let i = 0; i < characters.length; i++) {
            const charX = i % COLS * charXSpacing;
            const charY = Math.floor(i / COLS) * charYSpacing;
            for (let py = 0; py < 8; py++) {
                const row = this.font[characters[i] * 8 + py];
                for (let px = 0; px < 5; px++) {
                    if (row & 1 << px) {
                        const x = (charX + px * xSpacing).toFixed(2);
                        const y = (charY + py * ySpacing).toFixed(2);
                        result.push(`M ${x} ${y}h0.55v0.65h-0.55Z`);
                    }
                }
            }
        }
        return result.join(' ');
    }
    renderCursor() {
        const xOffset = 12.45 + this.cursorX * charXSpacing;
        const yOffset = 12.55 + this.cursorY * charYSpacing;
        if (this.cursorX < 0 || this.cursorX >= COLS || this.cursorY < 0 || this.cursorY >= ROWS) {
            return null;
        }
        const result = [];
        if (this.blink) {
            result.push(_litElement.svg`
        <rect x="${xOffset}" y="${yOffset}" width="2.95" height="5.55" fill="${this.color}">
          <animate
            attributeName="opacity"
            values="0;0;0;0;1;1;0;0;0;0"
            dur="1s"
            fill="freeze"
            repeatCount="indefinite"
          />
        </rect>
      `);
        }
        if (this.cursor) {
            const y = yOffset + 0.7 * 7;
            result.push(_litElement.svg`<rect x="${xOffset}" y="${y}" width="2.95" height="0.65" fill="${this.color}" />`);
        }
        return result;
    }
    render() {
        const { color, characters, background } = this;
        const darken = this.backlight ? 0 : 0.5;
        const actualBgColor = background in backgroundColors ? backgroundColors[background] : backgroundColors;
        // Dimensions according to:
        // https://www.winstar.com.tw/products/character-lcd-display-module/16x2-lcd.html
        return _litElement.html`
      <svg
        width="80mm"
        height="36mm"
        version="1.1"
        viewBox="0 0 80 36"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="characters"
            width="3.55"
            height="5.95"
            patternUnits="userSpaceOnUse"
            x="12.45"
            y="12.55"
          >
            <rect width="2.95" height="5.55" fill-opacity="0.05" />
          </pattern>
        </defs>
        <rect width="80" height="36" fill="#087f45" />
        <rect x="4.95" y="5.7" width="71.2" height="25.2" />
        <rect x="7.55" y="10.3" width="66" height="16" rx="1.5" ry="1.5" fill="${actualBgColor}" />
        <rect x="7.55" y="10.3" width="66" height="16" rx="1.5" ry="1.5" opacity="${darken}" />
        <rect x="12.45" y="12.55" width="56.2" height="11.5" fill="url(#characters)" />
        <path d="${this.path(characters)}" transform="translate(12.45, 12.55)" fill="${color}" />
        ${this.renderCursor()}
      </svg>
    `;
    }
};
__decorate([(0, _litElement.property)()], LCD1602Element.prototype, "color", void 0);
__decorate([(0, _litElement.property)()], LCD1602Element.prototype, "background", void 0);
__decorate([(0, _litElement.property)({ type: Array })], LCD1602Element.prototype, "characters", void 0);
__decorate([(0, _litElement.property)()], LCD1602Element.prototype, "font", void 0);
__decorate([(0, _litElement.property)()], LCD1602Element.prototype, "cursor", void 0);
__decorate([(0, _litElement.property)()], LCD1602Element.prototype, "blink", void 0);
__decorate([(0, _litElement.property)()], LCD1602Element.prototype, "cursorX", void 0);
__decorate([(0, _litElement.property)()], LCD1602Element.prototype, "cursorY", void 0);
__decorate([(0, _litElement.property)()], LCD1602Element.prototype, "backlight", void 0);
exports.LCD1602Element = LCD1602Element = __decorate([(0, _litElement.customElement)('wokwi-lcd1602')], LCD1602Element);
exports.LCD1602Element = LCD1602Element;
},{"lit-element":"../node_modules/lit-element/lit-element.js","./lcd1602-font-a00":"../node_modules/@wokwi/elements/dist/esm/lcd1602-font-a00.js"}],"../node_modules/@wokwi/elements/dist/esm/lcd1602-font-a02.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
// Font rasterized from datasheet: https://www.sparkfun.com/datasheets/LCD/HD44780.pdf
// prettier-ignore
const fontA02 = exports.fontA02 = new Uint8Array([
/* 0 */0, 0, 0, 0, 0, 0, 0, 0,
/* 1 */0, 0, 0, 0, 0, 0, 0, 0,
/* 2 */0, 0, 0, 0, 0, 0, 0, 0,
/* 3 */0, 0, 0, 0, 0, 0, 0, 0,
/* 4 */0, 0, 0, 0, 0, 0, 0, 0,
/* 5 */0, 0, 0, 0, 0, 0, 0, 0,
/* 6 */0, 0, 0, 0, 0, 0, 0, 0,
/* 7 */0, 0, 0, 0, 0, 0, 0, 0,
/* 8 */0, 0, 0, 0, 0, 0, 0, 0,
/* 9 */0, 0, 0, 0, 0, 0, 0, 0,
/* 10 */0, 0, 0, 0, 0, 0, 0, 0,
/* 11 */0, 0, 0, 0, 0, 0, 0, 0,
/* 12 */0, 0, 0, 0, 0, 0, 0, 0,
/* 13 */0, 0, 0, 0, 0, 0, 0, 0,
/* 14 */0, 0, 0, 0, 0, 0, 0, 0,
/* 15 */0, 0, 0, 0, 0, 0, 0, 0,
/* 32 */0, 2, 6, 14, 30, 14, 6, 2,
/* 33 */0, 8, 12, 14, 15, 14, 12, 8,
/* 34 */0, 18, 9, 27, 0, 0, 0, 0,
/* 35 */0, 27, 18, 9, 0, 0, 0, 0,
/* 36 */0, 4, 14, 31, 0, 4, 14, 31,
/* 37 */0, 31, 14, 4, 0, 31, 14, 4,
/* 38 */0, 0, 14, 31, 31, 31, 14, 0,
/* 39 */0, 16, 16, 20, 18, 31, 2, 4,
/* 40 */0, 4, 14, 21, 4, 4, 4, 4,
/* 41 */0, 4, 4, 4, 4, 21, 14, 4,
/* 42 */0, 0, 4, 8, 31, 8, 4, 0,
/* 43 */0, 0, 4, 2, 31, 2, 4, 0,
/* 44 */0, 8, 4, 2, 4, 8, 0, 31,
/* 45 */0, 2, 4, 8, 4, 2, 0, 31,
/* 46 */0, 0, 4, 4, 14, 14, 31, 0,
/* 47 */0, 0, 31, 14, 14, 4, 4, 0,
/* 48 */0, 0, 0, 0, 0, 0, 0, 0,
/* 49 */0, 4, 4, 4, 4, 0, 0, 4,
/* 50 */0, 10, 10, 10, 0, 0, 0, 0,
/* 51 */0, 10, 10, 31, 10, 31, 10, 10,
/* 52 */0, 4, 30, 5, 14, 20, 15, 4,
/* 53 */0, 3, 19, 8, 4, 2, 25, 24,
/* 54 */0, 6, 9, 5, 2, 21, 9, 22,
/* 55 */0, 6, 4, 2, 0, 0, 0, 0,
/* 56 */0, 8, 4, 2, 2, 2, 4, 8,
/* 57 */0, 2, 4, 8, 8, 8, 4, 2,
/* 58 */0, 0, 4, 21, 14, 21, 4, 0,
/* 59 */0, 0, 4, 4, 31, 4, 4, 0,
/* 60 */0, 0, 0, 0, 0, 6, 4, 2,
/* 61 */0, 0, 0, 0, 31, 0, 0, 0,
/* 62 */0, 0, 0, 0, 0, 0, 6, 6,
/* 63 */0, 0, 16, 8, 4, 2, 1, 0,
/* 64 */0, 14, 17, 25, 21, 19, 17, 14,
/* 65 */0, 4, 6, 4, 4, 4, 4, 14,
/* 66 */0, 14, 17, 16, 8, 4, 2, 31,
/* 67 */0, 31, 8, 4, 8, 16, 17, 14,
/* 68 */0, 8, 12, 10, 9, 31, 8, 8,
/* 69 */0, 31, 1, 15, 16, 16, 17, 14,
/* 70 */0, 12, 2, 1, 15, 17, 17, 14,
/* 71 */0, 31, 17, 16, 8, 4, 4, 4,
/* 72 */0, 14, 17, 17, 14, 17, 17, 14,
/* 73 */0, 14, 17, 17, 30, 16, 8, 6,
/* 74 */0, 0, 6, 6, 0, 6, 6, 0,
/* 75 */0, 0, 6, 6, 0, 6, 4, 2,
/* 76 */0, 8, 4, 2, 1, 2, 4, 8,
/* 77 */0, 0, 0, 31, 0, 31, 0, 0,
/* 78 */0, 2, 4, 8, 16, 8, 4, 2,
/* 79 */0, 14, 17, 16, 8, 4, 0, 4,
/* 80 */0, 14, 17, 16, 22, 21, 21, 14,
/* 81 */0, 4, 10, 17, 17, 31, 17, 17,
/* 82 */0, 15, 17, 17, 15, 17, 17, 15,
/* 83 */0, 14, 17, 1, 1, 1, 17, 14,
/* 84 */0, 7, 9, 17, 17, 17, 9, 7,
/* 85 */0, 31, 1, 1, 15, 1, 1, 31,
/* 86 */0, 31, 1, 1, 15, 1, 1, 1,
/* 87 */0, 14, 17, 1, 29, 17, 17, 30,
/* 88 */0, 17, 17, 17, 31, 17, 17, 17,
/* 89 */0, 14, 4, 4, 4, 4, 4, 14,
/* 90 */0, 28, 8, 8, 8, 8, 9, 6,
/* 91 */0, 17, 9, 5, 3, 5, 9, 17,
/* 92 */0, 1, 1, 1, 1, 1, 1, 31,
/* 93 */0, 17, 27, 21, 21, 17, 17, 17,
/* 94 */0, 17, 17, 19, 21, 25, 17, 17,
/* 95 */0, 14, 17, 17, 17, 17, 17, 14,
/* 96 */0, 15, 17, 17, 15, 1, 1, 1,
/* 97 */0, 14, 17, 17, 17, 21, 9, 22,
/* 98 */0, 15, 17, 17, 15, 5, 9, 17,
/* 99 */0, 14, 17, 1, 14, 16, 17, 14,
/* 100 */0, 31, 4, 4, 4, 4, 4, 4,
/* 101 */0, 17, 17, 17, 17, 17, 17, 14,
/* 102 */0, 17, 17, 17, 17, 17, 10, 4,
/* 103 */0, 17, 17, 17, 21, 21, 21, 10,
/* 104 */0, 17, 17, 10, 4, 10, 17, 17,
/* 105 */0, 17, 17, 17, 10, 4, 4, 4,
/* 106 */0, 31, 16, 8, 4, 2, 1, 31,
/* 107 */0, 14, 2, 2, 2, 2, 2, 14,
/* 108 */0, 0, 1, 2, 4, 8, 16, 0,
/* 109 */0, 14, 8, 8, 8, 8, 8, 14,
/* 110 */0, 4, 10, 17, 0, 0, 0, 0,
/* 111 */0, 0, 0, 0, 0, 0, 0, 31,
/* 112 */0, 2, 4, 8, 0, 0, 0, 0,
/* 113 */0, 0, 0, 14, 16, 30, 17, 30,
/* 114 */0, 1, 1, 13, 19, 17, 17, 15,
/* 115 */0, 0, 0, 14, 1, 1, 17, 14,
/* 116 */0, 16, 16, 22, 25, 17, 17, 30,
/* 117 */0, 0, 0, 14, 17, 31, 1, 14,
/* 118 */0, 12, 18, 2, 7, 2, 2, 2,
/* 119 */0, 0, 0, 30, 17, 30, 16, 14,
/* 120 */0, 1, 1, 13, 19, 17, 17, 17,
/* 121 */0, 4, 0, 4, 6, 4, 4, 14,
/* 122 */0, 8, 0, 12, 8, 8, 9, 6,
/* 123 */0, 1, 1, 9, 5, 3, 5, 9,
/* 124 */0, 6, 4, 4, 4, 4, 4, 14,
/* 125 */0, 0, 0, 11, 21, 21, 21, 21,
/* 126 */0, 0, 0, 13, 19, 17, 17, 17,
/* 127 */0, 0, 0, 14, 17, 17, 17, 14,
/* 128 */0, 0, 0, 15, 17, 15, 1, 1,
/* 129 */0, 0, 0, 22, 25, 30, 16, 16,
/* 130 */0, 0, 0, 13, 19, 1, 1, 1,
/* 131 */0, 0, 0, 14, 1, 14, 16, 15,
/* 132 */0, 2, 2, 7, 2, 2, 18, 12,
/* 133 */0, 0, 0, 17, 17, 17, 25, 22,
/* 134 */0, 0, 0, 17, 17, 17, 10, 4,
/* 135 */0, 0, 0, 17, 17, 21, 21, 10,
/* 136 */0, 0, 0, 17, 10, 4, 10, 17,
/* 137 */0, 0, 0, 17, 17, 30, 16, 14,
/* 138 */0, 0, 0, 31, 8, 4, 2, 31,
/* 139 */0, 8, 4, 4, 2, 4, 4, 8,
/* 140 */0, 4, 4, 4, 4, 4, 4, 4,
/* 141 */0, 2, 4, 4, 8, 4, 4, 2,
/* 142 */0, 0, 0, 0, 22, 9, 0, 0,
/* 143 */0, 4, 10, 17, 17, 17, 31, 0,
/* 144 */0, 31, 17, 1, 15, 17, 17, 15,
/* 145 */30, 20, 20, 18, 17, 31, 17, 17,
/* 146 */0, 21, 21, 21, 14, 21, 21, 21,
/* 147 */0, 15, 16, 16, 12, 16, 16, 15,
/* 148 */0, 17, 17, 25, 21, 19, 17, 17,
/* 149 */10, 4, 17, 17, 25, 21, 19, 17,
/* 150 */0, 30, 20, 20, 20, 20, 21, 18,
/* 151 */0, 31, 17, 17, 17, 17, 17, 17,
/* 152 */0, 17, 17, 17, 10, 4, 2, 1,
/* 153 */0, 17, 17, 17, 17, 17, 31, 16,
/* 154 */0, 17, 17, 17, 30, 16, 16, 16,
/* 155 */0, 0, 21, 21, 21, 21, 21, 31,
/* 156 */0, 21, 21, 21, 21, 21, 31, 16,
/* 157 */0, 3, 2, 2, 14, 18, 18, 14,
/* 158 */0, 17, 17, 17, 19, 21, 21, 19,
/* 159 */0, 14, 17, 20, 26, 16, 17, 14,
/* 160 */0, 0, 0, 18, 21, 9, 9, 22,
/* 161 */0, 4, 12, 20, 20, 4, 7, 7,
/* 162 */0, 31, 17, 1, 1, 1, 1, 1,
/* 163 */0, 0, 0, 31, 10, 10, 10, 25,
/* 164 */0, 31, 1, 2, 4, 2, 1, 31,
/* 165 */0, 0, 0, 30, 9, 9, 9, 6,
/* 166 */12, 20, 28, 20, 20, 23, 27, 24,
/* 167 */0, 0, 16, 14, 5, 4, 4, 8,
/* 168 */0, 4, 14, 14, 14, 31, 4, 0,
/* 169 */0, 14, 17, 17, 31, 17, 17, 14,
/* 170 */0, 0, 14, 17, 17, 17, 10, 27,
/* 171 */0, 12, 18, 4, 10, 17, 17, 14,
/* 172 */0, 0, 0, 26, 21, 11, 0, 0,
/* 173 */0, 0, 10, 31, 31, 31, 14, 4,
/* 174 */0, 0, 0, 14, 1, 6, 17, 14,
/* 175 */0, 14, 17, 17, 17, 17, 17, 17,
/* 176 */0, 27, 27, 27, 27, 27, 27, 27,
/* 177 */0, 4, 0, 0, 4, 4, 4, 4,
/* 178 */0, 4, 14, 5, 5, 21, 14, 4,
/* 179 */0, 12, 2, 2, 7, 2, 18, 13,
/* 180 */0, 0, 17, 14, 10, 14, 17, 0,
/* 181 */0, 17, 10, 31, 4, 31, 4, 4,
/* 182 */0, 4, 4, 4, 0, 4, 4, 4,
/* 183 */0, 12, 18, 4, 10, 4, 9, 6,
/* 184 */0, 8, 20, 4, 31, 4, 5, 2,
/* 185 */0, 31, 17, 21, 29, 21, 17, 31,
/* 186 */0, 14, 16, 30, 17, 30, 0, 31,
/* 187 */0, 0, 20, 10, 5, 10, 20, 0,
/* 188 */0, 9, 21, 21, 23, 21, 21, 9,
/* 189 */0, 30, 17, 17, 30, 20, 18, 17,
/* 190 */0, 31, 17, 21, 17, 25, 21, 31,
/* 191 */0, 4, 2, 6, 0, 0, 0, 0,
/* 192 */6, 9, 9, 9, 6, 0, 0, 0,
/* 193 */0, 4, 4, 31, 4, 4, 0, 31,
/* 194 */6, 9, 4, 2, 15, 0, 0, 0,
/* 195 */7, 8, 6, 8, 7, 0, 0, 0,
/* 196 */7, 9, 7, 1, 9, 29, 9, 24,
/* 197 */0, 17, 17, 17, 25, 23, 1, 1,
/* 198 */0, 30, 25, 25, 30, 24, 24, 24,
/* 199 */0, 0, 0, 0, 6, 6, 0, 0,
/* 200 */0, 0, 0, 10, 17, 21, 21, 10,
/* 201 */2, 3, 2, 2, 7, 0, 0, 0,
/* 202 */0, 14, 17, 17, 17, 14, 0, 31,
/* 203 */0, 0, 5, 10, 20, 10, 5, 0,
/* 204 */17, 9, 5, 10, 13, 10, 30, 8,
/* 205 */17, 9, 5, 10, 21, 16, 8, 28,
/* 206 */3, 2, 3, 18, 27, 20, 28, 16,
/* 207 */0, 4, 0, 4, 2, 1, 17, 14,
/* 208 */2, 4, 4, 10, 17, 31, 17, 17,
/* 209 */8, 4, 4, 10, 17, 31, 17, 17,
/* 210 */4, 10, 0, 14, 17, 31, 17, 17,
/* 211 */22, 9, 0, 14, 17, 31, 17, 17,
/* 212 */10, 0, 4, 10, 17, 31, 17, 17,
/* 213 */4, 10, 4, 14, 17, 31, 17, 17,
/* 214 */0, 28, 6, 5, 29, 7, 5, 29,
/* 215 */14, 17, 1, 1, 17, 14, 8, 12,
/* 216 */2, 4, 0, 31, 1, 15, 1, 31,
/* 217 */8, 4, 0, 31, 1, 15, 1, 31,
/* 218 */4, 10, 0, 31, 1, 15, 1, 31,
/* 219 */0, 10, 0, 31, 1, 15, 1, 31,
/* 220 */2, 4, 0, 14, 4, 4, 4, 14,
/* 221 */8, 4, 0, 14, 4, 4, 4, 14,
/* 222 */4, 10, 0, 14, 4, 4, 4, 14,
/* 223 */0, 10, 0, 14, 4, 4, 4, 14,
/* 224 */0, 14, 18, 18, 23, 18, 18, 14,
/* 225 */22, 9, 0, 17, 19, 21, 25, 17,
/* 226 */2, 4, 14, 17, 17, 17, 17, 14,
/* 227 */8, 4, 14, 17, 17, 17, 17, 14,
/* 228 */4, 10, 0, 14, 17, 17, 17, 14,
/* 229 */22, 9, 0, 14, 17, 17, 17, 14,
/* 230 */10, 0, 14, 17, 17, 17, 17, 14,
/* 231 */0, 0, 17, 10, 4, 10, 17, 0,
/* 232 */0, 14, 4, 14, 21, 14, 4, 14,
/* 233 */2, 4, 17, 17, 17, 17, 17, 14,
/* 234 */8, 4, 17, 17, 17, 17, 17, 14,
/* 235 */4, 10, 0, 17, 17, 17, 17, 14,
/* 236 */10, 0, 17, 17, 17, 17, 17, 14,
/* 237 */8, 4, 17, 10, 4, 4, 4, 4,
/* 238 */3, 2, 14, 18, 18, 14, 2, 7,
/* 239 */0, 12, 18, 18, 14, 18, 18, 13,
/* 240 */2, 4, 0, 14, 16, 30, 17, 30,
/* 241 */8, 4, 0, 14, 16, 30, 17, 30,
/* 242 */4, 10, 0, 14, 16, 30, 17, 30,
/* 243 */22, 9, 0, 14, 16, 30, 17, 30,
/* 244 */0, 10, 0, 14, 16, 30, 17, 30,
/* 245 */4, 10, 4, 14, 16, 30, 17, 30,
/* 246 */0, 0, 11, 20, 30, 5, 21, 10,
/* 247 */0, 0, 14, 1, 17, 14, 4, 6,
/* 248 */2, 4, 0, 14, 17, 31, 1, 14,
/* 249 */8, 4, 0, 14, 17, 31, 1, 14,
/* 250 */4, 10, 0, 14, 17, 31, 1, 14,
/* 251 */0, 10, 0, 14, 17, 31, 1, 14,
/* 252 */2, 4, 0, 4, 6, 4, 4, 14,
/* 253 */8, 4, 0, 4, 6, 4, 4, 14,
/* 254 */4, 10, 0, 4, 6, 4, 4, 14,
/* 255 */0, 10, 0, 4, 6, 4, 4, 14,
/* 256 */0, 5, 2, 5, 8, 30, 17, 14,
/* 257 */22, 9, 0, 13, 19, 17, 17, 17,
/* 258 */2, 4, 0, 14, 17, 17, 17, 14,
/* 259 */8, 4, 0, 14, 17, 17, 17, 14,
/* 260 */0, 4, 10, 0, 14, 17, 17, 14,
/* 261 */0, 22, 9, 0, 14, 17, 17, 14,
/* 262 */0, 10, 0, 14, 17, 17, 17, 14,
/* 263 */0, 0, 4, 0, 31, 0, 4, 0,
/* 264 */0, 8, 4, 14, 21, 14, 4, 2,
/* 265 */2, 4, 0, 17, 17, 17, 25, 22,
/* 266 */8, 4, 0, 17, 17, 17, 25, 22,
/* 267 */4, 10, 0, 17, 17, 17, 25, 22,
/* 268 */0, 10, 0, 17, 17, 17, 25, 22,
/* 269 */0, 8, 4, 17, 17, 30, 16, 14,
/* 270 */0, 6, 4, 12, 20, 12, 4, 14,
/* 271 */0, 10, 0, 17, 17, 30, 16, 14]);
},{}],"../node_modules/@wokwi/elements/dist/esm/neopixel-element.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NeoPixelElement = undefined;

var _litElement = require("lit-element");

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let NeoPixelElement = class NeoPixelElement extends _litElement.LitElement {
  constructor() {
    super(...arguments);
    this.r = 0;
    this.g = 0;
    this.b = 0;
  }
  render() {
    const { r, g, b } = this;
    const spotOpacity = value => value > 0.001 ? 0.7 + value * 0.3 : 0;
    const maxOpacity = Math.max(r, g, b);
    const minOpacity = Math.min(r, g, b);
    const opacityDelta = maxOpacity - minOpacity;
    const multiplier = Math.max(1, 2 - opacityDelta * 20);
    const glowBase = 0.1 + Math.max(maxOpacity * 2 - opacityDelta * 5, 0);
    const glowColor = value => value > 0.005 ? 0.1 + value * 0.9 : 0;
    const glowOpacity = value => value > 0.005 ? glowBase + value * (1 - glowBase) : 0;
    const cssVal = value => maxOpacity ? Math.floor(Math.min(glowColor(value / maxOpacity) * multiplier, 1) * 255) : 255;
    const cssColor = `rgb(${cssVal(r)}, ${cssVal(g)}, ${cssVal(b)})`;
    const bkgWhite = 242 - (maxOpacity > 0.1 && opacityDelta < 0.2 ? Math.floor(maxOpacity * 50 * (1 - opacityDelta / 0.2)) : 0);
    const background = `rgb(${bkgWhite}, ${bkgWhite}, ${bkgWhite})`;
    return _litElement.html`
      <svg
        width="5.6631mm"
        height="5mm"
        version="1.1"
        viewBox="0 0 5.6631 5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="light1" x="-0.8" y="-0.8" height="2.8" width="2.8">
          <feGaussianBlur stdDeviation="${Math.max(0.1, maxOpacity)}" />
        </filter>
        <filter id="light2" x="-0.8" y="-0.8" height="2.2" width="2.8">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <rect x=".33308" y="0" width="5" height="5" fill="${background}" />
        <rect x=".016709" y=".4279" width=".35114" height=".9" fill="#eaeaea" />
        <rect x="0" y="3.6518" width=".35114" height=".9" fill="#eaeaea" />
        <rect x="5.312" y="3.6351" width=".35114" height=".9" fill="#eaeaea" />
        <rect x="5.312" y=".3945" width=".35114" height=".9" fill="#eaeaea" />
        <circle cx="2.8331" cy="2.5" r="2.1" fill="#ddd" />
        <circle cx="2.8331" cy="2.5" r="1.7325" fill="#e6e6e6" />
        <g fill="#bfbfbf">
          <path
            d="m4.3488 3.3308s-0.0889-0.087-0.0889-0.1341c0-0.047-6e-3 -1.1533-6e-3 -1.1533s-0.0591-0.1772-0.2008-0.1772c-0.14174 0-0.81501 0.012-0.81501 0.012s-0.24805 0.024-0.23624 0.3071c0.0118 0.2835 0.032 2.0345 0.032 2.0345 0.54707-0.046 1.0487-0.3494 1.3146-0.8888z"
          />
          <path
            d="m4.34 1.6405h-1.0805s-0.24325 0.019-0.26204-0.2423l6e-3 -0.6241c0.57782 0.075 1.0332 0.3696 1.3366 0.8706z"
          />
          <path
            d="m2.7778 2.6103-0.17127 0.124-0.8091-0.012c-0.17122-0.019-0.17062-0.2078-0.17062-0.2078-1e-3 -0.3746 1e-3 -0.2831-9e-3 -0.8122l-0.31248-0.018s0.43453-0.9216 1.4786-0.9174c-1.1e-4 0.6144-4e-3 1.2289-6e-3 1.8434z"
          />
          <path
            d="m2.7808 3.0828-0.0915-0.095h-0.96857l-0.0915 0.1447-3e-3 0.1127c0 0.065-0.12108 0.08-0.12108 0.08h-0.20909c0.55906 0.9376 1.4867 0.9155 1.4867 0.9155 1e-3 -0.3845-2e-3 -0.7692-2e-3 -1.1537z"
          />
        </g>
        <path
          d="m4.053 1.8619c-0.14174 0-0.81494 0.013-0.81494 0.013s-0.24797 0.024-0.23616 0.3084c3e-3 0.077 5e-3 0.3235 9e-3 0.5514h1.247c-2e-3 -0.33-4e-3 -0.6942-4e-3 -0.6942s-0.0593-0.1781-0.20102-0.1781z"
          fill="#666"
        />
        <ellipse
          cx="2.5"
          cy="2.3"
          rx="0.3"
          ry="0.3"
          fill="red"
          opacity=${spotOpacity(r)}
          filter="url(#light1)"
        ></ellipse>
        <ellipse
          cx="3.5"
          cy="3.2"
          rx="0.3"
          ry="0.3"
          fill="green"
          opacity=${spotOpacity(g)}
          filter="url(#light1)"
        ></ellipse>
        <ellipse
          cx="3.3"
          cy="1.45"
          rx="0.3"
          ry="0.3"
          fill="blue"
          opacity=${spotOpacity(b)}
          filter="url(#light1)"
        ></ellipse>
        <ellipse
          cx="3"
          cy="2.5"
          rx="2.2"
          ry="2.2"
          opacity="${glowOpacity(maxOpacity)}"
          fill="${cssColor}"
          filter="url(#light2)"
        ></ellipse>
      </svg>
    `;
  }
};
__decorate([(0, _litElement.property)()], NeoPixelElement.prototype, "r", void 0);
__decorate([(0, _litElement.property)()], NeoPixelElement.prototype, "g", void 0);
__decorate([(0, _litElement.property)()], NeoPixelElement.prototype, "b", void 0);
exports.NeoPixelElement = NeoPixelElement = __decorate([(0, _litElement.customElement)('wokwi-neopixel')], NeoPixelElement);
exports.NeoPixelElement = NeoPixelElement;
},{"lit-element":"../node_modules/lit-element/lit-element.js"}],"../node_modules/@wokwi/elements/dist/esm/index.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ledElement = require('./led-element');

Object.defineProperty(exports, 'LEDElement', {
  enumerable: true,
  get: function () {
    return _ledElement.LEDElement;
  }
});

var _pushbuttonElement = require('./pushbutton-element');

Object.defineProperty(exports, 'PushbuttonElement', {
  enumerable: true,
  get: function () {
    return _pushbuttonElement.PushbuttonElement;
  }
});

var _resistorElement = require('./resistor-element');

Object.defineProperty(exports, 'ResistorElement', {
  enumerable: true,
  get: function () {
    return _resistorElement.ResistorElement;
  }
});

var _segmentElement = require('./7segment-element');

Object.defineProperty(exports, 'SevenSegmentElement', {
  enumerable: true,
  get: function () {
    return _segmentElement.SevenSegmentElement;
  }
});

var _lcd1602Element = require('./lcd1602-element');

Object.defineProperty(exports, 'LCD1602Element', {
  enumerable: true,
  get: function () {
    return _lcd1602Element.LCD1602Element;
  }
});

var _lcd1602FontA = require('./lcd1602-font-a00');

Object.defineProperty(exports, 'fontA00', {
  enumerable: true,
  get: function () {
    return _lcd1602FontA.fontA00;
  }
});

var _lcd1602FontA2 = require('./lcd1602-font-a02');

Object.defineProperty(exports, 'fontA02', {
  enumerable: true,
  get: function () {
    return _lcd1602FontA2.fontA02;
  }
});

var _neopixelElement = require('./neopixel-element');

Object.defineProperty(exports, 'NeoPixelElement', {
  enumerable: true,
  get: function () {
    return _neopixelElement.NeoPixelElement;
  }
});
},{"./led-element":"../node_modules/@wokwi/elements/dist/esm/led-element.js","./pushbutton-element":"../node_modules/@wokwi/elements/dist/esm/pushbutton-element.js","./resistor-element":"../node_modules/@wokwi/elements/dist/esm/resistor-element.js","./7segment-element":"../node_modules/@wokwi/elements/dist/esm/7segment-element.js","./lcd1602-element":"../node_modules/@wokwi/elements/dist/esm/lcd1602-element.js","./lcd1602-font-a00":"../node_modules/@wokwi/elements/dist/esm/lcd1602-font-a00.js","./lcd1602-font-a02":"../node_modules/@wokwi/elements/dist/esm/lcd1602-font-a02.js","./neopixel-element":"../node_modules/@wokwi/elements/dist/esm/neopixel-element.js"}],"compile.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildHex = buildHex;
var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = undefined && undefined.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function sent() {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) {
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:case 1:
                        t = op;break;
                    case 4:
                        _.label++;return { value: op[1], done: false };
                    case 5:
                        _.label++;y = op[1];op = [0];continue;
                    case 7:
                        op = _.ops.pop();_.trys.pop();continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];t = op;break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];_.ops.push(op);break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];y = 0;
            } finally {
                f = t = 0;
            }
        }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var url = 'https://hexi.wokwi.com';
function buildHex(source) {
    return __awaiter(this, void 0, void 0, function () {
        var resp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [4 /*yield*/, fetch(url + '/build', {
                        method: 'POST',
                        mode: 'cors',
                        cache: 'no-cache',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ sketch: source })
                    })];
                case 1:
                    resp = _a.sent();
                    return [4 /*yield*/, resp.json()];
                case 2:
                    return [2 /*return*/, _a.sent()];
            }
        });
    });
}
},{}],"../node_modules/avr8js/dist/esm/cpu/cpu.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * AVR 8 CPU data structures
 * Part of AVR8js
 *
 * Copyright (C) 2019, Uri Shaked
 */
var registerSpace = 0x100;

var CPU = exports.CPU = function () {
    function CPU(progMem) {
        var sramBytes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8192;

        _classCallCheck(this, CPU);

        this.progMem = progMem;
        this.sramBytes = sramBytes;
        this.data = new Uint8Array(this.sramBytes + registerSpace);
        this.data16 = new Uint16Array(this.data.buffer);
        this.dataView = new DataView(this.data.buffer);
        this.progBytes = new Uint8Array(this.progMem.buffer);
        this.writeHooks = [];
        this.pc = 0;
        this.cycles = 0;
        this.reset();
    }

    _createClass(CPU, [{
        key: "reset",
        value: function reset() {
            this.data.fill(0);
            this.SP = this.data.length - 1;
        }
    }, {
        key: "readData",
        value: function readData(addr) {
            return this.data[addr];
        }
    }, {
        key: "writeData",
        value: function writeData(addr, value) {
            var hook = this.writeHooks[addr];
            if (hook) {
                if (hook(value, this.data[addr], addr)) {
                    return;
                }
            }
            this.data[addr] = value;
        }
    }, {
        key: "SP",
        get: function get() {
            return this.dataView.getUint16(93, true);
        },
        set: function set(value) {
            this.dataView.setUint16(93, value, true);
        }
    }, {
        key: "SREG",
        get: function get() {
            return this.data[95];
        }
    }, {
        key: "interruptsEnabled",
        get: function get() {
            return this.SREG & 0x80 ? true : false;
        }
    }]);

    return CPU;
}();
},{}],"../node_modules/avr8js/dist/esm/cpu/instruction.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.avrInstruction = avrInstruction;
/**
 * AVR-8 Instruction Simulation
 * Part of AVR8js
 * Reference: http://ww1.microchip.com/downloads/en/devicedoc/atmel-0856-avr-instruction-set-manual.pdf
 *
 * Copyright (C) 2019, Uri Shaked
 */
function isTwoWordInstruction(opcode) {
    return (
        /* LDS */
        (opcode & 0xfe0f) === 0x9000 ||
        /* STS */
        (opcode & 0xfe0f) === 0x9200 ||
        /* CALL */
        (opcode & 0xfe0e) === 0x940e ||
        /* JMP */
        (opcode & 0xfe0e) === 0x940c
    );
}
function avrInstruction(cpu) {
    var opcode = cpu.progMem[cpu.pc];
    if ((opcode & 0xfc00) === 0x1c00) {
        /* ADC, 0001 11rd dddd rrrr */
        var d = cpu.data[(opcode & 0x1f0) >> 4];
        var r = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        var sum = d + r + (cpu.data[95] & 1);
        var R = sum & 255;
        cpu.data[(opcode & 0x1f0) >> 4] = R;
        var sreg = cpu.data[95] & 0xc0;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= (R ^ r) & (d ^ R) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
        sreg |= sum & 256 ? 1 : 0;
        sreg |= 1 & (d & r | r & ~R | ~R & d) ? 0x20 : 0;
        cpu.data[95] = sreg;
    } else if ((opcode & 0xfc00) === 0xc00) {
        /* ADD, 0000 11rd dddd rrrr */
        var _d = cpu.data[(opcode & 0x1f0) >> 4];
        var _r = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        var _R = _d + _r & 255;
        cpu.data[(opcode & 0x1f0) >> 4] = _R;
        var _sreg = cpu.data[95] & 0xc0;
        _sreg |= _R ? 0 : 2;
        _sreg |= 128 & _R ? 4 : 0;
        _sreg |= (_R ^ _r) & (_R ^ _d) & 128 ? 8 : 0;
        _sreg |= _sreg >> 2 & 1 ^ _sreg >> 3 & 1 ? 0x10 : 0;
        _sreg |= _d + _r & 256 ? 1 : 0;
        _sreg |= 1 & (_d & _r | _r & ~_R | ~_R & _d) ? 0x20 : 0;
        cpu.data[95] = _sreg;
    } else if ((opcode & 0xff00) === 0x9600) {
        /* ADIW, 1001 0110 KKdd KKKK */
        var addr = 2 * ((opcode & 0x30) >> 4) + 24;
        var value = cpu.dataView.getUint16(addr, true);
        var _R2 = value + (opcode & 0xf | (opcode & 0xc0) >> 2) & 0xffff;
        cpu.dataView.setUint16(addr, _R2, true);
        var _sreg2 = cpu.data[95] & 0xe0;
        _sreg2 |= _R2 ? 0 : 2;
        _sreg2 |= 0x8000 & _R2 ? 4 : 0;
        _sreg2 |= ~value & _R2 & 0x8000 ? 8 : 0;
        _sreg2 |= _sreg2 >> 2 & 1 ^ _sreg2 >> 3 & 1 ? 0x10 : 0;
        _sreg2 |= ~_R2 & value & 0x8000 ? 1 : 0;
        cpu.data[95] = _sreg2;
        cpu.cycles++;
    } else if ((opcode & 0xfc00) === 0x2000) {
        /* AND, 0010 00rd dddd rrrr */
        var _R3 = cpu.data[(opcode & 0x1f0) >> 4] & cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        cpu.data[(opcode & 0x1f0) >> 4] = _R3;
        var _sreg3 = cpu.data[95] & 0xe1;
        _sreg3 |= _R3 ? 0 : 2;
        _sreg3 |= 128 & _R3 ? 4 : 0;
        _sreg3 |= _sreg3 >> 2 & 1 ^ _sreg3 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg3;
    } else if ((opcode & 0xf000) === 0x7000) {
        /* ANDI, 0111 KKKK dddd KKKK */
        var _R4 = cpu.data[((opcode & 0xf0) >> 4) + 16] & (opcode & 0xf | (opcode & 0xf00) >> 4);
        cpu.data[((opcode & 0xf0) >> 4) + 16] = _R4;
        var _sreg4 = cpu.data[95] & 0xe1;
        _sreg4 |= _R4 ? 0 : 2;
        _sreg4 |= 128 & _R4 ? 4 : 0;
        _sreg4 |= _sreg4 >> 2 & 1 ^ _sreg4 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg4;
    } else if ((opcode & 0xfe0f) === 0x9405) {
        /* ASR, 1001 010d dddd 0101 */
        var _value = cpu.data[(opcode & 0x1f0) >> 4];
        var _R5 = _value >>> 1 | 128 & _value;
        cpu.data[(opcode & 0x1f0) >> 4] = _R5;
        var _sreg5 = cpu.data[95] & 0xe0;
        _sreg5 |= _R5 ? 0 : 2;
        _sreg5 |= 128 & _R5 ? 4 : 0;
        _sreg5 |= _value & 1;
        _sreg5 |= _sreg5 >> 2 & 1 ^ _sreg5 & 1 ? 8 : 0;
        _sreg5 |= _sreg5 >> 2 & 1 ^ _sreg5 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg5;
    } else if ((opcode & 0xff8f) === 0x9488) {
        /* BCLR, 1001 0100 1sss 1000 */
        cpu.data[95] &= ~(1 << ((opcode & 0x70) >> 4));
    } else if ((opcode & 0xfe08) === 0xf800) {
        /* BLD, 1111 100d dddd 0bbb */
        var b = opcode & 7;
        var _d2 = (opcode & 0x1f0) >> 4;
        cpu.data[_d2] = ~(1 << b) & cpu.data[_d2] | (cpu.data[95] >> 6 & 1) << b;
    } else if ((opcode & 0xfc00) === 0xf400) {
        /* BRBC, 1111 01kk kkkk ksss */
        if (!(cpu.data[95] & 1 << (opcode & 7))) {
            cpu.pc = cpu.pc + (((opcode & 0x1f8) >> 3) - (opcode & 0x200 ? 0x40 : 0));
            cpu.cycles++;
        }
    } else if ((opcode & 0xfc00) === 0xf000) {
        /* BRBS, 1111 00kk kkkk ksss */
        if (cpu.data[95] & 1 << (opcode & 7)) {
            cpu.pc = cpu.pc + (((opcode & 0x1f8) >> 3) - (opcode & 0x200 ? 0x40 : 0));
            cpu.cycles++;
        }
    } else if ((opcode & 0xff8f) === 0x9408) {
        /* BSET, 1001 0100 0sss 1000 */
        cpu.data[95] |= 1 << ((opcode & 0x70) >> 4);
    } else if ((opcode & 0xfe08) === 0xfa00) {
        /* BST, 1111 101d dddd 0bbb */
        var _d3 = cpu.data[(opcode & 0x1f0) >> 4];
        var _b = opcode & 7;
        cpu.data[95] = cpu.data[95] & 0xbf | (_d3 >> _b & 1 ? 0x40 : 0);
    } else if ((opcode & 0xfe0e) === 0x940e) {
        /* CALL, 1001 010k kkkk 111k kkkk kkkk kkkk kkkk */
        var k = cpu.progMem[cpu.pc + 1] | (opcode & 1) << 16 | (opcode & 0x1f0) << 13;
        var ret = cpu.pc + 2;
        var sp = cpu.dataView.getUint16(93, true);
        cpu.data[sp] = 255 & ret;
        cpu.data[sp - 1] = ret >> 8 & 255;
        cpu.dataView.setUint16(93, sp - 2, true);
        cpu.pc = k - 1;
        cpu.cycles += 4;
    } else if ((opcode & 0xff00) === 0x9800) {
        /* CBI, 1001 1000 AAAA Abbb */
        var A = opcode & 0xf8;
        var _b2 = opcode & 7;
        var _R6 = cpu.readData((A >> 3) + 32);
        cpu.writeData((A >> 3) + 32, _R6 & ~(1 << _b2));
    } else if ((opcode & 0xfe0f) === 0x9400) {
        /* COM, 1001 010d dddd 0000 */
        var _d4 = (opcode & 0x1f0) >> 4;
        var _R7 = 255 - cpu.data[_d4];
        cpu.data[_d4] = _R7;
        var _sreg6 = cpu.data[95] & 0xe1 | 1;
        _sreg6 |= _R7 ? 0 : 2;
        _sreg6 |= 128 & _R7 ? 4 : 0;
        _sreg6 |= _sreg6 >> 2 & 1 ^ _sreg6 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg6;
    } else if ((opcode & 0xfc00) === 0x1400) {
        /* CP, 0001 01rd dddd rrrr */
        var val1 = cpu.data[(opcode & 0x1f0) >> 4];
        var val2 = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        var _R8 = val1 - val2;
        var _sreg7 = cpu.data[95] & 0xc0;
        _sreg7 |= _R8 ? 0 : 2;
        _sreg7 |= 128 & _R8 ? 4 : 0;
        _sreg7 |= 0 !== ((val1 ^ val2) & (val1 ^ _R8) & 128) ? 8 : 0;
        _sreg7 |= _sreg7 >> 2 & 1 ^ _sreg7 >> 3 & 1 ? 0x10 : 0;
        _sreg7 |= val2 > val1 ? 1 : 0;
        _sreg7 |= 1 & (~val1 & val2 | val2 & _R8 | _R8 & ~val1) ? 0x20 : 0;
        cpu.data[95] = _sreg7;
    } else if ((opcode & 0xfc00) === 0x400) {
        /* CPC, 0000 01rd dddd rrrr */
        var arg1 = cpu.data[(opcode & 0x1f0) >> 4];
        var arg2 = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        var _sreg8 = cpu.data[95];
        var _r2 = arg1 - arg2 - (_sreg8 & 1);
        _sreg8 = _sreg8 & 0xc0 | (!_r2 && _sreg8 >> 1 & 1 ? 2 : 0) | (arg2 + (_sreg8 & 1) > arg1 ? 1 : 0);
        _sreg8 |= 128 & _r2 ? 4 : 0;
        _sreg8 |= (arg1 ^ arg2) & (arg1 ^ _r2) & 128 ? 8 : 0;
        _sreg8 |= _sreg8 >> 2 & 1 ^ _sreg8 >> 3 & 1 ? 0x10 : 0;
        _sreg8 |= 1 & (~arg1 & arg2 | arg2 & _r2 | _r2 & ~arg1) ? 0x20 : 0;
        cpu.data[95] = _sreg8;
    } else if ((opcode & 0xf000) === 0x3000) {
        /* CPI, 0011 KKKK dddd KKKK */
        var _arg = cpu.data[((opcode & 0xf0) >> 4) + 16];
        var _arg2 = opcode & 0xf | (opcode & 0xf00) >> 4;
        var _r3 = _arg - _arg2;
        var _sreg9 = cpu.data[95] & 0xc0;
        _sreg9 |= _r3 ? 0 : 2;
        _sreg9 |= 128 & _r3 ? 4 : 0;
        _sreg9 |= (_arg ^ _arg2) & (_arg ^ _r3) & 128 ? 8 : 0;
        _sreg9 |= _sreg9 >> 2 & 1 ^ _sreg9 >> 3 & 1 ? 0x10 : 0;
        _sreg9 |= _arg2 > _arg ? 1 : 0;
        _sreg9 |= 1 & (~_arg & _arg2 | _arg2 & _r3 | _r3 & ~_arg) ? 0x20 : 0;
        cpu.data[95] = _sreg9;
    } else if ((opcode & 0xfc00) === 0x1000) {
        /* CPSE, 0001 00rd dddd rrrr */
        if (cpu.data[(opcode & 0x1f0) >> 4] === cpu.data[opcode & 0xf | (opcode & 0x200) >> 5]) {
            var nextOpcode = cpu.progMem[cpu.pc + 1];
            var skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
            cpu.pc += skipSize;
            cpu.cycles += skipSize;
        }
    } else if ((opcode & 0xfe0f) === 0x940a) {
        /* DEC, 1001 010d dddd 1010 */
        var _value2 = cpu.data[(opcode & 0x1f0) >> 4];
        var _R9 = _value2 - 1;
        cpu.data[(opcode & 0x1f0) >> 4] = _R9;
        var _sreg10 = cpu.data[95] & 0xe1;
        _sreg10 |= _R9 ? 0 : 2;
        _sreg10 |= 128 & _R9 ? 4 : 0;
        _sreg10 |= 128 === _value2 ? 8 : 0;
        _sreg10 |= _sreg10 >> 2 & 1 ^ _sreg10 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg10;
    } else if ((opcode & 0xfc00) === 0x2400) {
        /* EOR, 0010 01rd dddd rrrr */
        var _R10 = cpu.data[(opcode & 0x1f0) >> 4] ^ cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        cpu.data[(opcode & 0x1f0) >> 4] = _R10;
        var _sreg11 = cpu.data[95] & 0xe1;
        _sreg11 |= _R10 ? 0 : 2;
        _sreg11 |= 128 & _R10 ? 4 : 0;
        _sreg11 |= _sreg11 >> 2 & 1 ^ _sreg11 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg11;
    } else if ((opcode & 0xff88) === 0x308) {
        /* FMUL, 0000 0011 0ddd 1rrr */
        var v1 = cpu.data[((opcode & 0x70) >> 4) + 16];
        var v2 = cpu.data[(opcode & 7) + 16];
        var _R11 = v1 * v2 << 1;
        cpu.dataView.setUint16(0, _R11, true);
        cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & _R11 ? 0 : 2) | (v1 * v2 & 0x8000 ? 1 : 0);
        cpu.cycles++;
    } else if ((opcode & 0xff88) === 0x380) {
        /* FMULS, 0000 0011 1ddd 0rrr */
        var _v = cpu.dataView.getInt8(((opcode & 0x70) >> 4) + 16);
        var _v2 = cpu.dataView.getInt8((opcode & 7) + 16);
        var _R12 = _v * _v2 << 1;
        cpu.dataView.setInt16(0, _R12, true);
        cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & _R12 ? 0 : 2) | (_v * _v2 & 0x8000 ? 1 : 0);
        cpu.cycles++;
    } else if ((opcode & 0xff88) === 0x388) {
        /* FMULSU, 0000 0011 1ddd 1rrr */
        var _v3 = cpu.dataView.getInt8(((opcode & 0x70) >> 4) + 16);
        var _v4 = cpu.data[(opcode & 7) + 16];
        var _R13 = _v3 * _v4 << 1;
        cpu.dataView.setInt16(0, _R13, true);
        cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & _R13 ? 2 : 0) | (_v3 * _v4 & 0x8000 ? 1 : 0);
        cpu.cycles++;
    } else if (opcode === 0x9509) {
        /* ICALL, 1001 0101 0000 1001 */
        var retAddr = cpu.pc + 1;
        var _sp = cpu.dataView.getUint16(93, true);
        cpu.data[_sp] = retAddr & 255;
        cpu.data[_sp - 1] = retAddr >> 8 & 255;
        cpu.dataView.setUint16(93, _sp - 2, true);
        cpu.pc = cpu.dataView.getUint16(30, true) - 1;
        cpu.cycles += 2;
    } else if (opcode === 0x9409) {
        /* IJMP, 1001 0100 0000 1001 */
        cpu.pc = cpu.dataView.getUint16(30, true) - 1;
        cpu.cycles++;
    } else if ((opcode & 0xf800) === 0xb000) {
        /* IN, 1011 0AAd dddd AAAA */
        var i = cpu.readData((opcode & 0xf | (opcode & 0x600) >> 5) + 32);
        cpu.data[(opcode & 0x1f0) >> 4] = i;
    } else if ((opcode & 0xfe0f) === 0x9403) {
        /* INC, 1001 010d dddd 0011 */
        var _d5 = cpu.data[(opcode & 0x1f0) >> 4];
        var _r4 = _d5 + 1 & 255;
        cpu.data[(opcode & 0x1f0) >> 4] = _r4;
        var _sreg12 = cpu.data[95] & 0xe1;
        _sreg12 |= _r4 ? 0 : 2;
        _sreg12 |= 128 & _r4 ? 4 : 0;
        _sreg12 |= 127 === _d5 ? 8 : 0;
        _sreg12 |= _sreg12 >> 2 & 1 ^ _sreg12 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg12;
    } else if ((opcode & 0xfe0e) === 0x940c) {
        /* JMP, 1001 010k kkkk 110k kkkk kkkk kkkk kkkk */
        cpu.pc = (cpu.progMem[cpu.pc + 1] | (opcode & 1) << 16 | (opcode & 0x1f0) << 13) - 1;
        cpu.cycles += 2;
    } else if ((opcode & 0xfe0f) === 0x9206) {
        /* LAC, 1001 001r rrrr 0110 */
        var _r5 = (opcode & 0x1f0) >> 4;
        var clear = cpu.data[_r5];
        var _value3 = cpu.readData(cpu.dataView.getUint16(30, true));
        cpu.writeData(cpu.dataView.getUint16(30, true), _value3 & 255 - clear);
        cpu.data[_r5] = _value3;
    } else if ((opcode & 0xfe0f) === 0x9205) {
        /* LAS, 1001 001r rrrr 0101 */
        var _r6 = (opcode & 0x1f0) >> 4;
        var set = cpu.data[_r6];
        var _value4 = cpu.readData(cpu.dataView.getUint16(30, true));
        cpu.writeData(cpu.dataView.getUint16(30, true), _value4 | set);
        cpu.data[_r6] = _value4;
    } else if ((opcode & 0xfe0f) === 0x9207) {
        /* LAT, 1001 001r rrrr 0111 */
        var _r7 = cpu.data[(opcode & 0x1f0) >> 4];
        var _R14 = cpu.readData(cpu.dataView.getUint16(30, true));
        cpu.writeData(cpu.dataView.getUint16(30, true), _r7 ^ _R14);
        cpu.data[(opcode & 0x1f0) >> 4] = _R14;
    } else if ((opcode & 0xf000) === 0xe000) {
        /* LDI, 1110 KKKK dddd KKKK */
        cpu.data[((opcode & 0xf0) >> 4) + 16] = opcode & 0xf | (opcode & 0xf00) >> 4;
    } else if ((opcode & 0xfe0f) === 0x9000) {
        /* LDS, 1001 000d dddd 0000 kkkk kkkk kkkk kkkk */
        var _value5 = cpu.readData(cpu.progMem[cpu.pc + 1]);
        cpu.data[(opcode & 0x1f0) >> 4] = _value5;
        cpu.pc++;
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x900c) {
        /* LDX, 1001 000d dddd 1100 */
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(26, true));
    } else if ((opcode & 0xfe0f) === 0x900d) {
        /* LDX(INC), 1001 000d dddd 1101 */
        var x = cpu.dataView.getUint16(26, true);
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(x);
        cpu.dataView.setUint16(26, x + 1, true);
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x900e) {
        /* LDX(DEC), 1001 000d dddd 1110 */
        var _x = cpu.dataView.getUint16(26, true) - 1;
        cpu.dataView.setUint16(26, _x, true);
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(_x);
        cpu.cycles += 2;
    } else if ((opcode & 0xfe0f) === 0x8008) {
        /* LDY, 1000 000d dddd 1000 */
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(28, true));
    } else if ((opcode & 0xfe0f) === 0x9009) {
        /* LDY(INC), 1001 000d dddd 1001 */
        var y = cpu.dataView.getUint16(28, true);
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(y);
        cpu.dataView.setUint16(28, y + 1, true);
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x900a) {
        /* LDY(DEC), 1001 000d dddd 1010 */
        var _y = cpu.dataView.getUint16(28, true) - 1;
        cpu.dataView.setUint16(28, _y, true);
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(_y);
        cpu.cycles += 2;
    } else if ((opcode & 0xd208) === 0x8008 && opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8) {
        /* LDDY, 10q0 qq0d dddd 1qqq */
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(28, true) + (opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8));
        cpu.cycles += 2;
    } else if ((opcode & 0xfe0f) === 0x8000) {
        /* LDZ, 1000 000d dddd 0000 */
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(30, true));
    } else if ((opcode & 0xfe0f) === 0x9001) {
        /* LDZ(INC), 1001 000d dddd 0001 */
        var z = cpu.dataView.getUint16(30, true);
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(z);
        cpu.dataView.setUint16(30, z + 1, true);
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x9002) {
        /* LDZ(DEC), 1001 000d dddd 0010 */
        var _z = cpu.dataView.getUint16(30, true) - 1;
        cpu.dataView.setUint16(30, _z, true);
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(_z);
        cpu.cycles += 2;
    } else if ((opcode & 0xd208) === 0x8000 && opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8) {
        /* LDDZ, 10q0 qq0d dddd 0qqq */
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(30, true) + (opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8));
        cpu.cycles += 2;
    } else if (opcode === 0x95c8) {
        /* LPM, 1001 0101 1100 1000 */
        cpu.data[0] = cpu.progBytes[cpu.dataView.getUint16(30, true)];
        cpu.cycles += 2;
    } else if ((opcode & 0xfe0f) === 0x9004) {
        /* LPM(REG), 1001 000d dddd 0100 */
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.progBytes[cpu.dataView.getUint16(30, true)];
        cpu.cycles += 2;
    } else if ((opcode & 0xfe0f) === 0x9005) {
        /* LPM(INC), 1001 000d dddd 0101 */
        var _i = cpu.dataView.getUint16(30, true);
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.progBytes[_i];
        cpu.dataView.setUint16(30, _i + 1, true);
        cpu.cycles += 2;
    } else if ((opcode & 0xfe0f) === 0x9406) {
        /* LSR, 1001 010d dddd 0110 */
        var _value6 = cpu.data[(opcode & 0x1f0) >> 4];
        var _R15 = _value6 >>> 1;
        cpu.data[(opcode & 0x1f0) >> 4] = _R15;
        var _sreg13 = cpu.data[95] & 0xe0;
        _sreg13 |= _R15 ? 0 : 2;
        _sreg13 |= _value6 & 1;
        _sreg13 |= _sreg13 >> 2 & 1 ^ _sreg13 & 1 ? 8 : 0;
        _sreg13 |= _sreg13 >> 2 & 1 ^ _sreg13 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg13;
    } else if ((opcode & 0xfc00) === 0x2c00) {
        /* MOV, 0010 11rd dddd rrrr */
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    } else if ((opcode & 0xff00) === 0x100) {
        /* MOVW, 0000 0001 dddd rrrr */
        var r2 = 2 * (opcode & 0xf);
        var d2 = 2 * ((opcode & 0xf0) >> 4);
        cpu.data[d2] = cpu.data[r2];
        cpu.data[d2 + 1] = cpu.data[r2 + 1];
    } else if ((opcode & 0xfc00) === 0x9c00) {
        /* MUL, 1001 11rd dddd rrrr */
        var _R16 = cpu.data[(opcode & 0x1f0) >> 4] * cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        cpu.dataView.setUint16(0, _R16, true);
        cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & _R16 ? 0 : 2) | (0x8000 & _R16 ? 1 : 0);
        cpu.cycles++;
    } else if ((opcode & 0xff00) === 0x200) {
        /* MULS, 0000 0010 dddd rrrr */
        var _R17 = cpu.dataView.getInt8(((opcode & 0xf0) >> 4) + 16) * cpu.dataView.getInt8((opcode & 0xf) + 16);
        cpu.dataView.setInt16(0, _R17, true);
        cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & _R17 ? 0 : 2) | (0x8000 & _R17 ? 1 : 0);
        cpu.cycles++;
    } else if ((opcode & 0xff88) === 0x300) {
        /* MULSU, 0000 0011 0ddd 0rrr */
        var _R18 = cpu.dataView.getInt8(((opcode & 0x70) >> 4) + 16) * cpu.data[(opcode & 7) + 16];
        cpu.dataView.setInt16(0, _R18, true);
        cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & _R18 ? 0 : 2) | (0x8000 & _R18 ? 1 : 0);
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x9401) {
        /* NEG, 1001 010d dddd 0001 */
        var _d6 = (opcode & 0x1f0) >> 4;
        var _value7 = cpu.data[_d6];
        var _R19 = 0 - _value7;
        cpu.data[_d6] = _R19;
        var _sreg14 = cpu.data[95] & 0xc0;
        _sreg14 |= _R19 ? 0 : 2;
        _sreg14 |= 128 & _R19 ? 4 : 0;
        _sreg14 |= 128 === _R19 ? 8 : 0;
        _sreg14 |= _sreg14 >> 2 & 1 ^ _sreg14 >> 3 & 1 ? 0x10 : 0;
        _sreg14 |= _R19 ? 1 : 0;
        _sreg14 |= 1 & (_R19 | _value7) ? 0x20 : 0;
        cpu.data[95] = _sreg14;
    } else if (opcode === 0) {
        /* NOP, 0000 0000 0000 0000 */
        /* NOP */
    } else if ((opcode & 0xfc00) === 0x2800) {
        /* OR, 0010 10rd dddd rrrr */
        var _R20 = cpu.data[(opcode & 0x1f0) >> 4] | cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        cpu.data[(opcode & 0x1f0) >> 4] = _R20;
        var _sreg15 = cpu.data[95] & 0xe1;
        _sreg15 |= _R20 ? 0 : 2;
        _sreg15 |= 128 & _R20 ? 4 : 0;
        _sreg15 |= _sreg15 >> 2 & 1 ^ _sreg15 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg15;
    } else if ((opcode & 0xf000) === 0x6000) {
        /* SBR, 0110 KKKK dddd KKKK */
        var _R21 = cpu.data[((opcode & 0xf0) >> 4) + 16] | (opcode & 0xf | (opcode & 0xf00) >> 4);
        cpu.data[((opcode & 0xf0) >> 4) + 16] = _R21;
        var _sreg16 = cpu.data[95] & 0xe1;
        _sreg16 |= _R21 ? 0 : 2;
        _sreg16 |= 128 & _R21 ? 4 : 0;
        _sreg16 |= _sreg16 >> 2 & 1 ^ _sreg16 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg16;
    } else if ((opcode & 0xf800) === 0xb800) {
        /* OUT, 1011 1AAr rrrr AAAA */
        cpu.writeData((opcode & 0xf | (opcode & 0x600) >> 5) + 32, cpu.data[(opcode & 0x1f0) >> 4]);
    } else if ((opcode & 0xfe0f) === 0x900f) {
        /* POP, 1001 000d dddd 1111 */
        var _value8 = cpu.dataView.getUint16(93, true) + 1;
        cpu.dataView.setUint16(93, _value8, true);
        cpu.data[(opcode & 0x1f0) >> 4] = cpu.data[_value8];
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x920f) {
        /* PUSH, 1001 001d dddd 1111 */
        var _value9 = cpu.dataView.getUint16(93, true);
        cpu.data[_value9] = cpu.data[(opcode & 0x1f0) >> 4];
        cpu.dataView.setUint16(93, _value9 - 1, true);
        cpu.cycles++;
    } else if ((opcode & 0xf000) === 0xd000) {
        /* RCALL, 1101 kkkk kkkk kkkk */
        var _k = (opcode & 0x7ff) - (opcode & 0x800 ? 0x800 : 0);
        var _retAddr = cpu.pc + 1;
        var _sp2 = cpu.dataView.getUint16(93, true);
        cpu.data[_sp2] = 255 & _retAddr;
        cpu.data[_sp2 - 1] = _retAddr >> 8 & 255;
        cpu.dataView.setUint16(93, _sp2 - 2, true);
        cpu.pc += _k;
        cpu.cycles += 3;
    } else if (opcode === 0x9508) {
        /* RET, 1001 0101 0000 1000 */
        var _i2 = cpu.dataView.getUint16(93, true) + 2;
        cpu.dataView.setUint16(93, _i2, true);
        cpu.pc = (cpu.data[_i2 - 1] << 8) + cpu.data[_i2] - 1;
        cpu.cycles += 4;
    } else if (opcode === 0x9518) {
        /* RETI, 1001 0101 0001 1000 */
        var _i3 = cpu.dataView.getUint16(93, true) + 2;
        cpu.dataView.setUint16(93, _i3, true);
        cpu.pc = (cpu.data[_i3 - 1] << 8) + cpu.data[_i3] - 1;
        cpu.cycles += 4;
        cpu.data[95] |= 0x80; // Enable interrupts
    } else if ((opcode & 0xf000) === 0xc000) {
        /* RJMP, 1100 kkkk kkkk kkkk */
        cpu.pc = cpu.pc + ((opcode & 0x7ff) - (opcode & 0x800 ? 0x800 : 0));
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x9407) {
        /* ROR, 1001 010d dddd 0111 */
        var _d7 = cpu.data[(opcode & 0x1f0) >> 4];
        var _r8 = _d7 >>> 1 | (cpu.data[95] & 1) << 7;
        cpu.data[(opcode & 0x1f0) >> 4] = _r8;
        var _sreg17 = cpu.data[95] & 0xe0;
        _sreg17 |= _r8 ? 0 : 2;
        _sreg17 |= 128 & _r8 ? 4 : 0;
        _sreg17 |= 1 & _d7 ? 1 : 0;
        _sreg17 |= _sreg17 >> 2 & 1 ^ _sreg17 & 1 ? 8 : 0;
        _sreg17 |= _sreg17 >> 2 & 1 ^ _sreg17 >> 3 & 1 ? 0x10 : 0;
        cpu.data[95] = _sreg17;
    } else if ((opcode & 0xfc00) === 0x800) {
        /* SBC, 0000 10rd dddd rrrr */
        var _val = cpu.data[(opcode & 0x1f0) >> 4];
        var _val2 = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        var _sreg18 = cpu.data[95];
        var _R22 = _val - _val2 - (_sreg18 & 1);
        cpu.data[(opcode & 0x1f0) >> 4] = _R22;
        _sreg18 = _sreg18 & 0xc0 | (!_R22 && _sreg18 >> 1 & 1 ? 2 : 0) | (_val2 + (_sreg18 & 1) > _val ? 1 : 0);
        _sreg18 |= 128 & _R22 ? 4 : 0;
        _sreg18 |= (_val ^ _val2) & (_val ^ _R22) & 128 ? 8 : 0;
        _sreg18 |= _sreg18 >> 2 & 1 ^ _sreg18 >> 3 & 1 ? 0x10 : 0;
        _sreg18 |= 1 & (~_val & _val2 | _val2 & _R22 | _R22 & ~_val) ? 0x20 : 0;
        cpu.data[95] = _sreg18;
    } else if ((opcode & 0xf000) === 0x4000) {
        /* SBCI, 0100 KKKK dddd KKKK */
        var _val3 = cpu.data[((opcode & 0xf0) >> 4) + 16];
        var _val4 = opcode & 0xf | (opcode & 0xf00) >> 4;
        var _sreg19 = cpu.data[95];
        var _R23 = _val3 - _val4 - (_sreg19 & 1);
        cpu.data[((opcode & 0xf0) >> 4) + 16] = _R23;
        _sreg19 = _sreg19 & 0xc0 | (!_R23 && _sreg19 >> 1 & 1 ? 2 : 0) | (_val4 + (_sreg19 & 1) > _val3 ? 1 : 0);
        _sreg19 |= 128 & _R23 ? 4 : 0;
        _sreg19 |= (_val3 ^ _val4) & (_val3 ^ _R23) & 128 ? 8 : 0;
        _sreg19 |= _sreg19 >> 2 & 1 ^ _sreg19 >> 3 & 1 ? 0x10 : 0;
        _sreg19 |= 1 & (~_val3 & _val4 | _val4 & _R23 | _R23 & ~_val3) ? 0x20 : 0;
        cpu.data[95] = _sreg19;
    } else if ((opcode & 0xff00) === 0x9a00) {
        /* SBI, 1001 1010 AAAA Abbb */
        var target = ((opcode & 0xf8) >> 3) + 32;
        cpu.writeData(target, cpu.readData(target) | 1 << (opcode & 7));
        cpu.cycles++;
    } else if ((opcode & 0xff00) === 0x9900) {
        /* SBIC, 1001 1001 AAAA Abbb */
        var _value10 = cpu.readData(((opcode & 0xf8) >> 3) + 32);
        if (!(_value10 & 1 << (opcode & 7))) {
            var _nextOpcode = cpu.progMem[cpu.pc + 1];
            var _skipSize = isTwoWordInstruction(_nextOpcode) ? 2 : 1;
            cpu.cycles += _skipSize;
            cpu.pc += _skipSize;
        }
    } else if ((opcode & 0xff00) === 0x9b00) {
        /* SBIS, 1001 1011 AAAA Abbb */
        var _value11 = cpu.readData(((opcode & 0xf8) >> 3) + 32);
        if (_value11 & 1 << (opcode & 7)) {
            var _nextOpcode2 = cpu.progMem[cpu.pc + 1];
            var _skipSize2 = isTwoWordInstruction(_nextOpcode2) ? 2 : 1;
            cpu.cycles += _skipSize2;
            cpu.pc += _skipSize2;
        }
    } else if ((opcode & 0xff00) === 0x9700) {
        /* SBIW, 1001 0111 KKdd KKKK */
        var _i4 = 2 * ((opcode & 0x30) >> 4) + 24;
        var a = cpu.dataView.getUint16(_i4, true);
        var l = opcode & 0xf | (opcode & 0xc0) >> 2;
        var _R24 = a - l;
        cpu.dataView.setUint16(_i4, _R24, true);
        var _sreg20 = cpu.data[95] & 0xc0;
        _sreg20 |= _R24 ? 0 : 2;
        _sreg20 |= 0x8000 & _R24 ? 4 : 0;
        _sreg20 |= a & ~_R24 & 0x8000 ? 8 : 0;
        _sreg20 |= _sreg20 >> 2 & 1 ^ _sreg20 >> 3 & 1 ? 0x10 : 0;
        _sreg20 |= l > a ? 1 : 0;
        _sreg20 |= 1 & (~a & l | l & _R24 | _R24 & ~a) ? 0x20 : 0;
        cpu.data[95] = _sreg20;
        cpu.cycles++;
    } else if ((opcode & 0xfe08) === 0xfc00) {
        /* SBRC, 1111 110r rrrr 0bbb */
        if (!(cpu.data[(opcode & 0x1f0) >> 4] & 1 << (opcode & 7))) {
            var _nextOpcode3 = cpu.progMem[cpu.pc + 1];
            var _skipSize3 = isTwoWordInstruction(_nextOpcode3) ? 2 : 1;
            cpu.cycles += _skipSize3;
            cpu.pc += _skipSize3;
        }
    } else if ((opcode & 0xfe08) === 0xfe00) {
        /* SBRS, 1111 111r rrrr 0bbb */
        if (cpu.data[(opcode & 0x1f0) >> 4] & 1 << (opcode & 7)) {
            var _nextOpcode4 = cpu.progMem[cpu.pc + 1];
            var _skipSize4 = isTwoWordInstruction(_nextOpcode4) ? 2 : 1;
            cpu.cycles += _skipSize4;
            cpu.pc += _skipSize4;
        }
    } else if (opcode === 0x9588) {
        /* SLEEP, 1001 0101 1000 1000 */
        /* not implemented */
    } else if (opcode === 0x95e8) {
        /* SPM, 1001 0101 1110 1000 */
        /* not implemented */
    } else if (opcode === 0x95f8) {
        /* SPM(INC), 1001 0101 1111 1000 */
        /* not implemented */
    } else if ((opcode & 0xfe0f) === 0x9200) {
        /* STS, 1001 001d dddd 0000 kkkk kkkk kkkk kkkk */
        var _value12 = cpu.data[(opcode & 0x1f0) >> 4];
        var _addr = cpu.progMem[cpu.pc + 1];
        cpu.writeData(_addr, _value12);
        cpu.pc++;
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x920c) {
        /* STX, 1001 001r rrrr 1100 */
        cpu.writeData(cpu.dataView.getUint16(26, true), cpu.data[(opcode & 0x1f0) >> 4]);
    } else if ((opcode & 0xfe0f) === 0x920d) {
        /* STX(INC), 1001 001r rrrr 1101 */
        var _x2 = cpu.dataView.getUint16(26, true);
        cpu.writeData(_x2, cpu.data[(opcode & 0x1f0) >> 4]);
        cpu.dataView.setUint16(26, _x2 + 1, true);
    } else if ((opcode & 0xfe0f) === 0x920e) {
        /* STX(DEC), 1001 001r rrrr 1110 */
        var _i5 = cpu.data[(opcode & 0x1f0) >> 4];
        var _x3 = cpu.dataView.getUint16(26, true) - 1;
        cpu.dataView.setUint16(26, _x3, true);
        cpu.writeData(_x3, _i5);
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x8208) {
        /* STY, 1000 001r rrrr 1000 */
        cpu.writeData(cpu.dataView.getUint16(28, true), cpu.data[(opcode & 0x1f0) >> 4]);
    } else if ((opcode & 0xfe0f) === 0x9209) {
        /* STY(INC), 1001 001r rrrr 1001 */
        var _i6 = cpu.data[(opcode & 0x1f0) >> 4];
        var _y2 = cpu.dataView.getUint16(28, true);
        cpu.writeData(_y2, _i6);
        cpu.dataView.setUint16(28, _y2 + 1, true);
    } else if ((opcode & 0xfe0f) === 0x920a) {
        /* STY(DEC), 1001 001r rrrr 1010 */
        var _i7 = cpu.data[(opcode & 0x1f0) >> 4];
        var _y3 = cpu.dataView.getUint16(28, true) - 1;
        cpu.dataView.setUint16(28, _y3, true);
        cpu.writeData(_y3, _i7);
        cpu.cycles++;
    } else if ((opcode & 0xd208) === 0x8208 && opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8) {
        /* STDY, 10q0 qq1r rrrr 1qqq */
        cpu.writeData(cpu.dataView.getUint16(28, true) + (opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8), cpu.data[(opcode & 0x1f0) >> 4]);
        cpu.cycles++;
    } else if ((opcode & 0xfe0f) === 0x8200) {
        /* STZ, 1000 001r rrrr 0000 */
        cpu.writeData(cpu.dataView.getUint16(30, true), cpu.data[(opcode & 0x1f0) >> 4]);
    } else if ((opcode & 0xfe0f) === 0x9201) {
        /* STZ(INC), 1001 001r rrrr 0001 */
        var _z2 = cpu.dataView.getUint16(30, true);
        cpu.writeData(_z2, cpu.data[(opcode & 0x1f0) >> 4]);
        cpu.dataView.setUint16(30, _z2 + 1, true);
    } else if ((opcode & 0xfe0f) === 0x9202) {
        /* STZ(DEC), 1001 001r rrrr 0010 */
        var _i8 = cpu.data[(opcode & 0x1f0) >> 4];
        var _z3 = cpu.dataView.getUint16(30, true) - 1;
        cpu.dataView.setUint16(30, _z3, true);
        cpu.writeData(_z3, _i8);
        cpu.cycles++;
    } else if ((opcode & 0xd208) === 0x8200 && opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8) {
        /* STDZ, 10q0 qq1r rrrr 0qqq */
        cpu.writeData(cpu.dataView.getUint16(30, true) + (opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8), cpu.data[(opcode & 0x1f0) >> 4]);
        cpu.cycles++;
    } else if ((opcode & 0xfc00) === 0x1800) {
        /* SUB, 0001 10rd dddd rrrr */
        var _val5 = cpu.data[(opcode & 0x1f0) >> 4];
        var _val6 = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
        var _R25 = _val5 - _val6;
        cpu.data[(opcode & 0x1f0) >> 4] = _R25;
        var _sreg21 = cpu.data[95] & 0xc0;
        _sreg21 |= _R25 ? 0 : 2;
        _sreg21 |= 128 & _R25 ? 4 : 0;
        _sreg21 |= (_val5 ^ _val6) & (_val5 ^ _R25) & 128 ? 8 : 0;
        _sreg21 |= _sreg21 >> 2 & 1 ^ _sreg21 >> 3 & 1 ? 0x10 : 0;
        _sreg21 |= _val6 > _val5 ? 1 : 0;
        _sreg21 |= 1 & (~_val5 & _val6 | _val6 & _R25 | _R25 & ~_val5) ? 0x20 : 0;
        cpu.data[95] = _sreg21;
    } else if ((opcode & 0xf000) === 0x5000) {
        /* SUBI, 0101 KKKK dddd KKKK */
        var _val7 = cpu.data[((opcode & 0xf0) >> 4) + 16];
        var _val8 = opcode & 0xf | (opcode & 0xf00) >> 4;
        var _R26 = _val7 - _val8;
        cpu.data[((opcode & 0xf0) >> 4) + 16] = _R26;
        var _sreg22 = cpu.data[95] & 0xc0;
        _sreg22 |= _R26 ? 0 : 2;
        _sreg22 |= 128 & _R26 ? 4 : 0;
        _sreg22 |= (_val7 ^ _val8) & (_val7 ^ _R26) & 128 ? 8 : 0;
        _sreg22 |= _sreg22 >> 2 & 1 ^ _sreg22 >> 3 & 1 ? 0x10 : 0;
        _sreg22 |= _val8 > _val7 ? 1 : 0;
        _sreg22 |= 1 & (~_val7 & _val8 | _val8 & _R26 | _R26 & ~_val7) ? 0x20 : 0;
        cpu.data[95] = _sreg22;
    } else if ((opcode & 0xfe0f) === 0x9402) {
        /* SWAP, 1001 010d dddd 0010 */
        var _d8 = (opcode & 0x1f0) >> 4;
        var _i9 = cpu.data[_d8];
        cpu.data[_d8] = (15 & _i9) << 4 | (240 & _i9) >>> 4;
    } else if (opcode === 0x95a8) {
        /* WDR, 1001 0101 1010 1000 */
        /* not implemented */
    } else if ((opcode & 0xfe0f) === 0x9204) {
        /* XCH, 1001 001r rrrr 0100 */
        var _r9 = (opcode & 0x1f0) >> 4;
        var _val9 = cpu.data[_r9];
        var _val10 = cpu.data[cpu.dataView.getUint16(30, true)];
        cpu.data[cpu.dataView.getUint16(30, true)] = _val9;
        cpu.data[_r9] = _val10;
    }
    cpu.pc = (cpu.pc + 1) % cpu.progMem.length;
    cpu.cycles++;
}
},{}],"../node_modules/avr8js/dist/esm/cpu/interrupt.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.avrInterrupt = avrInterrupt;
/**
 * AVR-8 Interrupt Handling
 * Part of AVR8js
 * Reference: http://ww1.microchip.com/downloads/en/devicedoc/atmel-0856-avr-instruction-set-manual.pdf
 *
 * Copyright (C) 2019, Uri Shaked
 */
function avrInterrupt(cpu, addr) {
    var sp = cpu.dataView.getUint16(93, true);
    cpu.data[sp] = cpu.pc & 0xff;
    cpu.data[sp - 1] = cpu.pc >> 8 & 0xff;
    cpu.dataView.setUint16(93, sp - 2, true);
    cpu.data[95] &= 0x7f; // clear global interrupt flag
    cpu.cycles += 2;
    cpu.pc = addr;
}
},{}],"../node_modules/avr8js/dist/esm/peripherals/timer.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AVRTimer = exports.timer2Config = exports.timer1Config = exports.timer0Config = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _interrupt = require('../cpu/interrupt');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * AVR-8 Timers
                                                                                                                                                           * Part of AVR8js
                                                                                                                                                           * Reference: http://ww1.microchip.com/downloads/en/DeviceDoc/ATmega48A-PA-88A-PA-168A-PA-328-P-DS-DS40002061A.pdf
                                                                                                                                                           *
                                                                                                                                                           * Copyright (C) 2019, Uri Shaked
                                                                                                                                                           */


var timer01Dividers = {
    0: 0,
    1: 1,
    2: 8,
    3: 64,
    4: 256,
    5: 1024,
    6: 0,
    7: 0 // TODO: External clock source on T0 pin. Clock on rising edge.
};
var WGM_NORMAL = 0;
var WGM_PWM_PHASE_CORRECT = 1;
var WGM_CTC = 2;
var WGM_FASTPWM = 3;
var TOV = 1;
var OCFA = 2;
var OCFB = 4;
var TOIE = 1;
var OCIEA = 2;
var OCIEB = 4;
var timer0Config = exports.timer0Config = {
    bits: 8,
    captureInterrupt: 0,
    compAInterrupt: 0x1c,
    compBInterrupt: 0x1e,
    ovfInterrupt: 0x20,
    TIFR: 0x35,
    OCRA: 0x47,
    OCRB: 0x48,
    ICR: 0,
    TCNT: 0x46,
    TCCRA: 0x44,
    TCCRB: 0x45,
    TCCRC: 0,
    TIMSK: 0x6e,
    dividers: timer01Dividers
};
var timer1Config = exports.timer1Config = {
    bits: 16,
    captureInterrupt: 0x14,
    compAInterrupt: 0x16,
    compBInterrupt: 0x18,
    ovfInterrupt: 0x1a,
    TIFR: 0x36,
    OCRA: 0x88,
    OCRB: 0x8a,
    ICR: 0x86,
    TCNT: 0x84,
    TCCRA: 0x80,
    TCCRB: 0x81,
    TCCRC: 0x82,
    TIMSK: 0x6f,
    dividers: timer01Dividers
};
var timer2Config = exports.timer2Config = {
    bits: 8,
    captureInterrupt: 0,
    compAInterrupt: 0x0e,
    compBInterrupt: 0x10,
    ovfInterrupt: 0x12,
    TIFR: 0x37,
    OCRA: 0xb3,
    OCRB: 0xb4,
    ICR: 0,
    TCNT: 0xb2,
    TCCRA: 0xb0,
    TCCRB: 0xb1,
    TCCRC: 0,
    TIMSK: 0x70,
    dividers: {
        0: 1,
        1: 1,
        2: 8,
        3: 32,
        4: 64,
        5: 128,
        6: 256,
        7: 1024
    }
};

var AVRTimer = exports.AVRTimer = function () {
    function AVRTimer(cpu, config) {
        var _this = this;

        _classCallCheck(this, AVRTimer);

        this.cpu = cpu;
        this.config = config;
        this.mask = (1 << this.config.bits) - 1;
        this.lastCycle = 0;
        this.ocrA = 0;
        this.ocrB = 0;
        cpu.writeHooks[config.TCNT] = function (value) {
            _this.TCNT = value;
            _this.timerUpdated(value);
            return true;
        };
        cpu.writeHooks[config.OCRA] = function (value) {
            // TODO implement buffering when timer running in PWM mode
            _this.ocrA = value;
        };
        cpu.writeHooks[config.OCRB] = function (value) {
            _this.ocrB = value;
        };
    }

    _createClass(AVRTimer, [{
        key: 'reset',
        value: function reset() {
            this.lastCycle = 0;
            this.ocrA = 0;
            this.ocrB = 0;
        }
    }, {
        key: 'tick',
        value: function tick() {
            var divider = this.config.dividers[this.CS];
            var delta = this.cpu.cycles - this.lastCycle;
            if (divider && delta >= divider) {
                var counterDelta = Math.floor(delta / divider);
                this.lastCycle += counterDelta * divider;
                var val = this.TCNT;
                var newVal = val + counterDelta & this.mask;
                this.TCNT = newVal;
                this.timerUpdated(newVal);
                if ((this.WGM === WGM_NORMAL || this.WGM === WGM_PWM_PHASE_CORRECT || this.WGM === WGM_FASTPWM) && val > newVal) {
                    this.TIFR |= TOV;
                }
            }
            if (this.cpu.interruptsEnabled) {
                if (this.TIFR & TOV && this.TIMSK & TOIE) {
                    (0, _interrupt.avrInterrupt)(this.cpu, this.config.ovfInterrupt);
                    this.TIFR &= ~TOV;
                }
                if (this.TIFR & OCFA && this.TIMSK & OCIEA) {
                    (0, _interrupt.avrInterrupt)(this.cpu, this.config.compAInterrupt);
                    this.TIFR &= ~OCFA;
                }
                if (this.TIFR & OCFB && this.TIMSK & OCIEB) {
                    (0, _interrupt.avrInterrupt)(this.cpu, this.config.compBInterrupt);
                    this.TIFR &= ~OCFB;
                }
            }
        }
    }, {
        key: 'timerUpdated',
        value: function timerUpdated(value) {
            if (this.ocrA && value === this.ocrA) {
                this.TIFR |= OCFA;
                if (this.WGM === WGM_CTC) {
                    // Clear Timer on Compare Match (CTC) Mode
                    this.TCNT = 0;
                    this.TIFR |= TOV;
                }
            }
            if (this.ocrB && value === this.ocrB) {
                this.TIFR |= OCFB;
            }
        }
    }, {
        key: 'TIFR',
        get: function get() {
            return this.cpu.data[this.config.TIFR];
        },
        set: function set(value) {
            this.cpu.data[this.config.TIFR] = value;
        }
    }, {
        key: 'TCNT',
        get: function get() {
            return this.cpu.data[this.config.TCNT];
        },
        set: function set(value) {
            this.cpu.data[this.config.TCNT] = value;
        }
    }, {
        key: 'TCCRA',
        get: function get() {
            return this.cpu.data[this.config.TCCRA];
        }
    }, {
        key: 'TCCRB',
        get: function get() {
            return this.cpu.data[this.config.TCCRB];
        }
    }, {
        key: 'TIMSK',
        get: function get() {
            return this.cpu.data[this.config.TIMSK];
        }
    }, {
        key: 'CS',
        get: function get() {
            return this.TCCRB & 0x7;
        }
    }, {
        key: 'WGM',
        get: function get() {
            return (this.TCCRB & 0x8) >> 1 | this.TCCRA & 0x3;
        }
    }]);

    return AVRTimer;
}();
},{"../cpu/interrupt":"../node_modules/avr8js/dist/esm/cpu/interrupt.js"}],"../node_modules/avr8js/dist/esm/peripherals/gpio.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var portAConfig = exports.portAConfig = {
    PIN: 0x20,
    DDR: 0x21,
    PORT: 0x22
};
var portBConfig = exports.portBConfig = {
    PIN: 0x23,
    DDR: 0x24,
    PORT: 0x25
};
var portCConfig = exports.portCConfig = {
    PIN: 0x26,
    DDR: 0x27,
    PORT: 0x28
};
var portDConfig = exports.portDConfig = {
    PIN: 0x29,
    DDR: 0x2a,
    PORT: 0x2b
};
var portEConfig = exports.portEConfig = {
    PIN: 0x2c,
    DDR: 0x2d,
    PORT: 0x2e
};
var portFConfig = exports.portFConfig = {
    PIN: 0x2f,
    DDR: 0x30,
    PORT: 0x31
};
var portGConfig = exports.portGConfig = {
    PIN: 0x32,
    DDR: 0x33,
    PORT: 0x34
};
var portHConfig = exports.portHConfig = {
    PIN: 0x100,
    DDR: 0x101,
    PORT: 0x102
};
var portJConfig = exports.portJConfig = {
    PIN: 0x103,
    DDR: 0x104,
    PORT: 0x105
};
var portKConfig = exports.portKConfig = {
    PIN: 0x106,
    DDR: 0x107,
    PORT: 0x108
};
var portLConfig = exports.portLConfig = {
    PIN: 0x109,
    DDR: 0x10a,
    PORT: 0x10b
};
var PinState = exports.PinState = undefined;
(function (PinState) {
    PinState[PinState["Low"] = 0] = "Low";
    PinState[PinState["High"] = 1] = "High";
    PinState[PinState["Input"] = 2] = "Input";
    PinState[PinState["InputPullUp"] = 3] = "InputPullUp";
})(PinState || (exports.PinState = PinState = {}));

var AVRIOPort = exports.AVRIOPort = function () {
    function AVRIOPort(cpu, portConfig) {
        var _this = this;

        _classCallCheck(this, AVRIOPort);

        this.cpu = cpu;
        this.portConfig = portConfig;
        this.listeners = [];
        cpu.writeHooks[portConfig.DDR] = function (value, oldValue) {
            var portValue = cpu.data[portConfig.PORT];
            _this.writeGpio(value & portValue, oldValue & oldValue);
        };
        cpu.writeHooks[portConfig.PORT] = function (value, oldValue) {
            var ddrMask = cpu.data[portConfig.DDR];
            cpu.data[portConfig.PORT] = value;
            value &= ddrMask;
            cpu.data[portConfig.PIN] = cpu.data[portConfig.PIN] & ~ddrMask | value;
            _this.writeGpio(value, oldValue & ddrMask);
            return true;
        };
        cpu.writeHooks[portConfig.PIN] = function (value) {
            // Writing to 1 PIN toggles PORT bits
            var oldPortValue = cpu.data[portConfig.PORT];
            var ddrMask = cpu.data[portConfig.DDR];
            var portValue = oldPortValue ^ value;
            cpu.data[portConfig.PORT] = portValue;
            cpu.data[portConfig.PIN] = cpu.data[portConfig.PIN] & ~ddrMask | portValue & ddrMask;
            _this.writeGpio(portValue & ddrMask, oldPortValue & ddrMask);
            return true;
        };
    }

    _createClass(AVRIOPort, [{
        key: "addListener",
        value: function addListener(listener) {
            this.listeners.push(listener);
        }
    }, {
        key: "removeListener",
        value: function removeListener(listener) {
            this.listeners = this.listeners.filter(function (l) {
                return l !== listener;
            });
        }
        /**
         * Get the state of a given GPIO pin
         *
         * @param index Pin index to return from 0 to 7
         * @returns PinState.Low or PinState.High if the pin is set to output, PinState.Input if the pin is set
         *   to input, and PinState.InputPullUp if the pin is set to input and the internal pull-up resistor has
         *   been enabled.
         */

    }, {
        key: "pinState",
        value: function pinState(index) {
            var ddr = this.cpu.data[this.portConfig.DDR];
            var port = this.cpu.data[this.portConfig.PORT];
            var bitMask = 1 << index;
            if (ddr & bitMask) {
                return port & bitMask ? PinState.High : PinState.Low;
            } else {
                return port & bitMask ? PinState.InputPullUp : PinState.Input;
            }
        }
    }, {
        key: "writeGpio",
        value: function writeGpio(value, oldValue) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var listener = _step.value;

                    listener(value, oldValue);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }]);

    return AVRIOPort;
}();
},{}],"../node_modules/avr8js/dist/esm/peripherals/usart.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AVRUSART = exports.usart0Config = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _interrupt = require('../cpu/interrupt');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var usart0Config = exports.usart0Config = {
    rxCompleteInterrupt: 0x24,
    dataRegisterEmptyInterrupt: 0x26,
    txCompleteInterrupt: 0x28,
    UCSRA: 0xc0,
    UCSRB: 0xc1,
    UCSRC: 0xc2,
    UBRRL: 0xc4,
    UBRRH: 0xc5,
    UDR: 0xc6
};
/* eslint-disable @typescript-eslint/no-unused-vars */
// Register bits:
var UCSRA_RXC = 0x80; // USART Receive Complete
var UCSRA_TXC = 0x40; // USART Transmit Complete
var UCSRA_UDRE = 0x20; // USART Data Register Empty
var UCSRA_FE = 0x10; // Frame Error
var UCSRA_DOR = 0x8; // Data OverRun
var UCSRA_UPE = 0x4; // USART Parity Error
var UCSRA_U2X = 0x2; // Double the USART Transmission Speed
var UCSRA_MPCM = 0x1; // Multi-processor Communication Mode
var UCSRB_RXCIE = 0x80; // RX Complete Interrupt Enable
var UCSRB_TXCIE = 0x40; // TX Complete Interrupt Enable
var UCSRB_UDRIE = 0x20; // USART Data Register Empty Interrupt Enable
var UCSRB_RXEN = 0x10; // Receiver Enable
var UCSRB_TXEN = 0x8; // Transmitter Enable
var UCSRB_UCSZ2 = 0x4; // Character Size 2
var UCSRB_RXB8 = 0x2; // Receive Data Bit 8
var UCSRB_TXB8 = 0x1; // Transmit Data Bit 8
var UCSRC_UMSEL1 = 0x80; // USART Mode Select 1
var UCSRC_UMSEL0 = 0x40; // USART Mode Select 0
var UCSRC_UPM1 = 0x20; // Parity Mode 1
var UCSRC_UPM0 = 0x10; // Parity Mode 0
var UCSRC_USBS = 0x8; // Stop Bit Select
var UCSRC_UCSZ1 = 0x4; // Character Size 1
var UCSRC_UCSZ0 = 0x2; // Character Size 0
var UCSRC_UCPOL = 0x1; // Clock Polarity
/* eslint-enable @typescript-eslint/no-unused-vars */

var AVRUSART = exports.AVRUSART = function () {
    function AVRUSART(cpu, config, freqMHz) {
        var _this = this;

        _classCallCheck(this, AVRUSART);

        this.cpu = cpu;
        this.config = config;
        this.freqMHz = freqMHz;
        this.onByteTransmit = null;
        this.onLineTransmit = null;
        this.lineBuffer = '';
        this.cpu.writeHooks[config.UCSRA] = function (value) {
            _this.cpu.data[config.UCSRA] = value | UCSRA_UDRE | UCSRA_TXC;
            return true;
        };
        this.cpu.writeHooks[config.UCSRB] = function (value, oldValue) {
            if (value & UCSRB_TXEN && !(oldValue & UCSRB_TXEN)) {
                // Enabling the transmission - mark UDR as empty
                _this.cpu.data[config.UCSRA] |= UCSRA_UDRE;
            }
        };
        this.cpu.writeHooks[config.UDR] = function (value) {
            if (_this.onByteTransmit) {
                _this.onByteTransmit(value);
            }
            if (_this.onLineTransmit) {
                var ch = String.fromCharCode(value);
                if (ch === '\n') {
                    _this.onLineTransmit(_this.lineBuffer);
                    _this.lineBuffer = '';
                } else {
                    _this.lineBuffer += ch;
                }
            }
            _this.cpu.data[config.UCSRA] |= UCSRA_UDRE | UCSRA_TXC;
        };
    }

    _createClass(AVRUSART, [{
        key: 'tick',
        value: function tick() {
            if (this.cpu.interruptsEnabled) {
                var ucsra = this.cpu.data[this.config.UCSRA];
                var ucsrb = this.cpu.data[this.config.UCSRB];
                if (ucsra & UCSRA_UDRE && ucsrb & UCSRB_UDRIE) {
                    (0, _interrupt.avrInterrupt)(this.cpu, this.config.dataRegisterEmptyInterrupt);
                    this.cpu.data[this.config.UCSRA] &= ~UCSRA_UDRE;
                }
                if (ucsrb & UCSRA_TXC && ucsrb & UCSRB_TXCIE) {
                    (0, _interrupt.avrInterrupt)(this.cpu, this.config.txCompleteInterrupt);
                    this.cpu.data[this.config.UCSRA] &= ~UCSRA_TXC;
                }
            }
        }
    }, {
        key: 'baudRate',
        get: function get() {
            var UBRR = this.cpu.data[this.config.UBRRH] << 8 | this.cpu.data[this.config.UBRRL];
            var multiplier = this.cpu.data[this.config.UCSRA] & UCSRA_U2X ? 8 : 16;
            return Math.floor(this.freqMHz / (multiplier * (1 + UBRR)));
        }
    }, {
        key: 'bitsPerChar',
        get: function get() {
            var ucsz = (this.cpu.data[this.config.UCSRA] & (UCSRC_UCSZ1 | UCSRC_UCSZ0)) >> 1 | this.cpu.data[this.config.UCSRB] & UCSRB_UCSZ2;
            switch (ucsz) {
                case 0:
                    return 5;
                case 1:
                    return 6;
                case 2:
                    return 7;
                case 3:
                    return 8;
                default: // 4..6 are reserved
                case 7:
                    return 9;
            }
        }
    }]);

    return AVRUSART;
}();
},{"../cpu/interrupt":"../node_modules/avr8js/dist/esm/cpu/interrupt.js"}],"../node_modules/avr8js/dist/esm/peripherals/twi.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AVRTWI = exports.NoopTWIEventHandler = exports.twiConfig = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _interrupt = require('../cpu/interrupt');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable @typescript-eslint/no-unused-vars */
// Register bits:
var TWCR_TWINT = 0x80; // TWI Interrupt Flag
var TWCR_TWEA = 0x40; // TWI Enable Acknowledge Bit
var TWCR_TWSTA = 0x20; // TWI START Condition Bit
var TWCR_TWSTO = 0x10; // TWI STOP Condition Bit
var TWCR_TWWC = 0x8; //TWI Write Collision Flag
var TWCR_TWEN = 0x4; //  TWI Enable Bit
var TWCR_TWIE = 0x1; // TWI Interrupt Enable
var TWSR_TWS_MASK = 0xf8; // TWI Status
var TWSR_TWPS1 = 0x2; // TWI Prescaler Bits
var TWSR_TWPS0 = 0x1; // TWI Prescaler Bits
var TWSR_TWPS_MASK = TWSR_TWPS1 | TWSR_TWPS0; // TWI Prescaler mask
var TWAR_TWA_MASK = 0xfe; //  TWI (Slave) Address Register
var TWAR_TWGCE = 0x1; // TWI General Call Recognition Enable Bit
var STATUS_BUS_ERROR = 0x0;
var STATUS_TWI_IDLE = 0xf8;
// Master states
var STATUS_START = 0x08;
var STATUS_REPEATED_START = 0x10;
var STATUS_SLAW_ACK = 0x18;
var STATUS_SLAW_NACK = 0x20;
var STATUS_DATA_SENT_ACK = 0x28;
var STATUS_DATA_SENT_NACK = 0x30;
var STATUS_DATA_LOST_ARBITRATION = 0x38;
var STATUS_SLAR_ACK = 0x40;
var STATUS_SLAR_NACK = 0x48;
var STATUS_DATA_RECEIVED_ACK = 0x50;
var STATUS_DATA_RECEIVED_NACK = 0x58;
// TODO: add slave states
/* eslint-enable @typescript-eslint/no-unused-vars */
var twiConfig = exports.twiConfig = {
    twiInterrupt: 0x30,
    TWBR: 0xb8,
    TWSR: 0xb9,
    TWAR: 0xba,
    TWDR: 0xbb,
    TWCR: 0xbc,
    TWAMR: 0xbd
};
// A simple TWI Event Handler that sends a NACK for all events

var NoopTWIEventHandler = exports.NoopTWIEventHandler = function () {
    function NoopTWIEventHandler(twi) {
        _classCallCheck(this, NoopTWIEventHandler);

        this.twi = twi;
    }

    _createClass(NoopTWIEventHandler, [{
        key: 'start',
        value: function start() {
            this.twi.completeStart();
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.twi.completeStop();
        }
    }, {
        key: 'connectToSlave',
        value: function connectToSlave() {
            this.twi.completeConnect(false);
        }
    }, {
        key: 'writeByte',
        value: function writeByte() {
            this.twi.completeWrite(false);
        }
    }, {
        key: 'readByte',
        value: function readByte() {
            this.twi.completeRead(0xff);
        }
    }]);

    return NoopTWIEventHandler;
}();

var AVRTWI = exports.AVRTWI = function () {
    function AVRTWI(cpu, config, freqMHz) {
        var _this = this;

        _classCallCheck(this, AVRTWI);

        this.cpu = cpu;
        this.config = config;
        this.freqMHz = freqMHz;
        this.eventHandler = new NoopTWIEventHandler(this);
        this.nextTick = null;
        this.updateStatus(STATUS_TWI_IDLE);
        this.cpu.writeHooks[config.TWCR] = function (value) {
            var clearInt = value & TWCR_TWINT;
            if (clearInt) {
                value &= ~TWCR_TWINT;
            }
            var status = _this.status;

            if (clearInt && value & TWCR_TWEN) {
                var twdrValue = _this.cpu.data[_this.config.TWDR];
                _this.nextTick = function () {
                    if (value & TWCR_TWSTA) {
                        _this.eventHandler.start(status !== STATUS_TWI_IDLE);
                    } else if (value & TWCR_TWSTO) {
                        _this.eventHandler.stop();
                    } else if (status === STATUS_START) {
                        _this.eventHandler.connectToSlave(twdrValue >> 1, twdrValue & 0x1 ? false : true);
                    } else if (status === STATUS_SLAW_ACK || status === STATUS_DATA_SENT_ACK) {
                        _this.eventHandler.writeByte(twdrValue);
                    } else if (status === STATUS_SLAR_ACK || status === STATUS_DATA_RECEIVED_ACK) {
                        var ack = !!(value & TWCR_TWEA);
                        _this.eventHandler.readByte(ack);
                    }
                };
                _this.cpu.data[config.TWCR] = value;
                return true;
            }
        };
    }

    _createClass(AVRTWI, [{
        key: 'tick',
        value: function tick() {
            if (this.nextTick) {
                this.nextTick();
                this.nextTick = null;
            }
            if (this.cpu.interruptsEnabled) {
                var _config = this.config,
                    TWCR = _config.TWCR,
                    twiInterrupt = _config.twiInterrupt;

                if (this.cpu.data[TWCR] & TWCR_TWIE && this.cpu.data[TWCR] & TWCR_TWINT) {
                    (0, _interrupt.avrInterrupt)(this.cpu, twiInterrupt);
                    this.cpu.data[TWCR] &= ~TWCR_TWINT;
                }
            }
        }
    }, {
        key: 'completeStart',
        value: function completeStart() {
            this.updateStatus(this.status === STATUS_TWI_IDLE ? STATUS_START : STATUS_REPEATED_START);
        }
    }, {
        key: 'completeStop',
        value: function completeStop() {
            this.cpu.data[this.config.TWCR] &= ~TWCR_TWSTO;
            this.updateStatus(STATUS_TWI_IDLE);
        }
    }, {
        key: 'completeConnect',
        value: function completeConnect(ack) {
            if (this.cpu.data[this.config.TWDR] & 0x1) {
                this.updateStatus(ack ? STATUS_SLAR_ACK : STATUS_SLAR_NACK);
            } else {
                this.updateStatus(ack ? STATUS_SLAW_ACK : STATUS_SLAW_NACK);
            }
        }
    }, {
        key: 'completeWrite',
        value: function completeWrite(ack) {
            this.updateStatus(ack ? STATUS_DATA_SENT_ACK : STATUS_DATA_SENT_NACK);
        }
    }, {
        key: 'completeRead',
        value: function completeRead(value) {
            var ack = !!(this.cpu.data[this.config.TWCR] & TWCR_TWEA);
            this.cpu.data[this.config.TWDR] = value;
            this.updateStatus(ack ? STATUS_DATA_RECEIVED_ACK : STATUS_DATA_RECEIVED_NACK);
        }
    }, {
        key: 'updateStatus',
        value: function updateStatus(value) {
            var _config2 = this.config,
                TWCR = _config2.TWCR,
                TWSR = _config2.TWSR;

            this.cpu.data[TWSR] = this.cpu.data[TWSR] & ~TWSR_TWS_MASK | value;
            this.cpu.data[TWCR] |= TWCR_TWINT;
        }
    }, {
        key: 'prescaler',
        get: function get() {
            switch (this.cpu.data[this.config.TWSR] & TWSR_TWPS_MASK) {
                case 0:
                    return 1;
                case 1:
                    return 4;
                case 2:
                    return 16;
                case 3:
                    return 64;
            }
            // We should never get here:
            throw new Error('Invalid prescaler value!');
        }
    }, {
        key: 'sclFrequency',
        get: function get() {
            return this.freqMHz / (16 + 2 * this.cpu.data[this.config.TWBR] * this.prescaler);
        }
    }, {
        key: 'status',
        get: function get() {
            return this.cpu.data[this.config.TWSR] & TWSR_TWS_MASK;
        }
    }]);

    return AVRTWI;
}();
},{"../cpu/interrupt":"../node_modules/avr8js/dist/esm/cpu/interrupt.js"}],"../node_modules/avr8js/dist/esm/index.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cpu = require('./cpu/cpu');

Object.defineProperty(exports, 'CPU', {
  enumerable: true,
  get: function () {
    return _cpu.CPU;
  }
});

var _instruction = require('./cpu/instruction');

Object.defineProperty(exports, 'avrInstruction', {
  enumerable: true,
  get: function () {
    return _instruction.avrInstruction;
  }
});

var _interrupt = require('./cpu/interrupt');

Object.defineProperty(exports, 'avrInterrupt', {
  enumerable: true,
  get: function () {
    return _interrupt.avrInterrupt;
  }
});

var _timer = require('./peripherals/timer');

Object.defineProperty(exports, 'AVRTimer', {
  enumerable: true,
  get: function () {
    return _timer.AVRTimer;
  }
});
Object.defineProperty(exports, 'timer0Config', {
  enumerable: true,
  get: function () {
    return _timer.timer0Config;
  }
});
Object.defineProperty(exports, 'timer1Config', {
  enumerable: true,
  get: function () {
    return _timer.timer1Config;
  }
});
Object.defineProperty(exports, 'timer2Config', {
  enumerable: true,
  get: function () {
    return _timer.timer2Config;
  }
});

var _gpio = require('./peripherals/gpio');

Object.defineProperty(exports, 'AVRIOPort', {
  enumerable: true,
  get: function () {
    return _gpio.AVRIOPort;
  }
});
Object.defineProperty(exports, 'portAConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portAConfig;
  }
});
Object.defineProperty(exports, 'portBConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portBConfig;
  }
});
Object.defineProperty(exports, 'portCConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portCConfig;
  }
});
Object.defineProperty(exports, 'portDConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portDConfig;
  }
});
Object.defineProperty(exports, 'portEConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portEConfig;
  }
});
Object.defineProperty(exports, 'portFConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portFConfig;
  }
});
Object.defineProperty(exports, 'portGConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portGConfig;
  }
});
Object.defineProperty(exports, 'portHConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portHConfig;
  }
});
Object.defineProperty(exports, 'portJConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portJConfig;
  }
});
Object.defineProperty(exports, 'portKConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portKConfig;
  }
});
Object.defineProperty(exports, 'portLConfig', {
  enumerable: true,
  get: function () {
    return _gpio.portLConfig;
  }
});
Object.defineProperty(exports, 'PinState', {
  enumerable: true,
  get: function () {
    return _gpio.PinState;
  }
});

var _usart = require('./peripherals/usart');

Object.defineProperty(exports, 'AVRUSART', {
  enumerable: true,
  get: function () {
    return _usart.AVRUSART;
  }
});
Object.defineProperty(exports, 'usart0Config', {
  enumerable: true,
  get: function () {
    return _usart.usart0Config;
  }
});

var _twi = require('./peripherals/twi');

Object.keys(_twi).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _twi[key];
    }
  });
});
},{"./cpu/cpu":"../node_modules/avr8js/dist/esm/cpu/cpu.js","./cpu/instruction":"../node_modules/avr8js/dist/esm/cpu/instruction.js","./cpu/interrupt":"../node_modules/avr8js/dist/esm/cpu/interrupt.js","./peripherals/timer":"../node_modules/avr8js/dist/esm/peripherals/timer.js","./peripherals/gpio":"../node_modules/avr8js/dist/esm/peripherals/gpio.js","./peripherals/usart":"../node_modules/avr8js/dist/esm/peripherals/usart.js","./peripherals/twi":"../node_modules/avr8js/dist/esm/peripherals/twi.js"}],"intelhex.ts":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadHex = loadHex;
/**
 * Minimal Intel HEX loader
 * Part of AVR8js
 *
 * Copyright (C) 2019, Uri Shaked
 */
function loadHex(source, target) {
    for (var _i = 0, _a = source.split('\n'); _i < _a.length; _i++) {
        var line = _a[_i];
        if (line[0] === ':' && line.substr(7, 2) === '00') {
            var bytes = parseInt(line.substr(1, 2), 16);
            var addr = parseInt(line.substr(3, 4), 16);
            for (var i = 0; i < bytes; i++) {
                target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
            }
        }
    }
}
},{}],"task-scheduler.ts":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var MicroTaskScheduler = /** @class */function () {
    function MicroTaskScheduler() {
        var _this = this;
        this.messageName = 'zero-timeout-message';
        this.executionQueue = [];
        this.stopped = true;
        this.handleMessage = function (event) {
            if (event.data === _this.messageName) {
                event.stopPropagation();
                var executeJob = _this.executionQueue.shift();
                if (executeJob !== undefined) {
                    executeJob();
                }
            }
        };
    }
    MicroTaskScheduler.prototype.start = function () {
        if (this.stopped) {
            this.stopped = false;
            window.addEventListener('message', this.handleMessage, true);
        }
    };
    MicroTaskScheduler.prototype.stop = function () {
        this.stopped = true;
        window.removeEventListener('message', this.handleMessage, true);
    };
    MicroTaskScheduler.prototype.postTask = function (fn) {
        if (!this.stopped) {
            this.executionQueue.push(fn);
            window.postMessage(this.messageName, '*');
        }
    };
    return MicroTaskScheduler;
}();
exports.MicroTaskScheduler = MicroTaskScheduler;
},{}],"execute.ts":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AVRRunner = undefined;

var _avr8js = require('avr8js');

var _intelhex = require('./intelhex');

var _taskScheduler = require('./task-scheduler');

// ATmega328p params
var FLASH = 0x8000;
var AVRRunner = /** @class */function () {
    function AVRRunner(hex) {
        this.program = new Uint16Array(FLASH);
        this.speed = 16e6; // 16 MHZ
        this.workUnitCycles = 500000;
        this.taskScheduler = new _taskScheduler.MicroTaskScheduler();
        (0, _intelhex.loadHex)(hex, new Uint8Array(this.program.buffer));
        this.cpu = new _avr8js.CPU(this.program);
        this.timer = new _avr8js.AVRTimer(this.cpu, _avr8js.timer0Config);
        this.portB = new _avr8js.AVRIOPort(this.cpu, _avr8js.portBConfig);
        this.portC = new _avr8js.AVRIOPort(this.cpu, _avr8js.portCConfig);
        this.portD = new _avr8js.AVRIOPort(this.cpu, _avr8js.portDConfig);
        this.usart = new _avr8js.AVRUSART(this.cpu, _avr8js.usart0Config, this.speed);
        this.taskScheduler.start();
    }
    // CPU main loop
    AVRRunner.prototype.execute = function (callback) {
        var _this = this;
        var cyclesToRun = this.cpu.cycles + this.workUnitCycles;
        while (this.cpu.cycles < cyclesToRun) {
            (0, _avr8js.avrInstruction)(this.cpu);
            this.timer.tick();
            this.usart.tick();
        }
        callback(this.cpu);
        this.taskScheduler.postTask(function () {
            return _this.execute(callback);
        });
    };
    AVRRunner.prototype.stop = function () {
        this.taskScheduler.stop();
    };
    return AVRRunner;
}();
exports.AVRRunner = AVRRunner;
},{"avr8js":"../node_modules/avr8js/dist/esm/index.js","./intelhex":"intelhex.ts","./task-scheduler":"task-scheduler.ts"}],"format-time.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.formatTime = formatTime;
function zeroPad(value, length) {
    var sval = value.toString();
    while (sval.length < length) {
        sval = '0' + sval;
    }
    return sval;
}
function formatTime(seconds) {
    var ms = Math.floor(seconds * 1000) % 1000;
    var secs = Math.floor(seconds % 60);
    var mins = Math.floor(seconds / 60);
    return zeroPad(mins, 2) + ":" + zeroPad(secs, 2) + "." + zeroPad(ms, 3);
}
},{}],"../node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
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
    var matches = ('' + err.stack).match(/(https?|file|ftp):\/\/[^)\n]+/g);
    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"../node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
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
},{"./bundle-url":"../node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"index.css":[function(require,module,exports) {

var reloadCSS = require('_css_loader');
module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"../node_modules/parcel-bundler/src/builtins/css-loader.js"}],"cpu-performance.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var CPUPerformance = /** @class */function () {
    function CPUPerformance(cpu, MHZ) {
        this.cpu = cpu;
        this.MHZ = MHZ;
        this.prevTime = 0;
        this.prevCycles = 0;
        this.samples = new Float32Array(64);
        this.sampleIndex = 0;
    }
    CPUPerformance.prototype.reset = function () {
        this.prevTime = 0;
        this.prevCycles = 0;
        this.sampleIndex = 0;
    };
    CPUPerformance.prototype.update = function () {
        if (this.prevTime) {
            var delta = performance.now() - this.prevTime;
            var deltaCycles = this.cpu.cycles - this.prevCycles;
            var deltaCpuMillis = 1000 * (deltaCycles / this.MHZ);
            var factor = deltaCpuMillis / delta;
            if (!this.sampleIndex) {
                this.samples.fill(factor);
            }
            this.samples[this.sampleIndex++ % this.samples.length] = factor;
        }
        this.prevCycles = this.cpu.cycles;
        this.prevTime = performance.now();
        var avg = this.samples.reduce(function (x, y) {
            return x + y;
        }) / this.samples.length;
        return avg;
    };
    return CPUPerformance;
}();
exports.CPUPerformance = CPUPerformance;
},{}],"utils/editor-history.util.ts":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var AVRJS8_EDITOR_HISTORY = 'AVRJS8_EDITOR_HISTORY';
var EditorHistoryUtil = /** @class */function () {
    function EditorHistoryUtil() {}
    EditorHistoryUtil.storeSnippet = function (codeSnippet) {
        if (!EditorHistoryUtil.hasLocalStorage) {
            return;
        }
        window.localStorage.setItem(AVRJS8_EDITOR_HISTORY, codeSnippet);
    };
    EditorHistoryUtil.clearSnippet = function () {
        if (!EditorHistoryUtil.hasLocalStorage) {
            return;
        }
        localStorage.removeItem(AVRJS8_EDITOR_HISTORY);
    };
    EditorHistoryUtil.getValue = function () {
        if (!EditorHistoryUtil.hasLocalStorage) {
            return;
        }
        return localStorage.getItem(AVRJS8_EDITOR_HISTORY);
    };
    EditorHistoryUtil.hasLocalStorage = !!window.localStorage;
    return EditorHistoryUtil;
}();
exports.EditorHistoryUtil = EditorHistoryUtil;
},{}],"index.ts":[function(require,module,exports) {
"use strict";

require("@wokwi/elements");

var _compile = require("./compile");

var _execute = require("./execute");

var _formatTime = require("./format-time");

require("./index.css");

var _cpuPerformance = require("./cpu-performance");

var _editorHistory = require("./utils/editor-history.util");

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = undefined && undefined.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function sent() {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) {
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:case 1:
                        t = op;break;
                    case 4:
                        _.label++;return { value: op[1], done: false };
                    case 5:
                        _.label++;y = op[1];op = [0];continue;
                    case 7:
                        op = _.ops.pop();_.trys.pop();continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];t = op;break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];_.ops.push(op);break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];y = 0;
            } finally {
                f = t = 0;
            }
        }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};

var editor; // eslint-disable-line @typescript-eslint/no-explicit-any
var BLINK_CODE = "\n// Green LED connected to LED_BUILTIN,\n// Red LED connected to pin 12. Enjoy!\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(LED_BUILTIN, OUTPUT);\n}\nvoid loop() {\n  Serial.println(\"Blink\");\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(500);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(500);\n}".trim();
window.require.config({
    paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' }
});
window.require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.querySelector('.code-editor'), {
        value: _editorHistory.EditorHistoryUtil.getValue() || BLINK_CODE,
        language: 'cpp',
        minimap: { enabled: false }
    });
});
// Set up LEDs
var led13 = document.querySelector('wokwi-led[color=green]');
var led12 = document.querySelector('wokwi-led[color=red]');
// Set up toolbar
var runner;
/* eslint-disable @typescript-eslint/no-use-before-define */
var runButton = document.querySelector('#run-button');
runButton.addEventListener('click', compileAndRun);
var stopButton = document.querySelector('#stop-button');
stopButton.addEventListener('click', stopCode);
var revertButton = document.querySelector('#revert-button');
revertButton.addEventListener('click', setBlinkSnippet);
var statusLabel = document.querySelector('#status-label');
var compilerOutputText = document.querySelector('#compiler-output-text');
var serialOutputText = document.querySelector('#serial-output-text');
function executeProgram(hex) {
    runner = new _execute.AVRRunner(hex);
    var MHZ = 16000000;
    // Hook to PORTB register
    runner.portB.addListener(function (value) {
        var D12bit = 1 << 4;
        var D13bit = 1 << 5;
        led12.value = value & D12bit ? true : false;
        led13.value = value & D13bit ? true : false;
    });
    runner.usart.onByteTransmit = function (value) {
        serialOutputText.textContent += String.fromCharCode(value);
    };
    var cpuPerf = new _cpuPerformance.CPUPerformance(runner.cpu, MHZ);
    runner.execute(function (cpu) {
        var time = (0, _formatTime.formatTime)(cpu.cycles / MHZ);
        var speed = (cpuPerf.update() * 100).toFixed(0);
        statusLabel.textContent = "Simulation time: " + time + " (" + speed + "%)";
    });
}
function compileAndRun() {
    return __awaiter(this, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    led12.value = false;
                    led13.value = false;
                    storeUserSnippet();
                    runButton.setAttribute('disabled', '1');
                    revertButton.setAttribute('disabled', '1');
                    serialOutputText.textContent = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    statusLabel.textContent = 'Compiling...';
                    return [4 /*yield*/, (0, _compile.buildHex)(editor.getModel().getValue())];
                case 2:
                    result = _a.sent();
                    compilerOutputText.textContent = result.stderr || result.stdout;
                    if (result.hex) {
                        compilerOutputText.textContent += '\nProgram running...';
                        stopButton.removeAttribute('disabled');
                        executeProgram(result.hex);
                    } else {
                        runButton.removeAttribute('disabled');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    runButton.removeAttribute('disabled');
                    revertButton.removeAttribute('disabled');
                    alert('Failed: ' + err_1);
                    return [3 /*break*/, 5];
                case 4:
                    statusLabel.textContent = '';
                    return [7 /*endfinally*/];
                case 5:
                    return [2 /*return*/];
            }
        });
    });
}
function storeUserSnippet() {
    _editorHistory.EditorHistoryUtil.clearSnippet();
    _editorHistory.EditorHistoryUtil.storeSnippet(editor.getValue());
}
function stopCode() {
    stopButton.setAttribute('disabled', '1');
    runButton.removeAttribute('disabled');
    revertButton.removeAttribute('disabled');
    if (runner) {
        runner.stop();
        runner = null;
    }
}
function setBlinkSnippet() {
    editor.setValue(BLINK_CODE);
    _editorHistory.EditorHistoryUtil.storeSnippet(editor.getValue());
}
},{"@wokwi/elements":"../node_modules/@wokwi/elements/dist/esm/index.js","./compile":"compile.ts","./execute":"execute.ts","./format-time":"format-time.ts","./index.css":"index.css","./cpu-performance":"cpu-performance.ts","./utils/editor-history.util":"utils/editor-history.util.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '38741' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
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
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
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

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

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

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/src.01621f36.map