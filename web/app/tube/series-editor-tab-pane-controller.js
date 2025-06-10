import TabPaneController from "../../../share/tab-pane-controller.js";


/**
 * Series editor tab pane controller type.
 */
class SeriesEditorTabPaneController extends TabPaneController {

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.series-editor");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get tubeService () { return this.sharedAttributes["tube-service"]; }
	get sessionOwner () { return this.sharedAttributes["session-owner"]; }

	get seriesViewerSection () { return this.center.querySelector("section.series-viewer"); }
	get seriesViewerTableBody () { return this.seriesViewerSection.querySelector("div.series>table>tbody"); }
	get seriesViewerCreateButton () { return this.seriesViewerSection.querySelector("div.control>button.create"); }

	get seriesEditorSection () { return this.center.querySelector("section.series-editor"); }
	get seriesEditorSeriesDivision () { return this.seriesEditorSection.querySelector("div.series"); }
	get seriesEditorCoverViewer () { return this.seriesEditorSeriesDivision.querySelector("span.left>img"); }
	get seriesEditorTitleInput () { return this.seriesEditorSeriesDivision.querySelector("span.right>div.title>input"); }
	get seriesEditorReleaseYearInput () { return this.seriesEditorSeriesDivision.querySelector("span.right>div.release-year>input"); }
	get seriesEditorSeasonTotalInput () { return this.seriesEditorSeriesDivision.querySelector("span.right>div.season-total>input"); }
	get seriesEditorSeasonsDivision () { return this.seriesEditorSection.querySelector("div.seasons"); }
	get seriesEditorSeasonsTableBody () { return this.seriesEditorSeasonsDivision.querySelector("table>tbody"); }
	get seriesEditorSeasonsTableRows () { return Array.from(this.seriesEditorSeasonsTableBody.querySelectorAll("tr")); }
	get seriesEditorSubmitButton () { return this.seriesEditorSection.querySelector("div.control>button.submit"); }
	get seriesEditorDeleteButton () { return this.seriesEditorSection.querySelector("div.control>button.delete"); }
	get seriesEditorCancelButton () { return this.seriesEditorSection.querySelector("div.control>button.cancel"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const seriesViewerSectionTemplate = await this.queryTemplate("series-viewer");
			this.center.append(seriesViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			// register basic event listeners
			this.seriesViewerCreateButton.addEventListener("click", event => this.processDisplaySeriesEditor());

			this.#displayEditableSeries();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries and displays all editable series.
	 */
	async #displayEditableSeries () {
		const seriesArray = await this.tubeService.queryEditableSeries(this.sessionOwner);
		console.log(seriesArray);

		const tableRowTemplate = await this.queryTemplate("series-viewer-row");
		this.seriesViewerTableBody.innerHTML = "";
		for (const series of seriesArray) {
			
			const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
			this.seriesViewerTableBody.append(tableRow);
			const accessButton = tableRow.querySelector("td.cover>button");
			
			const accessButtonImageViewer = tableRow.querySelector("td.cover>button>img");
			accessButtonImageViewer.src = this.tubeService.documentsURI + "/" + series.attributes["cover-reference"];

			const title = tableRow.querySelector("td.title");
			title.innerText = series.title || "";

			const releaseYear = tableRow.querySelector("td.release-year");
			releaseYear.innerText = series.releaseYear || new Date().getFullYear()).toString();
			
			const seasons = tableRow.querySelector("td.seasons");
			seasons.innerText = (season.attributes["season-count"] || 0)  + "/" +  (season.seasonTotal || 0);
			
		}
	}


	/**
	 * Displays the given series in a new editor section.
	 * @param series the series, or a new object for none
	 */
	async processDisplaySeriesEditor (series = {}) {
		try {
			if (!series.attributes) series.attributes = { "author-reference": this.sessionOwner.identity, "cover-reference": 1, "season-count": 0 };

			this.seriesViewerSection.classList.add("hidden");
			const seriesEditorSectionTemplate = await this.queryTemplate("server-series-editor");
			this.center.append(seriesEditorSectionTemplate.content.firstElementChild.cloneNode(true));
			this.seriesEditorCancelButton.addEventListener("click", event => this.processCancel());

			this.seriesEditorCoverViewer.src = this.tubeService.documentsURI + "/" + series.attributes["cover-reference"];
			this.seriesEditorTitleInput.value = series.title || "";
			this.seriesEditorReleaseYearInput.value = (series.releaseYear || new Date().getFullYear()).toString();
			this.seriesEditorTrackTotalInput.value = (series.seasonTotal || 0).toString();


			this.seriesEditorCoverButton.addEventListener("click", event => this.seriesEditorCoverChooser.click());
			this.seriesEditorCoverButton.addEventListener("dragover", event => this.processImageTransferValidation(event.dataTransfer));
			this.seriesEditorCoverButton.addEventListener("drop", event => this.processSubmitseasonCover(series, event.dataTransfer.files[0]));
			this.seriesEditorCoverChooser.addEventListener("change", event => this.processSubmitseasonCover(series, event.currentTarget.files[0]));
			
			this.seriesEditorSubmitButton.addEventListener("click", event => this.processSubmitseries(series));
			this.seriesEditorDeleteButton.addEventListener("click", event => this.processDeleteseries(series.identity));


			if (series.identity) {
				const seasons = await this.tubeService.queryseriesTracks(series.identity);
				for (const season of seasons) this.processDisplaySeriesEditor(searies);
			} else {
				this.seriesEditorSeriesDivision.classList.add("hidden");
			}


			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries and refreshes the given series season editor rows.
	 * @param seriesIdentity the series identity
	 * @return an execution promise
	 */
	async #refreshSeriesSeasons (seriesIdentity) {
		// TODO
	}


	/**
	 * Submits the given series.
	 * @param series the series
	 */
	async processSubmitSeries (series) {
		try {
			if(series) await this.tubeService.insertOrUpdateSeries(series);

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Deletes the given series.
	 * @param seriesIdentity the series identity
	 */
	async processDeleteSeries (seriesIdentity) {
		try {
			if (seriesIdentity)
				await this.tubeService.deleteSeries(seriesIdentity);

			this.messageOutput.value = "ok.";
			this.seriesEditorCancelButton.click();
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Removes the editor section and re-displays the refreshed table section.
	 */
	async processCancel () {
		try {
			this.seriesEditorSection.remove();
			await this.#displayEditableSeries();
			this.seriesViewerSection.classList.remove("hidden");

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Performs validating an image file transfer attempt.
	 * @param dataTransfer the data transfer
	 */
	async processImageTransferValidation (dataTransfer) {
		const primaryItem = dataTransfer.items[0];
		dataTransfer.dropEffect = primaryItem.kind === "file" && primaryItem.type && primaryItem.type.startsWith("image/") ? "copy" : "none";
	}


	/**
	 * Submits the given image file, and both registers and submits it as the given season's cover.
	 * @param season the season
	 * @param imageFile the image file, or null for none
	 */
	async processSubmitSeasonCover (season, imageFile) {
		try {
			if (!imageFile) return;
			if (!imageFile.type || !imageFile.type.startsWith("image/")) throw new RangeError();
			season.attributes["cover-reference"] = await this.tubeService.insertOrUpdateDocument(imageFile);

			await this.tubeService.insertOrUpdateSeason(season);
			season.version += 1;

			const coverViewer = this.seriesEditorSeasonsTableRows[season.ordinal].querySelector("td.cover>button>img");
			coverViewer.src = this.tubeService.documentsURI + "/" + season.attributes["cover-reference"];

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Submits the given season.
	 * @param season the season
	 */
	async processSubmitSeason (season) {
		try {
			const episodeTotalInput = this.seriesEditorSeasonsTableRows[season.ordinal].querySelector("input.episode-total");
			season.episodeTotal = window.parseInt(episodeTotalInput.value.trim()) || 0;

			await this.tubeService.insertOrUpdateSeason(season);
			season.version += 1;

			this.messageOutput.value = "ok.";
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
	const controller = new SeriesEditorTabPaneController();
	console.log(controller);
});
