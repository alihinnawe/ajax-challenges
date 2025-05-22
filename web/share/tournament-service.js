import basicFetch from "./basic-fetch.js";


/**
 * The tournament service proxy type.
 */
class TournamentServiceProxy extends Object {
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
		this.#port = 8060; // document.location.port;
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
	 * GET /services/entities - application/json, and returns a 
	 * promise for the resulting entities.
	 * @param pagingOffset the paging offset, or null for undefined
	 * @param pagingLimit the paging limit, or null for undefined
	 * @param minCreated the minimum creation timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxCreated the maximum creation timestamp in ms since 1/1/1970, or null for undefined
	 * @param minModified the minimum modification timestamp in ms since 1/1/1970, or null for undefined
	 * @param maxModified the maximum modification timestamp in ms since 1/1/1970, or null for undefined
	 * @return a promise for the resulting entities
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryEntities(pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);

		const resource = this.#origin + "/services/entities" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

		const response = await basicFetch(resource, { method: "GET", headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.json();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/[competitors|tournaments|tournament-types] application/json text/plain,
	 * and returns a promise for the resulting entity identity.
	 * @param entity the competitor, tournament, or tournament type
	 * @return a promise for the resulting entity identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateEntity (entity) {
		console.log("entity has:" + entity);
		if (entity == null || entity.attributes == null) throw new RefferenceError();
		if (entity.attributes["discriminator"] !== "Competitor" && entity.attributes["discriminator"] !== "Tournament" && entity.attributes["discriminator"] !== "TournamentType") throw new TypeError();
		let path = "/services/";
		
		switch (entity.attributes["discriminator"]) {
			default:
				throw new Error();
			case "Competitor":
				path += "competitors";
				break;
			case "Tournament":
				path += "tournaments";
				break;
			case "TournamentType":
				path += "tournament-types";
				break;
		}
	
		const resource = this.#origin + path;
		const headers = { "Accept": "text/plain", "Content-Type": "application/json" };
		
		const response = await basicFetch(resource, { method: "POST", headers: headers, body: JSON.stringify(entity), credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * POST /services/[competitors|tournaments|tournament-types] - text/plain,
	 * and returns a promise for the resulting entity identity.
	 * @param entity the competitor, tournament, or tournament type
	 * @return a promise for the resulting entity identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteEntity(entity) {
		if (entity == null || entity.attributes == null || entity.identity == null) throw new ReferenceError();
		const discriminator = entity.attributes["discriminator"];
		let path = "/services/";
		switch (discriminator) {
			default:
				throw new TypeError();
			case "Competitor":
				path += "competitors/" + entity.identity;
				break;
			case "Tournament":
				path += "tournaments/" + entity.identity;
				break;
			case "TournamentType":
				path += "tournament-types/" + entity.identity;
				break;
		}
		const resource = this.#origin + path;
		const response = await basicFetch(resource, {
			method: "DELETE",
			headers: { "Accept": "text/plain" },
			credentials: "include"
		});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
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
	 
	async queryDocuments(pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, hash, typeFragment, descriptionFragment, minSize, maxSize) {
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

		const resource = this.#origin + "/services/documents" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

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
	 * GET /services/documents/{id} - * / *, and returns a promise
	 * for either the matching document or it's content.
	 * @param documentIdentity the document identity
	 * @param metadata true for document metadata, false for document content
	 * @return either the matching document, or it's binary content
	 */
	async findDocument(documentIdentity, metadata = true) {

		const queryFactory = new URLSearchParams();
		queryFactory.set("metadata", metadata);

		const resource = this.#origin + "/services/documents/" + documentIdentity
			+ (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());

		const headers = { "Accept": metadata ? "application/json" : "*/*" };

		const response = await basicFetch(resource, {
			method: "GET",
			headers: headers,
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);

		return metadata ? response.json() : response.blob();
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
		// TODO
		const resource = this.#origin + "/services/documents/" + documentIdentity;
		const headers = { "Accept": "text/plain" };
		const response = await basicFetch(resource, { method: "DELETE" , headers: headers, credentials: "include" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/tournament-types - application/json, and
	 * returns a promise for the resulting tournament types.
	 * @param pagingOffset the paging offset, or null for none
	 * @param pagingLimit the paging limit, or null for none
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param association an association fragment, or null for undefined
	 * @param alias an alias fragment, or null for undefined
	 * @param qualifier a qualifier fragment, or null for undefined
	 * @param minTournamentCount the minimum tournament count, or null for undefined
	 * @param maxTournamentCount the maximum tournament count, or null for undefined
	 * @return a promise for the resulting tournament types
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	 
	async queryTournamentTypes(pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, association, alias, qualifier, minTournamentCount, maxTournamentCount) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (association != null) queryFactory.set("association-fragment", association);
		if (alias != null) queryFactory.set("alias-fragment", alias);
		if (qualifier != null) queryFactory.set("qualifier-fragment", qualifier);
		if (minTournamentCount != null) queryFactory.set("min-tournament-count", minTournamentCount);
		if (maxTournamentCount != null) queryFactory.set("max-tournament-count", maxTournamentCount);

		const resource = this.#origin + "/services/tournament-types" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

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
	 * GET /services/tournament-types/{id} - application/json, and
	 * returns a promise for the matching tournament type.
	 * @param tournamentTypeIdentity the tournament type identity
	 * @return the matching tournament type
	 */
	async findTournamentType(tournamentTypeIdentity) {
		
		const resource = this.#origin + "/services/tournament-types/" + tournamentTypeIdentity;
		const headers = { "Accept": "application/json" };

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
	 * POST /services/tournament-types application/json text/plain,
	 * and returns a promise for the resulting tournament type's identity.
	 * @param tournamentType the tournament type
	 * @return a promise for the resulting tournament type's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateTournamentType(tournamentType) {
		if (tournamentType == null || typeof tournamentType !== "object") throw new ReferenceError();

		const resource = this.#origin + "/services/tournament-types";
		const headers = {
			"Accept": "text/plain",
			"Content-Type": "application/json"
		};

		const response = await basicFetch(resource, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(tournamentType),
			credentials: "include"
		});

		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/tournament-types/{id} - text/plain, and
	 * returns a promise for the identity of the deleted tournament type.
	 * @param tournamentTypeIdentity the tournament type identity
	 * @return a promise for the identity of the deleted tournament type
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteTournamentType(tournamentTypeIdentity) {
		if (tournamentTypeIdentity == null || typeof tournamentTypeIdentity !== "number") {
			throw new TypeError("Expected a valid numeric tournament type identity.");
		}

		const path = "/services/tournament-types/" + tournamentTypeIdentity;
		const resource = this.#origin + path;

		const response = await basicFetch(resource, {
			method: "DELETE",
			headers: { "Accept": "text/plain" },
			credentials: "include"
		});

		if (!response.ok) {
			throw new Error("HTTP " + response.status + " " + response.statusText);
		}

		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/tournament-types/{id}/tournaments - application/json,
	 * and returns a promise for the resulting tournaments.
	 * @param pagingOffset the paging offset, or null for none
	 * @param pagingLimit the paging limit, or null for none
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @return a promise for the resulting tournaments
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryTournamentTypeTournaments(tournamentTypeIdentity, pagingOffset, pagingLimit) {
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		
		const resource = this.#origin + "/services/tournament-types/" + tournamentTypeIdentity + "/tournaments" + 
						(queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };
		
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
	 * GET /services/tournaments - application/json, and returns
	 * a promise for the resulting tournaments.
	 * @param pagingOffset the result offset, or null for undefined
	 * @param pagingLimit the maximum result size, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param association an association fragment, or null for undefined
	 * @param alias an alias fragment, or null for undefined
	 * @param qualifier a qualifier fragment, or null for undefined
	 * @param minSeason the minimum season, or null for undefined
	 * @param maxSeason the maximum season, or null for undefined
	 * @param pointsPerWin the points per win, or null for undefined
	 * @param pointsPerDraw the points per draw, or null for undefined
	 * @param pointsPerLoss the points per loss, or null for undefined
	 * @param minGroupCount the minimum group count, or null for undefined
	 * @param maxGroupCount the maximum group count, or null for undefined
	 * @param minMatchCount the minimum match count, or null for undefined
	 * @param maxMatchCount the maximum match count, or null for undefined
	 * @return a promise for the resulting tournaments
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryTournaments(pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, association, alias, qualifier, minSeason, maxSeason, pointsPerWin, pointsPerDraw, pointsPerLoss, minGroupCount, maxGroupCount, minMatchCount, maxMatchCount) {
		
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (association != null) queryFactory.set("association-fragment", association);
		if (alias != null) queryFactory.set("alias-fragment", alias);
		if (qualifier != null) queryFactory.set("qualifier-fragment", qualifier);
		if (minSeason != null) queryFactory.set("min-season", minSeason);
		if (maxSeason != null) queryFactory.set("max-season", maxSeason);
		if (pointsPerWin != null) queryFactory.set("points-per-win", pointsPerWin);
		if (pointsPerDraw != null) queryFactory.set("points-per-draw", pointsPerDraw);
		if (pointsPerLoss != null) queryFactory.set("points-per-loss", pointsPerLoss);
		if (minGroupCount != null) queryFactory.set("min-group-count", minGroupCount);
		if (maxGroupCount != null) queryFactory.set("max-group-count", maxGroupCount);
		if (minMatchCount != null) queryFactory.set("min-match-count", minMatchCount);
		if (maxMatchCount != null) queryFactory.set("max-match-count", maxMatchCount);

		const resource = this.#origin + "/services/tournaments" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

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
	 * GET /services/tournaments/{id} - application/json, and
	 * returns a promise for the matching tournament.
	 * @param tournamentIdentity the tournament identity
	 * @return the matching tournament
	 */
	async findTournament(tournamentIdentity) {
		
		const resource = this.#origin + "/services/tournaments/" + tournamentIdentity;
		const headers = { "Accept": "application/json" };

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
	 * POST /services/tournaments application/json text/plain,
	 * and returns a promise for the resulting tournament's identity.
	 * @param tournament the tournament
	 * @return a promise for the resulting tournament's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateTournament(tournament) {
		if (tournament == null || typeof tournament !== "object") {
			throw new ReferenceError("Invalid tournament object.");
		}

		const resource = this.#origin + "/services/tournaments";
		const headers = {
			"Accept": "text/plain",
			"Content-Type": "application/json"
		};

		const response = await basicFetch(resource, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(tournament),
			credentials: "include"
		});

		if (!response.ok) {
			throw new Error("HTTP " + response.status + " " + response.statusText);
		}

		return window.parseInt(await response.text());
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/tournament-types/{id} - text/plain, and
	 * returns a promise for the identity of the deleted tournament.
	 * @param tournamentIdentity the tournament identity
	 * @return a promise for the identity of the deleted tournament
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteTournament(tournamentIdentity) {
		if (tournamentIdentity == null || typeof tournamentIdentity !== "number") {
			throw new TypeError("Expected a valid numeric tournament identity.");
		}

		const path = "/services/tournaments/" + tournamentIdentity;
		const resource = this.#origin + path;

		const response = await basicFetch(resource, {
			method: "DELETE",
			headers: { "Accept": "text/plain" },
			credentials: "include"
		});

		if (!response.ok) {
			throw new Error("HTTP " + response.status + " " + response.statusText);
		}

		return window.parseInt(await response.text());
	}

	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * GET /services/tournaments/{id}/standings - application/json,
	 * and returns a promise for the resulting tournament group standings.
	 * @param tournamentIdentity the tournament identity
	 * @param pagingOffset the result offset, or null for undefined
	 * @param pagingLimit the maximum result size, or null for undefined
	 * @return a promise for the resulting tournament group standings
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryTournamentGroupStandings(tournamentIdentity, pagingOffset, pagingLimit) {
	   
	   const queryFactory = new URLSearchParams();
	   if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
	   if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

	   const resource = this.#origin + "/services/tournaments/" + tournamentIdentity + "/standings" + 
					   (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
	   const headers = { "Accept": "application/json" };

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
	 * GET /services/tournaments/{id}/matches - application/json,
	 * and returns a promise for the resulting tournament matches.
	 * @param tournamentIdentity the tournament identity
	 * @param pagingOffset the paging offset, or null for none
	 * @param pagingLimit the paging limit, or null for none
	 * @return a promise for the resulting tournament matches
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryTournamentMatches(tournamentIdentity, pagingOffset, pagingLimit) {
	   
	   const queryFactory = new URLSearchParams();
	   if (pagingOffset != null) queryFactory.set("paging-offset", pagingOffset);
	   if (pagingLimit != null) queryFactory.set("paging-limit", pagingLimit);

	   const resource = this.#origin + "/services/tournaments/" + tournamentIdentity + "/matches" + 
					   (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
	   const headers = { "Accept": "application/json" };

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
	 * POST /services/tournaments/{id}/matches application/x-www-form-urlencoded text/plain,
	 * and returns a promise for the resulting tournament match's identity.
	 * @param match the tournament match
	 * @return a promise for the resulting tournament match's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertTournamentMatch(match) {
		const resource = this.#origin + "/services/tournaments/" + match.tournamentIdentity + "/matches";
		const headers = {
			"Accept": "text/plain",
			"Content-Type": "application/x-www-form-urlencoded"
		};
		
		const queryFactory = new URLSearchParams();
		if (match.groupReference != null) queryFactory.set("group-reference", match.groupReference);
		if (match.leftParentReference != null) queryFactory.set("left-parent-reference", match.leftParentReference);
		if (match.leftParentRank != null) queryFactory.set("left-parent-rank", match.leftParentRank);
		if (match.leftScore != null) queryFactory.set("left-score", match.leftScore);
		if (match.rightParentReference != null) queryFactory.set("right-parent-reference", match.rightParentReference);
		if (match.rightParentRank != null) queryFactory.set("right-parent-rank", match.rightParentRank);
		if (match.rightScore != null) queryFactory.set("right-score", match.rightScore);
		
		const response = await basicFetch(resource, {
			method: "POST",
			headers: headers,
			body: queryFactory,
			credentials: "include"
		});
		
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.text();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * PATCH /services/tournaments/{id1}/matches/{id2} application/x-www-form-urlencoded text-plain,
	 * and returns a promise for the associated tournament match's identity.
	 * @param match the tournament match
	 * @return a promise for the associated tournament match's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async updateTournamentMatch(match) {
		const resource = this.#origin + "/services/tournaments/" + match.tournamentIdentity + "/matches/" + match.matchIdentity;
		const headers = {
			"Accept": "text/plain",
			"Content-Type": "application/x-www-form-urlencoded"
		};
		
		const queryFactory = new URLSearchParams();
		if (match.leftScore != null) queryFactory.set("left-score", match.leftScore);
		if (match.rightScore != null) queryFactory.set("right-score", match.rightScore);
		
		const response = await basicFetch(resource, {
			method: "PATCH",
			headers: headers,
			body: queryFactory,
			credentials: "include"
		});
		
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.text();
	}

	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/tournaments/{id1}/matches/{id2} - text-plain,
	 * and returns a promise for the deleted tournament match's identity.
	 * @param match the tournament match
	 * @return a promise for the deleted tournament match's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteTournamentMatch(match) {
		const resource = this.#origin + "/services/tournaments/" + match.tournamentIdentity + "/matches/" + match.matchIdentity;
		const headers = { "Accept": "text/plain" };
		
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
	 * GET /services/competitors - application/json,
	 * and returns a promise for the resulting competitors.
	 * @param pagingOffset the result offset, or null for undefined
	 * @param pagingLimit the maximum result size, or null for undefined
	 * @param minCreated the minimum creation timestamp, or null for undefined
	 * @param maxCreated the maximum creation timestamp, or null for undefined
	 * @param minModified the minimum modification timestamp, or null for undefined
	 * @param maxModified the maximum modification timestamp, or null for undefined
	 * @param alias an alias, or null for undefined
	 * @param name a name fragment, or null for undefined
	 * @return a promise for the resulting competitors
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async queryCompetitors(pagingOffset, pagingLimit, minCreated, maxCreated, minModified, maxModified, alias, name) {
		
		const queryFactory = new URLSearchParams();
		if (pagingOffset != null) queryFactory.set("resultOffset", pagingOffset);
		if (pagingLimit != null) queryFactory.set("resultLimit", pagingLimit);
		if (minCreated != null) queryFactory.set("min-created", minCreated);
		if (maxCreated != null) queryFactory.set("max-created", maxCreated);
		if (minModified != null) queryFactory.set("min-modified", minModified);
		if (maxModified != null) queryFactory.set("max-modified", maxModified);
		if (alias != null) queryFactory.set("alias", alias);
		if (name != null) queryFactory.set("name-fragment", name);

		const resource = this.#origin + "/services/competitors" + (queryFactory.size === 0 ? "" : "?" + queryFactory.toString());
		const headers = { "Accept": "application/json" };

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
	 * GET /services/competitors/{id} - application/json, and
	 * returns a promise for the matching competitor.
	 * @param competitorIdentity the competitor identity
	 * @return the matching competitor
	 */
	async findCompetitor (competitorIdentity) {
		
		const resource = this.#origin + "/services/competitors/" + competitorIdentity;
		const headers = { "Accept": "application/json" };

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
	 * POST /services/competitors application/json text/plain,
	 * and returns a promise for the resulting competitor's identity.
	 * @param competitor the competitor
	 * @return a promise for the resulting competitor's identity
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertOrUpdateCompetitor(competitor) {
		const resource = this.#origin + "/services/competitors";
		const headers = {
			"Accept": "text/plain",
			"Content-Type": "application/json"
		};
		
		const response = await basicFetch(resource, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(competitor),
			credentials: "include"
		});
		
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.text();
	}


	/**
	 * Remotely invokes the web-service method with HTTP signature
	 * DELETE /services/competitors/{id} - text/plain, and
	 * returns a promise for the identity of the deleted competitor.
	 * @param competitorIdentity the competitor identity
	 * @return a promise for the identity of the deleted competitor
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async deleteCompetitor(competitorIdentity) {
		const resource = this.#origin + "/services/competitors/" + competitorIdentity;
		const headers = { "Accept": "text/plain" };
		
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
	 * PATCH /services/tokens text/plain text/plain, and returns a promise
	 * for an array of generated token aliases.
	 * @param tokenCount the token count, or zero for none
	 * @param tokenAlias the optional token alias for authentication, or null for none
	 * @return a promise for an array of generated token aliases, empty for none
	 * @throws if the TCP connection to the web-service cannot be established, 
	 *			or if the HTTP response is not ok
	 */
	async insertTokens (tokenCount = 0, tokenAlias = null) {
		if (tokenCount == null) throw new ReferenceError();
		if (typeof tokenCount !== "number" || (tokenAlias != null && typeof tokenAlias !== "string")) throw new TypeError();
		if (tokenCount < 0 || tokenCount > 1000 || (tokenAlias != null && tokenAlias.length !== 16)) throw new RangeError();

		const resource = this.#origin + "/services/tokens";
		const headers = { "Accept": "text/plain", "Content-Type": "text/plain" };

		const response = await basicFetch(resource, { method: "PATCH" , headers: headers, body: tokenCount.toString(), credentials: "include" }, tokenAlias == null ? null : "token", tokenAlias);
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		const tokenAliases = (await response.text()).trim();
		return tokenAliases.length === 0 ? [] : tokenAliases.split(/\r?\n/g);
	}
}


// exports the tournament service proxy singleton instance
const TOURNAMENT_SERVICE = new TournamentServiceProxy();
export default TOURNAMENT_SERVICE;
