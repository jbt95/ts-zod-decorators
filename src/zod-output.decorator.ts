import { AnyZodObject } from 'zod';
import ZodValidator from './validator.class';

export const ZodOutput =
	<T extends AnyZodObject>(schema: T): MethodDecorator =>
	(target, propertyKey) =>
		ZodValidator.registerMethodValidationOutputSchema(target, propertyKey as string, schema);
