/**
 * Secret credentials store; this script must be imported into a module!
 */
const credentialsStore = {};


/**
 * Sends a network request for the given resource, returning a promise
 * that is fulfilled once the associated response is available. The
 * maintains a credential store as a module variable, allowing it to
 * securely enrich requests with HTTP "Basic" authentication headers
 * if no user credentials are given.
 * @param resource the resource
 * @param options the (optional) options
 * @param alias the (optional) user alias
 * @param password the (optional) user password
 * @return {Promise} a promise resolving to the response to your request
 */
export default function basicFetch (resource, options = {}, alias = null, password = null) {
	if (typeof resource !== "string" || typeof options !== "object") throw new TypeError();

	const resourceLocator = new URL(resource, window.location);
	const credentialsMode = options.credentials || "same-origin";
	if (!options.method) options.method = "GET";
	if (!options.headers) options.headers = {};
	options.credentials = "omit";

	if (alias != null || password != null) {
		alias = (alias || "").toString().trim();
		password = (password || "").toString().trim();
		if (alias.includes(":")) throw new RangeError();

		options.headers["Authorization"] = credentialsStore[resourceLocator.origin] = "Basic " + window.btoa(alias + ":" + password);
	} else if (resourceLocator.origin in credentialsStore && (credentialsMode === "include" || (credentialsMode === "same-origin" && resourceLocator.origin === window.location.origin))) {
		options.headers["Authorization"] = credentialsStore[resourceLocator.origin];
	}

	return window.fetch(resourceLocator.toString(), options);
}
