export class AddressEntity {
  country: string;
  city: string;
  postalcode: string;
  street: string;
  housenumber: string;
  addition?: string;

  constructor(country: string, city: string, postalcode:string, street: string, housenumber: string, additon: string) {
    this.city = city;
    this.country = country;
    this.postalcode = postalcode;
    this.street = street;
    this.housenumber = housenumber;
    this.addition = additon;
  }
}
