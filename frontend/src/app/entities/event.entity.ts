import {LocationEntity} from "./location.entity";
import {Category} from "../enums/category.enum";
import {AddressEntity} from "./address.entity";

export class EventEntity {
  id: string;
  name: string;
  description: string;
  location: LocationEntity;
  address: AddressEntity;
  price: number;
  public: boolean;
  startDateTime: Date;
  endDateTime: Date;
  category: Category[];

  constructor(id: string, name: string, description: string, location: LocationEntity, address: AddressEntity, price: number, isPublic: boolean, startDateTime: Date, endDateTime: Date, category: Category[] ){
    this.id = id;
    this.name = name;
    this.description = description;
    this.location = location;
    this.address = address;
    this.price = price;
    this.public = isPublic;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.category = category;
  }
}
