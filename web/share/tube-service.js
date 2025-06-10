import basicFetch from "./basic-fetch.js";


/**
 * The tube service proxy type.
 */
export default class TubeServiceProxy extends Object {
	#protocol;
	#hostname;
	#port;
	#origin;
	#accessKey;


	/**
	 * Initializes a new instance by initializing the values of the web-service
	 * server's service protocol, service hostname, service port and service origin.
	 * For same origin policy (SOP) access, these must be set to the current DOM's
	 * location data, as the web-server must also host the web-services. For
	 * cross-origin resource sharing (CORS) access, these must be set to different
	 * values as the web-service server's location will differ from the web-server's
	 * location!
	 * @param hostname the host name
	 * @param port the port
	 * @param accessKey the access key
	 */
	constructor (hostname, port, accessKey) {
		super();
		if (hostname == null || port == null || accessKey == null) throw new ReferenceError();
		if (typeof hostname !== "string" || typeof port !== "number" || typeof accessKey !== "string") throw new TypeError();
		if (hostname.length === 0 || port < 0 || port > 65535 || accessKey.length !== 64) throw new RangeError();

		this.#protocol = "https:";
		this.#hostname = hostname;
		this.#port = port;
		this.#origin = this.#protocol + "//" + this.#hostname + ":" + this.#port;
		this.#accessKey = accessKey;
	}


	/**
	 * Returns the flicks URI.
	 * @return the flicks URI
	 */
	get flicksURI () {
		return this.#origin + "/services/flicks";
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
	 * @param type the type fragment, or null for undefined
	 * @param description the description fragment, or null for undefined
	 * @param minSize the minimum size, or nullnull for undefined
	 * @param maxSize the maximum size, or null for undefined
	 * @return a promise for the matching auctions
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryDocuments (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, hash, type, description, minSize, maxSize) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (hash != null) queryFactory.set("hash", hash);
		if (type != null) queryFactory.set("type-fragment", type);
		if (description != null) queryFactory.set("description-fragment", description);
		if (minSize != null) queryFactory.set("min-size", minSize);
		if (maxSize != null) queryFactory.set("max-size", maxSize);

		const resource = this.documentsURI + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

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

		const resource = this.documentsURI + "/" + documentIdentity;
		const headers = { "X-Access-Key": this.#accessKey, "Accept": metadata ? "application/json" : "*/*" };

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

		const resource = this.documentsURI;
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain", "Content-Type": file.type, "X-Content-Description": file.name };

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
		if (documentIdentity == null) throw new ReferenceError();
		if (typeof documentIdentity !== "number") throw new TypeError();

		const resource = this.documentsURI + "/" + documentIdentity;
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain" };

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
	 * @param gender the gender, or null for undefined
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
	async queryPeople (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, email, gender, group, title, surname, forename, street, city, country, postcode) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (email != null) queryFactory.set("email", email);
		if (gender != null) queryFactory.set("gender", gender);
		if (group != null) queryFactory.set("group", group);
		if (title != null) queryFactory.set("title", title);
		if (forename != null) queryFactory.set("forename", forename);
		if (surname != null) queryFactory.set("surname", surname);
		if (street != null) queryFactory.set("street", street);
		if (city != null) queryFactory.set("city", city);
		if (country != null) queryFactory.set("country", country);
		if (postcode != null) queryFactory.set("postcode", postcode);

		const resource = this.#origin + "/services/people" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		const people = await response.json();

		people.forEach(person => person.phones.sort((leftPhone, rightPhone) => leftPhone.number.localeCompare(rightPhone.number)));
		return people;
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
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" }, email, password);
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		const person = await response.json();

		person.phones.sort((leftPhone, rightPhone) => leftPhone.number.localeCompare(rightPhone.number));
		return person;
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
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		const person = await response.json();

		person.phones.sort((leftPhone, rightPhone) => leftPhone.number.localeCompare(rightPhone.number));
		return person;
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
	async insertPerson (person, password = null) {
		if (person == null) throw new ReferenceError();
		if (typeof person !== "object" || (password != null && typeof password !== "string")) throw new TypeError();

		const resource = this.#origin + "/services/people";
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain", "Content-Type": "application/json" };
		if (password != null) headers["X-Set-Password"] = password;

		const response = await basicFetch(resource, { method: "POST" , headers: headers, body: JSON.stringify(person), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PUT /services/people/{id} application/json text/plain, and
	 * returns a promise for the associated person's identity.
	 * @param person the person
	 * @param password the new password, or null for none
	 * @return a promise for the associated person's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async updatePerson (person, password = null) {
		if (person == null || person.identity == null) throw new ReferenceError();
		if (typeof person !== "object" || typeof person.identity !== "number" || (password != null && typeof password !== "string")) throw new TypeError();

		const resource = this.#origin + "/services/people/" + person.identity;
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain", "Content-Type": "application/json" };
		if (password != null) headers["X-Set-Password"] = password;

		const response = await basicFetch(resource, { method: "PUT" , headers: headers, body: JSON.stringify(person), credentials: "include" });
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
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain" };

		const response = await basicFetch(resource, { method: "DELETE" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature GET
	 * /services/people/{id}/access-plans - application/json, and
	 * returns a promise for the access rented by the given person.
	 * @param personIdentity the person identity
	 * @return a promise for the access rented by the given person
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryAccessPlans (personIdentity) {
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/people/" + personIdentity + "/access-plans";
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature GET
	 * /services/people/{id}/access-plans application/json text/plain,
	 * and returns a promise for the resulting access plan's identity.
	 * @param accessPlan the access plan
	 * @return a promise for the resulting access plan's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateAccessPlan (accessPlan) {
		if (accessPlan == null || accessPlan.attributes == null || accessPlan.attributes["tenant-reference"] == null) throw new ReferenceError();
		if (typeof accessPlan !== "object" || typeof accessPlan.attributes !== "object" || typeof accessPlan.attributes["tenant-reference"] !== "number") throw new TypeError();

		const resource = this.#origin + "/services/people/" + accessPlan.attributes["tenant-reference"] + "/access-plans";
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain", "Content-Type": "application/json" };

		const response = await basicFetch(resource, { method: "POST" , headers: headers, body: JSON.stringify(accessPlan), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature GET
	 * /services/series (ADMIN) or /services/people/{id}/series (USER) - application/json, 
	 * and returns a promise for the series that are editable by the given person
	 * @param person the person
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @return a promise for the series that are editable by the given person
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryEditableSeries (person, pagingOffset, pagingLimit) {
		if (person == null || person.group == null) throw new ReferenceError();
		if (typeof person !== "object" || typeof person.group !== "string") throw new TypeError();

		const path = person.group === "ADMIN" ? "series" : "people/" + person.identity + "/series";
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/" + path + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature GET
	 * /services/flicks (ADMIN) or /services/people/{id}/flicks (USER)
	 * - application/json, and returns a promise for the flicks editable
	 * by the given person
	 * @param person the person
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @return a promise for the flicks editable by the given person
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryEditableFlicks (person, pagingOffset, pagingLimit) {
		if (person == null || person.group == null) throw new ReferenceError();
		if (typeof person !== "object" || typeof person.group !== "string") throw new TypeError();

		const path = person.group === "ADMIN" ? "flicks" : "people/" + person.identity + "/flicks";
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/" + path + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/series - application/json, and returns a
	 * promise for the resulting series.
	 * @param pagingOffset the offset of the first result, or null for undefined
	 * @param pagingLimit the maximum number of results, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param title the title fragment, or null for undefined
	 * @param minReleaseYear the minimum release year, or null for undefined
	 * @param maxReleaseYear the maximum release year, or null for undefined
	 * @param minSeasonTotal the minimum season total, or null for undefined
	 * @param maxSeasonTotal the maximum season total, or null for undefined
	 * @param minSeasonCount the minimum season count, or null for undefined
	 * @param maxSeasonCount the maximum season count, or null for undefined
	 * @return a promise for the resulting series
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async querySeries (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, title, minReleaseYear, maxReleaseYear, minSeasonTotal, maxSeasonTotal, minSeasonCount, maxSeasonCount) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (title != null) queryFactory.set("title-fragment", title);
		if (minReleaseYear != null) queryFactory.set("min-release-year", minReleaseYear);
		if (maxReleaseYear != null) queryFactory.set("max-release-year", maxReleaseYear);
		if (minSeasonTotal != null) queryFactory.set("min-season-total", minSeasonTotal);
		if (maxSeasonTotal != null) queryFactory.set("max-season-total", maxSeasonTotal);
		if (minSeasonCount != null) queryFactory.set("min-season-count", minSeasonCount);
		if (maxSeasonCount != null) queryFactory.set("max-season-count", maxSeasonCount);

		const resource = this.#origin + "/services/series" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/series/{id} - * / *, and returns a promise
	 * for the resulting series.
	 * @param seriesIdentity the series identity
	 * @return a promise for the series
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findSeries (seriesIdentity) {
		if (seriesIdentity == null) throw new ReferenceError();
		if (typeof seriesIdentity !== "number") throw new TypeError();

		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };
		const resource = this.#origin + "/services/series/" + seriesIdentity;

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/series application/json text/plain, and
	 * returns a promise for the identity of the associated series.
	 * @param series the series
	 * @return a promise for the identity of the associated series
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateSeries (series) {
		if (series == null) throw new ReferenceError();
		if (typeof series !== "object") throw new TypeError();

		const resource = this.#origin + "/services/series";
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain", "Content-Type": "application/json" };

		const response = await basicFetch(resource, { method: "POST" , headers: headers, body: JSON.stringify(series), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/series/{id} - text/plain, and returns a
	 * promise for the identity of the deleted series.
	 * @param seriesIdentity the series identity
	 * @return a promise for the identity of the deleted series
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteSeries (seriesIdentity) {
		if (seriesIdentity == null) throw new ReferenceError();
		if (typeof seriesIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/series/" + seriesIdentity;
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain" };

		const response = await basicFetch(resource, { method: "DELETE" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/series/{id}/seasons - application/json,
	 * and returns a promise for the resulting series seasons.
	 * @param seriesIdentity the series identity
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @return a promise for the resulting series seasons
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async querySeriesSeasons (seriesIdentity, pagingOffset, pagingLimit) {
		if (seriesIdentity == null) throw new ReferenceError();
		if (typeof seriesIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/series/" + seriesIdentity + "/seasons" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/seasons - application/json, and returns a
	 * promise for the resulting seasons.
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param minOrdinal the minimum ordinal, or null for undefined
	 * @param maxOrdinal the maximum ordinal, or null for undefined
	 * @param minEpisodeTotal the minimum episode total, or null for undefined
	 * @param maxEpisodeTotal the maximum episode total, or null for undefined
	 * @param minEpisodeCount the minimum episode count, or null for undefined
	 * @param maxEpisodeCount the maximum episode count, or null for undefined
	 * @return the matching seasons, ordered by ascending series identity and ordinal
	 */
	async querySeasons (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, minOrdinal, maxOrdinal, minEpisodeTotal, maxEpisodeTotal, minEpisodeCount, maxEpisodeCount) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (minOrdinal != null) queryFactory.set("min-ordinal", minOrdinal);
		if (maxOrdinal != null) queryFactory.set("max-ordinal", maxOrdinal);
		if (minEpisodeTotal != null) queryFactory.set("min-episode-total", minEpisodeTotal);
		if (maxEpisodeTotal != null) queryFactory.set("max-episode-total", maxEpisodeTotal);
		if (minEpisodeCount != null) queryFactory.set("min-episode-count", minEpisodeCount);
		if (maxEpisodeCount != null) queryFactory.set("max-episode-count", maxEpisodeCount);

		const resource = this.#origin + "/services/series" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/seasons/{id} - * / *, and returns a promise
	 * for the resulting season.
	 * @param seasonIdentity the season identity
	 * @return a promise for the season
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findSeason (seasonIdentity) {
		if (seasonIdentity == null) throw new ReferenceError();
		if (typeof seasonIdentity !== "number") throw new TypeError();

		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };
		const resource = this.#origin + "/services/seasons/" + seasonIdentity;

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/seasons application/json text/plain, and
	 * returns a promise for the season's identity.
	 * @param season the season
	 * @return a promise for the season's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateSeason (season) {
		if (season == null || season.attributes == null) throw new ReferenceError();
		if (typeof season !== "object" || typeof season.attributes !== "object") throw new TypeError();

		const resource = this.#origin + "/services/seasons";
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain", "Content-Type": "application/json" };

		const response = await basicFetch(resource, { method: "POST" , headers: headers, body: JSON.stringify(season), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/series/{id}/seasons/{ordinal} - text/plain,
	 * and returns a promise for the deleted season's identity.
	 * @param seasonIdentity the season identity
	 * @return a promise for the deleted season's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteSeason (seasonIdentity) {
		if (seasonIdentity == null) throw new ReferenceError();
		if (typeof seasonIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/seasons/" + seasonIdentity;
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain" };

		const response = await basicFetch(resource, { method: "DELETE" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/seasons/{id}/episodes - application/json,
	 * and returns a promise for the resulting season episodes.
	 * @param seasonIdentity the season identity
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @return a promise for the resulting season episodes
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async querySeasonEpisodes (seasonIdentity, pagingOffset, pagingLimit) {
		if (seasonIdentity == null) throw new ReferenceError();
		if (typeof seasonIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/seasons/" + seasonIdentity + "/episodes" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/flicks - application/json,
	 * and returns a promise for the resulting flicks.
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param minOrdinal the minimum ordinal, or null for undefined
	 * @param maxOrdinal the maximum ordinal, or null for undefined
	 * @param minSeasonOrdinal the minimum season ordinal, or null for undefined
	 * @param maxSeasonOrdinal the maximum season ordinal, or null for undefined
	 * @param title the title fragment, or null for undefined
	 * @param seriesTitle the series title fragment, or null for undefined
	 * @param minReleaseYear the minimum release year, or null for undefined
	 * @param maxReleaseYear the maximum release year, or null for undefined
	 * @param genre the genre, or null for undefined
	 * @param producer the producer fragment, or null for undefined
	 * @param director the director fragment, or null for undefined
	 * @param actor the actor fragment, or null for undefined
	 * @param character the character fragment, or null for undefined
	 * @param synopsis the synopsis fragment, or null for undefined
	 * @param recorded whether or not there is an associated recording, or null for undefined
	 * @return a promise for the resulting flicks
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryFlicks (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, minOrdinal, maxOrdinal, minSeasonOrdinal, maxSeasonOrdinal, title, seriesTitle, minReleaseYear, maxReleaseYear, genre, producer, director, actor, character, synopsis, recorded) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (minOrdinal != null) queryFactory.set("min-ordinal", minOrdinal);
		if (maxOrdinal != null) queryFactory.set("max-ordinal", maxOrdinal);
		if (minSeasonOrdinal != null) queryFactory.set("min-season-ordinal", minSeasonOrdinal);
		if (maxSeasonOrdinal != null) queryFactory.set("max-season-ordinal", maxSeasonOrdinal);
		if (title != null) queryFactory.set("title-fragment", title);
		if (seriesTitle != null) queryFactory.set("series-title-fragment", seriesTitle);
		if (minReleaseYear != null) queryFactory.set("min-release-year", minReleaseYear);
		if (maxReleaseYear != null) queryFactory.set("max-release-year", maxReleaseYear);
		if (genre != null) queryFactory.set("genre-fragment", genre);
		if (producer != null) queryFactory.set("producers-fragment", producer);
		if (director != null) queryFactory.set("directors-fragment", director);
		if (actor != null) queryFactory.set("actors-fragment", actor);
		if (character != null) queryFactory.set("characters-fragment", character);
		if (synopsis != null) queryFactory.set("synopsis-fragment", synopsis);
		if (recorded != null) queryFactory.set("recorded", recorded);

		const resource = this.flicksURI + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/flicks/{id} - * / *, and returns a promise
	 * for the resulting flick.
	 * @param flickIdentity the flick identity
	 * @return a promise for the resulting flick
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findFlick (flickIdentity) {
		if (flickIdentity == null) throw new ReferenceError();
		if (typeof flickIdentity !== "number") throw new TypeError();

		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };
		const resource = this.flicksURI + "/" + flickIdentity;

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/flicks application/json text/plain,
	 * and returns a promise for the identity of the modified flick.
	 * @param flick the flick
	 * @return a promise for the identity of the modified flick
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateFlick (flick) {
		if (flick == null) throw new ReferenceError();
		if (typeof flick !== "object") throw new TypeError();

		const resource = this.flicksURI;
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain", "Content-Type": "application/json" };

		const response = await basicFetch(resource, { method: "POST" , headers: headers, body: JSON.stringify(flick), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/flicks/{id} - text/plain,
	 * and returns a promise for the identity of the deleted flick.
	 * @param flickIdentity the flick identity
	 * @return a promise for the identity of the deleted flick
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteFlick (flickIdentity) {
		if (flickIdentity == null) throw new ReferenceError();
		if (typeof flickIdentity !== "number") throw new TypeError();

		const resource = this.flicksURI + "/" + flickIdentity;
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain" };

		const response = await basicFetch(resource, { method: "DELETE" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/flicks/{id}/recording - video/*, and returns
	 * a promise for the resulting flick recording BLOB.
	 * @param flickIdentity the flick identity
	 * @return a promise for the resulting flick recording BLOB
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findFlickRecording (flickIdentity) {
		if (flickIdentity == null) throw new ReferenceError();
		if (typeof flickIdentity !== "number") throw new TypeError();

		const headers = { "X-Access-Key": this.#accessKey, "Accept": "application/json" };
		const resource = this.flicksURI + "/" + flickIdentity + "/recording";

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.blob();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PUT /services/flicks/{id}/recording video/* text/plain,
	 * and returns a promise for the flick recording URI.
	 * @param flickIdentity the flick identity
	 * @param file the file
	 * @return a promise for the flick recording URI
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async updateFlickRecording (flickIdentity, file) {
		if (flickIdentity == null || file == null) throw new ReferenceError();
		if (typeof flickIdentity !== "number" || typeof file !== "object" || !(file instanceof File)) throw new TypeError();

		const resource = this.flicksURI + "/" + flickIdentity + "/recording";
		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain", "Content-Type": file.type };

		const response = await basicFetch(resource, { method: "PUT" , headers: headers, body: file, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.text();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/flicks/{id}/recording - text/plain,
	 * and returns a promise for the deleted flick recording URI
	 * @param flickIdentity the flick identity
	 * @return a promise for the deleted flick recording URI
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteFlickRecording (flickIdentity) {
		if (flickIdentity == null) throw new ReferenceError();
		if (typeof flickIdentity !== "number") throw new TypeError();

		const headers = { "X-Access-Key": this.#accessKey, "Accept": "text/plain" };
		const resource = this.flicksURI + "/" + flickIdentity + "/recording";

		const response = await basicFetch(resource, { method: "DELETE", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.text();
	}
}
