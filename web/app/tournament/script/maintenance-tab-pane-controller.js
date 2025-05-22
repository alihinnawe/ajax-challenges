import TabPaneController from "../../../share/tab-pane-controller.js";
import TOURNAMENT_SERVICE from "../../../share/tournament-service.js";
import ELEMENT_FACTORY from "../../../share/element-factory.js";


/**
 * Maintenance tab pane controller type.
 */
class MaintenanceTabPaneController extends TabPaneController {

	/**
	 * Initializes a new controller instance.
	 */
	constructor () {
		super("button.maintenance");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get tournamentTypes () { return this.sharedProperties["tournament-types"]; }
	set tournamentTypes (values) { this.sharedProperties["tournament-types"] = values; }
	get tournaments () { return this.sharedProperties["tournaments"]; }
	set tournaments (values) { this.sharedProperties["tournaments"] = values; }
	get competitors () { return this.sharedProperties["competitors"]; }
	set competitors (values) { this.sharedProperties["competitors"] = values; }

	get entitiesViewerSection () { return this.center.querySelector("section.entities-viewer"); }
	get entitiesViewerTableBody () { return this.entitiesViewerSection.querySelector("div.entities>table>tbody"); }
	get entitiesViewerControlDivision () { return this.entitiesViewerSection.querySelector("div.control"); }
	get entitiesViewerRefreshButton () { return this.entitiesViewerControlDivision.querySelector("button.refresh"); }
	get entitiesViewerCreateButton () { return this.entitiesViewerControlDivision.querySelector("button.create"); }
	get entitiesViewerDiscriminatorSelector () { return this.entitiesViewerControlDivision.querySelector("select.discriminator"); }

	get entityEditorSection () { return this.center.querySelector("section.competitor-editor,section.tournament-editor,section.tournament-type-editor"); }
	get entityEditorAvatarDivision () { return this.entityEditorSection.querySelector("div.data>div.avatar"); }
	get entityEditorAvatarButton () { return this.entityEditorAvatarDivision.querySelector("button"); }
	get entityEditorAvatarViewer () { return this.entityEditorAvatarButton.querySelector("img"); }
	get entityEditorAvatarChooser () { return this.entityEditorAvatarDivision.querySelector("input"); }
	get entityEditorControlDivision () { return this.entityEditorSection.querySelector("div.control"); }
	get entityEditorSubmitButton () { return this.entityEditorControlDivision.querySelector("button.submit"); }
	get entityEditorCancelButton () { return this.entityEditorControlDivision.querySelector("button.cancel"); }

	get competitorEditorSection () { return this.center.querySelector("section.competitor-editor"); }
	get competitorEditorAliasInput () { return this.competitorEditorSection.querySelector("div.data>div.alias>input"); }
	get competitorEditorNameInput () { return this.competitorEditorSection.querySelector("div.data>div.name>input"); }

	get tournamentEditorSection () { return this.center.querySelector("section.tournament-editor"); }
	get tournamentEditorTypeSelector () { return this.tournamentEditorSection.querySelector("div.data>div.type>select"); }
	get tournamentEditorSeasonInput () { return this.tournamentEditorSection.querySelector("div.data>div.season>input"); }
	get tournamentEditorGroupsInput () { return this.tournamentEditorSection.querySelector("div.data>div.groups>input"); }
	get tournamentEditorPointsPerWinInput () { return this.tournamentEditorSection.querySelector("div.data>div.points-per-win>input"); }
	get tournamentEditorPointsPerDrawInput () { return this.tournamentEditorSection.querySelector("div.data>div.points-per-draw>input"); }
	get tournamentEditorPointsPerLossInput () { return this.tournamentEditorSection.querySelector("div.data>div.points-per-loss>input"); }

	get tournamentTypeEditorSection () { return this.center.querySelector("section.tournament-type-editor"); }
	get tournamentTypeEditorAssociationInput () { return this.tournamentTypeEditorSection.querySelector("div.data>div.association>input"); }
	get tournamentTypeEditorAliasInput () { return this.tournamentTypeEditorSection.querySelector("div.data>div.alias>input"); }
	get tournamentTypeEditorQualifierInput () { return this.tournamentTypeEditorSection.querySelector("div.data>div.qualifier>input"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const entitiesViewerSectionTemplate = await this.queryTemplate("entities-viewer");
			this.center.append(entitiesViewerSectionTemplate.content.cloneNode(true).firstElementChild);

			this.entitiesViewerCreateButton.addEventListener("click", event => this.processDisplayEntityEditor({ "identity": 0, "properties": { "discriminator": this.entitiesViewerDiscriminatorSelector.value }}));
			this.entitiesViewerRefreshButton.addEventListener("click", event => this.processQueryAllEntities());
			this.entitiesViewerRefreshButton.click();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries and displays all existing entities.
	 */
	async processQueryAllEntities () {
		try {
			const entities = await TOURNAMENT_SERVICE.queryEntities();
			this.tournamentTypes = entities.filter(entity => entity.attributes["discriminator"] === "TournamentType");
			this.tournaments = entities.filter(entity => entity.attributes["discriminator"] === "Tournament");
			this.competitors = entities.filter(entity => entity.attributes["discriminator"] === "Competitor");

			this.entitiesViewerTableBody.innerHTML = "";
			const entitiesViewerTableRowTemplate = await this.queryTemplate("entities-viewer-row");
			for (const entity of entities) {
				const tableRow = entitiesViewerTableRowTemplate.content.cloneNode(true).firstElementChild;
				this.entitiesViewerTableBody.append(tableRow);

				const avatarItem = tableRow.querySelector("td.avatar");
				const identityItem = tableRow.querySelector("td.identity");
				const discriminatorItem = tableRow.querySelector("td.discriminator");
				const dataItem = tableRow.querySelector("td.data");
				const actionItem = tableRow.querySelector("td.action");
				const editButton = actionItem.querySelector("button.edit");
				const deleteButton = actionItem.querySelector("button.delete");

				if ("avatar-reference" in entity.attributes) {
					const avatarView = ELEMENT_FACTORY.createHtmlElement("img");
					avatarView.src = TOURNAMENT_SERVICE.documentsURI + "/" + entity.attributes["avatar-reference"];
					avatarItem.append(avatarView);
				}

				identityItem.innerText = entity.identity.toString();
				discriminatorItem.innerText = entity.attributes["discriminator"];
				editButton.addEventListener("click", event => this.processDisplayEntityEditor(entity));
				deleteButton.addEventListener("click", event => this.processDeleteEntity(entity));

				switch (entity.attributes["discriminator"]) {
					default: {
						dataItem.innerText = "-";
						break;
					}
					case "Document": {
						dataItem.innerText = entity.description || (entity.type + " (" + entity.attributes["size"] + " bytes)");
						deleteButton.disabled = false;
						if (entity.type.startsWith("image/")) {
							const avatarView = ELEMENT_FACTORY.createHtmlElement("img");
							avatarView.src = TOURNAMENT_SERVICE.documentsURI + "/" + entity.identity;
							avatarItem.append(avatarView);
						}
						break;
					}
					case "Competitor": {
						dataItem.innerText = entity.name + " (" + entity.alias + ")";
						deleteButton.disabled = editButton.disabled = false;
						break;
					}
					case "TournamentType": {
						dataItem.innerText = entity.association + " " + entity.alias + (entity.qualifier ? " (" + entity.qualifier + ")" : "");
						deleteButton.disabled = editButton.disabled = false;
						break;
					}
					case "Tournament": {
						const tournamentType = this.tournamentTypes.find(type => type.identity === entity.attributes["type-reference"]);
						dataItem.innerText = tournamentType.association + " " + tournamentType.alias + (tournamentType.qualifier ? " (" + tournamentType.qualifier + ")" : "") + " - " + entity.season;
						deleteButton.disabled = editButton.disabled = false;
						break;
					}
					case "Group": {
						dataItem.innerText = entity.attributes["tournament-reference"] + ": " + entity.alias;
						break;
					}
					case "Match": {
						const leftCompetitor = this.competitors.find(competitor => competitor.identity === entity.attributes["left-competitor-reference"]);
						const rightCompetitor = this.competitors.find(competitor => competitor.identity === entity.attributes["right-competitor-reference"]);
						dataItem.innerText = entity.attributes["tournament-reference"] + ": " + leftCompetitor.name + " vs. " + rightCompetitor.name;
						if (entity.leftScore != null & entity.rightScore != null)
							dataItem.innerText += " " + entity.leftScore + "-" + entity.rightScore;
						break;
					}
				}
			}

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles displaying an editor for the given entity.
	 * @param {Object} entity the competitor, tournament or tournament type
	 */
	async processDisplayEntityEditor (entity) {
		try {
			if (entity.attributes["discriminator"] !== "Competitor" && entity.attributes["discriminator"] !== "Tournament" && entity.attributes["discriminator"] !== "TournamentType") throw new TypeError();
			this.entitiesViewerSection.classList.add("hidden");

			if (entity.attributes["discriminator"] === "Competitor") {
				const competitorEditorSectionTemplate = await this.queryTemplate("competitor-editor"); 
				this.center.append(competitorEditorSectionTemplate.content.cloneNode(true).firstElementChild);
				this.competitorEditorAliasInput.value = entity.alias || "";
				this.competitorEditorNameInput.value = entity.name || "";
			} else if (entity.attributes["discriminator"] === "Tournament") {
				const tournamentEditorSectionTemplate = await this.queryTemplate("tournament-editor"); 
				this.center.append(tournamentEditorSectionTemplate.content.cloneNode(true).firstElementChild);
				this.tournamentEditorSeasonInput.value = (entity.season || 2000).toString();
				this.tournamentEditorGroupsInput.value = entity.groups.map(group => group.alias).sort().join(", ");
				this.tournamentEditorPointsPerWinInput.value = (entity.pointsPerWin || 3).toString();
				this.tournamentEditorPointsPerDrawInput.value = (entity.pointsPerDraw || 1).toString();
				this.tournamentEditorPointsPerLossInput.value = (entity.pointsPerLoss || 0).toString();

				for (const tournamentType of this.tournamentTypes) {
					const optionElement = ELEMENT_FACTORY.createHtmlElement("option");
					optionElement.value = tournamentType.identity.toString();
					optionElement.innerText = tournamentType.association + " " + tournamentType.alias + (tournamentType.qualifier ? " (" + tournamentType.qualifier + ")" : "");
					this.tournamentEditorTypeSelector.append(optionElement);
				}

				this.tournamentEditorTypeSelector.value = (entity.type || this.tournamentTypes[0]).identity.toString();
			} else {
				const tournamentTypeEditorSectionTemplate = await this.queryTemplate("tournament-type-editor"); 
				this.center.append(tournamentTypeEditorSectionTemplate.content.cloneNode(true).firstElementChild);
				this.tournamentTypeEditorAssociationInput.value = entity.association || "";
				this.tournamentTypeEditorAliasInput.value = entity.alias || "";
				this.tournamentTypeEditorQualifierInput.value = entity.qualifier || "";
			}

			this.entityEditorAvatarViewer.src = TOURNAMENT_SERVICE.documentsURI + "/" + entity.attributes["avatar-reference"];
			this.entityEditorAvatarButton.addEventListener("click", event => this.entityEditorAvatarChooser.click());
			this.entityEditorAvatarViewer.addEventListener("dragover", event => this.processAvatarTransferValidation(event.dataTransfer));
			this.entityEditorAvatarViewer.addEventListener("drop", event => this.processSubmitAvatar(entity, event.dataTransfer.files[0]));
			this.entityEditorAvatarChooser.addEventListener("change", event => this.processSubmitAvatar(entity, event.currentTarget.files[0]));
			this.entityEditorSubmitButton.addEventListener("click", event => this.processSubmitEntity(entity));
			this.entityEditorCancelButton.addEventListener("click", event => this.processCancel());

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Validates the given data transfer, solely allowing drops of image files.
	 * @param dataTransfer the image transfer
	 */
	async processAvatarTransferValidation (dataTransfer) {
		const primaryItem = dataTransfer.items[0];
		dataTransfer.dropEffect = primaryItem.kind === "file" && primaryItem.type && primaryItem.type.startsWith("image/") ? "copy" : "none";
	}


	/**
	 * Submits the given avatar file, and registers it as the given entity's avatar.
	 * @param entity the entity
	 * @param avatarFile the avatar image file
	 */
	async processSubmitAvatar (entity, avatarFile) {
		try {
			if (!avatarFile) return;
			if (!avatarFile.type || !avatarFile.type.startsWith("image/")) throw new RangeError();
			entity.attributes["avatar-reference"] = await TOURNAMENT_SERVICE.insertOrUpdateDocument(avatarFile);
			this.entityEditorAvatarViewer.src = TOURNAMENT_SERVICE.documentsURI + "/" + entity.attributes["avatar-reference"];

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles submitting the given entity.
	 * @param {Object} entity the entity
	 */
	async processSubmitEntity (entity) {
		try {
			if (entity.attributes["discriminator"] !== "Competitor" && entity.attributes["discriminator"] !== "Tournament" && entity.attributes["discriminator"] !== "TournamentType") throw new TypeError();
			if (entity.attributes["discriminator"] === "Competitor") {
				entity.alias = this.competitorEditorAliasInput.value.trim() || null;
				entity.name = this.competitorEditorNameInput.value.trim() || null;
			} else if (entity.attributes["discriminator"] === "Tournament") {
				const tournamentTypeReference = window.parseInt(this.tournamentEditorTypeSelector.value.trim());
				entity.type = this.tournamentTypes.find(type => type.identity === tournamentTypeReference);
				entity.season = window.parseInt(this.tournamentEditorSeasonInput.value.trim());
				entity.pointsPerWin = window.parseFloat(this.tournamentEditorPointsPerWinInput.value.trim());
				entity.pointsPerDraw = window.parseFloat(this.tournamentEditorPointsPerDrawInput.value.trim());
				entity.pointsPerLoss = window.parseFloat(this.tournamentEditorPointsPerLossInput.value.trim());
			} else {
				entity.association = this.tournamentTypeEditorAssociationInput.value.trim() || null;
				entity.alias = this.tournamentTypeEditorAliasInput.value.trim() || null;
				entity.qualifier = this.tournamentTypeEditorQualifierInput.value.trim() || null;
			}

			await TOURNAMENT_SERVICE.insertOrUpdateEntity(entity);

			for (const section of this.center.querySelectorAll("section"))
				if (section === this.entitiesViewerSection) section.classList.remove("hidden");
				else section.remove();
			this.entitiesViewerRefreshButton.click();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles canceling the current editing.
	 */
	async processCancel () {
		try {
			for (const section of this.center.querySelectorAll("section"))
				if (section === this.entitiesViewerSection) section.classList.remove("hidden");
				else section.remove();
			this.entitiesViewerRefreshButton.click();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles deleting the given entity.
	 * @param {Object} entity the entity
	 */
	async processDeleteEntity (entity) {
		try {
			await TOURNAMENT_SERVICE.deleteEntity(entity);

			this.entitiesViewerRefreshButton.click();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}
}



/*
 * Registers an event listener for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new MaintenanceTabPaneController();
	console.log(controller);
});