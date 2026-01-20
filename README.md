### Summary

This repository enhances the functionality of the Zod library by providing validation decorators. Zod is a TypeScript-first schema declaration and validation library. The added decorators make it easier to validate data against predefined schemas in TypeScript projects.

### Installation

```
npm install ts-zod-decorators
```
```
pnpm add ts-zod-decorators
```

### Input validation

```ts
import { ZodInput, Validate } from 'ts-zod-decorators';
import * as z from 'zod';

const schema = z.object({ name: z.string(), age: z.number() });

class Foo {
	@Validate
	public bar(@ZodInput(schema) input: z.infer<typeof schema>) {}
}
```

### Output validation

```ts
import { ZodInput, Validate, ZodOutput } from 'ts-zod-decorators';
import * as z from 'zod';

const schema = z.object({ name: z.string(), age: z.number() });

class Foo {
	@Validate
	@ZodOutput(schema)
	public bar(input: unknown): Promise<z.infer<schema>> {
		return Promise.resolve({ name: 'foo', age: 1 });
	}
}
```

### Validation options

```ts
import { Validate } from 'ts-zod-decorators';

class Foo {
	@Validate({
		input: 'safeParse',
		output: 'parseAsync',
		mode: 'collect-all',
		onError: (err) => new Error(`validation failed: ${String(err)}`),
	})
	public async bar() {
		return { ok: true };
	}
}
```

### Grouped input validation

```ts
import { Validate, ZodInputs } from 'ts-zod-decorators';
import * as z from 'zod';

const schema = z.object({ name: z.string(), age: z.number() });

class Foo {
	@Validate
	@ZodInputs(schema, { name: 0, age: 1 })
	public async bar(name: string, age: number) {}
}
```

### Runtime configuration

```ts
import { setValidationConfig } from 'ts-zod-decorators';

setValidationConfig({ enabled: false });
```

### Metadata & adapters

```ts
import { createExpressValidator, formatZodError, getValidationMetadata } from 'ts-zod-decorators';
import * as z from 'zod';

const middleware = createExpressValidator(z.object({ name: z.string() }), 'body');
const metadata = getValidationMetadata(Foo.prototype);
const prettyError = formatZodError(new z.ZodError([]));
```

### Notes

- Input/output decorators accept any Zod schema type, not just objects.
- Output validation runs for both sync and async methods.
- `@Validate` can be used as `@Validate` or `@Validate({ ...options })`.
- Set `TS_ZOD_DECORATORS_ENABLED=0` to disable validation globally.
