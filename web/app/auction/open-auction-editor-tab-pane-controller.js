import TabPaneController from "../../../../share/tab-pane-controller.js";
import BROKER_SERVICE from "../../../../share/broker-service.js";
import ELEMENT_FACTORY from "../../../../share/element-factory.js";
import { CATEGORY, RATING } from "./enums.js"


// constants
const DAY_MILLIES = 24 * 60 * 60 * 1000;


/**
 * Open auction tab pane controller type.
 */
export default class OpenAuctionTabPaneController extends TabPaneController {

	/*
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.open-auction-editor");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }

	get auctionsViewerSection () { return this.center.querySelector("section.auctions-viewer"); }
	get auctionsViewerHeading () { return this.auctionsViewerSection.querySelector("div.auctions>h1"); }
	get auctionsViewerTable () { return this.auctionsViewerSection.querySelector("div.auctions>table"); }
	get auctionsViewerTableBody () { return this.auctionsViewerTable.querySelector("tbody"); }
	get auctionsViewerTableHeadExtra () { return this.auctionsViewerTable.querySelector("th.extra"); }
	get auctionsViewerControlDivision () { return this.auctionsViewerSection.querySelector("div.control"); }
	get auctionsViewerCreateButton () { return this.auctionsViewerControlDivision.querySelector("button.create"); }

	get auctionViewerSection () { return this.center.querySelector("section.auction-viewer"); }
	get auctionViewerSellerDivision () { return this.auctionViewerSection.querySelector("div.seller"); }
	get auctionViewerSellerAvatarViewer () { return this.auctionViewerSellerDivision.querySelector("div.avatar>img"); }
	get auctionViewerSellerNameInput () { return this.auctionViewerSellerDivision.querySelector("div.name>input"); }
	get auctionViewerSellerEmailInput () { return this.auctionViewerSellerDivision.querySelector("div.email>input"); }
	get auctionViewerSellerBicInput () { return this.auctionViewerSellerDivision.querySelector("div.bic>input"); }
	get auctionViewerSellerIbanInput () { return this.auctionViewerSellerDivision.querySelector("div.iban>input"); }
	get auctionViewerAuctionDivision () { return this.auctionViewerSection.querySelector("div.auction"); }
	get auctionViewerAuctionAvatarViewer () { return this.auctionViewerAuctionDivision.querySelector("div.avatar>img"); }
	get auctionViewerAuctionCategoryInput () { return this.auctionViewerAuctionDivision.querySelector("div.category>input"); }
	get auctionViewerAuctionRatingInput () { return this.auctionViewerAuctionDivision.querySelector("div.rating>input"); }
	get auctionViewerAuctionPriceInput () { return this.auctionViewerAuctionDivision.querySelector("div.price>input"); }
	get auctionViewerAuctionClosureInput () { return this.auctionViewerAuctionDivision.querySelector("div.closure>input"); }
	get auctionViewerAuctionManufactureYearInput () { return this.auctionViewerAuctionDivision.querySelector("div.manufacture-year>input"); }
	get auctionViewerAuctionManufacturerInput () { return this.auctionViewerAuctionDivision.querySelector("div.manufacturer>input"); }
	get auctionViewerAuctionNameInput () { return this.auctionViewerAuctionDivision.querySelector("div.name>input"); }
	get auctionViewerAuctionSerialInput () { return this.auctionViewerAuctionDivision.querySelector("div.serial>input"); }
	get auctionViewerAuctionDescriptionArea () { return this.auctionViewerSection.querySelector("div.description>textarea"); }
	get auctionViewerAuctionBidCountInput () { return this.auctionViewerSection.querySelector("div.bid-count>input"); }
	get auctionViewerBidderBidAmountDivision () { return this.auctionViewerSection.querySelector("div.bid-amount"); }
	get auctionViewerBidderBidAmountInput () { return this.auctionViewerBidderBidAmountDivision.querySelector("input"); }
	get auctionViewerBidButton () { return this.auctionViewerSection.querySelector("div.control>button.bid"); }
	get auctionViewerCancelButton () { return this.auctionViewerSection.querySelector("div.control>button.cancel"); }

	get auctionEditorSection () { return this.center.querySelector("section.auction-editor"); }
	get auctionEditorSellerDivision () { return this.auctionEditorSection.querySelector("div.seller"); }
	get auctionEditorSellerAvatarViewer () { return this.auctionEditorSellerDivision.querySelector("div.avatar>img"); }
	get auctionEditorSellerNameInput () { return this.auctionEditorSellerDivision.querySelector("div.name>input"); }
	get auctionEditorSellerEmailInput () { return this.auctionEditorSellerDivision.querySelector("div.email>input"); }
	get auctionEditorSellerBicInput () { return this.auctionEditorSellerDivision.querySelector("div.bic>input"); }
	get auctionEditorSellerIbanInput () { return this.auctionEditorSellerDivision.querySelector("div.iban>input"); }
	get auctionEditorAuctionDivision () { return this.auctionEditorSection.querySelector("div.auction"); }
	get auctionEditorAuctionAvatarDivision () { return this.auctionEditorAuctionDivision.querySelector("div.avatar"); }
	get auctionEditorAuctionAvatarButton () { return this.auctionEditorAuctionAvatarDivision.querySelector("button"); }
	get auctionEditorAuctionAvatarViewer () { return this.auctionEditorAuctionAvatarButton.querySelector("img"); }
	get auctionEditorAuctionAvatarChooser () { return this.auctionEditorAuctionAvatarDivision.querySelector("input"); }
	get auctionEditorAuctionCategorySelector () { return this.auctionEditorAuctionDivision.querySelector("div.category>select"); }
	get auctionEditorAuctionRatingSelector () { return this.auctionEditorAuctionDivision.querySelector("div.rating>select"); }
	get auctionEditorAuctionPriceInput () { return this.auctionEditorAuctionDivision.querySelector("div.price>input"); }
	get auctionEditorAuctionDurationInput () { return this.auctionEditorAuctionDivision.querySelector("div.duration>input"); }
	get auctionEditorAuctionManufacturerInput () { return this.auctionEditorAuctionDivision.querySelector("div.manufacturer>input"); }
	get auctionEditorAuctionNameInput () { return this.auctionEditorAuctionDivision.querySelector("div.name>input"); }
	get auctionEditorAuctionManufactureYearInput () { return this.auctionEditorAuctionDivision.querySelector("div.manufacture-year>input"); }
	get auctionEditorAuctionSerialInput () { return this.auctionEditorAuctionDivision.querySelector("div.serial>input"); }
	get auctionEditorAuctionDescriptionArea () { return this.auctionEditorAuctionDivision.querySelector("div.description>textarea"); }
	get auctionEditorSubmitButton () { return this.auctionEditorSection.querySelector("div.control>button.submit"); }
	get auctionEditorCancelButton () { return this.auctionEditorSection.querySelector("div.control>button.cancel"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const auctionsViewerSectionTemplate = await this.queryTemplate("auctions-viewer");
			this.center.append(auctionsViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			this.auctionsViewerHeading.innerText = "Ihre offenen Auktionen";
			this.auctionsViewerTableHeadExtra.innerText = "Rolle";
			this.auctionsViewerControlDivision.append(ELEMENT_FACTORY.createHtmlElement("button", { type: "button", innerText: "neu" }, {}, "create"));

			// register basic event listeners
			this.auctionsViewerCreateButton.addEventListener("click", event => this.processDisplayAuctionEditor({}));

			await this.#displayOpenAuctions();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries and displays the session owner's auctions. 
	 */
	async #displayOpenAuctions () {
		const auctions = await BROKER_SERVICE.queryPersonAuctions(this.sessionOwner.identity, null, null, null, ["OPEN", "SEALED"]);

		this.auctionsViewerTableBody.innerHTML = "";
		const auctionsViewerTableRowTemplate = await this.queryTemplate("auctions-viewer-row");
		for (const auction of auctions) {
			const tableRow = auctionsViewerTableRowTemplate.content.firstElementChild.cloneNode(true);
			this.auctionsViewerTableBody.append(tableRow);

			const avatarViewer = tableRow.querySelector("td.avatar>img");
			const manufacturerItem = tableRow.querySelector("td.manufacturer");
			const nameItem = tableRow.querySelector("td.name");
			const beginItem = tableRow.querySelector("td.begin");
			const endItem = tableRow.querySelector("td.end");
			const bidCountItem = tableRow.querySelector("td.bid-count");
			const sessionOwnerRoleItem = tableRow.querySelector("td.extra");
			const actionItem = tableRow.querySelector("td.action");

			const begin = new Date(auction.created), end = new Date(auction.closure);
			avatarViewer.src = BROKER_SERVICE.documentsURI + "/" + auction.attributes["avatar-reference"];
			if (auction.description) avatarViewer.title = auction.description;
			manufacturerItem.innerText = auction.manufacturer;
			nameItem.innerText = auction.name;
			beginItem.innerText = begin.toLocaleDateString() + " " + begin.toLocaleTimeString();
			endItem.innerText = end.toLocaleDateString() + " " + end.toLocaleTimeString();
			bidCountItem.innerText = auction.attributes["bid-count"].toString();
			sessionOwnerRoleItem.innerText = auction.attributes["seller-reference"] === this.sessionOwner.identity ? "Verkäufer" : "Bieter";
			sessionOwnerRoleItem.classList.add("role");

			const viewButton = ELEMENT_FACTORY.createHtmlElement("button", { type: "button", innerText: "ansehen" }, {}, "view");
			viewButton.addEventListener("click", event => this.processDisplayAuctionView(auction));
			actionItem.append(viewButton);
			if (auction.attributes["seller-reference"] === this.sessionOwner.identity) {
				const editButton = ELEMENT_FACTORY.createHtmlElement("button", { type: "button", innerText: "ändern", disabled: auction.sealed }, {}, "edit");
				editButton.disabled = auction.attributes["status"] !== "OPEN";
				editButton.addEventListener("click", event => this.processDisplayAuctionEditor(auction));
				const deleteButton = ELEMENT_FACTORY.createHtmlElement("button", { type: "button", innerText: "löschen", disabled: auction.sealed }, {}, "delete");
				deleteButton.disabled = auction.attributes["status"] !== "OPEN";
				deleteButton.addEventListener("click", event => this.processDeleteAuction(auction.identity));
				actionItem.append(editButton, deleteButton);
			}
		}
	}


	/**
	 * Handles displaying the auction view.
	 * @param {Object} auction the auction
	 */
	async processDisplayAuctionView (auction) {
		try {
			this.auctionsViewerSection.classList.add("hidden");
			const auctionViewerSectionTemplate = await this.queryTemplate("auction-viewer");
			this.center.append(auctionViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			const seller = await BROKER_SERVICE.findPerson(auction.attributes["seller-reference"]);
			this.auctionViewerSellerAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + seller.attributes["avatar-reference"];
			this.auctionViewerSellerNameInput.value = seller.name.given + " " + seller.name.family;
			this.auctionViewerSellerEmailInput.value = seller.email || "";
			this.auctionViewerSellerBicInput.value = (seller.account || {}).bic || "";
			this.auctionViewerSellerIbanInput.value = (seller.account || {}).iban || "";

			const closure = new Date(auction.closure);
			this.auctionViewerAuctionAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + auction.attributes["avatar-reference"];
			this.auctionViewerAuctionCategoryInput.value = CATEGORY[auction.category];
			this.auctionViewerAuctionRatingInput.value = RATING[auction.rating];
			this.auctionViewerAuctionPriceInput.value = (0.01 * auction.askingPrice).toFixed(2);
			this.auctionViewerAuctionClosureInput.value = closure.toLocaleDateString() + " " + closure.toLocaleTimeString();
			this.auctionViewerAuctionManufactureYearInput.value = auction.manufactureYear;
			this.auctionViewerAuctionManufacturerInput.value = auction.manufacturer;
			this.auctionViewerAuctionNameInput.value = auction.name;
			this.auctionViewerAuctionSerialInput.value = auction.serial || "";
			this.auctionViewerAuctionDescriptionArea.value = auction.description || "";
			this.auctionViewerAuctionBidCountInput.value = auction.attributes["bid-count"].toString();

			this.auctionViewerCancelButton.addEventListener("click", event => this.processCancel());
			this.auctionViewerBidButton.addEventListener("click", event => this.processSubmitBid(auction));
		
			if (this.sessionOwner.identity === auction.attributes["seller-reference"] || this.sessionOwner.group === "ADMIN") {
				this.auctionViewerBidderBidAmountDivision.classList.add("hidden");
				this.auctionViewerBidButton.classList.add("hidden");
			} else {
				const bids = await BROKER_SERVICE.queryVisibleAuctionBids(auction.identity);
				const bidAmount = (bids.find(bid => bid.attributes["bidder-reference"] === this.sessionOwner.identity) || {}).amount || 0;
				this.auctionViewerBidderBidAmountInput.value = (0.01 * bidAmount).toFixed(2);
			}

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles displaying the auction editor.
	 * @param {Object} auction the auction
	 */
	async processDisplayAuctionEditor (auction) {
		try {
			if (!auction.attributes) auction.attributes = { "avatar-reference": 1 };

			this.auctionsViewerSection.classList.add("hidden");
			const auctionEditorSectionTemplate = await this.queryTemplate("auction-editor");
			this.center.append(auctionEditorSectionTemplate.content.firstElementChild.cloneNode(true));

			const seller = this.sessionOwner;
			this.auctionEditorSellerAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + seller.attributes["avatar-reference"];
			this.auctionEditorSellerNameInput.value = seller.name.given + " " + seller.name.family;
			this.auctionEditorSellerEmailInput.value = seller.email;
			this.auctionEditorSellerBicInput.value = (seller.account || {}).bic || "";
			this.auctionEditorSellerIbanInput.value = (seller.account || {}).iban || "";

			this.auctionEditorAuctionAvatarButton.addEventListener("click", event => this.auctionEditorAuctionAvatarChooser.click());
			this.auctionEditorAuctionAvatarButton.addEventListener("dragover", event => this.processImageTransferValidation(event.dataTransfer));
			this.auctionEditorAuctionAvatarButton.addEventListener("drop", event => this.processSubmitAvatar(auction, event.dataTransfer.files[0]));
			this.auctionEditorAuctionAvatarChooser.addEventListener("change", event => this.processSubmitAvatar(auction, event.currentTarget.files[0]));
			this.auctionEditorAuctionAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + auction.attributes["avatar-reference"];
			this.auctionEditorAuctionCategorySelector.value = auction.category || "ART";
			this.auctionEditorAuctionRatingSelector.value = auction.rating || "NEW";
			this.auctionEditorAuctionPriceInput.value = (0.01 * (auction.askingPrice || 0)).toFixed(2);
			this.auctionEditorAuctionDurationInput.value = ("identity" in auction ? (auction.closure - auction.created) / DAY_MILLIES : 14).toFixed(1);
			this.auctionEditorAuctionManufacturerInput.value = auction.manufacturer || "";
			this.auctionEditorAuctionNameInput.value = auction.name || "";
			this.auctionEditorAuctionManufactureYearInput.value = auction.manufactureYear || new Date().getFullYear().toString();
			this.auctionEditorAuctionSerialInput.value = auction.serial || "";
			this.auctionEditorAuctionDescriptionArea.value = auction.description || "";

			this.auctionEditorSubmitButton.addEventListener("click", event => this.processSubmitAuction(auction));
			this.auctionEditorCancelButton.addEventListener("click", event => this.processCancel());

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Removes the editor section and re-displays the view section.
	 */
	async processCancel () {
		try {
			if (this.auctionViewerSection) this.auctionViewerSection.remove();
			if (this.auctionEditorSection) this.auctionEditorSection.remove();
			this.auctionsViewerSection.classList.remove("hidden");

			this.messageOutput.value = "ok";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Deletes the given auction.
	 * @param {number} auctionIdentity the auction identity
	 */
	async processDeleteAuction (auctionIdentity) {
		try {
			await BROKER_SERVICE.deleteAuction(auctionIdentity);
			this.#displayOpenAuctions();

			this.messageOutput.value = "ok";
		} catch (error) {
			this.messageOutput.value = error.toString();
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
	 * Performs submitting the auction avatar.
	 * @param auction the auction
	 * @param avatarFile the avatar image file
	 */
	async processSubmitAvatar (auction, avatarFile) {
		try {
			if (!avatarFile.type || !avatarFile.type.startsWith("image/")) throw new RangeError();
			auction.attributes["avatar-reference"] = await BROKER_SERVICE.insertOrUpdateDocument(avatarFile);
			this.auctionEditorAuctionAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + auction.attributes["avatar-reference"];

			this.messageOutput.value = "ok.";
		} catch (error) {
			this.messageOutput.value = error.message || error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles submitting the given auction.
	 * @param {Object} auction the auction
	 */
	async processSubmitAuction (auction) {
		try {
			auction.category = this.auctionEditorAuctionCategorySelector.value.trim() || null;
			auction.rating = this.auctionEditorAuctionRatingSelector.value.trim() || null;
			auction.manufactureYear = window.parseInt(this.auctionEditorAuctionManufactureYearInput.value.trim());
			auction.manufacturer = this.auctionEditorAuctionManufacturerInput.value.trim() || null;
			auction.name = this.auctionEditorAuctionNameInput.value.trim() || null;
			auction.description = this.auctionEditorAuctionDescriptionArea.value.trim() || null;
			auction.serial = this.auctionEditorAuctionSerialInput.value.trim() || null;
			auction.askingPrice = Math.round(window.parseFloat(this.auctionEditorAuctionPriceInput.value) * 100);
			auction.closure = (auction.created || Date.now()) + Math.round(window.parseFloat(this.auctionEditorAuctionDurationInput.value.trim()) * DAY_MILLIES);

			await BROKER_SERVICE.insertOrUpdateAuction(auction);
			this.auctionEditorSection.remove();
			this.auctionsViewerSection.classList.remove("hidden");
			await this.#displayOpenAuctions();

			this.messageOutput.value = "ok";
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
	const controller = new OpenAuctionTabPaneController();
	console.log(controller);
});