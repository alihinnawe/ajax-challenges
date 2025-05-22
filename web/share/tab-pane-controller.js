import BorderPaneController from "./border-pane-controller.js";


/**
 * Semi-abstract tab pane controller class which cannot be instantiated,
 * and is intended solely as a superclass. Concrete instances of
 * subclasses can dispatch controller events, and share information
 * among all such controller instances. They allow quick access to
 * the HTML tab controls, specificially the one associated with each
 * tab controller instance. They'll dispatch an "activated" event after
 * the active state changes from false to true; they'll also dispatch a
 * "deactivated" event after the active state changes from true to false.
 * Additionally, they'll realize a border pane with quick access to
 * HTML elements for center, top, bottom, left and right portions. They
 * require a HTML page with a header, a footer, and a main element
 * containing three articles with style class "left", "center" and "right"
 * respectively. Optionally, the footer may contain an input/output
 * element with style class "message".
 * @see BorderPaneController
 */
export default class TabPaneController extends BorderPaneController {
	#active;
	#tabControlSelector;


	/**
	 * Initializes a new instance.
	 * @param tabControlSelector the tab control selector, relative to it's parent nav element
	 * @throws {InternalError} if there is an attempt to instantiate this class
	 * @throws {ReferenceError} if the given argument is null or undefined
	 * @throws {TypeError} if the given argument is not a string
	 */
	constructor (tabControlSelector) {
		super();
		if (this.constructor === TabPaneController) throw new InternalError("abstract classes cannot be instantiated!");
		if (tabControlSelector == null) throw new ReferenceError();
		if (typeof tabControlSelector != "string") throw new TypeError();

		this.#active = false;
		this.#tabControlSelector = tabControlSelector;

		for (const tabControl of this.tabControls) {
			const active = tabControl === this.tabControl;
			tabControl.addEventListener("click", event => this.active = active);
		}

		this.addEventListener("activated", event => {
			for (const tabControl of this.tabControls)
				if (tabControl === this.tabControl) tabControl.classList.add("active");
				else tabControl.classList.remove("active");
		});
	}


	/**
	 * Returns the activity.
	 * @return the activity state
	 */
	get active () {
		return this.#active;
	}


	/**
	 * Sets the activity.
	 * @param value the activity state
	 * @throws {TypeError} if the given argument is not a boolean 
	 */
	set active (value) {
		if (typeof value !== "boolean") throw new TypeError();

		let event = null;
		if (!this.active && value) event = new Event("activated");
		if (this.active && !value) event = new Event("deactivated");

		this.#active = value;
		if (event) this.dispatchEvent(event);
	}


	/**
	 * Returns the tab controls.
	 * @return the tab control elements as an array
	 */
	get tabControls () {
		return Array.from(document.querySelectorAll("body nav.tabs>*:not(img.logo)"));
	}


	/**
	 * Returns the tab control.
	 * @return the tab controller's associated control element, or null for none
	 */
	get tabControl () {
		return document.querySelector("body nav.tabs>" + this.#tabControlSelector) || null;
	}
}
