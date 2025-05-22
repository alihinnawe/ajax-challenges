import TabPaneController from "../../../share/tab-pane-controller.js";
import TOURNAMENT_SERVICE from "../../../share/tournament-service.js";


/**
 * Knockout stage editor tab pane controller type.
 */
class KnockoutStageEditorTabPaneController extends TabPaneController {

	/**
	 * Initializes a new controller instance.
	 */
	constructor () {
		super("button.knockout-stage-editor");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get competitors () { return this.sharedProperties["competitors"]; }
	get selectedTournament () { return this.sharedProperties["selected-tournament"]; }

	get knockoutStageEditorSection () { return this.center.querySelector("section.knockout-stage-editor"); }
	get knockoutTiersDivision () { return this.knockoutStageEditorSection.querySelector("div.tiers"); }
	get controlDivision () { return this.knockoutStageEditorSection.querySelector("div.control"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		if (!this.selectedTournament) return;
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const knockoutStageEditorSectionTemplate = await this.queryTemplate("knockout-stage-editor");
			this.center.append(knockoutStageEditorSectionTemplate.content.cloneNode(true).firstElementChild);

			await this.#refreshMatchTiers();
			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Refreshes the knockout tiers.
	 */
	async #refreshMatchTiers () {
		const matches = await TOURNAMENT_SERVICE.queryTournamentMatches(this.selectedTournament.identity);

		const knockoutTiers = [[ matches[matches.length - 1] ]];
		while (knockoutTiers[0].length > 0) {
			const parentMatches = [];
			for (const match of knockoutTiers[0]) {
				const leftParentMatch = matches.find(m => m.identity === match.attributes["left-parent-reference"]);
				const rightParentMatch = matches.find(m => m.identity === match.attributes["right-parent-reference"]);
				if (leftParentMatch) parentMatches.push(leftParentMatch);
				if (rightParentMatch) parentMatches.push(rightParentMatch);
			}
			knockoutTiers.unshift(parentMatches);
		}
		knockoutTiers.shift();

		this.knockoutTiersDivision.innerHTML = "";
		const knockoutTierDivisionTemplate = await this.queryTemplate("knockout-tier-division");
		const knockoutMatchDivisionTemplate = await this.queryTemplate("knockout-match-division");
		for (const knockoutMatches of knockoutTiers) {
			const knockoutTierDivision = knockoutTierDivisionTemplate.content.cloneNode(true).firstElementChild;
			knockoutTierDivision.querySelector("output.name").value = "1/" + knockoutMatches.length + " Final";
			this.knockoutTiersDivision.append(knockoutTierDivision);

			const knockoutMatchesDivision = knockoutTierDivision.querySelector("div.matches");
			for (const knockoutMatch of knockoutMatches) {
				const knockoutMatchDivision = knockoutMatchDivisionTemplate.content.cloneNode(true).firstElementChild;
				knockoutMatchesDivision.append(knockoutMatchDivision);

				const topCompetitorDivision = knockoutMatchDivision.querySelector("div.competitor.top");
				const topCompetitorAvatarView = topCompetitorDivision.querySelector("img.avatar");
				const topCompetitorNameOutput = topCompetitorDivision.querySelector("output.name");
				const topCompetitorScoreInput = topCompetitorDivision.querySelector("input.score");
				const bottomCompetitorDivision = knockoutMatchDivision.querySelector("div.competitor.bottom");
				const bottomCompetitorAvatarView = bottomCompetitorDivision.querySelector("img.avatar");
				const bottomCompetitorNameOutput = bottomCompetitorDivision.querySelector("output.name");
				const bottomCompetitorScoreInput = bottomCompetitorDivision.querySelector("input.score");

				const leftCompetitor = this.competitors.find(competitor => competitor.identity === knockoutMatch.attributes["left-competitor-reference"]);
				const rightCompetitor = this.competitors.find(competitor => competitor.identity === knockoutMatch.attributes["right-competitor-reference"]);
				topCompetitorAvatarView.src = TOURNAMENT_SERVICE.documentsURI + "/" + leftCompetitor.attributes["avatar-reference"];
				topCompetitorAvatarView.title = leftCompetitor.alias;
				topCompetitorNameOutput.value = leftCompetitor.name;
				topCompetitorScoreInput.value = knockoutMatch.leftScore;
				bottomCompetitorAvatarView.src = TOURNAMENT_SERVICE.documentsURI + "/" + rightCompetitor.attributes["avatar-reference"];
				bottomCompetitorAvatarView.title = rightCompetitor.alias;
				bottomCompetitorNameOutput.value = rightCompetitor.name;
				bottomCompetitorScoreInput.value = knockoutMatch.rightScore;

				const eventListener = event => this.processSubmitMatchScores(knockoutMatch, window.parseInt(topCompetitorScoreInput.value.trim()) || 0, window.parseInt(bottomCompetitorScoreInput.value.trim()) || 0);
				topCompetitorScoreInput.addEventListener("change", eventListener);
				bottomCompetitorScoreInput.addEventListener("change", eventListener);
			}
		}
	}


	/**
	 * Handles updating the scores of a match.
	 * @param match {Object} the match
	 * @param leftScore {number} the left score
	 * @param rightScore {number} the right score
	 */
	async processSubmitMatchScores (match, leftScore, rightScore) {
		try {
			match.leftScore  = leftScore;
			match.rightScore = rightScore;

			await TOURNAMENT_SERVICE.updateTournamentMatch(match);
			await this.#refreshMatchTiers();

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
	const controller = new KnockoutStageEditorTabPaneController();
	console.log(controller);
});