import type { ValidationMode, ValidationStrategy } from './types';

export type ValidationConfig = {
	enabled: boolean;
	envVar: string;
	defaultInputStrategy: ValidationStrategy;
	defaultOutputStrategy: ValidationStrategy;
	defaultMode: ValidationMode;
};

const config: ValidationConfig = {
	enabled: true,
	envVar: 'TS_ZOD_DECORATORS_ENABLED',
	defaultInputStrategy: 'parse',
	defaultOutputStrategy: 'parse',
	defaultMode: 'fail-fast',
};

const truthy = new Set(['1', 'true', 'yes', 'on']);
const falsy = new Set(['0', 'false', 'no', 'off']);

export const getValidationConfig = (): ValidationConfig => ({ ...config });

export const setValidationConfig = (partial: Partial<ValidationConfig>): ValidationConfig => {
	Object.assign(config, partial);
	return getValidationConfig();
};

export const resetValidationConfig = (): ValidationConfig => {
	config.enabled = true;
	config.envVar = 'TS_ZOD_DECORATORS_ENABLED';
	config.defaultInputStrategy = 'parse';
	config.defaultOutputStrategy = 'parse';
	config.defaultMode = 'fail-fast';
	return getValidationConfig();
};

export const isValidationEnabled = (): boolean => {
	const envValue = typeof process !== 'undefined' ? process.env[config.envVar] : undefined;
	if (envValue) {
		const normalized = envValue.toLowerCase();
		if (truthy.has(normalized)) {
			return true;
		}
		if (falsy.has(normalized)) {
			return false;
		}
	}
	return config.enabled;
};
