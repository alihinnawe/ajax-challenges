import TabPaneController from "../../../share/tab-pane-controller.js";
import COOKBOOK_SERVICE from "../../../share/cookbook-service.js";
import ELEMENT_FACTORY from "../../../share/element-factory.js";
import { DIET } from "./enums.js"


/**
 * Victual editor tab pane controller type.
 */
class VictualEditorTabPaneController extends TabPaneController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.victual-editor");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }

	get victualsViewerSection () { return this.center.querySelector("section.victuals-viewer"); }
	get victualsViewerTableBody () { return this.victualsViewerSection.querySelector("div.victuals>table>tbody"); }
	get victualsViewerControlDivision () { return this.victualsViewerSection.querySelector("div.control"); }
	get victualsViewerCreateButton () { return this.victualsViewerControlDivision.querySelector("button.create"); }

	get victualEditorSection () { return this.center.querySelector("section.victual-editor"); }
	get victualEditorAvatarButton () { return this.victualEditorSection.querySelector("div.avatar>button"); }
	get victualEditorAvatarViewer () { return this.victualEditorAvatarButton.querySelector("img"); }
	get victualEditorAvatarChooser () { return this.victualEditorSection.querySelector("div.avatar>input"); }
	get victualEditorAliasInput () { return this.victualEditorSection.querySelector("div.alias>input"); }
	get victualEditorDietSelector () { return this.victualEditorSection.querySelector("div.diet>select"); }
	get victualEditorDescriptionArea () { return this.victualEditorSection.querySelector("div.description>textarea"); }
	get victualEditorControlDivision () { return this.victualEditorSection.querySelector("div.control"); }
	get victualEditorSubmitButton () { return this.victualEditorControlDivision.querySelector("button.submit"); }
	get victualEditorDeleteButton () { return this.victualEditorControlDivision.querySelector("button.delete"); }
	get victualEditorCancelButton () { return this.victualEditorControlDivision.querySelector("button.cancel"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const victualsViewerSectionTemplate = await this.queryTemplate("victuals-viewer");
			this.center.append(victualsViewerSectionTemplate.content.firstElementChild.cloneNode(true));
			this.victualsViewerControlDivision.append(ELEMENT_FACTORY.createHtmlElement("button", { type: "button", innerText: "neu" }, {}, "create"));

			// register basic event listeners
			this.victualsViewerCreateButton.addEventListener("click", event => this.processDisplayVictualEditor());

			await this.#displayEditableVictuals();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries the victuals that can be edited by the current
	 * session owner, and displays them within the root section.
	 */
	async #displayEditableVictuals () {
		const victuals = await COOKBOOK_SERVICE.queryEditableVictuals(this.sessionOwner);
		// console.log(victuals);

		this.victualsViewerTableBody.innerHTML = "";
		const victualsViewerTableRowTemplate = await this.queryTemplate("victuals-viewer-row");
		for (const victual of victuals) {
			const tableRow = victualsViewerTableRowTemplate.content.firstElementChild.cloneNode(true);
			this.victualsViewerTableBody.append(tableRow);

			const accessButton = tableRow.querySelector("td.access>button");
			accessButton.addEventListener("click", event => this.processDisplayVictualEditor(victual));

			const avatarViewer = accessButton.querySelector("img");
			avatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + victual.attributes["avatar-reference"];

			const aliasItem = tableRow.querySelector("td.alias");
			aliasItem.innerText = victual.alias || "";

			const dietItem = tableRow.querySelector("td.diet");
			dietItem.innerText = DIET[victual.diet] || "";

			const modifiedItem = tableRow.querySelector("td.modified");
			modifiedItem.innerText = new Date(victual.modified).toLocaleDateString();
		}
	}


	/**
	 * Displays the given victual in a new editor section.
	 * @param victual the victual, or a new object for none
	 */
	async processDisplayVictualEditor (victual = {}) {
		if (!victual.attributes) victual.attributes = { "avatar-reference" : 1 };

		this.victualsViewerSection.classList.add("hidden");
		const victualEditorSectionTemplate = await this.queryTemplate("victual-editor");
		this.center.append(victualEditorSectionTemplate.content.firstElementChild.cloneNode(true));
		// console.log(victual);

		this.victualEditorAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + victual.attributes["avatar-reference"];
		this.victualEditorAliasInput.value = victual.alias || "";
		this.victualEditorDietSelector.value = victual.diet || "VEGAN";
		this.victualEditorDescriptionArea.value = victual.description || "";

		this.victualEditorAvatarButton.addEventListener("click", event => this.victualEditorAvatarChooser.click());
		this.victualEditorAvatarViewer.addEventListener("dragover", event => this.processAvatarTransferValidation(event.dataTransfer));
		this.victualEditorAvatarViewer.addEventListener("drop", event => this.processSubmitAvatar(victual, event.dataTransfer.files[0]));
		this.victualEditorAvatarChooser.addEventListener("change", event => this.processSubmitAvatar(victual, event.currentTarget.files[0]));

		this.victualEditorSubmitButton.addEventListener("click", event => this.processSubmitVictual(victual));
		this.victualEditorCancelButton.addEventListener("click", event => this.processCancel());
		this.victualEditorDeleteButton.addEventListener("click", event => this.processDeleteVictual(victual.identity));
		this.victualEditorDeleteButton.disabled = !victual.identity;
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
	 * Submits the given avatar file, and registers it as the given victual's avatar.
	 * @param victual the victual
	 * @param avatarFile the avatar image file
	 */
	async processSubmitAvatar (victual, avatarFile) {
		try {
			if (!avatarFile) return;
			if (!avatarFile.type || !avatarFile.type.startsWith("image/")) throw new RangeError();
			victual.attributes["avatar-reference"] = await COOKBOOK_SERVICE.insertOrUpdateDocument(avatarFile);
			this.victualEditorAvatarViewer.src = COOKBOOK_SERVICE.documentsURI + "/" + victual.attributes["avatar-reference"];

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Performs submitting the given victual's data.
	 * @param victual the victual
	 */
	async processSubmitVictual (victual) {
		try {
			victual.alias = this.victualEditorAliasInput.value.trim() || null;
			victual.diet = this.victualEditorDietSelector.value.trim() || null;
			victual.description = this.victualEditorDescriptionArea.value.trim() || null;

			victual.identity = await COOKBOOK_SERVICE.insertOrUpdateVictual(victual);
			victual.version = (victual.version || 0) + 1;

			this.victualEditorDeleteButton.disabled = false;
			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Performs deleting the associated victual.
	 * @param victualIdentity the victual identity
	 */
	async processDeleteVictual (victualIdentity) {
		try {
			await COOKBOOK_SERVICE.deleteVictual(victualIdentity);

			this.victualEditorSection.remove();
			await this.#displayEditableVictuals();
			this.victualsViewerSection.classList.remove("hidden");

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Performs removing the editor section.
	 */
	async processCancel () {
		try {
			this.victualEditorSection.remove();
			await this.#displayEditableVictuals();
			this.victualsViewerSection.classList.remove("hidden");

			this.messageOutput.value = "";
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
	const controller = new VictualEditorTabPaneController();
	console.log(controller);
});
