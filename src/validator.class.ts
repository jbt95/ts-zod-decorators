/* eslint-disable @typescript-eslint/ban-types */
import * as z from 'zod';

type Target = Object;
type MethodName = string;
type Metadata = {
	paramsIndex: number[];
	inputSchema?: z.AnyZodObject;
	outputSchema?: z.AnyZodObject;
};

export default class ZodValidator {
	private static methodValidatorMap: Map<Target, Map<MethodName, Metadata>> = new Map();

	static registerInputParameterValidationSchema(
		target: Object,
		methodName: MethodName,
		paramIndex: number,
		schema: z.AnyZodObject,
	) {
		let paramMap = this.methodValidatorMap.get(target)!;
		if (!paramMap) {
			paramMap = new Map();
			this.methodValidatorMap.set(target, paramMap);
		}
		let metadata = paramMap.get(methodName)!;
		if (!metadata) {
			metadata = { paramsIndex: [], inputSchema: schema };
			paramMap.set(methodName, metadata);
		}
		metadata.paramsIndex.push(paramIndex);
	}

	static registerMethodValidationOutputSchema(target: Object, methodName: MethodName, schema: z.AnyZodObject) {
		let paramMap = this.methodValidatorMap.get(target)!;
		if (!paramMap) {
			paramMap = new Map();
			this.methodValidatorMap.set(target, paramMap);
		}
		let metadata = paramMap.get(methodName)!;
		if (!metadata) {
			metadata = { paramsIndex: [], outputSchema: schema };
			paramMap.set(methodName, metadata);
		}
		metadata.outputSchema = schema;
	}

	static validateInput(target: Object, methodName: string, paramValues: unknown[]) {
		const methodMetadataMap = this.methodValidatorMap.get(target)!;
		const metadata = methodMetadataMap.get(methodName)!;
		for (const [index, input] of paramValues.entries()) {
			if (metadata.paramsIndex.indexOf(index) != -1) {
				metadata.inputSchema?.parse(input);
			}
		}
	}

	static validateOutput(target: Object, methodName: string, output: unknown) {
		const methodMetadataMap = this.methodValidatorMap.get(target)!;
		const metadata = methodMetadataMap.get(methodName)!;
		metadata.outputSchema?.parse(output);
	}
}
