import {EventDto} from "../../app/dto/event.dto"
import {Category} from "../../app/enums/category";
import {Observable, of} from "rxjs";


export class EventServiceMock  {

  response: EventDto ={
    name: 'name',
    description: 'description',
    address: {
      country: 'country',
      street: 'street',
      city: 'city',
      housenumber: '10',
      postalcode: '1020',
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

  getEvents = jest.fn().mockReturnValue(
    of([{
      id: '1',
      name: 'name',
      description: 'description',
      location: {
        longitude: 40.000,
        latitude: 31.000,
      },
      address: {
        country: 'country',
        street: 'street',
        city: 'city',
        housenumber: '10',
        postalcode: '1020',
        addition: 'addition'
      },
      price: 1,
      public: true,
      date: '2022-04-24',
      starttime: '10:00',
      endtime: '12:00',
      category: Category.Salsa
    }])
  )

  getEvent = jest.fn().mockReturnValue(
    of({
      id: '1',
      name: 'name',
      description: 'description',
      location: {
        longitude: 40.000,
        latitude: 31.000,
      },
      address: {
        country: 'country',
        street: 'street',
        city: 'city',
        housenumber: '10',
        postalcode: '1020',
        addition: 'addition'
      },
      price: 1,
      public: true,
      date: '2022-04-24',
      starttime: '10:00',
      endtime: '12:00',
      category: Category.Salsa
    })
  )
}
