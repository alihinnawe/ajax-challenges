import TabPaneController from "../../../share/tab-pane-controller.js";
import IRIS_SERVICE from "../../../share/iris-service.js";


/**
 * Observation editor tab pane controller type.
 */
class ObservationEditorTabPaneController extends TabPaneController {
	#selectedInfluencerIndex;
	#focusedFollowerIndex;
	#selectedPersonIndex;
	#people;


	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.observation-editor");
		this.#selectedInfluencerIndex = -1;
		this.#focusedFollowerIndex = -1;
		this.#selectedPersonIndex = -1;
		this.#people = [];

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }
	get sessionOwnerInfluencers () { return this.sharedProperties["session-owner-influencers"]; }
	set sessionOwnerInfluencers (value) { this.sharedProperties["session-owner-influencers"] = value; }
	get sessionOwnerFollowers () { return this.sharedProperties["session-owner-followers"]; }
	set sessionOwnerFollowers (value) { this.sharedProperties["session-owner-followers"] = value; }

	get peopleViewerSection () { return this.center.querySelector("section.people-viewer"); }
	get followerViewerDivision () { return this.peopleViewerSection.querySelector("div.follower"); }
	get followerViewerCountOutput () { return this.followerViewerDivision.querySelector("h1>output.count"); }
	get followerViewerSlider () { return this.followerViewerDivision.querySelector("span.slider"); }
	get followerViewerScrollLeftButton () { return this.followerViewerSlider.querySelector("button.scroll.left"); }
	get followerViewerScrollRightButton () { return this.followerViewerSlider.querySelector("button.scroll.right"); }
	get followerViewerPredecessorViewer () { return this.followerViewerSlider.querySelector("img.predecessor"); }
	get followerViewerFocusViewer () { return this.followerViewerSlider.querySelector("img.focus"); }
	get followerViewerSuccessorViewer () { return this.followerViewerSlider.querySelector("img.successor"); }
	get influencerViewerDivision () { return this.peopleViewerSection.querySelector("div.influencer"); }
	get influencerViewerCountOutput () { return this.influencerViewerDivision.querySelector("h1>output.count"); }
	get influencerViewerSelector () { return this.influencerViewerDivision.querySelector("span.selector"); }
	get influencerViewerScrollLeftButton () { return this.influencerViewerSelector.querySelector("button.scroll.left"); }
	get influencerViewerScrollRightButton () { return this.influencerViewerSelector.querySelector("button.scroll.right"); }
	get influencerViewerPredecessorViewer () { return this.influencerViewerSelector.querySelector("img.predecessor"); }
	get influencerViewerSelectorButton () { return this.influencerViewerSelector.querySelector("button.selection"); }
	get influencerViewerSelectorViewer () { return this.influencerViewerSelectorButton.querySelector("img"); }
	get influencerViewerSuccessorViewer () { return this.influencerViewerSelector.querySelector("img.successor"); }
	get observationQueryDivision () { return this.peopleViewerSection.querySelector("div.query"); }
	get observationQueryEmailInput() { return this.observationQueryDivision.querySelector("div.email>input"); }
	get observationQueryForenameInput() { return this.observationQueryDivision.querySelector("div.forename>input"); }
	get observationQuerySurnameInput() { return this.observationQueryDivision.querySelector("div.surname>input"); }
	get observationQueryStreetInput() { return this.observationQueryDivision.querySelector("div.street>input"); }
	get observationQueryCityInput() { return this.observationQueryDivision.querySelector("div.city>input"); }
	get observationQueryCountryInput() { return this.observationQueryDivision.querySelector("div.country>input"); }
	get observationQueryButton () { return this.observationQueryDivision.querySelector("div.control>button.query"); }

	get observationEditorSection () { return this.center.querySelector("section.observation-editor"); }
	get observationEditorPersonDivision () { return this.observationEditorSection.querySelector("div.person"); }
	get observationEditorPersonSelector () { return this.observationEditorPersonDivision.querySelector("span.selector"); }
	get observationEditorPersonScrollLeftButton () { return this.observationEditorPersonSelector.querySelector("button.scroll.left"); }
	get observationEditorPersonScrollRightButton () { return this.observationEditorPersonSelector.querySelector("button.scroll.right"); }
	get observationEditorPersonPredecessorViewer () { return this.observationEditorPersonSelector.querySelector("img.predecessor"); }
	get observationEditorPersonSelectorButton () { return this.observationEditorPersonSelector.querySelector("button.selection"); }
	get observationEditorPersonSelectorViewer () { return this.observationEditorPersonSelectorButton.querySelector("img"); }
	get observationEditorPersonSuccessorViewer () { return this.observationEditorPersonSelector.querySelector("img.successor"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
		
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const peopleViewerSectionTemplate = await this.queryTemplate("people-viewer");
			this.center.append(peopleViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			// register basic event listeners
			this.followerViewerScrollLeftButton.addEventListener("click", event => this.processScrollFollowersLeft());
			this.followerViewerScrollRightButton.addEventListener("click", event => this.processScrollFollowersRight());
			
			this.influencerViewerScrollLeftButton.addEventListener("click", event => this.processScrollInfluencersLeft());
			this.influencerViewerScrollRightButton.addEventListener("click", event => this.processScrollInfluencersRight());
			
			this.influencerViewerSelectorButton.addEventListener("click", event => this.processRemoveInfluencer());
			this.observationQueryButton.addEventListener("click", event => this.processQueryPotentialInfluencers());


			this.#focusedFollowerIndex = this.sessionOwnerFollowers.length > 0 ? 0 : -1;
			this.#selectedInfluencerIndex = this.sessionOwnerInfluencers.length > 0 ? 0 : -1;
			this.#refreshFollowers();
			this.#refreshInfluencers();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles adding the selected person as influencer.
	 */
	async processAddInfluencer () {
		if (this.#selectedPersonIndex === -1) return;

		try {
			const selectedPerson = this.#people[this.#selectedPersonIndex];

			// Prevent duplicates
			const alreadyAdded = this.sessionOwnerInfluencers.find(influencer =>
				influencer.identity === selectedPerson.identity
			);
			if (alreadyAdded) {
				this.messageOutput.value = "already added.";
				return;
			}

			// Add the influencer via the web service
			await IRIS_SERVICE.addRequesterInfluencer(selectedPerson.identity);

			this.sessionOwnerInfluencers.push(selectedPerson);
			this.#selectedInfluencerIndex = this.sessionOwnerInfluencers.length - 1;
			this.#refreshInfluencers();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles removing the selected influencer.
	 */
	async processRemoveInfluencer () {
		if (this.#selectedInfluencerIndex === -1) return;
		try {
			// TODO
			this.sessionOwnerInfluencers = this.sessionOwnerInfluencers.filter((influencer, index) => index !== this.#selectedInfluencerIndex);

			this.#refreshInfluencers();
			
			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles scrolling the influencer selector one to the left.
	 */
	async processScrollInfluencersLeft () {
		if (this.sessionOwnerInfluencers.length === 0) return;
		try {
			this.#selectedInfluencerIndex = this.#selectedInfluencerIndex === this.sessionOwnerInfluencers.length - 1 ? 0 : this.#selectedInfluencerIndex + 1;
			this.#refreshInfluencers();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}

	}


	/**
	 * Handles scrolling the influencer selector one to the right.
	 */
	async processScrollInfluencersRight () {
		if (this.sessionOwnerInfluencers.length === 0) return;
		try {
			this.#selectedInfluencerIndex = this.#selectedInfluencerIndex === 0 ? this.sessionOwnerInfluencers.length - 1 : this.#selectedInfluencerIndex - 1;
			this.#refreshInfluencers();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles scrolling the follower slider one to the left.
	 */
	async processScrollFollowersLeft () {
		if (this.sessionOwnerFollowers.length === 0) return;
		try {
			this.#focusedFollowerIndex = this.#focusedFollowerIndex === this.sessionOwnerFollowers.length - 1 ? 0 : this.#focusedFollowerIndex + 1;
			this.#refreshFollowers();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles scrolling the follower slider one to the right.
	 */
	async processScrollFollowersRight () {
		if (this.sessionOwnerFollowers.length === 0) return;
		try {
			this.#focusedFollowerIndex = this.#focusedFollowerIndex === 0 ? this.sessionOwnerFollowers.length - 1 : this.#focusedFollowerIndex - 1;
			this.#refreshFollowers();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Displays the session owner's influencers.
	 */
	#refreshInfluencers () {
		let predecessorInfluencer = null, selectedInfluencer = null, successorInfluencer = null;
		if (this.#selectedInfluencerIndex !== -1) {
			predecessorInfluencer = this.sessionOwnerInfluencers[this.#selectedInfluencerIndex === 0 ? this.sessionOwnerInfluencers.length - 1 : this.#selectedInfluencerIndex - 1];
			selectedInfluencer = this.sessionOwnerInfluencers[this.#selectedInfluencerIndex];
			successorInfluencer = this.sessionOwnerInfluencers[this.#selectedInfluencerIndex === this.sessionOwnerInfluencers.length - 1 ? 0 : this.#selectedInfluencerIndex + 1];
		}

		this.influencerViewerCountOutput.value = this.sessionOwnerInfluencers.length.toString();
		this.influencerViewerPredecessorViewer.src = predecessorInfluencer ? IRIS_SERVICE.documentsURI + "/" + predecessorInfluencer.attributes["avatar-reference"] : "media/void.png";
		this.influencerViewerPredecessorViewer.title = predecessorInfluencer ? ((predecessorInfluencer.name.title || "") + " " + predecessorInfluencer.name.given + " " + predecessorInfluencer.name.family).trim() : "";
		this.influencerViewerSelectorViewer.src = selectedInfluencer ? IRIS_SERVICE.documentsURI + "/" + selectedInfluencer.attributes["avatar-reference"] : "media/void.png";
		this.influencerViewerSelectorViewer.title = selectedInfluencer ? ((selectedInfluencer.name.title || "") + " " + selectedInfluencer.name.given + " " + selectedInfluencer.name.family).trim() : "";
		this.influencerViewerSuccessorViewer.src = successorInfluencer ? IRIS_SERVICE.documentsURI + "/" + successorInfluencer.attributes["avatar-reference"] : "media/void.png";
		this.influencerViewerSuccessorViewer.title = successorInfluencer ? ((successorInfluencer.name.title || "") + " " + successorInfluencer.name.given + " " + successorInfluencer.name.family).trim() : "";
	}


	/**
	 * Displays the session owner's followers.
	 */
	#refreshFollowers () {
		let predecessorFollower = null, focusedFollower = null, successorFollower = null;
		if (this.#focusedFollowerIndex !== -1) {
			predecessorFollower = this.sessionOwnerFollowers[this.#focusedFollowerIndex === 0 ? this.sessionOwnerFollowers.length - 1 : this.#focusedFollowerIndex - 1];
			focusedFollower = this.sessionOwnerFollowers[this.#focusedFollowerIndex];
			successorFollower = this.sessionOwnerFollowers[this.#focusedFollowerIndex === this.sessionOwnerFollowers.length - 1 ? 0 : this.#focusedFollowerIndex + 1];
		}

		this.followerViewerCountOutput.value = this.sessionOwnerFollowers.length.toString();
		this.followerViewerPredecessorViewer.src = predecessorFollower ? IRIS_SERVICE.documentsURI + "/" + predecessorFollower.attributes["avatar-reference"] : "media/void.png";
		this.followerViewerPredecessorViewer.title = predecessorFollower ? ((predecessorFollower.name.title || "") + " " + predecessorFollower.name.given + " " + predecessorFollower.name.family).trim() : "";
		this.followerViewerFocusViewer.src = focusedFollower ? IRIS_SERVICE.documentsURI + "/" + focusedFollower.attributes["avatar-reference"] : "media/void.png";
		this.followerViewerFocusViewer.title = focusedFollower ? ((focusedFollower.name.title || "") + " " + focusedFollower.name.given + " " + focusedFollower.name.family).trim() : "";
		this.followerViewerSuccessorViewer.src = successorFollower ? IRIS_SERVICE.documentsURI + "/" + successorFollower.attributes["avatar-reference"] : "media/void.png";
		this.followerViewerSuccessorViewer.title = successorFollower ? ((successorFollower.name.title || "") + " " + successorFollower.name.given + " " + successorFollower.name.family).trim() : "";
	}


	/**
	 * Handles querying potential influencers.
	 */
	async processQueryPotentialInfluencers () {
		try {
			if (!this.observationEditorSection) {
				const observationEditorSectionTemplate = await this.queryTemplate("observation-editor");
				this.center.append(observationEditorSectionTemplate.content.firstElementChild.cloneNode(true));

				this.observationEditorPersonScrollLeftButton.addEventListener("click", event => this.processScrollPeopleLeft());
				this.observationEditorPersonScrollRightButton.addEventListener("click", event => this.processScrollPeopleRight());			
				this.observationEditorPersonSelectorButton.addEventListener("click", event => this.processAddInfluencer());
			}

			this.messageOutput.value = "ok";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles scrolling the person selector one to the left.
	 */
	async processScrollPeopleLeft () {
		if (this.#people.length === 0) return;
		try {
			this.#selectedPersonIndex = this.#selectedPersonIndex === this.#people.length - 1 ? 0 : this.#selectedPersonIndex + 1;
			this.#refreshPeople();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles scrolling the person selector one to the right.
	 */
	async processScrollPeopleRight () {
		if (this.#people.length === 0) return;
		try {
			this.#selectedPersonIndex = this.#selectedPersonIndex === 0 ? this.#people.length - 1 : this.#selectedPersonIndex - 1;
			this.#refreshPeople();

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Displays the queried people.
	 */
	#refreshPeople () {
		let predecessorPerson = null, selectedPerson = null, successorPerson = null;
		if (this.#selectedPersonIndex !== -1) {
			predecessorPerson = this.#people[this.#selectedPersonIndex === 0 ? this.#people.length - 1 : this.#selectedPersonIndex - 1];
			selectedPerson = this.#people[this.#selectedPersonIndex];
			successorPerson = this.#people[this.#selectedPersonIndex === this.#people.length - 1 ? 0 : this.#selectedPersonIndex + 1];
		}

		this.observationEditorPersonPredecessorViewer.src = predecessorPerson ? IRIS_SERVICE.documentsURI + "/" + predecessorPerson.attributes["avatar-reference"] : "media/void.png";
		this.observationEditorPersonPredecessorViewer.title = predecessorPerson ? ((predecessorPerson.name.title || "") + " " + predecessorPerson.name.given + " " + predecessorPerson.name.family).trim() : "";
		this.observationEditorPersonSelectorViewer.src = selectedPerson ? IRIS_SERVICE.documentsURI + "/" + selectedPerson.attributes["avatar-reference"] : "media/void.png";
		this.observationEditorPersonSelectorViewer.title = selectedPerson ? ((selectedPerson.name.title || "") + " " + selectedPerson.name.given + " " + selectedPerson.name.family).trim() : "";
		this.observationEditorPersonSuccessorViewer.src = successorPerson ? IRIS_SERVICE.documentsURI + "/" + successorPerson.attributes["avatar-reference"] : "media/void.png";
		this.observationEditorPersonSuccessorViewer.title = successorPerson ? ((successorPerson.name.title || "") + " " + successorPerson.name.given + " " + successorPerson.name.family).trim() : "";
	}
}


/*
 * Registers an event listener for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new ObservationEditorTabPaneController();
	console.log(controller);
});
