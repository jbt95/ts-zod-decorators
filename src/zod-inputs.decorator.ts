import { ZodTypeAny } from 'zod';
import ZodValidator from './validator.class';

export type ZodInputMap = Record<string, number>;

export const ZodInputs =
	<T extends ZodTypeAny>(schema: T, map: ZodInputMap): MethodDecorator =>
	(target, propertyKey) =>
		ZodValidator.registerInputGroupValidationSchema(target, propertyKey as string, schema, map);
