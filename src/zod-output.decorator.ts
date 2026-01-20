import { ZodTypeAny } from 'zod';
import ZodValidator from './validator.class';

export const ZodOutput =
	<T extends ZodTypeAny>(schema: T): MethodDecorator =>
	(target, propertyKey) =>
		ZodValidator.registerMethodValidationOutputSchema(target, propertyKey as string, schema);
