import {AddressDto} from "./address.dto";
import {Category} from "../enums/category.enum";

export class CreateEventDto {
  name: string;
  description: string;
  address: AddressDto;
  price: number;
  public: boolean;
  startDateTime: string;
  endDateTime: string;
  category: Category[];

  constructor(name: string, description: string, address: AddressDto, price: number, isPublic: boolean, startDateTime: string, endDateTime: string, category: Category[]) {
    this.name = name;
    this.description = description;
    this.address = address;
    this.price = price;
    this.public = isPublic;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.category = category;
  }
}
