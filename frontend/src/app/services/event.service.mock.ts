import {Event} from "../models/event"
import {Category} from "../enums/category";
import {Observable, of} from "rxjs";


export class EventServiceMock  {

  response: Event ={
    name: 'name',
    description: 'description',
    location: {
      country: 'country',
      street: 'street',
      city: 'city',
      housenumber: 10,
      postalcode: 1020,
      addition: 'addition'
    },
    price: 1,
    public: true,
    date: '2022-04-24',
    starttime: '10:00',
    endtime: '12:00',
    category: Category.Salsa
  }

  createEvent = jest.fn().mockReturnValue(
    of(this.response)
  )
}
