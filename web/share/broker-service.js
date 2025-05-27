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
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (hash != null) queryFactory.set("hash", hash);
		if (typeFragment != null) queryFactory.set("type-fragment", typeFragment);
		if (descriptionFragment != null) queryFactory.set("description-fragment", descriptionFragment);
		if (minSize != null) queryFactory.set("min-size", minSize);
		if (maxSize != null) queryFactory.set("max-size", maxSize);

		const resource = this.#origin + "/services/dcouments" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (documentIdentity == null || metadata == null) throw new ReferenceError();
		if (typeof documentIdentity !== "number" || typeof metadata !== "boolean") throw new TypeError();

		const resource = this.#origin + "/services/documents/" + documentIdentity;
		const headers = { "Accept": metadata ? "application/json" : "*/*" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await (metadata ? response.json() : response.arrayBuffer());
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
		if (file == null) throw new ReferenceError();
		if (typeof file !== "object" || !(file instanceof File)) throw new TypeError();

		const resource = this.#origin + "/services/documents";
		const headers = { "Accept": "text/plain", "Content-Type": file.type, "X-Content-Description": file.name };

		const response = await basicFetch(resource, { method: "POST" , headers: headers, body: file, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		const resource = this.#origin + "/services/documents/" + documentIdentity;
		const headers = { "Accept": "text/plain" };
		
		const response = await basicFetch(resource, { method: "DELETE" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (email != null) queryFactory.set("email", email);
		if (group != null) queryFactory.set("group", group);
		if (title != null) queryFactory.set("title", title);
		if (surname != null) queryFactory.set("surname", surname);
		if (forename != null) queryFactory.set("forename", forename);
		if (street != null) queryFactory.set("street", street);
		if (city != null) queryFactory.set("city", city);
		if (country != null) queryFactory.set("country", country);
		if (postcode != null) queryFactory.set("postcode", postcode);

		const resource = this.#origin + "/services/people" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (email == null || password == null) throw new ReferenceError();
		if (typeof email !== "string" || typeof password !== "string") throw new TypeError();

		const resource = this.#origin + "/services/people/requester";
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" }, email, password);
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/people/" + personIdentity;
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" }, email, password);
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (person == null) throw new ReferenceError();
		if (typeof person !== "object" || (password != null && typeof password !== "string")) throw new TypeError();

		const resource = this.#origin + "/services/people";
		const headers = { "Accept": "text/plain", "Content-Type": "application/json" };
		if (password != null) headers["X-Set-Password"] = password;

		const response = await basicFetch(resource, { method: "POST" , headers: headers, body: JSON.stringify(person), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/people/" + personIdentity;
		const headers = { "Accept": "text/plain" };

		const response = await basicFetch(resource, { method: "DELETE" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactoryqueryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (role != null) queryFactory.set("role", role);
		if (states.length > 0) queryFactory.set("status", states.join(","));

		const resource = this.#origin + "/services/people/" + personIdentity + "/auctions" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (available != null) queryFactory.set("available", available);

		const resource = this.#origin + "/services/people/" + personIdentity + "/offers" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/people/" + personIdentity + "/orders" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (category != null) queryFactory.set("category", category);
		if (rating != null) queryFactory.set("rating", rating);
		if (minManufactureYear != null) queryFactory.set("min-manufacture-year", minManufactureYear);
		if (maxManufactureYear != null) queryFactory.set("max-manufacture-year", maxManufactureYear);
		if (manufacturer != null) queryFactory.set("manufacturer", manufacturer);
		if (name != null) queryFactory.set("name-fragment", name);
		if (description != null) queryFactory.set("description-fragment", description);
		if (minClosure != null) queryFactory.set("min-closure", minClosure);
		if (maxClosure != null) queryFactory.set("max-closure", maxClosure);
		if (minAskingPrice != null) queryFactory.set("min-asking-price", minAskingPrice);
		if (maxAskingPrice != null) queryFactory.set("max-asking-price", maxAskingPrice);
		if (role != null) queryFactory.set("role", role);
		if (states.length) queryFactory.set("status", states.join(","));

		const resource = this.#origin + "/services/auctions" + (queryFactory.size ? "?" + queryFactory.toString() : "");
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (auctionIdentity == null) throw new ReferenceError();
		if (typeof auctionIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/auctions/" + auctionIdentity + "?detailed=true";
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (auction == null) throw new ReferenceError();
		if (typeof auction !== "object") throw new TypeError();

		const resource = this.#origin + "/services/auctions";
		const headers = { "Accept": "text/plain", "Content-Type": "application/json" };

		const response = await basicFetch(resource, { method: "POST", headers: headers, body: JSON.stringify(auction), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		if (auctionIdentity == null) throw new ReferenceError();
		if (typeof auctionIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/auctions/" + auctionIdentity;
		const headers = { "Accept": "text/plain" };

		const response = await basicFetch(resource, { method: "DELETE", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		if (auctionIdentity == null) throw new ReferenceError();
		if (typeof auctionIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/auctions/" + auctionIdentity + "/bids" + (queryFactory.size ? "?" + queryFactory.toString() : "");
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PATCH /services/auctions/{id}/bids text/plain text/plain, and
	 * returns a promise for the identity of the associated auction.
	 * @param auctionIdentity the auction identity
	 * @param bidAmount the bid amount in cents, zero for none
	 * @return a promise for the identity of the associated auction
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateOrDeleteAuctionBid (auctionIdentity, bidAmount) {
		if (auctionIdentity == null || bidAmount == null) throw new ReferenceError();
		if (typeof auctionIdentity !== "number" || typeof bidAmount !== "number") throw new TypeError();
		if (bidAmount < 0) throw new RangeError();

		const resource = this.#origin + "/services/auctions/" + auctionIdentity + "/bids";
		const headers = { "Accept": "text/plain", "Content-Type": "text/plain" };

		const response = await basicFetch(resource, { method: "PATCH", headers: headers, body: bidAmount.toString(), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (category != null) queryFactory.set("category", category);
		if (rating != null) queryFactory.set("rating", rating);
		if (minManufactureYear != null) queryFactory.set("min-manufacture-year", minManufactureYear);
		if (maxManufactureYear != null) queryFactory.set("max-manufacture-year", maxManufactureYear);
		if (manufacturer != null) queryFactory.set("manufacturer", manufacturer);
		if (name != null) queryFactory.set("name-fragment", name);
		if (description != null) queryFactory.set("description-fragment", description);
		if (minPrice != null) queryFactory.set("min-price", minPrice);
		if (maxPrice != null) queryFactory.set("max-price", maxPrice);
		if (minPostage != null) queryFactory.set("min-postage", minPostage);
		if (maxPostage != null) queryFactory.set("max-postage", maxPostage);
		if (available != null) queryFactory.set("available", available);
		if (role != null) queryFactory.set("role", role);

		const resource = this.#origin + "/services/offers" + (queryFactory.size ? "?" + queryFactory.toString() : "");
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (offerIdentity == null) throw new ReferenceError();
		if (typeof offerIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/offers/" + offerIdentity;
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
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
		if (offer == null) throw new ReferenceError("Offer must not be null.");
		if (typeof offer !== "object") throw new TypeError("Offer must be an object.");

		const resource = this.#origin + "/services/offers";
		const headers = {"Accept": "text/plain", "Content-Type": "application/json"};

		const response = await basicFetch(resource, {method: "POST", headers: headers, body: JSON.stringify(offer), credentials: "include"});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		if (offerIdentity == null) { throw new ReferenceError("Offer identity must not be null.");}
		if (typeof offerIdentity !== "string" && typeof offerIdentity !== "number") { throw new TypeError("Offer identity must be a string or number.");}

		const resource = this.#origin + "/services/offers/" + offerIdentity;
		const headers = { "Accept": "text/plain"};
		
		const response = await basicFetch(resource, {method: "DELETE", headers: headers, credentials: "include"});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
		if (orderIdentity == null) throw new ReferenceError("Order identity must not be null.");
		if (typeof orderIdentity !== "number") throw new TypeError("Order identity must be a string or number.");

		const resource = this.#origin + "/services/orders/" + orderIdentity;
		const headers = { "Accept": "application/json" };

		const response = await this.basicFetch(resource, {method: "GET", headers: headers, credentials: "include"});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);

		return /* await */ response.json();
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
		if (offerIdentity == null) throw new ReferenceError("Offer identity must not be null.");
		if (typeof offerIdentity !== "number") throw new TypeError("Offer identity must be a number.");

		const resource = this.#origin + "/services/offers/" + offerIdentity;
		const headers = { "Accept": "text/plain" };

		const response = await this.basicFetch(resource, {method: "SET", headers: headers, credentials: "include"});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);

		return window.parseInt(await response.text());
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
		if (orderIdentity == null) throw new ReferenceError("Order identity must not be null.");
		if (typeof orderIdentity !== "number") throw new TypeError("Order identity must be a number.");
		if (trackingReference != null && typeof trackingReference !== "string") throw new TypeError("Tracking reference must be a string or null.");

		const resource = this.#origin + "/services/orders/" + orderIdentity;
		const headers = {"Content-Type": "text/plain", "Accept": "text/plain"};

		const response = await this.basicFetch(resource, { method: "PATCH", headers: headers, body: trackingReference === null ? "" : trackingReference, credentials: "include"});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);

		return window.parseInt(await response.text());
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
	async deleteOrder(orderIdentity) {
		if (orderIdentity == null) throw new ReferenceError("Order identity must not be null.");
		if (typeof orderIdentity !== "number") throw new TypeError("Order identity must be a number.");

		const resource = this.#origin + "/services/orders/" + orderIdentity;
		const headers = {"Accept": "text/plain"};

		const response = await this.basicFetch(resource, {method: "DELETE", headers: headers, credentials: "include"});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);

		return window.parseInt(await response.text());
	}
}


// exports the broker service proxy singleton instance
const BROKER_SERVICE = new BrokerServiceProxy();
export default BROKER_SERVICE;
