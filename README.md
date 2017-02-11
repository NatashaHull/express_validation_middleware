#Validation Middleware for node express ![Travis CI](https://travis-ci.org/NatashaHull/express_validation_middleware.svg?branch=master)

## Usage

To use, call the validation middleware
```js
var validationMiddleware = require('express_validation_middleware');
var endTime = Date.now();

validationMiddleware({
  resourceId: {
    target: 'body',
    presence: true,
    in: [1,2,3,4,5],
    between: [0,5],
    custom(resourceId) {
      if (resourceId > 5 || resourceId < 1) return `${resourceId} should be from 1 to 5`;
    }
  },
  startTime: {
    target: 'query',
    custom(startTime) {
      if (startTime >= endTime) return 'startTime must be in the past';
    }
  }
})(req, res, next);
```

If the validation passes, it will call next and continue the request. If the validation fails, it will return a 422 and end the request with a helpful error message.

## Keys

Each top level key is the key on the target object that needs to be validated in some way. In the example case above, the first key can be found on req.body.requestId.

## Target

The target defaults to req.params, but can point to any object on the request with data.

## Validation types
The currently defined validation types are `presence`, `in`, `between`, and `custom`. Any other key in the validation params will be ignored.

### Custom validations
To create a custom validation add a custom key to the validation object that returns a string on failure (and anything other that is not a string on success).