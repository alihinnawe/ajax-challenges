import TabPaneController from "../../../share/tab-pane-controller.js";
import COOKBOOK_SERVICE from "../../../share/cookbook-service.js";
import ELEMENT_FACTORY from "../../../share/element-factory.js";
import { sleep } from "../../../share/threads.js";


/**
 * Preferences editor tab pane controller type.
 */
class PreferencesEditorTabPaneController extends TabPaneController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.preferences-editor");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }
	get authenticatorTabControl () { return this.tabControls.find(tabControl => tabControl.classList.contains("authenticator")); }

	get preferencesEditorSection () { return this.center.querySelector("section.preferences-editor"); }
	get preferencesEditorAddButton () { return this.preferencesEditorSection.querySelector("fieldset.phones>button.add"); }
	get preferencesEditorSubmitButton () { return this.preferencesEditorSection.querySelector("div.control>button.submit"); }
	get preferencesEditorAvatarButton () { return this.preferencesEditorSection.querySelector("div.avatar>button"); }
	get preferencesEditorAvatarViewer () { return this.preferencesEditorAvatarButton.querySelector("img"); }
	get preferencesEditorAvatarChooser () { return this.preferencesEditorSection.querySelector("div.avatar>input"); }
	get preferencesEditorEmailInput () { return this.preferencesEditorSection.querySelector("div.email>input"); }
	get preferencesEditorPasswordInput () { return this.preferencesEditorSection.querySelector("div.password>input"); }
	get preferencesEditorGroupSelector () { return this.preferencesEditorSection.querySelector("div.group>select"); }
	get preferencesEditorTitleInput () { return this.preferencesEditorSection.querySelector("div.title>input"); }
	get preferencesEditorSurnameInput () { return this.preferencesEditorSection.querySelector("div.surname>input"); }
	get preferencesEditorForenameInput () { return this.preferencesEditorSection.querySelector("div.forename>input"); }
	get preferencesEditorPostcodeInput () { return this.preferencesEditorSection.querySelector("div.postcode>input"); }
	get preferencesEditorStreetInput () { return this.preferencesEditorSection.querySelector("div.street>input"); }
	get preferencesEditorCityInput () { return this.preferencesEditorSection.querySelector("div.city>input"); }
	get preferencesEditorCountryInput () { return this.preferencesEditorSection.querySelector("div.country>input"); }
	get preferencesEditorPhonesSpan () { return this.preferencesEditorSection.querySelector("fieldset.phones>span.phones"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const preferencesEditorSectionTemplate = await this.queryTemplate("preferences-editor");
			this.center.append(preferencesEditorSectionTemplate.content.firstElementChild.cloneNode(true));
			// console.log(this.sessionOwner);

			// register basic event listeners
			this.preferencesEditorAddButton.addEventListener("click", event => this.preferencesEditorPhonesSpan.append(ELEMENT_FACTORY.createHtmlElement("input", { type: "tel" })));
			this.preferencesEditorSubmitButton.addEventListener("click", event => this.processSubmitPerson(this.sessionOwner));
			this.preferencesEditorAvatarButton.addEventListener("click", event => this.preferencesEditorAvatarChooser.click());
			this.preferencesEditorAvatarViewer.addEventListener("dragover", event => this.processAvatarTransferValidation(event.dataTransfer));
			this.preferencesEditorAvatarViewer.addEventListener("drop", event => this.processSubmitAvatar(this.sessionOwner, event.dataTransfer.files[0]));
			this.preferencesEditorAvatarChooser.addEventListener("change", event => this.processSubmitAvatar(this.sessionOwner, event.currentTarget.files[0]));

			await this.#displayPerson(this.sessionOwner);

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Displays the given person's data.
	 * @param person the person
	 */
	async #displayPerson (person) {
		this.preferencesEditorAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + person.attributes["avatar-reference"];
		this.preferencesEditorEmailInput.value = person.email || "";
		this.preferencesEditorGroupSelector.value = person.group;
		this.preferencesEditorTitleInput.value = person.name.title || "";
		this.preferencesEditorSurnameInput.value = person.name.family || "";
		this.preferencesEditorForenameInput.value = person.name.given || "";
		this.preferencesEditorPostcodeInput.value = person.address.postcode || "";
		this.preferencesEditorStreetInput.value = person.address.street || "";
		this.preferencesEditorCityInput.value = person.address.city || "";
		this.preferencesEditorCountryInput.value = person.address.country || "";

		this.preferencesEditorPhonesSpan.innerHTML = "";
		for (const phone of person.phones)
			this.preferencesEditorPhonesSpan.append(ELEMENT_FACTORY.createHtmlElement("input", { type: "tel", value: phone }));

		await sleep(100);
		this.preferencesEditorPasswordInput.value = "";
	}


	/**
	 * Validates the given data transfer, solely allowing drops of image files.
	 * @param dataTransfer the data transfer
	 */
	async processAvatarTransferValidation (dataTransfer) {
		const primaryItem = dataTransfer.items[0];
		dataTransfer.dropEffect = primaryItem.kind === "file" && primaryItem.type && primaryItem.type.startsWith("image/") ? "copy" : "none";
	}


	/**
	 * Submits the given avatar file, and registers it as the given person's avatar.
	 * @param person the person
	 * @param avatarFile the avatar image file
	 */
	async processSubmitAvatar (person, avatarFile) {
		try {
			if (!avatarFile) return;
			if (!avatarFile.type || !avatarFile.type.startsWith("image/")) throw new RangeError();
			person.attributes["avatar-reference"] = await COOKBOOK_SERVICE.insertOrUpdateDocument(avatarFile);
			this.preferencesEditorAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + person.attributes["avatar-reference"];

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Performs submitting the given person's data.
	 * @param person the person
	 */
	async processSubmitPerson (person) {
		try {
			const password = this.preferencesEditorPasswordInput.value.trim() || null;
			const personClone = window.structuredClone(person);
			personClone.email = this.preferencesEditorEmailInput.value.trim() || null;
			personClone.group = this.preferencesEditorGroupSelector.value.trim() || null;
			personClone.name.title = this.preferencesEditorTitleInput.value.trim() || null;
			personClone.name.family = this.preferencesEditorSurnameInput.value.trim() || null;
			personClone.name.given = this.preferencesEditorForenameInput.value.trim() || null;
			personClone.address.postcode = this.preferencesEditorPostcodeInput.value.trim() || null;
			personClone.address.street = this.preferencesEditorStreetInput.value.trim() || null;
			personClone.address.city = this.preferencesEditorCityInput.value.trim() || null;
			personClone.address.country = this.preferencesEditorCountryInput.value.trim() || null;

			personClone.phones.length = 0;
			for (const phoneField of this.preferencesEditorPhonesSpan.querySelectorAll("input")) {
				const phone = phoneField.value.trim() || null;
				if (phone) personClone.phones.push(phone);
			}

			await COOKBOOK_SERVICE.insertOrUpdatePerson(personClone, password);
			this.messageOutput.value = "ok.";

			if (personClone.email !== person.email || password) {
				this.authenticatorTabControl.click();
			} else {
				for (const key in personClone)
					person[key] = personClone[key];
				person.version = (person.version || 0) + 1;
				await this.#displayPerson(person);
			}
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
	const controller = new PreferencesEditorTabPaneController();
	console.log(controller);
});
