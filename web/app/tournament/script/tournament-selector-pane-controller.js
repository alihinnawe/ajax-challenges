import BorderPaneController from "../../../share/border-pane-controller.js";
import TOURNAMENT_SERVICE from "../../../share/tournament-service.js";
import ELEMENT_FACTORY from "../../../share/element-factory.js";
import { sleep } from "../../../share/threads.js";


/**
 * Tournament selector pane controller type.
 */
class TournamentSelectorPaneController extends BorderPaneController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super();

		this.tournamentTypes = [];
		this.tournaments = [];
		this.competitors = [];
		this.selectedTournamentType = null;
		this.selectedTournament = null;
		this.tournamentTypeSelector.innerHTML = "";
		this.tournamentSelector.innerHTML = "";

		// register basic event listeners
		this.tokenActivateButton.addEventListener("click", event => this.processActivateToken());

		this.#initialize();
	}


	// getter/setter operations
	get tournamentTypes () { return this.sharedProperties["tournament-types"]; }
	set tournamentTypes (value) { this.sharedProperties["tournament-types"] = value; }
	get tournaments () { return this.sharedProperties["tournaments"]; }
	set tournaments (value) { this.sharedProperties["tournaments"] = value; }
	get competitors () { return this.sharedProperties["competitors"]; }
	set competitors (value) { this.sharedProperties["competitors"] = value; }
	get selectedTournamentType () { return this.sharedProperties["selected-tournament-type"]; }
	set selectedTournamentType (value) { this.sharedProperties["selected-tournament-type"] = value; }
	get selectedTournament () { return this.sharedProperties["selected-tournament"]; }
	set selectedTournament (value) { this.sharedProperties["selected-tournament"] = value; }

	get selectorsDivision () { return this.top.querySelector("div.selectors"); }
	get tournamentTypeSelector () { return this.selectorsDivision.querySelector("span.tournament-type-selector"); }
	get tournamentSelector () { return this.selectorsDivision.querySelector("span.tournament-selector"); }
	get tokenAliasInput () { return this.bottom.querySelector("div.token>input"); }
	get tokenActivateButton () { return this.bottom.querySelector("div.token>button"); }

	get neutralizerTabControl () { return this.top.querySelector("nav.tabs>button.neutralizer"); }
	get groupStageEditorTabControl () { return this.top.querySelector("nav.tabs>button.group-stage-editor"); }


	/**
	 * Handles initialization.
	 */
	async #initialize () {
		try {
			this.tournamentTypes = await TOURNAMENT_SERVICE.queryTournamentTypes();
			this.tournaments = await TOURNAMENT_SERVICE.queryTournaments();
			this.competitors = await TOURNAMENT_SERVICE.queryCompetitors();

			for (const tournamentType of this.tournamentTypes) {
				const imageView = ELEMENT_FACTORY.createHtmlElement("img", {}, {}, "normal", "engraved");
				imageView.src = TOURNAMENT_SERVICE.documentsURI + "/" + tournamentType.attributes["avatar-reference"];
				imageView.title = tournamentType.association + " " + tournamentType.alias + (tournamentType.qualifier ? " (" + tournamentType.qualifier + ")" : "");
				imageView.addEventListener("click", event => this.processTournamentTypeSelection(tournamentType));

				const container = ELEMENT_FACTORY.createHtmlElement("span");
				container.append(imageView);

				this.tournamentTypeSelector.append(container);
			}

			const leftImage = this.tournamentTypeSelector.querySelector("img");
			if (leftImage) leftImage.click();
			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Performs selecting the given tournament type.
	 * @param tournamentType {Object} the tournament type
	 */
	async processTournamentTypeSelection (tournamentType) {
		this.selectedTournamentType = tournamentType;
		this.selectedTournament = null;
		this.tournamentSelector.innerHTML = "";

		try {
			const tournaments = this.tournaments.filter(tournament => tournament.attributes["type-reference"] === tournamentType.identity);
			tournaments.sort((left, right) => right.season - left.season);
			for (const tournament of tournaments)
				tournament.groups.sort((left, right) => left.alias.localeCompare(right.alias));

			for (const tournament of tournaments) {
				const imageView = ELEMENT_FACTORY.createHtmlElement("img");
				imageView.className = "normal engraved";
				imageView.src = TOURNAMENT_SERVICE.documentsURI + "/" + tournament.attributes["avatar-reference"];
				imageView.title = tournament.season;
				imageView.addEventListener("click", event => this.processTournamentSelection(tournament));

				const container = ELEMENT_FACTORY.createHtmlElement("span");
				container.append(imageView);

				this.tournamentSelector.append(container);
			}

			const leftImage = this.tournamentSelector.querySelector("img");
			if (leftImage) leftImage.click();
			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Performs selecting the given tournament.
	 * @param tournament {Object} the tournament
	 */
	async processTournamentSelection (tournament) {
		try {
			this.selectedTournament = tournament;

			this.neutralizerTabControl.click();
			await sleep(10);
			this.groupStageEditorTabControl.click();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles setting and optionally activating the associated token.
	 */
	async processActivateToken () {
		try {
			const tokenAlias = this.tokenAliasInput.value.trim();
			if (tokenAlias.length !== 16) throw new RangeError("illegal token alias entered!"); 
			this.tokenAliasInput.value = "";

			await TOURNAMENT_SERVICE.deleteDeactivatedTokens(tokenAlias);

			this.messageOutput.value = "ok."
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
	const controller = new TournamentSelectorPaneController();
	console.log(controller);
});