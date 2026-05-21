# @peassoft/error-stringify

An utility function to stringify an Error or DOMException object.

## Installation

```shell
$ npm i @peassoft/error-stringify
```

## Usage Example

```ts
import { stringifyError } from '@peassoft/error-stringify';

const myError = new Error('message');

const result: string = stringifyError(myError);
```

## API Reference

### `stringifyError(err: Error | DOMException) => string`

Stringify an Error or DOMException object.
