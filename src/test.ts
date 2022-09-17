import * as z from 'zod';
import { Validate, ZodInput, ZodOutput } from './index';
import * as assert from 'assert';

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
				let error: Error | undefined;
				await handler.handle(input).catch((err) => (error = err));
				assert.strictEqual(error, undefined);
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
				try {
					await handler.handle(input);
				} catch (err) {
					assert.ok(err instanceof z.ZodError);
				}
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
				let error: Error | undefined;
				await handler.handle().catch((err) => (error = err));
				assert.strictEqual(error, undefined);
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
				try {
					await handler.handle();
				} catch (err) {
					assert.ok(err instanceof z.ZodError);
				}
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
				let error: Error | undefined;
				await handler.handle(input).catch((err) => (error = err));
				assert.strictEqual(error, undefined);
			});
		});
	});
});
