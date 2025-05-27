import TabPaneController from "../../../../share/tab-pane-controller.js";
import BROKER_SERVICE from "../../../../share/broker-service.js";
import ELEMENT_FACTORY from "../../../../share/element-factory.js";
import { CATEGORY, RATING } from "./enums.js"


// constants
const DAY_MILLIES = 24 * 60 * 60 * 1000;


/**
 * Auction viewer tab pane controller type.
 */
export default class AuctionViewerTabPaneController extends TabPaneController {

	/*
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.open-auction-viewer");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }

	get auctionsQuerySection () { return this.center.querySelector("section.auctions-query"); }
	get auctionsQueryCategorySelector () { return this.auctionsQuerySection.querySelector("div.category>select"); }
	get auctionsQueryRatingSelector () { return this.auctionsQuerySection.querySelector("div.rating>select"); }
	get auctionsQueryManufacturerInput () { return this.auctionsQuerySection.querySelector("div.manufacturer>input"); }
	get auctionsQueryNameInput () { return this.auctionsQuerySection.querySelector("div.name>input"); }
	get auctionsQueryDescriptionInput () { return this.auctionsQuerySection.querySelector("div.description>input"); }
	get auctionsQueryMaxAskingPriceInput () { return this.auctionsQuerySection.querySelector("div.max-asking-price>input"); }
	get auctionsQueryMaxOpenDurationInput () { return this.auctionsQuerySection.querySelector("div.max-open-duration>input"); }
	get auctionsQueryMinAgeInput () { return this.auctionsQuerySection.querySelector("div.min-age>input"); }
	get auctionsQueryMaxAgeInput () { return this.auctionsQuerySection.querySelector("div.max-age>input"); }
	get auctionsQueryButton () { return this.auctionsQuerySection.querySelector("div.control>button.query"); }

	get auctionsViewerSection () { return this.center.querySelector("section.auctions-viewer"); }
	get auctionsViewerHeading () { return this.auctionsViewerSection.querySelector("div.auctions>h1"); }
	get auctionsViewerPriceColumnHeading () { return this.auctionsViewerSection.querySelector("div.auctions>table>thead>tr>th.price"); }
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


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const auctionsQuerySectionTemplate = await this.queryTemplate("auctions-query");
			this.center.append(auctionsQuerySectionTemplate.content.firstElementChild.cloneNode(true));

			// register basic event listeners
			this.auctionsQueryButton.addEventListener("click", event => this.processQueryAuctions());

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries and displays the matching auctions. 
	 */
	async processQueryAuctions () {
		try {
			if (!this.auctionViewerSection) {
				const auctionsViewerSectionTemplate = await this.queryTemplate("auctions-viewer");
				this.center.append(auctionsViewerSectionTemplate.content.firstElementChild.cloneNode(true));
			}

			const auctions = await BROKER_SERVICE.queryAuctions();
			console.log("auctions", auctions);

			this.auctionsViewerTableBody.innerHTML = "";
			const auctionsViewerTableRowTemplate = await this.queryTemplate("auctions-viewer-row");

			for (const auction of auctions) {
				const row = auctionsViewerTableRowTemplate.content.firstElementChild.cloneNode(true);
				this.auctionsViewerTableBody.append(row);


				const avatarImg = row.querySelector("td.avatar > img");
				avatarImg.src = BROKER_SERVICE.documentsURI + "/" + auction.attributes["avatar-reference"];
				
				const manufacturerCell = row.querySelector("td.manufacturer");
				if (manufacturerCell) manufacturerCell.textContent = auction.manufacturer || "";

				const nameCell = row.querySelector("td.name");
				if (nameCell) nameCell.textContent = auction.name || "";

				// Beginn
				const beginCell = row.querySelector("td.begin");
				if (beginCell) beginCell.textContent = new Date(auction.created).toLocaleString();

				// Ende
				const endCell = row.querySelector("td.end");
				if (endCell) endCell.textContent = new Date(auction.closure).toLocaleString();

				// Gebote
				const bidCell = row.querySelector("td.bid-count");
				bidCell.textContent = String(auction.attributes["bid-count"] ?? 0);


				// Aktion
				const actionCell = row.querySelector("td.action");
				if (actionCell) {
					const viewButton = document.createElement("button");
					viewButton.textContent = "Ansehen";
					viewButton.addEventListener("click", () => this.processDisplayAuctionViewer(auction));
					actionCell.appendChild(viewButton);
				}
			}
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}





	/**
	 * Handles displaying the auction viewer.
	 * @param {Object} auction the auction
	 */
	async processDisplayAuctionViewer (auction) {
		try {
			// TODO

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
			// TODO

			this.messageOutput.value = "ok";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles submitting the given auction bid.
	 * @param {number} auctionIdentity the auction identity
	 */
	async processSubmitBid (auctionIdentity) {
		try {
			// TODO

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
	const controller = new AuctionViewerTabPaneController();
	console.log(controller);
});