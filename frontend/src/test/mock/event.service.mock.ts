import { EventDto } from '../../app/dto/event.dto';
import { Category } from '../../app/enums/category.enum';
import { of } from 'rxjs';


export class EventServiceMock  {

  response: EventDto = {
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
    startDateTime: new Date('2022-04-24T10:00').toISOString(),
    endDateTime: new Date('2022-04-24T12:00').toISOString(),
    category: [Category.SALSA]
  };

  events$ =
    of([{
      id: '1',
      name: 'name',
      description: 'description',
      location: {
        longitude: 40.000,
        latitude: 31.000
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
      category: [Category.SALSA]
    }]);

  createEvent = jest.fn().mockReturnValue(
    of(this.response)
  );

  getEvents = jest.fn().mockReturnValue(
    of([{
      id: '1',
      name: 'name',
      description: 'description',
      location: {
        longitude: 40.000,
        latitude: 31.000
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
      category: [Category.SALSA],
      userParticipate: true
    }])
  );

  getEvent = jest.fn().mockReturnValue(
    of({
      id: '1',
      name: 'name',
      description: 'description',
      location: {
        longitude: 40.000,
        latitude: 31.000
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
      startDateTime: new Date('2022-04-24T10:00'),
      endDateTime: new Date('2022-04-24T10:00'),
      category: [Category.SALSA],
      userParticipates: true
    })
  );

  getRecommendation = jest.fn().mockReturnValue(
    of({
      id: '1',
      name: 'name',
      description: 'description',
      location: {
        longitude: 40.000,
        latitude: 31.000
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
      startDateTime: new Date('2022-04-24T10:00'),
      endDateTime: new Date('2022-04-24T12:00'),
      category: [Category.SALSA]
    })
  );

  participateOnEvent = jest.fn().mockReturnValue(
    of({ status: 204 }));

  deleteParticipateOnEvent = jest.fn().mockReturnValue(
    of({ status: 204 }));
}
