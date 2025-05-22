
/**
 * The element factory type.
 */
class ElementFactory extends Object {
	#document;
	#namespace;


	/**
	 * Initializes a new instance targeting the global HTML DOM and the SVG namespace.
	 */
	constructor () {
		super();

		this.#document = this.#namespace = null;
		this.reset();
	}


	/**
	 * Returns the target document.
	 * @return the target document
	 */
	get document () {
		return this.#document;
	}


	/**
	 * Sets the target document.
	 * @param the target document
	 */
	set document (value) {
		if (value == null) throw new ReferenceError();
		if (typeof value !== "object" || !(value instanceof Document)) throw new TypeError(value.toString());
		this.#document = value;
	}


	/**
	 * Returns the target namespace.
	 * @return the target namespace
	 */
	get namespace () {
		return this.#namespace;
	}


	/**
	 * Sets the target namespace.
	 * @param namespace the target namespace
	 */
	set namespace (value) {
		if (value == null) throw new ReferenceError();
		if (typeof value !== "string") throw new TypeError(value.toString());
		this.#namespace = value;
	}


	/**
	 * Resets to targeting the global HTML DOM and the SVG namespace.
	 */
	reset () {
		this.#document = document;
		this.#namespace = "http://www.w3.org/2000/svg";
	}


	/**
	 * Creates and returns a new HTML element.
	 * @param localName the element tag
	 * @param properties the (optional) element properties
	 * @param attributes the (optional) element attributes
	 * @param styleClasses the (optional) element style classes
	 * @return the HTML element created
	 */
	createHtmlElement (localName, properties = {}, attributes = {}, ...styleClasses) {
		if (typeof localName != "string" || typeof properties != "object" || typeof attributes != "object" || !(styleClasses instanceof Array)) throw new TypeError();
		if (!localName) throw new RangeError();

		const element = this.#document.createElement(localName);
		for (const key in properties)
			element[key] = properties[key];
		for (const key in attributes)
			element.setAttribute(key, attributes[key]);
		for (const styleClass of styleClasses)
			element.classList.add(styleClass);

		return element;
	}


	/**
	 * Creates and returns a new namespace  element.
	 * @param localName the element tag
	 * @param properties the (optional) element properties
	 * @param attributes the (optional) element attributes
	 * @param styleClasses the (optional) element style classes
	 * @return the namespace element created
	 */
	createNamespaceElement (localName, properties = {}, attributes = {}, ...styleClasses) {
		if (typeof localName != "string" || typeof properties != "object" || typeof attributes != "object" || !(styleClasses instanceof Array)) throw new TypeError();
		if (!localName) throw new RangeError();

		const element = this.#document.createElementNS(this.#namespace, localName);
		for (const key in properties)
			element[key] = properties[key];
		for (const key in attributes)
			element.setAttributeNS(null, key, attributes[key]);
		for (const styleClass of styleClasses)
			element.classList.add(styleClass);

		return element;
	}


	/**
	 * Returns a newly created coordinates text.
	 * @param coordinates the alternating horizontal and vertical coordinates
	 * @return the coordinates text created
	 * @throws {TypeError} if the number of given coordinates is not even,
	 *                     or if any of the given coordinates is not a number
	 */
	createCoordinatesText (...coordinates) {
		if (coordinates.length % 2 !== 0) throw new TypeError();
		for (const coordinate of coordinates)
			if (typeof coordinate !== "number") throw new TypeError();

		let coordinatesText = "";
		for (let index = 0; index < coordinates.length; ++index)
			coordinatesText += coordinates[index] + (index % 2 === 0 ? "," : " ");
		return coordinatesText.trim();
	}
}


// exports the element factory singleton instance
const ELEMENT_FACTORY = new ElementFactory();
export default ELEMENT_FACTORY;
