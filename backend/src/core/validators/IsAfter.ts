import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/* @typescript-eslint/naming-convention: 0 */

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            value instanceof Date &&
            relatedValue instanceof Date &&
            value > relatedValue
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
