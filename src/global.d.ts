declare global {
	interface Math {
		radToDeg(radians: number): number
		degToRad(degrees: number): number
		/**
		 * Rounds the input number to N digits
		 */
		roundTo(number: number, digits: number): number
		/**
		 * Test if the number is between two other numbers
		 */
		isBetween(number: number, limit1: number, limit2: number): boolean
		/**
		 * Take a rotation value in degrees, and trim it to a value between -180 and 180, while keeping the same angle
		 */
		trimDeg(degrees: number): number
		isPowerOfTwo(number: number): boolean
		/**
		 * Generates a random float between a and b
		 */
		randomab(a: number, b: number): number
		/**
		 * Snap the value to the closest number in a list of 1 or more snap points
		 */
		snapToValues(number: number, snap_points: number[], epsilon: number): number
		clamp: (number: number, min: number, max: number) => number
		/**
		 * Lerp between a and b using the 0-1 alpha value
		 */
		lerp: (a: number, b: number, alpha: number) => number
	}
	interface Array<T> {
		remove(...items: any): boolean
		/***
		 * Adds items to the array if they are not yet in the array
		 */
		safePush(...items: any): boolean
		equals(array: Array<any>): boolean
		/**
		 * Empties the array
		 */
		empty(): this
		last(): T
		allEqual(item: T): boolean
		random(): T
	}
}

export { }

