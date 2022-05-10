import { Category } from "../enums/category";
import { AddressDto } from "./address.dto";
import {LocationDto} from "./location.dto";

export class EventDto {
  name?: string;
  description?: string;
  location?: LocationDto;
  address?: AddressDto;
  price?: number;
  public?: boolean;
  date?: string;
  starttime?: string;
  endtime?: string;
  category?: Category;
}
