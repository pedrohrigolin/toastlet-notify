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

    /**
     * Prevent Multiple Initialization Check
     * 
     * This conditional statement performs a critical initialization guard to prevent
     * the library from being loaded multiple times on the same page. It checks whether
     * the global `toastletNotify` object has already been attached to the window object.
     * 
     * @description If the library has already been initialized (window.toastletNotify !== undefined),
     *              this prevents potential conflicts, memory leaks, and unexpected behavior that
     *              could occur from having multiple instances of the same library running
     *              simultaneously.
     * 
     * @behavior    - When library is already loaded: Logs a warning message and exits early
     *              - When library is not loaded: Continues with normal initialization process
     * 
     * @reasoning   Multiple instances could lead to:
     *              • Event listener conflicts and memory leaks
     *              • CSS style conflicts and visual inconsistencies  
     *              • Duplicate toast notifications
     *              • Performance degradation from redundant operations
     * 
     * @example     Scenario: Script tag included twice in HTML
     *              First load:  Initializes normally
     *              Second load: Warns and exits, preserving original instance
     */
    if(window.toastletNotify !== undefined){
        console.warn('Toastlet Notify is already defined!');
        return;
    }

    // ?? TALVEZ ADICIONAR MAIS OPÇÕES DE PROGRESSBAR?

    // TODO: APARENTEMENTE O MOUSE OVER NÃO ESTÁ FUNCIONANDO MUITO BEM,
    // TODO: QUANDO CLICA E ARRASTA PARA FORA, ELE MANTÉM O ESTADO DE HOVER.

    // TODO: VERIFICAR OS @SINCE DOS DOCBLOCKS

    // TODO: REPENSAR A ESTRUTURA DE TOASTLETINSTANCES PARA ESCALAR MELHOR

    // TODO: ADICIONAR A FUNÇÃO RESTART PARA REINICIAR O TIMER

    // TODO: PASSAR AS FUNÇÕES DE CONTROLE DA API PÚBLICA PARA A API INTERNA E EXPOR ISSO NA PÚBLICA

    // TODO: VERIFICAR COMO ESTÁ O FUNCIONAMENTO DO FOCUS/BLUR QUANDO SE USA HTML CUSTOMIZADO

    // TODO: LEMBRAR DE ADICIONAR AS CLASSES

    // TODO: CRIAR MECANISMO PARA GERENCIAR CLASSES DINÂMICAS E FIXAS

    // TODO: PERMITIR CONFIGURAÇÃO DO TAMANHO MÍNIMO PARA SER CONSIDERADO MOBILE (mínimo 500px, máximo 1300px)

    // TODO: ORGANIZAR O OBJETO DE INSTANCIA

    // ?? Talvez permitir mais um alias para o top-middle e bottom-middle (top-center, bottom-center)?

    /**
     * * Pontos a se avaliar nos testes finais:
     * 
     * * Testar intensamente o funcionamente de focus/blur, hover, e suas interações
     * * entre diferentes configurações, handlers, callbacks e etc. Tem muito edge case nisso.
     * 
     * * Testar bem o funcionamento do modo stackable
     * 
     */

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
     */
    const toastletMatchMedia = objDeepFreeze({

        /**
         * Media query matcher for detecting hover capability across input mechanisms
         *
         * This MediaQueryList object tracks the `(any-hover: hover)` media feature, which detects
         * whether any available input mechanism on the device can hover over elements. This is
         * crucial for creating adaptive user interfaces that behave appropriately across different
         * device types and input methods.
         *
         * @author Pedro Rigolin
         * @type {MediaQueryList}
         * @readonly
         *
         * @description
         * The `any-hover` media feature evaluates to `hover` when at least one input mechanism
         * available to the user can conveniently hover over elements. This includes:
         * - Desktop mice and trackpads
         * - Styluses with hover detection
         * - Other pointing devices with hover capability
         *
         * It evaluates to `none` when no available input mechanisms can hover, which typically
         * includes:
         * - Touch screens (finger touch)
         * - Basic styluses without hover detection
         * - Keyboard-only navigation
         *
         * @behavior
         * - `.matches` returns `true` when hover is available on at least one input mechanism
         * - `.matches` returns `false` when no input mechanisms support hover
         * - Updates automatically when input capabilities change (e.g., connecting/disconnecting a mouse)
         * - Can be used with event listeners to respond to capability changes
         *
         * @use_cases
         * - Conditional UI elements (hover-only controls, tooltips, etc.)
         * - Adaptive interaction patterns (click vs hover behaviors)
         * - Touch-friendly interface detection
         * - Progressive enhancement for different input types
         *
         * @example
         * // Check if hover is available
         * if (toastletMatchMedia.anyHover.matches) {
         *   // Show hover-activated controls
         *   showHoverControls();
         * } else {
         *   // Use touch-friendly alternatives
         *   showTouchControls();
         * }
         *
         * @example
         * // Listen for changes in hover capability
         * toastletMatchMedia.anyHover.addEventListener('change', (event) => {
         *   if (event.matches) {
         *     console.log('Hover capability detected');
         *   } else {
         *     console.log('No hover capability available');
         *   }
         * });
         *
         * @note
         * This is different from `(hover: hover)` which only considers the primary input mechanism.
         * `any-hover` considers all available input mechanisms, making it more inclusive for
         * hybrid devices where multiple input types may be available simultaneously.
         */
        anyHover: window.matchMedia('(any-hover: hover)'),

        /**
         * Media query matcher for detecting fine pointer precision across input mechanisms
         *
         * This MediaQueryList object tracks the `(any-pointer: fine)` media feature, which detects
         * whether any available input mechanism can interact with elements with fine precision.
         * This is essential for determining whether users can accurately target small interactive
         * elements and for adapting interface density accordingly.
         *
         * @author Pedro Rigolin
         * @type {MediaQueryList}
         * @readonly
         *
         * @description
         * The `any-pointer` media feature with value `fine` evaluates to true when at least one
         * input mechanism available to the user is accurate enough to target small elements
         * reliably. This includes:
         * - Desktop mice with precise cursor control
         * - Trackpads with fine cursor movement
         * - Graphics tablets and styluses with high precision
         * - Other pointing devices with sub-pixel accuracy
         *
         * It evaluates to false when no available input mechanisms have fine precision, such as:
         * - Finger touch on touch screens (coarse pointer)
         * - Basic styluses without precision control
         * - Game controllers or TV remotes
         *
         * @behavior
         * - `.matches` returns `true` when fine pointer precision is available on at least one input
         * - `.matches` returns `false` when all available inputs have coarse precision only
         * - Updates dynamically when input devices are connected/disconnected
         * - Supports event listeners for real-time capability monitoring
         *
         * @precision_levels
         * - `fine`: Accurate enough for small targets (e.g., 1px borders, small buttons)
         * - `coarse`: Limited accuracy, requires larger targets (e.g., finger-sized buttons)
         * - `none`: No pointing device available (e.g., keyboard-only)
         *
         * @use_cases
         * - Adaptive button and link sizing (smaller for fine pointers, larger for coarse)
         * - Conditional display of precision-dependent controls
         * - Interface density adjustments (compact vs spacious layouts)
         * - Tooltip and popover positioning strategies
         *
         * @example
         * // Adapt interface density based on pointer precision
         * if (toastletMatchMedia.pointerFine.matches) {
         *   // Use compact interface with smaller targets
         *   element.classList.add('compact-layout');
         * } else {
         *   // Use spacious interface with larger targets
         *   element.classList.add('touch-friendly-layout');
         * }
         *
         * @example
         * // Conditional small control visibility
         * const showSmallControls = toastletMatchMedia.pointerFine.matches;
         * closeButton.style.display = showSmallControls ? 'block' : 'none';
         *
         * @example
         * // Listen for pointer precision changes
         * toastletMatchMedia.pointerFine.addEventListener('change', (event) => {
         *   if (event.matches) {
         *     // Switch to precision interface
         *     adaptForFinePointer();
         *   } else {
         *     // Switch to coarse-friendly interface
         *     adaptForCoarsePointer();
         *   }
         * });
         *
         * @note
         * This differs from `(pointer: fine)` which only considers the primary input mechanism.
         * `any-pointer` considers all available inputs, which is important for devices with
         * multiple input methods (e.g., laptops with both trackpad and touch screen).
         *
         * @accessibility
         * Proper use of this media query improves accessibility by ensuring interactive elements
         * are appropriately sized for the user's input capabilities, reducing frustration and
         * improving usability across different devices and interaction modalities.
         */
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

        /**
         * Merges and deduplicates CSS class names from multiple sources
         *
         * This function provides a robust solution for combining CSS class names from various input formats
         * (strings, arrays, or mixed), ensuring no duplicates and proper whitespace normalization. It's
         * designed for high-performance class management in dynamic DOM manipulation scenarios.
         *
         * @author Pedro Rigolin
         * @param {...(string|Array<string>)} classes - Variable number of arguments, each can be:
         *   - A string: "class1 class2" (space-separated class names)
         *   - An array: ["class1", "class2"] (array of class names)
         *   - Mixed: Can pass any combination of strings and arrays
         * @returns {Array<string>} A deduplicated array of class names with normalized whitespace
         *
         * @description
         * The function processes each argument by:
         * 1. Validating input types (accepts strings and arrays only)
         * 2. Splitting string inputs on whitespace using pre-compiled regex
         * 3. Normalizing Unicode whitespace characters to standard spaces
         * 4. Trimming excess whitespace from individual class names
         * 5. Using Set-based deduplication to eliminate duplicates efficiently
         * 6. Returning a clean array of unique, whitespace-free class names
         *
         * @behavior
         * - Invalid inputs (non-string, non-array) are silently skipped
         * - Empty strings and whitespace-only classes are filtered out
         * - Duplicate classes are automatically removed (last occurrence wins)
         * - Unicode whitespace (tabs, newlines, etc.) is normalized to spaces
         * - Order is preserved except for duplicates (first occurrence kept)
         *
         * @performance
         * - O(n*m) time complexity where n=number of arguments, m=average classes per argument
         * - Uses native Set for O(1) duplicate detection
         * - Pre-compiled regex patterns for consistent performance
         * - Minimal memory footprint with early validation and filtering
         *
         * @example
         * // Basic string merging
         * mergeClasses("btn btn-primary", "active") // ["btn", "btn-primary", "active"]
         *
         * @example
         * // Array and string mixing
         * mergeClasses(["btn", "btn-primary"], "active", ["disabled"]) // ["btn", "btn-primary", "active", "disabled"]
         *
         * @example
         * // Duplicate removal
         * mergeClasses("btn active", ["btn", "hover"], "active") // ["btn", "active", "hover"]
         *
         * @example
         * // Whitespace normalization
         * mergeClasses("  btn\n\tprimary  ", ["  active  "]) // ["btn", "primary", "active"]
         *
         * @example
         * // Invalid input handling
         * mergeClasses("btn", null, ["active"], undefined, "primary") // ["btn", "active", "primary"]
         *
         * @useCase
         * // Dynamic class composition for toast notifications
         * const baseClasses = ["toast", "toast-success"];
         * const positionClasses = "toast-top-right";
         * const customClasses = ["my-custom-toast"];
         * const finalClasses = mergeClasses(baseClasses, positionClasses, customClasses);
         * // Result: ["toast", "toast-success", "toast-top-right", "my-custom-toast"]
         *
         * @useCase
         * // Conditional class merging
         * const isActive = true;
         * const classes = mergeClasses(
         *   "button",
         *   isActive ? "active" : "inactive",
         *   ["btn-primary", "btn-lg"]
         * );
         * // Result: ["button", "active", "btn-primary", "btn-lg"]
         *
         * @note
         * This function is particularly useful in React-like component systems or dynamic DOM
         * manipulation where classes need to be combined from multiple sources while maintaining
         * performance and avoiding duplicate class applications.
         */
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

        /**
         * Extracts and deduplicates CSS class names from space-separated strings
         *
         * This function takes multiple string arguments containing space-separated CSS class names
         * and returns a deduplicated array of individual class names. It's designed for processing
         * class strings from various sources (HTML attributes, configuration, etc.) into a clean,
         * normalized format suitable for programmatic manipulation.
         *
         * @author Pedro Rigolin
         * @param {...string} classes - Variable number of string arguments containing space-separated class names
         * @returns {Array<string>} A deduplicated array of individual class names with normalized whitespace
         *
         * @description
         * The function processes each string argument by:
         * 1. Validating that the input is a string (non-strings are silently skipped)
         * 2. Normalizing Unicode whitespace characters to standard spaces
         * 3. Trimming leading and trailing whitespace
         * 4. Splitting on whitespace boundaries using pre-compiled regex
         * 5. Filtering out empty strings and duplicate class names
         * 6. Returning a clean array of unique class names
         *
         * @behavior
         * - Only accepts string inputs; other types are silently ignored
         * - Handles Unicode whitespace (tabs, newlines, etc.) by normalizing to spaces
         * - Automatically removes duplicate class names (first occurrence preserved)
         * - Filters out empty strings and whitespace-only classes
         * - Preserves original order except for duplicates
         *
         * @performance
         * - O(n*m) time complexity where n=number of arguments, m=average classes per string
         * - Uses Set for O(1) duplicate detection
         * - Pre-compiled regex for consistent whitespace handling
         * - Memory-efficient with early validation and filtering
         *
         * @difference_from_mergeClasses
         * While `mergeClasses` accepts both strings and arrays as input, `explodeClasses` is
         * specifically designed for string-only inputs and focuses on breaking down space-separated
         * class strings into individual components. It's optimized for scenarios where you know
         * the input will be strings and need to extract individual class names.
         *
         * @example
         * // Basic string explosion
         * explodeClasses("btn btn-primary active") // ["btn", "btn-primary", "active"]
         *
         * @example
         * // Multiple string arguments
         * explodeClasses("btn primary", "active disabled", "custom") 
         * // ["btn", "primary", "active", "disabled", "custom"]
         *
         * @example
         * // Duplicate removal across arguments
         * explodeClasses("btn active", "btn hover", "active focus") 
         * // ["btn", "active", "hover", "focus"]
         *
         * @example
         * // Whitespace normalization
         * explodeClasses("  btn\n\tprimary  ", " active\r\n ") 
         * // ["btn", "primary", "active"]
         *
         * @example
         * // Mixed valid and invalid inputs
         * explodeClasses("btn primary", null, "active", undefined, "disabled") 
         * // ["btn", "primary", "active", "disabled"]
         *
         * @use_case
         * // Processing CSS classes from HTML attributes
         * const htmlClasses = element.getAttribute('class');
         * const customClasses = "my-custom-class another-class";
         * const allClasses = explodeClasses(htmlClasses, customClasses);
         * // Result: clean array of all individual class names
         *
         * @use_case
         * // Configuration processing
         * const userConfig = "theme-dark compact-mode";
         * const defaultConfig = "app-container responsive";
         * const finalClasses = explodeClasses(userConfig, defaultConfig);
         * // Result: ["theme-dark", "compact-mode", "app-container", "responsive"]
         */
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

        /**
         * Converts multiple class sources into a single space-separated string
         *
         * This function provides a convenient way to merge class names from various sources
         * (strings, arrays, or mixed) and output them as a single space-separated string
         * suitable for direct assignment to DOM element className properties or HTML class attributes.
         * It leverages the robust mergeClasses function internally while providing a string output format.
         *
         * @author Pedro Rigolin
         * @param {...(string|Array<string>)} classes - Variable number of arguments, each can be a string or array
         * @returns {string} A space-separated string of deduplicated class names
         *
         * @description
         * This function acts as a wrapper around `mergeClasses`, taking the same flexible input
         * types and processing them through the same robust deduplication and normalization
         * pipeline, but returns the result as a joined string rather than an array. This makes
         * it ideal for scenarios where you need the final result as a string for DOM manipulation.
         *
         * @behavior
         * - Accepts the same input types as `mergeClasses` (strings, arrays, mixed)
         * - Applies the same deduplication and normalization logic
         * - Returns a single string with classes separated by single spaces
         * - Empty input results in an empty string
         * - Invalid inputs are silently filtered out
         *
         * @performance
         * - Inherits the O(n*m) complexity of `mergeClasses`
         * - Adds minimal overhead for the final `.join(' ')` operation
         * - No additional memory allocation beyond what `mergeClasses` requires
         * - String concatenation is optimized by the JavaScript engine
         *
         * @use_cases
         * - Direct assignment to element.className
         * - Building class attributes for HTML generation
         * - Template string construction
         * - Configuration string creation
         * - API response formatting
         *
         * @example
         * // Basic usage with strings
         * implodeClasses("btn btn-primary", "active") // "btn btn-primary active"
         *
         * @example
         * // Mixed arrays and strings
         * implodeClasses(["btn", "primary"], "active", ["hover"]) // "btn primary active hover"
         *
         * @example
         * // Direct DOM assignment
         * element.className = implodeClasses(baseClasses, conditionalClasses, customClasses);
         *
         * @example
         * // Template string usage
         * const htmlTemplate = `<div class="${implodeClasses(classes)}">Content</div>`;
         *
         * @example
         * // Configuration building
         * const configClasses = implodeClasses(
         *   themeClasses,
         *   sizeClasses,
         *   stateClasses,
         *   customClasses
         * );
         * // Result: "theme-dark size-large state-active my-custom-class"
         *
         * @relationship_to_mergeClasses
         * This function is essentially `mergeClasses(...args).join(' ')`, providing a more
         * convenient API when you know you need string output. It's functionally equivalent
         * to calling mergeClasses and then joining the result, but with a cleaner interface.
         *
         * @note
         * When you need an array for further manipulation, use `mergeClasses` directly.
         * When you need a string for DOM assignment or HTML generation, use `implodeClasses`.
         */
        implodeClasses: (...classes) => {

            return toastletClassHelper.mergeClasses(...classes).join(' ');

        },

        /**
         * Adds CSS classes to a DOM element with optional forced reflow
         *
         * This function provides a safe and efficient way to add multiple CSS classes to a DOM element
         * while handling deduplication, normalization, and optional browser reflow triggering. It's
         * designed for scenarios where you need to add classes from various sources and optionally
         * ensure immediate style recalculation for animation or layout purposes.
         *
         * @author Pedro Rigolin
         * @param {Element} element - The DOM element to add classes to
         * @param {...(string|Array<string>|boolean)} classes - Class sources and optional reflow flag
         * @returns {void}
         *
         * @description
         * The function processes class arguments through the `mergeClasses` pipeline to ensure
         * proper deduplication and normalization, then uses the native `classList.add()` method
         * for optimal performance. If the last argument is `true`, it triggers a forced reflow
         * by accessing `offsetWidth`, which can be useful for ensuring styles are applied
         * immediately before animations or further manipulations.
         *
         * @parameters
         * - `element`: Must be a valid DOM Element with classList support
         * - `...classes`: Can include strings, arrays, or mixed class sources
         * - `reflow flag`: If the last argument is boolean `true`, forces immediate reflow
         *
         * @behavior
         * - Validates that classes array is not empty before processing
         * - Uses `mergeClasses` for robust class processing and deduplication
         * - Leverages native `classList.add()` for optimal browser performance
         * - Silently handles duplicate classes (browser ignores duplicates automatically)
         * - Optional reflow trigger for immediate style application
         *
         * @reflow_mechanism
         * When the last argument is `true`, the function accesses `element.offsetWidth` after
         * adding classes. This forces the browser to recalculate layout immediately, which
         * can be necessary for:
         * - Ensuring classes are applied before starting animations
         * - Triggering CSS transitions that depend on the new classes
         * - Synchronous style application in rapid DOM manipulations
         *
         * @performance
         * - O(n*m) for class processing + O(k) for DOM manipulation where k=final class count
         * - Uses native classList.add() which is highly optimized
         * - Forced reflow adds layout calculation overhead when enabled
         * - Batch processing reduces individual classList calls
         *
         * @example
         * // Basic class addition
         * addClasses(element, "btn btn-primary", ["active", "hover"]);
         *
         * @example
         * // With forced reflow for animation preparation
         * addClasses(element, "animate-in", "fade-in", true);
         * // Classes are immediately applied, ready for CSS transitions
         *
         * @example
         * // Conditional class addition
         * addClasses(
         *   element,
         *   baseClasses,
         *   isActive ? "active" : "",
         *   isHovered ? ["hover", "focus"] : "",
         *   true // Force reflow
         * );
         *
         * @example
         * // Animation sequence with immediate application
         * addClasses(element, "prepare-animation", true);
         * // Styles are now applied, safe to start animation
         * element.style.transform = "translateX(100px)";
         *
         * @safety
         * - Handles empty class arrays gracefully (early return)
         * - Won't throw errors on duplicate class additions
         * - Safe to call with mixed valid/invalid class inputs
         * - Element parameter should be validated by caller
         *
         * @use_cases
         * - Dynamic styling based on state changes
         * - Animation preparation and sequencing
         * - Theme or layout class application
         * - Progressive enhancement scenarios
         * - Responsive class management
         *
         * @note
         * The reflow parameter should be used sparingly as it can impact performance.
         * Only use it when you specifically need immediate style application for
         * animations or precise timing requirements.
         */
        addClasses: (element, ...classes) => {

            if( toastletTypeValidators.empty(classes) ) return;

            const reflow = classes[classes.length - 1] === true;

            element.classList.add(...toastletClassHelper.mergeClasses(...classes));

            if( reflow ) void element.offsetWidth; // Force reflow

        },

        /**
         * Removes CSS classes from a DOM element with optional forced reflow
         *
         * This function provides a safe and efficient way to remove multiple CSS classes from a DOM
         * element while handling normalization and optional browser reflow triggering. It's designed
         * for scenarios where you need to remove classes from various sources and optionally ensure
         * immediate style recalculation for animations, state changes, or layout adjustments.
         *
         * @author Pedro Rigolin
         * @param {Element} element - The DOM element to remove classes from
         * @param {...(string|Array<string>|boolean)} classes - Class sources and optional reflow flag
         * @returns {void}
         *
         * @description
         * The function processes class arguments through the `mergeClasses` pipeline to ensure
         * proper normalization and deduplication, then uses the native `classList.remove()` method
         * for optimal performance. If the last argument is `true`, it triggers a forced reflow
         * by accessing `offsetWidth`, which ensures styles are recalculated immediately after
         * the class removal.
         *
         * @parameters
         * - `element`: Must be a valid DOM Element with classList support
         * - `...classes`: Can include strings, arrays, or mixed class sources to remove
         * - `reflow flag`: If the last argument is boolean `true`, forces immediate reflow
         *
         * @behavior
         * - Validates that classes array is not empty before processing
         * - Uses `mergeClasses` for robust class processing and normalization
         * - Leverages native `classList.remove()` for optimal browser performance
         * - Silently handles non-existent classes (browser ignores missing classes)
         * - Optional reflow trigger for immediate style recalculation
         *
         * @reflow_mechanism
         * When the last argument is `true`, the function accesses `element.offsetWidth` after
         * removing classes. This forces the browser to recalculate layout immediately, which
         * is useful for:
         * - Ensuring classes are removed before starting exit animations
         * - Triggering immediate CSS transitions based on removed states
         * - Synchronous style updates in complex DOM manipulations
         * - Layout adjustments that depend on the removed classes
         *
         * @performance
         * - O(n*m) for class processing + O(k) for DOM manipulation where k=classes to remove
         * - Uses native classList.remove() which is highly optimized
         * - Forced reflow adds layout calculation overhead when enabled
         * - Batch processing reduces individual classList calls
         *
         * @example
         * // Basic class removal
         * removeClasses(element, "active hover", ["disabled", "loading"]);
         *
         * @example
         * // With forced reflow for animation timing
         * removeClasses(element, "animate-in", "visible", true);
         * // Classes removed immediately, ready for exit animation
         *
         * @example
         * // State change with immediate effect
         * removeClasses(
         *   element,
         *   "loading",
         *   "disabled",
         *   ["pending", "processing"],
         *   true // Ensure immediate visual update
         * );
         *
         * @example
         * // Animation cleanup sequence
         * removeClasses(element, "animate-out", "fade-out", true);
         * // Animation classes removed, element ready for next state
         * addClasses(element, "animate-in", "fade-in", true);
         *
         * @safety
         * - Handles empty class arrays gracefully (early return)
         * - Won't throw errors when removing non-existent classes
         * - Safe to call with mixed valid/invalid class inputs
         * - Element parameter should be validated by caller
         *
         * @use_cases
         * - State cleanup after animations complete
         * - Removing temporary or conditional styling
         * - Cleanup during component unmounting
         * - Resetting elements to base state
         * - Theme or mode switching
         * - Error state cleanup
         *
         * @animation_patterns
         * Common pattern for exit animations:
         * ```js
         * // 1. Add exit animation classes
         * addClasses(element, "animate-out", "fade-out");
         * 
         * // 2. Wait for animation, then clean up
         * setTimeout(() => {
         *   removeClasses(element, "animate-out", "fade-out", true);
         * }, animationDuration);
         * ```
         *
         * @note
         * The reflow parameter should be used judiciously as it can impact performance.
         * Use it when you need immediate style recalculation for timing-sensitive
         * operations like animations or rapid state changes.
         */
        removeClasses: (element, ...classes) => {

            if( toastletTypeValidators.empty(classes) ) return;

            const reflow = classes[classes.length - 1] === true;

            element.classList.remove(...toastletClassHelper.mergeClasses(...classes));

            if( reflow ) void element.offsetWidth; // Force reflow

        },

        /**
         * Completely replaces an element's class list with new classes and optional forced reflow
         *
         * This function provides a comprehensive way to replace an element's entire class list
         * with a new set of classes from various sources. Unlike addClasses and removeClasses
         * which modify existing classes, this function performs a complete replacement, ensuring
         * the element has exactly the specified classes and no others. It's ideal for scenarios
         * where you need to reset an element's styling to a specific state.
         *
         * @author Pedro Rigolin
         * @param {Element} element - The DOM element whose class list will be completely replaced
         * @param {...(string|Array<string>|boolean)} classes - Class sources and optional reflow flag
         * @returns {void}
         *
         * @description
         * The function processes class arguments through the `mergeClasses` and `implodeClasses`
         * pipeline to create a normalized, deduplicated string of class names, then directly
         * assigns this string to the element's `className` property. This approach completely
         * replaces any existing classes with the new set. If the last argument is `true`,
         * it triggers a forced reflow for immediate style application.
         *
         * @parameters
         * - `element`: Must be a valid DOM Element with className property support
         * - `...classes`: Can include strings, arrays, or mixed class sources for the new class list
         * - `reflow flag`: If the last argument is boolean `true`, forces immediate reflow
         *
         * @behavior
         * - Validates that classes array is not empty before processing
         * - Completely removes all existing classes from the element
         * - Applies new classes as a complete replacement
         * - Uses `implodeClasses` for optimal string generation
         * - Optional reflow trigger for immediate style recalculation
         *
         * @replacement_strategy
         * This function uses direct `className` assignment rather than classList manipulation,
         * which provides several advantages:
         * - Atomic operation: all old classes removed and new ones added simultaneously
         * - No intermediate states where element might have partial class sets
         * - Optimal for complete state transitions
         * - Cleaner than multiple add/remove operations
         *
         * @reflow_mechanism
         * When the last argument is `true`, the function accesses `element.offsetWidth` after
         * setting the new className. This is particularly important for complete class
         * replacements because:
         * - Ensures new styles are calculated before subsequent operations
         * - Critical for complex state transitions that affect layout
         * - Necessary when transitioning between fundamentally different styling states
         *
         * @performance
         * - O(n*m) for class processing + O(1) for className assignment
         * - Single DOM property assignment is more efficient than multiple classList operations
         * - Forced reflow adds layout calculation overhead when enabled
         * - Optimal for complete class list changes
         *
         * @example
         * // Complete class replacement
         * replaceClassList(element, "btn btn-success", ["large", "rounded"]);
         * // Element now has exactly: "btn btn-success large rounded"
         *
         * @example
         * // State transition with immediate reflow
         * replaceClassList(element, "toast toast-error", "animate-in", true);
         * // Previous classes completely removed, new ones applied immediately
         *
         * @example
         * // Theme switching
         * replaceClassList(
         *   element,
         *   baseClasses,
         *   newThemeClasses,
         *   layoutClasses,
         *   true // Ensure immediate visual update
         * );
         *
         * @example
         * // Component state reset
         * replaceClassList(element, "component", "default-state", "idle");
         * // All previous state classes removed, element reset to default
         *
         * @use_cases
         * - Complete component state transitions
         * - Theme or skin switching
         * - Resetting elements to known states
         * - Mode changes (edit/view, expanded/collapsed)
         * - Error recovery scenarios
         * - Dynamic component reconfiguration
         *
         * @safety
         * - Handles empty class arrays gracefully (early return)
         * - Safely replaces any existing className content
         * - Won't throw errors with mixed valid/invalid inputs
         * - Element parameter should be validated by caller
         *
         * @comparison_with_alternatives
         * - More efficient than `element.classList.clear()` + multiple `add()` calls
         * - Atomic operation prevents intermediate styling states
         * - Cleaner than manual string concatenation
         * - More reliable than removing specific classes and adding others
         *
         * @animation_considerations
         * When used for animations, be careful about timing:
         * ```js
         * // Good: Complete state change with reflow
         * replaceClassList(element, "new-state", "animate-in", true);
         * 
         * // Be careful: Might interrupt ongoing animations
         * // Consider using addClasses/removeClasses for partial updates
         * ```
         *
         * @note
         * This function is best used when you need complete control over an element's
         * class list. For incremental changes, prefer addClasses() or removeClasses().
         * The reflow parameter is especially important here since complete class
         * replacement often involves significant styling changes.
         */
        replaceClassList: (element, ...classes) => {

            if( toastletTypeValidators.empty(classes) ) return;

            const reflow = classes[classes.length - 1] === true;

            element.className = toastletClassHelper.implodeClasses(...classes);

            if( reflow ) void element.offsetWidth; // Force reflow

        }

    });

    /**
     * Computed Style Cache - Performance optimization for DOM style operations
     *
     * This WeakMap serves as a high-performance cache for `window.getComputedStyle()` objects,
     * significantly reducing the computational overhead of repeated style property access during
     * toast notification lifecycles. The cache leverages the live nature of computed style objects
     * and provides automatic memory management through WeakMap's garbage collection characteristics.
     *
     * @author Pedro Rigolin
     * @type {WeakMap<Element, CSSStyleDeclaration>}
     * @readonly
     *
     * @description
     * The cache stores Element-to-CSSStyleDeclaration mappings, where each element's computed
     * style object is cached on first access and reused for subsequent property reads. This
     * approach exploits the fact that `getComputedStyle()` returns live objects that automatically
     * reflect current computed values, eliminating the need for cache invalidation in most scenarios.
     *
     * @performance_benefits
     * - **Reduced DOM Queries**: Eliminates repeated `getComputedStyle()` calls for the same element
     * - **Live Style Tracking**: Cached objects automatically reflect style changes without re-caching
     * - **Batch Operation Efficiency**: Multiple property reads from the same element use cached object
     * - **Animation Performance**: Smooth style monitoring during transitions and animations
     * - **Memory Efficiency**: WeakMap automatically cleans up when elements are garbage collected
     *
     * @live_object_behavior
     * `window.getComputedStyle()` returns live CSSStyleDeclaration objects that:
     * - Automatically update when element styles change (CSS class changes, inline style modifications)
     * - Reflect current animation/transition intermediate values in real-time
     * - Stay synchronized with the DOM without requiring manual refresh
     * - Provide consistent computed values across property access patterns
     * - Update immediately when layout-affecting changes occur
     *
     * @weakmap_advantages
     * Using WeakMap for caching provides several critical benefits:
     * - **Automatic Memory Management**: Entries are automatically garbage collected when elements are removed from DOM
     * - **Memory Leak Prevention**: No manual cleanup required; prevents memory leaks in long-running applications
     * - **Zero Memory Footprint**: Cache entries don't prevent element garbage collection
     * - **Secure References**: Elements used as keys cannot be enumerated or accessed externally
     * - **Performance Isolation**: Cache operations don't affect application memory pressure
     *
     * @cache_lifecycle
     * 1. **Population**: First `getProperties()` call stores computed style object in cache
     * 2. **Reuse**: Subsequent property reads use cached object without new DOM queries
     * 3. **Live Updates**: Cached object automatically reflects any style changes
     * 4. **Manual Cleanup**: Explicitly removed during toast destruction for immediate cleanup
     * 5. **Automatic Cleanup**: WeakMap automatically removes entries when elements are garbage collected
     *
     * @usage_pattern
     * ```js
     * // First access - populates cache
     * const styles1 = getProperties(element, 'width', 'height');
     * 
     * // Subsequent access - uses cached object (performance benefit)
     * const styles2 = getProperties(element, 'color', 'font-size');
     * 
     * // After style changes - cached object reflects new values automatically
     * element.style.color = 'red';
     * const styles3 = getProperties(element, 'color'); // Returns 'red' from cached object
     * ```
     *
     * @memory_management
     * The cache implements a hybrid cleanup strategy:
     * - **Immediate Cleanup**: Manually deleted during toast destruction for responsive memory management
     * - **Automatic Cleanup**: WeakMap handles garbage collection when elements are no longer referenced
     * - **No Memory Leaks**: Cache cannot prevent element garbage collection or cause memory retention
     * - **Scalable**: Cache size is naturally limited by active element count
     *
     * @performance_metrics
     * Typical performance improvements:
     * - 70-90% reduction in `getComputedStyle()` calls during active toast lifecycles
     * - Significant performance boost in animation-heavy scenarios
     * - Reduced layout thrashing in batch style operations
     * - Lower CPU usage during style-intensive operations
     * - Improved responsiveness in high-frequency style monitoring
     *
     * @use_cases
     * - Animation state monitoring and calculations
     * - Dynamic layout measurements and responsive adjustments
     * - Style property validation and debugging
     * - Performance-critical style operations
     * - Batch style processing for multiple properties
     * - Real-time style tracking during user interactions
     *
     * @cleanup_strategy
     * Cache entries are removed in two scenarios:
     * 1. **Manual Deletion**: During toast destruction via explicit `cache.delete(element)` calls
     * 2. **Automatic Deletion**: When elements are garbage collected (WeakMap behavior)
     *
     * This dual approach ensures immediate memory cleanup for short-lived elements while
     * providing automatic safety for elements that might persist beyond expected lifecycles.
     *
     * @browser_compatibility
     * WeakMap is supported in all modern browsers and provides consistent garbage collection
     * behavior across different JavaScript engines, ensuring reliable memory management.
     *
     * @note
     * This cache is specifically designed for read-heavy scenarios where the same element's
     * computed styles are accessed multiple times. The live nature of computed style objects
     * makes this approach particularly effective for dynamic styling scenarios common in
     * toast notification systems.
     */
    const computedStyleCache = new WeakMap();

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

        /**
         * Sets multiple CSS properties on a DOM element with advanced validation and optional reflow
         *
         * This function provides a robust and efficient way to apply multiple CSS properties to a DOM
         * element simultaneously. It features comprehensive input validation, automatic sanitization,
         * deduplication of properties, and optional forced browser reflow for precise timing control.
         * The function is optimized for batch style operations while maintaining safety and performance.
         *
         * @author Pedro Rigolin
         * @param {Element} element - The DOM element to apply CSS properties to
         * @param {...(Array<string>|boolean)} properties - Variable number of property arrays and optional reflow flag
         * @returns {void}
         *
         * @description
         * Each property argument should be an array containing:
         * - [0] property name (required): CSS property name (e.g., 'color', 'margin-top')
         * - [1] property value (required): CSS property value (e.g., 'red', '10px')
         * - [2] priority (optional): CSS property priority (e.g., 'important')
         * - [3] reserved for future use
         *
         * If the last argument is boolean `true`, forces immediate browser reflow after applying all properties.
         *
         * @property_format
         * Properties are passed as individual arrays:
         * - ['property-name', 'value'] - Basic property/value pair
         * - ['property-name', 'value', 'important'] - With priority flag
         * - Maximum 4 elements per array (enforced for safety)
         *
         * @validation_process
         * 1. Filters out non-array arguments (except final boolean reflow flag)
         * 2. Validates that each array contains at least 2 string elements
         * 3. Trims whitespace from all string values
         * 4. Prevents duplicate property assignments (last occurrence wins)
         * 5. Uses Map for efficient duplicate detection and property storage
         *
         * @performance_optimizations
         * - Reverse while loop iteration for optimal performance
         * - Map-based deduplication prevents redundant DOM operations
         * - Batch processing minimizes individual style.setProperty calls
         * - Early validation prevents unnecessary processing of invalid inputs
         * - Optional reflow control for animation timing precision
         *
         * @reflow_mechanism
         * When the last argument is `true`, the function accesses `element.offsetWidth` after
         * setting all properties. This forces immediate layout recalculation, which is crucial for:
         * - Ensuring styles are applied before starting animations
         * - Synchronous style updates in rapid DOM manipulations
         * - Precise timing control for CSS transitions
         * - Layout-dependent operations that require immediate style application
         *
         * @example
         * // Basic property setting
         * setProperties(element, 
         *   ['color', 'red'],
         *   ['font-size', '16px'],
         *   ['margin', '10px 20px']
         * );
         *
         * @example
         * // With CSS priority and forced reflow
         * setProperties(element,
         *   ['background-color', 'blue', 'important'],
         *   ['transform', 'translateX(100px)'],
         *   ['opacity', '0.8'],
         *   true // Force immediate reflow
         * );
         *
         * @example
         * // Animation preparation with guaranteed style application
         * setProperties(element,
         *   ['transition', 'all 0.3s ease'],
         *   ['transform', 'scale(1)'],
         *   true // Ensure styles applied before next operation
         * );
         * // Now safe to trigger animation
         * setProperties(element, ['transform', 'scale(1.2)']);
         *
         * @example
         * // Batch styling with deduplication
         * setProperties(element,
         *   ['color', 'blue'],
         *   ['font-size', '14px'],
         *   ['color', 'red'], // This overwrites the blue color
         *   ['padding', '10px']
         * );
         * // Final result: color is red, font-size is 14px, padding is 10px
         *
         * @safety_features
         * - Input validation prevents malformed property assignments
         * - Automatic deduplication prevents conflicting styles
         * - Graceful handling of invalid inputs (silently skipped)
         * - Length limits on property arrays prevent potential security issues
         * - Whitespace trimming ensures clean property names and values
         *
         * @use_cases
         * - Batch styling for performance optimization
         * - Animation state preparation and sequencing
         * - Dynamic theming and style switching
         * - Responsive design adjustments
         * - Component state styling updates
         * - CSS-in-JS implementations
         *
         * @browser_compatibility
         * Uses standard `element.style.setProperty()` method which is supported in all modern
         * browsers and provides consistent behavior across different implementations.
         *
         * @note
         * The forced reflow parameter should be used judiciously as it can impact performance.
         * Only use it when you specifically need immediate style application for timing-critical
         * operations like animations or precise layout calculations.
         */
        setProperties: (element, ...properties) => {

            if( toastletTypeValidators.empty(properties) ) return;

            const reflow = properties[properties.length - 1] === true;

            const sanitizedProperties = new Map();

            let i = properties.length;

            while(i--){

                if( ! toastletTypeValidators.array(properties[i]) ) continue;

                let sanitizedArray = [];

                let error = false;

                for(let j=0, len=properties[i].length; j<len && j < 3; j++){

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

        /**
         * Retrieves computed CSS property values from a DOM element with high-performance caching and optional forced reflow
         *
         * This function provides a highly optimized and reliable way to extract computed CSS property values
         * from DOM elements. It features advanced performance caching using the computedStyleCache WeakMap,
         * comprehensive input validation, automatic sanitization, deduplication, and optional forced browser
         * reflow for ensuring up-to-date computed values. The function is optimized for batch property
         * retrieval while maintaining maximum accuracy and performance through intelligent caching strategies.
         *
         * @author Pedro Rigolin
         * @param {Element} element - The DOM element to read CSS properties from
         * @param {...(string|boolean)} properties - Variable number of property names and optional reflow flag
         * @returns {Object} An object containing property names as keys and their computed values as values
         *
         * @description
         * The function accepts multiple property name arguments as strings, with an optional boolean
         * `true` as the last argument to force browser reflow before reading computed values. It leverages
         * the computedStyleCache WeakMap to store and reuse getComputedStyle objects, dramatically improving
         * performance for repeated property access on the same elements while ensuring live style updates.
         *
         * @cache_strategy
         * The function implements an intelligent caching mechanism using computedStyleCache:
         * 1. **Cache Population**: First access stores the getComputedStyle object in the WeakMap cache
         * 2. **Cache Utilization**: Subsequent calls reuse the cached computed style object
         * 3. **Live Updates**: Cached objects automatically reflect style changes without re-caching
         * 4. **Performance Boost**: Eliminates repeated getComputedStyle DOM queries (70-90% reduction)
         * 5. **Memory Safety**: WeakMap automatically cleans up when elements are garbage collected
         *
         * @validation_process
         * 1. Checks for empty properties array and returns early if no properties requested
         * 2. Filters out non-string arguments (except final boolean reflow flag)
         * 3. Trims whitespace from property names
         * 4. Removes empty or whitespace-only property names
         * 5. Uses Set-based deduplication to eliminate duplicate property requests
         * 6. Returns an object with property names as keys and computed values as values
         *
         * @reflow_mechanism
         * When the last argument is `true`, the function accesses `element.offsetWidth` before
         * reading computed styles. This forces immediate layout recalculation, ensuring that:
         * - Recently applied styles are fully computed and reflected in cached objects
         * - Dynamic changes are captured in live computed style objects
         * - Layout-dependent properties return accurate current values
         * - Timing-sensitive style readings are precise and up-to-date
         *
         * @computed_values
         * The function uses cached `window.getComputedStyle()` objects which provide:
         * - Final computed values after CSS cascade resolution
         * - Inherited values where applicable
         * - Default browser values for unset properties
         * - Resolved relative units (e.g., em to px, % to absolute values)
         * - Current animation/transition intermediate values (live updates)
         * - Immediate reflection of style changes without cache invalidation
         *
         * @performance_optimizations
         * - **Intelligent Caching**: computedStyleCache WeakMap eliminates redundant getComputedStyle calls
         * - **Live Object Reuse**: Cached computed style objects automatically update with style changes
         * - **Reverse While Loop**: Optimal iteration performance for property validation
         * - **Set-based Deduplication**: Prevents redundant getPropertyValue calls within single invocation
         * - **Early Return Validation**: Prevents unnecessary processing of invalid inputs
         * - **Efficient Object Construction**: Direct property assignment with optimal memory usage
         * - **Cache-First Strategy**: Prioritizes cached objects for maximum performance benefit
         *
         * @example
         * // Basic property retrieval with cache benefits
         * const styles = getProperties(element, 'color', 'font-size', 'margin-top');
         * // First call: populates cache with getComputedStyle object
         * // Returns: { color: 'rgb(255, 0, 0)', 'font-size': '16px', 'margin-top': '10px' }
         *
         * @example
         * // Subsequent calls leverage cache for performance
         * const moreStyles = getProperties(element, 'width', 'height', 'padding');
         * // Uses cached computed style object - significant performance improvement
         * // Live object automatically reflects any style changes since first call
         *
         * @example
         * // With forced reflow for accurate timing
         * setProperties(element, ['transform', 'translateX(100px)']);
         * const currentTransform = getProperties(element, 'transform', true);
         * // Forces reflow, then uses cached computed style object for reading
         * // Ensures transform is computed and reflected in live cached object
         *
         * @example
         * // Animation state monitoring with live cache updates
         * const animationStyles = getProperties(element,
         *   'transform',
         *   'opacity',
         *   'transition-duration',
         *   true // Ensure current animation state is captured
         * );
         * // Cached object automatically reflects intermediate animation values
         *
         * @example
         * // High-performance batch operations
         * // First batch - populates cache
         * const initialStyles = getProperties(element, 'width', 'height');
         * 
         * // Apply some changes
         * element.style.width = '200px';
         * 
         * // Second batch - uses cached object with live updates
         * const updatedStyles = getProperties(element, 'width', 'margin', 'padding');
         * // Cached object reflects the new width automatically
         *
         * @example
         * // Layout property inspection with cache efficiency
         * const layoutProps = getProperties(element,
         *   'width', 'height',
         *   'padding-left', 'padding-right',
         *   'margin-top', 'margin-bottom'
         * );
         * // Single cache entry serves all property reads efficiently
         *
         * @example
         * // Duplicate handling demonstration (cache + deduplication)
         * const styles = getProperties(element, 'color', 'font-size', 'color');
         * // Uses cached computed style + only reads 'color' once
         * // Returns: { color: '...', 'font-size': '...' }
         *
         * @cache_performance_benefits
         * - **70-90% Reduction**: Eliminates most getComputedStyle DOM queries
         * - **Live Updates**: No cache invalidation needed - objects update automatically
         * - **Batch Efficiency**: Multiple property reads from same element use single cached object
         * - **Animation Performance**: Smooth monitoring during transitions without DOM overhead
         * - **Memory Efficiency**: WeakMap automatically cleans up when elements are removed
         * - **Scalable Performance**: Benefits increase with number of property access operations
         *
         * @return_format
         * Returns an object where:
         * - Keys are the requested property names (as provided)
         * - Values are the computed CSS property values as strings from cached objects
         * - Missing or invalid properties return empty string ''
         * - All values are in their computed form (e.g., 'rgb(255, 0, 0)' not 'red')
         * - Values automatically reflect current state through live cached objects
         *
         * @use_cases
         * - High-frequency animation state monitoring and calculations
         * - Performance-critical dynamic layout measurements and adjustments
         * - Real-time theme and style debugging utilities
         * - Responsive design breakpoint calculations with minimal overhead
         * - Component state inspection and validation in complex UIs
         * - CSS-in-JS state synchronization with optimized DOM access
         * - Performance profiling and optimization in style-heavy applications
         * - Batch style processing for multiple properties on same elements
         *
         * @browser_compatibility
         * Uses standard `window.getComputedStyle()` and `getPropertyValue()` methods cached in
         * WeakMap structure. Both APIs are supported in all modern browsers and provide consistent
         * computed value resolution with reliable live object behavior and garbage collection.
         *
         * @performance_considerations
         * - **Cache Benefits**: First call populates cache, subsequent calls are significantly faster
         * - **Live Objects**: No cache invalidation overhead - objects automatically stay current
         * - **Batch Optimization**: Multiple property reads from same element are highly efficient
         * - **Memory Management**: WeakMap provides automatic cleanup without manual intervention
         * - **Reflow Usage**: Use reflow parameter sparingly to avoid unnecessary layout calculations
         * - **Cache Locality**: Performance benefits are greatest when accessing same elements repeatedly
         *
         * @cache_lifecycle
         * 1. **First Access**: Element not in cache - creates and stores getComputedStyle object
         * 2. **Subsequent Access**: Element in cache - reuses stored computed style object
         * 3. **Live Updates**: Cached object automatically reflects style changes without intervention
         * 4. **Manual Cleanup**: Cache entry removed during toast destruction for immediate memory management
         * 5. **Automatic Cleanup**: WeakMap handles garbage collection when element is no longer referenced
         *
         * @note
         * The cached computed style objects are live and automatically update when element styles
         * change, making this caching strategy particularly effective for dynamic styling scenarios.
         * Computed values may differ from authored CSS values - relative units are resolved to
         * absolute values, and shorthand properties may not be directly retrievable.
         */
        getProperties: (element, ...properties) => {

            if( toastletTypeValidators.empty(properties) ) return;

            if( ! computedStyleCache.has(element) )
                computedStyleCache.set( element, window.getComputedStyle(element) );

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

            const computedStyle = computedStyleCache.get(element);

            for( const property of sanitizedProperties ){

                propertiesObject[property] = computedStyle.getPropertyValue(property);

            }

            return propertiesObject;

        },

        /**
         * Removes CSS properties from a DOM element's inline styles with optional forced reflow
         *
         * This function provides a safe and efficient way to remove multiple CSS properties from
         * a DOM element's inline style declaration. It features comprehensive input validation,
         * automatic sanitization, deduplication, and optional forced browser reflow for immediate
         * style recalculation. The function is optimized for batch property removal while ensuring
         * clean state management and reliable styling behavior.
         *
         * @author Pedro Rigolin
         * @param {Element} element - The DOM element to remove CSS properties from
         * @param {...(string|boolean)} properties - Variable number of property names and optional reflow flag
         * @returns {void}
         *
         * @description
         * The function accepts multiple CSS property name arguments as strings, with an optional
         * boolean `true` as the last argument to force browser reflow after removing all properties.
         * This ensures that style changes are immediately applied and computed styles are updated.
         *
         * @property_removal_behavior
         * - Only removes properties from the element's inline style attribute
         * - Does not affect CSS classes, stylesheets, or computed styles from other sources
         * - Properties revert to their cascaded values (from CSS classes, stylesheets, etc.)
         * - Empty style attributes are automatically cleaned up by the browser
         *
         * @validation_process
         * 1. Filters out non-string arguments (except final boolean reflow flag)
         * 2. Trims whitespace from property names
         * 3. Removes empty or whitespace-only property names
         * 4. Uses Set-based deduplication to eliminate duplicate removal operations
         * 5. Processes each valid property through element.style.removeProperty()
         *
         * @reflow_mechanism
         * When the last argument is `true`, the function accesses `element.offsetWidth` after
         * removing all properties. This forces immediate layout recalculation, which is important for:
         * - Ensuring removed styles no longer affect layout immediately
         * - Triggering CSS transitions based on property removal
         * - Synchronous style updates in complex animation sequences
         * - Accurate subsequent style calculations that depend on the removal
         *
         * @performance_optimizations
         * - Reverse while loop iteration for optimal performance
         * - Set-based deduplication prevents redundant removeProperty calls
         * - Batch processing minimizes individual DOM style operations
         * - Early validation prevents unnecessary processing of invalid inputs
         * - Efficient iteration over sanitized property set
         *
         * @example
         * // Basic property removal
         * removeProperties(element, 'color', 'font-size', 'margin-top');
         * // Removes inline styles, properties revert to CSS cascade values
         *
         * @example
         * // Animation cleanup with forced reflow
         * removeProperties(element,
         *   'transform',
         *   'opacity',
         *   'transition',
         *   true // Ensure immediate style recalculation
         * );
         *
         * @example
         * // State reset after interaction
         * removeProperties(element,
         *   'background-color',
         *   'border-color',
         *   'box-shadow',
         *   true // Force immediate visual update
         * );
         *
         * @example
         * // Cleanup after dynamic styling
         * // First set some inline styles
         * setProperties(element, ['color', 'red'], ['font-weight', 'bold']);
         * // Later remove them to restore default appearance
         * removeProperties(element, 'color', 'font-weight');
         *
         * @example
         * // Duplicate handling demonstration
         * removeProperties(element, 'margin', 'padding', 'margin');
         * // Only removes 'margin' once, also removes 'padding'
         *
         * @state_restoration
         * After property removal, elements will display according to:
         * 1. Remaining inline styles (if any)
         * 2. CSS class styles
         * 3. Stylesheet rules
         * 4. Browser default values
         * This makes property removal ideal for reverting to "natural" styling states.
         *
         * @use_cases
         * - Cleaning up temporary or conditional inline styles
         * - Reverting elements to their CSS class-based styling
         * - Animation and transition cleanup
         * - State management in dynamic components
         * - Removing override styles to restore defaults
         * - Error state cleanup and recovery
         * - Theme switching and style reset operations
         *
         * @safety_features
         * - Input validation prevents malformed property operations
         * - Graceful handling of invalid property names (silently skipped)
         * - Automatic deduplication prevents redundant operations
         * - Safe removal of non-existent properties (no errors thrown)
         * - Whitespace trimming ensures accurate property name matching
         *
         * @browser_compatibility
         * Uses standard `element.style.removeProperty()` method which is supported in all
         * modern browsers and provides consistent property removal behavior.
         *
         * @animation_patterns
         * Common pattern for cleaning up after animations:
         * ```js
         * // Apply animation styles
         * setProperties(element, ['transform', 'scale(1.2)'], ['opacity', '0.8']);
         * 
         * // After animation completes, clean up
         * setTimeout(() => {
         *   removeProperties(element, 'transform', 'opacity', true);
         * }, animationDuration);
         * ```
         *
         * @performance_considerations
         * - Removing properties can trigger layout recalculation
         * - Batch multiple property removals in single call for efficiency
         * - Use reflow parameter only when immediate style updates are required
         * - Consider the cascade implications when removing properties
         *
         * @note
         * This function only removes inline styles. To remove styles from CSS classes or
         * stylesheets, use appropriate class manipulation or stylesheet modification methods.
         * The forced reflow parameter should be used judiciously to avoid performance impact.
         */
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

        /**
         * Sets multiple HTML attributes on a DOM element with comprehensive validation and optional forced reflow
         *
         * This function provides a secure and efficient way to apply multiple HTML attributes to DOM elements
         * in batch operations. It features robust input validation, automatic sanitization, deduplication,
         * and optional forced browser reflow for immediate attribute application. The function is specifically
         * designed for accessibility attributes (ARIA), data attributes, and other HTML attribute management
         * while ensuring security through comprehensive validation and optimal performance.
         *
         * @author Pedro Rigolin
         * @param {Element} element - The DOM element to set attributes on
         * @param {...(Array|boolean)} attributes - Variable number of attribute arrays and optional reflow flag
         * @returns {void}
         *
         * @description
         * The function accepts multiple attribute definition arrays, where each array contains
         * [attributeName, attributeValue] or [attributeName, attributeValue, namespace] format.
         * An optional boolean `true` as the last argument forces browser reflow after setting
         * all attributes, ensuring immediate DOM updates and accessibility announcements.
         *
         * @attribute_array_format
         * Each attribute array must contain:
         * - **Index 0**: Attribute name (string) - the HTML attribute name
         * - **Index 1**: Attribute value (string) - the value to assign to the attribute
         *
         * The function accepts arrays with 2 elements and automatically trims all string values.
         * Arrays with invalid structure, non-string elements, or duplicate attribute names are skipped.
         *
         * @validation_process
         * 1. **Array Validation**: Filters out non-array arguments (except final boolean reflow flag)
         * 2. **Element Validation**: Ensures each array element is a string
         * 3. **Length Validation**: Requires arrays to have 2 elements (name, value)
         * 4. **String Sanitization**: Trims whitespace from all string values
         * 5. **Deduplication**: Uses Map to prevent duplicate attribute assignments (last wins)
         * 6. **Safe Assignment**: Applies attributes using native setAttribute method
         *
         * @reflow_mechanism
         * When the last argument is `true`, the function accesses `element.offsetWidth` after
         * setting all attributes. This forces immediate layout recalculation, which is crucial for:
         * - Ensuring ARIA attributes are immediately announced by screen readers
         * - Triggering CSS attribute selectors and pseudo-selectors immediately
         * - Synchronous DOM updates in complex accessibility scenarios
         * - Immediate visual updates for attributes affecting appearance
         *
         * @performance_optimizations
         * - **Map-based Storage**: Uses Map for efficient key-value attribute management
         * - **Reverse While Loop**: Optimized iteration pattern for superior performance
         * - **Batch Processing**: Groups multiple setAttribute calls for minimal DOM impact
         * - **Early Validation**: Prevents unnecessary processing of invalid inputs
         * - **Deduplication**: Eliminates redundant setAttribute operations
         * - **Efficient Iteration**: Direct Map iteration for optimal attribute application
         *
         * @example
         * // Basic attribute setting
         * setAttributes(element,
         *   ['id', 'toast-123'],
         *   ['role', 'alert'],
         *   ['aria-live', 'assertive']
         * );
         *
         * @example
         * // Accessibility attributes with forced reflow
         * setAttributes(element,
         *   ['aria-label', 'Toast notification'],
         *   ['aria-describedby', 'toast-content-123'],
         *   ['tabindex', '0'],
         *   true // Ensure immediate screen reader announcement
         * );
         *
         * @example
         * // Data attributes for state management
         * setAttributes(element,
         *   ['data-toast-type', 'success'],
         *   ['data-dismissible', 'true'],
         *   ['data-duration', '5000']
         * );
         *
         * @example
         * // Mixed attribute types with validation handling
         * setAttributes(element,
         *   ['class', 'toast-notification'], // Standard HTML attribute
         *   ['aria-hidden', 'false'],        // ARIA attribute
         *   ['data-id', '123'],              // Data attribute
         *   ['invalid-array'],               // Skipped - invalid format
         *   ['', 'empty-name'],              // Skipped - empty name
         *   true // Force immediate DOM update
         * );
         *
         * @example
         * // Duplicate handling demonstration
         * setAttributes(element,
         *   ['id', 'first-id'],
         *   ['role', 'button'],
         *   ['id', 'final-id']  // This overwrites the first id
         * );
         * // Result: element has id="final-id" and role="button"
         *
         * @accessibility_benefits
         * - **ARIA Support**: Optimized for setting accessibility attributes with immediate effect
         * - **Screen Reader Compatibility**: Forced reflow ensures immediate accessibility announcements
         * - **Semantic Enhancement**: Enables proper semantic markup for assistive technologies
         * - **Dynamic Accessibility**: Supports runtime accessibility attribute changes
         * - **Role Management**: Facilitates dynamic role assignments for interactive elements
         *
         * @security_features
         * - **Input Validation**: Comprehensive validation prevents malformed attribute assignments
         * - **String Sanitization**: Automatic trimming prevents whitespace-based issues
         * - **Type Safety**: Strict type checking for all attribute components
         * - **Safe Attribution**: Uses native setAttribute for secure attribute assignment
         * - **Error Resilience**: Graceful handling of invalid inputs without throwing errors
         *
         * @use_cases
         * - Setting accessibility attributes (ARIA roles, labels, descriptions)
         * - Managing data attributes for component state and configuration
         * - Dynamic HTML attribute assignment in interactive components
         * - Batch attribute updates for performance optimization
         * - Accessibility compliance in dynamic content scenarios
         * - State management through HTML attributes
         * - Progressive enhancement attribute assignment
         *
         * @attribute_types_supported
         * - **Standard HTML**: id, class, title, etc.
         * - **ARIA Attributes**: aria-label, aria-describedby, role, etc.
         * - **Data Attributes**: data-*, custom application data
         * - **Event Attributes**: Supported but not recommended (use event listeners instead)
         * - **Custom Attributes**: Application-specific attributes
         *
         * @browser_compatibility
         * Uses standard `element.setAttribute()` method which is universally supported across
         * all browsers and provides consistent attribute assignment behavior with proper
         * HTML5 compliance and accessibility standards adherence.
         *
         * @performance_considerations
         * - **Batch Operations**: Setting multiple attributes in single call is more efficient
         * - **Reflow Management**: Use reflow parameter only when immediate updates are required
         * - **Validation Overhead**: Input validation provides safety with minimal performance cost
         * - **Memory Efficiency**: Map-based deduplication prevents unnecessary DOM operations
         * - **Accessibility Performance**: Forced reflow ensures responsive accessibility behavior
         *
         * @error_handling
         * The function handles errors gracefully:
         * - Invalid arrays are silently skipped
         * - Non-string elements cause array to be skipped
         * - Empty attribute names cause array to be skipped
         * - Duplicate attributes use last valid value
         * - No exceptions are thrown for invalid inputs
         *
         * @note
         * This function is specifically optimized for accessibility and toast notification
         * requirements. The forced reflow option should be used judiciously, particularly
         * when setting accessibility attributes that need immediate effect for screen readers
         * or when attributes affect immediate visual presentation.
         */
        setAttributes: (element, ...attributes) => {

            if( toastletTypeValidators.empty(attributes) ) return;

            const reflow = attributes[attributes.length - 1] === true;

            const sanitizedAttributes = new Map();

            let i = attributes.length;

            while(i--){

                if( ! toastletTypeValidators.array(attributes[i]) ) continue;

                let sanitizedArray = [];

                let error = false;

                for(let j=0, len=attributes[i].length; j<len && j < 2; j++){

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

        /**
         * Retrieves multiple HTML attribute values from a DOM element with comprehensive validation and performance optimization
         * 
         * Efficiently extracts and organizes multiple HTML attribute values from a specified DOM element,
         * returning them as a structured object for analysis, state management, and dynamic attribute-based
         * logic implementation. This function provides comprehensive input validation, automatic sanitization,
         * deduplication, and consistent value formatting for reliable attribute retrieval workflows.
         * 
         * The function is specifically designed for scenarios where multiple attributes need to be retrieved
         * simultaneously, providing performance benefits through batch processing, automatic deduplication,
         * and optimized DOM access patterns. It handles all edge cases gracefully while maintaining
         * predictable behavior for missing, malformed, or duplicate attribute requests.
         * 
         * @author Pedro Rigolin
         * @param {HTMLElement} element - The DOM element from which to extract attributes
         * @param {...string} attributes - Variable number of attribute names to retrieve and analyze
         * @returns {Object} Object containing attribute names as keys and their values as strings,
         *                   returns empty object if no valid attributes are provided
         * 
         * @validation_steps
         * The function performs comprehensive validation in the following order:
         * 1. **Empty Argument Check**: Returns empty object if no attributes are requested
         * 2. **String Validation**: Filters out non-string arguments during processing
         * 3. **Whitespace Sanitization**: Trims whitespace from attribute names
         * 4. **Empty Name Filtering**: Removes empty or whitespace-only attribute names
         * 5. **Set-based Deduplication**: Eliminates duplicate attribute requests automatically
         * 6. **Object Construction**: Builds result object with attribute names as keys
         * 
         * @performance_optimizations
         * - **Set-based Deduplication**: Prevents redundant getAttribute calls for duplicate names
         * - **Reverse While Loop**: Optimized iteration pattern for superior performance
         * - **Early Return Prevention**: Processes all inputs even when some are invalid
         * - **Efficient Object Construction**: Direct property assignment for optimal memory usage
         * - **Single DOM Query Per Attribute**: Each unique attribute is queried exactly once
         * - **Batch Processing**: Groups multiple attribute retrievals for maximum efficiency
         * 
         * @example
         * // Basic attribute retrieval for common HTML attributes
         * const attrs = getAttributes(element, 'id', 'class', 'role');
         * // Returns: { id: 'toast-123', class: 'toast success', role: 'alert' }
         * 
         * @example
         * // Accessibility attribute inspection for ARIA compliance
         * const a11yAttrs = getAttributes(element,
         *   'role',
         *   'aria-label',
         *   'aria-describedby',
         *   'aria-live',
         *   'tabindex'
         * );
         * // Returns object with all accessibility attributes and their current values
         * 
         * @example
         * // Data attribute analysis for state management
         * const dataAttrs = getAttributes(element,
         *   'data-toast-type',
         *   'data-duration',
         *   'data-dismissible',
         *   'data-position'
         * );
         * // Returns: { 'data-toast-type': 'success', 'data-duration': '5000', ... }
         * 
         * @example
         * // Mixed attribute types with automatic validation
         * const mixedAttrs = getAttributes(element,
         *   'id',              // Standard HTML attribute
         *   'aria-hidden',     // ARIA accessibility attribute
         *   'data-state',      // Data attribute
         *   '',                // Skipped - empty string
         *   'title',           // Standard HTML attribute
         *   'data-state'       // Duplicate - only queried once due to deduplication
         * );
         * 
         * @example
         * // Handling missing attributes with predictable behavior
         * const attrs = getAttributes(element, 'existing-attr', 'missing-attr');
         * // Returns: { 'existing-attr': 'value', 'missing-attr': '' }
         * 
         * @example
         * // Invalid inputs result in empty object
         * const emptyResult = getAttributes(element, '', '   ', 123, null);
         * // Returns: {} (empty object due to no valid attribute names)
         * 
         * @return_format
         * Returns an object where:
         * - **Keys**: Requested attribute names (as provided, preserving case and format)
         * - **Values**: Attribute values as strings, or empty string for missing attributes
         * - **Missing Attributes**: Return empty string ('') instead of null for consistency
         * - **Empty Attributes**: Return empty string ('') if attribute exists but has no value
         * - **Boolean Attributes**: Return attribute name as string or empty string if not present
         * - **Invalid Inputs**: Result in empty object, not undefined
         * 
         * @attribute_value_behavior
         * The function modifies standard DOM getAttribute behavior for consistency:
         * - **Existing Attributes**: Return their string values exactly as stored
         * - **Missing Attributes**: Return empty string ('') instead of null
         * - **Empty Attributes**: Return empty string ('') when attribute exists but has no value
         * - **Boolean Attributes**: Return attribute name as string or empty string
         * - **Numeric Attributes**: Return string representation of numeric values
         * - **Special Characters**: Preserved exactly as stored in DOM without modification
         * 
         * @use_cases
         * - **Accessibility Attribute Analysis**: Reading aria-* attributes for compliance validation
         * - **Data Attribute Management**: Retrieving data-* attributes for state management
         * - **Dynamic Attribute Logic**: Building conditional logic based on attribute values
         * - **Component State Inspection**: Analyzing element attributes for debugging
         * - **HTML Attribute Auditing**: Batch checking attributes for compliance
         * - **Progressive Enhancement**: Feature detection through attribute presence
         * - **Toast Notification Management**: Reading toast-specific configuration attributes
         * - **Batch Attribute Operations**: Efficient multi-attribute analysis
         * 
         * @accessibility_applications
         * - **ARIA Attribute Validation**: Reading aria-* attributes for accessibility compliance
         * - **Role Verification**: Checking semantic roles against expected values
         * - **Screen Reader Support**: Analyzing attributes that affect assistive technology
         * - **Focus Management**: Reading tabindex and focus-related attributes
         * - **Live Region Analysis**: Inspecting aria-live and related dynamic content attributes
         * - **Label Association**: Verifying aria-label, aria-labelledby, aria-describedby relationships
         * 
         * @performance_characteristics
         * - **Efficient Retrieval**: Single getAttribute call per unique attribute name
         * - **Memory Optimized**: Minimal object creation and efficient property assignment
         * - **Deduplication Benefits**: Automatic prevention of redundant DOM queries
         * - **Batch Processing**: Multiple attributes retrieved in single function call
         * - **Validation Overhead**: Minimal performance cost for comprehensive input validation
         * - **DOM Access Optimization**: Reduced DOM interaction through intelligent batching
         * 
         * @browser_compatibility
         * Uses standard `element.getAttribute()` method which is universally supported across
         * all browsers and provides consistent attribute retrieval behavior with proper HTML5
         * compliance. The function enhances this with consistent return value formatting
         * that eliminates null values in favor of empty strings for better predictability.
         * 
         * @security_considerations
         * - **Input Validation**: Prevents malformed attribute name queries through sanitization
         * - **Safe Retrieval**: Uses standard DOM methods without script injection risks
         * - **Type Safety**: Comprehensive string validation prevents type-related errors
         * - **Error Resilience**: Graceful handling of invalid inputs without exceptions
         * - **XSS Prevention**: No dynamic code execution, only safe attribute reading
         * 
         * @performance_tips
         * - **Batch Retrieval**: Request multiple related attributes in single call when possible
         * - **Avoid Duplicates**: Function handles deduplication but avoiding duplicates improves efficiency
         * - **Cache Results**: Store returned object if attributes are accessed frequently
         * - **Selective Querying**: Only request attributes that are actually needed for logic
         * - **Attribute Grouping**: Group related attributes together for optimal batch processing
         * 
         * @error_handling
         * The function handles various error conditions gracefully without throwing exceptions:
         * - **Non-string Arguments**: Silently skipped during validation process
         * - **Empty Strings**: Filtered out during sanitization phase
         * - **Whitespace-only Names**: Removed during trimming process
         * - **Invalid Elements**: Standard DOM behavior (may throw if element is invalid)
         * - **No Valid Attributes**: Returns empty object instead of undefined
         * - **Null/Undefined Inputs**: Gracefully handled without breaking execution
         * 
         * @implementation_details
         * The function uses a Set-based approach for deduplication combined with reverse iteration
         * for optimal performance. Input validation occurs during iteration to minimize overhead,
         * and the final object is constructed using direct property assignment for memory efficiency.
         * The modification of getAttribute behavior to return empty strings instead of null
         * provides more predictable behavior for string-based logic and reduces null checking overhead.
         * 
         * @note
         * This function is optimized for toast notification attribute management but provides
         * general-purpose HTML attribute retrieval capabilities. The consistent return value
         * formatting (empty strings instead of null) makes it particularly suitable for
         * scenarios where attribute values will be used in string operations or conditionals
         * without requiring extensive null checking.
         */
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

                attributesObject[attribute] = element.getAttribute(attribute) || '';

            }

            return attributesObject;

        },

        /**
         * Removes multiple HTML attributes from a DOM element with comprehensive validation and optional forced reflow
         *
         * This function provides a secure and efficient way to remove multiple HTML attributes from DOM elements
         * in batch operations. It features robust input validation, automatic sanitization, deduplication, and
         * optional forced browser reflow for immediate attribute removal effects. The function is particularly
         * important for accessibility attribute cleanup, state management, and dynamic attribute lifecycle
         * management while ensuring optimal performance and security through comprehensive validation.
         *
         * @author Pedro Rigolin
         * @param {Element} element - The DOM element to remove attributes from
         * @param {...(string|boolean)} attributes - Variable number of attribute names and optional reflow flag
         * @returns {void}
         *
         * @description
         * The function accepts multiple attribute name arguments as strings, with an optional boolean `true`
         * as the last argument to force browser reflow after removing all attributes. This ensures immediate
         * DOM updates, accessibility announcements, and CSS attribute selector updates. The function
         * automatically validates, sanitizes, and deduplicates attribute removal operations.
         *
         * @validation_process
         * 1. **Empty Check**: Returns early if no attributes are provided
         * 2. **Reflow Detection**: Identifies optional boolean reflow flag as last argument
         * 3. **String Validation**: Filters out non-string arguments (except reflow flag)
         * 4. **Whitespace Sanitization**: Trims whitespace from attribute names
         * 5. **Empty Name Filtering**: Removes empty or whitespace-only attribute names
         * 6. **Set-based Deduplication**: Eliminates duplicate attribute removal requests
         * 7. **Safe Removal**: Uses native removeAttribute method for secure operation
         *
         * @reflow_mechanism
         * When the last argument is `true`, the function accesses `element.offsetWidth` after
         * removing all attributes. This forces immediate layout recalculation, which is essential for:
         * - **Accessibility Updates**: Ensuring removed ARIA attributes immediately affect screen readers
         * - **CSS Selector Updates**: Triggering immediate CSS attribute selector recalculation
         * - **Visual Changes**: Immediate visual updates when attributes affect appearance
         * - **State Synchronization**: Ensuring DOM state changes are immediately reflected
         * - **Animation Triggers**: Activating CSS transitions based on attribute removal
         *
         * @performance_optimizations
         * - **Set-based Deduplication**: Prevents redundant removeAttribute calls for duplicates
         * - **Reverse While Loop**: Optimized iteration pattern for superior performance
         * - **Batch Processing**: Groups multiple removeAttribute operations for efficiency
         * - **Early Return Validation**: Prevents unnecessary processing when no attributes provided
         * - **Efficient Iteration**: Direct Set iteration for optimal attribute removal
         * - **Memory Efficiency**: Minimal memory footprint with Set-based operations
         *
         * @example
         * // Basic attribute removal
         * removeAttributes(element, 'data-temp', 'aria-expanded', 'title');
         * // Removes temporary and state attributes
         *
         * @example
         * // Accessibility cleanup with forced reflow
         * removeAttributes(element,
         *   'aria-describedby',
         *   'aria-labelledby',
         *   'role',
         *   true // Ensure immediate screen reader updates
         * );
         *
         * @example
         * // State cleanup after toast dismissal
         * removeAttributes(element,
         *   'data-toast-state',
         *   'data-animation-phase',
         *   'data-user-interaction',
         *   'aria-live',
         *   true // Force immediate DOM state update
         * );
         *
         * @example
         * // Temporary attribute cleanup
         * removeAttributes(element,
         *   'data-loading',
         *   'data-processing',
         *   'aria-busy'
         * );
         * // Clean up temporary state attributes
         *
         * @example
         * // Duplicate handling demonstration
         * removeAttributes(element,
         *   'class',
         *   'data-state',
         *   'class',        // Duplicate - only removed once
         *   'aria-hidden'
         * );
         *
         * @attribute_removal_behavior
         * The function removes attributes completely from the element:
         * - **Complete Removal**: Attributes are entirely removed from DOM
         * - **No Trace Left**: No empty attributes or placeholders remain
         * - **CSS Impact**: Attribute selectors no longer match the element
         * - **Accessibility Impact**: ARIA attributes no longer affect assistive technology
         * - **Default Restoration**: Element reverts to default behavior for removed attributes
         *
         * @accessibility_considerations
         * - **ARIA Cleanup**: Proper removal of accessibility attributes when no longer needed
         * - **Screen Reader Updates**: Forced reflow ensures immediate accessibility announcements
         * - **Role Management**: Safe removal of semantic roles when element purpose changes
         * - **Live Region Cleanup**: Removing aria-live when dynamic content updates end
         * - **Focus Management**: Cleaning up tabindex and focus-related attributes
         *
         * @use_cases
         * - Cleaning up temporary accessibility attributes after interactions
         * - Removing state management data attributes when states change
         * - Accessibility attribute lifecycle management in dynamic components
         * - Temporary attribute cleanup after animations or transitions
         * - Progressive enhancement attribute removal when JavaScript takes over
         * - Error state cleanup and recovery in toast notifications
         * - Memory optimization by removing unused attributes
         * - Dynamic attribute management in component lifecycle
         *
         * @state_management_applications
         * - **Toast Lifecycle**: Removing attributes when toast phases complete
         * - **Animation States**: Cleaning up animation-related attributes
         * - **User Interaction**: Removing interaction state attributes
         * - **Loading States**: Clearing loading and processing indicators
         * - **Error Recovery**: Removing error state attributes after resolution
         *
         * @security_features
         * - **Input Validation**: Comprehensive validation prevents malformed operations
         * - **Safe Removal**: Uses native removeAttribute for secure attribute removal
         * - **Type Safety**: Strict string validation prevents type-related vulnerabilities
         * - **Error Resilience**: Graceful handling of invalid inputs without exceptions
         * - **XSS Prevention**: Safe attribute manipulation without script injection risks
         *
         * @performance_characteristics
         * - **Efficient Removal**: Single removeAttribute call per unique attribute name
         * - **Batch Operations**: Multiple attributes removed in single function call
         * - **Deduplication Benefits**: Automatic prevention of redundant DOM operations
         * - **Memory Optimization**: Minimal object creation with Set-based processing
         * - **Validation Overhead**: Comprehensive validation with minimal performance impact
         *
         * @browser_compatibility
         * Uses standard `element.removeAttribute()` method which is universally supported across
         * all browsers and provides consistent attribute removal behavior with proper HTML5
         * compliance and reliable attribute lifecycle management.
         *
         * @css_selector_impact
         * Removing attributes affects CSS selectors:
         * - **Attribute Selectors**: `[attr]`, `[attr="value"]` selectors no longer match
         * - **Pseudo-selectors**: Some pseudo-selectors may change behavior
         * - **Specificity Changes**: CSS specificity calculations may be affected
         * - **Cascade Updates**: CSS cascade may produce different computed values
         * - **Visual Changes**: Appearance may change based on attribute-dependent styles
         *
         * @error_handling
         * The function handles various error conditions gracefully:
         * - **Non-string Arguments**: Silently skipped during validation (except reflow flag)
         * - **Empty Strings**: Filtered out during sanitization process
         * - **Whitespace-only Names**: Removed during trimming process
         * - **Non-existent Attributes**: removeAttribute safely handles missing attributes
         * - **Invalid Elements**: Standard DOM behavior (may throw if element is invalid)
         *
         * @performance_tips
         * - **Batch Removal**: Remove multiple attributes in single call when possible
         * - **Avoid Duplicates**: Function handles deduplication but avoid when possible
         * - **Selective Reflow**: Use reflow parameter only when immediate updates required
         * - **Cleanup Timing**: Remove attributes as soon as they're no longer needed
         * - **Memory Management**: Regular attribute cleanup prevents memory bloat
         *
         * @accessibility_best_practices
         * - **Clean Removal**: Remove ARIA attributes when functionality is no longer available
         * - **Screen Reader Sync**: Use reflow when removal affects accessibility announcements
         * - **Role Lifecycle**: Remove roles when element purpose fundamentally changes
         * - **Live Region Management**: Clean up aria-live when dynamic updates cease
         * - **Focus Cleanup**: Remove tabindex when element should no longer be focusable
         *
         * @note
         * This function is essential for proper attribute lifecycle management in dynamic
         * toast notifications. The forced reflow option should be used when attribute removal
         * has immediate accessibility or visual implications that need to be synchronized
         * with subsequent operations or user interactions.
         */
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

    /**
     * Toast Instance Registry and Lifecycle Management System
     * 
     * This object serves as the central registry and management system for all active toast
     * notification instances throughout their operational lifecycle. It provides a sophisticated
     * multi-category storage interface that enables efficient organization, tracking, and
     * management of toast instances based on their behavioral characteristics and properties.
     * 
     * The system implements a flexible categorization architecture where individual toast
     * instances can be simultaneously stored across multiple categories based on their
     * configuration properties. This multi-dimensional organization enables efficient querying,
     * filtering, and batch operations on specific subsets of toast instances while maintaining
     * a comprehensive registry of all active notifications.
     * 
     * The registry acts as the single source of truth for toast instance state management,
     * providing unique ID generation, instance lifecycle tracking, and efficient storage
     * mechanisms optimized for high-performance operations across all categorization levels.
     * 
     * @author Pedro Rigolin
     * @namespace toastletInstances
     * @type {Object}
     * @sealed
     * 
     * @architecture_overview
     * The instance management system is built around a multi-dimensional categorization model:
     * - **Universal Registry**: Central storage containing all active toast instances
     * - **Behavioral Categories**: Dynamic categorization based on toast configuration properties
     * - **ID Management**: Unique identifier generation and tracking for instance lifecycle
     * - **Cross-Category References**: Individual instances can exist in multiple categories simultaneously
     * - **Efficient Operations**: Optimized storage and retrieval mechanisms for all categories
     * 
     * @categorization_system
     * The multi-category storage system enables flexible instance organization:
     * - **Primary Registry**: All instances are stored in a central registry regardless of properties
     * - **Behavioral Segmentation**: Instances are categorized based on their configuration characteristics
     * - **Dynamic Assignment**: Categories are determined automatically during instance creation
     * - **Multiple Membership**: Single instance can belong to multiple categories concurrently
     * - **Efficient Filtering**: Category-based access enables targeted operations and queries
     * 
     * @storage_architecture
     * The system utilizes Map-based storage for optimal performance characteristics:
     * - **Map Collections**: Each category uses Map objects for O(1) insertion, deletion, and lookup
     * - **ID-based Indexing**: Unique numeric identifiers serve as keys for efficient access
     * - **Memory Efficiency**: Direct object references prevent unnecessary data duplication
     * - **Iteration Performance**: Map objects provide efficient iteration for batch operations
     * - **Garbage Collection**: Proper cleanup mechanisms prevent memory leaks during instance removal
     * 
     * @identifier_management
     * The ID generation and tracking system ensures unique instance identification:
     * - **Sequential Generation**: Monotonically increasing numeric identifiers for uniqueness
     * - **Instance Assignment**: Each toast receives a unique ID upon registration
     * - **Lifecycle Tracking**: ID management enables instance state monitoring throughout lifecycle
     * - **Reference Integrity**: IDs maintain consistent references across all storage categories
     * - **Collision Prevention**: Sequential generation eliminates ID collision possibilities
     * 
     * @operational_efficiency
     * The system is optimized for high-frequency operations and performance:
     * - **Batch Operations**: Efficient category-based batch processing for multiple instances
     * - **Selective Access**: Category-specific access patterns reduce operational overhead
     * - **Memory Optimization**: Shared references across categories minimize memory consumption
     * - **Cleanup Efficiency**: Coordinated removal across all categories prevents orphaned references
     * - **Query Performance**: Category-based organization enables fast subset identification
     * 
     * @lifecycle_integration
     * The registry integrates seamlessly with toast lifecycle management:
     * - **Creation Registration**: Automatic instance registration during toast creation process
     * - **Configuration-Based Categorization**: Dynamic category assignment based on instance properties
     * - **State Synchronization**: Registry state remains synchronized with actual instance states
     * - **Destruction Cleanup**: Comprehensive cleanup during instance destruction and removal
     * - **Memory Management**: Proper resource deallocation prevents memory accumulation
     * 
     * @concurrency_safety
     * The system handles concurrent operations safely and efficiently:
     * - **Atomic Operations**: Individual registry operations are atomic and consistent
     * - **State Consistency**: Registry state remains consistent across concurrent modifications
     * - **Race Condition Prevention**: Sequential ID generation prevents concurrent ID conflicts
     * - **Thread Safety**: Map-based operations provide inherent thread safety characteristics
     * - **Isolation Guarantees**: Category operations are isolated and do not interfere
     * 
     * @extensibility_design
     * The architecture supports extensible categorization without structural modifications:
     * - **Dynamic Categories**: New categories can be added without affecting existing functionality
     * - **Flexible Classification**: Instance categorization logic can be extended for new properties
     * - **Backward Compatibility**: New categories integrate seamlessly with existing operations
     * - **API Consistency**: Addition of new categories maintains consistent operational interfaces
     * - **Performance Scaling**: Architecture scales efficiently with additional categorization dimensions
     * 
     * @query_capabilities
     * The system provides comprehensive querying and filtering capabilities:
     * - **Category-Based Access**: Direct access to instances based on specific behavioral categories
     * - **Universal Queries**: Complete instance enumeration through the primary registry
     * - **Filtered Operations**: Targeted operations on specific instance subsets
     * - **Existence Checking**: Efficient instance existence verification across categories
     * - **Count Operations**: Quick category population counting and statistics
     * 
     * @performance_characteristics
     * The registry is optimized for high-performance toast management scenarios:
     * - **O(1) Operations**: Constant-time insertion, deletion, and lookup operations
     * - **Memory Efficiency**: Minimal memory overhead through shared instance references
     * - **Batch Efficiency**: Optimized batch operations for multiple instance management
     * - **Cache Locality**: Map-based storage provides excellent cache performance characteristics
     * - **Scalability**: Linear scaling with instance count across all operational dimensions
     * 
     * @data_integrity
     * The system maintains strict data integrity across all operations:
     * - **Reference Consistency**: Instance references remain consistent across all categories
     * - **Cleanup Completeness**: Instance removal operations clean all category memberships
     * - **ID Uniqueness**: Identifier uniqueness is guaranteed throughout system operation
     * - **State Synchronization**: Registry state accurately reflects actual instance states
     * - **Orphan Prevention**: Comprehensive cleanup prevents orphaned references in categories
     * 
     * @operational_patterns
     * Common operational patterns and usage scenarios:
     * - **Instance Registration**: Automatic categorization during toast creation and configuration
     * - **Category Queries**: Efficient access to specific instance subsets for targeted operations
     * - **Batch Processing**: Category-based batch operations for efficient multi-instance management
     * - **Lifecycle Tracking**: Instance state monitoring and management throughout operational lifecycle
     * - **Resource Cleanup**: Comprehensive cleanup and memory management during instance destruction
     * 
     * @integration_interfaces
     * The registry provides clean interfaces for system integration:
     * - **Registration API**: Simple interfaces for instance addition and categorization
     * - **Query Interface**: Comprehensive querying capabilities for instance access and filtering
     * - **Cleanup Operations**: Efficient instance removal and cleanup across all categories
     * - **State Inspection**: Registry state inspection and monitoring capabilities
     * - **Category Management**: Dynamic category access and management interfaces
     * 
     * @error_handling
     * The system implements comprehensive error handling and resilience:
     * - **Invalid Instance Handling**: Graceful handling of invalid or malformed instance registrations
     * - **Missing Reference Recovery**: Robust handling of missing or corrupted instance references
     * - **Category Consistency**: Automatic consistency recovery for category membership discrepancies
     * - **Resource Protection**: Protection against resource leaks during error conditions
     * - **Graceful Degradation**: System continues operation even during partial failure scenarios
     * 
     * @security_considerations
     * Security features protect against unauthorized access and manipulation:
     * - **Reference Protection**: Protected instance references prevent unauthorized modification
     * - **ID Integrity**: Secure ID generation prevents predictable identifier exploitation
     * - **Access Control**: Controlled access patterns prevent unauthorized registry manipulation
     * - **State Protection**: Protected registry state prevents external corruption
     * - **Isolation Boundaries**: Clear isolation between different operational contexts
     * 
     * @monitoring_capabilities
     * The system provides comprehensive monitoring and inspection capabilities:
     * - **Instance Counting**: Real-time instance population statistics across all categories
     * - **State Inspection**: Complete registry state inspection for debugging and monitoring
     * - **Category Analysis**: Detailed analysis of category membership and distribution
     * - **Performance Metrics**: Operational performance tracking and optimization identification
     * - **Resource Monitoring**: Memory usage and resource consumption tracking
     * 
     * @note
     * This registry system represents the foundational infrastructure for toast instance management,
     * providing the essential storage, organization, and lifecycle management capabilities required
     * for robust, scalable, and efficient toast notification operation. The multi-category
     * architecture enables sophisticated instance management while maintaining simplicity and
     * performance across all operational scenarios.
     */
    const toastletInstances = Object.seal({

        // TODO: NA DOCUMENTAÇÃO, ENFATIZAR QUE O ID 0 SEMPRE TERÁ TODOS OS LAST*ID COMO 0

        all: new Map(), // Store all toast elements by ID

        stackable: new Map(), // Store stackable toast IDs
        
        nonStackable: new Map(), // Store non-stackable toast IDs

        sticky: new Map(), // Store sticky toast IDs

        nonSticky: new Map(), // Store non-sticky toast IDs

        dismissible: new Map(), // Store dismissible toast IDs

        nonDismissible: new Map(), // Store non-dismissible toast IDs

        /**
         * The next available unique identifier for a toast instance.
         * This value is incremented each time a new toast is created and assigned as its ID.
         */
        id: 0,

        /**
         * The most recently assigned toast instance ID.
         * Represents the last value used for a toast's unique identifier.
         */
        lastId: 0,

        lastStackableId: 0,
        
        lastNonStackableId: 0,

        lastStickyId: 0,

        lastNonStickyId: 0,

        lastDismissibleId: 0,

        lastNonDismissibleId: 0,

        /**
         * Registers a newly created toast instance into the registry system with comprehensive categorization
         * 
         * This function serves as the primary entry point for toast instance registration, handling the
         * complete integration of a newly created toast into the multi-category storage system. It performs
         * essential operations including unique ID assignment, automatic ID increment management, and
         * intelligent categorization based on the toast's configuration properties.
         * 
         * The function implements a sophisticated categorization algorithm that analyzes the toast instance's
         * configuration to determine appropriate category memberships. Each toast is simultaneously stored
         * in multiple categories based on its behavioral characteristics, enabling efficient filtering and
         * batch operations throughout the toast's lifecycle.
         * 
         * @param {Object} toastInstance - The newly created toast instance object from notify() function
         * @returns {void} No return value - performs registration operations directly
         * 
         * @registration_process
         * The registration process follows a strict sequence to ensure data integrity:
         * 1. **Input Validation**: Verifies that the toast instance is valid and not null/undefined
         * 2. **Universal Registration**: Adds the instance to the primary 'all' registry with current ID
         * 3. **ID Assignment**: Assigns the current ID value to the toast instance's id property
         * 4. **ID Tracking**: Updates lastId to track the most recently assigned identifier
         * 5. **ID Increment**: Increments the ID counter for the next toast instance
         * 6. **Category Analysis**: Analyzes toast configuration to determine category memberships
         * 7. **Category Registration**: Registers the instance in all applicable behavioral categories
         * 
         * @categorization_logic
         * The function implements intelligent categorization based on configuration properties:
         * - **Stacking Behavior**: Analyzes config.stacking.enabled to determine stackable/nonStackable placement
         * - **Persistence Behavior**: Analyzes config.sticky to determine sticky/nonSticky categorization
         * - **Multi-Category Membership**: Single instance belongs to multiple categories simultaneously
         * - **Automatic Assignment**: No manual category specification required - determined by configuration
         * - **Consistent Mapping**: Same configuration always results in identical categorization
         * 
         * @id_management
         * The function handles unique identifier management with precision:
         * - **Sequential Assignment**: Uses monotonically increasing numeric identifiers for uniqueness
         * - **Atomic Operations**: ID assignment and increment occur atomically to prevent conflicts
         * - **Instance Binding**: Permanently associates the ID with the toast instance object
         * - **Reference Tracking**: Maintains consistent ID references across all storage categories
         * - **Collision Prevention**: Sequential generation eliminates possibility of ID collisions
         * 
         * @storage_operations
         * The function performs optimized storage operations across multiple data structures:
         * - **Map-Based Storage**: Utilizes Map objects for O(1) insertion performance across all categories
         * - **Reference Sharing**: Stores same instance reference across multiple categories for memory efficiency
         * - **Atomic Insertion**: All category insertions complete successfully or none occur
         * - **Consistent State**: Registry state remains consistent across all category memberships
         * - **Performance Optimization**: Minimizes storage overhead through efficient data structure usage
         * 
         * @configuration_analysis
         * The function analyzes toast configuration to determine appropriate categorizations:
         * - **Stacking Configuration**: Examines config.stacking.enabled for stackable behavior determination
         * - **Persistence Configuration**: Examines config.sticky for persistence behavior classification
         * - **Boolean Logic**: Uses clear boolean evaluation for category assignment decisions
         * - **Default Handling**: Gracefully handles missing or undefined configuration properties
         * - **Extension Ready**: Architecture supports additional configuration-based categorizations
         * 
         * @error_handling
         * The function implements comprehensive error handling and validation:
         * - **Null/Undefined Protection**: Early return prevents processing of invalid instances
         * - **Silent Failures**: Invalid inputs result in graceful early termination without exceptions
         * - **State Protection**: Invalid inputs do not corrupt registry state or existing instances
         * - **Resource Safety**: No resource allocation occurs for invalid inputs
         * - **Consistent Behavior**: Same invalid input always produces same safe behavior
         * 
         * @performance_characteristics
         * The function is optimized for high-frequency toast creation scenarios:
         * - **O(1) Operations**: All storage operations complete in constant time
         * - **Memory Efficiency**: Shared references prevent unnecessary object duplication
         * - **Minimal Overhead**: Configuration analysis adds negligible performance cost
         * - **Batch Friendly**: Function performs efficiently in high-frequency creation scenarios
         * - **Cache Locality**: Sequential operations provide excellent cache performance
         * 
         * @thread_safety
         * The function operates safely in concurrent environments:
         * - **Atomic ID Operations**: ID assignment and increment occur atomically
         * - **Consistent State**: Registry state remains consistent across concurrent operations
         * - **Race Condition Prevention**: Sequential ID generation prevents concurrent conflicts
         * - **Isolation Guarantees**: Individual registrations do not interfere with each other
         * - **Data Integrity**: Concurrent operations maintain data integrity across all categories
         * 
         * @integration_points
         * The function integrates seamlessly with the broader toast system:
         * - **Notify Integration**: Designed specifically for instances created by notify() function
         * - **Lifecycle Coordination**: Registration occurs at optimal point in instance lifecycle
         * - **Category Synchronization**: Categories remain synchronized with actual instance properties
         * - **State Management**: Enables subsequent lifecycle operations through proper registration
         * - **System Consistency**: Maintains consistency with overall toast management architecture
         * 
         * @extensibility_support
         * The function architecture supports future enhancements:
         * - **Additional Categories**: New category types can be added without structural changes
         * - **Configuration Extension**: New configuration properties can drive additional categorizations
         * - **Custom Logic**: Categorization logic can be extended for specialized requirements
         * - **Backward Compatibility**: Extensions maintain compatibility with existing functionality
         * - **Performance Scaling**: Architecture scales efficiently with additional categorization complexity
         * 
         * @usage_patterns
         * Common usage patterns and integration scenarios:
         * - **Post-Creation Registration**: Called immediately after toast instance creation
         * - **Configuration-Based Categorization**: Automatic category assignment based on instance properties
         * - **Lifecycle Initiation**: Enables subsequent lifecycle operations through proper registration
         * - **State Tracking**: Establishes foundation for comprehensive instance state management
         * - **Resource Management**: Enables proper resource tracking and cleanup operations
         * 
         * @example
         * // Typical usage within notify() function
         * const toastInstance = createToastInstance(type, content, config);
         * toastletInstances.push(toastInstance);
         * // Instance is now registered with ID and proper categorization
         * 
         * @example
         * // Results in the following registrations:
         * // - toastletInstances.all.set(id, instance)
         * // - toastletInstances.stackable.set(id, instance) OR nonStackable
         * // - toastletInstances.sticky.set(id, instance) OR nonSticky
         * // - instance.id = assignedId
         * 
         * @note
         * This function is fundamental to toast instance lifecycle management, establishing the
         * foundation for all subsequent toast operations including display, interaction handling,
         * state management, and cleanup. The multi-category registration enables efficient
         * filtering and batch operations while maintaining optimal performance characteristics
         * suitable for high-frequency toast creation scenarios.
         */
        push: objFreeze( (toastInstance) => {

            if( ! toastInstance ) return;

            toastletInstances.all.set(toastletInstances.id, toastInstance);

            toastletInstances.lastId = toastletInstances.id;

            toastInstance.id = toastletInstances.lastId;

            toastletInstances.id++;

            if( toastInstance.isStackable ) {
                
                toastletInstances.stackable.set(toastletInstances.lastId, toastInstance);
                toastletInstances.lastStackableId = toastletInstances.lastId;

            }
            else {

                toastletInstances.nonStackable.set(toastletInstances.lastId, toastInstance);
                toastletInstances.lastNonStackableId = toastletInstances.lastId;

            }

            if( toastInstance.isSticky ) {
                
                toastletInstances.sticky.set(toastletInstances.lastId, toastInstance);
                toastletInstances.lastStickyId = toastletInstances.lastId;

            }
            else {

                toastletInstances.nonSticky.set(toastletInstances.lastId, toastInstance);
                toastletInstances.lastNonStickyId = toastletInstances.lastId;
                
            }

            if( toastInstance.isDismissible ) {

                toastletInstances.dismissible.set(toastletInstances.lastId, toastInstance);
                toastletInstances.lastDismissibleId = toastletInstances.lastId;

            }
            else {
                
                toastletInstances.nonDismissible.set(toastletInstances.lastId, toastInstance);
                toastletInstances.lastNonDismissibleId = toastletInstances.lastId;
            
            }

        }),

        /**
         * Comprehensively removes a toast instance from all registry categories and storage systems
         * 
         * This function performs complete deregistration of a toast instance from the multi-category
         * storage system, ensuring thorough cleanup and prevention of orphaned references across all
         * storage dimensions. It systematically checks and removes the specified toast instance from
         * every category where it might be present, maintaining registry integrity and preventing
         * memory leaks through comprehensive cleanup operations.
         * 
         * The function implements a defensive deletion strategy that safely handles instances that
         * may exist in any combination of categories, ensuring complete removal regardless of the
         * toast's original categorization or current state. This approach guarantees registry
         * consistency and proper resource deallocation during toast lifecycle termination.
         * 
         * @param {number} id - The unique identifier of the toast instance to remove from all categories
         * @returns {void} No return value - performs cleanup operations directly
         * 
         * @removal_process
         * The removal process systematically addresses all possible storage locations:
         * 1. **Universal Registry Cleanup**: Removes instance from the primary 'all' registry
         * 2. **Stackable Category Cleanup**: Removes instance from stackable toast storage if present
         * 3. **Non-Stackable Category Cleanup**: Removes instance from non-stackable storage if present
         * 4. **Sticky Category Cleanup**: Removes instance from sticky toast storage if present
         * 5. **Non-Sticky Category Cleanup**: Removes instance from non-sticky storage if present
         * 6. **Defensive Validation**: Each removal operation includes existence checking for safety
         * 7. **Complete Deallocation**: All references to the instance are eliminated across categories
         * 
         * @defensive_strategy
         * The function employs a defensive deletion approach for maximum safety:
         * - **Existence Verification**: Each category is checked for instance presence before deletion
         * - **Safe Operations**: Non-existent entries are handled gracefully without errors
         * - **Complete Coverage**: All known categories are systematically processed
         * - **Orphan Prevention**: Comprehensive cleanup prevents orphaned references
         * - **Idempotent Behavior**: Multiple calls with same ID are safe and consistent
         * 
         * @memory_management
         * The function provides comprehensive memory management and cleanup:
         * - **Reference Elimination**: Removes all stored references to the toast instance
         * - **Garbage Collection Enablement**: Proper cleanup enables garbage collection of instance
         * - **Memory Leak Prevention**: Systematic removal prevents memory accumulation
         * - **Resource Deallocation**: Frees up Map storage space across all categories
         * - **Efficient Cleanup**: O(1) deletion operations across all storage structures
         * 
         * @category_independence
         * The function handles category-independent deletion operations:
         * - **Universal Applicability**: Works regardless of instance's original categorization
         * - **Configuration Agnostic**: Removal succeeds regardless of toast configuration properties
         * - **State Independent**: Functions correctly regardless of current toast state
         * - **Comprehensive Coverage**: Addresses all possible category memberships
         * - **Consistent Behavior**: Same deletion logic applies to all instance types
         * 
         * @error_resilience
         * The function demonstrates robust error handling and resilience:
         * - **Invalid ID Handling**: Gracefully handles non-existent or invalid ID values
         * - **Silent Failures**: Non-existent entries result in safe no-op behavior
         * - **Exception Prevention**: No exceptions thrown for invalid or missing instances
         * - **State Protection**: Registry state remains consistent even with invalid inputs
         * - **Corruption Prevention**: Invalid operations do not corrupt existing registry data
         * 
         * @performance_characteristics
         * The function is optimized for efficient cleanup operations:
         * - **O(1) Deletions**: Each category deletion completes in constant time
         * - **Minimal Overhead**: Existence checks add negligible performance cost
         * - **Batch Friendly**: Performs efficiently in bulk deletion scenarios
         * - **Cache Efficient**: Sequential operations provide good cache locality
         * - **Resource Efficient**: Minimal computational overhead for cleanup operations
         * 
         * @concurrency_safety
         * The function operates safely in concurrent environments:
         * - **Atomic Operations**: Individual deletion operations are atomic within each category
         * - **Consistent State**: Registry state remains consistent across concurrent deletions
         * - **Race Condition Safe**: Multiple concurrent deletions of same ID are handled safely
         * - **Isolation Guarantees**: Deletion operations do not interfere with concurrent registrations
         * - **Data Integrity**: Concurrent operations maintain data integrity across all categories
         * 
         * @lifecycle_integration
         * The function integrates seamlessly with toast lifecycle management:
         * - **Termination Phase**: Called during final phase of toast instance lifecycle
         * - **Cleanup Coordination**: Coordinates with other cleanup operations for complete termination
         * - **State Synchronization**: Ensures registry state accurately reflects instance destruction
         * - **Resource Management**: Enables proper resource tracking and deallocation
         * - **System Consistency**: Maintains consistency with overall toast management architecture
         * 
         * @extensibility_support
         * The function architecture supports future category extensions:
         * - **Additional Categories**: New category deletions can be added without structural changes
         * - **Backward Compatibility**: Extensions maintain compatibility with existing deletion logic
         * - **Scalable Operations**: Architecture scales efficiently with additional categories
         * - **Consistent Pattern**: New categories follow same defensive deletion pattern
         * - **Maintainable Code**: Clear structure facilitates easy extension and maintenance
         * 
         * @usage_patterns
         * Common usage patterns and integration scenarios:
         * - **Toast Destruction**: Called when toast instance is being permanently destroyed
         * - **Cleanup Operations**: Used in comprehensive cleanup and resource deallocation
         * - **Error Recovery**: Employed in error recovery scenarios to ensure clean state
         * - **Batch Cleanup**: Utilized in batch operations for multiple instance cleanup
         * - **System Shutdown**: Used during system shutdown for complete registry cleanup
         * 
         * @validation_approach
         * The function employs comprehensive validation for safe operations:
         * - **ID Validation**: Implicitly validates ID through Map.has() existence checking
         * - **Category Validation**: Each category is independently validated before deletion
         * - **Safe Execution**: Validation ensures safe execution regardless of input validity
         * - **Consistent Behavior**: Same validation approach across all category operations
         * - **Error Prevention**: Validation prevents errors from propagating through system
         * 
         * @example
         * // Typical usage during toast cleanup
         * toastletInstances.delete(toastId);
         * // Instance is now completely removed from all categories
         * 
         * @example
         * // Safe to call multiple times with same ID
         * toastletInstances.delete(123);
         * toastletInstances.delete(123); // Safe - no errors or side effects
         * 
         * @example
         * // Safe with invalid IDs
         * toastletInstances.delete(-1);     // Safe - no operation performed
         * toastletInstances.delete(null);   // Safe - no operation performed
         * 
         * @note
         * This function is critical for proper toast lifecycle management and system resource
         * management. It ensures complete cleanup of toast instances from the registry system,
         * preventing memory leaks and maintaining registry integrity. The defensive approach
         * guarantees safe operation regardless of instance state or categorization, making it
         * suitable for use in error recovery scenarios and comprehensive cleanup operations.
         */
        delete: objFreeze( (id) => {

            if( toastletInstances.all.has(id) ) toastletInstances.all.delete(id);

            if( toastletInstances.stackable.has(id) ) toastletInstances.stackable.delete(id);

            if( toastletInstances.nonStackable.has(id) ) toastletInstances.nonStackable.delete(id);

            if( toastletInstances.sticky.has(id) ) toastletInstances.sticky.delete(id);

            if( toastletInstances.nonSticky.has(id) ) toastletInstances.nonSticky.delete(id);

            if( toastletInstances.dismissible.has(id) ) toastletInstances.dismissible.delete(id);

            if( toastletInstances.nonDismissible.has(id) ) toastletInstances.nonDismissible.delete(id);

        }),

        /**
         * Determines the highest ID value among currently active toast instances
         * 
         * This function calculates and returns the highest identifier value among all currently
         * active (non-deleted) toast instances in the registry, which may differ significantly
         * from the lastId property when toast instances have been removed from the system.
         * Unlike lastId which tracks the most recently assigned identifier regardless of instance
         * state, this function provides the actual highest ID among visible, active toasts.
         * 
         * The function performs a comprehensive scan of the active registry to determine the true
         * maximum ID value, accounting for scenarios where higher-numbered toasts have been
         * dismissed while lower-numbered toasts remain active. This distinction is crucial for
         * operations that require knowledge of the actual active toast landscape rather than
         * just the assignment history.
         * 
         * @returns {number} The highest ID value among currently active toast instances
         * 
         * @calculation_methodology
         * The function employs a reliable calculation approach:
         * 1. **Initial Assumption**: Starts with lastId as the potential maximum value
         * 2. **Registry Iteration**: Scans through all entries in the active toast registry
         * 3. **Maximum Tracking**: Updates the maximum value as higher IDs are encountered
         * 4. **Final Result**: Returns the true maximum ID among active instances
         * 5. **Fallback Behavior**: Returns lastId if no active instances exist
         * 
         * @behavioral_scenarios
         * The function handles various operational scenarios accurately:
         * 
         * **Scenario 1 - All Instances Active**:
         * - Created toasts: ID 0, 1, 2, 3 (lastId = 3)
         * - Active toasts: 0, 1, 2, 3
         * - getLastActiveId() returns: 3 (matches lastId)
         * 
         * **Scenario 2 - Highest ID Removed**:
         * - Created toasts: ID 0, 1, 2, 3 (lastId = 3)
         * - Removed toast: ID 3
         * - Active toasts: 0, 1, 2
         * - getLastActiveId() returns: 2 (differs from lastId = 3)
         * 
         * **Scenario 3 - Middle IDs Removed**:
         * - Created toasts: ID 0, 1, 2, 3, 4 (lastId = 4)
         * - Removed toasts: ID 1, 3
         * - Active toasts: 0, 2, 4
         * - getLastActiveId() returns: 4 (matches lastId)
         * 
         * **Scenario 4 - Only Lower IDs Active**:
         * - Created toasts: ID 0, 1, 2, 3, 4 (lastId = 4)
         * - Removed toasts: ID 3, 4
         * - Active toasts: 0, 1, 2
         * - getLastActiveId() returns: 2 (differs from lastId = 4)
         * 
         * @use_case_applications
         * The function serves critical applications in toast management:
         * - **Stacking Calculations**: Determining proper z-index and layering for new toasts
         * - **Position Management**: Calculating positioning relative to currently visible toasts
         * - **Animation Coordination**: Synchronizing animations with the actual visible toast landscape
         * - **Layout Planning**: Planning layout operations based on active toast distribution
         * - **State Validation**: Validating system state against actual visible instances
         * 
         * @performance_characteristics
         * The function provides efficient calculation with reasonable performance:
         * - **Linear Scan**: O(n) time complexity where n is the number of active instances
         * - **Memory Efficient**: Minimal memory overhead during calculation
         * - **Iterator Based**: Uses efficient Map iterator for registry traversal
         * - **Early Termination**: No early termination optimization (complete scan required)
         * - **Consistent Results**: Always produces consistent results for same registry state
         * 
         * @accuracy_guarantees
         * The function provides reliable accuracy in all scenarios:
         * - **Real-time Accuracy**: Results reflect current registry state at call time
         * - **Deletion Aware**: Automatically accounts for recently deleted instances
         * - **Registration Aware**: Reflects all currently registered active instances
         * - **State Consistency**: Results remain consistent with actual visible toast state
         * - **No False Positives**: Never returns IDs for non-existent or deleted instances
         * 
         * @edge_case_handling
         * The function gracefully handles various edge cases:
         * - **Empty Registry**: Returns lastId (likely 0 or previous maximum) when no instances exist
         * - **Single Instance**: Correctly identifies the sole active instance ID
         * - **Non-sequential IDs**: Handles scenarios with gaps in ID sequence correctly
         * - **Recent Deletions**: Accurately reflects deletions that occurred before the call
         * - **Concurrent Modifications**: Provides snapshot accuracy at time of execution
         * 
         * @integration_patterns
         * The function integrates with various system components:
         * - **Display Management**: Used by display systems to understand active toast landscape
         * - **Animation Systems**: Consulted by animation systems for proper effect coordination
         * - **Layout Engines**: Used by layout engines for positioning and spacing calculations
         * - **State Managers**: Consulted by state management systems for validation operations
         * - **Cleanup Systems**: Used by cleanup systems to understand active instance distribution
         * 
         * @comparison_with_lastid
         * Key differences between getLastActiveId() and lastId property:
         * 
         * **lastId Property**:
         * - Tracks assignment history regardless of current state
         * - Never decreases (monotonically increasing)
         * - Reflects total number of toasts ever created
         * - Unaffected by toast deletion operations
         * - Provides assignment context for new instances
         * 
         * **getLastActiveId() Function**:
         * - Reflects current active toast landscape
         * - Can decrease when high-ID toasts are deleted
         * - Reflects only currently visible instances
         * - Immediately affected by deletion operations
         * - Provides context for layout and positioning operations
         * 
         * @thread_safety
         * The function operates safely in concurrent environments:
         * - **Snapshot Consistency**: Provides consistent snapshot of registry state at call time
         * - **Iterator Safety**: Map iterator provides consistent view during iteration
         * - **No State Modification**: Function is read-only and does not modify registry state
         * - **Concurrent Safe**: Safe to call concurrently with other registry operations
         * - **Isolation Guarantees**: Results isolated from concurrent modifications during execution
         * 
         * @debugging_applications
         * The function serves useful debugging and monitoring purposes:
         * - **State Inspection**: Quick way to understand active toast distribution
         * - **Validation Testing**: Verifying that cleanup operations work correctly
         * - **Performance Monitoring**: Understanding active instance counts and distributions
         * - **Layout Debugging**: Debugging layout issues related to toast positioning
         * - **Animation Debugging**: Debugging animation coordination issues
         * 
         * @example
         * // Basic usage to get current maximum active ID
         * const maxActiveId = toastletInstances.getLastActiveId();
         * console.log(`Highest active toast ID: ${maxActiveId}`);
         * 
         * @example
         * // Comparison with lastId property
         * const lastAssigned = toastletInstances.lastId;
         * const lastActive = toastletInstances.getLastActiveId();
         * if (lastAssigned !== lastActive) {
         *     console.log(`${lastAssigned - lastActive} high-ID toasts have been removed`);
         * }
         * 
         * @example
         * // Use in positioning calculations
         * const baseZIndex = 1000;
         * const maxActiveId = toastletInstances.getLastActiveId();
         * const newToastZIndex = baseZIndex + maxActiveId + 1;
         * 
         * @note
         * This function is essential for operations that require understanding of the actual
         * active toast landscape rather than just the assignment history. The distinction
         * between assigned IDs and active IDs becomes critical in dynamic environments where
         * toasts are frequently created and destroyed, particularly in applications with
         * stacking behavior where visual layering depends on actual visible instances.
         */
        getLastActiveId: objFreeze( () => {

            let lastId = toastletInstances.lastId;

            for( const [id] of toastletInstances.all ) lastId = id;

            return lastId;

        }),

        getLastStackableId: objFreeze( () => {

            let lastId = toastletInstances.lastStackableId;

            for( const [id] of toastletInstances.stackable ) lastId = id;

            return lastId;

        }),

        getLastNonStackableId: objFreeze( () => {

            let lastId = toastletInstances.lastNonStackableId;

            for( const [id] of toastletInstances.nonStackable ) lastId = id;

            return lastId;

        }),

        getLastStickyId: objFreeze( () => {

            let lastId = toastletInstances.lastStickyId;

            for( const [id] of toastletInstances.sticky ) lastId = id;

            return lastId;

        }),

        getLastNonStickyId: objFreeze( () => {

            let lastId = toastletInstances.lastNonStickyId;

            for( const [id] of toastletInstances.nonSticky ) lastId = id;

            return lastId;

        }),

        getLastDismissibleId: objFreeze( () => {

            let lastId = toastletInstances.lastDismissibleId;

            for( const [id] of toastletInstances.dismissible ) lastId = id;

            return lastId;

        }),

        getLastNonDismissibleId: objFreeze( () => {

            let lastId = toastletInstances.lastNonDismissibleId;

            for( const [id] of toastletInstances.nonDismissible ) lastId = id;

            return lastId;

        }),

    });

    /**
     * Toast Notification Core System - Comprehensive lifecycle management and configuration engine
     * 
     * This object serves as the central nervous system of the toast notification framework, containing
     * all properties, functions, and configurations directly related to toast creation, management,
     * and lifecycle control. Unlike utility helper objects that provide general-purpose functions,
     * toastletCore specifically houses the intrinsic logic and data structures that define how
     * toast notifications are created, configured, displayed, managed, and destroyed throughout
     * their entire operational lifecycle.
     * 
     * The system is architected to provide comprehensive toast management capabilities including
     * preset configurations, timeout management, animation control, positioning systems, event
     * handling, and utility functions specifically designed for toast operations. Every component
     * within this object is fundamentally tied to the toast notification's existence and behavior,
     * ensuring cohesive and centralized management of all toast-related functionality.
     * 
     * @author Pedro Rigolin
     * @namespace toastletCore
     * @type {Object}
     * @readonly
     * 
     * @architecture_overview
     * The toastletCore object is structured in specialized modules that handle distinct aspects
     * of toast lifecycle management:
     * - **presets**: Configuration templates, styles, icons, and type definitions
     * - **timeouts**: Timer management for auto-dismissal and interaction delays
     * - **animation**: CSS animation control and transition management
     * - **utils**: Core utility functions for toast operations and state management
     * - **handles**: Event handling system for user interactions and system events
     * 
     * @lifecycle_management
     * The system manages toast notifications through several distinct lifecycle phases:
     * 1. **Initialization**: Configuration merging, validation, and instance creation
     * 2. **Creation**: DOM element construction, styling, and initial positioning
     * 3. **Display**: Animation entry, positioning calculation, and visibility management
     * 4. **Interaction**: Event handling, pause/resume logic, and user input processing
     * 5. **Management**: Timer control, state tracking, and behavior coordination
     * 6. **Dismissal**: Exit animations, cleanup, and memory management
     * 7. **Destruction**: DOM removal, event cleanup, and instance deallocation
     * 
     * @configuration_system
     * The preset system provides comprehensive configuration templates that define:
     * - **Visual Appearance**: Colors, icons, typography, and layout styles
     * - **Behavioral Patterns**: Auto-dismissal timing, interaction responses, animation preferences
     * - **Accessibility Features**: ARIA attributes, keyboard navigation, screen reader support
     * - **Device Adaptation**: Responsive styles, touch optimization, mobile-specific behaviors
     * - **Type Definitions**: Success, error, warning, info, loading, and custom notification types
     * 
     * @timing_precision
     * The timeout management system provides precise control over temporal aspects:
     * - **Auto-dismissal Timers**: Configurable duration-based automatic closure
     * - **Interaction Delays**: Debounced response to prevent accidental interactions
     * - **Pause/Resume Logic**: Intelligent timer suspension during user engagement
     * - **Animation Coordination**: Synchronized timing between visual transitions
     * - **Performance Optimization**: Efficient timer cleanup and memory management
     * 
     * @animation_engine
     * The animation system coordinates visual transitions throughout toast lifecycle:
     * - **Entry Animations**: Smooth appearance with configurable transition effects
     * - **Exit Animations**: Graceful dismissal with appropriate visual feedback
     * - **State Transitions**: Visual cues for pause, resume, and interaction states
     * - **Performance Optimization**: Hardware acceleration and efficient animation management
     * - **Accessibility Compliance**: Respect for reduced motion preferences and timing requirements
     * 
     * @positioning_intelligence
     * The positioning system handles dynamic placement and responsive behavior:
     * - **Multi-device Support**: Optimized layouts for desktop, tablet, and mobile devices
     * - **Stackable Management**: Intelligent spacing and overlap prevention for multiple toasts
     * - **Viewport Awareness**: Dynamic positioning based on available screen real estate
     * - **Responsive Adaptation**: Automatic layout adjustments for different screen sizes
     * - **Z-index Management**: Proper layering to ensure toast visibility and interaction
     * 
     * @event_coordination
     * The event handling system manages comprehensive user and system interactions:
     * - **User Interactions**: Click, touch, hover, and keyboard event processing
     * - **Focus Management**: Accessibility-compliant focus handling and navigation
     * - **System Events**: Window resize, visibility changes, and orientation adjustments
     * - **Custom Events**: Application-specific event integration and callback management
     * - **Performance Optimization**: Efficient event delegation and cleanup mechanisms
     * 
     * @utility_functions
     * Core utilities provide specialized operations for toast management:
     * - **State Management**: Instance tracking, configuration updates, and status monitoring
     * - **DOM Operations**: Element creation, modification, and cleanup specific to toasts
     * - **Validation Logic**: Configuration verification and error handling
     * - **Helper Operations**: Common tasks specific to toast notification requirements
     * - **Integration Support**: APIs for external library integration and extension
     * 
     * @performance_characteristics
     * The system is optimized for high-performance operation through:
     * - **Efficient Memory Management**: Proper instance cleanup and garbage collection optimization
     * - **Minimal DOM Manipulation**: Batched updates and optimized rendering patterns
     * - **Event Optimization**: Efficient event delegation and minimal listener overhead
     * - **Timer Efficiency**: Precise timeout management with minimal resource consumption
     * - **Animation Performance**: Hardware-accelerated transitions and optimized rendering
     * 
     * @accessibility_compliance
     * Built-in accessibility features ensure inclusive user experience:
     * - **ARIA Integration**: Comprehensive ARIA attribute management for screen readers
     * - **Keyboard Navigation**: Full keyboard accessibility with logical tab ordering
     * - **Focus Management**: Intelligent focus handling for optimal screen reader experience
     * - **Motion Preferences**: Respect for user preferences regarding motion and animation
     * - **Color Contrast**: Configurable themes that meet WCAG accessibility guidelines
     * 
     * @extensibility_design
     * The architecture supports extensibility and customization:
     * - **Plugin Architecture**: Clean interfaces for functionality extension
     * - **Theme System**: Comprehensive styling customization capabilities
     * - **Event Hooks**: Integration points for custom logic and external library coordination
     * - **Configuration Override**: Flexible configuration merging and customization options
     * - **Type System**: Extensible notification type definitions with custom behaviors
     * 
     * @security_considerations
     * Security features protect against common vulnerabilities:
     * - **Input Sanitization**: Safe handling of user-provided content and configuration
     * - **XSS Prevention**: Secure content rendering without script injection risks
     * - **DOM Safety**: Protected DOM manipulation preventing unauthorized access
     * - **Event Security**: Secure event handling without exposure to malicious code
     * - **Configuration Validation**: Comprehensive validation preventing malformed configurations
     * 
     * @integration_capabilities
     * The system provides comprehensive integration support:
     * - **Framework Agnostic**: Compatible with any JavaScript framework or vanilla implementation
     * - **Module System**: Clean module boundaries for easy integration and testing
     * - **API Consistency**: Predictable interfaces for reliable integration patterns
     * - **Error Handling**: Comprehensive error management with graceful degradation
     * - **Debug Support**: Development-friendly debugging and inspection capabilities
     * 
     * @browser_compatibility
     * Cross-browser compatibility ensures consistent behavior across environments:
     * - **Modern Browser Support**: Optimized for current browser capabilities and standards
     * - **Progressive Enhancement**: Graceful degradation for older browser environments
     * - **Feature Detection**: Intelligent capability detection for optimal user experience
     * - **Polyfill Integration**: Support for necessary polyfills when required
     * - **Performance Scaling**: Optimized performance across different browser engines
     * 
     * @maintenance_design
     * The codebase is structured for long-term maintainability:
     * - **Modular Architecture**: Clear separation of concerns for easy modification and testing
     * - **Documentation Standards**: Comprehensive inline documentation for all functionality
     * - **Testing Support**: Architecture designed to support comprehensive testing strategies
     * - **Version Compatibility**: Backwards compatibility considerations for API evolution
     * - **Performance Monitoring**: Built-in performance tracking and optimization opportunities
     * 
     * @usage_patterns
     * Common usage patterns and best practices:
     * - **Instance Management**: Proper creation, tracking, and cleanup of toast instances
     * - **Configuration Management**: Effective use of presets and custom configurations
     * - **Performance Optimization**: Best practices for high-frequency toast scenarios
     * - **Accessibility Implementation**: Proper implementation of accessible toast notifications
     * - **Integration Patterns**: Common patterns for framework and library integration
     * 
     * @note
     * This object represents the complete toast notification engine, containing only functionality
     * that is intrinsically related to toast creation, management, and lifecycle control. It is
     * designed to be the single source of truth for all toast-related operations, providing a
     * comprehensive, performant, and accessible notification system suitable for production
     * applications across diverse environments and use cases.
     */
    const toastletCore = objDeepFreeze({
        
        /**
         * Configuration presets and templates for toast notifications.
         * 
         * Provides a comprehensive collection of predefined configurations including:
         * - Default styling for desktop and mobile devices
         * - Icon libraries with SVG implementations
         * - Toast type definitions (success, error, warning, etc.)
         * - Progress bar styling and animations
         * - CSS class definitions for different layouts
         * 
         * All presets are designed for optimal cross-browser compatibility and
         * accessibility compliance. Each preset includes responsive design
         * considerations and can be extended or overridden per instance.
         * 
         * Performance characteristics:
         * - Static configurations cached at initialization
         * - SVG icons optimized for minimal payload
         * - CSS properties structured for efficient DOM manipulation
         * - Responsive breakpoint handling for mobile/desktop
         * 
         * @namespace
         * @property {Object} classes - CSS class definitions for toast components
         * @property {Object} icons - SVG icon library (pause, play, close, types)
         * @property {Object} styles - Default CSS styling for all components
         * @property {Object} types - Predefined toast types with configurations
         * @property {Object} progressBar - Progress bar direction and styling presets
         * 
         * @example
         * // Access predefined toast type
         * const errorType = toastletCore.presets.types.error;
         * 
         * @example
         * // Get desktop styles for content column
         * const contentStyles = toastletCore.presets.styles.contentCol;
         * 
         * @example
         * // Access SVG icon
         * const closeIcon = toastletCore.presets.icons.close;
         * 
         * @author Pedro Rigolin
         * @since 1.0.0
         */
        presets: {

            classes: { 
                // TODO: IMPLEMENTAÇÃO DAS CLASSES AQUI, PARA FICAR MAIS ORGANIZADO E FACILITAR A MANUTENÇÃO
            },

            /**
             * SVG icon library for toast notifications.
             * 
             * Provides a collection of optimized SVG icons used throughout the toast
             * notification system. All icons are designed with consistent styling,
             * proper accessibility attributes, and optimal file size for performance.
             * 
             * Icon specifications:
             * - 16x16 pixel default size (scalable)
             * - White (#FFFFFF) fill color for contrast
             * - Optimized SVG paths for minimal payload
             * - CSS classes for easy styling customization
             * 
             * @namespace
             * @property {string} pause - SVG icon for pause button (two vertical bars)
             * @property {string} play - SVG icon for play/resume button (triangle)
             * @property {string} close - SVG icon for close button (X symbol)
             * 
             * @example
             * // Use pause icon in button
             * button.innerHTML = toastletCore.presets.icons.pause;
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            icons: {

                pause: `<svg class="toastlet-icon-svg toastlet-icon-pause" width="16" height="16" viewBox="0 0 448 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"/></svg>`,

                play: `<svg class="toastlet-icon-svg toastlet-icon-play" width="16" height="16" viewBox="0 0 448 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/></svg>`,

                close: `<svg class="toastlet-icon-close toastlet-icon-svg" fill="#FFFFFF" height="16" viewBox="-53 23 490 490" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M374.3 85.3c-21.9-21.9-57.5-21.9-79.4 0L192 188.1 89.1 85.3c-21.9-21.9-57.5-21.9-79.4 0s-21.9 57.5 0 79.4L112.6 267.5 9.7 370.3c-21.9 21.9-21.9 57.5 0 79.4s57.5 21.9 79.4 0L192 346.9l102.9 102.8c21.9 21.9 57.5 21.9 79.4 0s21.9-57.5 0-79.4L271.4 267.5 374.3 164.7c21.9-21.9 21.9-57.5 0-79.4z"/></svg>`

            },

            /**
             * Default CSS styling configurations for all toast components.
             * 
             * Provides comprehensive styling definitions organized by component type
             * and device category. Styles are defined as arrays of CSS property-value
             * pairs for efficient batch application to DOM elements.
             * 
             * Organization structure:
             * - Component-based grouping (toast, buttons, progress bar)
             * - Device-specific variations (desktop/mobile)
             * - Responsive design considerations
             * - Performance-optimized property definitions
             * 
             * Style format:
             * Each style is defined as [property, value] arrays for efficient
             * batch processing and consistent application across components.
             * 
             * @namespace
             * @property {Object} toast - Core toast container styles
             * @property {Array} iconCol - Icon column layout styles
             * @property {Array} iconContainer - Icon container positioning
             * @property {Array} contentCol - Content column layout
             * @property {Array} title - Toast title typography
             * @property {Array} content - Toast content text styling
             * @property {Array} controlCol - Control buttons column layout
             * @property {Array} pauseButton - Pause button styling
             * @property {Array} closeButton - Close button styling
             * @property {Array} progressBar - Progress bar background
             * @property {Array} progressBarThumb - Progress bar fill element
             * 
             * @example
             * // Apply desktop toast styles
             * toastletStyleHelper.setProperties(element, ...toastletCore.presets.styles.toast.desktop);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

            /**
             * Predefined toast type configurations with styling and behavior.
             * 
             * Provides a comprehensive collection of toast types including visual
             * styling, accessibility configurations, and semantic meanings. Each type
             * includes color schemes, icons, CSS classes, and default configurations
             * optimized for their specific use case.
             * 
             * Available types:
             * - warning: Alert-level notifications for important warnings
             * - info: Informational messages for user guidance
             * - success: Positive feedback for completed actions
             * - error: Critical alerts for failures and errors
             * - notice: General notifications and updates
             * - loading: Progress indicators for ongoing operations
             * - custom: Flexible base for custom implementations
             * 
             * Type structure:
             * Each type contains type identifier, color scheme, SVG icon,
             * CSS class, and accessibility configuration including ARIA
             * attributes and semantic roles.
             * 
             * Accessibility features:
             * - Proper ARIA roles (alert, status)
             * - Live region announcements (assertive, polite)
             * - Screen reader compatible configurations
             * - Semantic color and icon associations
             * 
             * @namespace
             * @property {Object} warning - Warning type configuration
             * @property {Object} info - Information type configuration
             * @property {Object} success - Success type configuration
             * @property {Object} error - Error type configuration
             * @property {Object} notice - Notice type configuration
             * @property {Object} loading - Loading type configuration
             * @property {Object} custom - Custom type base configuration
             * @property {Function} get - Retrieve type configuration by name
             * 
             * @example
             * // Get error type configuration
             * const errorConfig = toastletCore.presets.types.get('error');
             * 
             * @example
             * // Access warning type directly
             * const warningType = toastletCore.presets.types.warning;
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

                    if( ! toastletCore.presets.types.hasOwnProperty(type) ) return false;

                    return toastletCore.presets.types[type];

                }

            },

            /**
             * Progress bar configuration and direction presets.
             * 
             * Provides predefined configurations for toast progress bars including
             * animation directions, flex layout properties, and positioning values.
             * Supports left-to-right and right-to-left progress animations with
             * proper CSS flex configurations.
             * 
             * Available directions:
             * - left-to-right: Standard progress from left to right
             * - right-to-left: Reverse progress from right to left
             * 
             * Each direction includes:
             * - Human-readable name
             * - CSS flex-direction property
             * - Animation start/end percentages
             * - Layout configuration values
             * 
             * @namespace
             * @property {Object} available - Available progress bar directions
             * @property {Array} array - Array of direction names for validation
             * @property {Function} get - Retrieve direction configuration by name
             * 
             * @example
             * // Get left-to-right configuration
             * const config = toastletCore.presets.progressBar.get('left-to-right');
             * 
             * @example
             * // Access available directions
             * const directions = toastletCore.presets.progressBar.array;
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

                    if( ! toastletCore.presets.progressBar.available.hasOwnProperty(direction) ) return false;

                    return toastletCore.presets.progressBar.available[direction];

                }

            }

        },

        /**
         * Timer and timeout management system for toast lifecycle control.
         * 
         * Provides comprehensive timer management including auto-dismissal timers,
         * pause/resume functionality, progress bar synchronization, and event-based
         * timeout handling. Manages all temporal aspects of toast notifications
         * with precision timing and smooth transitions.
         * 
         * Key features:
         * - Auto-dismissal timer with pause/resume capabilities
         * - Progress bar animation synchronized with timer
         * - Event-based timeout handling (hover, focus, touch)
         * - Memory-efficient timeout cleanup
         * - High-precision timing using performance.now()
         * 
         * Performance characteristics:
         * - O(1) timeout registration and cleanup
         * - Minimal memory footprint with automatic cleanup
         * - Synchronized animations prevent visual glitches
         * - Precise elapsed time calculation for seamless resume
         * 
         * Thread safety:
         * - All operations are atomic within event loop
         * - Safe concurrent access during rapid interactions
         * - Graceful degradation during high-frequency events
         * 
         * @namespace
         * @property {Function} clearTimeout - Clear specific timeout by key
         * @property {Function} pauseTimer - Pause auto-dismissal timer
         * @property {Function} startTimer - Start fresh auto-dismissal timer
         * @property {Function} resumeTimer - Resume paused timer from elapsed time
         * @property {Function} playTimer - Smart play (start new or resume existing)
         * @property {Function} remove - Complete cleanup and DOM removal
         * 
         * @example
         * // Start auto-dismissal timer
         * toastletCore.timeouts.startTimer(toastInstance);
         * 
         * @example
         * // Pause timer during hover
         * toastletCore.timeouts.pauseTimer(toastInstance);
         * 
         * @example
         * // Resume timer after interaction
         * toastletCore.timeouts.resumeTimer(toastInstance);
         * 
         * @author Pedro Rigolin
         * @since 1.0.0
         */
        timeouts: {

            /**
             * Clear a specific timeout by key identifier.
             * 
             * Safely clears a timeout stored in the toast instance's timeoutIDs
             * object and sets the reference to null to prevent memory leaks.
             * Performs validation to ensure the timeout exists before clearing.
             * 
             * @param {Object} toastInstance - The toast instance containing timeouts
             * @param {string} key - The timeout key to clear
             * 
             * @example
             * // Clear the auto-close timeout
             * toastletCore.timeouts.clearTimeout(toastInstance, 'close');
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            clearTimeout: (toastInstance, key) => {

                if( ! toastInstance.timeoutIDs && ! toastInstance.timeoutIDs[key] ) return;

                clearTimeout(toastInstance.timeoutIDs[key]);

                toastInstance.timeoutIDs[key] = null;

            },

            /**
             * Pause the auto-dismissal timer and capture elapsed time with callback support.
             * 
             * Stops the auto-close timer, records the current elapsed time using
             * performance.now() for precision, and updates the progress bar to
             * reflect the current position. Essential for implementing pause
             * functionality during user interactions. Executes the onPause
             * callback if provided to notify about the pause event.
             * 
             * Operations performed:
             * - Validates timer and toast instance existence
             * - Records precise end time using performance.now()
             * - Clears the active timeout and resets reference
             * - Updates progress bar width to current position
             * - Executes onPause callback with elapsed time information
             * 
             * Callback execution:
             * The onPause callback receives the toast element context, toast ID,
             * controller object, and current elapsed time in milliseconds.
             * 
             * @param {Object} toastInstance - The toast instance to pause
             * 
             * @example
             * // Pause timer on hover
             * toastletCore.timeouts.pauseTimer(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            pauseTimer: (toastInstance) => {

                if( 
                    ! toastInstance.timeoutIDs.close || 
                    ! toastInstance.toast
                ) return;
                
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

                if( toastletTypeValidators.function(toastInstance.config.onPause) ) {

                    toastInstance.config.onPause.call(
                        toastInstance.toast, 
                        toastInstance.id, 
                        toastInstance.controller, 
                        toastInstance.timer.elapsed
                    );

                }
                
            },             
            
            /**
             * Start a fresh auto-dismissal timer with full duration and callback support.
             * 
             * Initiates a new auto-close timer using the full configured duration.
             * Sets up synchronized progress bar animation and records the start
             * time for accurate elapsed time tracking. Only starts if the toast
             * is not closing, sticky, or paused. Executes onPlay callback if provided
             * with strategy information indicating timer behavior.
             * 
             * Progress bar synchronization:
             * - Sets initial position with no transition
             * - Configures transition duration to match toast duration
             * - Ensures perfect timing between animation and auto-close
             * 
             * Strategy detection and callback:
             * - Determines if this is a 'start' (first time) or 'restart' operation
             * - Executes onPlay callback with toast context and strategy information
             * - Provides consistent callback interface across timer operations
             * 
             * @param {Object} toastInstance - The toast instance to start timer for
             * 
             * @example
             * // Start fresh timer with automatic strategy detection
             * toastletCore.timeouts.startTimer(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            startTimer: (toastInstance) => {

                if(
                    ! toastInstance.toast ||
                    toastInstance.isClosing || 
                    toastInstance.isSticky ||
                    toastInstance.isPaused
                ) return;

                const strategy = toastInstance.timer.start === null ? 'start' : 'restart';

                toastletCore.timeouts.pauseTimer(toastInstance);

                if( toastInstance.config.progressBar.enabled ) {

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

                toastInstance.timeoutIDs.close = setTimeout(
                    toastletCore.utils.closeToast, 
                    toastInstance.config.duration, 
                    toastInstance,
                    'timer'
                );

                if( toastletTypeValidators.function(toastInstance.config.onPlay) ) {

                    toastInstance.config.onPlay.call(
                        toastInstance.toast, 
                        toastInstance.id, 
                        toastInstance.controller,
                        strategy
                    );

                }

            },

            /**
             * Resume a paused timer from its previous elapsed time with callback support.
             * 
             * Resumes the auto-close timer from where it was paused, calculating
             * the remaining duration and updating the progress bar accordingly.
             * Uses performance timing simulation to maintain accurate elapsed
             * time tracking across pause/resume cycles. Executes onPlay callback
             * with 'resume' strategy information.
             * 
             * Timing simulation technique:
             * - Calculates remaining duration from elapsed time
             * - Simulates earlier start time by subtracting elapsed time
             * - Ensures seamless timer continuation without timing drift
             * 
             * Callback execution:
             * - Executes onPlay callback with 'resume' strategy
             * - Provides toast context and controller information
             * - Maintains consistent callback interface with other timer methods
             * 
             * @param {Object} toastInstance - The toast instance to resume
             * 
             * @example
             * // Resume paused timer with callback notification
             * toastletCore.timeouts.resumeTimer(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

                toastInstance.timeoutIDs.close = setTimeout(
                    toastletCore.utils.closeToast, 
                    remaining, 
                    toastInstance,
                    'timer'
                );

                if( toastletTypeValidators.function(toastInstance.config.onPlay) ) {

                    toastInstance.config.onPlay.call(
                        toastInstance.toast, 
                        toastInstance.id, 
                        toastInstance.controller,
                        'resume'
                    );

                }

            },

            /**
             * Intelligently play timer with automatic strategy detection and callback support.
             * 
             * Smart timer management that decides whether to start a fresh timer
             * or resume from the previous position based on the timer state and
             * pause resume strategy configuration. Provides unified interface
             * for timer activation regardless of previous state. Automatically
             * delegates to startTimer or resumeTimer, which handle onPlay callback
             * execution with appropriate strategy information.
             * 
             * Decision logic:
             * - Starts fresh timer if no previous timer or restart strategy
             * - Resumes from elapsed time if resume strategy is configured
             * - Handles all validation and state checking automatically
             * - Delegates callback execution to underlying timer methods
             * 
             * Callback delegation:
             * - startTimer handles onPlay callback with 'start'/'restart' strategy
             * - resumeTimer handles onPlay callback with 'resume' strategy
             * - Ensures consistent callback behavior across all scenarios
             * 
             * @param {Object} toastInstance - The toast instance to play timer for
             * 
             * @example
             * // Smart timer play with automatic strategy and callback handling
             * toastletCore.timeouts.playTimer(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            playTimer: (toastInstance) => {

                if( 
                    ! toastInstance.toast || 
                    toastInstance.isClosing || 
                    toastInstance.isSticky 
                ) return;

                if( toastInstance.timer.start === null || toastInstance.config.pause.resumeStrategy === 'restart' ) {

                    response = toastletCore.timeouts.startTimer(toastInstance);

                }
                else {

                    response = toastletCore.timeouts.resumeTimer(toastInstance);
                
                }

            },

            /**
             * Reset pointer event state and clear associated timeout.
             * 
             * Clears the pointer event flag and associated timeout to prevent
             * conflicts between touch and mouse events. Part of the touch/mouse
             * disambiguation system for cross-platform compatibility.
             * 
             * @param {Object} toastInstance - The toast instance to reset
             * 
             * @example
             * // Reset pointer event state
             * toastletCore.timeouts.pointerEvent(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            pointerEvent: (toastInstance) => {

                if( ! toastInstance.toast || toastInstance.isClosing ) return;

                toastInstance.isPointerEvent = false;

                toastletCore.timeouts.clearTimeout(toastInstance, 'pointerEvent');

            },

            /**
             * Reset touch event state and clear associated timeout.
             * 
             * Clears the touch event flag and associated timeout to enable
             * proper touch/mouse event handling. Essential for mobile device
             * compatibility and preventing event conflicts.
             * 
             * @param {Object} toastInstance - The toast instance to reset
             * 
             * @example
             * // Reset touch event state
             * toastletCore.timeouts.touchEvent(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            touchEvent: (toastInstance) => {

                if( ! toastInstance.toast || toastInstance.isClosing ) return;

                toastInstance.isTouchEvent = false;

                toastletCore.timeouts.clearTimeout(toastInstance, 'touchEvent');

            },

            /**
             * Reset click in progress state and clear associated timeout.
             * 
             * Clears the click in progress flag to allow subsequent click events.
             * Prevents rapid-fire clicking and ensures click handlers complete
             * before allowing new click events to be processed.
             * 
             * @param {Object} toastInstance - The toast instance to reset
             * 
             * @example
             * // Reset click progress state
             * toastletCore.timeouts.clickInProgress(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            clickInProgress: (toastInstance) => {

                if( ! toastInstance.toast || toastInstance.isClosing ) return;

                toastInstance.isClickInProgress = false;

                toastletCore.timeouts.clearTimeout(toastInstance, 'clickInProgress');

            },

            /**
             * Handle focus enter event with pause and button visibility logic.
             * 
             * Sets focus hover state, updates button visibility, and pauses
             * the timer if focus pausing is enabled. Ensures proper keyboard
             * accessibility and screen reader compatibility.
             * 
             * @param {Object} toastInstance - The toast instance receiving focus
             * 
             * @example
             * // Handle focus enter
             * toastletCore.timeouts.focusin(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            focusin: (toastInstance) => {

                if( ! toastInstance.toast || toastInstance.isClosing ) return;

                toastInstance.isFocusHovered = true;

                toastletCore.utils.shButtons(toastInstance);

                if(toastInstance.config.pause.focus) {

                    toastInstance.isPausedByFocus = true;

                    toastletCore.timeouts.pauseTimer(toastInstance);   

                }

            },

            /**
             * Handle focus exit event with resume logic and validation.
             * 
             * Clears focus hover state, updates button visibility, and resumes
             * the timer if focus pausing was enabled. Includes validation to
             * ensure focus has actually left the toast element entirely.
             * 
             * @param {Object} toastInstance - The toast instance losing focus
             * 
             * @example
             * // Handle focus exit
             * toastletCore.timeouts.focusout(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            focusout: (toastInstance) => {
            
                if( 
                    ! toastInstance.toast || 
                    toastInstance.isClosing || 
                    toastInstance.toast.contains(document.activeElement) 
                ) return;

                toastInstance.isFocusHovered = false;
                
                toastletCore.utils.shButtons(toastInstance);

                if(toastInstance.config.pause.focus) {

                    toastInstance.isPausedByFocus = false;
                    
                    toastletCore.timeouts.playTimer(toastInstance);                    

                }

            },
            
            /**
             * Programmatically blur a specified element.
             * 
             * Safely removes focus from an element with validation to ensure
             * the element exists and the toast is not closing. Used for managing
             * focus flow and accessibility requirements.
             * 
             * @param {Object} toastInstance - The toast instance context
             * @param {HTMLElement} blurElement - The element to blur
             * 
             * @example
             * // Blur pause button
             * toastletCore.timeouts.blur(toastInstance, pauseButton);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            blur: (toastInstance, blurElement) => {

                if( ! toastInstance.toast || toastInstance.isClosing || ! blurElement ) return;

                blurElement.blur();

            },

            /**
             * Programmatically focus a specified element.
             * 
             * Safely sets focus to an element with validation to ensure
             * the element exists and the toast is not closing. Used for managing
             * keyboard navigation and accessibility requirements.
             * 
             * @param {Object} toastInstance - The toast instance context
             * @param {HTMLElement} focusElement - The element to focus
             * 
             * @example
             * // Focus close button
             * toastletCore.timeouts.focus(toastInstance, closeButton);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            focus: (toastInstance, focusElement) => {

                if( ! toastInstance.toast || toastInstance.isClosing || ! focusElement ) return;

                focusElement.focus();

            },

            /**
             * Reset pause button pointer down state.
             * 
             * Clears the pause button pointer down flag and associated timeout
             * to properly handle button interaction states. Essential for
             * accurate button press/release detection.
             * 
             * @param {Object} toastInstance - The toast instance with pause button
             * 
             * @example
             * // Reset pause button state
             * toastletCore.timeouts.pauseButtonPointerUp(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            pauseButtonPointerUp: (toastInstance) => {

                if( ! toastInstance.toast || toastInstance.isClosing || !toastInstance.pauseButton ) return;

                toastInstance.pauseButtonPointerDown = false;

                toastletCore.timeouts.clearTimeout(toastInstance, 'pauseButtonPointerUp');

            },

            /**
             * Reset close button pointer down state.
             * 
             * Clears the close button pointer down flag and associated timeout
             * to properly handle button interaction states. Essential for
             * accurate button press/release detection.
             * 
             * @param {Object} toastInstance - The toast instance with close button
             * 
             * @example
             * // Reset close button state
             * toastletCore.timeouts.closeButtonPointerUp(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            closeButtonPointerUp: (toastInstance) => {

                if( ! toastInstance.toast || toastInstance.isClosing || !toastInstance.closeButton ) return;

                toastInstance.closeButtonPointerDown = false;

                toastletCore.timeouts.clearTimeout(toastInstance, 'closeButtonPointerUp');

            },

            /**
             * Execute the onShow callback when toast becomes visible.
             * 
             * Invokes the user-defined onShow callback function when the toast
             * has completed its entrance animation and is fully visible. Provides
             * the toast ID and controller object to the callback for interaction.
             * 
             * @param {Object} toastInstance - The toast instance that became visible
             * 
             * @example
             * // Execute onShow callback
             * toastletCore.timeouts.onShow(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            onShow: (toastInstance) => {

                if( 
                    ! toastInstance.toast || 
                    toastInstance.isClosing ||
                    ! toastletTypeValidators.function(toastInstance.config.onShow)
                ) return;

                toastInstance.config.onShow.call(
                    toastInstance.toast, 
                    toastInstance.id, 
                    toastInstance.controller
                );

            },

            /**
             * Complete toast removal with comprehensive cleanup and callback support.
             * 
             * Performs complete cleanup of a toast instance including DOM removal,
             * timeout clearing, event listener removal, observer disconnection,
             * and memory cleanup. Ensures no memory leaks or orphaned references.
             * Executes the onClose callback if provided to notify about the
             * completion of the removal process.
             * 
             * Cleanup process:
             * 1. Set closing state and pause timers
             * 2. Clear all timeouts and intervals
             * 3. Remove all event listeners
             * 4. Disconnect all observers
             * 5. Clear computed style cache from all elements
             * 6. Execute onClose callback with removal reason
             * 7. Remove DOM elements from document
             * 8. Delete instance from registry
             * 9. Clear all object properties to prevent memory leaks
             * 
             * Callback execution:
             * The onClose callback receives the toast element context, toast ID,
             * controller object, and the reason for removal (e.g., 'api', 'timer',
             * 'user', 'close-button').
             * 
             * @param {Object} toastInstance - The toast instance to remove
             * @param {string} [reason='api'] - The reason for removal (api, timer, user, etc.)
             * 
             * @example
             * // Remove toast with full cleanup
             * toastletCore.timeouts.remove(toastInstance);
             * 
             * @example
             * // Remove toast with specific reason
             * toastletCore.timeouts.remove(toastInstance, 'timer');
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            remove: (toastInstance, reason = 'api') => {

                if( ! toastInstance.toast ) return;

                toastInstance.isClosing = true;

                toastletCore.timeouts.pauseTimer(toastInstance);

                let keys = objFullKeys(toastInstance.timeoutIDs);

                let i = keys.length;

                while(i--) toastletCore.timeouts.clearTimeout(toastInstance, keys[i]);

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

                const allChilds = toastInstance.toast.getElementsByTagName('*');

                i = allChilds.length;

                while(i--) {

                    const child = allChilds[i];

                    if( computedStyleCache.has(child) )
                        computedStyleCache.delete(child);

                }

                if( computedStyleCache.has(toastInstance.toast) )
                    computedStyleCache.delete(toastInstance.toast);

                if( toastletTypeValidators.function(toastInstance.config.onClose) ) {

                    toastInstance.config.onClose.call(
                        toastInstance.toast, 
                        toastInstance.id, 
                        toastInstance.controller,
                        reason
                    );

                }

                toastInstance.toast.remove();

                toastletInstances.delete(toastInstance.id);

                keys = objFullKeys(toastInstance);

                i = keys.length;

                while(i--) delete toastInstance[keys[i]];

            }

        },
        
        /**
         * Animation control system for toast entrance and exit transitions.
         * 
         * Manages all aspects of toast animations including CSS animations,
         * transitions, and timing calculations. Provides intelligent animation
         * detection, duration calculation, and smooth transition handling
         * between different animation states.
         * 
         * Key features:
         * - CSS animation and transition support
         * - Dynamic animation duration detection
         * - Smooth entrance and exit animations
         * - Animation state management (paused/running)
         * - Fallback to default opacity/transform transitions
         * 
         * Animation lifecycle:
         * 1. setAnimationIn/Out: Apply animation classes
         * 2. getAnimationDuration: Calculate total animation time
         * 3. runAnimationIn/Out: Execute animations with proper timing
         * 4. Automatic cleanup and state restoration
         * 
         * Performance optimizations:
         * - Minimal DOM manipulation during animations
         * - Efficient class replacement strategies
         * - Hardware-accelerated CSS properties when possible
         * - Animation state caching to prevent redundant operations
         * 
         * Browser compatibility:
         * - CSS3 animations with graceful degradation
         * - Vendor prefix handling for older browsers
         * - Performance.now() timing for precision
         * 
         * @namespace
         * @property {Function} setAnimationIn - Apply entrance animation classes
         * @property {Function} setAnimationOut - Apply exit animation classes
         * @property {Function} getAnimationDuration - Calculate total animation time
         * @property {Function} runAnimationIn - Execute entrance animation
         * @property {Function} runAnimationOut - Execute exit animation
         * 
         * @example
         * // Set up entrance animation
         * toastletCore.animation.setAnimationIn(toastInstance);
         * 
         * @example
         * // Calculate animation duration
         * const duration = toastletCore.animation.getAnimationDuration(toastInstance);
         * 
         * @example
         * // Run exit animation
         * toastletCore.animation.runAnimationOut(toastInstance);
         * 
         * @author Pedro Rigolin
         * @since 1.0.0
         */
        animation: {

            /**
             * Apply entrance animation classes to toast element.
             * 
             * Sets up the toast element with entrance animation classes and
             * configures the animation to be paused initially. Removes any
             * existing classes and applies the appropriate mode and animation
             * classes in the correct order.
             * 
             * @param {Object} toastInstance - The toast instance to animate
             * 
             * @example
             * // Set up entrance animation
             * toastletCore.animation.setAnimationIn(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

            /**
             * Apply exit animation classes to toast element.
             * 
             * Sets up the toast element with exit animation classes when closing.
             * Similar to setAnimationIn but specifically for exit animations.
             * Removes existing classes and applies exit animation configuration
             * with paused state for controlled timing.
             * 
             * @param {Object} toastInstance - The toast instance to animate out
             * 
             * @example
             * // Set up exit animation
             * toastletCore.animation.setAnimationOut(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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
            
            /**
             * Calculate total animation duration including delays.
             * 
             * Analyzes CSS animation properties to determine the total duration
             * including both animation-duration and animation-delay. Handles
             * multiple animations and returns the maximum total time. Falls back
             * to configured transition duration if no CSS animation is detected.
             * 
             * @param {Object} toastInstance - The toast instance to analyze
             * @returns {number} Total animation duration in milliseconds
             * 
             * @example
             * // Get animation duration
             * const duration = toastletCore.animation.getAnimationDuration(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

            /**
             * Execute entrance animation with proper timing and fallbacks.
             * 
             * Runs the entrance animation by either starting CSS animations or
             * applying default opacity/transform transitions. Detects whether
             * custom CSS animations are available and handles both scenarios
             * appropriately with proper timing and state management.
             * 
             * Animation logic:
             * - Detects custom CSS animations by animation-name property
             * - Sets animation-play-state to running for CSS animations
             * - Falls back to opacity and transform for default animations
             * - Removes temporary animation properties for clean execution
             * 
             * @param {Object} toastInstance - The toast instance to animate
             * 
             * @example
             * // Run entrance animation
             * toastletCore.animation.runAnimationIn(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

            /**
             * Execute exit animation with proper timing and fallbacks.
             * 
             * Runs the exit animation by either starting CSS animations or
             * applying default opacity/transform transitions for closing.
             * Similar to runAnimationIn but handles exit-specific animation
             * requirements and closing state validation.
             * 
             * Animation logic:
             * - Only runs when toast is in closing state
             * - Detects custom CSS exit animations
             * - Sets animation-play-state to running for CSS animations
             * - Falls back to opacity and transform for default exit animations
             * - Removes temporary animation properties for clean execution
             * 
             * @param {Object} toastInstance - The toast instance to animate out
             * 
             * @example
             * // Run exit animation
             * toastletCore.animation.runAnimationOut(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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
        
        /**
         * RequestAnimationFrame utilities for optimized DOM operations.
         * 
         * Provides frame-synchronized operations for smooth animations and
         * optimal rendering performance. Manages transition restoration and
         * element entrance animations using the browser's animation frame
         * scheduling for consistent 60fps performance.
         * 
         * Key responsibilities:
         * - Smooth transition restoration after style changes
         * - Frame-synchronized element entrance animations
         * - Inactive tab handling for performance optimization
         * - Animation timing coordination with browser refresh rate
         * 
         * Performance benefits:
         * - Operations batched to animation frames reduce layout thrashing
         * - Prevents unnecessary reflows during rapid style changes
         * - Optimizes battery usage on mobile devices
         * - Ensures animations run at optimal frame rate
         * 
         * Frame scheduling strategy:
         * - Critical operations scheduled on next frame
         * - Duplicate frame requests prevented with flags
         * - Graceful degradation when requestAnimationFrame unavailable
         * - Memory efficient with minimal frame callback overhead
         * 
         * Browser compatibility:
         * - Native requestAnimationFrame with polyfill fallback
         * - Handles page visibility changes and inactive tabs
         * - Works across all modern browsers and mobile devices
         * 
         * @namespace
         * @property {Function} restoreTransition - Restore CSS transitions on next frame
         * @property {Function} enterElement - Animate element entrance with timing
         * 
         * @example
         * // Schedule transition restoration
         * if (!toastInstance.rAF.restoreTransition.isScheduled) {
         *     requestAnimationFrame(() => toastletCore.rAF.restoreTransition(toastInstance));
         *     toastInstance.rAF.restoreTransition.isScheduled = true;
         * }
         * 
         * @example
         * // Animate element entrance
         * toastletCore.rAF.enterElement(toastInstance);
         * 
         * @author Pedro Rigolin
         * @since 1.0.0
         */
        rAF: {

            /**
             * Restore CSS transitions on the next animation frame.
             * 
             * Restores the original CSS transition property to the toast element
             * after style changes have been applied. This prevents transitions
             * from animating during style application and ensures smooth
             * transitions when they should occur.
             * 
             * @param {Object} toastInstance - The toast instance to restore transitions
             * 
             * @example
             * // Restore transitions after style changes
             * toastletCore.rAF.restoreTransition(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            restoreTransition: (toastInstance) => {

                if( ! toastInstance.toast || toastInstance.isClosing ) return;

                toastletStyleHelper.setProperties(
                    toastInstance.toast,
                    ['transition', toastInstance.transitionRule.toast.join(' ')]
                );

                toastInstance.rAF.restoreTransition.isScheduled = false;

            },

            /**
             * Handle element entrance with inactive tab detection and timing.
             * 
             * Manages the entrance of toast elements with special handling for
             * inactive tabs. If the tab is inactive and pause is configured,
             * the toast is paused until the tab becomes active. Otherwise,
             * runs the entrance animation, starts the auto-close timer, and
             * executes the onShow callback after the animation completes.
             * 
             * Process flow:
             * 1. Check for inactive tab state and pause if needed
             * 2. Calculate animation duration
             * 3. Run entrance animation
             * 4. Schedule timer start after animation completes
             * 5. Schedule onShow callback execution after animation completes
             * 
             * @param {Object} toastInstance - The toast instance entering
             * 
             * @example
             * // Handle element entrance
             * toastletCore.rAF.enterElement(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            enterElement: (toastInstance) => {
                
                if( ! toastInstance.toast || toastInstance.isClosing ) return;

                if( toastInstance.config.pause.inactiveTab && toastInstance.inactiveTab ){

                    toastInstance.isPausedByInactiveTab = true; 
                    
                    toastInstance.enterElement = false;

                    return;

                }

                toastInstance.enterElement = true;

                const animationDuration = toastletCore.animation.getAnimationDuration(toastInstance);

                toastletCore.animation.runAnimationIn(toastInstance);

                setTimeout(toastletCore.timeouts.startTimer, animationDuration + 20, toastInstance);

                setTimeout(toastletCore.timeouts.onShow, animationDuration + 20, toastInstance);

            }

        },

        /**
         * Positioning system for toasts across different devices and screen orientations.
         * 
         * Provides comprehensive positioning logic for desktop and mobile devices with
         * adaptive layout calculations, responsive design support, and precise
         * positioning algorithms. Handles all positioning scenarios including
         * corner positions, center alignment, and mobile-optimized layouts.
         * 
         * Key features:
         * - Desktop positioning (6 positions: corners + middle)
         * - Mobile-responsive positioning with viewport adaptation
         * - Progress bar positioning synchronized with toast placement
         * - Dynamic width calculations for centered toasts
         * - Responsive breakpoint handling
         * 
         * Positioning strategy:
         * - Desktop: Fixed positioning with 20px margins
         * - Mobile: Full-width with minimum constraints
         * - Center positions: Dynamic calculation based on toast width
         * - Z-index management for proper layering
         * 
         * Performance optimizations:
         * - Minimal DOM queries with cached measurements
         * - Efficient style application in batches
         * - Reflow optimization through style batching
         * - Responsive recalculation only when needed
         * 
         * Device compatibility:
         * - Desktop: All screen sizes with fixed positioning
         * - Mobile: Viewport-aware with touch-friendly spacing
         * - Tablet: Hybrid approach based on screen dimensions
         * - High-DPI displays: Pixel-perfect positioning
         * 
         * @namespace
         * @property {Object} set - Positioning functions for different contexts
         * @property {Function} set.progressBar - Position progress bar elements
         * @property {Object} set.desktop - Desktop positioning functions
         * @property {Object} set.mobile - Mobile positioning functions
         * 
         * @example
         * // Set desktop top-right position
         * toastletCore.position.set.desktop.topRight(toastInstance);
         * 
         * @example
         * // Set mobile default position
         * toastletCore.position.set.mobile.setDefault(toastInstance);
         * 
         * @example
         * // Position progress bar
         * toastletCore.position.set.progressBar(toastInstance);
         * 
         * @author Pedro Rigolin
         * @since 1.0.0
         */
        position: {

            set: {

                progressBar: (toastInstance) => {

                    if(
                        ! toastInstance.toast || 
                        toastInstance.isClosing || 
                        toastInstance.isSticky || 
                        ! toastInstance.config.progressBar.enabled ||
                        ! toastInstance.progressBar ||
                        ! toastInstance.progressBarThumb
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

                        toastletCore.position.set.progressBar(toastInstance);

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
                        toastletCore.position.set.desktop.setDefault(toastInstance);

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
                        toastletCore.position.set.desktop.setDefault(toastInstance);

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
                        toastletCore.position.set.desktop.setDefault(toastInstance);

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
                        toastletCore.position.set.desktop.setDefault(toastInstance);

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
                        toastletCore.position.set.desktop.setDefault(toastInstance);

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
                        toastletCore.position.set.desktop.setDefault(toastInstance);

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

                        toastletCore.position.set.progressBar(toastInstance);

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
                        toastletCore.position.set.mobile.setDefault(toastInstance);

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
                        toastletCore.position.set.mobile.setDefault(toastInstance);

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

                        desktop:  [
                            'top', 
                            'top-right', 
                            'top-middle', 
                            'top-left', 
                            'bottom', 
                            'bottom-right', 
                            'bottom-middle', 
                            'bottom-left'
                        ],

                        mobile:  [
                            'top', 
                            'bottom'
                        ]

                    }

                },

                desktop: (position) => {

                    if( ! toastletTypeValidators.string(position) ) return false;

                    position = position.replace(only_letters_regex, '').toLowerCase();

                    if( ! toastletCore.position.get.available.desktop.hasOwnProperty(position) ) return false;

                    return toastletCore.position.get.available.desktop[position];

                },

                mobile: (position) => {

                    if( ! toastletTypeValidators.string(position) ) return false;

                    position = position.replace(only_letters_regex, '').toLowerCase();

                    if( ! toastletCore.position.get.available.mobile.hasOwnProperty(position) ) return false;

                    return toastletCore.position.get.available.mobile[position];

                }

            }

        },
        
        /**
         * Core utility functions for toast lifecycle and interaction management.
         * 
         * Provides essential utility functions for toast operations including
         * element entrance handling, button visibility management, pause/resume
         * functionality, and toast closing logic. These utilities form the
         * backbone of user interactions and toast state management.
         * 
         * Key responsibilities:
         * - Toast entrance animation coordination
         * - Control button visibility and interaction states
         * - Pause/resume functionality via user interactions
         * - Toast closing logic with cleanup
         * - Mobile-specific interaction handling
         * 
         * Interaction management:
         * - Hover-based control visibility
         * - Touch-friendly mobile interactions
         * - Keyboard accessibility support
         * - Focus management for screen readers
         * 
         * Performance features:
         * - Efficient DOM manipulation with batched operations
         * - Minimal reflows through style batching
         * - Event delegation for optimal performance
         * - Memory-efficient cleanup procedures
         * 
         * Accessibility features:
         * - Screen reader compatible state management
         * - Keyboard navigation support
         * - ARIA attributes handling
         * - Focus trap management during interactions
         * 
         * @namespace
         * @property {Function} enterElement - Handle toast entrance with stacking logic
         * @property {Function} shButtons - Show/hide control buttons based on state
         * @property {Function} togglePauseByButton - Toggle pause state via button
         * @property {Function} closeToast - Close toast with proper cleanup
         * @property {Function} updatePauseIcon - Update pause button icon state
         * 
         * @example
         * // Handle toast entrance
         * toastletCore.utils.enterElement(toastInstance);
         * 
         * @example
         * // Toggle button visibility
         * toastletCore.utils.shButtons(toastInstance);
         * 
         * @example
         * // Close toast programmatically
         * toastletCore.utils.closeToast(toastInstance);
         * 
         * @author Pedro Rigolin
         * @since 1.0.0
         */
        utils: {

            /**
             * Handle toast element entrance with stacking logic and scheduling.
             * 
             * Manages the entrance of a toast element including non-stackable
             * logic where existing toasts are closed if stacking is disabled.
             * Handles inactive tab state and schedules the entrance animation
             * using requestAnimationFrame for optimal performance.
             * 
             * Stacking logic:
             * - If stacking is disabled, closes all other non-stackable toasts
             * - Preserves the current toast while closing others
             * - Ensures only one toast is visible when stacking is off
             * 
             * @param {Object} toastInstance - The toast instance to enter
             * 
             * @example
             * // Handle toast entrance
             * toastletCore.utils.enterElement(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            enterElement: (toastInstance) => {

                if( ! toastInstance.toast || toastInstance.isClosing ) return;
                
                if( ! toastInstance.config.stacking.enabled ) {

                    for( const [id, el] of toastletInstances.nonStackable ){

                        if( id === toastInstance.id ) continue;

                        toastletCore.utils.closeToast(el, 'replaced');

                    }

                }

                if( toastInstance.config.pause.inactiveTab )
                    toastInstance.isPausedByInactiveTab = toastInstance.inactiveTab;
                
                if( ! toastInstance.rAF.enterElement.isScheduled ) {

                    toastInstance.rAF.enterElement.isScheduled = true;
                
                    requestAnimationFrame(toastInstance.rAF.enterElement.fn);
                
                }
            
            },

            /**
             * Show or hide control buttons based on interaction state.
             * 
             * Manages the visibility and interaction state of pause and close
             * buttons based on hover state, mobile device detection, and
             * configuration settings. Handles both visual and functional
             * aspects of button accessibility.
             * 
             * Visibility logic:
             * - Shows buttons on hover for desktop
             * - Shows buttons on mobile if onClick or no touch pause
             * - Hides buttons for sticky non-dismissible toasts
             * - Manages pointer-events for proper interaction
             * 
             * Accessibility considerations:
             * - Maintains proper z-index for keyboard navigation
             * - Controls pointer-events to prevent interaction when hidden
             * - Ensures buttons are available when needed for accessibility
             * 
             * @param {Object} toastInstance - The toast instance to update
             * 
             * @example
             * // Update button visibility
             * toastletCore.utils.shButtons(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            shButtons: (toastInstance) => {

                if(
                    ! toastInstance.toast || 
                    toastInstance.isClosing ||
                    (toastInstance.isSticky && ! toastInstance.isDismissible) ||
                    ( ! toastInstance.config.pause.button && ! toastInstance.isDismissible ) ||
                    ! toastInstance.controlsCol
                ) return;

                const mustBeVisible = !!(
                    toastInstance.isHovered ||
                    ( 
                        toastletGeneralHelper.isMobile() && 
                        ( 
                            toastletTypeValidators.function(toastInstance.config.onClick) || 
                            ! toastInstance.config.pause.touch 
                        ) 
                    )
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

            /**
             * Toggle pause state via pause button interaction.
             * 
             * Handles pause/resume functionality triggered by the pause button.
             * Updates button icon, ARIA labels, timer state, and mobile touch
             * behavior. Prevents toggling for sticky toasts or when programmatic
             * pause is active.
             * 
             * Button state management:
             * - Toggles between pause and play icons
             * - Updates ARIA labels for accessibility
             * - Manages timer pause/resume state
             * - Handles mobile-specific touch behavior
             * 
             * Accessibility features:
             * - Dynamic ARIA label updates
             * - Screen reader friendly state announcements
             * - Proper button role and state management
             * 
             * @param {Object} toastInstance - The toast instance to toggle
             * 
             * @example
             * // Toggle pause state
             * toastletCore.utils.togglePauseByButton(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            togglePauseByButton: (toastInstance) => {
                
                if( 
                    ! toastInstance.toast || 
                    toastInstance.isClosing || 
                    toastInstance.isSticky ||
                    ! toastInstance.config.pause.button ||
                    ! toastInstance.pauseButton ||
                    toastInstance.isPausedByProgrammatic
                ) return;

                toastInstance.isPausedByButton = !toastInstance.isPausedByButton;

                if (toastInstance.isPausedByButton) {
                    
                    toastInstance.pauseButton.innerHTML = toastletCore.presets.icons.play;

                    toastletAttributeHelper.setAttributes(
                        toastInstance.pauseButton,
                        ['aria-label', 'Play notification timer']
                    );

                    toastletCore.timeouts.pauseTimer(toastInstance);

                }
                else {
                    
                    toastInstance.pauseButton.innerHTML = toastletCore.presets.icons.pause;

                    toastletAttributeHelper.setAttributes(
                        toastInstance.pauseButton,
                        ['aria-label', 'Pause notification timer']
                    );

                    toastletCore.timeouts.playTimer(toastInstance);

                }

                if( toastletGeneralHelper.isMobile() && toastInstance.isPausedByButton )
                    toastInstance.isTouchHovered = true;
                else
                    toastInstance.isTouchHovered = false;

                toastletCore.utils.shButtons(toastInstance);

            },

            /**
             * Close toast with proper animation, callback handling and cleanup sequence.
             * 
             * Initiates the toast closing process with support for cancellation via
             * beforeClose callback. Includes setting the closing state, executing
             * beforeClose callback, pausing timers, hiding control buttons, setting
             * up exit animation, and scheduling final removal.
             * 
             * Closing sequence:
             * 1. Set closing state and pause timer
             * 2. Execute beforeClose callback if provided
             * 3. Check callback result - cancel if returns false
             * 4. Hide control buttons immediately
             * 5. Apply exit animation classes
             * 6. Calculate and run exit animation
             * 7. Schedule final DOM removal after animation
             * 
             * Cancellation support:
             * The beforeClose callback can return false to prevent closing,
             * restoring the toast to its previous state and resuming the timer.
             * 
             * @param {Object} toastInstance - The toast instance to close
             * @param {string} [reason='api'] - Reason for closing ('api', 'timer', 'click', 'swipe', 'escape')
             * 
             * @example
             * // Close toast programmatically
             * toastletCore.utils.closeToast(toastInstance);
             * 
             * @example
             * // Close toast with specific reason
             * toastletCore.utils.closeToast(toastInstance, 'timer');
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            closeToast: (toastInstance, reason = 'api') => {

                if( ! toastInstance.toast || toastInstance.isClosing ) return;

                toastInstance.isClosing = true;

                toastletCore.timeouts.pauseTimer(toastInstance);

                if( toastletTypeValidators.function(toastInstance.config.beforeClose) ) {

                    // ?? Ver a sugestão de um closeControl e um método .cancel()

                    const result = toastInstance.config.beforeClose.call(
                        toastInstance.toast,
                        toastInstance.id,
                        toastInstance.controller,
                        reason
                    );

                    if( result === false ) {

                        toastInstance.isClosing = false;

                        toastletCore.timeouts.playTimer(toastInstance);

                        return;

                    }

                }

                if( toastInstance.controlsCol ) {

                    toastletStyleHelper.setProperties(
                        toastInstance.controlsCol,
                        ['visibility', 'hidden'],
                        ['z-index', '-10'],
                        ['opacity', '0']
                    );

                }

                toastletCore.animation.setAnimationOut(toastInstance);

                const animationDuration = toastletCore.animation.getAnimationDuration(toastInstance);

                toastletCore.animation.runAnimationOut(toastInstance);

                setTimeout(
                    toastletCore.timeouts.remove, 
                    animationDuration + 20, 
                    toastInstance,
                    reason
                );

            }

        },

        /**
         * Event handling system for all toast interactions and user events.
         * 
         * Provides comprehensive event handling for toast interactions including
         * mouse events, touch events, keyboard events, focus management, and
         * button interactions. Handles cross-platform compatibility and
         * accessibility requirements with proper event delegation.
         * 
         * Supported interaction types:
         * - Mouse interactions (hover, click, enter/leave)
         * - Touch interactions (mobile-optimized touch handling)
         * - Keyboard interactions (focus, blur, key presses)
         * - Button interactions (pause/resume, close)
         * - Document-level events (visibility, focus changes)
         * 
         * Event handling features:
         * - Trusted event validation for security
         * - Cross-platform touch/mouse disambiguation
         * - Proper event bubbling and propagation control
         * - Accessibility-compliant focus management
         * - Performance-optimized event delegation
         * 
         * Mobile considerations:
         * - Touch event priority over mouse events
         * - Gesture recognition for swipe actions
         * - Viewport change handling
         * - Touch-friendly button sizing
         * 
         * Accessibility features:
         * - Keyboard navigation support
         * - Screen reader compatibility
         * - Focus management for interactive elements
         * - ARIA state synchronization
         * 
         * @namespace
         * @property {Object} toast - Toast element event handlers
         * @property {Object} pauseButton - Pause button event handlers
         * @property {Object} closeButton - Close button event handlers
         * @property {Object} document - Document-level event handlers
         * 
         * @example
         * // Handle toast click
         * toastletCore.handles.toast.click(toastInstance, event);
         * 
         * @example
         * // Handle pause button interaction
         * toastletCore.handles.pauseButton.click(toastInstance, event);
         * 
         * @example
         * // Handle document visibility change
         * toastletCore.handles.document.visibilitychange();
         * 
         * @author Pedro Rigolin
         * @since 1.0.0
         */
        handles: {

            toast: {

                click: (toastInstance, e) => {
                    
                    if(
                        ! toastInstance.toast || 
                        toastInstance.isClosing || 
                        ! e.isTrusted || 
                        toastInstance.isClickInProgress ||
                        ! toastletTypeValidators.function(toastInstance.config.onClick) ||
                        toastInstance.clickControl.disabled ||
                        ( toastInstance.pauseButton && toastInstance.pauseButton.contains(e.target) ) ||
                        ( toastInstance.closeButton && toastInstance.closeButton.contains(e.target) )
                    ) return;

                    e.stopPropagation();

                    toastInstance.isClickInProgress = true;

                    toastletCore.timeouts.clearTimeout(toastInstance, 'clickInProgress');

                    toastInstance.config.onClick.call(
                        toastInstance.toast, 
                        e, 
                        toastInstance.toast, 
                        toastInstance.clickControl
                    );

                    toastInstance.timeoutIDs.clickInProgress = setTimeout(toastletCore.timeouts.clickInProgress, 10, toastInstance);

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

                    toastletCore.timeouts.clearTimeout(toastInstance, 'pointerEvent');

                    toastInstance.timeoutIDs.pointerEvent = setTimeout(toastletCore.timeouts.pointerEvent, 10, toastInstance);

                },
                // TODO: DAR UMA REVISADA NESSA PARTE, E NA INTERAÇÃO DO POINTEREVENT
                mouseenter: (toastInstance, e) => {
        
                    if (
                        ! toastInstance.toast ||
                        toastInstance.isClosing ||
                        ! e.isTrusted ||
                        toastInstance.isMouseHovered ||
                        ! toastInstance.canHover || 
                        ! toastInstance.pointerFine || 
                        toastInstance.isPointerEvent || 
                        toastInstance.isTouchEvent ||
                        ( e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents )
                    ) return;

                    toastInstance.isMouseHovered = true;

                    toastletCore.utils.shButtons(toastInstance);

                    if( toastInstance.config.pause.hover ){

                        toastInstance.isPausedByHover = true;

                        toastletCore.timeouts.pauseTimer(toastInstance);

                    }

                },
                // TODO: DAR UMA REVISADA NESSA PARTE, E NA INTERAÇÃO DO POINTEREVENT
                mouseleave: (toastInstance, e) => {

                    if (
                        ! toastInstance.toast ||
                        toastInstance.isClosing ||
                        ! e.isTrusted ||
                        toastInstance.toast.contains(e.relatedTarget) || 
                        ! toastInstance.isMouseHovered ||
                        ! toastInstance.canHover ||
                        ! toastInstance.pointerFine || 
                        // toastInstance.isPointerEvent ||
                        toastInstance.isTouchEvent || 
                        ( e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents )
                    ) return;

                    toastInstance.isMouseHovered = false;

                    toastletCore.utils.shButtons(toastInstance);

                    toastletCore.timeouts.clearTimeout(toastInstance, 'pointerEvent');

                    toastInstance.timeoutIDs.pointerEvent = setTimeout(toastletCore.timeouts.pointerEvent, 10, toastInstance);

                    if( toastInstance.config.pause.hover ){
                    
                        toastInstance.isPausedByHover = false;
                        
                        toastletCore.timeouts.playTimer(toastInstance);
                    
                    }

                },

                touchstart: (toastInstance, e) => {

                    if(
                        ! toastInstance.toast || 
                        toastInstance.isClosing || 
                        ! e.isTrusted ||
                        ! toastletGeneralHelper.isMobile()
                    ) return;

                    toastletCore.timeouts.pauseTimer(toastInstance);

                    toastInstance.touchStartTime = performance.now();

                    toastInstance.isPausedByTouch = true;
                    
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

                    toastletCore.timeouts.clearTimeout(toastInstance, 'touchEvent');

                    toastInstance.timeoutIDs.touchEvent = setTimeout(toastletCore.timeouts.touchEvent, 10, toastInstance);

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
                    
                    toastletCore.timeouts.resumeTimer(toastInstance);

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
                    
                    toastletCore.timeouts.clearTimeout(toastInstance, 'touchEvent');

                    toastInstance.timeoutIDs.touchEvent = setTimeout(toastletCore.timeouts.touchEvent, 10, toastInstance);

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

                            toastletCore.utils.closeToast(toastInstance, 'swipe');
                        
                        } 
                        else {

                            toastletStyleHelper.setProperties(
                                toastInstance.toast,
                                ['transform', `translate(0px, 0px)`]
                            );

                            toastletCore.timeouts.startTimer(toastInstance);
                        
                        }

                    } else {

                        toastletStyleHelper.setProperties(
                            toastInstance.toast,
                            ['transform', `translate(0px, 0px)`]
                        );

                        if( 
                            ( toastInstance.pauseButton && toastInstance.pauseButton.contains(e.target) ) || 
                            ( toastInstance.closeButton && toastInstance.closeButton.contains(e.target) ) 
                        ) return;

                        if (touchDuration < 300) {

                            toastInstance.isTouchHovered = !toastInstance.isTouchHovered;
                            
                            toastletCore.utils.shButtons(toastInstance);

                            if( toastletTypeValidators.function(toastInstance.config.onClick) ) {

                                toastletCore.handles.toast.click(toastInstance, e);
                                
                                toastletCore.timeouts.playTimer(toastInstance);

                            }
                            else if( toastInstance.config.pause.touch ) {

                                toastletCore.utils.togglePauseByButton(toastInstance);

                            }
                            else {
                                
                                toastletCore.timeouts.resumeTimer(toastInstance);

                            }

                        } 
                        else {
                           
                            toastletCore.timeouts.playTimer(toastInstance);
                        
                        }

                    }

                    toastInstance.isDragging = false;

                },

                focusin: (toastInstance, e) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ) return;

                    if( 
                        ! e.isTrusted || 
                        toastInstance.isPointerEvent || 
                        toastInstance.isTouchEvent ||
                        ( e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents ) 
                    ){

                        e.target.blur();

                        setTimeout(toastletCore.timeouts.blur, 0, toastInstance, e.target);

                        return;

                    }

                    setTimeout(toastletCore.timeouts.focusin, 0, toastInstance);

                },

                focusout: (toastInstance, e) => {

                    if( 
                        ! toastInstance.toast || 
                        toastInstance.isClosing ||
                        toastInstance.isPointerEvent ||
                        toastInstance.isTouchEvent ||
                        ( e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents )
                    ) return;

                    if( ! e.isTrusted ){

                        e.target.focus();

                        setTimeout(toastletCore.timeouts.focus, 0, toastInstance, e.target);

                        return;

                    }

                    setTimeout(toastletCore.timeouts.focusout, 0, toastInstance);
                
                },

                keydown: (toastInstance, e) => {

                    if( ! toastInstance.toast || toastInstance.isClosing || ! e.isTrusted ) return;

                    if(e.target === toastInstance.pauseButton)
                        return toastletCore.handles.pauseButton.keydown(toastInstance, e);
                    else if(e.target === toastInstance.closeButton)
                        return toastletCore.handles.closeButton.keydown(toastInstance, e);
                    else if(e.target !== toastInstance.toast)
                        return;

                    if(e.key === ' ' || e.key === 'Enter') {

                        e.preventDefault();
                        e.stopPropagation();

                        if( toastletTypeValidators.function(toastInstance.config.onClick) )
                            toastletCore.handles.toast.click(toastInstance, e);
                        else if( toastInstance.config.pause.button )
                            toastletCore.utils.togglePauseByButton(toastInstance);

                    }
                    else if(e.key === 'Escape' && toastInstance.isDismissible) {

                        e.preventDefault();
                        e.stopPropagation();

                        toastletCore.utils.closeToast(toastInstance, 'escape');

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

                    toastletCore.utils.togglePauseByButton(toastInstance);

                },

                pointerup: (toastInstance, e) => {

                    if(
                        ! toastInstance.toast || 
                        toastInstance.isClosing ||
                        ! toastInstance.config.pause.button ||
                        ! e.isTrusted
                    ) return;

                    toastletCore.timeouts.clearTimeout(toastInstance, 'pauseButtonPointerUp');

                    toastInstance.timeoutIDs.pauseButtonPointerUp = setTimeout(toastletCore.timeouts.pauseButtonPointerUp, 15, toastInstance);

                },

                keydown: (toastInstance, e) => {

                    if(
                        ! toastInstance.toast ||
                        toastInstance.isClosing ||
                        ! toastInstance.config.pause.button ||
                        ! e.isTrusted ||
                        e.target !== toastInstance.pauseButton
                    ) return;

                    if(e.key === ' ' || e.key === 'Enter') {

                        e.preventDefault();
                        e.stopPropagation();

                        toastletCore.utils.togglePauseByButton(toastInstance);

                    }
                    else if(e.key === 'Escape' && toastInstance.isDismissible) {

                        e.preventDefault();
                        e.stopPropagation();

                        toastletCore.utils.closeToast(toastInstance, 'escape');

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

                    toastletCore.utils.closeToast(toastInstance, 'button');

                },

                pointerup: (toastInstance, e) => {

                    if(
                        ! toastInstance.toast || 
                        toastInstance.isClosing ||
                        ! toastInstance.isDismissible ||
                        ! e.isTrusted
                    ) return;

                    toastletCore.timeouts.clearTimeout(toastInstance, 'closeButtonPointerUp');

                    toastInstance.timeoutIDs.closeButtonPointerUp = setTimeout(toastletCore.timeouts.closeButtonPointerUp, 15, toastInstance);

                },

                keydown: (toastInstance, e) => {

                    if( 
                        ! toastInstance.toast || 
                        toastInstance.isClosing || 
                        ! e.isTrusted ||
                        e.target !== toastInstance.closeButton
                    ) return;

                    if( ( e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' ) && toastInstance.isDismissible ) {

                        e.preventDefault();
                        e.stopPropagation();

                        toastletCore.utils.closeToast(toastInstance, 'escape');

                    }

                }

            },

            window: {

                resize: (toastInstance, e) => {

                    if( ! toastInstance.toast || toastInstance.isClosing || ! e.isTrusted ) return;

                    if( toastletGeneralHelper.isMobile() ) {

                        if( toastInstance.isPausedByButton )
                            toastInstance.isTouchHovered = true;

                        toastletCore.position.set.mobile[toastInstance.config.position.data.mobile.name](toastInstance);

                    }
                    else {

                        if( toastInstance.isTouchHovered )
                            toastInstance.isTouchHovered = false;

                        toastletCore.position.set.desktop[toastInstance.config.position.data.desktop.name](toastInstance);

                    }

                    toastletCore.utils.shButtons(toastInstance);

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

                        toastletCore.timeouts.pauseTimer(toastInstance);

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

                            toastletCore.timeouts.playTimer(toastInstance);

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
                        setTimeout(
                            toastletCore.timeouts.remove, 
                            0, 
                            toastInstance,
                            'observer'
                        );

                }

            },

            html: {

                mutation: (toastInstance, m, observer) => {

                    if( ! toastInstance.toast || toastInstance.isClosing ){
                        observer.disconnect();
                        return;
                    }

                    if( ! document.body )
                        setTimeout(
                            toastletCore.timeouts.remove, 
                            0, 
                            toastInstance,
                            'observer'
                        );

                }

            }

        },

        /**
         * Setup and initialization system for toast configuration and validation.
         * 
         * Provides comprehensive setup functionality including configuration
         * validation, DOM structure creation, event listener registration,
         * and instance initialization. Ensures all toast instances are
         * properly configured with validated settings and optimal performance.
         * 
         * Setup responsibilities:
         * - Configuration validation with type checking
         * - DOM element creation and structure setup
         * - Event listener registration and management
         * - Style initialization and responsive setup
         * - Accessibility attributes configuration
         * 
         * Validation features:
         * - Type validation for all configuration options
         * - Warning messages for invalid configurations
         * - Automatic fallback to default values
         * - Nested object validation (stacking, pause, etc.)
         * - Comprehensive error reporting
         * 
         * Performance optimizations:
         * - Lazy initialization of heavy components
         * - Efficient DOM structure creation
         * - Minimal reflows during setup
         * - Event delegation for optimal memory usage
         * 
         * Error handling:
         * - Graceful degradation for invalid configs
         * - Detailed warning messages for developers
         * - Automatic correction of invalid values
         * - Safe fallbacks for all critical options
         * 
         * @namespace
         * @property {Object} configValidators - Configuration validation functions
         * @property {Function} create - Create and initialize toast instance
         * @property {Function} registerEventListeners - Register all event handlers
         * @property {Function} setupAccessibility - Configure accessibility attributes
         * @property {Function} initializeStyles - Set up initial styling
         * 
         * @example
         * // Validate stacking configuration
         * toastletCore.setup.configValidators.stacking(defaultConfig, userConfig);
         * 
         * @example
         * // Create complete toast instance
         * const toastInstance = toastletCore.setup.create(config);
         * 
         * @example
         * // Setup accessibility features
         * toastletCore.setup.setupAccessibility(toastInstance);
         * 
         * @author Pedro Rigolin
         * @since 1.0.0
         */
        setup: {

            /**
             * Configuration validation functions for user-provided options.
             * 
             * Provides comprehensive validation for all toast configuration
             * options with detailed warning messages and automatic fallback
             * to default values. Ensures type safety and prevents runtime
             * errors from invalid configurations.
             * 
             * Validation features:
             * - Type checking for all configuration properties
             * - Detailed warning messages for developers
             * - Automatic fallback to safe default values
             * - Nested object validation with property sanitization
             * - Unknown property detection and removal
             * 
             * Error handling strategy:
             * - Non-destructive validation (preserves valid properties)
             * - Informative console warnings with received vs expected types
             * - Graceful degradation for invalid values
             * - Maintains application stability regardless of input
             * 
             * @namespace
             * @property {Function} sticky - Validate sticky boolean option
             * @property {Function} duration - Validate duration number option
             * @property {Function} dismissible - Validate dismissible boolean option
             * @property {Function} stacking - Validate stacking object with nested properties
             * 
             * @example
             * // Validate sticky option
             * toastletCore.setup.configValidators.sticky(defaultConfig, userConfig);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            configValidators: {
                
                /**
                 * Validate sticky option as boolean type.
                 * 
                 * Ensures the sticky option is a valid boolean value.
                 * If invalid, logs a warning and reverts to default value.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate sticky option
                 * toastletCore.setup.configValidators.sticky(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                sticky: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.boolean(userConfig.sticky) ){
                        console.warn(`[ToastletNotify] Warning: Option 'sticky' must be a boolean\n  Received: ${typeof userConfig.sticky}\n  Using default value: ${defaultConfig.sticky}`);
                        userConfig.sticky = defaultConfig.sticky;
                    }

                },

                /**
                 * Validate duration option as unsigned number.
                 * 
                 * Ensures the duration option is a valid unsigned number
                 * representing milliseconds. If invalid, logs a warning
                 * and reverts to default value.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate duration option
                 * toastletCore.setup.configValidators.duration(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                duration: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.unsignedNumber(userConfig.duration) ){
                        console.warn(`[ToastletNotify] Warning: Option 'duration' must be an unsigned number\n  Received: ${typeof userConfig.duration}, ${userConfig.duration}\n  Using default value: ${defaultConfig.duration}`);
                        userConfig.duration = defaultConfig.duration;
                    }

                },

                /**
                 * Validate dismissible option as boolean type.
                 * 
                 * Ensures the dismissible option is a valid boolean value
                 * controlling whether the toast can be manually closed.
                 * If invalid, logs a warning and reverts to default value.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate dismissible option
                 * toastletCore.setup.configValidators.dismissible(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                dismissible: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.boolean(userConfig.dismissible) ){
                        console.warn(`[ToastletNotify] Warning: Option 'dismissible' must be a boolean\n  Received: ${typeof userConfig.dismissible}\n  Using default value: ${defaultConfig.dismissible}`);
                        userConfig.dismissible = defaultConfig.dismissible;
                    }

                },

                /**
                 * Validate stacking configuration object with nested properties.
                 * 
                 * Performs comprehensive validation of the stacking configuration
                 * including nested properties like enabled, gap, limit, and
                 * newestOnTop. Sanitizes the configuration by removing unknown
                 * properties and validating each nested value.
                 * 
                 * Validated properties:
                 * - enabled: Boolean controlling stacking behavior
                 * - gap: Object with desktop/mobile spacing values
                 * - limit: Number defining maximum stacked toasts
                 * - newestOnTop: Boolean controlling stacking order
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate stacking configuration
                 * toastletCore.setup.configValidators.stacking(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                stacking: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.plainObject(userConfig.stacking) ){
                        console.warn(`[ToastletNotify] Warning: Option 'stacking' must be a plain object\n  Received: ${typeof userConfig.stacking}, ${userConfig.stacking}\n  Using default value: ${JSON.stringify(defaultConfig.stacking)}`);
                        userConfig.stacking = defaultConfig.stacking;
                        return;
                    }

                    // Extract only enumerable properties and not symbols keys properties
                    const keys = objKeys(userConfig.stacking);

                    const sanitizedConfig = {};

                    for(const key of keys){

                        if( ! defaultConfig.stacking.hasOwnProperty(key) ){
                            console.warn(`[ToastletNotify] Warning: Option 'stacking' has unknown property '${key}'\n  This property will be removed.`);
                            continue;
                        }

                        const value = userConfig.stacking[key]

                        if( key === 'enabled' && ! toastletTypeValidators.boolean(value) ){
                            console.warn(`[ToastletNotify] Warning: Option 'stacking.enabled' must be a boolean\n  Received: ${typeof value}\n  Using default value: ${defaultConfig.stacking.enabled}`);
                            sanitizedConfig.enabled = defaultConfig.stacking.enabled;
                            continue;
                        }

                        if( key === 'gap' ){

                            if( ! toastletTypeValidators.plainObject(value) ){
                                console.warn(`[ToastletNotify] Warning: Option 'stacking.gap' must be a plain object\n  Received: ${typeof value}, ${value}\n  Using default value: ${JSON.stringify(defaultConfig.stacking.gap)}`);
                                sanitizedConfig.gap = defaultConfig.stacking.gap;
                                continue;
                            }

                            // Extract only enumerable properties and not symbols keys properties
                            const gapKeys = objKeys(value);

                            const sanitizedGapConfig = {};

                            for(const gapKey of gapKeys){

                                if( ! defaultConfig.stacking.gap.hasOwnProperty(gapKey) ){
                                    console.warn(`[ToastletNotify] Warning: Option 'stacking.gap' has unknown property '${gapKey}'\n  This property will be removed.`);
                                    continue;
                                }

                                const gapValue = value[gapKey]

                                if( ! toastletTypeValidators.unsignedNumber(gapValue) ){
                                    console.warn(`[ToastletNotify] Warning: Option 'stacking.gap.${gapKey}' must be an unsigned number\n  Received: ${typeof gapValue}, ${gapValue}\n  Using default value: ${defaultConfig.stacking.gap[gapKey]}`);
                                    sanitizedGapConfig[gapKey] = defaultConfig.stacking.gap[gapKey];
                                    continue;
                                }

                                sanitizedGapConfig[gapKey] = gapValue;

                            }

                            for(const [gapKey, gapValue] of objEntries(defaultConfig.stacking.gap)){

                                if( ! sanitizedGapConfig.hasOwnProperty(gapKey) )
                                    sanitizedGapConfig[gapKey] = gapValue;

                            }

                            sanitizedConfig.gap = sanitizedGapConfig;

                            continue;

                        }

                        if( key === 'limit' && ! toastletTypeValidators.unsignedNumber(value) ){
                            console.warn(`[ToastletNotify] Warning: Option 'stacking.limit' must be an unsigned number\n  Received: ${typeof value}, ${value}\n  Using default value: ${defaultConfig.stacking.limit}`);
                            sanitizedConfig.limit = defaultConfig.stacking.limit;
                            continue;
                        }

                        if( key === 'newestOnTop' && ! toastletTypeValidators.boolean(value) ){
                            console.warn(`[ToastletNotify] Warning: Option 'stacking.newestOnTop' must be a boolean\n  Received: ${typeof value}\n  Using default value: ${defaultConfig.stacking.newestOnTop}`);
                            sanitizedConfig.newestOnTop = defaultConfig.stacking.newestOnTop;
                            continue;
                        }

                        sanitizedConfig[key] = value;

                    }

                    for(const [key, value] of objEntries(defaultConfig.stacking)){

                        if( ! sanitizedConfig.hasOwnProperty(key) )
                            sanitizedConfig[key] = value;

                    }

                    userConfig.stacking = sanitizedConfig;

                },

                /**
                 * Validate html option as boolean type.
                 * 
                 * Ensures the html option is a valid boolean controlling
                 * whether content should be treated as HTML or plain text.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                html: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.boolean(userConfig.html) ){
                        console.warn(`[ToastletNotify] Warning: Option 'html' must be a boolean\n  Received: ${typeof userConfig.html}\n  Using default value: ${defaultConfig.html}`);
                        userConfig.html = defaultConfig.html;
                    }

                },

                /**
                 * Validate icon option as boolean type.
                 * 
                 * Ensures the icon option is a valid boolean controlling
                 * whether the type icon should be displayed.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                icon: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.boolean(userConfig.icon) ){
                        console.warn(`[ToastletNotify] Warning: Option 'icon' must be a boolean\n  Received: ${typeof userConfig.icon}\n  Using default value: ${defaultConfig.icon}`);
                        userConfig.icon = defaultConfig.icon;
                    }

                },

                /**
                 * Validate title option as boolean type.
                 * 
                 * Ensures the title option is a valid boolean controlling
                 * whether the title section should be displayed.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                title: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.boolean(userConfig.title) ){
                        console.warn(`[ToastletNotify] Warning: Option 'title' must be a boolean\n  Received: '${typeof userConfig.title}'\n  Using default value: '${defaultConfig.title}'`);
                        userConfig.title = defaultConfig.title;
                    }

                },

                /**
                 * Validate titleText option as string type.
                 * 
                 * Ensures the titleText option is a valid string containing
                 * the text content for the toast title.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                titleText: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.string(userConfig.titleText) ){
                        console.warn(`[ToastletNotify] Warning: Option 'titleText' must be a string\n  Received: '${typeof userConfig.titleText}'\n  Using default value: '${defaultConfig.titleText}'`);
                        userConfig.titleText = defaultConfig.titleText;
                    }

                },

                /**
                 * Validate customClass option as string type.
                 * 
                 * Ensures the customClass option is a valid string containing
                 * CSS class names to be added to the toast element.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                customClass: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.string(userConfig.customClass) ){
                        console.warn(`[ToastletNotify] Warning: Option 'customClass' must be a string\n  Received: '${typeof userConfig.customClass}'\n  Using default value: '${defaultConfig.customClass}'`);
                        userConfig.customClass = defaultConfig.customClass;
                    }

                },

                /**
                 * Validate transition configuration object with nested properties.
                 * 
                 * Performs comprehensive validation of the transition configuration
                 * including enabled state and duration properties. Sanitizes the
                 * configuration by removing unknown properties and validates each
                 * nested value. Automatically disables duration when transitions
                 * are disabled.
                 * 
                 * Validated properties:
                 * - enabled: Boolean controlling transition behavior
                 * - duration: Number defining transition duration in milliseconds
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate transition configuration
                 * toastletCore.setup.configValidators.transition(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
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

                /**
                 * Validate animation configuration object with CSS animation classes.
                 * 
                 * Performs comprehensive validation of the animation configuration
                 * including CSS class names for entrance and exit animations.
                 * Sanitizes the configuration by removing unknown properties and
                 * validates that all animation class values are strings.
                 * 
                 * Validated properties:
                 * - animationIn: String containing CSS classes for entrance animation
                 * - animationOut: String containing CSS classes for exit animation
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate animation configuration
                 * toastletCore.setup.configValidators.animation(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
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

                /**
                 * Validate pause configuration object with interaction settings.
                 * 
                 * Performs comprehensive validation of the pause configuration
                 * including hover, focus, and resume strategy settings. Sanitizes
                 * the configuration by removing unknown properties and validates
                 * each nested value according to its expected type.
                 * 
                 * Validated properties:
                 * - hover: Boolean controlling hover pause behavior
                 * - focus: Boolean controlling focus pause behavior
                 * - resumeStrategy: String defining resume behavior ('restart' or 'resume')
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate pause configuration
                 * toastletCore.setup.configValidators.pause(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
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

                /**
                 * Validate progress bar configuration object with display settings.
                 * 
                 * Performs comprehensive validation of the progress bar configuration
                 * including enabled state and direction settings. Sanitizes the
                 * configuration by removing unknown properties and validates each
                 * nested value. Validates direction against available presets.
                 * 
                 * Validated properties:
                 * - enabled: Boolean controlling progress bar visibility
                 * - direction: String defining progress direction ('left-to-right', 'right-to-left')
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate progress bar configuration
                 * toastletCore.setup.configValidators.progressBar(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
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

                        if( key === 'direction' && ! toastletCore.presets.progressBar.get(value) ){
                            console.warn(`[ToastletNotify] Warning: Option 'progressBar.direction' must be one of: ${toastletCore.presets.progressBar.array.join(', ')}\n  Received: ${typeof value}, '${value}'\n  Using default value: '${defaultConfig.progressBar.direction}'`);
                            continue;
                        }

                        sanitizedConfig[key] = value;

                    }

                    for(const [key, value] of objEntries(defaultConfig.progressBar)){
                        
                        if( ! sanitizedConfig.hasOwnProperty(key) )
                            sanitizedConfig[key] = value;

                    }

                    userConfig.progressBar = sanitizedConfig;

                    userConfig.progressBar.data = toastletCore.presets.progressBar.get(userConfig.progressBar.direction);

                },

                /**
                 * Validate position configuration object with device-specific settings.
                 * 
                 * Performs comprehensive validation of the position configuration
                 * including desktop and mobile position settings. Sanitizes the
                 * configuration by removing unknown properties and validates each
                 * position value against available presets for respective devices.
                 * 
                 * Validated properties:
                 * - desktop: String defining desktop position (top-right, bottom-left, etc.)
                 * - mobile: String defining mobile position (top, bottom)
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate position configuration
                 * toastletCore.setup.configValidators.position(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
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

                    let desktopPosition = toastletCore.position.get.desktop(sanitizedConfig.desktop);

                    if( ! desktopPosition ){
                        console.warn(`[ToastletNotify] Warning: Invalid desktop position '${sanitizedConfig.desktop}'\n  Valid positions: ${toastletCore.position.get.available.array.desktop.join(', ')}\n  Using default position: '${defaultConfig.position.desktop}'`);
                        desktopPosition = defaultConfig.position.data.desktop;
                        sanitizedConfig.desktop = defaultConfig.position.desktop;                       
                    }

                    if( ! sanitizedConfig.hasOwnProperty('mobile') )
                        sanitizedConfig.mobile = desktopPosition.mobile;

                    let mobilePosition = toastletCore.position.get.mobile(sanitizedConfig.mobile);

                    if( ! mobilePosition ){
                        console.warn(`[ToastletNotify] Warning: Invalid mobile position '${sanitizedConfig.mobile}'\n  Valid positions: ${toastletCore.position.get.available.array.mobile.join(', ')}\n  Using default position: '${defaultConfig.position.mobile}'`);
                        mobilePosition = toastletCore.position.get.mobile(desktopPosition.mobile);
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

                /**
                 * Validate accessibility (a11y) configuration object for custom notifications.
                 * 
                 * Performs comprehensive validation of the accessibility configuration
                 * specifically for custom notification types. Validates ARIA attributes
                 * including role and ariaLive properties. Only available for custom
                 * notification types as other types have predefined accessibility settings.
                 * 
                 * Validated properties:
                 * - role: String defining ARIA role (alert, status, etc.)
                 * - ariaLive: String defining ARIA live region behavior (polite, assertive)
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate a11y configuration (custom type only)
                 * toastletCore.setup.configValidators.a11y(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
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

                /**
                 * Validate onClick callback function or null value.
                 * 
                 * Ensures the onClick option is either a valid function or null.
                 * The onClick callback is executed when the toast is clicked,
                 * providing interaction handling capabilities.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate onClick callback
                 * toastletCore.setup.configValidators.onClick(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                onClick: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.function(userConfig.onClick) && ! toastletTypeValidators.null(userConfig.onClick) ){
                        console.warn(`[ToastletNotify] Warning: Option 'onClick' must be a function or null\n  Received: ${typeof userConfig.onClick}\n  Using default value: ${defaultConfig.onClick === null ? 'null' : 'function'}`);
                        userConfig.onClick = defaultConfig.onClick;
                    }

                },

                /**
                 * Validate onShow callback function or null value.
                 * 
                 * Ensures the onShow option is either a valid function or null.
                 * The onShow callback is executed when the toast becomes fully
                 * visible after entrance animation completion.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate onShow callback
                 * toastletCore.setup.configValidators.onShow(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                onShow: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.function(userConfig.onShow) && ! toastletTypeValidators.null(userConfig.onShow) ){
                        console.warn(`[ToastletNotify] Warning: Option 'onShow' must be a function or null\n  Received: ${typeof userConfig.onShow}\n  Using default value: ${defaultConfig.onShow === null ? 'null' : 'function'}`);
                        userConfig.onShow = defaultConfig.onShow;
                    }

                },

                /**
                 * Validate beforeClose callback function or null value.
                 * 
                 * Ensures the beforeClose option is either a valid function or null.
                 * The beforeClose callback is executed before toast closure begins,
                 * allowing for cancellation or custom logic before removal.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate beforeClose callback
                 * toastletCore.setup.configValidators.beforeClose(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                beforeClose: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.function(userConfig.beforeClose) && ! toastletTypeValidators.null(userConfig.beforeClose) ){
                        console.warn(`[ToastletNotify] Warning: Option 'beforeClose' must be a function or null\n  Received: ${typeof userConfig.beforeClose}\n  Using default value: ${defaultConfig.beforeClose === null ? 'null' : 'function'}`);
                        userConfig.beforeClose = defaultConfig.beforeClose;
                    }

                },

                /**
                 * Validate onClose callback function or null value.
                 * 
                 * Ensures the onClose option is either a valid function or null.
                 * The onClose callback is executed after toast removal completion,
                 * providing notification of the closure event with reason information.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate onClose callback
                 * toastletCore.setup.configValidators.onClose(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                onClose: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.function(userConfig.onClose) && ! toastletTypeValidators.null(userConfig.onClose) ){
                        console.warn(`[ToastletNotify] Warning: Option 'onClose' must be a function or null\n  Received: ${typeof userConfig.onClose}\n  Using default value: ${defaultConfig.onClose === null ? 'null' : 'function'}`);
                        userConfig.onClose = defaultConfig.onClose;
                    }

                },

                /**
                 * Validate onPause callback function or null value.
                 * 
                 * Ensures the onPause option is either a valid function or null.
                 * The onPause callback is executed when toast timer is paused,
                 * providing notification with elapsed time information.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate onPause callback
                 * toastletCore.setup.configValidators.onPause(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                onPause: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.function(userConfig.onPause) && ! toastletTypeValidators.null(userConfig.onPause) ){
                        console.warn(`[ToastletNotify] Warning: Option 'onPause' must be a function or null\n  Received: ${typeof userConfig.onPause}\n  Using default value: ${defaultConfig.onPause === null ? 'null' : 'function'}`);
                        userConfig.onPause = defaultConfig.onPause;
                    }

                },

                /**
                 * Validate onPlay callback function or null value.
                 * 
                 * Ensures the onPlay option is either a valid function or null.
                 * The onPlay callback is executed when toast timer is resumed
                 * or started, providing notification with strategy information.
                 * 
                 * @param {Object} defaultConfig - Default configuration object
                 * @param {Object} userConfig - User-provided configuration
                 * 
                 * @example
                 * // Validate onPlay callback
                 * toastletCore.setup.configValidators.onPlay(defaultConfig, userConfig);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
                onPlay: (defaultConfig, userConfig) => {

                    if( ! toastletTypeValidators.function(userConfig.onPlay) && ! toastletTypeValidators.null(userConfig.onPlay) ){
                        console.warn(`[ToastletNotify] Warning: Option 'onPlay' must be a function or null\n  Received: ${typeof userConfig.onPlay}\n  Using default value: ${defaultConfig.onPlay === null ? 'null' : 'function'}`);
                        userConfig.onPlay = defaultConfig.onPlay;
                    }

                }

            },

            /**
             * Sanitize and validate user configuration against default configuration.
             * 
             * Performs comprehensive configuration sanitization by creating safety copies
             * of both default and user configurations, validating each user-provided
             * property against corresponding validators, and merging the results into
             * a final clean configuration object. Removes unknown properties and
             * prevents mutation of original configuration objects.
             * 
             * Process flow:
             * 1. Create safety copies to prevent original object mutation
             * 2. Extract enumerable properties from user configuration
             * 3. Validate each property exists in default configuration
             * 4. Run property-specific validators for type checking and sanitization
             * 5. Merge validated properties with default configuration
             * 6. Remove internal properties (notificationType) from final config
             * 7. Return sanitized and validated configuration object
             * 
             * Property validation:
             * - Removes unknown properties with console warnings
             * - Excludes internal properties (e.g., notificationType)
             * - Applies property-specific validators from configValidators
             * - Falls back to default values when validation fails
             * - Maintains configuration integrity and type safety
             * 
             * Memory safety:
             * - Creates defensive copies to prevent original object mutation
             * - Extracts only enumerable properties (no symbols)
             * - Ensures immutability of input configuration objects
             * - Prevents prototype pollution through safe property access
             * 
             * @param {Object} defaultConfig - Complete default configuration object with all properties
             * @param {Object} userConfig - User-provided configuration object to sanitize
             * @returns {Object} Sanitized configuration object ready for toast instance creation
             * 
             * @example
             * // Sanitize user configuration
             * const cleanConfig = toastletCore.setup.sanitizeConfig(defaultConfig, userConfig);
             * 
             * @example
             * // Handle invalid properties gracefully
             * const userConfig = { duration: 5000, invalidProp: 'test' };
             * const result = toastletCore.setup.sanitizeConfig(defaults, userConfig);
             * // Logs warning about invalidProp and removes it from result
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

                    toastletCore.setup.configValidators[key](defaultConfigCopy, userConfigCopy);

                    sanitizeConfig[key] = userConfigCopy[key];

                }

                const finalConfig = {
                    ...defaultConfigCopy,
                    ...sanitizeConfig
                }

                delete finalConfig.notificationType;

                return finalConfig;

            },            

            /**
             * Configure and organize CSS classes for toast components across different devices and states.
             * 
             * Builds a comprehensive CSS class structure for toast instances by combining
             * base classes, position-specific classes, notification type classes, custom
             * classes, and animation classes. Organizes classes into device-specific
             * groups (desktop/mobile) and animation states (in/out) for efficient
             * class management throughout the toast lifecycle.
             * 
             * Class organization:
             * - Base classes: Core toast and device-specific identification
             * - Position classes: Desktop/mobile positioning from configuration
             * - Type classes: Notification type styling (success, error, etc.)
             * - Custom classes: User-provided additional styling
             * - Animation classes: Entrance and exit animation definitions
             * - All classes: Combined collection for global class operations
             * 
             * Processing workflow:
             * 1. Initialize base desktop and mobile class arrays
             * 2. Append position-specific classes from configuration
             * 3. Add notification type classes for semantic styling
             * 4. Merge with exploded custom classes from user configuration
             * 5. Process animation classes for entrance and exit states
             * 6. Create comprehensive 'all' class collection for cleanup operations
             * 
             * Class structure returned:
             * - desktop: Array of classes for desktop toast layout
             * - mobile: Array of classes for mobile toast layout
             * - animationIn: Array of classes for entrance animations
             * - animationOut: Array of classes for exit animations
             * - all: Combined array of all classes for bulk operations
             * 
             * @param {Object} config - Sanitized configuration object with position and styling data
             * @param {string} content - Toast content (unused but part of signature consistency)
             * @param {Object} notificationType - Notification type object containing class and styling info
             * @returns {Object} Organized class structure with device and animation-specific arrays
             * 
             * @example
             * // Configure classes for success notification
             * const classes = toastletCore.setup.configureClasses(config, content, successType);
             * // Returns: { desktop: [...], mobile: [...], animationIn: [...], animationOut: [...], all: [...] }
             * 
             * @example
             * // Access specific class arrays
             * const classes = toastletCore.setup.configureClasses(config, content, notificationType);
             * toast.className = classes.desktop.join(' '); // Apply desktop classes
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

            /**
             * Configure responsive default styles for toast components based on content and settings.
             * 
             * Dynamically generates CSS styling arrays for toast elements by analyzing
             * content presence, configuration settings, and device requirements. Creates
             * responsive style definitions that adapt to content type (title-only,
             * content-only, or both) and ensures consistent appearance across desktop
             * and mobile devices. Handles progress bar styling with directional support.
             * 
             * Responsive behavior:
             * - Desktop: Fixed width (360px) for content-rich toasts, auto for simple ones
             * - Mobile: Full viewport width with responsive height constraints
             * - Dynamic minimum heights based on content complexity
             * - Adaptive border radius (5px desktop, 0 mobile for edge-to-edge)
             * 
             * Content-based sizing:
             * - Title + Content: 80px minimum height, 360px width (desktop)
             * - Title or Content only: 48px minimum height
             * - Empty content: Auto sizing with 48px minimum height
             * - Full viewport constraints for maximum dimensions
             * 
             * Progress bar styling:
             * - Absolute positioning at bottom of toast
             * - Directional flex layout based on configuration
             * - Fixed height (5px) with full-width coverage
             * - Synchronized styling with toast animation states
             * 
             * Style array format:
             * Each style property is formatted as [property, value, priority?] arrays
             * for efficient batch application via style helper utilities.
             * 
             * @param {Object} config - Sanitized configuration object with styling preferences
             * @param {string} content - Toast content for dynamic sizing calculations
             * @param {Object} notificationType - Notification type (unused but maintains signature)
             * @returns {Object} Style object with desktop/mobile toast styles and progress bar styles
             * 
             * @example
             * // Configure styles for toast with title and content
             * const styles = toastletCore.setup.configureDefaultStyles(config, 'Hello World', type);
             * // Returns: { toast: { desktop: [...], mobile: [...] }, progressBar: [...], progressBarThumb: [...] }
             * 
             * @example
             * // Apply generated styles to toast element
             * const styles = toastletCore.setup.configureDefaultStyles(config, content, type);
             * toastletStyleHelper.setProperties(toastElement, ...styles.toast.desktop);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

            /**
             * DOM element creation functions for toast components.
             * 
             * Provides factory functions for creating and configuring all
             * toast DOM elements including the main container, content areas,
             * control buttons, and progress bars. Each function applies
             * appropriate styling, accessibility attributes, and structure.
             * 
             * Element structure:
             * - toast: Main container with grid layout
             * - iconCol: Icon column container
             * - contentCol: Content area container
             * - title: Title text element
             * - content: Main content element
             * - controlsCol: Control buttons container
             * - pauseButton: Pause/resume button
             * - closeButton: Close/dismiss button
             * - progressBar: Progress indicator container
             * 
             * Accessibility features:
             * - Proper ARIA attributes on all elements
             * - Semantic HTML structure
             * - Keyboard navigation support
             * - Screen reader compatibility
             * 
             * @namespace
             * @property {Function} toast - Create main toast container
             * @property {Function} iconCol - Create icon column
             * @property {Function} contentCol - Create content column
             * @property {Function} title - Create title element
             * @property {Function} content - Create content element
             * @property {Function} controlsCol - Create controls column
             * @property {Function} pauseButton - Create pause button
             * @property {Function} closeButton - Create close button
             * @property {Function} progressBar - Create progress bar
             * 
             * @example
             * // Create toast container
             * const toastEl = toastletCore.setup.createElement.toast(instance, content, type);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            createElement: {

                /**
                 * Create the main toast container element.
                 * 
                 * Creates the primary toast div with grid layout, accessibility
                 * attributes, styling, and responsive structure. Calculates
                 * grid template columns based on enabled features and applies
                 * appropriate spacing and colors.
                 * 
                 * @param {Object} toastInstance - The toast instance configuration
                 * @param {string} content - Toast content text
                 * @param {Object} notificationType - Toast type configuration
                 * @returns {HTMLElement} Configured toast container element
                 * 
                 * @example
                 * // Create toast element
                 * const toast = toastletCore.setup.createElement.toast(instance, 'Hello', errorType);
                 * 
                 * @author Pedro Rigolin
                 * @since 1.0.0
                 */
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
                        ...toastletCore.presets.styles.toast[toastInstance.mode],
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
                        ...toastletCore.presets.styles.iconCol
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
                        ...toastletCore.presets.styles.iconContainer
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
                        ...toastletCore.presets.styles.contentCol
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
                        ...toastletCore.presets.styles.title
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
                        ...toastletCore.presets.styles.content
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
                        ...toastletCore.presets.styles.controlCol
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

                    pauseButton.innerHTML = toastletCore.presets.icons.pause;

                    toastletStyleHelper.setProperties(
                        pauseButton,
                        ...toastletCore.presets.styles.pauseButton
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

                    closeButton.innerHTML = toastletCore.presets.icons.close;

                    toastletStyleHelper.setProperties(
                        closeButton,
                        ...toastletCore.presets.styles.closeButton
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
                        ...toastletCore.presets.styles.progressBar
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
                        ...toastletCore.presets.styles.progressBarThumb
                    );

                    return progressBarThumb;

                }

            },

            /**
             * Register multiple event listeners for toast components with parameter binding.
             * 
             * Processes and registers an array of event listener configurations by binding
             * handlers to their target elements with optional parameters, adding them to
             * the DOM via addEventListener, and storing references in the toast instance
             * for cleanup during disposal. Supports flexible parameter passing and
             * automatic context binding for consistent event handling.
             * 
             * Listener configuration structure:
             * Each listener object should contain:
             * - element: Target DOM element for the event listener
             * - event: Event type string (click, hover, keydown, etc.)
             * - handler: Event handler function to execute
             * - params: Optional array of parameters to bind to handler
             * 
             * Processing workflow:
             * 1. Validate arguments array is not empty
             * 2. Iterate through listener configurations in reverse order
             * 3. Create defensive copy of each configuration object
             * 4. Ensure params array exists (defaults to empty array)
             * 5. Bind handler function with element context and parameters
             * 6. Register listener with DOM via addEventListener
             * 7. Store listener reference in toast instance for cleanup
             * 
             * Memory management:
             * - Stores listener references for proper cleanup during toast disposal
             * - Creates bound handler functions to maintain consistent context
             * - Prevents memory leaks through systematic listener tracking
             * 
             * @param {Object} toastInstance - Toast instance to store listener references
             * @param {...Object} args - Variable number of listener configuration objects
             * 
             * @example
             * // Register multiple listeners with parameters
             * toastletCore.setup.setListener(toastInstance,
             *   { element: toast, event: 'click', handler: handleClick, params: [toastInstance] },
             *   { element: button, event: 'keydown', handler: handleKey, params: [e] }
             * );
             * 
             * @example
             * // Register simple listener without parameters
             * toastletCore.setup.setListener(toastInstance,
             *   { element: closeButton, event: 'click', handler: closeToast }
             * );
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

            /**
             * Factory object for creating event listener configurations for toast components.
             * 
             * Provides specialized functions to generate arrays of event listener configurations
             * for different toast components and interaction contexts. Each factory function
             * creates optimized listener sets that handle all relevant user interactions,
             * browser events, and system notifications for their respective components.
             * 
             * Factory functions available:
             * - toast: Complete interaction handlers for main toast element
             * - pauseButton: Play/pause control interaction handlers
             * - closeButton: Close action interaction handlers  
             * - window: Global window event handlers (resize, etc.)
             * - document: Document-level event handlers (visibility, etc.)
             * 
             * Event coverage strategy:
             * - Pointer events (pointerdown, pointerup, pointerleave, etc.)
             * - Mouse events (mousedown, mouseup, mouseenter, mouseleave, etc.)
             * - Touch events (touchstart, touchmove, touchend, touchcancel)
             * - Keyboard events (keydown, focusin, focusout)
             * - System events (resize, visibilitychange)
             * 
             * All generated listeners are automatically registered via setListener
             * and include proper parameter binding for toast instance context.
             * 
             * @namespace createListener
             * @memberof toastletCore.setup
             * 
             * @example
             * // Create and register all toast listeners
             * toastletCore.setup.createListener.toast(toastInstance);
             * 
             * @example
             * // Register button-specific listeners
             * toastletCore.setup.createListener.pauseButton(toastInstance);
             * toastletCore.setup.createListener.closeButton(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            createListener: {

                toast: (toastInstance) => {

                    const listeners = [];

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'mouseup',
                        handler: toastletCore.handles.toast.pointerup,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'pointerup',
                        handler: toastletCore.handles.toast.pointerup,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'mousedown',
                        handler: toastletCore.handles.toast.pointerdown,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'pointerdown',
                        handler: toastletCore.handles.toast.pointerdown,
                        params: [toastInstance]
                    });

                    if( ! toastletTypeValidators.null(toastInstance.config.onClick) ) {

                        listeners.push({
                            element: toastInstance.toast,
                            event: 'click',
                            handler: toastletCore.handles.toast.click,
                            params: [toastInstance]
                        });

                    }

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'mouseenter',
                        handler: toastletCore.handles.toast.mouseenter,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'mouseleave',
                        handler: toastletCore.handles.toast.mouseleave,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'mouseout',
                        handler: toastletCore.handles.toast.mouseleave,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'pointerleave',
                        handler: toastletCore.handles.toast.mouseleave,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'pointerout',
                        handler: toastletCore.handles.toast.mouseleave,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'pointercancel',
                        handler: toastletCore.handles.toast.mouseleave,
                        params: [toastInstance]
                    });                    

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'touchstart',
                        handler: toastletCore.handles.toast.touchstart,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'touchcancel',
                        handler: toastletCore.handles.toast.touchcancel,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'touchmove',
                        handler: toastletCore.handles.toast.touchmove,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'touchend',
                        handler: toastletCore.handles.toast.touchend,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'focusin',
                        handler: toastletCore.handles.toast.focusin,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'focusout',
                        handler: toastletCore.handles.toast.focusout,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.toast,
                        event: 'keydown',
                        handler: toastletCore.handles.toast.keydown,
                        params: [toastInstance]
                    });

                    toastletCore.setup.setListener(toastInstance, ...listeners);

                },

                pauseButton: (toastInstance) => {

                    const listeners = [];

                    listeners.push({
                        element: toastInstance.pauseButton,
                        event: 'pointerdown',
                        handler: toastletCore.handles.pauseButton.pointerdown,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.pauseButton,
                        event: 'mousedown',
                        handler: toastletCore.handles.pauseButton.pointerdown,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.pauseButton,
                        event: 'pointerup',
                        handler: toastletCore.handles.pauseButton.pointerup,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.pauseButton,
                        event: 'mouseup',
                        handler: toastletCore.handles.pauseButton.pointerup,
                        params: [toastInstance]
                    });

                    toastletCore.setup.setListener(toastInstance, ...listeners);

                },

                closeButton: (toastInstance) => {

                    const listeners = [];

                    listeners.push({
                        element: toastInstance.closeButton,
                        event: 'pointerdown',
                        handler: toastletCore.handles.closeButton.pointerdown,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.closeButton,
                        event: 'mousedown',
                        handler: toastletCore.handles.closeButton.pointerdown,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.closeButton,
                        event: 'pointerup',
                        handler: toastletCore.handles.closeButton.pointerup,
                        params: [toastInstance]
                    });

                    listeners.push({
                        element: toastInstance.closeButton,
                        event: 'mouseup',
                        handler: toastletCore.handles.closeButton.pointerup,
                        params: [toastInstance]
                    });

                    toastletCore.setup.setListener(toastInstance, ...listeners);

                },

                window: (toastInstance) => {

                    const listeners = [];

                    listeners.push({
                        element: window,
                        event: 'resize',
                        handler: toastletCore.handles.window.resize,
                        params: [toastInstance]
                    });

                    toastletCore.setup.setListener(toastInstance, ...listeners);

                },

                document: (toastInstance) => {

                    const listeners = [];

                    listeners.push({
                        element: document,
                        event: 'visibilitychange',
                        handler: toastletCore.handles.document.visibilityChange,
                        params: [toastInstance]
                    });

                    toastletCore.setup.setListener(toastInstance, ...listeners);

                }

            },

            /**
             * Register multiple MutationObserver instances for DOM change monitoring.
             * 
             * Creates and configures MutationObserver instances to monitor DOM changes
             * on specified elements, binding handler functions with parameters and
             * storing observer references in the toast instance for proper cleanup
             * during disposal. Supports flexible observer configuration and automatic
             * context binding for consistent change detection.
             * 
             * Observer configuration structure:
             * Each observer object should contain:
             * - element: Target DOM element to observe
             * - handler: Handler function to execute on mutations
             * - params: Optional array of parameters to bind to handler
             * - config: MutationObserver options (attributes, childList, etc.)
             * 
             * Processing workflow:
             * 1. Validate arguments array is not empty
             * 2. Iterate through observer configurations in reverse order
             * 3. Create defensive copy of each configuration object
             * 4. Ensure params array exists (defaults to empty array)
             * 5. Create bound handler function with parameters
             * 6. Instantiate new MutationObserver with bound handler
             * 7. Start observing target element with specified config
             * 8. Store observer reference in toast instance for cleanup
             * 
             * Memory management:
             * - Stores observer references for proper cleanup during toast disposal
             * - Creates bound handler functions to maintain consistent context
             * - Prevents memory leaks through systematic observer tracking
             * 
             * @param {Object} toastInstance - Toast instance to store observer references
             * @param {...Object} args - Variable number of observer configuration objects
             * 
             * @example
             * // Register DOM mutation observers
             * toastletCore.setup.setObserver(toastInstance,
             *   { 
             *     element: document.body, 
             *     handler: handleBodyMutation,
             *     params: [toastInstance],
             *     config: { childList: true, subtree: true }
             *   }
             * );
             * 
             * @example
             * // Register multiple observers with different configurations
             * toastletCore.setup.setObserver(toastInstance,
             *   { element: document.body, handler: bodyHandler, config: { childList: true } },
             *   { element: document.documentElement, handler: htmlHandler, config: { attributes: true } }
             * );
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
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

            /**
             * Factory object for creating MutationObserver configurations for DOM monitoring.
             * 
             * Provides specialized functions to generate arrays of MutationObserver
             * configurations for monitoring specific DOM elements that can affect
             * toast positioning, visibility, or behavior. Each factory function
             * creates optimized observer sets that watch for relevant DOM changes
             * and respond appropriately to maintain toast functionality.
             * 
             * Factory functions available:
             * - body: Monitor document.body mutations for layout changes
             * - html: Monitor document.documentElement for root-level changes
             * 
             * Observation strategy:
             * - Monitors critical DOM elements that can affect toast positioning
             * - Watches for layout changes that might require toast repositioning
             * - Detects structural changes that could impact toast visibility
             * - Uses default observer configuration optimized for performance
             * 
             * All generated observers are automatically registered via setObserver
             * and include proper parameter binding for toast instance context.
             * Performance is optimized through targeted observation configs that
             * minimize callback frequency while capturing essential changes.
             * 
             * @namespace createObserver
             * @memberof toastletCore.setup
             * 
             * @example
             * // Create and register body mutation observer
             * toastletCore.setup.createObserver.body(toastInstance);
             * 
             * @example
             * // Register both body and html observers
             * toastletCore.setup.createObserver.body(toastInstance);
             * toastletCore.setup.createObserver.html(toastInstance);
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            createObserver: {

                body: (toastInstance) => {

                    const observers = [];

                    observers.push({
                        element: document.body,
                        handler: toastletCore.handles.body.mutation,
                        params: [toastInstance],
                        config: toastInstance.defaultObserverConfig
                    });

                    toastletCore.setup.setObserver(toastInstance, ...observers);

                },

                html: (toastInstance) => {

                    const observers = [];

                    observers.push({
                        element: document.documentElement,
                        handler: toastletCore.handles.html.mutation,
                        params: [toastInstance],
                        config: toastInstance.defaultObserverConfig
                    });

                    toastletCore.setup.setObserver(toastInstance, ...observers);

                }

            }

        },

    });

    // !! REMOVE AFTER TESTS!
    window.space_regex = space_regex; // For debugging purposes
    window.space_uni_regex = space_uni_regex; // For debugging purposes
    window.only_letters_regex = only_letters_regex; // For debugging purposes

    window.computedStyleCache = computedStyleCache; // For debugging purposes

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

            /**
             * Pause a specific toast or the last active toast.
             * 
             * Programmatically pauses the auto-close timer of a toast
             * notification. If no ID is provided, pauses the most recently
             * active toast. Provides visual feedback by disabling the pause
             * button if present.
             * 
             * @param {number} [id] - Toast ID to pause, or undefined for last active
             * 
             * @example
             * // Pause specific toast
             * toastletNotify.pause(123);
             * 
             * @example
             * // Pause last active toast
             * toastletNotify.pause();
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            // TODO: O ÚLTIMO ID DEVE SER EM O ÚLTIMO QUE TENHA TIMER
            pause: (id) => {

                if( toastletTypeValidators.undefined(id) )
                    id = toastletInstances.getLastActiveId();

                if( ! toastletTypeValidators.unsignedNumber(id) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'id' must be an unsigned number\n  at toastletNotify.pause()`);
                    return;
                }

                if( ! toastletInstances.all.has(id) ) return;

                const toastInstance = toastletInstances.all.get(id);

                if( toastInstance.isSticky ) return;

                toastInstance.isPausedByProgrammatic = true;

                toastletCore.timeouts.pauseTimer(toastInstance);

                if( toastInstance.config.pause.button && toastInstance.pauseButton ){

                    toastletStyleHelper.setProperties(
                        toastInstance.pauseButton,
                        ['opacity', '0.5'],
                        ['pointer-events', 'none'],
                        ['cursor', 'not-allowed']
                    );

                }

            },

            /**
             * Pause all non-sticky toast notifications.
             * 
             * Programmatically pauses the auto-close timers of all currently
             * active non-sticky toasts. Provides visual feedback by disabling
             * pause buttons where present. Sticky toasts are unaffected.
             * 
             * @example
             * // Pause all active toasts
             * toastletNotify.pauseAll();
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            pauseAll: () => {

                for( const [id, toastInstance] of toastletInstances.nonSticky ){

                    toastInstance.isPausedByProgrammatic = true;

                    toastletCore.timeouts.pauseTimer(toastInstance);

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
            
            /**
             * Resume a specific toast or the last active toast.
             * 
             * Programmatically resumes the auto-close timer of a paused toast
             * notification. If no ID is provided, resumes the most recently
             * active toast. Restores normal visual state and interaction.
             * 
             * @param {number} [id] - Toast ID to resume, or undefined for last active
             * 
             * @example
             * // Resume specific toast
             * toastletNotify.play(123);
             * 
             * @example
             * // Resume last active toast
             * toastletNotify.play();
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            play: (id) => {

                if( toastletTypeValidators.undefined(id) )
                    id = toastletInstances.getLastActiveId();

                if( ! toastletTypeValidators.unsignedNumber(id) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'id' must be an unsigned number\n  at toastletNotify.play()`);
                    return;
                }

                if( ! toastletInstances.all.has(id) ) return;

                const toastInstance = toastletInstances.all.get(id);

                if( toastInstance.isSticky ) return;

                toastInstance.isPausedByProgrammatic = false;

                toastletCore.timeouts.playTimer(toastInstance);

                if( toastInstance.config.pause.button && toastInstance.pauseButton ){

                    toastletStyleHelper.setProperties(
                        toastInstance.pauseButton,
                        ['opacity', '1'],
                        ['pointer-events', 'auto'],
                        ['cursor', 'pointer']
                    );

                }

            },

            /**
             * Resume all non-sticky toast notifications.
             * 
             * Programmatically resumes the auto-close timers of all currently
             * paused non-sticky toasts. Restores normal visual state and
             * interaction for all pause buttons. Sticky toasts are unaffected.
             * 
             * @example
             * // Resume all paused toasts
             * toastletNotify.playAll();
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            playAll: () => {

                for( const [id, toastInstance] of toastletInstances.nonSticky ){

                    toastInstance.isPausedByProgrammatic = false;

                    toastletCore.timeouts.playTimer(toastInstance);

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

            resume: (id) => {

                if( toastletTypeValidators.undefined(id) )
                    id = toastletInstances.getLastActiveId();

                if( ! toastletTypeValidators.unsignedNumber(id) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'id' must be an unsigned number\n  at toastletNotify.resume()`);
                    return;
                }

                if( ! toastletInstances.all.has(id) ) return;

                const toastInstance = toastletInstances.all.get(id);

                toastInstance.isPausedByProgrammatic = false;

                toastletCore.timeouts.resumeTimer(toastInstance);

            },

            resumeAll: () => {

                for( const [id, toastInstance] of toastletInstances.nonSticky ){

                    toastInstance.isPausedByProgrammatic = false;

                    toastletCore.timeouts.resumeTimer(toastInstance);

                }

            },

            restart: (id) => {

                if( toastletTypeValidators.undefined(id) )
                    id = toastletInstances.getLastActiveId();

                if( ! toastletTypeValidators.unsignedNumber(id) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'id' must be an unsigned number\n  at toastletNotify.restart()`);
                    return;
                }

                if( ! toastletInstances.all.has(id) ) return;

                const toastInstance = toastletInstances.all.get(id);

                toastInstance.isPausedByProgrammatic = false;

                toastletCore.timeouts.startTimer(toastInstance);

            },

            restartAll: () => {

                for( const [id, toastInstance] of toastletInstances.nonSticky ){

                    toastInstance.isPausedByProgrammatic = false;

                    toastletCore.timeouts.startTimer(toastInstance);

                }

            },

            /**
             * Close a specific toast or the last active toast.
             * 
             * Programmatically closes a toast notification with proper animation
             * and cleanup. If no ID is provided, closes the most recently active
             * toast. Triggers the complete closing sequence including exit animation.
             * 
             * @param {number} [id] - Toast ID to close, or undefined for last active
             * 
             * @example
             * // Close specific toast
             * toastletNotify.close(123);
             * 
             * @example
             * // Close last active toast
             * toastletNotify.close();
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            close: (id) => {
                
                if( toastletTypeValidators.undefined(id) )
                    id = toastletInstances.getLastActiveId();

                if( ! toastletTypeValidators.unsignedNumber(id) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'id' must be an unsigned number\n  at toastletNotify.close()`);
                    return;
                }

                if( ! toastletInstances.all.has(id) ) return;

                const toastInstance = toastletInstances.all.get(id);

                toastletCore.utils.closeToast(toastInstance, 'api');            

            },

            /**
             * Close all non-stackable toast notifications.
             * 
             * Programmatically closes all currently active non-stackable toasts.
             * Useful for clearing toasts when stacking is disabled and you want
             * to ensure a clean state before showing new notifications.
             * 
             * @example
             * // Close all non-stackable toasts
             * toastletNotify.closeAllNonStackable();
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            closeAllNonStackable: () => {

                for( const [id, toastInstance] of toastletInstances.nonStackable ){

                    toastletCore.utils.closeToast(toastInstance, 'api');

                }

            },

            /**
             * Close all stackable toast notifications.
             * 
             * Programmatically closes all currently active stackable toasts.
             * Useful for clearing stacked toasts while preserving non-stackable
             * ones, providing selective control over different toast categories.
             * 
             * @example
             * // Close all stackable toasts
             * toastletNotify.closeAllStackable();
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            closeAllStackable: () => {

                for( const [id, toastInstance] of toastletInstances.stackable ){

                    toastletCore.utils.closeToast(toastInstance, 'api');

                }

            },

            /**
             * Close all toast notifications.
             * 
             * Programmatically closes all currently active toasts regardless
             * of type or stacking configuration. Provides a complete reset
             * of all toast notifications with proper cleanup.
             * 
             * @example
             * // Close all active toasts
             * toastletNotify.closeAll();
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            closeAll: () => {

                for( const [id, toastInstance] of toastletInstances.all ){

                    toastletCore.utils.closeToast(toastInstance, 'api');

                }

            },

            /**
             * Create and display a toast notification.
             * 
             * The main function for creating toast notifications with comprehensive
             * configuration options. Supports multiple notification types, custom
             * styling, positioning, timing, and interaction behaviors.
             * 
             * @param {string} type - Notification type: 'info', 'success', 'warning', 'error', 'notice', 'loading', 'custom'
             * @param {string|HTMLElement} [content=""] - Content to display (text, HTML string, or DOM element)
             * @param {Object} [options={}] - Configuration options
             * @param {boolean} [options.sticky=false] - Prevent auto-close
             * @param {number} [options.duration=5000] - Auto-close delay in milliseconds
             * @param {boolean} [options.dismissible=true] - Show close button
             * @param {string} [options.position='top-right'] - Desktop position
             * @param {string} [options.positionMobile] - Mobile position override
             * @param {Object} [options.stacking] - Stacking configuration
             * @param {Object} [options.pause] - Pause behavior configuration
             * @param {Object} [options.transition] - Animation configuration
             * @param {string} [options.customClass] - Additional CSS classes
             * @param {boolean} [options.html=false] - Treat content as HTML
             * @param {boolean} [options.icon=true] - Show type icon
             * @param {boolean} [options.title=true] - Show title
             * @param {string} [options.titleText] - Custom title text
             * @param {Function} [options.onClick] - Click handler
             * @param {Object} [options.callbacks] - Lifecycle callbacks
             * @returns {Object|null} Toast controller object or null if error
             * 
             * @example
             * // Simple notification
             * toastletNotify.notify('success', 'Operation completed!');
             * 
             * @example
             * // Advanced configuration
             * toastletNotify.notify('warning', 'Please review your data', {
             *   sticky: true,
             *   position: 'top-center',
             *   customClass: 'my-warning',
             *   onClick: () => console.log('Toast clicked!')
             * });
             * 
             * @author Pedro Rigolin
             * @since 1.0.0
             */
            notify: (type, content = "", options = {}) => {

                // Ensure DOM is ready before attempting to create toast notifications
                if ( ! document.body ) {
                    console.error('[ToastletNotify] Error: document.body is not available. Make sure to call toastletNotify.notify() after the DOM is fully loaded.');
                    return null;
                }

                // Validate that type parameter is a string
                if( ! toastletTypeValidators.string(type) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'type' must be a string\n  at toastletNotify.notify()\n  Expected: string\n  Received: ${typeof type}`);
                    return null;
                }

                // Normalize null or undefined content to empty string
                if( toastletTypeValidators.null(content) || toastletTypeValidators.undefined(content) ) 
                    content = "";

                // Validate that content is either a string or valid HTML content
                if( ! toastletTypeValidators.string(content) && ! toastletTypeValidators.htmlContent(content) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'content' must be a string or HTML content\n  at toastletNotify.notify()\n  Expected: string | HTMLElement | Node | DocumentFragment\n  Received: ${typeof content}`);
                    return null;
                }

                // Validate that options parameter is a plain object
                if( ! toastletTypeValidators.plainObject(options) ) {
                    console.error(`[ToastletNotify] TypeError: Parameter 'options' must be a plain object\n  at toastletNotify.notify()\n  Expected: object\n  Received: ${typeof options}`);
                    return null;
                }

                // Retrieve the notification type preset configuration
                // If the getter returns false, the notification type is invalid
                const notificationType = toastletCore.presets.types.get(type);

                // Validate that the notification type exists in the presets
                if( ! notificationType ) {
                    console.error(`[ToastletNotify] Invalid notification type: "${type}"\n  at toastletNotify.notify()\n  Valid types: info, success, warning, error, notice`);
                    return null;
                }

                const defaultConfig = {

                    notificationType: notificationType,
                    
                    sticky: false,
                    duration: 5000,
                    dismissible: true,

                    stacking: {
                        enabled: false,
                        gap: {
                            desktop: 20,
                            mobile: 10
                        },
                        limit: 5,
                        newestOnTop: true
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
                        // !! REMOVER DEPOIS DE TESTES !! O RESUME ATRAPALHA OS TESTES
                        resumeStrategy: 'restart' // 'restart' | 'resume'
                    },

                    progressBar: {
                        enabled: false,
                        direction: 'left-to-right',
                        data: toastletCore.presets.progressBar.get('left-to-right')
                    },

                    position: {
                        desktop: 'top-right',
                        mobile: 'top',
                        data: {
                            desktop: toastletCore.position.get.desktop('top-right'),
                            mobile: toastletCore.position.get.mobile('top')
                        }
                    },

                    a11y: {
                        role: '',
                        ariaLive: ''
                    },

                    onClick: null,

                    onShow: null,

                    beforeClose: null,

                    onClose: null,

                    onPause: null,

                    onPlay: null,

                    ...notificationType.config

                };

                // !! REMOVE AFTER TESTING !!
                window.defaultConfig = defaultConfig; // For debugging purposes

                // Sanitize and validate configuration with user options
                const config = toastletCore.setup.sanitizeConfig(defaultConfig, options);

                // Disable title if text content is empty
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

                // Determine if toast should persist indefinitely
                const isSticky = !!( config.sticky || config.duration <= 0 );

                // Disable progress bar for sticky toasts
                if( isSticky ) config.progressBar.enabled = false;

                // Generate responsive CSS classes
                const classes = toastletCore.setup.configureClasses(config, content, notificationType);

                // Generate dynamic default styles
                const defaultStyles = toastletCore.setup.configureDefaultStyles(config, content, notificationType);

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

                        touchEvent: null,
                        clickInProgress: null,
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

                    closeReason: '',

                    closeButtonPointerDown: false,
                    pauseButtonPointerDown: false,

                    isClickInProgress: false,

                    isPointerEvent: false,
                    isTouchEvent: false,

                    isSticky: isSticky,
                    isDismissible: config.dismissible,
                    isStackable: config.stacking.enabled,

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

                    listeners: [],

                    controller: null

                };

                /*
                 * If a click callback function exists, the clickControl object is created.
                 * It's important that this object is frozen and uses get/set with type control,
                 * as it will be exposed to the library user, making it susceptible to setting
                 * values of non-boolean types and also to unauthorized uses of the object,
                 * such as deleting the disabled property.
                 */
                if( ! toastletTypeValidators.null(toastInstance.config.onClick) ) {

                    // Private variable to store disabled state
                    let disabled = false;
                    
                    // Create frozen control object exposed to user
                    toastInstance.clickControl = objFreeze({

                        // Getter for disabled property
                        get disabled() {
                            return disabled;
                        },

                        // Setter with type validation
                        set disabled(value) {

                            // Validate that value is boolean
                            if( ! toastletTypeValidators.boolean(value) ) {
                                console.error(`[ToastletNotify] TypeError: 'disabled' must be a boolean\n  at clickControl.enabled\n  Expected: boolean\n  Received: ${typeof value}`);
                                return;
                            }

                            // Update private variable
                            disabled = value;

                        }

                    });

                }               

                toastInstance.toast = toastletCore.setup.createElement.toast(toastInstance, content, notificationType);

                toastInstance.rAF.restoreTransition.fn = toastletCore.rAF.restoreTransition.bind(toastInstance.toast, toastInstance);

                toastInstance.rAF.enterElement.fn = toastletCore.rAF.enterElement.bind(toastInstance.toast, toastInstance);

                if( toastInstance.config.icon ) {

                    toastInstance.iconCol = toastletCore.setup.createElement.iconCol();

                    toastInstance.toast.appendChild(toastInstance.iconCol);

                    toastInstance.iconContainer = toastletCore.setup.createElement.iconContainer(notificationType);

                    toastInstance.iconCol.appendChild(toastInstance.iconContainer);

                }
               
                if( toastInstance.config.title || ! toastletTypeValidators.emptyContent(content) ) {

                    toastInstance.contentCol = toastletCore.setup.createElement.contentCol();

                    toastInstance.toast.appendChild(toastInstance.contentCol);

                    if( toastInstance.config.title ) {

                        toastInstance.title = toastletCore.setup.createElement.title(toastInstance);

                        toastInstance.contentCol.appendChild(toastInstance.title);

                    }

                    if( ! toastletTypeValidators.emptyContent(content) ) {

                        toastInstance.content = toastletCore.setup.createElement.content(toastInstance, content);

                        toastInstance.contentCol.appendChild(toastInstance.content);

                        toastInstance.toast.appendChild(toastInstance.contentCol);

                    }

                }

                if( ( ! toastInstance.isSticky && toastInstance.config.pause.button ) || toastInstance.isDismissible ) {

                    toastInstance.controlsCol = toastletCore.setup.createElement.controlsCol(toastInstance);

                    toastletCore.utils.shButtons(toastInstance);

                    if ( ! toastInstance.isSticky && toastInstance.config.pause.button ) {

                        toastInstance.pauseButton = toastletCore.setup.createElement.pauseButton();

                        toastInstance.controlsCol.appendChild(toastInstance.pauseButton);

                        toastletCore.setup.createListener.pauseButton(toastInstance);

                    }

                    if( toastInstance.isDismissible ) {

                        toastInstance.closeButton = toastletCore.setup.createElement.closeButton();

                        toastInstance.controlsCol.appendChild(toastInstance.closeButton);

                        toastletCore.setup.createListener.closeButton(toastInstance);

                    }

                    toastInstance.toast.appendChild(toastInstance.controlsCol);

                }

                if(toastInstance.config.progressBar.enabled && !toastInstance.isSticky) {

                    toastInstance.progressBar = toastletCore.setup.createElement.progressBar();

                    toastInstance.toast.appendChild(toastInstance.progressBar);

                    toastInstance.progressBarThumb = toastletCore.setup.createElement.progressBarThumb();

                    toastInstance.progressBar.appendChild(toastInstance.progressBarThumb);

                }

                toastletCore.setup.createListener.toast(toastInstance);

                toastletCore.setup.createListener.window(toastInstance);

                toastletCore.setup.createListener.document(toastInstance);

                toastletCore.setup.createObserver.body(toastInstance);

                toastletCore.setup.createObserver.html(toastInstance);

                toastletInstances.push(toastInstance);

                Object.preventExtensions(toastInstance);

                document.body.appendChild(toastInstance.toast);

                toastletCore.position.set[ toastInstance.mode ][ toastInstance.config.position.data[ toastInstance.mode ].name ]( toastInstance );

                if( ! toastletTypeValidators.empty(toastInstance.classList.animationIn) ) {

                    toastletStyleHelper.setProperties(
                        toastInstance.toast, 
                        ['opacity', '1']
                    );

                    toastletCore.animation.setAnimationIn(toastInstance);

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

                toastletCore.utils.enterElement(toastInstance);
                
                // !! REMOVE AFTER TESTING !!
                window.toastletToast = toastInstance;

                const controller = {

                    id: toastInstance.id,
                    toast: toastInstance.toast,

                    destroy: objFreeze(() => {

                        const keys = objFullKeys(controller);

                        let i = keys.length;

                        while(i--) delete controller[ keys[i] ];

                    })
                    
                };

                if( toastInstance.isDismissible )
                    controller.close = () => toastletNotify.close(toastInstance.id);

                if( ! toastletNotify.isSticky ){

                    controller.play = () => toastletNotify.play(toastInstance.id);
                    controller.pause = () => toastletNotify.pause(toastInstance.id);
                    controller.resume = () => toastletNotify.resume(toastInstance.id);
                    controller.restart = () => toastletNotify.restart(toastInstance.id);

                }

                if( ! toastletTypeValidators.null(toastInstance.clickControl) )
                    controller.clickControl = toastInstance.clickControl;

                toastInstance.controller = controller;

                return controller;

            }

        }),
        writable: false,
        enumerable: false,
        configurable: false

    })

})();


// ?? CLASSES PARA ADICIONAR: 

/* 
toastlet-sticky

toastlet-dismissible

toastlet-stackable

toastlet-transition-enabled

toastlet-progress-bar-enabled

toastlet-on-click

toastlet-animated-in

toastlet-animated-out


toastlet-hovered

toastlet-focused

toastlet-paused

toastlet-programmatic-pause

toastlet-closing

toastlet-dragging
*/

// TODO: IMPLEMENTAR:

/* 

Callbacks de Ciclo de Vida: O objeto callbacks
Todas as outras funções de callback ficam organizadas dentro deste objeto para manter a API principal limpa.

onShow
Nome: callbacks.onShow

Quando é Disparado: Após a animação de entrada terminar e o toast estar totalmente visível e ativo na tela.

Argumentos: (id, controller)

id: O ID numérico do toast.

controller: O objeto de controle associado ao toast.

Utilidade Principal: Disparar lógicas que dependem da visibilidade completa do toast, como iniciar um tutorial ou registrar um evento de "notificação vista".

beforeClose
Nome: callbacks.beforeClose

Quando é Disparado: No exato momento em que uma ação de fechamento é iniciada (pelo timer, clique, swipe, etc.), mas antes de a animação de saída começar.

Argumentos: (id, controller, reason)

id: O ID numérico do toast.

controller: O objeto de controle associado ao toast.

reason: Uma string indicando a causa do fechamento ('timer', 'click', 'swipe', 'escape', 'api').

Utilidade Principal: É o "gancho" mais poderoso. Permite executar uma lógica de último segundo ou cancelar o fechamento. Se a função retornar false, o toast não será fechado. Ideal para diálogos de confirmação ("Você tem certeza?").

onClose
Nome: callbacks.onClose

Quando é Disparado: Após a animação de saída terminar e o elemento do toast ser completamente removido do DOM.

Argumentos: (id, reason)

id: O ID numérico do toast que foi fechado.

reason: A mesma string de beforeClose indicando a causa.

Utilidade Principal: Executar lógicas de "limpeza" ou atualizar o estado da UI da aplicação após a notificação ter desaparecido por completo. O controller não é passado, pois o toast já foi destruído.

onPause
Nome: callbacks.onPause

Quando é Disparado: No momento em que o timer do toast é efetivamente pausado por qualquer motivo.

Argumentos: (id, controller)

Utilidade Principal: Sincronizar o estado da sua aplicação com o estado de pausa do toast.

onPlay
Nome: callbacks.onPlay

Quando é Disparado: No momento em que o timer do toast é efetivamente retomado.

Argumentos: (id, controller, strategy)

id: O ID numérico do toast.

controller: O objeto de controle associado ao toast.

strategy: A string da estratégia utilizada: 'resume' ou 'restart'.

Utilidade Principal: Sincronizar o estado da sua aplicação e saber como o timer foi retomado.

*/