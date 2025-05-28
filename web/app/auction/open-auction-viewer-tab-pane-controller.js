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
	get auctionsQueryMinOpenDurationInput () { return this.auctionsQuerySection.querySelector("div.min-open-duration>input"); }
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
			if (!this.auctionsViewerSection) {
				const auctionsViewerSectionTemplate = await this.queryTemplate("auctions-viewer");
				this.center.append(auctionsViewerSectionTemplate.content.firstElementChild.cloneNode(true));
			}

			const category = this.auctionsQueryCategorySelector.value.trim() || null;
			const rating = this.auctionsQueryRatingSelector.value.trim() || null;
			const manufacturer = this.auctionsQueryManufacturerInput.value.trim() || null;
			const name = this.auctionsQueryNameInput.value.trim() || null;
			const description = this.auctionsQueryDescriptionInput.value.trim() || null;
			const maxAskingPrice = Math.round(100 * Number.parseFloat(this.auctionsQueryMaxAskingPriceInput.value.trim())) || null;
			const minOpenDuration = Math.round(Number.parseFloat(this.auctionsQueryMinOpenDurationInput.value.trim()) * DAY_MILLIES) || null;
			const minAge = Math.round(Number.parseFloat(this.auctionsQueryMinAgeInput.value.trim()) * DAY_MILLIES) || null;
			const maxAge = Math.round(Number.parseFloat(this.auctionsQueryMaxAgeInput.value.trim()) * DAY_MILLIES) || null;

			const minClosure = minOpenDuration == null ? null : Date.now() + minOpenDuration;
			const minCreated = maxAge == null ? null : Date.now() - maxAge;
			const maxCreated = minAge == null ? null : Date.now() - minAge;

			const auctions = await BROKER_SERVICE.queryAuctions(null, null, minCreated, maxCreated, null, null, category, rating, null, null, manufacturer, name, description, minClosure, null, maxAskingPrice, null, "BIDDER", ["OPEN", "SEALED"]);
			console.log("auctions", auctions);

			this.auctionsViewerTableBody.innerHTML = "";
			const auctionsViewerTableRowTemplate = await this.queryTemplate("auctions-viewer-row");

			for (const auction of auctions) {
				const tableRow = auctionsViewerTableRowTemplate.content.firstElementChild.cloneNode(true);
				this.auctionsViewerTableBody.append(tableRow);
				this.auctionsViewerTableHeadExtra.innerText = "Mind. Preis (€)";
				const avatarImg = tableRow.querySelector("td.avatar > img");
				avatarImg.src = BROKER_SERVICE.documentsURI + "/" + auction.attributes["avatar-reference"];
				const manufacturer = tableRow.querySelector("td.manufacturer");
				manufacturer.textContent = auction.manufacturer || "";
				const name = tableRow.querySelector("td.name");
				name.textContent = auction.name || "";
				const begin = tableRow.querySelector("td.begin");
				begin.textContent = new Date(auction.created).toLocaleString();
				const end = tableRow.querySelector("td.end");
				end.textContent = new Date(auction.closure).toLocaleString();
				const bid = tableRow.querySelector("td.bid-count");
				bid.textContent = String(auction.attributes["bid-count"] ?? 0);
				const askingPrice = tableRow.querySelector("td.extra");
				askingPrice.textContent = auction.askingPrice / 100;
				const action = tableRow.querySelector("td.action");
				
				const viewButton = document.createElement("button");
				viewButton.textContent = "Ansehen";
				viewButton.addEventListener("click", () => this.processDisplayAuctionViewer(auction));
				action.appendChild(viewButton);
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
			this.auctionsViewerSection.classList.add("hidden");
			this.auctionsQuerySection.classList.add("hidden");
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
			this.auctionViewerBidButton.addEventListener("click", event => this.processSubmitBid(auction.identity));
		
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
	 * Removes the editor section and re-displays the view section.
	 */
	async processCancel () {
		try {
			if (this.auctionViewerSection) this.auctionViewerSection.remove();
			if (this.auctionEditorSection) this.auctionEditorSection.remove();

			await this.processQueryAuctions();
			this.auctionsViewerSection.classList.remove("hidden");
			this.auctionsQuerySection.classList.remove("hidden");

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
			const bidAmount = Math.round(100 * Number.parseFloat(this.auctionViewerBidderBidAmountInput.value.trim())) || null;
			await BROKER_SERVICE.insertOrUpdateOrDeleteAuctionBid(auctionIdentity, bidAmount);
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