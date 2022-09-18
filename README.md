### Installation

```
npm install ts-zod-decorators
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
