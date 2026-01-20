import type * as z from 'zod';

export type ValidationStrategy = 'parse' | 'safeParse' | 'parseAsync' | 'safeParseAsync';

export type ValidationMode = 'fail-fast' | 'collect-all';

export type ValidationKind = 'input' | 'output';

export type ValidateOptions = {
	input?: ValidationStrategy;
	output?: ValidationStrategy;
	validateInputs?: boolean;
	validateOutputs?: boolean;
	mode?: ValidationMode;
	enabled?: boolean;
	onError?: (error: unknown, context: ValidationContext) => unknown | void;
};

export type ValidationContext = {
	target: object;
	methodName: string;
	kind: ValidationKind;
	strategy: ValidationStrategy;
	errors: z.ZodError[];
};

export class ValidationError extends Error {
	public readonly errors: z.ZodError[];
	public readonly kind: ValidationKind;

	constructor(errors: z.ZodError[], kind: ValidationKind) {
		super(`Validation failed for ${kind} with ${errors.length} error(s).`);
		this.name = 'ZodDecoratorValidationError';
		this.errors = errors;
		this.kind = kind;
	}
}

export type ValidationMetadata = {
	methodName: string;
	inputParams: number[];
	inputGroups: Array<{ map: Record<string, number> }>;
	hasOutputSchema: boolean;
	options?: ValidateOptions;
};

export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>;
export type InferInput<T extends z.ZodTypeAny> = z.input<T>;
export type InferOutput<T extends z.ZodTypeAny> = z.output<T>;
export type ValidatedMethod<I extends z.ZodTypeAny, O extends z.ZodTypeAny> = (
	input: z.infer<I>,
) => z.infer<O>;
