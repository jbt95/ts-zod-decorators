import type { ZodTypeAny } from 'zod';
import type { ValidateOptions, ValidationMode, ValidationStrategy } from './types';
import { ValidationError } from './types';
import { validateSchema } from './validation.utils';

export type ExpressRequestLike = {
	body?: unknown;
	query?: unknown;
	params?: unknown;
};

export type ExpressResponseLike = {
	status?: (code: number) => ExpressResponseLike;
	json?: (body: unknown) => void;
};

export type ExpressNextFunction = (error?: unknown) => void;

export type ExpressSource = 'body' | 'query' | 'params';

const handleAdapterErrors = (
	errors: import('zod').ZodError[],
	kind: 'input' | 'output',
	mode: ValidationMode,
	onError?: ValidateOptions['onError'],
	context?: Omit<import('./types').ValidationContext, 'errors' | 'kind' | 'strategy'>,
	strategy?: ValidationStrategy,
) => {
	if (errors.length === 0) {
		return;
	}
	const error = mode === 'collect-all' && errors.length > 1 ? new ValidationError(errors, kind) : errors[0];
	if (onError && context && strategy) {
		const mapped = onError(error, { ...context, kind, strategy, errors });
		if (mapped !== undefined) {
			throw mapped;
		}
	}
	throw error;
};

export const createExpressValidator = (
	schema: ZodTypeAny,
	source: ExpressSource = 'body',
	options?: Pick<ValidateOptions, 'input' | 'mode' | 'onError'>,
) => {
	return async (req: ExpressRequestLike, _res: ExpressResponseLike, next: ExpressNextFunction) => {
		try {
			const strategy = options?.input ?? 'parse';
			const mode = options?.mode ?? 'fail-fast';
			const error = await validateSchema(schema, req[source], strategy);
			handleAdapterErrors(
				error ? [error] : [],
				'input',
				mode,
				options?.onError,
				{ target: req, methodName: 'express' },
				strategy,
			);
			next();
		} catch (err) {
			next(err);
		}
	};
};

export const createNestZodPipe = (schema: ZodTypeAny, options?: Pick<ValidateOptions, 'input' | 'mode'>) => {
	return {
		async transform(value: unknown) {
			const strategy = options?.input ?? 'parse';
			const mode = options?.mode ?? 'fail-fast';
			const error = await validateSchema(schema, value, strategy);
			handleAdapterErrors(error ? [error] : [], 'input', mode);
			return value;
		},
	};
};
