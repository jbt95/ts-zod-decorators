/* eslint-disable @typescript-eslint/ban-types */
import * as z from 'zod';
import type { ValidateOptions, ValidationMetadata, ValidationMode, ValidationStrategy } from './types';
import { validateSchema, validateSchemaSync } from './validation.utils';

type Target = Object;
type MethodName = string;
type Metadata = {
	paramsIndex: number[];
	inputSchemas: Map<number, z.ZodTypeAny>;
	inputGroups: Array<{ schema: z.ZodTypeAny; map: Record<string, number> }>;
	outputSchema?: z.ZodTypeAny;
	options?: ValidateOptions;
};

export default class ZodValidator {
	private static methodValidatorMap: Map<Target, Map<MethodName, Metadata>> = new Map();

	static registerInputParameterValidationSchema(
		target: Object,
		methodName: MethodName,
		paramIndex: number,
		schema: z.ZodTypeAny,
	) {
		let paramMap = this.methodValidatorMap.get(target);
		if (!paramMap) {
			paramMap = new Map();
			this.methodValidatorMap.set(target, paramMap);
		}
		let metadata = paramMap.get(methodName);
		if (!metadata) {
			metadata = { paramsIndex: [], inputSchemas: new Map(), inputGroups: [] };
			paramMap.set(methodName, metadata);
		}
		metadata.paramsIndex.push(paramIndex);
		metadata.inputSchemas.set(paramIndex, schema);
	}

	static registerInputGroupValidationSchema(
		target: Object,
		methodName: MethodName,
		schema: z.ZodTypeAny,
		map: Record<string, number>,
	) {
		let paramMap = this.methodValidatorMap.get(target);
		if (!paramMap) {
			paramMap = new Map();
			this.methodValidatorMap.set(target, paramMap);
		}
		let metadata = paramMap.get(methodName);
		if (!metadata) {
			metadata = { paramsIndex: [], inputSchemas: new Map(), inputGroups: [] };
			paramMap.set(methodName, metadata);
		}
		metadata.inputGroups.push({ schema, map });
	}

	static registerMethodValidationOutputSchema(target: Object, methodName: MethodName, schema: z.ZodTypeAny) {
		let paramMap = this.methodValidatorMap.get(target);
		if (!paramMap) {
			paramMap = new Map();
			this.methodValidatorMap.set(target, paramMap);
		}
		let metadata = paramMap.get(methodName);
		if (!metadata) {
			metadata = { paramsIndex: [], inputSchemas: new Map(), inputGroups: [], outputSchema: schema };
			paramMap.set(methodName, metadata);
		}
		metadata.outputSchema = schema;
	}

	static registerValidateOptions(target: Object, methodName: MethodName, options?: ValidateOptions) {
		if (!options) {
			return;
		}
		let paramMap = this.methodValidatorMap.get(target);
		if (!paramMap) {
			paramMap = new Map();
			this.methodValidatorMap.set(target, paramMap);
		}
		let metadata = paramMap.get(methodName);
		if (!metadata) {
			metadata = { paramsIndex: [], inputSchemas: new Map(), inputGroups: [] };
			paramMap.set(methodName, metadata);
		}
		metadata.options = options;
	}

	static async validateInput(
		target: Object,
		methodName: string,
		paramValues: unknown[],
		strategy: ValidationStrategy,
		mode: ValidationMode,
	) {
		const methodMetadataMap = this.methodValidatorMap.get(target);
		const metadata = methodMetadataMap?.get(methodName);
		if (!metadata) {
			return [];
		}
		const errors: z.ZodError[] = [];
		for (const [index, input] of paramValues.entries()) {
			if (metadata.paramsIndex.indexOf(index) !== -1) {
				const schema = metadata.inputSchemas.get(index);
				if (!schema) {
					continue;
				}
				const error = await validateSchema(schema, input, strategy);
				if (error) {
					if (mode === 'fail-fast') {
						return [error];
					}
					errors.push(error);
				}
			}
		}
		for (const group of metadata.inputGroups) {
			const payload: Record<string, unknown> = {};
			for (const [key, index] of Object.entries(group.map)) {
				payload[key] = paramValues[index];
			}
			const error = await validateSchema(group.schema, payload, strategy);
			if (error) {
				if (mode === 'fail-fast') {
					return [error];
				}
				errors.push(error);
			}
		}
		return errors;
	}

	static validateInputSync(
		target: Object,
		methodName: string,
		paramValues: unknown[],
		strategy: ValidationStrategy,
		mode: ValidationMode,
	) {
		const methodMetadataMap = this.methodValidatorMap.get(target);
		const metadata = methodMetadataMap?.get(methodName);
		if (!metadata) {
			return [];
		}
		const errors: z.ZodError[] = [];
		for (const [index, input] of paramValues.entries()) {
			if (metadata.paramsIndex.indexOf(index) !== -1) {
				const schema = metadata.inputSchemas.get(index);
				if (!schema) {
					continue;
				}
				const error = validateSchemaSync(schema, input, strategy);
				if (error) {
					if (mode === 'fail-fast') {
						return [error];
					}
					errors.push(error);
				}
			}
		}
		for (const group of metadata.inputGroups) {
			const payload: Record<string, unknown> = {};
			for (const [key, index] of Object.entries(group.map)) {
				payload[key] = paramValues[index];
			}
			const error = validateSchemaSync(group.schema, payload, strategy);
			if (error) {
				if (mode === 'fail-fast') {
					return [error];
				}
				errors.push(error);
			}
		}
		return errors;
	}

	static async validateOutput(
		target: Object,
		methodName: string,
		output: unknown,
		strategy: ValidationStrategy,
	) {
		const methodMetadataMap = this.methodValidatorMap.get(target);
		const metadata = methodMetadataMap?.get(methodName);
		if (!metadata?.outputSchema) {
			return [];
		}
		const error = await validateSchema(metadata.outputSchema, output, strategy);
		return error ? [error] : [];
	}

	static validateOutputSync(
		target: Object,
		methodName: string,
		output: unknown,
		strategy: ValidationStrategy,
	) {
		const methodMetadataMap = this.methodValidatorMap.get(target);
		const metadata = methodMetadataMap?.get(methodName);
		if (!metadata?.outputSchema) {
			return [];
		}
		const error = validateSchemaSync(metadata.outputSchema, output, strategy);
		return error ? [error] : [];
	}

	static getValidationMetadata(target: Object): ValidationMetadata[] {
		const methodMetadataMap = this.methodValidatorMap.get(target);
		if (!methodMetadataMap) {
			return [];
		}
		return Array.from(methodMetadataMap.entries()).map(([methodName, metadata]) => ({
			methodName,
			inputParams: [...metadata.paramsIndex],
			inputGroups: metadata.inputGroups.map((group) => ({ map: { ...group.map } })),
			hasOutputSchema: Boolean(metadata.outputSchema),
			options: metadata.options,
		}));
	}
}
