import TabPaneController from "../../../../share/tab-pane-controller.js";
import BROKER_SERVICE from "../../../../share/broker-service.js";
import ELEMENT_FACTORY from "../../../../share/element-factory.js";
import { CATEGORY, RATING, STATUS } from "./enums.js"


/**
 * Order editor tab pane controller type.
 */
export default class OrderEditorTabPaneController extends TabPaneController {

	/*
	 * Initializes a new instance.
	 */
	constructor () {
		super("button.order-editor");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	// getter/setter operations
	get sessionOwner () { return this.sharedProperties["session-owner"]; }

	get ordersViewerSection () { return this.center.querySelector("section.orders-viewer"); }
	get ordersViewerTableBody () { return this.ordersViewerSection.querySelector("div.orders>table>tbody"); }

	get offerViewerSection () { return this.center.querySelector("section.offer-viewer"); }
	get offerViewerSellerDivision () { return this.offerViewerSection.querySelector("div.seller"); }
	get offerViewerSellerAvatarViewer () { return this.offerViewerSellerDivision.querySelector("div.avatar>img"); }
	get offerViewerSellerNameInput () { return this.offerViewerSellerDivision.querySelector("div.name>input"); }
	get offerViewerSellerEmailInput () { return this.offerViewerSellerDivision.querySelector("div.email>input"); }
	get offerViewerSellerBicInput () { return this.offerViewerSellerDivision.querySelector("div.bic>input"); }
	get offerViewerSellerIbanInput () { return this.offerViewerSellerDivision.querySelector("div.iban>input"); }
	get offerViewerOfferDivision () { return this.offerViewerSection.querySelector("div.offer"); }
	get offerViewerOfferAvatarViewer () { return this.offerViewerOfferDivision.querySelector("div.avatar>img"); }
	get offerViewerOfferCategoryInput () { return this.offerViewerOfferDivision.querySelector("div.category>input"); }
	get offerViewerOfferRatingInput () { return this.offerViewerOfferDivision.querySelector("div.rating>input"); }
	get offerViewerOfferPriceInput () { return this.offerViewerOfferDivision.querySelector("div.price>input"); }
	get offerViewerOfferPostageInput () { return this.offerViewerOfferDivision.querySelector("div.postage>input"); }
	get offerViewerOfferManufactureYearInput () { return this.offerViewerOfferDivision.querySelector("div.manufacture-year>input"); }
	get offerViewerOfferManufacturerInput () { return this.offerViewerOfferDivision.querySelector("div.manufacturer>input"); }
	get offerViewerOfferNameInput () { return this.offerViewerOfferDivision.querySelector("div.name>input"); }
	get offerViewerOfferSerialInput () { return this.offerViewerOfferDivision.querySelector("div.serial>input"); }
	get offerViewerOfferDescriptionArea () { return this.offerViewerOfferDivision.querySelector("div.description>textarea"); }

	get orderEditorSection () { return this.center.querySelector("section.order-editor"); }
	get orderEditorBuyerDivision () { return this.orderEditorSection.querySelector("div.buyer"); }
	get orderEditorBuyerAvatarViewer () { return this.orderEditorBuyerDivision.querySelector("div.avatar>img"); }
	get orderEditorBuyerNameInput () { return this.orderEditorBuyerDivision.querySelector("div.name>input"); }
	get orderEditorBuyerEmailInput () { return this.orderEditorBuyerDivision.querySelector("div.email>input"); }
	get orderEditorBuyerBicInput () { return this.orderEditorBuyerDivision.querySelector("div.bic>input"); }
	get orderEditorBuyerIbanInput () { return this.orderEditorBuyerDivision.querySelector("div.iban>input"); }
	get orderEditorOrderDivision () { return this.orderEditorSection.querySelector("div.order"); }
	get orderEditorOrderStatusInput () { return this.orderEditorOrderDivision.querySelector("div.status>input"); }
	get orderEditorOrderCreatedInput () { return this.orderEditorOrderDivision.querySelector("div.created>input"); }
	get orderEditorOrderPayedInput () { return this.orderEditorOrderDivision.querySelector("div.payed>input"); }
	get orderEditorOrderTrackingInput () { return this.orderEditorOrderDivision.querySelector("div.tracking>input"); }
	get orderEditorOrderDepartedInput () { return this.orderEditorOrderDivision.querySelector("div.departed>input"); }
	get orderEditorOrderArrivedInput () { return this.orderEditorOrderDivision.querySelector("div.arrived>input"); }
	get orderEditorControlDivision () { return this.orderEditorSection.querySelector("div.control"); }
	get orderEditorArrivedButton () { return this.orderEditorControlDivision.querySelector("button.arrived"); }
	get orderEditorCancelButton () { return this.orderEditorControlDivision.querySelector("button.cancel"); }


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		try {
			// redefine center content
			while (this.center.lastElementChild) this.center.lastElementChild.remove();
			const ordersViewerSectionTemplate = await this.queryTemplate("orders-viewer");
			this.center.append(ordersViewerSectionTemplate.content.firstElementChild.cloneNode(true));

			await this.#displayOrders();

			this.messageOutput.value = "";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Queries and displays the orders associated with the session owner. 
	 */

	async #displayOrders () {
		try {
			while (this.ordersViewerTableBody.lastElementChild) this.ordersViewerTableBody.lastElementChild.remove();

			const orders = await BROKER_SERVICE.queryPersonOrders(this.sessionOwner.identity, null, null);
			
			const orderRowTemplate = await this.queryTemplate("orders-viewer-row");
			// Process each order
			for (const order of orders) {
				const tableRow = orderRowTemplate.content.firstElementChild.cloneNode(true);
				this.ordersViewerTableBody.append(tableRow);

				const avatarImg = tableRow.querySelector("td.avatar>img");
				const manufacturer = tableRow.querySelector("td.manufacturer");
				const name = tableRow.querySelector("td.name");
				const seller = tableRow.querySelector("td.seller");
				const price = tableRow.querySelector("td.price");
				const postage = tableRow.querySelector("td.postage");
				const status = tableRow.querySelector("td.status");
				const maintainButton = tableRow.querySelector("button.maintain");
				const deleteButton = tableRow.querySelector("button.delete");

				avatarImg.src = BROKER_SERVICE.documentsURI + "/" + order.offer.attributes["avatar-reference"];
				manufacturer.textContent = order.offer.manufacturer || "";
				name.textContent =  order.offer.name;
				seller.textContent = order.offer.attributes["seller-reference"];
				price.textContent = order.offer.price / 100;
				postage.textContent = order.offer.postage / 100
				status.textContent = STATUS[order.attributes["status"]];
				
				maintainButton.addEventListener("click", async event => { await this.processDisplayOrderEditor(order, order.seller);});
				deleteButton.addEventListener("click", async event => { await this.processDeleteOrder(order.offer.attributes["order-reference"]);});
				deleteButton.disabled = order.payed == null || order.departed != null;
			}

			this.messageOutput.value = `${orders.length} Bestellung(en) gefunden.`;

		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles displaying the order editor for the given order.
	 * @param {Object} order the order
	 * @param {Object} seller the associated seller
	 */
	async processDisplayOrderEditor (order, seller) {
		try {
			this.ordersViewerSection.classList.add("hidden");
			const viewerTemplate = await this.queryTemplate("offer-viewer");
			this.center.append(viewerTemplate.content.firstElementChild.cloneNode(true));
			const editorTemplate = await this.queryTemplate("order-editor");
			this.center.append(editorTemplate.content.firstElementChild.cloneNode(true));
			if (order.departed != null && order.arrived == null) {
				this.orderEditorControlDivision.prepend(ELEMENT_FACTORY.createHtmlElement("button", { type: "button", innerText: "angekommen" }, {}, "arrived"));
				this.orderEditorArrivedButton.addEventListener("click", event => this.processUpdateOrderStatus(order));
			}

			const buyer = await BROKER_SERVICE.findPerson(order.attributes["buyer-reference"]);
			const seller = await BROKER_SERVICE.findPerson(order.offer.attributes["seller-reference"]);
			
			//seller Info
			this.offerViewerSellerAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + seller.attributes["avatar-reference"];
			this.offerViewerSellerNameInput.value = (seller.name.given + " " + seller.name.family) || "";
			this.offerViewerSellerEmailInput.value = seller.email || "";
			this.offerViewerSellerBicInput.value = seller.account.bic  || "";
			this.offerViewerSellerIbanInput.value = seller.account.iban || "";
			this.offerViewerOfferAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + order.offer.attributes["avatar-reference"];
			//

			this.offerViewerOfferCategoryInput.value = CATEGORY[order.offer.category];
			this.offerViewerOfferRatingInput.value = RATING[order.offer.rating];
			this.offerViewerOfferPriceInput.value = order.offer.price / 100;
			this.offerViewerOfferPostageInput.value = order.offer.postage / 100;
			this.offerViewerOfferManufactureYearInput.value = order.offer.manufactureYear;
			this.offerViewerOfferManufacturerInput.value = order.offer.manufacturer;
			this.offerViewerOfferNameInput.value = order.offer.name;
			this.offerViewerOfferDescriptionArea.value = order.offer.description || "";
			this.offerViewerOfferSerialInput.value = order.offer.serial || "";

			// buyer Info
			this.orderEditorBuyerAvatarViewer.src = BROKER_SERVICE.documentsURI + "/" + buyer.attributes["avatar-reference"];
			this.orderEditorBuyerNameInput.value = (buyer.name.given + " " + buyer.name.family) || "";
			this.orderEditorBuyerEmailInput.value = buyer.email|| "";
			this.orderEditorBuyerBicInput.value = buyer.account.bic|| "";
			this.orderEditorBuyerIbanInput.value = buyer.account.iban || "";

			const createdTimestamp = order.created == null ? null : new Date(order.created);
			const payedTimestamp = order.payed == null ? null : new Date(order.payed);
			const departedTimestamp = order.departed == null ? null : new Date(order.departed);
			const arrivedTimestamp = order.arrived == null ? null : new Date(order.arrived);

			this.orderEditorOrderStatusInput.value = STATUS[order.attributes["status"]];
			this.orderEditorOrderCreatedInput.value = createdTimestamp == null ? "" : createdTimestamp.toLocaleDateString() + " " + createdTimestamp.toLocaleTimeString();
			this.orderEditorOrderPayedInput.value = payedTimestamp == null ? "" : payedTimestamp.toLocaleDateString() + " " + payedTimestamp.toLocaleTimeString();
			this.orderEditorOrderTrackingInput.value = order.trackingReference || "";
			this.orderEditorOrderDepartedInput.value = departedTimestamp == null ? "" : departedTimestamp.toLocaleDateString() + " " + departedTimestamp.toLocaleTimeString();
			this.orderEditorOrderArrivedInput.value = arrivedTimestamp == null ? "" : arrivedTimestamp.toLocaleDateString() + " " + arrivedTimestamp.toLocaleTimeString();

			this.orderEditorCancelButton.addEventListener("click", async event => await this.processCancel());
			
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
			this.orderEditorSection.remove();
			this.offerViewerSection.remove();

			await this.#displayOrders();
			this.ordersViewerSection.classList.remove("hidden");

			this.messageOutput.value = "ok";
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Deletes the given order.
	 * @param {number} orderIdentity the order identity
	 */
	async processDeleteOrder (orderIdentity) {
		try {
			await BROKER_SERVICE.deleteOrder(orderIdentity);
			await this.#displayOrders();
		} catch (error) {
			this.messageOutput.value = error.toString();
			console.error(error);
		}
	}


	/**
	 * Handles updating the given order's status.
	 * @param {Object} order the order
	 */
	async processUpdateOrderStatus (order) {
		try {
			if (order.departed == null || order.arrived != null) throw new RangeError();

			await BROKER_SERVICE.updateOrder(order.identity, null);
			order.arrived = Date.now();
			order.version += 1;

			const arrivedTimestamp = new Date(order.arrived);
			this.orderEditorOrderArrivedInput.value = arrivedTimestamp.toLocaleDateString() + " " + arrivedTimestamp.toLocaleTimeString();

			this.messageOutput.value = "ok.";
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
	const controller = new OrderEditorTabPaneController();
	console.log(controller);
});