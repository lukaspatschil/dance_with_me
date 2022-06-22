import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailComponent } from '../../../../app/components/events/event-detail/event-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '../../../../app/services/event.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EventServiceMock } from '../../../mock/event.service.mock';
import { ImageService } from '../../../../app/services/image.service';
import { ImageServiceMock } from '../../../mock/image.service.mock';
import { Category } from '../../../../app/enums/category.enum';
import { EventEntity } from '../../../../app/entities/event.entity';

import { Clipboard } from '@angular/cdk/clipboard';
import { ClipboardMock } from '../../../mock/clipboard.mock';

describe('EventDetailComponent', () => {
  let comp: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;

  let eventService: EventService;
  let copyService: Clipboard;

  let imageService: ImageService;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventDetailComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: EventService, useClass: EventServiceMock },
        { provide: Clipboard, useClass: ClipboardMock },
        { provide: ImageService, useClass: ImageServiceMock }]
    })
      .compileComponents();

    eventService = TestBed.inject(EventService);
    copyService = TestBed.inject(Clipboard);
    imageService = TestBed.inject(ImageService);

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });


  describe('ngOnInit', () => {
    it('should fetch event from API ', async () => {
      // When
      await fixture.whenStable();
      comp.ngOnInit();

      // Then
      expect(eventService.getEvent).toHaveBeenCalled();
    });
  });

  describe('onAttendClicked', () => {
    it('should delete a participation', async () => {
      // When
      await fixture.whenStable();
      comp.userParticipates = true;
      comp.onAttendClicked(eventEntity);

      // Then
      expect(eventService.deleteParticipateOnEvent).toHaveBeenCalledWith(eventEntity.id);
    });
  });

  describe('getImage', () => {
    it('should get the Image for a event', async () => {
      // Given
      await fixture.whenStable();
      comp.event = eventEntity;

      // When
      comp.getImage();

      // Then
      expect(imageService.getImage).toHaveBeenCalled();
    });

    it('should post an participation', async () => {
      // When
      await fixture.whenStable();
      comp.userParticipates = false;
      comp.onAttendClicked(eventEntityNoParticipation);

      // Then
      expect(eventService.participateOnEvent).toHaveBeenCalledWith(eventEntity.id);
    });
  });

  describe('copyMessage', () => {
    global.URL.createObjectURL = jest.fn();

    it('should copy current url to clipboard', async () => {
      // When
      await fixture.whenStable();
      comp.showAlert = false;
      global.URL.createObjectURL = jest.fn(() => 'details');
      await comp.copyMessage();

      // Then
      expect(copyService.copy).toHaveBeenCalled();
    });
  });
});

const eventEntity: EventEntity = {
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
  userParticipates: true,
  imageId: '123.jpg',
  organizerName: 'organizerName'
};

const eventEntityNoParticipation: EventEntity = {
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
  userParticipates: false,
  organizerName: 'organizerName'
};
