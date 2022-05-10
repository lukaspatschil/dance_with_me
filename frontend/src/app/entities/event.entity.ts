import {LocationEntity} from "./location.entity";
import {Category} from "../enums/category";
import {AddressEntity} from "./address.entity";

export class EventEntity {
  id: string;
  name: string;
  description: string;
  location: LocationEntity;
  address: AddressEntity;
  price: number;
  public: boolean;
  date: string;
  startTime: string;
  endTime: string;
  category: Category;

  constructor(id: string, name: string, description: string, location: LocationEntity, address: AddressEntity, price: number, isPublic: boolean, date: string, starttime: string, endtime: string, category: Category ){
    this.id = id;
    this.name = name;
    this.description = description;
    this.location = location;
    this.address = address;
    this.price = price;
    this.public = isPublic;
    this.date = date;
    this.startTime = starttime;
    this.endTime = endtime;
    this.category = category;
  }
}
