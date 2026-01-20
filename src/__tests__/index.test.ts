import * as z from 'zod';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	Validate,
	ZodInput,
	ZodInputs,
	ZodOutput,
	ValidationError,
	getValidationMetadata,
	resetValidationConfig,
	setValidationConfig,
} from '../';

describe('Having a method to validate', () => {
	describe('And one of the parameters is decorated with @ZodInput', () => {
		const CommandSchema = z.object({
			name: z.string(),
			age: z.number(),
			address: z.object({
				city: z.string(),
				country: z.string(),
			}),
		});
		class Handler {
			@Validate
			public async handle(@ZodInput(CommandSchema) _: z.infer<typeof CommandSchema>) {
				return 'ok';
			}
		}
		let handler: Handler;
		describe('And the input is valid', () => {
			let input: z.infer<typeof CommandSchema>;
			beforeEach(() => {
				handler = new Handler();
				input = {
					age: 20,
					name: 'John',
					address: { city: 'London', country: 'UK' },
				};
			});
			it('should not throw an error', async () => {
				await expect(handler.handle(input)).resolves.toBe('ok');
			});
		});
		describe('And the input is invalid', () => {
			let input: z.infer<typeof CommandSchema>;
			beforeEach(() => {
				handler = new Handler();
				input = {
					age: 20,
					name: 'John',
					address: { city: 'London', country: 1 },
				} as any;
			});
			it('should throw a ZodError', async () => {
				await expect(handler.handle(input)).rejects.toBeInstanceOf(z.ZodError);
			});
		});
	});
	describe('And the method is decorated with @ZodOutput', () => {
		const OutputSchema = z.object({
			name: z.string(),
			age: z.number(),
			address: z.object({
				city: z.string(),
				country: z.string(),
			}),
		});
		describe('And the output is returned synchronously', () => {
			class Handler {
				@Validate
				@ZodOutput(OutputSchema)
				public handle(): z.infer<typeof OutputSchema> {
					return {
						age: 20,
						name: 'John',
						address: { city: 'London', country: 'UK' },
					};
				}
			}
			const handler = new Handler();
			it('should validate the output', () => {
				expect(handler.handle()).toEqual({
					age: 20,
					name: 'John',
					address: { city: 'London', country: 'UK' },
				});
			});
		});
		describe('And the output is valid', () => {
			class Handler {
				@Validate
				@ZodOutput(OutputSchema)
				public async handle(): Promise<z.infer<typeof OutputSchema>> {
					return {
						age: 20,
						name: 'John',
						address: { city: 'London', country: 'UK' },
					};
				}
			}
			const handler = new Handler();
			it('should not throw an error', async () => {
				await expect(handler.handle()).resolves.toEqual({
					age: 20,
					name: 'John',
					address: { city: 'London', country: 'UK' },
				});
			});
		});
		describe('And the output is invalid', () => {
			class Handler {
				@Validate
				@ZodOutput(OutputSchema)
				public async handle(): Promise<z.infer<typeof OutputSchema>> {
					return {
						age: 20,
						name: 'John',
					} as any;
				}
			}
			const handler = new Handler();
			it('should throw a ZodError', async () => {
				await expect(handler.handle()).rejects.toBeInstanceOf(z.ZodError);
			});
		});
	});
	describe('And the method is decorated with @ZodOutput and one of the parameters is decorated with @ZodInput', () => {
		const CommandSchema = z.object({
			name: z.string(),
			age: z.number(),
			address: z.object({
				city: z.string(),
				country: z.string(),
			}),
		});
		const OutputSchema = CommandSchema;
		class Handler {
			@Validate
			@ZodOutput(OutputSchema)
			public async handle(
				@ZodInput(CommandSchema) command: z.infer<typeof CommandSchema>,
			): Promise<z.infer<typeof OutputSchema>> {
				return command;
			}
		}
		describe('and the output and input are valid', () => {
			const handler = new Handler();
			let input: z.infer<typeof CommandSchema>;
			beforeEach(
				() =>
					(input = {
						age: 20,
						name: 'John',
						address: { city: 'London', country: 'UK' },
					}),
			);
			it('should not throw a validation error', async () => {
				await expect(handler.handle(input)).resolves.toEqual(input);
			});
		});
	});
	describe('And the method has multiple @ZodInput parameters', () => {
		const NameSchema = z.string().min(1);
		const AgeSchema = z.number().int().positive();
		class Handler {
			@Validate
			public async handle(@ZodInput(NameSchema) name: string, @ZodInput(AgeSchema) age: number) {
				return `${name}-${age}`;
			}
		}
		const handler = new Handler();
		it('should validate each parameter with its schema', async () => {
			await expect(handler.handle('John', 20)).resolves.toBe('John-20');
			await expect(handler.handle('', 20)).rejects.toBeInstanceOf(z.ZodError);
			await expect(handler.handle('John', -1)).rejects.toBeInstanceOf(z.ZodError);
		});
	});
	describe('And the method uses @ZodInputs for grouped validation', () => {
		const GroupSchema = z.object({ name: z.string(), age: z.number().int().positive() });
		class Handler {
			@Validate
			@ZodInputs(GroupSchema, { name: 0, age: 1 })
			public async handle(name: string, age: number) {
				return `${name}-${age}`;
			}
		}
		const handler = new Handler();
		it('should validate the grouped payload', async () => {
			await expect(handler.handle('Jane', 30)).resolves.toBe('Jane-30');
			await expect(handler.handle('Jane', -5)).rejects.toBeInstanceOf(z.ZodError);
		});
	});
	describe('And validation uses collect-all mode', () => {
		const NameSchema = z.string().min(1);
		const AgeSchema = z.number().int().positive();
		class Handler {
			@Validate({ mode: 'collect-all' })
			public async handle(@ZodInput(NameSchema) name: string, @ZodInput(AgeSchema) age: number) {
				return `${name}-${age}`;
			}
		}
		const handler = new Handler();
		it('should aggregate errors', async () => {
			await handler.handle('', -1).catch((err) => {
				expect(err).toBeInstanceOf(ValidationError);
				const validationError = err as ValidationError;
				expect(validationError.errors).toHaveLength(2);
			});
		});
	});
	describe('And validation uses parseAsync', () => {
		const AsyncSchema = z.string().refine(async (value) => value === 'ok', 'not ok');
		class Handler {
			@Validate({ input: 'parseAsync' })
			public async handle(@ZodInput(AsyncSchema) value: string) {
				return value;
			}
		}
		const handler = new Handler();
		it('should await async parsing', async () => {
			await expect(handler.handle('ok')).resolves.toBe('ok');
			await expect(handler.handle('nope')).rejects.toBeInstanceOf(z.ZodError);
		});
	});
	describe('And validation is disabled via config', () => {
		const InputSchema = z.string().min(5);
		class Handler {
			@Validate
			public async handle(@ZodInput(InputSchema) value: string) {
				return value;
			}
		}
		const handler = new Handler();
		it('should skip validation when disabled', async () => {
			setValidationConfig({ enabled: false });
			await expect(handler.handle('no')).resolves.toBe('no');
			resetValidationConfig();
		});
	});
	describe('And validation errors are mapped', () => {
		const InputSchema = z.number().int().positive();
		class Handler {
			@Validate({
				onError: () => new Error('mapped error'),
			})
			public async handle(@ZodInput(InputSchema) value: number) {
				return value;
			}
		}
		const handler = new Handler();
		it('should throw the mapped error', async () => {
			await expect(handler.handle(-1)).rejects.toThrowError('mapped error');
		});
	});
	describe('And metadata is introspected', () => {
		class Handler {
			@Validate({ validateOutputs: false })
			public async handle(@ZodInput(z.string()) value: string) {
				return value;
			}
		}
		it('should return method metadata', () => {
			const metadata = getValidationMetadata(Handler.prototype);
			expect(metadata).toHaveLength(1);
			expect(metadata[0]?.methodName).toBe('handle');
		});
	});
});
