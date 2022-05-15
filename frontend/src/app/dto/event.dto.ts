import {AddressDto} from "./address.dto";
import {Category} from "../enums/category.enum";
import {LocationDto} from "./location.dto";

export class EventDto {
  id?: string;
  name?: string;
  description?: string;
  location?: LocationDto;
  address?: AddressDto;
  price?: number;
  public?: boolean;
  startDateTime?: string;
  endDateTime?: string;
  category?: Category;
}
