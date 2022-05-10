import {AddressDto} from "./address.dto";
import {Category} from "../enums/category";
import {LocationDto} from "./location.dto";

export class EventResponseDto {
  id!: string;
  name!: string;
  description!: string;
  location!: LocationDto;
  address!: AddressDto;
  price!: number;
  public!: boolean;
  date!: string;
  starttime!: string;
  endtime!: string;
  category!: Category;
}
