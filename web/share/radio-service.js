import basicFetch from "./basic-fetch.js";


/**
 * The radio service proxy type.
 */
class RadioServiceProxy extends Object {
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
		this.#port = 8020; // document.location.port;
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
	 * POST /services/documents * text/plain,
	 * and returns a promise for the resulting document's identity.
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
	 * POST /services/people application/json text/plain,
	 * and returns a promise for the resulting session owner's identity.
	 * @param person the person
	 * @param password the session owner's new password, or null for none
	 * @return a promise for the resulting session owner's identity
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
	 * GET /services/albums - application/json, and returns a
	 * promise for the resulting albums.
	 * @param pagingOffset the offset of the first result, or null for undefined
	 * @param pagingLimit the maximum number of results, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param titleFragment the title fragment, or null for undefined
	 * @param minReleaseYear the minimum release year, or null for undefined
	 * @param maxReleaseYear the maximum release year, or null for undefined
	 * @param minTrackTotal the minimum track total, or null for undefined
	 * @param maxTrackTotal the maximum track total, or null for undefined
	 * @param minTrackCount the minimum track count, or null for undefined
	 * @param maxTrackCount the maximum track count, or null for undefined
	 * @return a promise for the resulting albums
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryAlbums(pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, titleFragment, minReleaseYear, maxReleaseYear, minTrackTotal, maxTrackTotal, minTrackCount, maxTrackCount) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (titleFragment != null) queryFactory.set("title-fragment", titleFragment);
		if (minReleaseYear != null) queryFactory.set("min-release-year", minReleaseYear);
		if (maxReleaseYear != null) queryFactory.set("max-release-year", maxReleaseYear);
		if (minTrackTotal != null) queryFactory.set("min-track-total", minTrackTotal);
		if (maxTrackTotal != null) queryFactory.set("max-track-total", maxTrackTotal);
		if (minTrackCount != null) queryFactory.set("min-track-count", minTrackCount);
		if (maxTrackCount != null) queryFactory.set("max-track-count", maxTrackCount);

		const resource = this.#origin + "/services/albums" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await response.json();
	}



	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/albums/{id} - application/json, and
	 * returns a promise for the matching album.
	 * @param albumIdentity the album identity
	 * @return a promise for the matching album
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findAlbum(albumIdentity) {
		if (albumIdentity == null) throw new ReferenceError();
		if (typeof albumIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/albums/" + albumIdentity;
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/albums application/json text/plain, and
	 * returns a promise for the identity of the modified album.
	 * @param album the album
	 * @return a promise for the identity of the modified album
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateAlbum(album) {
		if (album == null) throw new ReferenceError();
		if (typeof album !== "object") throw new TypeError();

		const resource = this.#origin + "/services/albums";
		const headers = {
			"Content-Type": "application/json",
			"Accept": "text/plain"
		};

		const response = await basicFetch(resource, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(album),
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/albums/{id} - text/plain, and returns a
	 * promise for the identity of the deleted album.
	 * @param albumIdentity the album identity
	 * @return a promise for the identity of the deleted album
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteAlbum (albumIdentity) {
		if (albumIdentity == null) throw new ReferenceError();
		if (typeof albumIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/albums/" + albumIdentity;
		const headers = { "Accept": "text/plain" };

		const response = await basicFetch(resource, {
			method: "DELETE",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}



	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/albums/{id}/tracks - application/json,
	 * and returns a promise for the resulting album tracks.
	 * @param albumIdentity the album identity
	 * @param pagingOffset the offset of the first result, or null for undefined
	 * @param pagingLimit the maximum number of results, or null for undefined
	 * @return a promise for the resulting album tracks
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryAlbumTracks (albumIdentity, pagingOffset, pagingLimit) {
		if (albumIdentity == null) throw new ReferenceError();
		if (typeof albumIdentity !== "number") throw new TypeError();

		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/albums/" + albumIdentity + "/tracks" +
			(queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await response.json();
	}

	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/tracks - application/json,
	 * and returns a promise for the resulting tracks.
	 * @param pagingOffset the offset of the first result, or null for undefined
	 * @param pagingLimit the maximum number of results, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param minOrdinal the minimum ordinal, or null for undefined
	 * @param maxOrdinal the maximum ordinal, or null for undefined
	 * @param artists the artists, or empty for undefined
	 * @param titles the titles, or empty for undefined
	 * @param genres the genres, or empty for undefined
	 * @param recorded whether or not there is an associated recording, or null for undefined
	 * @return a promise for the resulting tracks
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryTracks (pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, minOrdinal, maxOrdinal, artists = [], titles = [], genres = [], recorded) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (minOrdinal != null) queryFactory.set("min-ordinal", minOrdinal);
		if (maxOrdinal != null) queryFactory.set("max-ordinal", maxOrdinal);
		for (const artist of artists) queryFactory.append("artist", artist);
		for (const title of titles) queryFactory.append("title", title);
		for (const genre of genres) queryFactory.append("genre", genre);
		if (recorded != null) queryFactory.set("recorded", recorded);

		const resource = this.#origin + "/services/tracks" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await response.json();
	}

	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/tracks/{id} - application/json, and
	 * returns a promise for the matching track.
	 * @param trackIdentity the track identity
	 * @return a promise for the matching track
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async findTrack (trackIdentity) {
		if (trackIdentity == null) throw new ReferenceError();
		if (typeof trackIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/tracks/" + trackIdentity;
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/albums/{id}/tracks application/json text/plain,
	 * and returns a promise for the identity of the modified track.
	 * @param albumIdentity the album identity
	 * @param track the track
	 * @return a promise for the identity of the modified track
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateTrack (albumIdentity, track) {
		if (albumIdentity == null) throw new ReferenceError();
		if (typeof albumIdentity !== "number") throw new TypeError();
		if (track == null) throw new ReferenceError();
		if (typeof track !== "object") throw new TypeError();

		const resource = this.#origin + "/services/albums/" + albumIdentity + "/tracks";
		const headers = {"Content-Type": "application/json", "Accept": "text/plain"};

		const response = await basicFetch(resource, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(track),
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PUT /services/tracks/{id}/lyrics text/plain text/plain,
	 * and returns a promise for the resulting track identity.
	 * @param track the track
	 * @return a promise for the resulting track identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async updateTrackLyrics (track) {
		if (track == null) throw new ReferenceError();
		if (typeof track !== "object" || typeof track.identity !== "number" || typeof track.lyrics !== "string") {
			throw new TypeError();
		}

		const resource = this.#origin + "/services/tracks/" + track.identity + "/lyrics";
		const headers = {
			"Content-Type": "text/plain",
			"Accept": "text/plain"
		};

		const response = await basicFetch(resource, {
			method: "PUT",
			headers: headers,
			body: track.lyrics,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/tracks/{id} - text/plain,
	 * and returns a promise for the identity of the deleted track.
	 * @param trackIdentity the track identity
	 * @return a promise for the identity of the deleted track
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteTrack (trackIdentity) {
		if (trackIdentity == null) throw new ReferenceError();
		if (typeof trackIdentity !== "number") throw new TypeError();

		const resource = this.#origin + "/services/tracks/" + trackIdentity;
		const headers = { "Accept": "text/plain" };

		const response = await basicFetch(resource, {
			method: "DELETE",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}



	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/tracks/artists - application/json, and
	 * returns a promise for the resulting track artists.
	 * @param pagingOffset the offset of the first result, or null for undefined
	 * @param pagingLimit the maximum number of results, or null for undefined
	 * @return a promise for the resulting track artists
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryTrackArtists (pagingOffset, pagingLimit) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/tracks/artists" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await response.json();
	}



	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/tracks/genres - application/json, and
	 * returns a promise for the resulting track genres.
	 * @param pagingOffset the offset of the first result, or null for undefined
	 * @param pagingLimit the maximum number of results, or null for undefined
	 * @return a promise for the resulting track genres
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryTrackGenres (pagingOffset, pagingLimit) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/tracks/genres" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await response.json();
	}



	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/tracks/titles - application/json, and
	 * returns a promise for the resulting track titles.
	 * @param pagingOffset the offset of the first result, or null for undefined
	 * @param pagingLimit the maximum number of results, or null for undefined
	 * @return a promise for the resulting track titles
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryTrackTitles (pagingOffset, pagingLimit) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

		const resource = this.#origin + "/services/tracks/titles" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return await response.json();
	}

}


// exports the radio service proxy singleton instance
const RADIO_SERVICE = new RadioServiceProxy();
export default RADIO_SERVICE;
