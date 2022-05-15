export class AddressDto {
  country?: string;
  city?: string;
  postalcode?: string;
  street?: string;
  housenumber?: string;
  addition?: string;

  constructor(country: string, city: string, postalcode: string, street: string, housenumber: string, addition?: string) {
    this.country = country;
    this.city = city;
    this.postalcode = postalcode;
    this.street = street;
    this.housenumber = housenumber;
    this.addition = addition;
  }
}
