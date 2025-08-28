/**
 * 🍞 Toastlet Notify
 * A lightweight JavaScript library for displaying beautiful toast notifications.
 * Visually inspired by PNotify 4+ with Bootstrap styling.
 * 
 * 📦 @version 1.1.0
 * 👤 @author Pedro Rigolin
 * 🔗 @repository https://github.com/pedrohrigolin/Toastlet-Notify-JS
 * 📝 @license MIT
 * 
 * ⚙️ Basic Usage:
 * toastletNotify.notify('success', 'Operation completed successfully');
 * 
 * 🎨 Supported Types:
 * - 🔔 notice - System announcements and general notifications
 * - ℹ️ info - Contextual tips and helpful explanations
 * - ✅ success - Successful operations
 * - ⚠️ warning - Warning contents
 * - ❌ error - Error notifications
 * 
 * 🧩 Advanced Usage:
 * toastletNotify.notify('success', 'Data saved!', {
 *   sticky: true,
 *   customClass: 'my-custom-toast',
 *   delay: 5000,
 *   transition: true,
 *   transitionDuration: 300,
 *   position: 'top-left',         // Desktop: top, top-right, top-left, bottom, bottom-right, bottom-left
 *   positionMobile: 'top'         // Mobile: top, bottom (overrides automatic adjustment)
 * });
 * 
 * 🌐 @namespace toastletNotify
 * 🛎️ @method notify
 * @param {string} type - Notification type: "info", "success", "warning", "error", or "notice"
 * @param {string} content - Text content to display (supports line breaks with \\n)
 * @param {Object} [options] - Optional configuration settings
 * @param {boolean} [options.sticky=false] - If true, notification won't auto-close
 * @param {number} [options.delay=5000] - Duration in milliseconds before auto-closing (ignored if sticky is true)
 * @param {string} [options.customClass] - Additional CSS classes for custom styling
 * @param {boolean} [options.transition=true] - Enable/disable transition animations
 * @param {number} [options.transitionDuration=300] - Duration of animations in milliseconds
 * @param {string} [options.position='top-right'] - Desktop position: "top", "top-right", "top-left", "bottom", "bottom-right", "bottom-left"
 * @param {string} [options.positionMobile] - Mobile position: "top", "bottom" (overrides automatic adjustment)
 * @param {string} content - Text content to display (supports line breaks with \n)
 * @param {Object} [options] - Optional configuration settings
 * @param {boolean} [options.sticky=false] - If true, notification won't auto-close
 * @param {number} [options.delay=5000] - Duration in milliseconds before auto-closing (ignored if sticky is true)
 * @param {string} [options.customClass] - Additional CSS classes for custom styling
 * @param {boolean} [options.transition=true] - Enable/disable transition animations
 * @param {number} [options.transitionDuration=300] - Duration of animations in milliseconds
 * 
 * 🧠 Smart Behavior:
 * - Only one notification is displayed at a time
 * - Timer automatically pauses on mouse hover, keyboard focus, or tab change
 * 
 * ♿ Accessibility (a11y):
 * - Full keyboard navigation and interaction (Tab, Enter, Space, Escape)
 * - ARIA roles for screen readers (alert/status)
 * - Descriptive labels for interactive elements
 * 
 * 📱 Mobile Support:
 * - Responsive design adapts to screen size
 * - Touch gestures for interaction (swipe to dismiss)
 * - Customizable mobile position
 * 
 * 🖱️ User Interaction:
 * - Hover to reveal controls
 * - Pause/resume timer button
 * - Close button to dismiss
 */
(() => {

    if(window.toastletNotify !== undefined){
        console.warn('Toastlet Notify is already defined!');
        return;
    }

    // TODO: VER O FUNCIONAMENTO ATUAL DE PAUSA, TOUCH E ETC, POR CONTA DAS NUANCES
    // TODO: AINDA ESTÁ PAUSANDO O TIMER QUANDO CLICA NO TOAST, MESMO COM ONCLICK

    /**
     * Regular Expression Constants
     * 
     * Pre-compiled regular expressions are defined here for performance optimization.
     * Compiling regex patterns once and reusing them throughout the application is significantly
     * more efficient than creating new RegExp objects on each use. This approach reduces CPU
     * overhead and improves overall performance, especially in high-frequency operations like
     * string validation, cleaning, and parsing that occur throughout the toast notification lifecycle.
     * 
     * @author Pedro Rigolin
     */

    /**
     * Matches one or more whitespace characters (spaces, tabs, newlines) for general string splitting
     * @RegExp /\s+/g
     * @type {RegExp}
     * @constant
     */
    const space_regex = /\s+/g;

    /**
     * Matches Unicode whitespace and separator characters for comprehensive content validation
     * @RegExp /[\s\p{Z}]+/gu
     * @type {RegExp}
     * @constant
     */
    const space_uni_regex = /[\s\p{Z}]+/gu;

    /**
     * Matches any non-alphabetic characters for extracting only letters from strings
     * @RegExp /[^a-zA-Z]+/g
     * @type {RegExp}
     * @constant
     */
    const only_letters_regex = /[^a-zA-Z]+/g;

    /**
     * Object.freeze() wrapper function for code minification optimization
     * 
     * This wrapper serves primarily to reduce the size of the minified code. By defining this
     * short alias, the minifier can optimize repeated calls to Object.freeze() throughout the
     * codebase, resulting in smaller bundle size. It provides no additional functionality
     * beyond the native Object.freeze() method.
     * 
     * @author Pedro Rigolin
     * @param {Object} obj - The object to freeze
     * @returns {Object} The frozen object
     * @function
     */
    const objFreeze = Object.freeze( (obj) => { return Object.freeze(obj) } );

    /**
     * Object.keys() wrapper function for code minification optimization
     * 
     * This wrapper serves primarily to reduce the size of the minified code. By defining this
     * short alias, the minifier can optimize repeated calls to Object.keys() throughout the
     * codebase, resulting in smaller bundle size. It provides no additional functionality
     * beyond the native Object.keys() method.
     * 
     * @author Pedro Rigolin
     * @param {Object} obj - The object whose enumerable property names are to be returned
     * @returns {Array<string>} An array of strings representing the given object's enumerable properties
     * @function
     */
    const objKeys = objFreeze( (obj) => { return Object.keys(obj) } );

    /**
     * Object.entries() wrapper function for code minification optimization
     * 
     * This wrapper serves primarily to reduce the size of the minified code. By defining this
     * short alias, the minifier can optimize repeated calls to Object.entries() throughout the
     * codebase, resulting in smaller bundle size. It provides no additional functionality
     * beyond the native Object.entries() method.
     * 
     * @author Pedro Rigolin
     * @param {Object} obj - The object whose enumerable string-keyed property key-value pairs are to be returned
     * @returns {Array<Array>} An array of arrays, each containing a key-value pair from the object
     * @function
     */
    const objEntries = objFreeze( (obj) => { return Object.entries(obj) } );

    /**
     * Returns all property keys from an object, including non-enumerable properties and symbol keys
     * 
     * This function combines Object.getOwnPropertyNames() and Object.getOwnPropertySymbols() 
     * to provide a complete list of all property keys in an object, regardless of their 
     * enumerability or type (string or symbol).
     * 
     * Performance optimizations implemented:
     * - Early return optimization: Returns immediately if only one key type exists
     * - Pre-allocated array: Creates the result array with exact size to avoid resizing
     * - Reverse while loops: More efficient iteration pattern for better performance
     * 
     * @author Pedro Rigolin
     * @param {Object} obj - The object from which to extract all property keys
     * @returns {Array<string|symbol>} Array containing all property names (strings) and symbols
     * 
     * @example
     * const obj = { a: 1, [Symbol('test')]: 2 };
     * Object.defineProperty(obj, 'hidden', { value: 3, enumerable: false });
     * const allKeys = objFullKeys(obj); // ['a', 'hidden', Symbol('test')]
     */
    const objFullKeys = objFreeze( (obj) => { 

        const names = Object.getOwnPropertyNames(obj);

        const symbols = Object.getOwnPropertySymbols(obj);

        const sl = symbols.length;

        if ( sl === 0 ) return names;

        const nl = names.length;

        if ( nl === 0 ) return symbols;

        const keys = new Array(names.length + symbols.length);
        
        let i = names.length;

        while (i--) keys[i] = names[i];
        
        let j = symbols.length;

        while (j--) keys[names.length + j] = symbols[j];
        
        return keys;
    
    });

    /**
     * Recursively freezes objects and functions deeply
     * 
     * This function performs deep freezing of objects and functions, making them completely
     * immutable by freezing all nested properties recursively. It serves dual purposes:
     * reducing minified code size and improving code readability by eliminating the need
     * to manually freeze each property and function throughout the codebase.
     * 
     * The function utilizes objFullKeys() to ensure comprehensive freezing, including
     * symbol properties and non-enumerable properties that would be missed by standard
     * Object.keys() iteration. This guarantees complete immutability of the target object.
     * 
     * Performance optimizations:
     * - Uses objFullKeys for complete property coverage including symbols
     * - Reverse while loop for efficient iteration
     * - Type checking before recursion to avoid unnecessary calls
     * 
     * @author Pedro Rigolin
     * @param {Object|Function} obj - The object or function to freeze deeply
     * @returns {Object|Function} The deeply frozen object or function
     * 
     * @example
     * const nested = { a: { b: { c: 1 } }, fn: () => {} };
     * const frozen = objDeepFreeze(nested);
     * // All levels are now frozen: nested, nested.a, nested.b, nested.fn
     */
    const objDeepFreeze = objFreeze( (obj) => {

        if( typeof obj === 'object' ) {

            const keys = objFullKeys(obj);

            let keysLength = keys.length;

            while(keysLength--){

                const key = keys[keysLength];

                if( typeof obj[key] === 'object' || typeof obj[key] === 'function' ){

                    obj[key] = objDeepFreeze(obj[key]);

                }

            }

        }

        return objFreeze(obj);

    });

    /**
     * Type validation utility functions collection
     * 
     * This object contains a comprehensive set of utility functions for type validation
     * throughout the toast notification system. It serves dual purposes: reducing the size
     * of the minified code by centralizing type checks, and providing consistent, normalized
     * type validation across the entire codebase.
     * 
     * By centralizing type validation logic, this approach eliminates code duplication,
     * ensures consistent validation behavior, and makes the codebase more maintainable.
     * The functions are optimized for performance and cover both primitive types and
     * complex DOM/HTML content validation scenarios.
     * 
     * @author Pedro Rigolin
     * @namespace toastletTypeValidators
     * @type {Object}
     * @readonly
     */
    const toastletTypeValidators = objDeepFreeze({

        /**
         * Validates if a value is of type number
         * 
         * This function performs a strict type check to determine if the provided value
         * is a JavaScript number type. It uses the native typeof operator for optimal
         * performance and accuracy. Note that this function will return true for all
         * numeric values including NaN, Infinity, and -Infinity.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as a number type
         * @returns {boolean} True if the value is a number, false otherwise
         * 
         * @example
         * toastletTypeValidators.number(42);          // true
         * toastletTypeValidators.number(3.14);        // true
         * toastletTypeValidators.number(NaN);         // true
         * toastletTypeValidators.number(Infinity);    // true
         * toastletTypeValidators.number('42');        // false
         * toastletTypeValidators.number(null);        // false
         */
        number: (value) => {

            return typeof value === 'number';

        },

        /**
         * Validates if a value is a non-negative number (unsigned number)
         * 
         * This function performs a dual validation to ensure the value is both a number
         * type and has a value greater than or equal to zero. It combines type checking
         * with value range validation using the double negation operator for boolean
         * coercion and performance optimization. This validator is particularly useful
         * for validating durations, timeouts, dimensions, and other numeric values
         * that should not be negative.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as an unsigned number
         * @returns {boolean} True if the value is a number >= 0, false otherwise
         * 
         * @example
         * toastletTypeValidators.unsignedNumber(42);     // true
         * toastletTypeValidators.unsignedNumber(0);      // true
         * toastletTypeValidators.unsignedNumber(3.14);   // true
         * toastletTypeValidators.unsignedNumber(-1);     // false
         * toastletTypeValidators.unsignedNumber('42');   // false
         * toastletTypeValidators.unsignedNumber(NaN);    // false
         */
        unsignedNumber: (value) => {

            return !!(typeof value === 'number' && value >= 0);

        },

        /**
         * Validates if a value is of type string
         * 
         * This function performs a strict type check to determine if the provided value
         * is a JavaScript string primitive. It uses the native typeof operator for
         * optimal performance and accuracy. Note that this function only validates
         * string primitives and will return false for String objects created with
         * the String constructor.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as a string type
         * @returns {boolean} True if the value is a string primitive, false otherwise
         * 
         * @example
         * toastletTypeValidators.string('hello');           // true
         * toastletTypeValidators.string('');                // true
         * toastletTypeValidators.string(`template`);        // true
         * toastletTypeValidators.string(new String('hi'));  // false
         * toastletTypeValidators.string(42);                // false
         * toastletTypeValidators.string(null);              // false
         */
        string: (value) => {

            return typeof value === 'string';

        },

        /**
         * Validates if a value is of type boolean
         * 
         * This function performs a strict type check to determine if the provided value
         * is a JavaScript boolean primitive (true or false). It uses the native typeof
         * operator for optimal performance and accuracy. Note that this function only
         * validates boolean primitives and will return false for Boolean objects
         * created with the Boolean constructor.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as a boolean type
         * @returns {boolean} True if the value is a boolean primitive, false otherwise
         * 
         * @example
         * toastletTypeValidators.boolean(true);             // true
         * toastletTypeValidators.boolean(false);            // true
         * toastletTypeValidators.boolean(new Boolean(true)); // false
         * toastletTypeValidators.boolean(1);                // false
         * toastletTypeValidators.boolean('true');           // false
         * toastletTypeValidators.boolean(null);             // false
         */
        boolean: (value) => {

            return typeof value === 'boolean';

        },

        /**
         * Validates if a value is of type object
         * 
         * This function performs a basic type check to determine if the provided value
         * is of JavaScript object type. It uses the native typeof operator which will
         * return true for objects, arrays, null, and other object-like values. For more
         * specific object validation (excluding null and arrays), use the plainObject
         * validator instead.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as an object type
         * @returns {boolean} True if the value is of object type, false otherwise
         * 
         * @example
         * toastletTypeValidators.object({});              // true
         * toastletTypeValidators.object([]);              // true
         * toastletTypeValidators.object(null);            // true
         * toastletTypeValidators.object(new Date());      // true
         * toastletTypeValidators.object('string');        // false
         * toastletTypeValidators.object(42);              // false
         */
        object: (value) => {

            return typeof value === 'object'

        },

        /**
         * Validates if a value is a plain object (object literal)
         * 
         * This function performs a comprehensive validation to determine if the provided
         * value is a plain object literal created with {} syntax or Object.create(null).
         * It specifically excludes null, arrays, dates, custom class instances, and other
         * object types by checking that the prototype is Object.prototype. This validator
         * is essential for distinguishing between plain data objects and other object types.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as a plain object
         * @returns {boolean} True if the value is a plain object, false otherwise
         * 
         * @example
         * toastletTypeValidators.plainObject({});              // true
         * toastletTypeValidators.plainObject({a: 1});          // true
         * toastletTypeValidators.plainObject([]);              // false
         * toastletTypeValidators.plainObject(null);            // false
         * toastletTypeValidators.plainObject(new Date());      // false
         * toastletTypeValidators.plainObject(new String());    // false
         */
        plainObject: (value) => {

            return !!(typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype);

        },

        /**
         * Validates if a value is an array
         * 
         * This function uses the native Array.isArray() method to determine if the
         * provided value is a true JavaScript array. This is the most reliable way
         * to check for arrays as it works correctly across different execution
         * contexts and frames, unlike instanceof Array or checking the constructor.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as an array
         * @returns {boolean} True if the value is an array, false otherwise
         * 
         * @example
         * toastletTypeValidators.array([]);               // true
         * toastletTypeValidators.array([1, 2, 3]);        // true
         * toastletTypeValidators.array(new Array(5));     // true
         * toastletTypeValidators.array({});               // false
         * toastletTypeValidators.array('array');          // false
         * toastletTypeValidators.array(null);             // false
         */
        array: (value) => {

            return Array.isArray(value);

        },

        /**
         * Validates if a value is a function
         * 
         * This function performs a strict type check to determine if the provided value
         * is a JavaScript function. It uses the native typeof operator for optimal
         * performance and will return true for regular functions, arrow functions,
         * async functions, generator functions, and built-in functions.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as a function
         * @returns {boolean} True if the value is a function, false otherwise
         * 
         * @example
         * toastletTypeValidators.function(() => {});           // true
         * toastletTypeValidators.function(function() {});      // true
         * toastletTypeValidators.function(async () => {});     // true
         * toastletTypeValidators.function(Math.max);           // true
         * toastletTypeValidators.function('function');         // false
         * toastletTypeValidators.function({});                 // false
         */
        function: (value) => {

            return typeof value === 'function';

        },

        /**
         * Validates if a value is null
         * 
         * This function performs a strict equality check to determine if the provided
         * value is exactly null. It uses the strict equality operator (===) to ensure
         * precise validation without type coercion, distinguishing null from undefined,
         * 0, false, empty strings, and other falsy values.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as null
         * @returns {boolean} True if the value is null, false otherwise
         * 
         * @example
         * toastletTypeValidators.null(null);              // true
         * toastletTypeValidators.null(undefined);         // false
         * toastletTypeValidators.null(0);                 // false
         * toastletTypeValidators.null(false);             // false
         * toastletTypeValidators.null('');                // false
         * toastletTypeValidators.null({});                // false
         */
        null: (value) => {

            return value === null;

        },

        /**
         * Validates if a value is undefined
         * 
         * This function performs a strict equality check to determine if the provided
         * value is exactly undefined. It uses the strict equality operator (===) to
         * ensure precise validation without type coercion, distinguishing undefined
         * from null, 0, false, empty strings, and other falsy values.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as undefined
         * @returns {boolean} True if the value is undefined, false otherwise
         * 
         * @example
         * toastletTypeValidators.undefined(undefined);    // true
         * toastletTypeValidators.undefined(void 0);       // true
         * toastletTypeValidators.undefined(null);         // false
         * toastletTypeValidators.undefined(0);            // false
         * toastletTypeValidators.undefined(false);        // false
         * toastletTypeValidators.undefined('');           // false
         */
        undefined: (value) => {

            return value === undefined;

        },

        /**
         * Validates if a value is empty
         * 
         * This function determines if the provided value is considered empty based on
         * its type. For plain objects, it checks if there are no enumerable or
         * non-enumerable properties using objFullKeys(). For other values that have
         * a length property (strings, arrays, etc.), it checks if the length is 0.
         * This provides a unified way to check emptiness across different data types.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as empty
         * @returns {boolean} True if the value is empty, false otherwise
         * 
         * @example
         * toastletTypeValidators.empty([]);               // true
         * toastletTypeValidators.empty('');               // true
         * toastletTypeValidators.empty({});               // true
         * toastletTypeValidators.empty([1, 2]);           // false
         * toastletTypeValidators.empty('hello');          // false
         * toastletTypeValidators.empty({a: 1});           // false
         */
        empty: (value) => {

            if(toastletTypeValidators.plainObject(value))
                return objFullKeys(value).length === 0;

            return value.length === 0;

        },

        /**
         * Validates if a string is empty after removing all whitespace and separators
         * 
         * This function performs a comprehensive emptiness check for strings by first
         * removing all Unicode whitespace and separator characters using the pre-compiled
         * space_uni_regex, then checking if the resulting string has zero length. This
         * approach ensures that strings containing only whitespace, tabs, newlines,
         * and Unicode separator characters are considered empty.
         * 
         * @author Pedro Rigolin
         * @param {string} value - The string value to validate as empty
         * @returns {boolean} True if the string is empty or contains only whitespace, false otherwise
         * 
         * @example
         * toastletTypeValidators.emptyString('');          // true
         * toastletTypeValidators.emptyString('   ');       // true
         * toastletTypeValidators.emptyString('\t\n');      // true
         * toastletTypeValidators.emptyString('hello');     // false
         * toastletTypeValidators.emptyString(' a ');       // false
         */
        emptyString: (value) => {

            return !!( toastletTypeValidators.empty( value.replace(space_uni_regex, '') ) );

        },

        /**
         * Validates if a value is an HTML element node
         * 
         * This function checks if the provided value is a valid HTML element by
         * verifying that it exists and has a nodeType property equal to
         * Node.ELEMENT_NODE (value 1). This validation is essential for DOM
         * manipulation operations and ensures safe interaction with HTML elements
         * throughout the toast notification system.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as an HTML element
         * @returns {boolean} True if the value is an HTML element node, false otherwise
         * 
         * @example
         * const div = document.createElement('div');
         * toastletTypeValidators.htmlElement(div);            // true
         * toastletTypeValidators.htmlElement(document.body);  // true
         * toastletTypeValidators.htmlElement(document.createTextNode('text')); // false
         * toastletTypeValidators.htmlElement(null);           // false
         * toastletTypeValidators.htmlElement('<div>');        // false
         */
        htmlElement: (value) => {

            return !!(value && value.nodeType === Node.ELEMENT_NODE);

        },

        /**
         * Validates if a value is a text node
         * 
         * This function checks if the provided value is a valid DOM text node by
         * verifying that it exists and has a nodeType property equal to
         * Node.TEXT_NODE (value 3). Text nodes are used to represent textual
         * content within HTML elements and this validation ensures safe handling
         * of text content in DOM operations.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as a text node
         * @returns {boolean} True if the value is a text node, false otherwise
         * 
         * @example
         * const textNode = document.createTextNode('Hello');
         * toastletTypeValidators.textNode(textNode);          // true
         * toastletTypeValidators.textNode(document.createElement('div')); // false
         * toastletTypeValidators.textNode('Hello');           // false
         * toastletTypeValidators.textNode(null);              // false
         */
        textNode: (value) => {

            return !!(value && value.nodeType === Node.TEXT_NODE);

        },

        /**
         * Validates if a value is a document fragment node
         * 
         * This function checks if the provided value is a valid DocumentFragment by
         * verifying that it exists and has a nodeType property equal to
         * Node.DOCUMENT_FRAGMENT_NODE (value 11). DocumentFragments are lightweight
         * containers that can hold multiple DOM nodes and are commonly used for
         * efficient batch DOM operations and template rendering.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as a document fragment
         * @returns {boolean} True if the value is a document fragment node, false otherwise
         * 
         * @example
         * const fragment = document.createDocumentFragment();
         * toastletTypeValidators.documentFragment(fragment);  // true
         * toastletTypeValidators.documentFragment(document.createElement('div')); // false
         * toastletTypeValidators.documentFragment(null);      // false
         * toastletTypeValidators.documentFragment({});        // false
         */
        documentFragment: (value) => {

            return !!(value && value.nodeType === Node.DOCUMENT_FRAGMENT_NODE);

        },

        /**
         * Validates if a value is any type of HTML content (element, text node, or document fragment)
         * 
         * This function provides a comprehensive validation for any DOM content that can
         * be used within the toast notification system. It combines the validation logic
         * of htmlElement, textNode, and documentFragment validators to accept any valid
         * HTML content type. This is particularly useful for content validation where
         * multiple DOM node types are acceptable.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The value to validate as HTML content
         * @returns {boolean} True if the value is an HTML element, text node, or document fragment, false otherwise
         * 
         * @example
         * const div = document.createElement('div');
         * const text = document.createTextNode('Hello');
         * const fragment = document.createDocumentFragment();
         * toastletTypeValidators.htmlContent(div);            // true
         * toastletTypeValidators.htmlContent(text);           // true
         * toastletTypeValidators.htmlContent(fragment);       // true
         * toastletTypeValidators.htmlContent('string');       // false
         * toastletTypeValidators.htmlContent(null);           // false
         */
        htmlContent: (value) => {

            return !!(toastletTypeValidators.htmlElement(value) || toastletTypeValidators.textNode(value) || toastletTypeValidators.documentFragment(value));

        },

        /**
         * Validates if content is empty across different content types
         * 
         * This function provides intelligent emptiness validation for various content
         * types used in toast notifications. It handles different scenarios:
         * - Text nodes: Checks if textContent is empty after whitespace removal
         * - HTML elements: Always returns false (elements are considered non-empty)
         * - Document fragments: Checks if there are no child nodes
         * - Strings: Uses emptyString validation for whitespace-aware checking
         * - Other types: Returns true (considered empty by default)
         * 
         * This comprehensive approach ensures proper content validation regardless
         * of the input type, preventing the display of empty or meaningless content.
         * 
         * @author Pedro Rigolin
         * @param {*} value - The content to validate as empty
         * @returns {boolean} True if the content is considered empty, false otherwise
         * 
         * @example
         * const emptyText = document.createTextNode('   ');
         * const div = document.createElement('div');
         * const emptyFragment = document.createDocumentFragment();
         * toastletTypeValidators.emptyContent(emptyText);     // true
         * toastletTypeValidators.emptyContent(div);           // false
         * toastletTypeValidators.emptyContent(emptyFragment); // true
         * toastletTypeValidators.emptyContent('   ');         // true
         * toastletTypeValidators.emptyContent('Hello');       // false
         * toastletTypeValidators.emptyContent(null);          // true
         */
        emptyContent: (value) => {

            if( toastletTypeValidators.textNode(value) )
                return toastletTypeValidators.emptyString(value.textContent);

            if( toastletTypeValidators.htmlElement(value) )
                return false;

            if( toastletTypeValidators.documentFragment(value) )
                return value.childNodes.length === 0;

            if( toastletTypeValidators.string(value) )
                return toastletTypeValidators.emptyString(value);

            return true;

        }

    });

    /**
     * Media Query List storage for responsive behavior detection
     * 
     * This object stores pre-compiled MediaQueryList objects that can be utilized throughout
     * the codebase for responsive behavior detection and device capability assessment.
     * By centralizing media queries, it provides consistent access to device characteristics
     * and input capabilities across the entire toast notification system.
     * 
     * MediaQueryList objects are created once and reused, providing efficient real-time
     * monitoring of device capabilities without the overhead of creating new media query
     * objects on each check. This approach improves performance and ensures consistent
     * behavior detection throughout the application lifecycle.
     * 
     * @author Pedro Rigolin
     * @namespace toastletMatchMedia
     * @type {Object}
     * @readonly
     * 
     * @property {MediaQueryList} anyHover - Detects if any available input mechanism can hover
     * @property {MediaQueryList} pointerFine - Detects if the primary input mechanism has fine pointer accuracy
     */
    const toastletMatchMedia = objDeepFreeze({

        anyHover: window.matchMedia('(any-hover: hover)'),
        pointerFine: window.matchMedia('(any-pointer: fine)'),

    })

    /**
     * General utility functions collection
     * 
     * This object contains general-purpose utility functions that are utilized throughout
     * the toast notification codebase. These functions provide common functionality that
     * doesn't fit into specific categories like type validation, styling, or class management.
     * By centralizing these utilities, the code maintains consistency and avoids duplication
     * while providing reusable functionality across different parts of the system.
     * 
     * The functions in this collection are designed to be lightweight, efficient, and
     * focused on solving common problems encountered throughout the toast notification
     * lifecycle, such as device detection and general helper operations.
     * 
     * @author Pedro Rigolin
     * @namespace toastletGeneralHelper
     * @type {Object}
     * @readonly
     */
    const toastletGeneralHelper = objDeepFreeze({

        isMobile: () => {

            return !(window.innerWidth > 768 && toastletMatchMedia.anyHover.matches && toastletMatchMedia.pointerFine);

        },

    });

    /**
     * Class manipulation utility functions collection
     * 
     * This object contains specialized utility functions for CSS class management
     * throughout the toast notification system. These functions provide efficient,
     * safe, and consistent class manipulation capabilities while maintaining high
     * performance through various optimization techniques.
     * 
     * Key optimizations implemented:
     * - Set-based deduplication: Uses Set objects to automatically eliminate duplicate classes
     * - Early validation and continuation: Skips invalid inputs without processing
     * - Efficient string cleaning: Uses pre-compiled regex for whitespace normalization
     * - Optional forced reflow: Supports explicit DOM reflow triggering when needed
     * - Spread operator optimization: Leverages native classList methods for bulk operations
     * 
     * These utilities centralize class management logic, ensuring consistent behavior
     * across the entire codebase while providing performance benefits through
     * optimized algorithms and reduced DOM manipulation overhead.
     * 
     * @author Pedro Rigolin
     * @namespace toastletClassHelper
     * @type {Object}
     * @readonly
     */
    const toastletClassHelper = objDeepFreeze({

        mergeClasses: (...classes) => {

            const classList = new Set();

            const len = classes.length;

            for(let i = 0; i < len; i++){

                let el = classes[i];

                if( ! toastletTypeValidators.array(el) && ! toastletTypeValidators.string(el) ) continue;

                if( toastletTypeValidators.string(el) )
                    el = el.replace(space_uni_regex, ' ').trim().split(space_regex);

                const len2 = el.length;

                for(let j = 0; j < len2; j++){

                    const el2 = el[j];

                    if( ! toastletTypeValidators.string(el2) ) continue;

                    const string = el2.replace(space_uni_regex, '');

                    if( toastletTypeValidators.empty(string) || classList.has(string) ) continue;

                    classList.add(string);

                }

            }

            return Array.from(classList);

        },
        
        explodeClasses: (...classes) => {

            const classList = new Set();

            const len = classes.length;

            for(let i = 0; i < len; i++){

                const el = classes[i];

                if( ! toastletTypeValidators.string(el) ) continue;

                const classString = el.replace(space_uni_regex, ' ').trim();

                const array = classString.split(space_regex);

                const len2 = array.length;

                for(let j = 0; j < len2; j++){

                    const el2 = array[j].replace(space_uni_regex, '');

                    if( toastletTypeValidators.empty(el2) || classList.has(el2) ) continue;

                    classList.add(el2);

                }

            }

            return Array.from(classList);

        },

        implodeClasses: (...classes) => {

            return toastletClassHelper.mergeClasses(...classes).join(' ');

        },

        addClasses: (element, ...classes) => {

            if( toastletTypeValidators.empty(classes) ) return;

            const reflow = classes[classes.length - 1] === true;

            element.classList.add(...toastletClassHelper.mergeClasses(...classes));

            if( reflow ) void element.offsetWidth; // Force reflow

        },

        removeClasses: (element, ...classes) => {

            if( toastletTypeValidators.empty(classes) ) return;

            const reflow = classes[classes.length - 1] === true;

            element.classList.remove(...toastletClassHelper.mergeClasses(...classes));

            if( reflow ) void element.offsetWidth; // Force reflow

        },

        replaceClassList: (element, ...classes) => {

            if( toastletTypeValidators.empty(classes) ) return;

            const reflow = classes[classes.length - 1] === true;

            element.className = toastletClassHelper.implodeClasses(...classes);

            if( reflow ) void element.offsetWidth; // Force reflow

        }

    });

    /**
     * CSS style manipulation utility functions collection
     * 
     * This object contains specialized utility functions for CSS style property management
     * throughout the toast notification system. These functions provide safe, efficient,
     * and consistent style manipulation capabilities with built-in validation and
     * performance optimizations.
     * 
     * Key optimizations implemented:
     * - Map-based property storage: Uses Map objects for efficient key-value management
     * - Reverse while loop iteration: More efficient iteration pattern for better performance
     * - Input validation and sanitization: Prevents invalid property assignments
     * - Batch processing: Groups multiple style operations for optimal DOM performance
     * - Optional forced reflow: Supports explicit layout recalculation when needed
     * - Computed style caching: Efficiently retrieves and organizes computed style values
     * 
     * The functions handle CSS custom properties, standard properties, and provide
     * comprehensive error handling while maintaining optimal performance through
     * reduced DOM access and efficient data structures.
     * 
     * @author Pedro Rigolin
     * @namespace toastletStyleHelper
     * @type {Object}
     * @readonly
     */
    const toastletStyleHelper = objDeepFreeze({

        setProperties: (element, ...properties) => {

            if( toastletTypeValidators.empty(properties) ) return;

            const reflow = properties[properties.length - 1] === true;

            const sanitizedProperties = new Map();

            let i = properties.length;

            while(i--){

                if( ! toastletTypeValidators.array(properties[i]) ) continue;

                let sanitizedArray = [];

                let error = false;

                for(let j=0, len=properties[i].length; j<len && j < 4; j++){

                    if( ! toastletTypeValidators.string(properties[i][j]) ) {
                        error = true;
                        break;
                    }

                    const property = properties[i][j].trim();

                    sanitizedArray.push(property);

                }

                if( error || sanitizedArray.length < 2 || sanitizedProperties.has(sanitizedArray[0]) ) continue;
               
                sanitizedProperties.set(sanitizedArray[0], sanitizedArray);

            }
            
            for( const [property, value] of sanitizedProperties ){
                
                element.style.setProperty(...value);

            }

            if( reflow ) void element.offsetWidth; // Force reflow

        },

        getProperties: (element, ...properties) => {

            if( toastletTypeValidators.empty(properties) ) return;

            if( properties[properties.length - 1] === true )
                void element.offsetWidth; // Force reflow

            const sanitizedProperties = new Set();

            let i = properties.length;

            while(i--){

                if( ! toastletTypeValidators.string(properties[i]) ) continue;

                const property = properties[i].trim();

                if( toastletTypeValidators.empty(property) ) continue;

                sanitizedProperties.add(property);

            }

            const propertiesObject = {};

            const computedStyle = window.getComputedStyle(element);

            for( const property of sanitizedProperties ){

                propertiesObject[property] = computedStyle.getPropertyValue(property);

            }

            return propertiesObject;

        },

        removeProperties: (element, ...properties) => {

            if( toastletTypeValidators.empty(properties) ) return;

            const reflow = properties[properties.length - 1] === true;

            const sanitizedProperties = new Set();

            let i = properties.length;

            while(i--){

                if( ! toastletTypeValidators.string(properties[i]) ) continue;

                const property = properties[i].trim();

                if( toastletTypeValidators.empty(property) ) continue;

                sanitizedProperties.add(property);

            }

            for( const property of sanitizedProperties ){

                element.style.removeProperty(property);

            }

            if( reflow ) void element.offsetWidth; // Force reflow

        },

    });

    /**
     * HTML attribute manipulation utility functions collection
     * 
     * This object contains specialized utility functions for HTML attribute management
     * throughout the toast notification system. These functions provide secure, efficient,
     * and consistent attribute manipulation capabilities with comprehensive validation
     * and performance optimizations for accessibility and DOM operations.
     * 
     * Key optimizations implemented:
     * - Map-based attribute storage: Uses Map objects for efficient attribute management
     * - Reverse while loop iteration: Optimized iteration pattern for superior performance
     * - Comprehensive input validation: Prevents malformed or dangerous attribute assignments
     * - Batch processing operations: Groups multiple attribute changes for minimal DOM impact
     * - Optional forced reflow: Supports explicit layout recalculation when required
     * - Set-based deduplication: Automatically eliminates duplicate attribute operations
     * 
     * These utilities are particularly important for accessibility (ARIA attributes),
     * data attributes, and other HTML attribute operations while ensuring security
     * through proper validation and maintaining optimal performance through
     * efficient algorithms and reduced DOM manipulation overhead.
     * 
     * @author Pedro Rigolin
     * @namespace toastletAttributeHelper
     * @type {Object}
     * @readonly
     */
    const toastletAttributeHelper = objDeepFreeze({

        setAttributes: (element, ...attributes) => {

            if( toastletTypeValidators.empty(attributes) ) return;

            const reflow = attributes[attributes.length - 1] === true;

            const sanitizedAttributes = new Map();

            let i = attributes.length;

            while(i--){

                if( ! toastletTypeValidators.array(attributes[i]) ) continue;

                let sanitizedArray = [];

                let error = false;

                for(let j=0, len=attributes[i].length; j<len && j < 3; j++){

                    if( ! toastletTypeValidators.string(attributes[i][j]) ) {
                        error = true;
                        break;
                    }

                    const attribute = attributes[i][j].trim();

                    sanitizedArray.push(attribute);

                }

                if( error || sanitizedArray.length < 2 || sanitizedAttributes.has(sanitizedArray[0]) ) continue;
               
                sanitizedAttributes.set(sanitizedArray[0], sanitizedArray);

            }
            
            for( const [attribute, value] of sanitizedAttributes ){
                
                element.setAttribute(...value);

            }

            if( reflow ) void element.offsetWidth; // Force reflow

        },

        getAttributes: (element, ...attributes) => {

            if( toastletTypeValidators.empty(attributes) ) return;

            const sanitizedAttributes = new Set();

            let i = attributes.length;

            while(i--){

                if( ! toastletTypeValidators.string(attributes[i]) ) continue;

                const attribute = attributes[i].trim();

                if( toastletTypeValidators.empty(attribute) ) continue;

                sanitizedAttributes.add(attribute);

            }

            const attributesObject = {};

            for( const attribute of sanitizedAttributes ){

                attributesObject[attribute] = element.getAttribute(attribute);

            }

            return attributesObject;

        },

        removeAttributes: (element, ...attributes) => {

            if( toastletTypeValidators.empty(attributes) ) return;

            const reflow = attributes[attributes.length - 1] === true;

            const sanitizedAttributes = new Set();

            let i = attributes.length;

            while(i--){

                if( ! toastletTypeValidators.string(attributes[i]) ) continue;

                const attribute = attributes[i].trim();

                if( toastletTypeValidators.empty(attribute) ) continue;

                sanitizedAttributes.add(attribute);

            }

            for( const attribute of sanitizedAttributes ){

                element.removeAttribute(attribute);

            }

            if( reflow ) void element.offsetWidth; // Force reflow

        }

    });

    const toastletInstances = Object.seal({

        all: new Map(), // Store all toast elements by ID

        nonStackable: new Map(), // Store non-stackable toast IDs

        stackable: new Map(), // Store stackable toast IDs

        id: 0,

        lastId: 0,

        push: objFreeze( (toastInstance) => {

            if(toastInstance === undefined || toastInstance === null) return;

            toastletInstances.all.set(toastletInstances.id, toastInstance);

            toastletInstances.lastId = toastletInstances.id;

            toastInstance.id = toastletInstances.lastId;

            toastletInstances.id++;

            if( toastInstance.config.stackable )
                toastletInstances.stackable.set(toastletInstances.lastId, toastInstance);
            else
                toastletInstances.nonStackable.set(toastletInstances.lastId, toastInstance);

        }),

        delete: objFreeze( (id) => {

            if( toastletInstances.all.has(id) ) toastletInstances.all.delete(id);

            if( toastletInstances.stackable.has(id) ) toastletInstances.stackable.delete(id);

            if( toastletInstances.nonStackable.has(id) ) toastletInstances.nonStackable.delete(id);

        }),

        getLastActiveId: objFreeze( () => {

            let lastId = toastletInstances.lastId;

            for( const [id] of toastletInstances.all ) lastId = id;

            return lastId;

        })

    });

    const toastletCore = objDeepFreeze({



    });

    // !! REMOVE AFTER TESTS!
    window.space_regex = space_regex; // For debugging purposes
    window.space_uni_regex = space_uni_regex; // For debugging purposes
    window.only_letters_regex = only_letters_regex; // For debugging purposes

    // !! REMOVE AFTER TESTS!
    window.objFreeze = objFreeze;
    window.objKeys = objKeys;
    window.objFullKeys = objFullKeys;
    window.objDeepFreeze = objDeepFreeze;
    window.toastletTypeValidators = toastletTypeValidators;
    window.toastletGeneralHelper = toastletGeneralHelper;
    window.toastletStyleHelper = toastletStyleHelper;
    window.toastletClassHelper = toastletClassHelper;
    window.toastletAttributeHelper = toastletAttributeHelper;
    window.toastletInstances = toastletInstances;
    window.toastletCore = toastletCore;

    Object.defineProperty(window, 'toastletNotify', {

        value: objDeepFreeze({

            presets: {

                classes: { 
                    // TODO: IMPLEMENTAÇÃO DAS CLASSES AQUI, PARA FICAR MAIS ORGANIZADO E FACILITAR A MANUTENÇÃO
                },

                icons: {

                    pause: `<svg class="toastlet-icon-svg toastlet-icon-pause" width="16" height="16" viewBox="0 0 448 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"/></svg>`,

                    play: `<svg class="toastlet-icon-svg toastlet-icon-play" width="16" height="16" viewBox="0 0 448 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/></svg>`,

                    close: `<svg class="toastlet-icon-close toastlet-icon-svg" fill="#FFFFFF" height="16" viewBox="-53 23 490 490" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M374.3 85.3c-21.9-21.9-57.5-21.9-79.4 0L192 188.1 89.1 85.3c-21.9-21.9-57.5-21.9-79.4 0s-21.9 57.5 0 79.4L112.6 267.5 9.7 370.3c-21.9 21.9-21.9 57.5 0 79.4s57.5 21.9 79.4 0L192 346.9l102.9 102.8c21.9 21.9 57.5 21.9 79.4 0s21.9-57.5 0-79.4L271.4 267.5 374.3 164.7c21.9-21.9 21.9-57.5 0-79.4z"/></svg>`

                },

                styles: {

                    toast: {

                        desktop: [
                            [`overflow`, `hidden`],
                            [`margin`, `0`],
                            [`padding`, `15px`],
                            [`z-index`, `999999`],
                            [`color`, `#fff`],
                            [`box-shadow`, `0 6px 28px 0 rgb(0 0 0 / .1)`],
                            [`display`, `grid`],
                            [`justify-content`, `space-between`],
                            [`opacity`, `0`],
                            [`font-family`, `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`],
                            [`font-size`, `15px`],
                            [`line-height`, `1`],
                            [`touch-action`, `pan-y`],
                            [`-webkit-tap-highlight-color`, `transparent`],
                            [`user-select`, `none`]
                        ],
                        
                        mobile: [
                            [`overflow`, `hidden`],
                            [`margin`, `0`],
                            [`padding`, `15px`],
                            [`z-index`, `999999`],
                            [`color`, `#fff`],
                            [`box-shadow`, `0 6px 28px 0 rgb(0 0 0 / .1)`],
                            [`display`, `grid`],
                            [`justify-content`, `space-between`],
                            [`opacity`, `0`],
                            [`font-family`, `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`],
                            [`font-size`, `15px`],
                            [`line-height`, `1`],
                            [`margin`, `0`],
                            [`touch-action`, `pan-y`],
                            [`-webkit-tap-highlight-color`, `transparent`],
                            [`user-select`, `none`]
                        ]

                    },

                    iconCol: [
                        [`padding`, `0`],
                        [`display`, `flex`],
                        [`align-items`, `flex-start`]
                    ],

                    iconContainer: [
                        [`display`, `flex`],
                        [`flex-wrap`, `nowrap`],
                        [`align-items`, `center`],
                        [`justify-content`, `center`],
                        [`width`, `fit-content`],
                        [`height`, `fit-content`]
                    ],

                    contentCol: [
                        [`padding`, `0`],
                        [`display`, `flex`],
                        [`flex-direction`, `column`],
                        [`gap`, `10px`],
                        [`height`, `100%`]
                    ],

                    title: [
                        [`font-weight`, `600`],
                        [`font-size`, `18px`],
                        [`line-height`, `1`],
                        [`margin`, `0`],
                        [`padding`, `0`]
                    ],

                    content: [
                        [`word-break`, `break-word`],
                        [`white-space`, `pre-line`],
                        [`font-weight`, `400`],
                        [`line-height`, `1.5`],
                        [`margin`, `0`],
                        [`padding`, `0`],
                        [`height`, `100%`],
                        [`display`, `flex`],
                        [`align-content`, `center`],
                        [`flex-wrap`, `wrap`]
                    ],

                    controlCol: [
                        [`padding`, `0`],
                        [`display`, `flex`],
                        [`gap`, `12px`],
                        [`align-items`, `flex-start`],
                        [`transition`, `all 0.2s ease-in-out`]
                    ],

                    pauseButton: [
                        [`display`, `flex`],
                        [`flex-wrap`, `nowrap`],
                        [`align-items`, `center`],
                        [`justify-content`, `center`],
                        [`width`, `fit-content`],
                        [`height`, `fit-content`],
                        [`background`, `none`],
                        [`border`, `none`],
                        [`cursor`, `pointer`],
                        [`padding`, `0 2px`],
                        [`-webkit-tap-highlight-color`, `transparent`],
                        [`user-select`, `none`]
                    ],

                    closeButton: [
                        [`display`, `flex`],
                        [`flex-wrap`, `nowrap`],
                        [`align-items`, `center`],
                        [`justify-content`, `center`],
                        [`width`, `fit-content`],
                        [`height`, `fit-content`],
                        [`background`, `none`],
                        [`border`, `none`],
                        [`cursor`, `pointer`],
                        [`padding`, `0 2px`],
                        [`-webkit-tap-highlight-color`, `transparent`],
                        [`user-select`, `none`]
                    ],

                    progressBar: [
                        [`background-color`, `rgba(0,0,0,.15)`]
                    ],

                    progressBarThumb: [
                        [`background-color`, `rgba(255, 255, 255, 0.7)`]
                    ]
                    
                },

                types: {

                    warning: {
                        type: 'warning',
                        color: '#F39C12', 
                        icon: `<svg class="toastlet-icon-svg toastlet-icon-type" width="18" height="18" viewBox="0 0 512 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"/></svg>`,
                        class: 'toastlet-warning',
                        config: {
                            a11y: {
                                role: 'alert',
                                ariaLive: 'assertive',
                            },
                            titleText: 'Warning'
                        }
                    },

                    info: {
                        type: 'info',
                        color: '#3498DB', 
                        icon: `<svg class="toastlet-icon-svg toastlet-icon-type" width="18" height="18" viewBox="0 0 512 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"/></svg>`,
                        class: 'toastlet-info',
                        config: {
                            a11y: {
                                role: 'status',
                                ariaLive: 'polite'
                            },
                            titleText: 'Info'
                        }
                    },

                    success: {
                        type: 'success',
                        color: '#00bc8c', 
                        icon: `<svg class="toastlet-icon-svg toastlet-icon-type" width="18" height="18" viewBox="0 0 512 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"/></svg>`,
                        class: 'toastlet-success',
                        config: {
                            a11y: {
                                role: 'status',
                                ariaLive: 'polite'
                            },
                            titleText: 'Success!'
                        }
                    },

                    error: {
                        type: 'error',
                        color: '#E74C3C', 
                        icon: `<svg class="toastlet-icon-svg toastlet-icon-type" width="18" height="18" viewBox="0 0 576 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"/></svg>`,
                        class: 'toastlet-error',
                        config: {
                            a11y: {
                                role: 'alert',
                                ariaLive: 'assertive'
                            },
                            titleText: 'Error!'
                        }
                    },

                    notice: {
                        type: 'notice',
                        color: '#708090', 
                        icon: `<svg class="toastlet-icon-svg toastlet-icon-type" width="18" height="18" viewBox="0 0 448 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"/></svg>`,
                        class: 'toastlet-notice',
                        config: {
                            a11y: {
                                role: 'status',
                                ariaLive: 'polite'
                            },
                            titleText: 'Notice'
                        }
                    },

                    loading: {
                        type: 'loading',
                        color: '#1a6394',
                        icon: `<svg class="toastlet-icon-svg toastlet-icon-type" width="18px" height="18px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke-width="10" stroke-linecap="round" stroke="#FFFFFF" cx="33" cy="33" r="28" stroke-dasharray="94 94"><animateTransform attributeName="transform" type="rotate" from="0 33 33" to="360 33 33" dur="1s" repeatCount="indefinite" /></circle></svg>`,
                        class: 'toastlet-loading',
                        config: {
                            dismissible: false,
                            sticky: true,
                            a11y: {
                                role: 'status',
                                ariaLive: 'polite'
                            },
                            titleText: 'Loading...'
                        }
                    },

                    custom: {
                        type: 'custom',
                        color: '#4A4A4A',
                        icon: `<svg class="toastlet-icon-svg toastlet-icon-type" width="18" height="18" viewBox="0 0 576 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M263.4-27L278.2 9.8 315 24.6c3 1.2 5 4.2 5 7.4s-2 6.2-5 7.4L278.2 54.2 263.4 91c-1.2 3-4.2 5-7.4 5s-6.2-2-7.4-5L233.8 54.2 197 39.4c-3-1.2-5-4.2-5-7.4s2-6.2 5-7.4L233.8 9.8 248.6-27c1.2-3 4.2-5 7.4-5s6.2 2 7.4 5zM110.7 41.7l21.5 50.1 50.1 21.5c5.9 2.5 9.7 8.3 9.7 14.7s-3.8 12.2-9.7 14.7l-50.1 21.5-21.5 50.1c-2.5 5.9-8.3 9.7-14.7 9.7s-12.2-3.8-14.7-9.7L59.8 164.2 9.7 142.7C3.8 140.2 0 134.4 0 128s3.8-12.2 9.7-14.7L59.8 91.8 81.3 41.7C83.8 35.8 89.6 32 96 32s12.2 3.8 14.7 9.7zM464 304c6.4 0 12.2 3.8 14.7 9.7l21.5 50.1 50.1 21.5c5.9 2.5 9.7 8.3 9.7 14.7s-3.8 12.2-9.7 14.7l-50.1 21.5-21.5 50.1c-2.5 5.9-8.3 9.7-14.7 9.7s-12.2-3.8-14.7-9.7l-21.5-50.1-50.1-21.5c-5.9-2.5-9.7-8.3-9.7-14.7s3.8-12.2 9.7-14.7l50.1-21.5 21.5-50.1c2.5-5.9 8.3-9.7 14.7-9.7zM460 0c11 0 21.6 4.4 29.5 12.2l42.3 42.3C539.6 62.4 544 73 544 84s-4.4 21.6-12.2 29.5l-88.2 88.2-101.3-101.3 88.2-88.2C438.4 4.4 449 0 460 0zM44.2 398.5L308.4 134.3 409.7 235.6 145.5 499.8C137.6 507.6 127 512 116 512s-21.6-4.4-29.5-12.2L44.2 457.5C36.4 449.6 32 439 32 428s4.4-21.6 12.2-29.5z"/></svg>`,
                        class: 'toastlet-custom',
                        config: {
                            a11y: {
                                role: 'status',
                                ariaLive: 'polite',
                            },
                            titleText: 'Custom'
                        }
                    },

                    get: (type) => {

                        if ( ! toastletTypeValidators.string(type) ) return false;

                        type = type.replace(only_letters_regex, '').toLowerCase();

                        if( ! toastletNotify.presets.types.hasOwnProperty(type) ) return false;

                        return toastletNotify.presets.types[type];

                    }

                },

                progressBar: {

                    available: {

                        righttoleft: {
                            name: 'right-to-left',
                            flexDirection: 'row-reverse',
                            start: '0%',
                            end: '100%'
                        },

                        lefttoright: {
                            name: 'left-to-right',
                            flexDirection: 'row',
                            start: '0%',
                            end: '100%'
                        }

                    },

                    array: ['right-to-left', 'left-to-right'],

                    get: (direction) => {

                        if ( ! toastletTypeValidators.string(direction) ) return false;

                        direction = direction.replace(only_letters_regex, '').toLowerCase();

                        if( ! toastletNotify.presets.progressBar.available.hasOwnProperty(direction) ) return false;

                        return toastletNotify.presets.progressBar.available[direction];

                    }

                }

            },

            timeouts: {

                clearTimeout: (toastInstance, key) => {

                    if( ! toastInstance.timeoutIDs && ! toastInstance.timeoutIDs[key] ) return;

                    clearTimeout(toastInstance.timeoutIDs[key]);

                    toastInstance.timeoutIDs[key] = null;

                },

                pauseTimer: (toastInstance) => {

                    if( ! toastInstance.timeoutIDs.close ) return;
                    
                    toastInstance.timer.end = performance.now();

                    clearTimeout(toastInstance.timeoutIDs.close);

                    toastInstance.timeoutIDs.close = null;

                    if(toastInstance.config.progressBar.enabled) {

                        const width = Math.min( 100, ( toastInstance.timer.elapsed / toastInstance.config.duration ) * 100 );

                        toastletStyleHelper.setProperties(
                            toastInstance.progressBarThumb,
                            ['width', `${width}%`, 'important'],
                            ['transition', 'none', 'important'],
                            true
                        );

                    }
                    
                },             
                
                startTimer: (toastInstance) => {

                    if(
                        ! toastInstance.toast ||
                        toastInstance.isClosing || 
                        toastInstance.isSticky ||
                        toastInstance.isPaused
                    ) return;

                    toastletNotify.timeouts.pauseTimer(toastInstance);

                    if(toastInstance.config.progressBar.enabled) {

                        // First, define the initial position of the progress bar and use transition none 
                        // with trigger reflow for immediate application of the progress bar's initial position
                        toastletStyleHelper.setProperties(
                            toastInstance.progressBarThumb,
                            ['width', toastInstance.config.progressBar.data.start, 'important'],
                            ['transition', 'none', 'important'],
                            true
                        );

                        // Then, set the transition duration to match the toast's duration and update the width 
                        // to the final position. This creates a synchronized progress effect where the progress 
                        // bar smoothly animates from its initial position to the final position over the exact 
                        // same time it takes for the toast to auto-close, ensuring perfect timing synchronization 
                        // between the progress bar animation and the toast's lifecycle
                        toastletStyleHelper.setProperties(
                            toastInstance.progressBarThumb,
                            ['transition', toastInstance.transitionRule.progressBar.join(' '), 'important'],
                            ['width', toastInstance.config.progressBar.data.end, 'important'],
                            true
                        );

                    }

                    toastInstance.timer.start = performance.now();

                    toastInstance.timeoutIDs.close = setTimeout(toastletNotify.utils.closeToast, toastInstance.config.duration, toastInstance);

                },

                resumeTimer: (toastInstance) => {

                    if( 
                        ! toastInstance.toast || 
                        toastInstance.isClosing || 
                        toastInstance.isSticky ||
                        toastInstance.isPaused
                    ) return;

                    const remaining = Math.max( 0, toastInstance.config.duration - toastInstance.timer.elapsed );

                    if(toastInstance.config.progressBar.enabled) {

                        const width = Math.min( 100, ( toastInstance.timer.elapsed / toastInstance.config.duration ) * 100 );

                        toastletStyleHelper.setProperties(
                            toastInstance.progressBarThumb,
                            ['width', `${width}%`, 'important'],
                            ['transition', 'none', 'important'],
                            true
                        );

                        toastletStyleHelper.setProperties(
                            toastInstance.progressBarThumb,
                            ['transition', `all ${remaining}ms linear`, 'important'],
                            ['width', toastInstance.config.progressBar.data.end, 'important'],
                            true
                        );

                    }
                    
                    // This is a kind of hack to ensure the timer's elapsed time is always correct,
                    // so it subtracts the current time by the elapsed time before pausing,
                    // creating a simulated time as if the toast had been launched earlier but never paused
                    toastInstance.timer.start = performance.now() - toastInstance.timer.elapsed;

                    toastInstance.timeoutIDs.close = setTimeout(toastletNotify.utils.closeToast, remaining, toastInstance);

                },

                playTimer: (toastInstance) => {

                    if( 
                        ! toastInstance.toast || 
                        toastInstance.isClosing || 
                        toastInstance.isSticky 
                    ) return;

                    if( toastInstance.timer.start === null || toastInstance.config.pause.resumeStrategy === 'restart' ) {

                        toastletNotify.timeouts.startTimer(toastInstance);

                        return;

                    }
                    
                    toastletNotify.timeouts.resumeTimer(toastInstance);

                },

                pointerEvent: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ) return;

                    toastInstance.isPointerEvent = false;

                    clearTimeout(toastInstance.timeoutIDs.pointerEvent);

                    toastInstance.timeoutIDs.pointerEvent = null;

                },

                touchEvent: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ) return;

                    toastInstance.isTouchEvent = false;

                },

                clickInProgress: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ) return;

                    toastInstance.isClickInProgress = false;

                },

                focusin: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ) return;

                    toastInstance.isFocusHovered = true;

                    toastletNotify.utils.shButtons(toastInstance);

                    if(toastInstance.config.pause.focus) {

                        toastInstance.isPausedByFocus = true;

                        toastletNotify.timeouts.pauseTimer(toastInstance);   

                    }

                },

                focusout: (toastInstance) => {
                
                    if( ! toastInstance.toast || toastInstance.isClosing || toastInstance.toast.contains(document.activeElement) ) return;

                    toastInstance.isFocusHovered = false;
                    
                    toastletNotify.utils.shButtons(toastInstance);

                    if(toastInstance.config.pause.focus) {

                        toastInstance.isPausedByFocus = false;
                        
                        toastletNotify.timeouts.playTimer(toastInstance);                    

                    }

                },
                
                blur: (toastInstance, blurElement) => {

                    if( ! toastInstance.toast || toastInstance.isClosing || ! blurElement ) return;

                    blurElement.blur();

                },

                focus: (toastInstance, focusElement) => {

                    if( ! toastInstance.toast || toastInstance.isClosing || ! focusElement ) return;

                    focusElement.focus();

                },

                pauseButtonPointerUp: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing || !toastInstance.pauseButton ) return;

                    toastInstance.pauseButtonPointerDown = false;

                    clearTimeout(toastInstance.timeoutIDs.pauseButtonPointerUp);

                    toastInstance.timeoutIDs.pauseButtonPointerUp = null;

                },

                closeButtonPointerUp: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing || !toastInstance.closeButton ) return;

                    toastInstance.closeButtonPointerDown = false;

                    clearTimeout(toastInstance.timeoutIDs.closeButtonPointerUp);

                    toastInstance.timeoutIDs.closeButtonPointerUp = null;

                },

                remove: (toastInstance) => {

                    if( ! toastInstance.toast ) return;

                    toastInstance.isClosing = true;

                    toastletNotify.timeouts.pauseTimer(toastInstance);

                    let keys = objFullKeys(toastInstance.timeoutIDs);

                    let i = keys.length;

                    while(i--) toastletNotify.timeouts.clearTimeout(toastInstance, keys[i]);

                    i = toastInstance.listeners.length;

                    while(i--) {

                        const listener = toastInstance.listeners[i];

                        listener.element.removeEventListener(
                            listener.event,
                            listener.handler
                        );

                    }

                    i = toastInstance.observers.length;

                    while(i--)  toastInstance.observers[i].observer.disconnect();

                    toastInstance.toast.remove();

                    toastletInstances.delete(toastInstance.id);

                    keys = objFullKeys(toastInstance);

                    i = keys.length;

                    while(i--) delete toastInstance[keys[i]];

                }

            },
            
            animation: {

                setAnimationIn: (toastInstance) => {

                    if(
                        ! toastInstance.toast || 
                        toastInstance.isClosing || 
                        ! toastInstance.runAnimationIn ||
                        toastletTypeValidators.empty(toastInstance.classList.animationIn)
                    ) return;

                    toastletClassHelper.removeClasses(
                        toastInstance.toast,
                        toastInstance.classList.all
                    );

                    toastletClassHelper.replaceClassList(
                        toastInstance.toast,
                        toastInstance.classList[toastInstance.mode],
                        toastInstance.classList.animationIn,
                        ...toastInstance.toast.classList
                    );

                    toastletStyleHelper.setProperties(
                        toastInstance.toast,
                        ['animation-play-state', 'paused', 'important'],
                        true
                    );

                },

                setAnimationOut: (toastInstance) => {

                    if(
                        ! toastInstance.toast || 
                        ! toastInstance.isClosing || 
                        ! toastInstance.runAnimationOut ||
                        toastletTypeValidators.empty(toastInstance.classList.animationOut)
                    ) return;

                    toastletClassHelper.removeClasses(
                        toastInstance.toast,
                        toastInstance.classList.all
                    );

                    toastletClassHelper.replaceClassList(
                        toastInstance.toast,
                        toastInstance.classList[toastInstance.mode],
                        toastInstance.classList.animationOut,
                        ...toastInstance.toast.classList
                    );

                    toastletStyleHelper.setProperties(
                        toastInstance.toast,
                        ['animation-play-state', 'paused', 'important'],
                        true
                    );

                },
                
                getAnimationDuration: (toastInstance) => {

                    if( ! toastInstance.toast ) return 0;

                    const style = toastletStyleHelper.getProperties(
                        toastInstance.toast,
                        'animation-name',
                        'animation-duration',
                        'animation-delay'
                    );

                    if(style['animation-name'] === 'none' || style['animation-name'].length === 0)
                        return toastInstance.config.transition.duration;

                    const animationDuration = style['animation-duration'].replace(space_uni_regex, '').split(',');

                    const animationDelay = style['animation-delay'].replace(space_uni_regex, '').split(',');

                    let maxTime = 0;

                    let i = animationDuration.length;

                    while(i--) {

                        const duration = parseFloat(animationDuration[i] || 0) * 1000;

                        const delay = parseFloat(animationDelay[i] || 0) * 1000;

                        let total = 0;

                        if( toastletTypeValidators.unsignedNumber(duration) )
                            total = total + duration;

                        if( toastletTypeValidators.unsignedNumber(delay) )
                            total = total + delay;

                        if( total > maxTime )
                            maxTime = total;

                    }

                    return maxTime;

                },

                runAnimationIn: (toastInstance) => {

                    if(
                        ! toastInstance.toast || 
                        toastInstance.isClosing
                    ) return;

                    const name = toastletStyleHelper.getProperties(
                        toastInstance.toast,
                        'animation-name'
                    );
                    
                    const customAnimation = (
                        toastInstance.runAnimationIn &&
                        !toastletTypeValidators.empty(toastInstance.classList.animationIn) &&
                        name['animation-name'] !== 'none' && 
                        name['animation-name'].length > 0
                    );

                    const animations = [];

                    if( customAnimation ){

                        animations.push( ['animation-play-state', 'running', 'important'] );

                        toastletStyleHelper.removeProperties(
                            toastInstance.toast,
                            'animation-delay',
                            'animation-duration',
                            true
                        );                        

                    }
                    else {

                        animations.push(
                            ['opacity', `1`],
                            ['transform', `translate(0px, 0px)`]
                        );

                    }

                    toastletStyleHelper.setProperties(
                        toastInstance.toast, 
                        ...animations, 
                        true
                    );

                },

                runAnimationOut: (toastInstance) => {

                    if(
                        ! toastInstance.toast || 
                        ! toastInstance.isClosing
                    ) return;

                    const name = toastletStyleHelper.getProperties(
                        toastInstance.toast,
                        'animation-name'
                    );

                    const customAnimation = (
                        toastInstance.runAnimationOut &&
                        !toastletTypeValidators.empty(toastInstance.classList.animationOut) &&
                        name['animation-name'] !== 'none' && 
                        name['animation-name'].length > 0
                    );

                    const animations = [];

                    if( customAnimation ){

                        animations.push( ['animation-play-state', 'running', 'important'] );

                        toastletStyleHelper.removeProperties(
                            toastInstance.toast,
                            'animation-delay',
                            'animation-duration',
                            true
                        );                         

                    }
                    else {                       

                        animations.push(
                            ['opacity', `0`],
                            ['transform', `translate(${toastInstance.translateOutX}, ${toastInstance.translateOutY})`]
                        );

                    }

                    toastletStyleHelper.setProperties(
                        toastInstance.toast, 
                        ...animations, 
                        true
                    );

                }

            },
            
            rAF: {

                restoreTransition: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ) return;

                    toastletStyleHelper.setProperties(
                        toastInstance.toast,
                        ['transition', toastInstance.transitionRule.toast.join(' ')]
                    );

                    toastInstance.rAF.restoreTransition.isScheduled = false;

                },

                enterElement: (toastInstance) => {
                    
                    if( ! toastInstance.toast || toastInstance.isClosing ) return;

                    if( toastInstance.config.pause.inactiveTab && toastInstance.inactiveTab ){

                        toastInstance.isPausedByInactiveTab = true; 
                        
                        toastInstance.enterElement = false;

                        return;

                    }

                    toastInstance.enterElement = true;

                    const animationDuration = toastletNotify.animation.getAnimationDuration(toastInstance);

                    toastletNotify.animation.runAnimationIn(toastInstance);

                    setTimeout(toastletNotify.timeouts.startTimer, animationDuration + 20, toastInstance);

                }

            },

            position: {

                set: {

                    progressBar: (toastInstance) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing || 
                            toastInstance.isSticky || 
                            ! toastInstance.config.progressBar.enabled ||
                            toastInstance.progressBar === undefined ||
                            toastInstance.progressBarThumb === undefined
                        ) return;

                        // Reset any previously set styles to ensure consistent positioning

                        toastletStyleHelper.setProperties(
                            toastInstance.progressBar,
                            ...toastInstance.defaultStyles.progressBar
                        );

                        toastletStyleHelper.setProperties(
                            toastInstance.progressBarThumb,
                            ...toastInstance.defaultStyles.progressBarThumb
                        );

                    },

                    desktop: {

                        setDefault: (toastInstance) => {
                            
                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // Reset any previously set styles to ensure consistent positioning
                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ...toastInstance.defaultStyles.toast.desktop,
                                true
                            );

                            toastletNotify.position.set.progressBar(toastInstance);

                            // Resetting classes and applying new classes according to the mode
                            // and in the correct order to ensure consistency
                            
                            toastletClassHelper.removeClasses(
                                toastInstance.toast,
                                toastInstance.classList.all
                            );

                            toastletClassHelper.replaceClassList(
                                toastInstance.toast,
                                toastInstance.classList.desktop,
                                toastInstance.classList.animationIn,
                                ...toastInstance.toast.classList
                            );

                            /* 
                                When the animation class is reapplied the browser would normally replay the animation. 
                                To avoid a visible replay we temporarily set inline animation-delay and 
                                animation-duration to 0 and force animation-play-state to running. 
                                The final true forces a reflow so the inline styles are applied immediately, 
                                leaving the element in the animation's final state without visually replaying it. 
                                The helpers animation.runAnimationIn and animation.runAnimationOut later remove 
                                these inline styles so the animation class' normal CSS rules can take effect again. 
                            */

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['animation-delay', '0s', 'important'],
                                ['animation-duration', '0s', 'important'],
                                ['animation-play-state', 'running', 'important'],
                                true
                            );                        

                            /* 
                                The toast is deliberately left with transition: none while we apply style and 
                                position changes so those adjustments don't animate visibly. After all updates 
                                are applied we schedule a restoration of the original transition on the next 
                                animation frame. The isScheduled flag prevents scheduling multiple 
                                requestAnimationFrame callbacks for the same frame. The scheduled 
                                toastInstance.rAF.restoreTransition.fn will reapply the original transition 
                                and clear the isScheduled flag. 
                            */

                            if( ! toastInstance.rAF.restoreTransition.isScheduled ) {

                                toastInstance.rAF.restoreTransition.isScheduled = true;

                                requestAnimationFrame(toastInstance.rAF.restoreTransition.fn);

                            }

                        },

                        topRight: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // First apply the default desktop styles to ensure a consistent base state
                            toastletNotify.position.set.desktop.setDefault(toastInstance);

                            // Setting position properties

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['top', '20px'],
                                ['right', '20px'],
                                ['left', 'auto'],
                                ['bottom', 'auto'],
                                true
                            );

                            toastInstance.translateOutY = '-20px';

                        },

                        topMiddle: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // First apply the default desktop styles to ensure a consistent base state
                            toastletNotify.position.set.desktop.setDefault(toastInstance);

                            // Getting the width of the toast to center it horizontally
                            const toastWidth = toastInstance.toast.getBoundingClientRect().width;

                            // Setting position properties

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['top', '20px'],
                                ['left', `calc(50vw - ${toastWidth/2}px)`],
                                ['right', 'auto'],
                                ['bottom', 'auto'],
                                true
                            );

                            toastInstance.translateOutY = '-20px';

                        },

                        topLeft: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // First apply the default desktop styles to ensure a consistent base state
                            toastletNotify.position.set.desktop.setDefault(toastInstance);

                            // Setting position properties

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['top', '20px'],
                                ['right', 'auto'],
                                ['left', '20px'],
                                ['bottom', 'auto'],
                                true
                            );

                            toastInstance.translateOutY = '-20px';

                        },

                        bottomRight: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // First apply the default desktop styles to ensure a consistent base state
                            toastletNotify.position.set.desktop.setDefault(toastInstance);

                            // Setting position properties

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['top', 'auto'],
                                ['right', '20px'],
                                ['left', 'auto'],
                                ['bottom', '20px'],
                                true
                            );

                            toastInstance.translateOutY = '20px';

                        },

                        bottomMiddle: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // First apply the default desktop styles to ensure a consistent base state
                            toastletNotify.position.set.desktop.setDefault(toastInstance);

                            // Getting the width of the toast to center it horizontally
                            const toastWidth = toastInstance.toast.getBoundingClientRect().width;

                            // Setting position properties

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['top', 'auto'],
                                ['left', `calc(50vw - ${toastWidth/2}px)`],
                                ['right', 'auto'],
                                ['bottom', '20px'],
                                true
                            );

                            toastInstance.translateOutY = '20px';

                        },

                        bottomLeft: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // First apply the default desktop styles to ensure a consistent base state
                            toastletNotify.position.set.desktop.setDefault(toastInstance);

                            // Setting position properties

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['top', 'auto'],
                                ['right', 'auto'],
                                ['left', '20px'],
                                ['bottom', '20px'],
                                true
                            );

                            toastInstance.translateOutY = '20px';

                        }

                    },

                    mobile: {

                        setDefault: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // Calculate the minimum width between the viewport width and 500px
                            // I don't use CSS min(100vw, '500px') to support older browsers
                            const minWidth = Math.min(window.innerWidth, 500);

                            // Reset any previously set styles to ensure consistent positioning

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ...toastInstance.defaultStyles.toast.mobile,
                                ['min-width', `${minWidth}px`],
                                true
                            );

                            toastletNotify.position.set.progressBar(toastInstance);

                            // Resetting classes and applying new classes according to the mode
                            // and in the correct order to ensure consistency                        

                            toastletClassHelper.removeClasses(
                                toastInstance.toast,
                                toastInstance.classList.all
                            );

                            toastletClassHelper.replaceClassList(
                                toastInstance.toast,
                                toastInstance.classList.mobile,
                                toastInstance.classList.animationIn,
                                ...toastInstance.toast.classList
                            );

                            /* 
                                When the animation class is reapplied the browser would normally replay the animation. 
                                To avoid a visible replay we temporarily set inline animation-delay and 
                                animation-duration to 0 and force animation-play-state to running. 
                                The final true forces a reflow so the inline styles are applied immediately, 
                                leaving the element in the animation's final state without visually replaying it. 
                                The helpers animation.runAnimationIn and animation.runAnimationOut later remove 
                                these inline styles so the animation class' normal CSS rules can take effect again. 
                            */

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['animation-delay', '0s', 'important'],
                                ['animation-duration', '0s', 'important'],
                                ['animation-play-state', 'running', 'important'],
                                true
                            );

                            /* 
                                The toast is deliberately left with transition: none while we apply style and 
                                position changes so those adjustments don't animate visibly. After all updates 
                                are applied we schedule a restoration of the original transition on the next 
                                animation frame. The isScheduled flag prevents scheduling multiple 
                                requestAnimationFrame callbacks for the same frame. The scheduled 
                                toastInstance.rAF.restoreTransition.fn will reapply the original transition 
                                and clear the isScheduled flag. 
                            */                        

                            if( ! toastInstance.rAF.restoreTransition.isScheduled ) {

                                toastInstance.rAF.restoreTransition.isScheduled = true;

                                requestAnimationFrame(toastInstance.rAF.restoreTransition.fn);

                            }

                        },

                        top: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // First apply the default desktop styles to ensure a consistent base state
                            toastletNotify.position.set.mobile.setDefault(toastInstance);

                            // Getting the width of the toast to center it horizontally
                            const toastWidth = toastInstance.toast.getBoundingClientRect().width;

                            // Setting position properties

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['top', '0'],
                                ['left', `calc(50vw - ${toastWidth/2}px)`],
                                ['right', 'auto'],
                                ['bottom', 'auto'],
                                true
                            );

                            toastInstance.translateOutY = '-20px';

                        },

                        bottom: (toastInstance) => {

                            if( ! toastInstance.toast || toastInstance.isClosing ) return;

                            // First apply the default desktop styles to ensure a consistent base state
                            toastletNotify.position.set.mobile.setDefault(toastInstance);

                            // Getting the width of the toast to center it horizontally
                            const toastWidth = toastInstance.toast.getBoundingClientRect().width;

                            // Setting position properties

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['top', 'auto'],
                                ['left', `calc(50vw - ${toastWidth/2}px)`],
                                ['right', 'auto'],
                                ['bottom', '0'],
                                true
                            );

                            toastInstance.translateOutY = '20px';

                        }

                    }

                },

                get: {

                    available: {

                        desktop: {

                            top: {
                                name: 'topRight',
                                class: 'toastlet-top-right',
                                mobile: 'top'
                            },

                            topright: {
                                name: 'topRight',
                                class: 'toastlet-top-right',
                                mobile: 'top'
                            },

                            topmiddle: {
                                name: 'topMiddle',
                                class: 'toastlet-top-middle',
                                mobile: 'top'
                            },

                            topleft: {
                                name: 'topLeft',
                                class: 'toastlet-top-left',
                                mobile: 'top'
                            },
                            
                            bottom: {
                                name: 'bottomRight',
                                class: 'toastlet-bottom-right',
                                mobile: 'bottom'
                            },

                            bottomright: {
                                name: 'bottomRight',
                                class: 'toastlet-bottom-right',
                                mobile: 'bottom'
                            },

                            bottommiddle: {
                                name: 'bottomMiddle',
                                class: 'toastlet-bottom-middle',
                                mobile: 'bottom'
                            },

                            bottomleft: {
                                name: 'bottomLeft',
                                class: 'toastlet-bottom-left',
                                mobile: 'bottom'
                            }

                        },

                        mobile: {

                            top: {
                                name: 'top',
                                class: 'toastlet-top'
                            },

                            bottom: {
                                name: 'bottom',
                                class: 'toastlet-bottom'
                            }

                        },

                        array: {
                            desktop:  ['top', 'top-right', 'top-middle', 'top-left', 'bottom', 'bottom-right', 'bottom-middle', 'bottom-left'],
                            mobile:  ['top', 'bottom']
                        }

                    },

                    desktop: (position) => {

                        if( ! toastletTypeValidators.string(position) ) return false;

                        position = position.replace(only_letters_regex, '').toLowerCase();

                        if( ! toastletNotify.position.get.available.desktop.hasOwnProperty(position) ) return false;

                        return toastletNotify.position.get.available.desktop[position];

                    },

                    mobile: (position) => {

                        if( ! toastletTypeValidators.string(position) ) return false;

                        position = position.replace(only_letters_regex, '').toLowerCase();

                        if( ! toastletNotify.position.get.available.mobile.hasOwnProperty(position) ) return false;

                        return toastletNotify.position.get.available.mobile[position];

                    }

                }

            },
            
            utils: {

                enterElement: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ) return;
                    
                    if( ! toastInstance.config.stackable ) {

                        for( const [id, el] of toastletInstances.nonStackable ){

                            if( id === toastInstance.id ) continue;

                            toastletNotify.utils.closeToast(el);

                        }

                    }

                    if( toastInstance.config.pause.inactiveTab )
                        toastInstance.isPausedByInactiveTab = toastInstance.inactiveTab;
                    
                    if( ! toastInstance.rAF.enterElement.isScheduled ) {
                        toastInstance.rAF.enterElement.isScheduled = true;
                        requestAnimationFrame(toastInstance.rAF.enterElement.fn);
                    }
                
                },

                shButtons: (toastInstance) => {

                    if(
                        ! toastInstance.toast || 
                        toastInstance.isClosing ||
                        (toastInstance.isSticky && ! toastInstance.isDismissible) ||
                        ( ! toastInstance.config.pause.button && ! toastInstance.isDismissible )
                    ) return;

                    const mustBeVisible = !!(
                        toastInstance.isHovered ||
                        ( toastletGeneralHelper.isMobile() && ( toastInstance.config.onClick !== null || ! toastInstance.config.pause.touch ) )
                    );

                    if( mustBeVisible ){
                        
                        toastletStyleHelper.setProperties(
                            toastInstance.controlsCol,
                            ['visibility', 'visible'],
                            ['z-index', 'auto'],
                            ['opacity', '1']
                        );

                        if( toastInstance.pauseButton )
                            toastletStyleHelper.setProperties(
                                toastInstance.pauseButton,
                                ['pointer-events', 'auto']
                            );

                        if( toastInstance.closeButton )
                            toastletStyleHelper.setProperties(
                                toastInstance.closeButton,
                                ['pointer-events', 'auto']
                            );

                    }
                    else{
                        
                        toastletStyleHelper.setProperties(
                            toastInstance.controlsCol,
                            ['opacity', '0'],
                            ['visibility', 'hidden'],
                            ['z-index', '-10'],
                        );

                        if( toastInstance.pauseButton )
                            toastletStyleHelper.setProperties(
                                toastInstance.pauseButton,
                                ['pointer-events', 'none']
                            );

                        if( toastInstance.closeButton )
                            toastletStyleHelper.setProperties(
                                toastInstance.closeButton,
                                ['pointer-events', 'none']
                            );

                    }

                },

                togglePauseByButton: (toastInstance) => {
                    
                    if( 
                        ! toastInstance.toast || 
                        toastInstance.isClosing || 
                        toastInstance.isSticky ||
                        ! toastInstance.config.pause.button ||
                        ! toastInstance.pauseButton
                    ) return;

                    toastInstance.isPausedByButton = !toastInstance.isPausedByButton;

                    if (toastInstance.isPausedByButton) {
                        
                        toastInstance.pauseButton.innerHTML = toastletNotify.presets.icons.play;

                        toastletAttributeHelper.setAttributes(
                            toastInstance.pauseButton,
                            ['aria-label', 'Play notification timer']
                        );

                        toastletNotify.timeouts.pauseTimer(toastInstance);

                    }
                    else {
                        
                        toastInstance.pauseButton.innerHTML = toastletNotify.presets.icons.pause;

                        toastletAttributeHelper.setAttributes(
                            toastInstance.pauseButton,
                            ['aria-label', 'Pause notification timer']
                        );
                        
                        toastletNotify.timeouts.playTimer(toastInstance);

                    }

                },

                closeToast: (toastInstance) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ) return;

                    toastInstance.isClosing = true;

                    toastletNotify.timeouts.pauseTimer(toastInstance);

                    toastletNotify.animation.setAnimationOut(toastInstance);

                    const animationDuration = toastletNotify.animation.getAnimationDuration(toastInstance);

                    toastletNotify.animation.runAnimationOut(toastInstance);

                    setTimeout(toastletNotify.timeouts.remove, animationDuration + 20, toastInstance);

                }

            },

            handles: {

                toast: {

                    click: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing || 
                            ! e.isTrusted || 
                            toastInstance.isClickInProgress ||
                            toastInstance.config.onClick === null ||
                            typeof toastInstance.config.onClick !== 'function' ||
                            toastInstance.clickControl.disabled ||
                            (toastInstance.pauseButton && toastInstance.pauseButton.contains(e.target)) ||
                            (toastInstance.closeButton && toastInstance.closeButton.contains(e.target))
                        ) return;

                        e.stopPropagation();

                        toastInstance.isClickInProgress = true;

                        toastInstance.config.onClick.call(toastInstance.toast, e, toastInstance.toast, toastInstance.clickControl);

                        setTimeout(toastletNotify.timeouts.clickInProgress, 10, toastInstance);

                    },

                    pointerdown: (toastInstance, e) => {
                        
                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing || 
                            ! e.isTrusted || 
                            toastInstance.isTouchEvent
                        ) return;

                        toastInstance.isPointerEvent = true;

                    },

                    pointerup: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing || 
                            ! e.isTrusted || 
                            toastInstance.isTouchEvent
                        ) return;

                        clearTimeout(toastInstance.timeoutIDs.pointerEvent);

                        toastInstance.timeoutIDs.pointerEvent = null;

                        toastInstance.timeoutIDs.pointerEvent = setTimeout(toastletNotify.timeouts.pointerEvent, 10, toastInstance);

                    },

                    mouseenter: (toastInstance, e) => {
            
                        if (
                            ! toastInstance.toast ||
                            toastInstance.isClosing ||
                            ! e.isTrusted ||
                            toastInstance.isMouseHovered ||
                            ! toastInstance.canHover || 
                            ! toastInstance.pointerFine || 
                            toastInstance.isPointerEvent || 
                            (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents)
                        ) return;

                        toastInstance.isMouseHovered = true;

                        toastletNotify.utils.shButtons(toastInstance);

                        if( toastInstance.config.pause.hover ){

                            toastInstance.isPausedByHover = true;

                            toastletNotify.timeouts.pauseTimer(toastInstance);

                        }

                    },

                    mouseleave: (toastInstance, e) => {

                        if (
                            ! toastInstance.toast ||
                            toastInstance.isClosing ||
                            ! e.isTrusted ||
                            ! toastInstance.isMouseHovered ||
                            toastInstance.toast.contains(e.relatedTarget) || 
                            toastInstance.isTouchEvent || 
                            (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents)
                        ) return;

                        toastInstance.isMouseHovered = false;

                        toastletNotify.utils.shButtons(toastInstance);

                        setTimeout(toastletNotify.timeouts.pointerEvent, 10, toastInstance);
                        
                        if( toastInstance.config.pause.hover ){
                        
                            toastInstance.isPausedByHover = false;
                            
                            toastletNotify.timeouts.playTimer(toastInstance);
                        
                        }

                    },

                    touchstart: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing || 
                            ! e.isTrusted ||
                            ! toastletGeneralHelper.isMobile()
                        ) return;

                        toastletNotify.timeouts.pauseTimer(toastInstance);

                        toastInstance.touchStartTime = performance.now();

                        toastInstance.isPausedByTouch = true;
                        
                        toastInstance.isPointerEvent = true;
                        
                        toastInstance.isTouchEvent = true;

                        toastInstance.startX = e.touches[0].clientX;

                        toastInstance.currentX = toastInstance.startX;

                        toastInstance.isDragging = false;

                        toastInstance.touchStartPosition = {
                            x: e.touches[0].clientX,
                            y: e.touches[0].clientY
                        };

                        toastletStyleHelper.setProperties(
                            toastInstance.toast,
                            ['transition', 'none', 'important'],
                            true
                        );

                    },

                    touchcancel: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing || 
                            ! e.isTrusted ||
                            ! toastInstance.isTouchEvent
                        ) return;

                        setTimeout(toastletNotify.timeouts.touchEvent, 10, toastInstance);

                        // TODO: LEMBRAR DO ID DO TIMER
                        setTimeout(toastletNotify.timeouts.pointerEvent, 10, toastInstance);

                        toastInstance.isDragging = false;

                        toastletStyleHelper.setProperties(
                            toastInstance.toast,
                            ['transition', toastInstance.transitionRule.toast.join(' ')],
                            true
                        );

                        toastletStyleHelper.setProperties(
                            toastInstance.toast,
                            ['transform', 'translate(0px, 0px)']
                        );

                        toastInstance.isPausedByTouch = false;
                        
                        toastletNotify.timeouts.resumeTimer(toastInstance);

                    },

                    touchmove: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing ||
                            ! e.isTrusted ||
                            ! toastInstance.isTouchEvent
                        ) return;

                        e.preventDefault();

                        toastInstance.currentX = e.touches[0].clientX;

                        const diff = toastInstance.currentX - toastInstance.startX;

                        toastletStyleHelper.setProperties(
                            toastInstance.toast,
                            ['transform', `translate(${diff}px, 0px)`]
                        );

                        const currentX = e.touches[0].clientX;
                        const currentY = e.touches[0].clientY;

                        const deltaX = Math.abs(currentX - toastInstance.touchStartPosition.x);
                        const deltaY = Math.abs(currentY - toastInstance.touchStartPosition.y);

                        if (deltaX > 10 && deltaX > deltaY)
                            toastInstance.isDragging = true;

                    },

                    touchend: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing ||
                            ! e.isTrusted ||
                            ! toastInstance.isTouchEvent
                        ) return;

                        toastInstance.touchEndTime = performance.now();
                        
                        setTimeout(toastletNotify.timeouts.pointerEvent, 10, toastInstance);
                        
                        // TODO: LEMBRAR DO ID DO TIMER
                        setTimeout(toastletNotify.timeouts.touchEvent, 10, toastInstance);

                        const touchDuration = toastInstance.touchEndTime - toastInstance.touchStartTime;

                        toastletStyleHelper.setProperties(
                            toastInstance.toast,
                            ['transition', toastInstance.transitionRule.toast.join(' ')],
                            true
                        );

                        toastInstance.isPausedByTouch = false;

                        if (toastInstance.isDragging) {

                            const diff = toastInstance.currentX - toastInstance.startX;

                            if (Math.abs(diff) > 100 && toastInstance.isDismissible) {

                                toastInstance.translateOutY = '0px';

                                if(diff > 0)
                                    toastInstance.translateOutX = '100%';
                                else
                                    toastInstance.translateOutX = '-100%';

                                // Disables custom animation out when swiped
                                toastInstance.runAnimationOut = false;

                                toastletNotify.utils.closeToast(toastInstance);
                            
                            } 
                            else {

                                toastletStyleHelper.setProperties(
                                    toastInstance.toast,
                                    ['transform', `translate(0px, 0px)`]
                                );

                                toastletNotify.timeouts.startTimer(toastInstance);
                            
                            }

                        } else {

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['transform', `translate(0px, 0px)`]
                            );

                            if( ( toastInstance.pauseButton && toastInstance.pauseButton.contains(e.target) ) || ( toastInstance.closeButton && toastInstance.closeButton.contains(e.target) ) ) return;

                            if (touchDuration < 300) {

                                toastInstance.isTouchHovered = !toastInstance.isTouchHovered;
                                
                                toastletNotify.utils.shButtons(toastInstance);

                                if( toastletTypeValidators.function(toastInstance.config.onClick) ) {

                                    toastletNotify.handles.toast.click(toastInstance, e);
                                    
                                    toastletNotify.timeouts.playTimer(toastInstance);

                                }
                                else if( toastInstance.config.pause.touch ) {

                                    toastletNotify.utils.togglePauseByButton(toastInstance);

                                }
                                else {
                                    
                                    toastletNotify.timeouts.resumeTimer(toastInstance);

                                }

                            } 
                            else {
                                
                                toastletNotify.timeouts.playTimer(toastInstance);
                            
                            }

                        }

                        toastInstance.isDragging = false;

                    },

                    focusin: (toastInstance, e) => {

                        if( ! toastInstance.toast || toastInstance.isClosing ) return;

                        if( ! e.isTrusted || toastInstance.isPointerEvent || ( e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents ) ){

                            e.target.blur();

                            setTimeout(toastletNotify.timeouts.blur, 0, toastInstance, e.target);

                            return;

                        }

                        setTimeout(toastletNotify.timeouts.focusin, 0, toastInstance);

                    },

                    focusout: (toastInstance, e) => {

                        if( ! toastInstance.toast || toastInstance.isClosing ) return;

                        if( ! e.isTrusted ){

                            e.target.focus();

                            setTimeout(toastletNotify.timeouts.focus, 0, toastInstance, e.target);

                            return;

                        }

                        setTimeout(toastletNotify.timeouts.focusout, 0, toastInstance);
                    
                    },

                    keydown: (toastInstance, e) => {

                        if( ! toastInstance.toast || toastInstance.isClosing || ! e.isTrusted ) return;

                        if(e.target === toastInstance.pauseButton)
                            return toastletNotify.handles.pauseButton.keydown(toastInstance, e);
                        else if(e.target === toastInstance.closeButton)
                            return toastletNotify.handles.closeButton.keydown(toastInstance, e);
                        else if(e.target !== toastInstance.toast)
                            return;

                        if(e.key === ' ' || e.key === 'Enter') {

                            e.preventDefault();
                            e.stopPropagation();

                            if( toastletTypeValidators.function(toastInstance.config.onClick) )
                                toastletNotify.handles.toast.click(toastInstance, e);
                            else if( toastInstance.config.pause.button )
                                toastletNotify.utils.togglePauseByButton(toastInstance);

                        }
                        else if(e.key === 'Escape' && toastInstance.isDismissible) {

                            e.preventDefault();
                            e.stopPropagation();

                            toastletNotify.utils.closeToast(toastInstance);

                        }

                    }

                },

                pauseButton: {

                    pointerdown: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing || 
                            toastInstance.pauseButtonPointerDown ||
                            ! toastInstance.config.pause.button ||
                            ! e.isTrusted
                        ) return;

                        toastInstance.pauseButtonPointerDown = true;
                        
                        e.stopPropagation();

                        // ?? O COMPORTAMENTO ESTÁ CORRETO, MAS FALTA UM COMENTÁRIO AQUI
                        toastInstance.isTouchHovered = false;

                        toastletNotify.utils.shButtons(toastInstance);

                        toastletNotify.utils.togglePauseByButton(toastInstance);

                    },

                    pointerup: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing ||
                            ! toastInstance.config.pause.button ||
                            ! e.isTrusted
                        ) return;

                        clearTimeout(toastInstance.timeoutIDs.pauseButtonPointerUp);

                        toastInstance.timeoutIDs.pauseButtonPointerUp = null;

                        toastInstance.timeoutIDs.pauseButtonPointerUp = setTimeout(toastletNotify.timeouts.pauseButtonPointerUp, 15, toastInstance);

                    },

                    keydown: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast ||
                            toastInstance.isClosing ||
                            ! toastInstance.config.pause.button ||
                            ! e.isTrusted
                        ) return;

                        // TODO: JUNTAR ESSE IF COM O DE CIMA
                        if(e.target !== toastInstance.pauseButton) return;

                        if(e.key === ' ' || e.key === 'Enter') {

                            e.preventDefault();
                            e.stopPropagation();

                            toastletNotify.utils.togglePauseByButton(toastInstance);

                        }
                        else if(e.key === 'Escape' && toastInstance.isDismissible) {

                            e.preventDefault();
                            e.stopPropagation();

                            toastletNotify.utils.closeToast(toastInstance);

                        }

                    }

                },

                closeButton: {

                    pointerdown: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing ||
                            ! toastInstance.isDismissible ||
                            toastInstance.closeButtonPointerDown ||
                            ! e.isTrusted
                        ) return;

                        toastInstance.closeButtonPointerDown = true;

                        e.stopPropagation();

                        // ?? ISSO ESTÁ AQUI SÓ POR ESTILIZAÇÃO, SERÁ SE EU NÃO DEVERIA ADICIONAR OS OUTROS TRÊS?
                        toastInstance.isTouchHovered = false;

                        toastletNotify.utils.shButtons(toastInstance);

                        toastletNotify.utils.closeToast(toastInstance);

                    },

                    pointerup: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing ||
                            ! toastInstance.isDismissible ||
                            ! e.isTrusted
                        ) return;

                        clearTimeout(toastInstance.timeoutIDs.closeButtonPointerUp);

                        toastInstance.timeoutIDs.closeButtonPointerUp = null;

                        toastInstance.timeoutIDs.closeButtonPointerUp = setTimeout(toastletNotify.timeouts.closeButtonPointerUp, 15, toastInstance);

                    },

                    keydown: (toastInstance, e) => {

                        if( ! toastInstance.toast || toastInstance.isClosing || ! e.isTrusted ) return;

                        // TODO: JUNTAR ESSE IF COM O DE CIMA
                        if(e.target !== toastInstance.closeButton) return;

                        if( ( e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' ) && toastInstance.isDismissible ) {

                            e.preventDefault();
                            e.stopPropagation();

                            toastletNotify.utils.closeToast(toastInstance);

                        }

                    }

                },

                window: {

                    resize: (toastInstance, e) => {

                        if( ! toastInstance.toast || toastInstance.isClosing || ! e.isTrusted ) return;

                        if( toastletGeneralHelper.isMobile() ) {

                            if( toastInstance.isPausedByButton )
                                toastInstance.isTouchHovered = true;

                            toastletNotify.position.set.mobile[toastInstance.config.position.data.mobile.name](toastInstance);

                        }
                        else {

                            if( toastInstance.isTouchHovered && ! toastInstance.isMouseHovered && ! toastInstance.isFocusHovered )
                                toastInstance.isTouchHovered = false;

                            toastletNotify.position.set.desktop[toastInstance.config.position.data.desktop.name](toastInstance);

                        }

                        toastletNotify.utils.shButtons(toastInstance);

                    }

                },

                document: {

                    visibilityChange: (toastInstance, e) => {

                        if(
                            ! toastInstance.toast || 
                            toastInstance.isClosing ||
                            ! toastInstance.config.pause.inactiveTab ||
                            ! e.isTrusted
                        ) return;

                        if( toastInstance.inactiveTab ) {

                            toastInstance.isPausedByInactiveTab = true;

                            toastletNotify.timeouts.pauseTimer(toastInstance);

                        } 
                        else if( ! toastInstance.inactiveTab ) {

                            toastInstance.isPausedByInactiveTab = false;

                            if( ! toastInstance.enterElement ){

                                if( ! toastInstance.rAF.enterElement.isScheduled ) {

                                    toastInstance.rAF.enterElement.isScheduled = true;
                                
                                    requestAnimationFrame(toastInstance.rAF.enterElement.fn);
                                
                                }

                            }
                            else {

                                toastletNotify.timeouts.playTimer(toastInstance);

                            }

                        }

                    }

                },

                body: {

                    mutation: (toastInstance, m, observer) => {

                        if( ! toastInstance.toast || toastInstance.isClosing ){
                            observer.disconnect();
                            return;
                        }

                        if( toastInstance.toast.parentElement !== document.body || ! toastInstance.toast.isConnected )
                            setTimeout(toastletNotify.timeouts.remove, 0, toastInstance);

                    }

                },

                html: {

                    mutation: (toastInstance, m, observer) => {

                        if( ! toastInstance.toast || toastInstance.isClosing ){
                            observer.disconnect();
                            return;
                        }

                        if( ! document.body )
                            setTimeout(toastletNotify.timeouts.remove, 0, toastInstance);

                    }

                }

            },

            setup: {

                configValidators: {
                    
                    sticky: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.boolean(userConfig.sticky) ){
                            console.warn(`[ToastletNotify] Warning: Option 'sticky' must be a boolean\n  Received: ${typeof userConfig.sticky}\n  Using default value: ${defaultConfig.sticky}`);
                            userConfig.sticky = defaultConfig.sticky;
                        }

                    },

                    duration: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.unsignedNumber(userConfig.duration) ){
                            console.warn(`[ToastletNotify] Warning: Option 'duration' must be an unsigned number\n  Received: ${typeof userConfig.duration}, ${userConfig.duration}\n  Using default value: ${defaultConfig.duration}`);
                            userConfig.duration = defaultConfig.duration;
                        }

                    },

                    dismissible: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.boolean(userConfig.dismissible) ){
                            console.warn(`[ToastletNotify] Warning: Option 'dismissible' must be a boolean\n  Received: ${typeof userConfig.dismissible}\n  Using default value: ${defaultConfig.dismissible}`);
                            userConfig.dismissible = defaultConfig.dismissible;
                        }

                    },

                    stackable: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.boolean(userConfig.stackable) ){
                            console.warn(`[ToastletNotify] Warning: Option 'stackable' must be a boolean\n  Received: ${typeof userConfig.stackable}\n  Using default value: ${defaultConfig.stackable}`);
                            userConfig.stackable = defaultConfig.stackable;
                        }

                    },

                    stackableGap: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.plainObject(userConfig.stackableGap) ){
                            console.warn(`[ToastletNotify] Warning: Option 'stackableGap' must be a plain object\n  Received: ${typeof userConfig.stackableGap}, ${userConfig.stackableGap}\n  Using default value: ${JSON.stringify(defaultConfig.stackableGap)}`);
                            userConfig.stackableGap = defaultConfig.stackableGap;
                            return;
                        }

                        // Extract only enumerable properties and not symbols keys properties
                        const keys = objKeys(userConfig.stackableGap);

                        const sanitizedConfig = {};

                        for(const key of keys){

                            if( ! defaultConfig.stackableGap.hasOwnProperty(key) ){
                                console.warn(`[ToastletNotify] Warning: Option 'stackableGap' has unknown property '${key}'\n  This property will be removed.`);
                                continue;
                            }

                            const value = userConfig.stackableGap[key]

                            if( ! toastletTypeValidators.unsignedNumber(value) ){
                                console.warn(`[ToastletNotify] Warning: Option 'stackableGap.${key}' must be an unsigned number\n  Received: ${typeof value}, ${value}\n  Using default value: ${defaultConfig.stackableGap[key]}`);
                                sanitizedConfig[key] = defaultConfig.stackableGap[key];
                                continue;
                            }

                            sanitizedConfig[key] = value;

                        }

                        for(const [key, value] of objEntries(defaultConfig.stackableGap)){

                            if( ! sanitizedConfig.hasOwnProperty(key) )
                                sanitizedConfig[key] = value;

                        }

                        userConfig.stackableGap = sanitizedConfig;

                    },

                    html: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.boolean(userConfig.html) ){
                            console.warn(`[ToastletNotify] Warning: Option 'html' must be a boolean\n  Received: ${typeof userConfig.html}\n  Using default value: ${defaultConfig.html}`);
                            userConfig.html = defaultConfig.html;
                        }

                    },

                    icon: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.boolean(userConfig.icon) ){
                            console.warn(`[ToastletNotify] Warning: Option 'icon' must be a boolean\n  Received: ${typeof userConfig.icon}\n  Using default value: ${defaultConfig.icon}`);
                            userConfig.icon = defaultConfig.icon;
                        }

                    },

                    title: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.boolean(userConfig.title) ){
                            console.warn(`[ToastletNotify] Warning: Option 'title' must be a boolean\n  Received: '${typeof userConfig.title}'\n  Using default value: '${defaultConfig.title}'`);
                            userConfig.title = defaultConfig.title;
                        }

                    },

                    titleText: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.string(userConfig.titleText) ){
                            console.warn(`[ToastletNotify] Warning: Option 'titleText' must be a string\n  Received: '${typeof userConfig.titleText}'\n  Using default value: '${defaultConfig.titleText}'`);
                            userConfig.titleText = defaultConfig.titleText;
                        }

                    },

                    customClass: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.string(userConfig.customClass) ){
                            console.warn(`[ToastletNotify] Warning: Option 'customClass' must be a string\n  Received: '${typeof userConfig.customClass}'\n  Using default value: '${defaultConfig.customClass}'`);
                            userConfig.customClass = defaultConfig.customClass;
                        }

                    },

                    transition: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.plainObject(userConfig.transition) ){
                            console.warn(`[ToastletNotify] Warning: Option 'transition' must be a plain object\n  Received: ${typeof userConfig.transition}, ${userConfig.transition}\n  Using default value: ${JSON.stringify(defaultConfig.transition)}`);
                            userConfig.transition = defaultConfig.transition;
                            return;
                        }

                        // Extract only enumerable properties and not symbols keys properties
                        const keys = objKeys(userConfig.transition);

                        const sanitizedConfig = {};

                        for(const key of keys){

                            if( ! defaultConfig.transition.hasOwnProperty(key) ){
                                console.warn(`[ToastletNotify] Warning: Option 'transition' has unknown property '${key}'\n  This property will be removed.`);
                                continue;
                            }

                            const value = userConfig.transition[key];

                            if( key === 'enabled' && ! toastletTypeValidators.boolean(value) ){
                                console.warn(`[ToastletNotify] Warning: Option 'transition.enabled' must be a boolean\n  Received: ${typeof value}\n  Using default value: ${defaultConfig.transition.enabled}`);
                                continue;
                            }

                            if( key === 'duration' && ! toastletTypeValidators.unsignedNumber(value) ){
                                console.warn(`[ToastletNotify] Warning: Option 'transition.duration' must be an unsigned number\n  Received: ${typeof value}, ${value}\n  Using default value: ${defaultConfig.transition.duration}`);
                                continue;
                            }

                            sanitizedConfig[key] = value;

                        }

                        for(const [key, value] of objEntries(defaultConfig.transition)){

                            if( ! sanitizedConfig.hasOwnProperty(key) )
                                sanitizedConfig[key] = value;

                        }

                        if( ! sanitizedConfig.enabled )
                            sanitizedConfig.duration = 0;

                        userConfig.transition = sanitizedConfig;

                    },

                    animation: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.plainObject(userConfig.animation) ){
                            console.warn(`[ToastletNotify] Warning: Option 'animation' must be a plain object\n  Received: ${typeof userConfig.animation}, ${userConfig.animation}\n  Using default value: ${JSON.stringify(defaultConfig.animation)}`);
                            userConfig.animation = defaultConfig.animation;
                            return;
                        }

                        // Extract only enumerable properties and not symbols keys properties
                        const keys = objKeys(userConfig.animation);

                        const sanitizedConfig = {};

                        for(const key of keys){

                            if( ! defaultConfig.animation.hasOwnProperty(key) ){
                                console.warn(`[ToastletNotify] Warning: Option 'animation' has unknown property '${key}'\n  This property will be removed.`);
                                continue;
                            }

                            const value = userConfig.animation[key];

                            if( ! toastletTypeValidators.string(value) ){
                                console.warn(`[ToastletNotify] Warning: Option 'animation.${key}' must be a string\n  Received: '${typeof value}'\n  Using default value: '${defaultConfig.animation[key]}'`);
                                continue;
                            }

                            sanitizedConfig[key] = value;

                        }

                        for(const [key, value] of objEntries(defaultConfig.animation)){

                            if( ! sanitizedConfig.hasOwnProperty(key) )
                                sanitizedConfig[key] = value;

                        }

                        userConfig.animation = sanitizedConfig;

                    },

                    pause: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.plainObject(userConfig.pause) ){
                            console.warn(`[ToastletNotify] Warning: Option 'pause' must be a plain object\n  Received: ${typeof userConfig.pause}, ${userConfig.pause}\n  Using default value: ${JSON.stringify(defaultConfig.pause)}`);
                            userConfig.pause = defaultConfig.pause;
                            return;
                        }

                        // Extract only enumerable properties and not symbols keys properties
                        const keys = objKeys(userConfig.pause);

                        const sanitizedConfig = {};

                        for(const key of keys){

                            if( ! defaultConfig.pause.hasOwnProperty(key) ){
                                console.warn(`[ToastletNotify] Warning: Option 'pause' has unknown property '${key}'\n  This property will be removed.`);
                                continue;
                            }

                            const value = userConfig.pause[key];

                            if( ! toastletTypeValidators.boolean(value) && key !== 'resumeStrategy' ){
                                console.warn(`[ToastletNotify] Warning: Option 'pause.${key}' must be a boolean\n  Received: ${typeof value}\n  Using default value: ${defaultConfig.pause[key]}`);
                                continue;
                            }

                            if( key === 'resumeStrategy' ){

                                if( ! toastletTypeValidators.string(value) ){
                                    console.warn(`[ToastletNotify] Warning: Option 'pause.resumeStrategy' must be a string\n  Received: ${typeof value}\n  Using default value: '${defaultConfig.pause.resumeStrategy}'`);
                                    continue;
                                }

                                const rsValue = value.replace(only_letters_regex, '').toLowerCase();

                                if( rsValue !== 'resume' && rsValue !== 'restart' ){
                                    console.warn(`[ToastletNotify] Warning: Option 'pause.resumeStrategy' must be one of: 'resume', 'restart'\n  Received: '${value}'\n  Using default value: '${defaultConfig.pause.resumeStrategy}'`);
                                    continue;
                                }

                                sanitizedConfig[key] = rsValue;

                            }

                            sanitizedConfig[key] = value;

                        }

                        for(const [key, value] of objEntries(defaultConfig.pause)){

                            if( ! sanitizedConfig.hasOwnProperty(key) )
                                sanitizedConfig[key] = value;

                        }

                        userConfig.pause = sanitizedConfig;

                    },

                    progressBar: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.plainObject(userConfig.progressBar) ){
                            console.warn(`[ToastletNotify] Warning: Option 'progressBar' must be a plain object\n  Received: ${typeof userConfig.progressBar}, ${userConfig.progressBar}\n  Using default value: ${JSON.stringify(defaultConfig.progressBar)}`);
                            userConfig.progressBar = defaultConfig.progressBar;
                            return;
                        }

                        // Extract only enumerable properties and not symbols keys properties
                        const keys = objKeys(userConfig.progressBar);

                        const sanitizedConfig = {};

                        for(const key of keys){

                            if( ! defaultConfig.progressBar.hasOwnProperty(key) ){
                                console.warn(`[ToastletNotify] Warning: Option 'progressBar' has unknown property '${key}'\n  This property will be removed.`);
                                continue;
                            }

                            const value = userConfig.progressBar[key];

                            if( key === 'enabled' && ! toastletTypeValidators.boolean(value) ){
                                console.warn(`[ToastletNotify] Warning: Option 'progressBar.enabled' must be a boolean\n  Received: ${typeof value}\n  Using default value: ${defaultConfig.progressBar.enabled}`);
                                continue;
                            }

                            if( key === 'direction' && ! toastletNotify.presets.progressBar.get(value) ){
                                console.warn(`[ToastletNotify] Warning: Option 'progressBar.direction' must be one of: ${toastletNotify.presets.progressBar.array.join(', ')}\n  Received: ${typeof value}, '${value}'\n  Using default value: '${defaultConfig.progressBar.direction}'`);
                                continue;
                            }

                            sanitizedConfig[key] = value;

                        }

                        for(const [key, value] of objEntries(defaultConfig.progressBar)){
                            
                            if( ! sanitizedConfig.hasOwnProperty(key) )
                                sanitizedConfig[key] = value;

                        }

                        userConfig.progressBar = sanitizedConfig;

                        userConfig.progressBar.data = toastletNotify.presets.progressBar.get(userConfig.progressBar.direction);

                    },

                    position: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.plainObject(userConfig.position) ){
                            console.warn(`[ToastletNotify] Warning: Option 'position' must be a plain object\n  Received: ${typeof userConfig.position}, ${userConfig.position}\n  Using default value: ${JSON.stringify(defaultConfig.position)}`);
                            userConfig.position = defaultConfig.position;
                            return;
                        }

                        // Extract only enumerable properties and not symbols keys properties
                        const keys = objKeys(userConfig.position);

                        const sanitizedConfig = {};

                        for(const key of keys){

                            if( ! defaultConfig.position.hasOwnProperty(key) || key === 'data' ){
                                console.warn(`[ToastletNotify] Warning: Option 'position' has unknown property '${key}'\n  This property will be removed.`);
                                continue;
                            }

                            sanitizedConfig[key] = userConfig.position[key];

                        }

                        if( ! sanitizedConfig.hasOwnProperty('desktop') )
                            sanitizedConfig.desktop = defaultConfig.position.desktop;

                        let desktopPosition = toastletNotify.position.get.desktop(sanitizedConfig.desktop);

                        if( ! desktopPosition ){
                            console.warn(`[ToastletNotify] Warning: Invalid desktop position '${sanitizedConfig.desktop}'\n  Valid positions: ${toastletNotify.position.get.available.array.desktop.join(', ')}\n  Using default position: '${defaultConfig.position.desktop}'`);
                            desktopPosition = defaultConfig.position.data.desktop;
                            sanitizedConfig.desktop = defaultConfig.position.desktop;                       
                        }

                        if( ! sanitizedConfig.hasOwnProperty('mobile') )
                            sanitizedConfig.mobile = desktopPosition.mobile;

                        let mobilePosition = toastletNotify.position.get.mobile(sanitizedConfig.mobile);

                        if( ! mobilePosition ){
                            console.warn(`[ToastletNotify] Warning: Invalid mobile position '${sanitizedConfig.mobile}'\n  Valid positions: ${toastletNotify.position.get.available.array.mobile.join(', ')}\n  Using default position: '${defaultConfig.position.mobile}'`);
                            mobilePosition = toastletNotify.position.get.mobile(desktopPosition.mobile);
                            sanitizedConfig.mobile = desktopPosition.mobile;
                        }
                        
                        sanitizedConfig.data = {};

                        sanitizedConfig.data.desktop = desktopPosition;

                        sanitizedConfig.data.mobile = mobilePosition;

                        for(const [key, value] of objEntries(defaultConfig.position)){

                            if( ! sanitizedConfig.hasOwnProperty(key) )
                                sanitizedConfig[key] = value;

                        }

                        userConfig.position = sanitizedConfig;

                    },

                    a11y: (defaultConfig, userConfig) => {
                        
                        if( defaultConfig.notificationType.type !== 'custom' ){
                            console.warn(`[ToastletNotify] Warning: Option 'a11y' can only be used with notification type 'custom'\n  Received type: '${defaultConfig.notificationType.type}'\n  This property will be removed.`);
                            userConfig.a11y = defaultConfig.a11y;
                            return;                        
                        }

                        if( ! toastletTypeValidators.plainObject(userConfig) ){
                            console.warn(`[ToastletNotify] Warning: Option 'a11y' must be a plain object\n  Received: ${typeof userConfig.a11y}, ${userConfig.a11y}\n  Using default value: ${JSON.stringify(defaultConfig.a11y)}`);
                            userConfig.a11y = defaultConfig.a11y;
                            return;                        
                        }

                        // Extract only enumerable properties and not symbols keys properties
                        const keys = objKeys(userConfig.a11y);

                        const sanitizedConfig = {};

                        for(const key of keys){

                            if( ! defaultConfig.a11y.hasOwnProperty(key) ){
                                console.warn(`[ToastletNotify] Warning: Option 'a11y' has unknown property '${key}'\n  This property will be removed.`);
                                continue;
                            }
                            
                            const value = userConfig.a11y[key];

                            if( key === 'role' && value !== 'status' && value !== 'alert' ){
                                console.warn(`[ToastletNotify] Warning: Option 'a11y.role' must be either 'status' or 'alert'\n  Received: '${value}'\n  Using default value: '${defaultConfig.a11y.role}'`);
                                continue;
                            }

                            if( key === 'ariaLive' && value !== 'polite' && value !== 'assertive' ){
                                console.warn(`[ToastletNotify] Warning: Option 'a11y.ariaLive' must be either 'polite' or 'assertive'\n  Received: '${value}'\n  Using default value: '${defaultConfig.a11y.ariaLive}'`);
                                continue;
                            }

                            sanitizedConfig[key] = value;

                        }

                        for(const [key, value] of objEntries(defaultConfig.a11y)){

                            if( ! sanitizedConfig.hasOwnProperty(key) )
                                sanitizedConfig[key] = value;

                        }
                        
                        userConfig.a11y = sanitizedConfig;

                    },

                    onClick: (defaultConfig, userConfig) => {

                        if( ! toastletTypeValidators.function(userConfig.onClick) && ! toastletTypeValidators.null(userConfig.onClick) ){
                            console.warn(`[ToastletNotify] Warning: Option 'onClick' must be a function or null\n  Received: ${typeof userConfig.onClick}\n  Using default value: ${defaultConfig.onClick === null ? 'null' : 'function'}`);
                            userConfig.onClick = defaultConfig.onClick;
                        }

                    }

                },

                sanitizeConfig: (defaultConfig, userConfig) => {

                    // Safety copy to avoid mutating the original object
                    const defaultConfigCopy = {...defaultConfig};

                    // Safety copy to avoid mutating the original object, and extract only
                    // enumerable properties and not symbols key properties
                    const keys = objKeys(userConfig);

                    const userConfigCopy = {};

                    const sanitizeConfig = {};

                    for(const key of keys){

                        if( ! defaultConfigCopy.hasOwnProperty(key) || key === 'notificationType' ){
                            console.warn(`[ToastletNotify] Warning: Unknown option '${key}'\n  This property will be removed.`);
                            continue; 
                        }

                        userConfigCopy[key] = userConfig[key];

                        toastletNotify.setup.configValidators[key](defaultConfigCopy, userConfigCopy);

                        sanitizeConfig[key] = userConfigCopy[key];

                    }

                    const finalConfig = {
                        ...defaultConfigCopy,
                        ...sanitizeConfig
                    }

                    delete finalConfig.notificationType;

                    return finalConfig;

                },            

                configureClasses: (config, content, notificationType) => {

                    const desktopClasses = ['toastlet', 'toastlet-desktop'];

                    const mobileClasses = ['toastlet', 'toastlet-mobile'];

                    const classes = {
                        desktop: null,
                        mobile: null,
                        animationIn: null,
                        animationOut: null,
                        all: null
                    };

                    desktopClasses.push(
                        config.position.data.desktop.class, 
                        notificationType.class
                    );
                    
                    mobileClasses.push(
                        config.position.data.mobile.class, 
                        notificationType.class
                    );

                    classes.desktop = toastletClassHelper.mergeClasses(
                        desktopClasses, 
                        toastletClassHelper.explodeClasses( config.customClass )
                    );

                    classes.mobile = toastletClassHelper.mergeClasses(
                        mobileClasses, 
                        toastletClassHelper.explodeClasses( config.customClass )
                    );

                    classes.animationIn = toastletClassHelper.explodeClasses(
                        config.animation.in
                    );

                    classes.animationOut = toastletClassHelper.explodeClasses(
                        config.animation.out
                    );

                    classes.all = toastletClassHelper.mergeClasses(
                        classes.desktop,
                        classes.mobile,
                        classes.animationIn,
                        classes.animationOut
                    );

                    return classes;

                },

                configureDefaultStyles: (config, content, notificationType) => {

                    const defaultStyles = {

                        toast: {

                            desktop: [],
                            mobile: []

                        },

                        progressBar: [],

                        progressBarThumb: []

                    };

                    defaultStyles.toast.desktop.push(
                        ['height', 'auto'],
                        ['max-height', '100vh'],
                        ['max-width', '100vw'],
                    );

                    defaultStyles.toast.mobile.push(
                        ['width', '100vw'],
                        ['height', 'auto'],
                        ['max-width', '100vw'],
                        ['max-height', '100vh'],
                    );

                    if( config.title || ! toastletTypeValidators.emptyContent(content) ) {

                        defaultStyles.toast.desktop.push(
                            ['min-width', '360px'],
                            ['width', '360px'],
                        );

                        if( config.title && ! toastletTypeValidators.emptyContent(content) ) {

                            defaultStyles.toast.desktop.push(
                                ['min-height', '80px']
                            );
                            defaultStyles.toast.mobile.push(
                                ['min-height', '80px']
                            );

                        }
                        else {

                            defaultStyles.toast.desktop.push(
                                ['min-height', '48px']
                            );
                            defaultStyles.toast.mobile.push(
                                ['min-height', '48px']
                            );

                        }

                    }
                    else {

                        defaultStyles.toast.desktop.push(
                            ['min-width', 'auto'],
                            ['width', 'auto'],
                            ['min-height', '48px']
                        );

                        defaultStyles.toast.mobile.push(
                            ['min-height', '48px']
                        );

                    }

                    defaultStyles.toast.desktop.push(
                        ['transition', 'none', 'important'],
                        ['position', 'fixed', 'important'],
                        ['border-radius', '5px']
                    );

                    defaultStyles.toast.mobile.push(
                        ['transition', 'none', 'important'],
                        ['position', 'fixed', 'important'],
                        ['border-radius', '0']
                    );

                    defaultStyles.progressBar.push(
                        ['display', 'flex', 'important'],
                        ['flex-direction', config.progressBar.data.flexDirection, 'important'],
                        ['flex-wrap', 'nowrap', 'important'],
                        ['align-items', 'center', 'important'],
                        ['justify-content', 'normal', 'important'],
                        ['transition', 'none', 'important'],
                        ['padding', '0', 'important'],
                        ['gap', '0', 'important'],
                        ['margin', '0', 'important'],
                        ['position', 'absolute', 'important'],
                        ['bottom', '0', 'important'],
                        ['left', '0', 'important'],
                        ['width', '100%', 'important'],
                        ['height', '5px']
                    );

                    defaultStyles.progressBarThumb.push(
                        ['display', 'flex', 'important'],
                        ['flex-direction', 'row', 'important'],
                        ['flex-wrap', 'nowrap', 'important'],
                        ['align-items', 'center', 'important'],
                        ['justify-content', 'normal', 'important'],
                        ['padding', '0', 'important'],
                        ['gap', '0', 'important'],
                        ['margin', '0', 'important'],
                        ['position', 'relative', 'important'],
                        ['height', '100%', 'important']
                    );
                        
                    return defaultStyles;

                },

                createElement: {

                    toast: (toastInstance, content, notificationType) => {

                        const toast = document.createElement('div');

                        toastletAttributeHelper.setAttributes(
                            toast,
                            ['tabindex', '0'],
                            ['role', toastInstance.config.a11y.role],
                            ['aria-live', toastInstance.config.a11y.ariaLive],
                            ['aria-atomic', 'true']
                        );

                        const gridTemplate = [];

                        if( toastInstance.config.icon )
                            gridTemplate.push('auto');

                        if( toastInstance.config.title || ! toastletTypeValidators.emptyContent(content) )
                            gridTemplate.push('1fr');

                        if( ( ! toastInstance.isSticky && toastInstance.config.pause.button ) || toastInstance.isDismissible )
                            gridTemplate.push('auto');

                        const gridTemplateColumns = ['grid-template-columns', gridTemplate.join(' ')];

                        const gridGap = 
                            ( ! toastInstance.config.title && content.length === 0 ) ? 
                            ['gap', '20px'] : 
                            ['gap', '10px']
                        ;

                        const cursor = 
                            ( toastInstance.config.onClick !== null ) ? 
                            ['cursor', 'pointer'] : 
                            ['cursor', 'auto']
                        ;

                        const backgroundColor = ['background-color', notificationType.color];
                        
                        toastletStyleHelper.setProperties(
                            toast,
                            ...toastletNotify.presets.styles.toast[toastInstance.mode],
                            gridTemplateColumns,
                            gridGap,
                            cursor,
                            backgroundColor
                        );

                        return toast;

                    },

                    iconCol: () => {

                        const iconCol = document.createElement('div');

                        toastletClassHelper.addClasses(
                            iconCol,
                            'toastlet-icon-col'
                        );

                        toastletStyleHelper.setProperties(
                            iconCol,
                            ...toastletNotify.presets.styles.iconCol
                        );

                        return iconCol;

                    },

                    iconContainer: (notificationType) => {

                        const iconContainer = document.createElement('div');

                        toastletClassHelper.addClasses(
                            iconContainer,
                            'toastlet-icon-container'
                        );

                        toastletStyleHelper.setProperties(
                            iconContainer,
                            ...toastletNotify.presets.styles.iconContainer
                        );
                        
                        iconContainer.innerHTML = notificationType.icon;

                        return iconContainer;

                    },

                    contentCol: () => {

                        const contentCol = document.createElement('div');

                        toastletClassHelper.addClasses(
                            contentCol,
                            'toastlet-content-col'
                        );

                        toastletStyleHelper.setProperties(
                            contentCol,
                            ...toastletNotify.presets.styles.contentCol
                        );

                        return contentCol;

                    },

                    title: (toastInstance) => {
                        
                        const title = document.createElement('div');

                        toastletClassHelper.addClasses(
                            title,
                            'toastlet-title'
                        );

                        title.textContent = toastInstance.config.titleText;

                        toastletStyleHelper.setProperties(
                            title,
                            ...toastletNotify.presets.styles.title
                        );

                        return title;

                    },

                    content: (toastInstance, content) => {
                        
                        const contentEl = document.createElement('div');

                        toastletClassHelper.addClasses(
                            contentEl,
                            'toastlet-content'
                        );

                        if( toastletTypeValidators.string(content) ) {

                            if( toastInstance.config.html )
                                contentEl.innerHTML = content;
                            else
                                contentEl.textContent = content;

                        }
                        else {

                            contentEl.appendChild(content);

                        }


                        toastletStyleHelper.setProperties(
                            contentEl,
                            ...toastletNotify.presets.styles.content
                        );

                        return contentEl;

                    },

                    controlsCol: () => {

                        const controlsCol = document.createElement('div');

                        toastletClassHelper.addClasses(
                            controlsCol,
                            'toastlet-controls-col'
                        );

                        toastletStyleHelper.setProperties(
                            controlsCol,
                            ...toastletNotify.presets.styles.controlCol
                        );

                        return controlsCol;

                    },

                    pauseButton: () => {
                        
                        const pauseButton = document.createElement('button');

                        toastletAttributeHelper.setAttributes(
                            pauseButton,
                            ['tabindex', '0'],
                            ['aria-label', 'Pause notification timer']
                        );

                        toastletClassHelper.addClasses(
                            pauseButton, 
                            'toastlet-pause'
                        );

                        pauseButton.innerHTML = toastletNotify.presets.icons.pause;

                        toastletStyleHelper.setProperties(
                            pauseButton,
                            ...toastletNotify.presets.styles.pauseButton
                        );

                        return pauseButton;

                    },

                    closeButton: () => {
                        
                        const closeButton = document.createElement('button');

                        toastletAttributeHelper.setAttributes(
                            closeButton,
                            ['tabindex', '0'],
                            ['aria-label', 'Close notification']
                        );

                        toastletClassHelper.addClasses(
                            closeButton, 
                            'toastlet-close'
                        );

                        closeButton.innerHTML = toastletNotify.presets.icons.close;

                        toastletStyleHelper.setProperties(
                            closeButton,
                            ...toastletNotify.presets.styles.closeButton
                        );

                        return closeButton;

                    },

                    progressBar: () => {

                        const progressBar = document.createElement('div');

                        toastletClassHelper.addClasses(
                            progressBar, 
                            'toastlet-progress-bar'
                        );

                        toastletStyleHelper.setProperties(
                            progressBar,
                            ...toastletNotify.presets.styles.progressBar
                        );

                        return progressBar;

                    },

                    progressBarThumb: () => {

                        const progressBarThumb = document.createElement('div');

                        toastletClassHelper.addClasses(
                            progressBarThumb, 
                            'toastlet-progress-bar-thumb'
                        );

                        toastletStyleHelper.setProperties(
                            progressBarThumb,
                            ...toastletNotify.presets.styles.progressBarThumb
                        );

                        return progressBarThumb;

                    }

                },

                setListener: (toastInstance, ...args) => {

                    if( toastletTypeValidators.empty(args) ) return;

                    let i = args.length;

                    while(i--){

                        const arg = {...args[i]};

                        if( !arg.params || !toastletTypeValidators.array(arg.params) )
                            arg.params = [];

                        const properties = {
                            element: arg.element,
                            event: arg.event,
                            handler: arg.handler.bind(args[i].element, ...arg.params)
                        };

                        properties.element.addEventListener(properties.event, properties.handler);

                        toastInstance.listeners.push(properties);

                    }

                },

                createListener: {

                    toast: (toastInstance) => {

                        const listeners = [];

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'mouseup',
                            handler: toastletNotify.handles.toast.pointerup,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'pointerup',
                            handler: toastletNotify.handles.toast.pointerup,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'mousedown',
                            handler: toastletNotify.handles.toast.pointerdown,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'pointerdown',
                            handler: toastletNotify.handles.toast.pointerdown,
                            params: [toastInstance]
                        });

                        if( ! toastletTypeValidators.null(toastInstance.config.onClick) ) {

                            listeners.push({
                                element: toastInstance.toast,
                                event: 'click',
                                handler: toastletNotify.handles.toast.click,
                                params: [toastInstance]
                            });

                        }

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'mouseenter',
                            handler: toastletNotify.handles.toast.mouseenter,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'mouseleave',
                            handler: toastletNotify.handles.toast.mouseleave,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'mouseout',
                            handler: toastletNotify.handles.toast.mouseleave,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'pointerleave',
                            handler: toastletNotify.handles.toast.mouseleave,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'pointerout',
                            handler: toastletNotify.handles.toast.mouseleave,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'pointercancel',
                            handler: toastletNotify.handles.toast.mouseleave,
                            params: [toastInstance]
                        });                    

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'touchstart',
                            handler: toastletNotify.handles.toast.touchstart,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'touchcancel',
                            handler: toastletNotify.handles.toast.touchcancel,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'touchmove',
                            handler: toastletNotify.handles.toast.touchmove,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'touchend',
                            handler: toastletNotify.handles.toast.touchend,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'focusin',
                            handler: toastletNotify.handles.toast.focusin,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'focusout',
                            handler: toastletNotify.handles.toast.focusout,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'keydown',
                            handler: toastletNotify.handles.toast.keydown,
                            params: [toastInstance]
                        });

                        toastletNotify.setup.setListener(toastInstance, ...listeners);

                    },

                    pauseButton: (toastInstance) => {

                        const listeners = [];

                        listeners.push({
                            element: toastInstance.pauseButton,
                            event: 'pointerdown',
                            handler: toastletNotify.handles.pauseButton.pointerdown,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.pauseButton,
                            event: 'mousedown',
                            handler: toastletNotify.handles.pauseButton.pointerdown,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.pauseButton,
                            event: 'pointerup',
                            handler: toastletNotify.handles.pauseButton.pointerup,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.pauseButton,
                            event: 'mouseup',
                            handler: toastletNotify.handles.pauseButton.pointerup,
                            params: [toastInstance]
                        });

                        toastletNotify.setup.setListener(toastInstance, ...listeners);

                    },

                    closeButton: (toastInstance) => {

                        const listeners = [];

                        listeners.push({
                            element: toastInstance.closeButton,
                            event: 'pointerdown',
                            handler: toastletNotify.handles.closeButton.pointerdown,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.closeButton,
                            event: 'mousedown',
                            handler: toastletNotify.handles.closeButton.pointerdown,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.closeButton,
                            event: 'pointerup',
                            handler: toastletNotify.handles.closeButton.pointerup,
                            params: [toastInstance]
                        });

                        listeners.push({
                            element: toastInstance.closeButton,
                            event: 'mouseup',
                            handler: toastletNotify.handles.closeButton.pointerup,
                            params: [toastInstance]
                        });

                        toastletNotify.setup.setListener(toastInstance, ...listeners);

                    },

                    window: (toastInstance) => {

                        const listeners = [];

                        listeners.push({
                            element: window,
                            event: 'resize',
                            handler: toastletNotify.handles.window.resize,
                            params: [toastInstance]
                        });

                        toastletNotify.setup.setListener(toastInstance, ...listeners);

                    },

                    document: (toastInstance) => {

                        const listeners = [];

                        listeners.push({
                            element: document,
                            event: 'visibilitychange',
                            handler: toastletNotify.handles.document.visibilityChange,
                            params: [toastInstance]
                        });

                        toastletNotify.setup.setListener(toastInstance, ...listeners);

                    }

                },

                setObserver: (toastInstance, ...args) => {

                    if( toastletTypeValidators.empty(args) ) return;

                    let i = args.length;

                    while(i--){

                        const arg = {...args[i]};

                        if( !arg.params || !toastletTypeValidators.array(arg.params) )
                            arg.params = [];

                        const properties = {
                            element: arg.element,
                            handler: arg.handler.bind(null, ...arg.params),
                            config: arg.config,
                            observer: null
                        };

                        properties.observer = new MutationObserver(properties.handler);

                        properties.observer.observe(properties.element, properties.config);

                        toastInstance.observers.push(properties);

                    }

                },

                createObserver: {

                    body: (toastInstance) => {

                        const observers = [];

                        observers.push({
                            element: document.body,
                            handler: toastletNotify.handles.body.mutation,
                            params: [toastInstance],
                            config: toastInstance.defaultObserverConfig
                        });

                        toastletNotify.setup.setObserver(toastInstance, ...observers);

                    },

                    html: (toastInstance) => {

                        const observers = [];

                        observers.push({
                            element: document.documentElement,
                            handler: toastletNotify.handles.html.mutation,
                            params: [toastInstance],
                            config: toastInstance.defaultObserverConfig
                        });

                        toastletNotify.setup.setObserver(toastInstance, ...observers);

                    }

                }

            },

            pause: (id) => {

                if( toastletTypeValidators.undefined(id) )
                    id = toastletInstances.getLastActiveId();

                if( ! toastletTypeValidators.unsignedNumber(id) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'id' must be an unsigned number\n  at toastletNotify.pause()`);
                    return;
                }

                if( ! toastletInstances.all.has(id) ) return;

                const toastInstance = toastletInstances.all.get(id);

                toastInstance.isPausedByProgrammatic = true;

                toastletNotify.timeouts.pauseTimer(toastInstance);

                if( toastInstance.config.pause.button && toastInstance.pauseButton ){

                    toastletStyleHelper.setProperties(
                        toastInstance.pauseButton,
                        ['opacity', '0.5'],
                        ['pointer-events', 'none'],
                        ['cursor', 'not-allowed']
                    );

                }

            },

            pauseAll: () => {

                for( const [id, toastInstance] of toastletInstances.all ){

                    toastInstance.isPausedByProgrammatic = true;

                    toastletNotify.timeouts.pauseTimer(toastInstance);

                    if( toastInstance.config.pause.button && toastInstance.pauseButton ){

                        toastletStyleHelper.setProperties(
                            toastInstance.pauseButton,
                            ['opacity', '0.5'],
                            ['pointer-events', 'none'],
                            ['cursor', 'not-allowed']
                        );

                    }

                }

            },
            
            play: (id) => {

                if( toastletTypeValidators.undefined(id) )
                    id = toastletInstances.getLastActiveId();

                if( ! toastletTypeValidators.unsignedNumber(id) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'id' must be an unsigned number\n  at toastletNotify.play()`);
                    return;
                }

                if( ! toastletInstances.all.has(id) ) return;

                const toastInstance = toastletInstances.all.get(id);

                toastInstance.isPausedByProgrammatic = false;

                toastletNotify.timeouts.startTimer(toastInstance);

                if( toastInstance.config.pause.button && toastInstance.pauseButton ){

                    toastletStyleHelper.setProperties(
                        toastInstance.pauseButton,
                        ['opacity', '1'],
                        ['pointer-events', 'auto'],
                        ['cursor', 'pointer']
                    );

                }

            },

            playAll: () => {

                for( const [id, toastInstance] of toastletInstances.all ){

                    toastInstance.isPausedByProgrammatic = false;

                    toastletNotify.timeouts.startTimer(toastInstance);

                    if( toastInstance.config.pause.button && toastInstance.pauseButton ){

                        toastletStyleHelper.setProperties(
                            toastInstance.pauseButton,
                            ['opacity', '1'],
                            ['pointer-events', 'auto'],
                            ['cursor', 'pointer']
                        );

                    }

                }

            },

            close: (id) => {
                
                if( toastletTypeValidators.undefined(id) )
                    id = toastletInstances.getLastActiveId();

                if( ! toastletTypeValidators.unsignedNumber(id) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'id' must be an unsigned number\n  at toastletNotify.close()`);
                    return;
                }

                if( ! toastletInstances.all.has(id) ) return;

                const toastInstance = toastletInstances.all.get(id);

                toastletNotify.utils.closeToast(toastInstance);            

            },

            closeAllNonStackable: () => {

                for( const [id, toastInstance] of toastletInstances.nonStackable ){

                    toastletNotify.utils.closeToast(toastInstance);

                }

            },

            closeAllStackable: () => {

                for( const [id, toastInstance] of toastletInstances.stackable ){

                    toastletNotify.utils.closeToast(toastInstance);

                }

            },

            closeAll: () => {

                for( const [id, toastInstance] of toastletInstances.all ){

                    toastletNotify.utils.closeToast(toastInstance);

                }

            },

            notify: (type, content = "", options = {}) => {

                if ( ! document.body ) {
                    console.error('[ToastletNotify] Error: document.body is not available. Make sure to call toastletNotify.notify() after the DOM is fully loaded.');
                    return null;
                }

                if( ! toastletTypeValidators.string(type) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'type' must be a string\n  at toastletNotify.notify()\n  Expected: string\n  Received: ${typeof type}`);
                    return null;
                }

                if( toastletTypeValidators.null(content) || toastletTypeValidators.undefined(content) ) 
                    content = "";

                if( ! toastletTypeValidators.string(content) && ! toastletTypeValidators.htmlContent(content) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'content' must be a string or HTML content\n  at toastletNotify.notify()\n  Expected: string | HTMLElement | Node | DocumentFragment\n  Received: ${typeof content}`);
                    return null;
                }

                if( ! toastletTypeValidators.plainObject(options) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'options' must be a plain object\n  at toastletNotify.notify()\n  Expected: object\n  Received: ${typeof options}`);
                    return null;
                }

                const notificationType = toastletNotify.presets.types.get(type);

                if( ! notificationType ) {
                    console.error(`[ToastletNotify] Invalid notification type: "${type}"\n  at toastletNotify.notify()\n  Valid types: info, success, warning, error, notice`);
                    return null;
                }

                const defaultConfig = {

                    notificationType: notificationType,
                    
                    sticky: false,
                    duration: 5000,
                    dismissible: true,
                    stackable: false,

                    stackableGap: {
                        desktop: 20,
                        mobile: 10
                    },
                    
                    html: false,
                    icon: true,
                    title: true,
                    titleText: '',
                    customClass: '',
                    
                    transition: {
                        enabled: true,
                        duration: 300
                    },

                    animation: {
                        in: '',
                        out: ''
                    },

                    pause: {
                        button: true,
                        hover: true,
                        focus: true,
                        touch: true,
                        inactiveTab: true,
                        resumeStrategy: 'resume' // 'restart' | 'resume'
                    },

                    progressBar: {
                        enabled: false,
                        direction: 'left-to-right',
                        data: toastletNotify.presets.progressBar.get('left-to-right')
                    },

                    position: {
                        desktop: 'top-right',
                        mobile: 'top',
                        data: {
                            desktop: toastletNotify.position.get.desktop('top-right'),
                            mobile: toastletNotify.position.get.mobile('top')
                        }
                    },

                    a11y: {
                        role: '',
                        ariaLive: ''
                    },

                    onClick: null,

                    ...notificationType.config

                };

                // !! REMOVE AFTER TESTING !!
                window.defaultConfig = defaultConfig; // For debugging purposes

                const config = toastletNotify.setup.sanitizeConfig(defaultConfig, options);

                if( toastletTypeValidators.emptyString( config.titleText ) )
                    config.title = false;

                // Content cannot be empty (null, undefined, empty string, whitespace-only text, empty DocumentFragment)
                // when there's no icon or title - at least one content type must be present for the notification
                if( ! config.icon && ! config.title && toastletTypeValidators.emptyContent(content) ) {
                    console.error('[ToastletNotify] Error: Notification must have at least one of the following: icon, title or content. Cannot create notification with empty content when no icon or title is provided.\n  at toastletNotify.notify()');
                    return null;
                }
                
                // Since touch pause is just a shortcut to pause the toast via button and improve usability,
                // it doesn't make sense for it to be enabled when there's no button
                if( ! config.pause.button )
                    config.pause.touch = false;

                const isSticky = !!( config.sticky || config.duration <= 0 );

                if( isSticky ) config.progressBar.enabled = false;

                const classes = toastletNotify.setup.configureClasses(config, content, notificationType);

                const defaultStyles = toastletNotify.setup.configureDefaultStyles(config, content, notificationType);

                const toastInstance = {

                    id: null, // Set later in toastletInstances.push()

                    enterElement: false,

                    get canHover(){
                        return toastletMatchMedia.anyHover.matches;
                    },

                    get pointerFine(){
                        return toastletMatchMedia.pointerFine.matches;
                    },

                    timeoutIDs: {

                        pauseButtonPointerDown: null,
                        closeButtonPointerDown: null,
                        pointerEvent: null,
                        close: null

                    },

                    timer: {

                        start: null,
                        
                        end: null,

                        get elapsed(){

                            if( this.start === null ){
                                console.warn('[ToastletNotify] Warning: Timer start is null — timer values must be an unsigned number (positive integer). Returning 0.');
                                return 0;
                            }

                            if( this.end === null ){
                                console.warn('[ToastletNotify] Warning: Timer end is null — timer values must be an unsigned number (positive integer). Returning 0.');
                                return 0;
                            }

                            if( this.end < this.start ){
                                console.warn('[ToastletNotify] Warning: Timer end is less than timer start — final value must be greater than or equal to the initial value. Returning 0.');
                                return 0;
                            }

                            return this.end - this.start;

                        }

                    },
                    
                    pauseReasons: new Set(),

                    get isPausedByButton(){

                        return this.pauseReasons.has('button');

                    },

                    set isPausedByButton(value){

                        if(value) 
                            this.pauseReasons.add('button');
                        else
                            this.pauseReasons.delete('button');

                    },

                    get isPausedByHover(){

                        return this.pauseReasons.has('hover');

                    },

                    set isPausedByHover(value){

                        if(value)
                            this.pauseReasons.add('hover');
                        else
                            this.pauseReasons.delete('hover');

                    },

                    get isPausedByFocus(){

                        return this.pauseReasons.has('focus');

                    },

                    set isPausedByFocus(value){

                        if(value)
                            this.pauseReasons.add('focus');
                        else
                            this.pauseReasons.delete('focus');

                    },

                    get isPausedByTouch(){

                        return this.pauseReasons.has('touch');

                    },

                    set isPausedByTouch(value){

                        if(value)
                            this.pauseReasons.add('touch');
                        else
                            this.pauseReasons.delete('touch');

                    },

                    get isPausedByInactiveTab(){

                        return this.pauseReasons.has('inactiveTab');

                    },

                    set isPausedByInactiveTab(value){

                        if(value)
                            this.pauseReasons.add('inactiveTab');
                        else
                            this.pauseReasons.delete('inactiveTab');

                    },

                    get isPausedByProgrammatic(){

                        return this.pauseReasons.has('programmatic');

                    },

                    set isPausedByProgrammatic(value){

                        if(value)
                            this.pauseReasons.add('programmatic');
                        else
                            this.pauseReasons.delete('programmatic');

                    },

                    get isPaused(){

                        return this.pauseReasons.size > 0;

                    },

                    hoverReasons: new Set(),

                    get isMouseHovered(){

                        return this.hoverReasons.has('mouse');

                    },

                    set isMouseHovered(value){

                        if(value)
                            this.hoverReasons.add('mouse');
                        else
                            this.hoverReasons.delete('mouse');

                    },

                    get isTouchHovered(){

                        return this.hoverReasons.has('touch');

                    },

                    set isTouchHovered(value){

                        if(value)
                            this.hoverReasons.add('touch');
                        else
                            this.hoverReasons.delete('touch');

                    },

                    get isFocusHovered(){

                        return this.hoverReasons.has('focus');

                    },

                    set isFocusHovered(value){

                        if(value)
                            this.hoverReasons.add('focus');
                        else
                            this.hoverReasons.delete('focus');

                    },

                    get isHovered(){

                        return this.hoverReasons.size > 0;

                    },

                    closeButtonPointerDown: false,
                    pauseButtonPointerDown: false,

                    isClickInProgress: false,

                    isPointerEvent: false,
                    isTouchEvent: false,

                    isSticky: isSticky,
                    isDismissible: config.dismissible,

                    get mode(){
                        return toastletGeneralHelper.isMobile() ? 'mobile' : 'desktop';
                    },

                    get inactiveTab(){
                        return document.visibilityState === 'hidden';
                    },

                    startX: 0,
                    currentX: 0,

                    isDragging: false,

                    isClosing: false,

                    touchStartTime: 0,
                    touchEndTime: 0,

                    touchStartPosition: { x: 0, y: 0 },

                    translateOutX: "0px",
                    translateOutY: "-20px",

                    transitionRule: {
                        toast: ['all', `${config.transition.duration}ms`, 'ease-in-out'],
                        progressBar: ['all', `${config.duration}ms`, 'linear']
                    },

                    config: config,

                    clickControl: null,

                    classList: classes,

                    runAnimationIn: ! toastletTypeValidators.empty(classes.animationIn),
                    runAnimationOut: ! toastletTypeValidators.empty(classes.animationOut),

                    defaultStyles: defaultStyles,

                    defaultObserverConfig: {
                        childList: true,
                        subtree: false,
                        attributes: false,
                        characterData: false,
                        attributeOldValue: false,
                        characterDataOldValue: false
                    },

                    observers: [],

                    rAF: {

                        restoreTransition: {
                            isScheduled: false,
                            fn: null
                        },

                        enterElement: {
                            isScheduled: false,
                            fn: null
                        }

                    },

                    listeners: []

                };

                if( ! toastletTypeValidators.null(toastInstance.config.onClick) ) {

                    let disabled = false;
                    
                    toastInstance.clickControl = objFreeze({

                        get disabled() {
                            return disabled;
                        },

                        set disabled(value) {

                            if( ! toastletTypeValidators.boolean(value) ) {
                                console.error(`[ToastletNotify] TypeError: 'disabled' must be a boolean\n  at clickControl.enabled\n  Expected: boolean\n  Received: ${typeof value}`);
                                return;
                            }

                            disabled = value;

                        }

                    });

                }               

                toastInstance.toast = toastletNotify.setup.createElement.toast(toastInstance, content, notificationType);

                toastInstance.rAF.restoreTransition.fn = toastletNotify.rAF.restoreTransition.bind(toastInstance.toast, toastInstance);

                toastInstance.rAF.enterElement.fn = toastletNotify.rAF.enterElement.bind(toastInstance.toast, toastInstance);

                if( toastInstance.config.icon ) {

                    toastInstance.iconCol = toastletNotify.setup.createElement.iconCol();

                    toastInstance.toast.appendChild(toastInstance.iconCol);

                    toastInstance.iconContainer = toastletNotify.setup.createElement.iconContainer(notificationType);

                    toastInstance.iconCol.appendChild(toastInstance.iconContainer);

                }
               
                if( toastInstance.config.title || ! toastletTypeValidators.emptyContent(content) ) {

                    toastInstance.contentCol = toastletNotify.setup.createElement.contentCol();

                    toastInstance.toast.appendChild(toastInstance.contentCol);

                    if( toastInstance.config.title ) {

                        toastInstance.title = toastletNotify.setup.createElement.title(toastInstance);

                        toastInstance.contentCol.appendChild(toastInstance.title);

                    }

                    if( ! toastletTypeValidators.emptyContent(content) ) {

                        toastInstance.content = toastletNotify.setup.createElement.content(toastInstance, content);

                        toastInstance.contentCol.appendChild(toastInstance.content);

                        toastInstance.toast.appendChild(toastInstance.contentCol);

                    }

                }

                if( ( ! toastInstance.isSticky && toastInstance.config.pause.button ) || toastInstance.isDismissible ) {

                    toastInstance.controlsCol = toastletNotify.setup.createElement.controlsCol(toastInstance);

                    toastletNotify.utils.shButtons(toastInstance);

                    if ( ! toastInstance.isSticky && toastInstance.config.pause.button ) {

                        toastInstance.pauseButton = toastletNotify.setup.createElement.pauseButton();

                        toastInstance.controlsCol.appendChild(toastInstance.pauseButton);

                        toastletNotify.setup.createListener.pauseButton(toastInstance);

                    }

                    if( toastInstance.isDismissible ) {

                        toastInstance.closeButton = toastletNotify.setup.createElement.closeButton();

                        toastInstance.controlsCol.appendChild(toastInstance.closeButton);

                        toastletNotify.setup.createListener.closeButton(toastInstance);

                    }

                    toastInstance.toast.appendChild(toastInstance.controlsCol);

                }

                if(toastInstance.config.progressBar.enabled && !toastInstance.isSticky) {

                    toastInstance.progressBar = toastletNotify.setup.createElement.progressBar();

                    toastInstance.toast.appendChild(toastInstance.progressBar);

                    toastInstance.progressBarThumb = toastletNotify.setup.createElement.progressBarThumb();

                    toastInstance.progressBar.appendChild(toastInstance.progressBarThumb);

                }

                toastletNotify.setup.createListener.toast(toastInstance);

                toastletNotify.setup.createListener.window(toastInstance);

                toastletNotify.setup.createListener.document(toastInstance);

                toastletNotify.setup.createObserver.body(toastInstance);

                toastletNotify.setup.createObserver.html(toastInstance);

                toastletInstances.push(toastInstance);

                Object.preventExtensions(toastInstance);

                document.body.appendChild(toastInstance.toast);

                toastletNotify.position.set[ toastInstance.mode ][ toastInstance.config.position.data[ toastInstance.mode ].name ]( toastInstance );

                if( ! toastletTypeValidators.empty(toastInstance.classList.animationIn) ) {

                    toastletStyleHelper.setProperties(
                        toastInstance.toast, 
                        ['opacity', '1']
                    );

                    toastletNotify.animation.setAnimationIn(toastInstance);

                }
                else{

                    toastletStyleHelper.setProperties(
                        toastInstance.toast, 
                        ['transform', `translate(${toastInstance.translateOutX}, ${toastInstance.translateOutY})`],
                        true
                    );

                }

                toastletStyleHelper.setProperties(
                    toastInstance.toast,
                    toastInstance.transitionRule.toast,
                    true
                );

                toastletNotify.utils.enterElement(toastInstance);
                
                // !! REMOVE AFTER TESTING !!
                window.toastletToast = toastInstance;

                const controller = {

                    id: toastInstance.id,
                    toast: toastInstance.toast
                    
                };

                if( toastInstance.isDismissible )
                    controller.close = () => toastletNotify.close(toastInstance.id);

                if( ! toastletNotify.isSticky ){
                    controller.play = () => toastletNotify.play(toastInstance.id);
                    controller.pause = () => toastletNotify.pause(toastInstance.id);
                }

                if( ! toastletTypeValidators.null(toastInstance.clickControl) )
                    controller.clickControl = toastInstance.clickControl;

                return controller;

            }

        }),
        writable: false,
        enumerable: false,
        configurable: false

    })

})();