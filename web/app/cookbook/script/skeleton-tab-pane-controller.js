import TabPaneController from "../../../share/tab-pane-controller.js";
import COOKBOOK_SERVICE from "../../../share/cookbook-service.js";


/**
 * Any tab pane controller type.
 */
class SkeletonTabPaneController extends TabPaneController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.<style-class>");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
		// this.addEventListener("deactivated", event => this.processDeactivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const sectionTemplate = await this.queryTemplate("<template-name>");
			this.center.append(sectionTemplate.content.firstElementChild.cloneNode(true));

			// TODO: register basic event listeners

			// TODO: optionally do something else

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
	const controller = new SkeletonTabPaneController();
	console.log(controller);
});
