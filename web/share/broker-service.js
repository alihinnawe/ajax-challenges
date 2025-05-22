import basicFetch from "./basic-fetch.js";


/**
 * The broker service proxy type.
 */
class BrokerServiceProxy extends Object {
	#protocol;
	#hostname;
	#port;
	#origin;


	/**
	 * Initializes a new instance by initializing the values of the web-service
	 * server's service protocol, service hostname, service port and service origin.
	 * For same origin policy (SOP) access, these must be set to the current DOM's
	 * location data, as the web-server must also host the web-services.
	 * For cross-origin resource sharing (CORS) access, these must be set different
	 * values as the web-service server's location will differ from the web-server's
	 * location!
	 */
	constructor () {
		super();

		this.#protocol = document.location.protocol;
		this.#hostname = document.location.hostname;
		this.#port = 8040; // document.location.port;
		this.#origin = this.#protocol + "//" + this.#hostname + ":" + this.#port;
	}


	/**
	 * Returns the documents URI.
	 * @return the documents URI
	 */
	get documentsURI () {
		return this.#origin + "/services/documents";
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/documents - application/json, and returns a
	 * promise for the matching documents.
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the paging limit, or null for undefined
	 * @param minCreated the minimum creation timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxCreated the maximum creation timestamp in ms since 1/1/1970, or null for undefined
	 * @param minModified the minimum modification timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxModified the maximum modification timestamp in ms since 1/1/1970, or null for undefined
	 * @param hash the hash, or null for undefined
	 * @param typeFragment the type fragment, or null for undefined
	 * @param descriptionFragment the description fragment, or null for undefined
	 * @param minSize the minimum size, or nullnull for undefined
	 * @param maxSize the maximum size, or null for undefined
	 * @return a promise for the matching auctions
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryDocuments (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, hash, typeFragment, descriptionFragment, minSize, maxSize) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/documents/{id} - * / *, and returns a promise
	 * for either the matching document or it's content.
	 * @param documentIdentity the document identity
	 * @param metadata true for document metadata, false for document content
	 * @return either the matching document, or it's binary content
	 */
	async findDocument (documentIdentity, metadata = true) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/documents * text/plain, and returns a
	 * promise for the resulting document's identity.
	 * @param file the file
	 * @return a promise for the resulting document's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateDocument (file) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/documents/{id} - text/plain, and returns a
	 * promise for the identity of the deleted document.
	 * @param documentIdentity the document identity
	 * @return a promise for the identity of the deleted document
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteDocument (documentIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/people - application/json, and returns a
	 * promise for the resulting people.
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param email the email, or null for undefined
	 * @param group the group, or null for undefined
	 * @param title the title, or null for undefined
	 * @param surname the surname, or null for undefined
	 * @param forename the forename, or null for undefined
	 * @param street the street, or null for undefined
	 * @param city the city, or null for undefined
	 * @param country the country, or null for undefined
	 * @param postcode the postcode, or null for undefined
	 * @return a promise for the resulting people
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryPeople (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, email, group, title, surname, forename, street, city, country, postcode) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/people/requester - application/json, and
	 * returns a promise for the resulting requester.
	 * @param email the requester email, or null for none
	 * @param password the requester password, or null for none
	 * @return a promise for the resulting requester
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findRequester (email, password) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/people/{id} - application/json, and
	 * returns a promise for the matching person.
	 * @param personIdentity the person identity
	 * @return a promise for the matching person
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findPerson (personIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/people application/json text/plain, and
	 * returns a promise for the resulting person's identity.
	 * @param person the person
	 * @param password the new password, or null for none
	 * @return a promise for the resulting person's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdatePerson (person, password = null) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/people/{id} - text/plain, and returns a
	 * promise for the identity of the deleted person.
	 * @param personIdentity the person identity
	 * @return a promise for the identity of the deleted person
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deletePerson (personIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/people/{id}/auctions - application/json, and
	 * returns a promise for the resulting auctions.
	 * @param personIdentity the seller's or bidder's identity
	 * @param pagingOffset the paging offset, or null for none
	 * @param pagingLimit the paging limit, or null for none
	 * @param role the requester role, or null for all
	 * @param states the auction states, or empty for all
	 * @return a promise for the resulting auctions
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryPersonAuctions (personIdentity, pagingOffset, pagingLimit, role, states = []) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/people/{id}/offers - application/json, and
	 * returns a promise for the resulting offers.
	 * @param personIdentity the person identity
	 * @param pagingOffset the paging offset, or null for none
	 * @param pagingLimit the paging limit, or null for none
	 * @param available true for available, false for unavailable, or null for undefined
	 * @return a promise for the resulting offers
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryPersonOffers (personIdentity, pagingOffset, pagingLimit, available) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/people/{id}/orders - application/json, and
	 * returns a promise for the resulting orders.
	 * @param personIdentity the person identity
	 * @param pagingOffset the paging offset, or null for none
	 * @param pagingLimit the paging limit, or null for none
	 * @return a promise for the resulting orders
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryPersonOrders (personIdentity, pagingOffset, pagingLimit) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/auctions - application/json, and returns a
	 * promise for the matching auctions.
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the paging limit, or null for undefined
	 * @param minCreated the minimum creation timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxCreated the maximum creation timestamp in ms since 1/1/1970, or null for undefined
	 * @param minModified the minimum modification timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxModified the maximum modification timestamp in ms since 1/1/1970, or null for undefined
	 * @param category the category, or null for undefined
	 * @param rating the rating, or null for undefined
	 * @param minManufactureYear the minimum manufacture year, or null for undefined
	 * @param maxManufactureYear the maximum manufacture year, or null for undefined
	 * @param manufacturer the manufacturer, or null for undefined
	 * @param name the name, or null for undefined
	 * @param description the description, or null for undefined
	 * @param minClosure the minimum closing timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxClosure the maximum closing timestamp in ms since 1/1/1970, or null for undefined
	 * @param minAskingPrice the minimum asking price in cent, or null for undefined
	 * @param maxAskingPrice the maximum asking price in cent, or null for undefined
	 * @param role the requester role, or null for undefined
	 * @param states the auction states, or empty for undefined
	 * @return a promise for the matching auctions
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryAuctions (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, category, rating, minManufactureYear, maxManufactureYear, manufacturer, name, description, minClosure, maxClosure, minAskingPrice, maxAskingPrice, role, states = []) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/auctions - application/json, and returns a
	 * promise for the matching auction.
	 * @param auctionIdentity the auction identity
	 * @return a promise for the matching auction
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findAuction (auctionIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/auctions application/json text/plain, and
	 * returns a promise for the identity of the modified auction.
	 * @param auction the auction
	 * @return a promise for the identity of the modified auction
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateAuction (auction) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/auctions/{id} - text/plain, and returns a
	 * promise for the identity of the deleted auction.
	 * @param auctionIdentity the auction identity
	 * @return a promise for the identity of the deleted auction
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteAuction (auctionIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/auctions/{id}/bids - application/json, and
	 * returns a promise for the given auction's visible bids.
	 * @param auctionIdentity the auction identity
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the paging limit, or null for undefined
	 * @return a promise for the given auction's visible bids
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryVisibleAuctionBids (auctionIdentity, pagingOffset, pagingLimit) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PATCH /services/auctions/{id}/bids text/plain text/plain, and
	 * returns a promise for the identity of the associated auction.
	 * @param auctionIdentity the auction identity
	 * @param bidIncrement the bid increment in cents, zero or null for passing, or negative for folding
	 * @return a promise for the identity of the associated auction
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateOrDeleteAuctionBid (auctionIdentity, bidIncrement) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/offers - application/json, and returns a
	 * promise for the matching offers.
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the paging limit, or null for undefined
	 * @param minCreated the minimum creation timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxCreated the maximum creation timestamp in ms since 1/1/1970, or null for undefined
	 * @param minModified the minimum modification timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxModified the maximum modification timestamp in ms since 1/1/1970, or null for undefined
	 * @param category the category, or null for undefined
	 * @param rating the rating, or null for undefined
	 * @param minManufactureYear the minimum manufacture year, or null for undefined
	 * @param maxManufactureYear the maximum manufacture year, or null for undefined
	 * @param manufacturer the manufacturer, or null for undefined
	 * @param name the name fragment, or null for undefined
	 * @param description the description fragment, or null for undefined
	 * @param minPrice the minimum price in cent, or null for undefined
	 * @param maxPrice the maximum price in cent, or null for undefined
	 * @param minPostage the minimum postage in cents, or null for undefined
	 * @param maxPostage the maximum postage in cents, or null for undefined
	 * @param available true for available, false for unavailable, or null for undefined
	 * @param role the requester role, or null for undefined
	 * @return a promise for the matching offers
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryOffers (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, category, rating, minManufactureYear, maxManufactureYear, manufacturer, name, description, minPrice, maxPrice, minPostage, maxPostage, available, role) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/offers - application/json, and returns a
	 * promise for the matching offer.
	 * @param offerIdentity the offer identity
	 * @return a promise for the matching offer
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findOffer (offerIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/offers application/json text/plain, and
	 * returns a promise for the identity of the modified offer.
	 * @param offer the offer
	 * @return a promise for the identity of the modified offer
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateOffer (offer) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/offers/{id} - text/plain, and returns a
	 * promise for the identity of the deleted offer.
	 * @param offerIdentity the offer identity
	 * @return a promise for the identity of the deleted offer
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteOffer (offerIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/orders/{id} - application/json, and returns
	 * a promise for the resulting order.
	 * @param orderIdentity the order's identity
	 * @return a promise for the resulting order
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findOrder (orderIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PATCH /services/offers/{id} - text/plain, and returns a
	 * promise for the newly associated order's identity.
	 * @param offerIdentity the offer Identity
	 * @return a promise for the newly associated order's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrder (offerIdentity) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PATCH /services/orders/{id} text/plain text/plain, and
	 * returns a promise for the given order's identity.
	 * @param orderIdentity the order's identity
	 * @param trackingReference the tracking reference, or null for none
	 * @return a promise for the given order's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async updateOrder (orderIdentity, trackingReference) {
		// TODO
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/orders/{id} - text/plain, and returns a
	 * promise for the identity of the deleted order.
	 * @param orderIdentity the order identity
	 * @return a promise for the identity of the deleted order
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteOrder (orderIdentity) {
		// TODO
	}
}


// exports the broker service proxy singleton instance
const BROKER_SERVICE = new BrokerServiceProxy();
export default BROKER_SERVICE;
