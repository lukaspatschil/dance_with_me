import {ComponentFixture} from "@angular/core/testing";
import {MockBuilder, MockRender} from "ng-mocks";
import {TranslateModule} from "@ngx-translate/core";
import {EventMapper} from "../../app/mapper/event.mapper";
import {Category} from "../../app/enums/category";
import {EventEntity} from "../../app/entities/event.entity";
import {EventResponseDto} from "../../app/dto/eventResponse.dto";
import {AddressEntity} from "../../app/entities/address.entity";
import {LocationEntity} from "../../app/entities/location.entity";


describe('EventMapper', () => {
  let component: EventMapper;
  let fixture: ComponentFixture<EventMapper>;

  beforeEach(async () => {
    return MockBuilder(EventMapper)
      .mock(TranslateModule.forRoot());
  });

  beforeEach(() => {
    fixture = MockRender(EventMapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('mapDtoToEntity', () => {
    it('should return correct entity', () => {
      // Given
      const eventResponseDto: EventResponseDto = {
        id: '1',
        name: 'name',
        description: 'description',
        location: {
          latitude: 40.000,
          longitude: 31.000

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
      };

      // When
      const result = EventMapper.mapEventDtoToEntity(eventResponseDto);

      // Then
      expect(result).toEqual(createExpectedEventEntity());
    });
  });


  function createExpectedEventEntity(): EventEntity{
    const addressEntity = new AddressEntity ('country', 'city', '1020', 'street', '10', 'addition')

    const locationEntity = new LocationEntity(31.000,40.000)
    const eventEntity: EventEntity = {
      id: '1',
      name: 'name',
      description: 'description',
      location: locationEntity,
      address: addressEntity,
      price: 1,
      public: true,
      date: '2022-04-24',
      startTime: '10:00',
      endTime: '12:00',
      category: Category.Salsa
    }
    return eventEntity
  }
});
