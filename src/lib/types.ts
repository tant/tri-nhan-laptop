// Global type definitions for the project

// CVA VariantProps type utility
export type VariantProps<T> = T extends (...args: any) => any
	? Parameters<T>[0]
	: never;

// Common component props
export interface BaseComponentProps {
	className?: string;
}

// Export for global use
declare global {
	type ClassValue =
		| string
		| number
		| boolean
		| undefined
		| null
		| ClassValue[]
		| { [key: string]: any };
}
