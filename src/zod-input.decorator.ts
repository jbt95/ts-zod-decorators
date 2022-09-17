import { AnyZodObject } from 'zod';
import ZodValidator from './validator.class';

export const ZodInput =
	<T extends AnyZodObject>(schema: T): ParameterDecorator =>
	(target, propertyKey, parameterIndex) =>
		ZodValidator.registerInputParameterValidationSchema(target, propertyKey as string, parameterIndex, schema);
