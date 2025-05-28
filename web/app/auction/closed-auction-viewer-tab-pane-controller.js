import TabPaneController from "../../../../share/tab-pane-controller.js";
import BROKER_SERVICE from "../../../../share/broker-service.js";
import ELEMENT_FACTORY from "../../../../share/element-factory.js";
import { CATEGORY, RATING } from "./enums.js"


// constants
const DAY_MILLIES = 24 * 60 * 60 * 1000;


/**
 * Closed auction viewer tab pane controller type.
 */
export default class ClosedAuctionViewerTabPaneController extends TabPaneController {

	/*
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.closed-auction-viewer");

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
	get auctionViewerBidButton () { return this.auctionViewerSection.querySelector("div.control>button.bid"); }
	get auctionViewerCancelButton () { return this.auctionViewerSection.querySelector("div.control>button.cancel"); }

	get auctionBidsViewerSection () { return this.center.querySelector("section.auction-bids-viewer"); }
	get auctionBidsViewerWinnerBidDivision () { return this.auctionBidsViewerSection.querySelector("div.winner-bid"); }
	get auctionBidsViewerWinnerAvatarViewer () { return this.auctionBidsViewerWinnerBidDivision.querySelector("div.avatar>img"); }
	get auctionBidsViewerWinnerNameInput () { return this.auctionBidsViewerWinnerBidDivision.querySelector("div.name>input"); }
	get auctionBidsViewerWinnerEmailInput () { return this.auctionBidsViewerWinnerBidDivision.querySelector("div.email>input"); }
	get auctionBidsViewerWinnerBicInput () { return this.auctionBidsViewerWinnerBidDivision.querySelector("div.bic>input"); }
	get auctionBidsViewerWinnerIbanInput () { return this.auctionBidsViewerWinnerBidDivision.querySelector("div.iban>input"); }
	get auctionBidsViewerWinnerBidAmountInput () { return this.auctionBidsViewerWinnerBidDivision.querySelector("div.bid-amount>input"); }
	get auctionBidsViewerBidsDivision () { return this.auctionBidsViewerSection.querySelector("div.bids"); }
	get auctionBidsViewerTableBody () { return this.auctionBidsViewerBidsDivision.querySelector("table>tbody"); }
	get auctionBidsViewerCancelButton () { return this.auctionBidsViewerSection.querySelector("div.control>button.cancel"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const auctionsViewerSectionTemplate = await this.queryTemplate("auctions-viewer");
			this.center.append(auctionsViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			this.auctionsViewerHeading.innerText = "Ihre beendeten Auktionen";
			this.auctionsViewerTableHeadExtra.innerText = "Rolle";

			await this.#displayClosedAuctions();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries and displays the session owner's closed auctions. 
	 */
	async #displayClosedAuctions () {
		const auctions = await BROKER_SERVICE.queryPersonAuctions(this.sessionOwner.identity, null, null, "SELLER", ["CLOSED"]);
		console.log(auctions);
		this.auctionsViewerTableBody.innerHTML = "";
		const closedAuctionsViewerTableRowTemplate = await this.queryTemplate("auctions-viewer-row");
		
		for (const auction of auctions) {
			const tableRow = closedAuctionsViewerTableRowTemplate.content.firstElementChild.cloneNode(true);
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
			this.auctionViewerBidButton.classList.add("hidden");

			if (auction.attributes["bid-count"] > 0) {
				const bids = await BROKER_SERVICE.queryVisibleAuctionBids(auction.identity);

				if (!this.auctionBidsViewerSection) {
					const auctionBidsViewerSectionTemplate = await this.queryTemplate("auction-bids-viewer");
					this.center.append(auctionBidsViewerSectionTemplate.content.firstElementChild.cloneNode(true));

					this.auctionViewerCancelButton.classList.add("hidden");
					this.auctionBidsViewerCancelButton.addEventListener("click", event => this.processCancel());
				}

				//	const bidAmount = (bids.find(bid => bid.attributes["bidder-reference"] === this.sessionOwner.identity) || {}).amount || 0;
				const winnerBid = bids[0];
				const winner = await BROKER_SERVICE.findPerson(winnerBid.attributes["bidder-reference"]);
				console.log("winner", winner);
				
				const auctionBidsWinnerTableRowTemplate = await this.queryTemplate("auction-bids-viewer");
				const tableRow = auctionBidsWinnerTableRowTemplate.content.firstElementChild.cloneNode(true);
				this.auctionBidsViewerWinnerAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + winner.attributes["avatar-reference"];
				this.auctionBidsViewerWinnerNameInput.value = winner.name.given + " " + winner.name.family;
				this.auctionBidsViewerWinnerEmailInput.value = winner.email || "";				
				this.auctionBidsViewerWinnerBicInput.value = winner.account.bic || "";	
				this.auctionBidsViewerWinnerIbanInput.value = winner.account.iban || "";	
				this.auctionBidsViewerWinnerBidAmountInput.value = (0.01 * winnerBid.amount).toFixed(2);

				this.auctionBidsViewerTableBody.innerHTML = "";
				const auctionBidsTableRowTemplate = await this.queryTemplate("auction-bids-viewer-row");
				for (const bid of bids) {
					const tableRow = auctionBidsTableRowTemplate.content.firstElementChild.cloneNode(true);
					this.auctionBidsViewerTableBody.append(tableRow);

					const bidder = await BROKER_SERVICE.findPerson(bid.attributes["bidder-reference"]);
					const modifiedTimestamp = new Date(bid.modified);
					tableRow.querySelector("td.avatar>img").src = BROKER_SERVICE.documentsURI + "/" + bidder.attributes["avatar-reference"];
					tableRow.querySelector("td.name").innerText = bidder.name.given + " " + bidder.name.family;
					tableRow.querySelector("td.modified").innerText = modifiedTimestamp.toLocaleDateString() + " " + modifiedTimestamp.toLocaleTimeString();
					tableRow.querySelector("td.bid-amount").innerText = (0.01 * bid.amount).toFixed(2);
				}
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
			this.auctionsViewerSection.classList.remove("hidden");
			this.auctionViewerSection.remove();
			if (this.auctionBidsViewerSection) this.auctionBidsViewerSection.remove();

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
	const controller = new ClosedAuctionViewerTabPaneController();
	console.log(controller);
});