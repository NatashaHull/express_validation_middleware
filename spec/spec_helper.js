jasmine.pp = function(obj) {
  return JSON.stringify(obj, undefined, 2);
};

beforeEach(() => {
  jasmine.addMatchers({
    toBeEmpty() {
      return {
        compare(actual) {
          const pass = Array.isArray(actual) ? !actual.length : !Object.keys(actual || {}).length;
          return {pass};
        }
      };
    }
  });
});
