import TabPaneController from "../../../share/tab-pane-controller.js";
import RADIO_SERVICE from "../../../share/radio-service.js";


/**
 * Authenticator tab pane controller type.
 */
class AuthenticatorTabPaneController extends TabPaneController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.authenticator");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
		this.addEventListener("deactivated", event => this.processDeactivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }
	set sessionOwner (value) { this.sharedProperties["session-owner"] = value; }
	get audioMixer () { return this.sharedProperties["audio-context"]; }
	set audioMixer (value) { this.sharedProperties["audio-context"] = value; }

	get authenticatorSection () { return this.center.querySelector("section.authenticator"); }
	get authenticatorButton () { return this.authenticatorSection.querySelector("div.control>button.authenticate"); }
	get authenticatorEmailInput () { return this.authenticatorSection.querySelector("div.email>input"); }
	get authenticatorPasswordInput () { return this.authenticatorSection.querySelector("div.password>input"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		this.tabControl.innerText = "Login";
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const authenticatorSectionTemplate = await this.queryTemplate("authenticator");
			this.center.append(authenticatorSectionTemplate.content.firstElementChild.cloneNode(true));

			// register basic event listeners
			this.authenticatorButton.addEventListener("click", event => this.processAuthentication());

			// disable all other tab controls
			for (const tabControl of this.tabControls)
				tabControl.disabled = tabControl !== this.tabControl;

			// log out the current session owner
			try {
				this.sessionOwner = null;
				await RADIO_SERVICE.findRequester("", "");
			} catch (error) {
				// do nothing
			} finally {
				console.log("logout complete.")
			}

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles that activity has changed from true to false.
	 */
	async processDeactivated () {
		this.tabControl.innerText = "Logout";
	}


	/**
	 * Performs user authentication.
	 */
	async processAuthentication () {
		try {
			// perform autentication
			const email = this.authenticatorEmailInput.value.trim() || null;
			const password = this.authenticatorPasswordInput.value.trim() || null;
			this.sessionOwner = await RADIO_SERVICE.findRequester(email, password);

			// enable all tab controls
			for (const tabControl of this.tabControls)
				tabControl.disabled = false;

			// initialize the audio mixer
			if (!this.audioMixer) this.audioMixer = new AudioContext();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}
}


/**
 * Registers an event listener for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new AuthenticatorTabPaneController();
	console.log(controller);

	// activate initial tab
	if (controller.tabControl) controller.tabControl.click();
});
