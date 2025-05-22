import TabPaneController from "../../../share/tab-pane-controller.js";
import TOURNAMENT_SERVICE from "../../../share/tournament-service.js";


/**
 * Group stage editor tab pane controller type.
 */
class GroupStageEditorTabPaneController extends TabPaneController {

	/**
	 * Initializes a new controller instance.
	 */
	constructor () {
		super("button.group-stage-editor");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get competitors () { return this.sharedProperties["competitors"]; }
	get selectedTournament () { return this.sharedProperties["selected-tournament"]; }

	get groupStageEditorSection () { return this.center.querySelector("section.group-stage-editor"); }
	get groupsDivision () { return this.groupStageEditorSection.querySelector("div.groups"); }
	get controlDivision () { return this.groupStageEditorSection.querySelector("div.control"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		if (!this.selectedTournament) return;
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const groupStageEditorSectionTemplate = await this.queryTemplate("group-stage-editor");
			this.center.append(groupStageEditorSectionTemplate.content.cloneNode(true).firstElementChild);

			await this.#refreshGroups();
			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Refreshes the groups.
	 */
	async #refreshGroups () {
		const matches = await TOURNAMENT_SERVICE.queryTournamentMatches(this.selectedTournament.identity);
		const groups = this.selectedTournament.groups;

		this.groupsDivision.innerHTML = "";
		const groupDivisionTemplate = await this.queryTemplate("group-division");
		const groupMatchDivisionTemplate = await this.queryTemplate("group-match-division");
		for (const group of groups) {
			const groupMatches = matches.filter(match => match.attributes["group-reference"] === group.identity);

			const groupDivision = groupDivisionTemplate.content.firstElementChild.cloneNode(true);
			this.groupsDivision.append(groupDivision);
			groupDivision.querySelector("h1>output.alias").value = group.alias;

			const groupMatchesDivision = groupDivision.querySelector("div.matches");
			for (const groupMatch of groupMatches) {
				const groupMatchDivision = groupMatchDivisionTemplate.content.firstElementChild.cloneNode(true);
				groupMatchesDivision.append(groupMatchDivision);

				const competitorsSpan = groupMatchDivision.querySelector("span.competitors");
				const scoresSpan = groupMatchDivision.querySelector("span.scores");
				const leftCompetitorImageView  = competitorsSpan.querySelector("img.left");
				const leftCompetitorOutput  = competitorsSpan.querySelector("output.left");
				const rightCompetitorOutput = competitorsSpan.querySelector("output.right");
				const rightCompetitorImageView = competitorsSpan.querySelector("img.right");
				const leftScoreInput  = scoresSpan.querySelector("input.left");
				const rightScoreInput = scoresSpan.querySelector("input.right");

				const leftCompetitor = this.competitors.find(competitor => competitor.identity === groupMatch.attributes["left-competitor-reference"]);
				const rightCompetitor = this.competitors.find(competitor => competitor.identity === groupMatch.attributes["right-competitor-reference"]);
				leftCompetitorImageView.src = TOURNAMENT_SERVICE.documentsURI + "/" + leftCompetitor.attributes["avatar-reference"];
				leftCompetitorImageView.title = leftCompetitor.name;
				leftCompetitorOutput.value  = leftCompetitor.alias;
				rightCompetitorOutput.value = rightCompetitor.alias;
				rightCompetitorImageView.title = rightCompetitor.name;
				rightCompetitorImageView.src = TOURNAMENT_SERVICE.documentsURI + "/" + rightCompetitor.attributes["avatar-reference"];
				leftScoreInput.value  = groupMatch.leftScore  == null ? "" : groupMatch.leftScore.toString();
				rightScoreInput.value = groupMatch.rightScore == null ? "" : groupMatch.rightScore.toString();

				const eventListener = event => this.processSubmitMatchScores(groupMatch, window.parseInt(leftScoreInput.value.trim()) || 0, window.parseInt(rightScoreInput.value.trim()) || 0);
				leftScoreInput.addEventListener("change", eventListener);
				rightScoreInput.addEventListener("change", eventListener);
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
			await this.#refreshGroups();

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
	const controller = new GroupStageEditorTabPaneController();
	console.log(controller);
});