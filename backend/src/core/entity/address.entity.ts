export class AddressEntity {
  constructor(
    public country: string,
    public city: string,
    public postalcode: string,
    public street: string,
  ) {}

  housenumber?: string;
  addition?: string;
}
