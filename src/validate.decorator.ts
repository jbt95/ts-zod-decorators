/* eslint-disable @typescript-eslint/ban-types */
import ZodValidator from './validator.class';

export const Validate: MethodDecorator = (
	target: Object,
	propertyKey: string | symbol,
	descriptor: PropertyDescriptor,
) => {
	const originalMethod = descriptor.value;
	descriptor.value = async function (...args: unknown[]) {
		ZodValidator.validateInput(target, propertyKey as string, args);
		const result = originalMethod.apply(this, args);
		let resultValue = result;
		if (result instanceof Promise) {
			resultValue = await result;
			ZodValidator.validateOutput(target, propertyKey as string, resultValue);
		}
		return resultValue;
	};
};
