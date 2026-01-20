import * as z from 'zod';
import type { ValidationStrategy } from './types';

export const isAsyncStrategy = (strategy: ValidationStrategy): boolean =>
	strategy === 'parseAsync' || strategy === 'safeParseAsync';

export const validateSchemaSync = (
	schema: z.ZodTypeAny,
	value: unknown,
	strategy: ValidationStrategy,
): z.ZodError | undefined => {
	switch (strategy) {
		case 'safeParse': {
			const result = schema.safeParse(value);
			return result.success ? undefined : result.error;
		}
		case 'parse': {
			try {
				schema.parse(value);
				return undefined;
			} catch (err) {
				if (err instanceof z.ZodError) {
					return err;
				}
				throw err;
			}
		}
		case 'safeParseAsync':
		case 'parseAsync':
		default: {
			throw new Error(`Async validation strategy "${strategy}" requires an async validation path.`);
		}
	}
};

export const validateSchema = async (
	schema: z.ZodTypeAny,
	value: unknown,
	strategy: ValidationStrategy,
): Promise<z.ZodError | undefined> => {
	switch (strategy) {
		case 'safeParse': {
			const result = schema.safeParse(value);
			return result.success ? undefined : result.error;
		}
		case 'safeParseAsync': {
			const result = await schema.safeParseAsync(value);
			return result.success ? undefined : result.error;
		}
		case 'parseAsync': {
			try {
				await schema.parseAsync(value);
				return undefined;
			} catch (err) {
				if (err instanceof z.ZodError) {
					return err;
				}
				throw err;
			}
		}
		case 'parse':
		default: {
			try {
				schema.parse(value);
				return undefined;
			} catch (err) {
				if (err instanceof z.ZodError) {
					return err;
				}
				throw err;
			}
		}
	}
};
