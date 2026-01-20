/* eslint-disable @typescript-eslint/ban-types */
import { getValidationConfig, isValidationEnabled } from './config';
import type { ValidateOptions, ValidationContext, ValidationKind } from './types';
import { ValidationError } from './types';
import ZodValidator from './validator.class';
import { isAsyncStrategy } from './validation.utils';

const resolveOptions = (options?: ValidateOptions): Required<ValidateOptions> => {
	const config = getValidationConfig();
	return {
		input: options?.input ?? config.defaultInputStrategy,
		output: options?.output ?? config.defaultOutputStrategy,
		validateInputs: options?.validateInputs ?? true,
		validateOutputs: options?.validateOutputs ?? true,
		mode: options?.mode ?? config.defaultMode,
		enabled: options?.enabled ?? isValidationEnabled(),
		onError: options?.onError ?? (() => undefined),
	};
};

const throwValidationError = (
	kind: ValidationKind,
	strategy: Required<ValidateOptions>['input' | 'output'],
	errors: import('zod').ZodError[],
	context: Omit<ValidationContext, 'errors' | 'kind' | 'strategy'>,
	options: Required<ValidateOptions>,
) => {
	if (errors.length === 0) {
		return;
	}
	const error =
		options.mode === 'collect-all' && errors.length > 1 ? new ValidationError(errors, kind) : errors[0];
	const fullContext: ValidationContext = { ...context, kind, strategy, errors };
	const mappedError = options.onError(error, fullContext);
	if (mappedError !== undefined) {
		throw mappedError;
	}
	throw error;
};

const createValidateDecorator = (options?: ValidateOptions): MethodDecorator => {
	return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
		ZodValidator.registerValidateOptions(target, propertyKey as string, options);
		const originalMethod = descriptor.value;
		descriptor.value = function (...args: unknown[]) {
			const resolvedOptions = resolveOptions(options);
			if (!resolvedOptions.enabled) {
				return originalMethod.apply(this, args);
			}
			const contextBase = { target, methodName: propertyKey as string };
			const needsAsyncValidation =
				(resolvedOptions.validateInputs && isAsyncStrategy(resolvedOptions.input)) ||
				(resolvedOptions.validateOutputs && isAsyncStrategy(resolvedOptions.output));
			const isAsyncMethod = originalMethod.constructor.name === 'AsyncFunction';
			if (!needsAsyncValidation && !isAsyncMethod) {
				if (resolvedOptions.validateInputs) {
					const inputErrors = ZodValidator.validateInputSync(
						target,
						propertyKey as string,
						args,
						resolvedOptions.input,
						resolvedOptions.mode,
					);
					throwValidationError('input', resolvedOptions.input, inputErrors, contextBase, resolvedOptions);
				}
				const result = originalMethod.apply(this, args);
				if (result instanceof Promise) {
					return (async () => {
						const resolvedValue = await result;
						if (resolvedOptions.validateOutputs) {
							const outputErrors = ZodValidator.validateOutputSync(
								target,
								propertyKey as string,
								resolvedValue,
								resolvedOptions.output,
							);
							throwValidationError('output', resolvedOptions.output, outputErrors, contextBase, resolvedOptions);
						}
						return resolvedValue;
					})() as unknown;
				}
				if (resolvedOptions.validateOutputs) {
					const outputErrors = ZodValidator.validateOutputSync(
						target,
						propertyKey as string,
						result,
						resolvedOptions.output,
					);
					throwValidationError('output', resolvedOptions.output, outputErrors, contextBase, resolvedOptions);
				}
				return result;
			}
			return (async () => {
				if (resolvedOptions.validateInputs) {
					const inputErrors = await ZodValidator.validateInput(
						target,
						propertyKey as string,
						args,
						resolvedOptions.input,
						resolvedOptions.mode,
					);
					throwValidationError('input', resolvedOptions.input, inputErrors, contextBase, resolvedOptions);
				}
				const result = originalMethod.apply(this, args);
				const resolvedValue = result instanceof Promise ? await result : result;
				if (resolvedOptions.validateOutputs) {
					const outputErrors = await ZodValidator.validateOutput(
						target,
						propertyKey as string,
						resolvedValue,
						resolvedOptions.output,
					);
					throwValidationError('output', resolvedOptions.output, outputErrors, contextBase, resolvedOptions);
				}
				return resolvedValue;
			})() as unknown;
		};
	};
};

export function Validate(): MethodDecorator;
export function Validate(options?: ValidateOptions): MethodDecorator;
export function Validate(
	target: Object,
	propertyKey: string | symbol,
	descriptor: PropertyDescriptor,
): void;
export function Validate(
	...args: [Object, string | symbol, PropertyDescriptor] | [ValidateOptions?]
): MethodDecorator | void {
	if (args.length === 3) {
		createValidateDecorator()(args[0] as Object, args[1] as string | symbol, args[2] as PropertyDescriptor);
		return;
	}
	return createValidateDecorator(args[0] as ValidateOptions);
}
