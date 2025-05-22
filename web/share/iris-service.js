import basicFetch from "./basic-fetch.js";


/**
 * The iris service proxy type.
 */
class IrisServiceProxy extends Object {
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
		this.#port = 8050; // document.location.port;
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

		const resource = this.documentsURI + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
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

		const resource = this.documentsURI + "/" + documentIdentity;
		const headers = { "Accept": metadata ? "application/json" : "*/*" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await (metadata ? response.json() : response.arrayBuffer());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/documents * text/plain, and returns a promise
	 * for the resulting document's identity.
	 * @param file the file
	 * @return a promise for the resulting document's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateDocument (file) {
		if (file == null) throw new ReferenceError();
		if (typeof file !== "object" || !(file instanceof File)) throw new TypeError();

		const resource = this.documentsURI;
		const headers = { "Accept": "text/plain", "Content-Type": file.type, "X-Content-Description": file.name };

		const response = await basicFetch(resource, { method: "POST" , headers: headers, body: file, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/documents/{id} - text/plain, and returns
	 * a promise for the identity of the deleted document.
	 * @param documentIdentity the document identity
	 * @return a promise for the identity of the deleted document
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteDocument (documentIdentity) {
		if (documentIdentity == null) throw new ReferenceError();
		if (typeof documentIdentity !== "number") throw new TypeError();

		const resource = this.documentsURI + "/" + documentIdentity;
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
		if (forename != null) queryFactory.set("forename", forename);
		if (surname != null) queryFactory.set("surname", surname);
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
	 * GET /services/people/{id} - application/json, and returns
	 * a promise for the matching person.
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

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/people application/json text/plain, and
	 * returns a promise for the resulting resulting person's identity.
	 * @param person the person
	 * @param password the new password, or null for none
	 * @return a promise for the resulting resulting person's identity
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
	 * GET /services/people/{id}/influencers - application/json,
	 * and returns a promise for the resulting influencers.
	 * @param personIdentity the person identity
	 * @param pagingOffset the paging offset, or null for none
	 * @param pagingLimit the paging limit, or null for none
	 * @return a promise for the resulting influencers
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryPersonInfluencers (personIdentity, pagingOffset, pagingLimit) {
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/people/" + personIdentity + "/influencers" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/people/{id}/followers - application/json,
	 * and returns a promise for the resulting followers.
	 * @param personIdentity the person identity
	 * @param pagingOffset the paging offset, or null for none
	 * @param pagingLimit the paging limit, or null for none
	 * @return a promise for the resulting followers
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryPersonFollowers (personIdentity, pagingOffset, pagingLimit) {
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/people/" + personIdentity + "/followers" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return /* await */ response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PATCH /services/people/{id}/followers - text/plain, and
	 * returns a promise for the newly associated influencer's identity.
	 * @param influencerIdentity the influencer's identity
	 * @return a promise for the newly associated influencer's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async addRequesterInfluencer (influencerIdentity) {
		if (influencerIdentity == null) throw new ReferenceError();
		if (typeof influencerIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/people/" + influencerIdentity + "/followers";
		const headers = { "Accept": "text/plain" };

		const response = await basicFetch(resource, { method: "PATCH" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/people/{id}/followers - text/plain, and
	 * returns a promise for the former influencer's identity.
	 * @param influencerIdentity the influencer's identity
	 * @return a promise for the former influencer's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async removeRequesterInfluencer (influencerIdentity) {
		if (influencerIdentity == null) throw new ReferenceError();
		if (typeof influencerIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/people/" + influencerIdentity + "/followers";
		const headers = { "Accept": "text/plain" };

		const response = await basicFetch(resource, { method: "DELETE" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/people/{id}/messages - application/json, and
	 * returns a promise for the resulting root messages.
	 * @param personIdentity the person identity
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @return a promise for the resulting root messages
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryPersonRootMessages (personIdentity, pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified) {
		
		if (personIdentity == null) throw new ReferenceError();
		if (typeof personIdentity !== "number") throw new TypeError();
		
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		queryFactory.set("root",true);
		const resource = this.#origin + "/services/people/" + personIdentity + "/messages?" + queryFactory.toString();
		const headers = { "Accept": "application/json" };
		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.json();
		
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/messages/{id}/children - application/json,
	 * and returns a promise for the resulting child messages.
	 * @param messageIdentity the message identity
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @return a promise for the resulting child messages
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryChildMessages (messageIdentity, pagingOffset, pagingLimit) {
		
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		
		const resource = this.#origin + "/services/messages/" + messageIdentity + "/children?" + queryFactory.toString();
		const headers = { "Accept": "application/json" };
		const response = await basicFetch(resource, { method: "GET" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/messages or /services/messages/{id}/children
	 * text/plain text/plain, and returns a promise for the newly
	 * created message's identity.
	 * @param messageBody the message body
	 * @param parentMessageIdentity the (optional) parent message identity, or null for none
	 * @return a promise for the for the newly created message's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertMessage(messageBody, parentMessageIdentity) {
		
		const path = parentMessageIdentity == null
			? "/services/messages"
			: "/services/messages/" + parentMessageIdentity + "/children";
			
		const resource = this.#origin + path;
		const headers = {
			"Content-Type": "text/plain",
			"Accept": "text/plain"
		};

		const response = await basicFetch(resource, {
			method: "POST",
			headers: headers,
			body: messageBody,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.text();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/messages/{id}, text/plain text/plain, and
	 * returns a promise for the deleted message's identity.
	 * @param messageIdentity the message identity
	 * @return a promise for the for the deleted message's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteMessage (messageIdentity) {
		const resource = this.#origin + "/services/messages/" + messageIdentity;
		const headers = {
			"Accept": "text/plain"
		};

		const response = await basicFetch(resource, {
			method: "DELETE",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.text();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/messages/{id}/attachments - application/json,
	 * and returns a promise for the resulting attachments.
	 * @param messageIdentity the message identity
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the maximum paging size, or null for undefined
	 * @return a promise for the resulting attachments
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryMessageAttachments(messageIdentity, pagingOffset, pagingLimit) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) query.append("paging-offset", pagingOffset);
		if (pagingLimit != null) query.append("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/messages/" + messageIdentity + "/attachments?" + queryFactory.toString();
		const headers = {
			"Accept": "application/json"
		};

		const response = await basicFetch(resource, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PATCH /services/messages/{id1}/attachments/{id2} - text/plain,
	 * and returns a promise for the message attachment's identity.
	 * @param messageIdentity the message identity
	 * @param documentIdentity the document identity
	 * @return a promise for the for the document identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async addMessageAttachment(messageIdentity, documentIdentity) {
		const resource = this.#origin + "/services/messages/" + messageIdentity + "/attachments/" + documentIdentity;
		const headers = {
			"Accept": "text/plain"
		};

		const response = await basicFetch(resource, {
			method: "PATCH",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.text();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/messages/{id1}/attachments/{id2} - text/plain,
	 * and returns a promise for the message attachment's identity.
	 * @param messageIdentity the message identity
	 * @param documentIdentity the document identity
	 * @return a promise for the for the document identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async removeMessageAttachment(messageIdentity, documentIdentity) {
		const resource = this.#origin + "/services/messages/" + messageIdentity + "/attachments/" + documentIdentity;
		const headers = {
			"Accept": "text/plain"
		};

		const response = await basicFetch(resource, {
			method: "DELETE",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.text(); 
	}
}


// exports the iris service proxy singleton instance
const IRIS_SERVICE = new IrisServiceProxy();
export default IRIS_SERVICE;
