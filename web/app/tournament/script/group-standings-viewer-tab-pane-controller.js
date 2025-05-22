import TabPaneController from "../../../share/tab-pane-controller.js";
import TOURNAMENT_SERVICE from "../../../share/tournament-service.js";


/**
 * Group standings viewer tab pane controller type.
 */
class GroupStandingsViewerTabPaneController extends TabPaneController {

	/**
	 * Initializes a new controller instance.
	 */
	constructor () {
		super("button.group-standings-viewer");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get competitors () { return this.sharedProperties["competitors"]; }
	get selectedTournamentType () { return this.sharedProperties["selected-tournament-type"]; }
	get selectedTournament () { return this.sharedProperties["selected-tournament"]; }

	get groupStandingsViewerSection () { return this.center.querySelector("section.group-standings-viewer"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		if (!this.selectedTournament) return;
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const groupStandingsViewerSectionTemplate = await this.queryTemplate("group-standings-viewer");
			this.center.append(groupStandingsViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			await this.#refreshGroupStandings();
			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Refreshes the group standings.
	 */
	async #refreshGroupStandings () {
		const groupStandings = await TOURNAMENT_SERVICE.queryTournamentGroupStandings(this.selectedTournament.identity);

		let groupMap = {};
		for (const groupStanding of groupStandings) {
			if (groupStanding.groupAlias in groupMap) groupMap[groupStanding.groupAlias].push(groupStanding);
			else groupMap[groupStanding.groupAlias] = [groupStanding];
		}

		const groupStandingDivisionTemplate = await this.queryTemplate("group-standing-division");
		const groupStandingRowTemplate = await this.queryTemplate("group-standing-row");
		for (const groupAlias of Object.keys(groupMap).sort()) {
			const groupStandings = groupMap[groupAlias];

			const groupStandingDivision = groupStandingDivisionTemplate.content.firstElementChild.cloneNode(true);
			groupStandingDivision.querySelector("output.alias").value = groupAlias;
			this.groupStandingsViewerSection.append(groupStandingDivision);

			const groupStandingTableBody = groupStandingDivision.querySelector("table.data>tbody");
			for (let index = 0; index < groupStandings.length; ++index) {
				const groupStanding = groupStandings[index];
				const scoreDelta = groupStanding.score - groupStanding.opponentScore;

				const tableRow = groupStandingRowTemplate.content.firstElementChild.cloneNode(true);
				groupStandingTableBody.append(tableRow);

				const rankItem = tableRow.querySelector("td.rank");
				const competitorItem = tableRow.querySelector("td.competitor");
				const scoreAccomplishedItem = tableRow.querySelector("td.score.accomplished");
				const scoreConcededItem = tableRow.querySelector("td.score.conceded");
				const scoreDeltaItem = tableRow.querySelector("td.score.delta");
				const pointsItem = tableRow.querySelector("td.points");
				const competitorAvatarView = competitorItem.querySelector("img.avatar");
				const competitorNameOutput = competitorItem.querySelector("output.name");

				rankItem.innerText = (index + 1) + ".";
				competitorAvatarView.src = TOURNAMENT_SERVICE.documentsURI + "/" + groupStanding.competitor.attributes["avatar-reference"];
				competitorAvatarView.title = groupStanding.competitor.alias;
				competitorNameOutput.value = groupStanding.competitor.name;
				scoreAccomplishedItem.innerText = groupStanding.score.toString();
				scoreConcededItem.innerText = groupStanding.opponentScore.toString();
				scoreDeltaItem.innerText = scoreDelta < 0 ? scoreDelta.toString() : "+" + scoreDelta;
				pointsItem.innerText = groupStanding.points.toString();
			}
		}
	}
}


/*
 * Registers an event listener for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new GroupStandingsViewerTabPaneController();
	console.log(controller);
});