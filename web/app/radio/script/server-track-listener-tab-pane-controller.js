import TabPaneController from "../../../share/tab-pane-controller.js";
import RADIO_SERVICE from "../../../share/radio-service.js";
import RapidGeniusLyricsServiceProxy from "../../../share/rapid-genius-lyrics-service.js";
import ELEMENT_FACTORY from "../../../share/element-factory.js";
import IntegerMath from "../../../share/integer-math.js";
import { sleep } from "../../../share/threads.js";

const RAPID_GENIUS_LYRICS_SERVICE = new RapidGeniusLyricsServiceProxy("6b614363a0mshbbd38a963ab23c6p1eaf6djsn05c146e77155");
const SECOND_MILLIES = 1000;
const QUERY_TRACKS_LIMIT = 50;

class ServerTrackListenerTabPaneController extends TabPaneController {
	#tracks;
	#trackSamplers;
	#trackRecordings;
	#trackLyrics;
	#crossfadeDuration;

	constructor () {
		super("button.server-track-listener");
		this.#tracks = [];
		this.#trackRecordings = [];
		this.#trackLyrics = [];
		this.#trackSamplers = [];
		this.#crossfadeDuration = 0;

		this.addEventListener("activated", event => this.processActivated());
		this.addEventListener("deactivated", event => this.processDeactivated());
	}

	get audioContext () { return this.sharedProperties["audio-context"]; }
	get tracksQuerySection () { return this.center.querySelector("section.server-tracks-query"); }
	get tracksQueryButton () { return this.tracksQuerySection.querySelector("div.control>button.query"); }
	get tracksQueryGenreSelector () { return this.tracksQuerySection.querySelector("div.criteria>span.genre>select"); }
	get tracksQueryArtistSelector () { return this.tracksQuerySection.querySelector("div.criteria>span.artist>select"); }
	get tracksQueryControlSpan () { return this.tracksQuerySection.querySelector("div.criteria>span.control"); }
	get tracksQueryVolumeInput () { return this.tracksQueryControlSpan.querySelector("input.volume"); }
	get tracksQueryCompressionRatioInput () { return this.tracksQueryControlSpan.querySelector("input.compression-ratio"); }
	get tracksQueryCrossfadeDurationInput () { return this.tracksQueryControlSpan.querySelector("input.crossfade"); }
	get trackPlaylistSection () { return this.center.querySelector("section.server-track-playlist"); }
	get trackPlaylistTableBody () { return this.trackPlaylistSection.querySelector("span.tracks>div>table>tbody"); }
	get trackPlaylistLyricsDivision () { return this.trackPlaylistSection.querySelector("span.lyrics>div"); }

	async processActivated () {
		try {
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const tracksQuerySectionTemplate = await this.queryTemplate("server-tracks-query");
			this.center.append(tracksQuerySectionTemplate.content.firstElementChild.cloneNode(true));

			await this.audioContext.audioWorklet.addModule("../../../share/audio-processors.js");

			this.tracksQueryButton.addEventListener("click", event => this.processQueryMatchingTracks());
			this.tracksQueryCrossfadeDurationInput.addEventListener("input", event => this.#crossfadeDuration = window.parseFloat(event.currentTarget.value.trim()));
			this.tracksQueryCrossfadeDurationInput.dispatchEvent(new InputEvent("input"));

			this.#periodicallyQueryAndDecodeTrackRecording();
			this.#periodicallyScheduleTrackPlayback();

			const [genres, artists] = await Promise.all([
				RADIO_SERVICE.queryTrackGenres(),
				RADIO_SERVICE.queryTrackArtists()
			]);

			for (const genre of genres)
				this.tracksQueryGenreSelector.append(ELEMENT_FACTORY.createHtmlElement("option", { value: genre, innerText: genre }));

			for (const artist of artists)
				this.tracksQueryArtistSelector.append(ELEMENT_FACTORY.createHtmlElement("option", { value: artist, innerText: artist }));

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}

	processDeactivated () {
		try {
			for (const trackSampler of this.#trackSamplers) {
				try {
					trackSampler.stop();
				} catch {}
				trackSampler.disconnect();
			}
			this.#trackRecordings.length = 0;
			this.#trackLyrics.length = 0;
			this.#tracks.length = 0;
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}

	async processQueryMatchingTracks () {
		try {
			const genres = Array.from(this.tracksQueryGenreSelector.selectedOptions).map(option => option.value);
			const artists = Array.from(this.tracksQueryArtistSelector.selectedOptions).map(option => option.value);
			const tracks = await RADIO_SERVICE.queryTracks(
				null, QUERY_TRACKS_LIMIT, null, null, null, null, null, null,
				artists, [], genres, true
			);

			tracks.forEach(track => track.weight = Math.random());
			tracks.sort((a, b) => a.weight - b.weight);
			tracks.forEach(track => delete track.weight);

			if (!this.trackPlaylistSection) {
				const trackPlaylistSectionTemplate = await this.queryTemplate("server-track-playlist");
				this.center.append(trackPlaylistSectionTemplate.content.firstElementChild.cloneNode(true));
			}

			const tableRowTemplate = await this.queryTemplate("server-track-playlist-row");

			for (const track of tracks) {
				this.#tracks.push(track);
				const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
				this.trackPlaylistTableBody.append(tableRow);

				tableRow.querySelector("td.cover>img").src =
				RADIO_SERVICE.documentsURI + "/" + track.attributes["album-cover-reference"];
				tableRow.querySelector("td.artist").innerText = track.artist;
				tableRow.querySelector("td.title").innerText = track.title;

				if (!track.lyrics && track.genre.toLowerCase() !== "audiobook") {
					track.lyrics = await RAPID_GENIUS_LYRICS_SERVICE.queryLyrics(track.artist, track.title);	
					if (track.lyrics) await RADIO_SERVICE.updateTrackLyrics(track);
				}
			}

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}

	async #periodicallyQueryAndDecodeTrackRecording () {
		try {
			while (this.active) {
				if (this.#tracks.length > 0 && this.#trackRecordings.length < 5) {
					const track = this.#tracks.shift();
					const trackBuffer = await RADIO_SERVICE.findDocument(track.attributes["recording-reference"], false);
					const trackRecording = await this.audioContext.decodeAudioData(trackBuffer);
					if (!this.active) continue;
					this.#trackRecordings.push(trackRecording);
					this.#trackLyrics.push(track.lyrics || "Lyrics nicht verf\u00fcgbar");
				}
				await sleep(1 * SECOND_MILLIES);
			}
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}

	async #periodicallyScheduleTrackPlayback () {
		try {
			let fadeOutGainNode = null;
			let fadeInGainNode = null;

			while (this.active) {
				if (this.#trackRecordings.length > 0 && this.#trackSamplers.length < 2) {
					const trackSampler = new AudioBufferSourceNode(this.audioContext);
					trackSampler.buffer = this.#trackRecordings.shift();

					const companderNode = new AudioWorkletNode(this.audioContext, "compander-processor");
					this.tracksQueryCompressionRatioInput.addEventListener("input", event => companderNode.parameters.get("ratio").value = 2 ** window.parseFloat(event.currentTarget.value.trim()));
					this.tracksQueryCompressionRatioInput.dispatchEvent(new InputEvent("input"));

					const volumeNode = new GainNode(this.audioContext);
					this.tracksQueryVolumeInput.addEventListener("input", event => volumeNode.gain.value = window.parseFloat(event.currentTarget.value.trim()));
					this.tracksQueryVolumeInput.dispatchEvent(new InputEvent("input"));

					fadeOutGainNode = fadeInGainNode;
					fadeInGainNode = new GainNode(this.audioContext);
					fadeInGainNode.gain.value = 2 - this.#trackSamplers.length;

					trackSampler.connect(companderNode);
					companderNode.connect(volumeNode);
					volumeNode.connect(fadeInGainNode);
					fadeInGainNode.connect(this.audioContext.destination);

					trackSampler.addEventListener("ended", event => {
						if (!this.active) return;
						this.#trackSamplers.shift().disconnect();
						this.trackPlaylistTableBody.firstElementChild.remove();
					});

					trackSampler.start(this.audioContext.currentTime);
					if (this.#trackSamplers.length == 2) {
						fadeOutGainNode.gain.linearRampToValueAtTime(fadeOutGainNode.gain.value, this.audioContext.currentTime);
						fadeInGainNode.gain.linearRampToValueAtTime(fadeInGainNode.gain.value, this.audioContext.currentTime);
						fadeOutGainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + this.#crossfadeDuration);
						fadeInGainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + this.#crossfadeDuration);
					}
					this.#trackSamplers.push(trackSampler);

					const durationText = Math.floor(trackSampler.buffer.duration / 60).toString() + ":" + Math.round(trackSampler.buffer.duration % 60).toString();
					this.trackPlaylistTableBody.querySelector("tr:nth-of-type(" + this.#trackSamplers.length + ")>td.duration").innerText = durationText;
					this.trackPlaylistLyricsDivision.innerHTML = this.#trackLyrics.shift();

					await sleep(Math.round(Math.max(trackSampler.buffer.duration - this.#crossfadeDuration, 0) * SECOND_MILLIES));
				} else {
					await sleep(1 * SECOND_MILLIES);
				}
			}
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}
}

window.addEventListener("load", event => {
	const controller = new ServerTrackListenerTabPaneController();
	console.log(controller);
});
