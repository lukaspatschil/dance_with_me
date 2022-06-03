import { Validator } from 'class-validator';
import { IsBefore } from '../../../../src/core/validators/IsBefore';

const validator = new Validator();

describe('decorator with inline validation', () => {
  describe('correct type in the class', () => {
    class MyClass {
      @IsBefore('laterDate', {
        message: '$property must be before $constraint1',
      })
      firstDate!: Date;
      laterDate!: Date;
    }

    it('if firstDate and laterDate is empty then it should fail', () => {
      const model = new MyClass();
      return validator.validate(model).then((errors) => {
        expect(errors).toHaveLength(1);
        if (errors[0] != undefined) {
          expect(errors[0].constraints).toEqual({
            IsBefore: 'firstDate must be before laterDate',
          });
        }
      });
    });

    it('if firstDate is not empty and laterDate is empty then it should fail', () => {
      const model = new MyClass();
      model.firstDate = new Date();
      return validator.validate(model).then((errors) => {
        expect(errors).toHaveLength(1);
        if (errors[0] != undefined) {
          expect(errors[0].constraints).toEqual({
            IsBefore: 'firstDate must be before laterDate',
          });
        }
      });
    });

    it('if firstDate is empty and laterDate is not empty then it should fail', () => {
      const model = new MyClass();
      model.laterDate = new Date();
      return validator.validate(model).then((errors) => {
        expect(errors).toHaveLength(1);
        if (errors[0] != undefined) {
          expect(errors[0].constraints).toEqual({
            IsBefore: 'firstDate must be before laterDate',
          });
        }
      });
    });

    it('should succeed', () => {
      const model = new MyClass();
      model.firstDate = new Date('2020-01-01');
      model.laterDate = new Date('2020-01-02');
      return validator.validate(model).then((errors) => {
        expect(errors).toHaveLength(0);
      });
    });

    it('should fail because the first date is not before the later date', () => {
      const model = new MyClass();
      model.firstDate = new Date('2020-01-01');
      model.laterDate = new Date('2019-01-01');
      return validator.validate(model).then((errors) => {
        expect(errors).toHaveLength(1);
        if (errors[0] != undefined) {
          expect(errors[0].constraints).toEqual({
            IsBefore: 'firstDate must be before laterDate',
          });
        }
      });
    });

    it('should fail because the both dates are the same', () => {
      const model = new MyClass();
      model.firstDate = new Date('2020-01-01');
      model.laterDate = new Date('2020-01-01');
      return validator.validate(model).then((errors) => {
        expect(errors).toHaveLength(1);
        if (errors[0] != undefined) {
          expect(errors[0].constraints).toEqual({
            IsBefore: 'firstDate must be before laterDate',
          });
        }
      });
    });
  });

  describe('wrong data types', () => {
    class MyClass {
      @IsBefore('laterDate', {
        message: '$property must be before $constraint1',
      })
      firstDate!: number;
      laterDate!: number;
    }

    it('should fail because both dates are numbers', () => {
      const model = new MyClass();
      model.firstDate = 1;
      model.laterDate = 2;
      return validator.validate(model).then((errors) => {
        expect(errors).toHaveLength(1);
        if (errors[0] != undefined) {
          expect(errors[0].constraints).toEqual({
            IsBefore: 'firstDate must be before laterDate',
          });
        }
      });
    });
  });
});
