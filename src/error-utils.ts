import * as z from 'zod';
import { ValidationError } from './types';

export type FormattedIssue = {
	path: (string | number)[];
	message: string;
	code: string;
};

export const formatZodError = (error: z.ZodError) => ({
	message: error.message,
	issues: error.issues.map((issue) => ({
		path: issue.path,
		message: issue.message,
		code: issue.code,
	})),
});

export const formatValidationError = (error: ValidationError) => ({
	message: error.message,
	kind: error.kind,
	errors: error.errors.map(formatZodError),
});
