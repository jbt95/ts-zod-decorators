import ZodValidator from './validator.class';
import type { ValidationMetadata } from './types';

export const getValidationMetadata = (target: object): ValidationMetadata[] => ZodValidator.getValidationMetadata(target);
