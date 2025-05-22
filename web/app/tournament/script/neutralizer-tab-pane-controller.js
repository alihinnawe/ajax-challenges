import TabPaneController from "../../../share/tab-pane-controller.js";
import TOURNAMENT_SERVICE from "../../../share/tournament-service.js";
import ELEMENT_FACTORY from "../../../share/element-factory.js";


/**
 * Neutralizer tab pane controller type.
 */
class NeutralizerTabPaneController extends TabPaneController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.neutralizer");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			this.center.append(ELEMENT_FACTORY.createHtmlElement("section", {}, {}, "neutralizer"));

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}
}


/**
 * Registers an event handler for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new NeutralizerTabPaneController();
	console.log(controller);
});
