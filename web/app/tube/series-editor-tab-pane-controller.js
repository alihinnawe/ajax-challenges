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
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const seriesViewerSectionTemplate = await this.queryTemplate("series-viewer");
			this.center.append(seriesViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			this.seriesViewerCreateButton.addEventListener("click", () => this.processDisplaySeriesEditor());
			await this.#displayEditableSeries();

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
		const tableRowTemplate = await this.queryTemplate("series-viewer-row");
		this.seriesViewerTableBody.innerHTML = "";
		for (const series of seriesArray) {
			const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
			this.seriesViewerTableBody.append(tableRow);

			const accessButton = tableRow.querySelector("td.cover>button");
			const accessButtonImageViewer = tableRow.querySelector("td.cover>button>img");
			accessButtonImageViewer.src = this.tubeService.documentsURI + "/" + series.attributes["cover-reference"];

			accessButton.addEventListener("click", event => this.processDisplaySeriesEditor(series));

			tableRow.querySelector("td.title").innerText = series.title || "";
			tableRow.querySelector("td.release-year").innerText = series.releaseYear || (new Date().getFullYear()).toString();
			tableRow.querySelector("td.seasons").innerText = (series.attributes["season-count"] || 0) + "/" + (series.seasonTotal || 0);
		}
	}

	/**
	 * Displays the given series in a new editor section.
	 * @param series the series, or a new object for none
	 */
	async processDisplaySeriesEditor (series = {}) {
		try {
			if (!series.attributes) { series.attributes = { "cover-reference": 1, "author-reference": this.sessionOwner.identity, "season-count": 0 };}

			this.seriesViewerSection.classList.add("hidden");
			const seriesEditorSectionTemplate = await this.queryTemplate("series-editor");
			this.center.append(seriesEditorSectionTemplate.content.firstElementChild.cloneNode(true));

			this.seriesEditorCoverViewer.src = this.tubeService.documentsURI + "/" + series.attributes["cover-reference"];
			this.seriesEditorTitleInput.value = series.title || "";
			this.seriesEditorReleaseYearInput.value = series.releaseYear || new Date().getFullYear().toString();
			this.seriesEditorSeasonTotalInput.value = series.seasonTotal || "0";

			this.seriesEditorSeasonTotalInput.addEventListener("change", event => this.processSeasonTotalChanged(series.identity, window.parseInt(event.currentTarget.value.trim())));
			this.seriesEditorCancelButton.addEventListener("click", event => this.processCancel());
			this.seriesEditorSubmitButton.addEventListener("click", event => this.processSubmitSeries(series));
			this.seriesEditorDeleteButton.addEventListener("click", event => this.processDeleteSeries(series.identity));

			const rowTemplate = await this.queryTemplate("series-editor-row");
			this.seriesEditorSeasonsTableBody.innerHTML = "";

			if (series.identity) {
				const seasons = await this.tubeService.querySeriesSeasons(series.identity);
				series.attributes["season-count"] = seasons.length;

				seasons.forEach(season => {
					const tableRow = rowTemplate.content.firstElementChild.cloneNode(true);
					this.seriesEditorSeasonsTableBody.append(tableRow);

					tableRow.querySelector("td.ordinal").textContent = season.ordinal.toString();
					tableRow.querySelector("output.episode-count").value = (season.episodeCount || 0).toString();
					tableRow.querySelector("input.episode-total").value = (season.episodeTotal || 0).toString();

					const img = tableRow.querySelector("td.cover img");
					const fileInput = tableRow.querySelector("td.cover input[type='file']");
					const button = tableRow.querySelector("td.cover button");
					img.src = this.tubeService.documentsURI + "/" + season.attributes["cover-reference"];

					button.addEventListener("click", () => fileInput.click());
					button.addEventListener("dragover", event => {
						event.preventDefault();
						this.processImageTransferValidation(event.dataTransfer);
					});
					button.addEventListener("drop", event => {
						event.preventDefault();
						const file = event.dataTransfer.files[0];
						if (file) this.processSubmitSeasonCover(season, file);
					});

					fileInput.addEventListener("change", event => {
						const file = event.currentTarget.files[0];
						if (file) this.processSubmitSeasonCover(season, file);
					});
				});
			} else {
				series.attributes["season-count"] = 0;
			}

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}

	async processSubmitSeries (series) {
		try {
			const seasonTotal = series.seasonTotal || 0;
			series.title = this.seriesEditorTitleInput.value.trim();
			series.releaseYear = this.seriesEditorReleaseYearInput.value.trim();
			series.seasonTotal = parseInt(this.seriesEditorSeasonTotalInput.value.trim()) || 0;
			series.identity = await this.tubeService.insertOrUpdateSeries(series);
			series.version = (series.version || 0) + 1;

			const seasons = await this.tubeService.querySeriesSeasons(series.identity);
			const episodeCounts = this.seriesEditorSeasonsTableRows.map(tableRow => window.parseInt(tableRow.querySelector("td.episodes>input").value.trim()) || 0);
			for (let ordinal = seasons.length - 1; ordinal >= series.seasonTotal; --ordinal) {
				const season = seasons[ordinal];
				await this.tubeService.deleteSeason(season.identity);
			}

			for (let ordinal = 0; ordinal < Math.min(seasons.length, series.seasonTotal); ++ordinal) {
				const season = seasons[ordinal];
				season.episodeCount = episodeCounts[ordinal];
				await this.tubeService.insertOrUpdateSeason(season);
			}

			for (let ordinal = seasons.length; ordinal < series.seasonTotal; ++ordinal) {
				const season = { attributes: { "series-reference": series.identity }, ordinal: ordinal, episodeCount: episodeCounts[ordinal] };
				await this.tubeService.insertOrUpdateSeason(season);
			}
			
			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}

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

	async processImageTransferValidation (dataTransfer) {
		const primaryItem = dataTransfer.items[0];
		dataTransfer.dropEffect = primaryItem.kind === "file" && primaryItem.type && primaryItem.type.startsWith("image/") ? "copy" : "none";
	}

	async processSubmitSeasonCover (season, imageFile) {
		try {
			if (!imageFile || !imageFile.type.startsWith("image/")) throw new RangeError();
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

	async processSubmitSeason (season) {
		try {
			const episodeTotalInput = this.seriesEditorSeasonsTableRows[season.ordinal].querySelector("input.episode-total");
			season.episodeTotal = parseInt(episodeTotalInput.value.trim()) || 0;
			await this.tubeService.insertOrUpdateSeason(season);
			season.version += 1;
			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	async proccessDeleteSeason (season) {
		try {

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	async processSeasonTotalChanged (seriesIdentity, seasonTotal) {
		try {
			const seasonRowCount = this.seriesEditorSeasonsTableRows.length;

			for (let ordinal = seasonRowCount - 1; ordinal >= seasonTotal; --ordinal)
				this.seriesEditorSeasonsTableBody.lastElementChild.remove();
				// TODO: move!   await this.tubeService.deleteSeason(seasons[ordinal].identity);

			const tableRowTemplate = await this.queryTemplate("series-editor-row");
			for (let ordinal = seasonRowCount; ordinal < seasonTotal; ++ordinal) {
				const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
				this.seriesEditorSeasonsTableBody.append(tableRow);

				tableRow.querySelector("td.cover>button>img").src = this.tubeService.documentsURI + "/1";
				//  TODO: move!   await this.tubeService.insertOrUpdateSeason({ attributes: { "series-reference": seriesIdentity }, ordinal: ordinal });
			}

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}
	
}

window.addEventListener("load", () => {
	const controller = new SeriesEditorTabPaneController();
	console.log(controller);
});
