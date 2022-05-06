import { Category } from "../enums/category";
import { Address } from "./address";

export class Event {
  name?: string;
  description?: string;
  location?: Address;
  price?: number;
  public?: boolean;
  date?: string;
  starttime?: string;
  endtime?: string;
  category?: Category;
}
