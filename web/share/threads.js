/*
 * Returns a promise that fulfills to null after the given duration has elapsed.
 * @param duration the duration in milliseconds
 * @throws {ReferenceError} if the given argument is null
 * @throws {TypeError} if the given argument is not a number
 * @throws {RangeError} if the given argument is strictly negative
 */
export function sleep (duration) {
	if (duration == null) throw new ReferenceError();
	if (typeof duration !== "number") throw new TypeError(duration.toString());
	if (duration < 0) throw new RangeError(duration.toString());
    return new Promise((resolve, reject) => window.setTimeout(() => resolve(null), duration));
}