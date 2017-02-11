require('babel-polyfill');

function isString(obj) {
  return typeof obj === 'string';
}

function pushError(errors, name, ...args) {
  errors[name] = errors[name] || [];
  errors[name].push(...args);
}

const validations = {
  presence({name, errors, value}) {
    if ([undefined, null].includes(value)) {
      pushError(errors, name, 'must be present');
    }
  },
  between({name, errors, value, options: [before, after]}) {
    if([undefined, null].includes(value) || before > value || after < value) {
      pushError(errors, name, `${value} must be between ${before} and ${after}`);
    }
  },
  in({name, errors, value, options}) {
    if(!options.includes(value)) {
      pushError(errors, name, `${value} must be one of (${options.join(',')})`);
    }
  },
  custom({name, errors, value, options}) {
    const error = options(value);
    if (isString(error)) pushError(errors, name, error);
  }
};

function handleValidation({name, errors, value}) {
  return ([validation, options]) => {
    validations[validation] && validations[validation]({name, errors, value, options});
  };
}

module.exports = function(validations) {
  return function (req, res, next) {
    let errors = {};
    Object.entries(validations).forEach(([name, {target = 'params', allowBlank, ...validations}]) => {
      if (allowBlank && (!req[target] || [undefined, null].includes(req[target][name]))) return;
      const value = req[target][name];
      Object.entries(validations).forEach(handleValidation({name, errors, value}));
    });

    if(Object.values(errors).length > 0) {
      req.logger.error({errors});
      res.status(422).send(JSON.stringify({errors}));
      return;
    }
    next();
  };
};