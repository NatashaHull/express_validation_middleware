require('../spec_helper');

describe('ValidationMiddleware', () => {
  let subject, resSpy, nextSpy;

  beforeEach(() => {
    resSpy = jasmine.createSpyObj('res', ['send', 'status']);
    resSpy.status.and.returnValue(resSpy);
    nextSpy = jasmine.createSpy('next');
    subject = require('../../lib/validate_middleware');
  });

  describe('for presence', () => {
    it('calls next when valid', () => {
      const reqSpy = {params: {startTime: 1}};
      subject({startTime: {presence: true}})(reqSpy, resSpy, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('writes a 422 when invalid', () => {
      const errorSpy = jasmine.createSpy('error');
      const reqSpy = {params: {}, logger: {error: errorSpy}};
      const expectedErrors = {errors: {startTime: ['must be present']}};

      subject({startTime: {presence: true}})(reqSpy, resSpy, nextSpy);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expectedErrors);
      expect(resSpy.status).toHaveBeenCalledWith(422);
      expect(resSpy.send).toHaveBeenCalledWith(JSON.stringify(expectedErrors));
    });
  });

  describe('for custom', () => {
    it('calls next when valid', () => {
      const reqSpy = {params: {startTime: 1}};
      subject({startTime: {custom: startTime => startTime !== 1 && 'start time not 1'}})(reqSpy, resSpy, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('writes a 422 when invalid', () => {
      const errorSpy = jasmine.createSpy('error');
      const reqSpy = {params: {startTime: 2}, logger: {error: errorSpy}};
      const expectedErrors = {errors: {startTime: ['start time not 1']}};

      subject({startTime: {custom: startTime => startTime !== 1 && 'start time not 1'}})(reqSpy, resSpy, nextSpy);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expectedErrors);
      expect(resSpy.status).toHaveBeenCalledWith(422);
      expect(resSpy.send).toHaveBeenCalledWith(JSON.stringify(expectedErrors));
    });
  });

  describe('for in', () => {
    it('calls next when valid', () => {
      [1,3].forEach(value => {
        nextSpy.calls.reset();
        const reqSpy = {params: {startTime: value}};
        subject({startTime: {in: [1,3]}})(reqSpy, resSpy, nextSpy);
        expect(nextSpy).toHaveBeenCalled();
      });
    });

    it('writes a 422 when invalid', () => {
      const errorSpy = jasmine.createSpy('error');
      const reqSpy = {params: {}, logger: {error: errorSpy}};
      const expectedErrors = {errors: {startTime: ['undefined must be one of (1,3)']}};

      subject({startTime: {in: [1,3]}})(reqSpy, resSpy, nextSpy);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expectedErrors);
      expect(resSpy.status).toHaveBeenCalledWith(422);
      expect(resSpy.send).toHaveBeenCalledWith(JSON.stringify(expectedErrors));
    });
  });

  describe('for between', () => {
    it('calls next when valid', () => {
      const reqSpy = {params: {startTime: 1}};
      subject({startTime: {between: [0, 2]}})(reqSpy, resSpy, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('writes a 422 when the value is less than the first option', () => {
      const errorSpy = jasmine.createSpy('error');
      const reqSpy = {params: {startTime: -1}, logger: {error: errorSpy}};
      const expectedErrors = {errors: {startTime: ['-1 must be between 0 and 2']}};

      subject({startTime: {between: [0, 2]}})(reqSpy, resSpy, nextSpy);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expectedErrors);
      expect(resSpy.status).toHaveBeenCalledWith(422);
      expect(resSpy.send).toHaveBeenCalledWith(JSON.stringify(expectedErrors));
    });

    it('writes a 422 when the value is greater than the first option', () => {
      const errorSpy = jasmine.createSpy('error');
      const reqSpy = {params: {startTime: 3}, logger: {error: errorSpy}};
      const expectedErrors = {errors: {startTime: ['3 must be between 0 and 2']}};

      subject({startTime: {between: [0, 2]}})(reqSpy, resSpy, nextSpy);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expectedErrors);
      expect(resSpy.status).toHaveBeenCalledWith(422);
      expect(resSpy.send).toHaveBeenCalledWith(JSON.stringify(expectedErrors));
    });

    it('writes a 422 when the value is undefined', () => {
      const errorSpy = jasmine.createSpy('error');
      const reqSpy = {params: {}, logger: {error: errorSpy}};
      const expectedErrors = {errors: {startTime: ['undefined must be between 0 and 2']}};

      subject({startTime: {between: [0, 2]}})(reqSpy, resSpy, nextSpy);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expectedErrors);
      expect(resSpy.status).toHaveBeenCalledWith(422);
      expect(resSpy.send).toHaveBeenCalledWith(JSON.stringify(expectedErrors));
    });
  });

  describe('when passing in a target', () => {
    it('uses the target to validate the request instead of the default params', () => {
      const reqSpy = {query: {startTime: 1}};
      subject({startTime: {presence: true, target: 'query'}})(reqSpy, resSpy, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('when passing allow blank', () => {
    it('skips the validation when the target is undefined', () => {
      const reqSpy = {};
      subject({startTime: {presence: true, allowBlank: true}})(reqSpy, resSpy, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('skips the validation when the target has no keys', () => {
      const reqSpy = {params: {}};
      subject({startTime: {presence: true, allowBlank: true}})(reqSpy, resSpy, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('skips the validation when the value is null', () => {
      const reqSpy = {params: {startTime: null}};
      subject({startTime: {presence: true, allowBlank: true}})(reqSpy, resSpy, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });

    it('does not skip the validations when the value is something', () => {
      const errorSpy = jasmine.createSpy('error');
      const reqSpy = {params: {startTime: 2}, logger: {error: errorSpy}};
      const expectedErrors = {errors: {startTime: ['start time not 1']}};

      subject({startTime: {allowBlank: true, custom: startTime => startTime !== 1 && 'start time not 1'}})(reqSpy, resSpy, nextSpy);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expectedErrors);
      expect(resSpy.status).toHaveBeenCalledWith(422);
      expect(resSpy.send).toHaveBeenCalledWith(JSON.stringify(expectedErrors));
    });
  });

  describe('when multiple validations fail', () => {
    it('sends all of the error message', () => {
      const errorSpy = jasmine.createSpy('error');
      const reqSpy = {params: {}, logger: {error: errorSpy}};
      const expectedErrors = {errors: {
        startTime: ['must be present'],
        endTime: ['must be present', 'undefined must be between 0 and 2']
      }};

      subject({startTime: {presence: true}, endTime: {presence: true, between: [0,2]}})(reqSpy, resSpy, nextSpy);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expectedErrors);
      expect(resSpy.status).toHaveBeenCalledWith(422);
      expect(resSpy.send).toHaveBeenCalledWith(JSON.stringify(expectedErrors));
    });
  });
});