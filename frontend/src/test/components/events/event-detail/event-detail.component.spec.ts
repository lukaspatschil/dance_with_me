import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailComponent } from '../../../../app/components/events/event-detail/event-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '../../../../app/services/event.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EventServiceMock } from '../../../mock/event.service.mock';
import { Category } from '../../../../app/enums/category.enum';
import { UserService } from '../../../../app/services/user.service';
import { UserServiceMock } from '../../../mock/user.service.mock';
import { EventEntity } from '../../../../app/entities/event.entity';
import { Clipboard } from '@angular/cdk/clipboard';
import { ClipboardMock } from '../../../mock/clipboard.mock';
import { RoleEnum } from '../../../../app/enums/role.enum';
import { Router } from '@angular/router';

describe('EventDetailComponent', () => {
  let comp: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;

  let eventService: EventService;
  let userService: UserService;
  let copyService: Clipboard;
  let router: Router;

  let userServiceMock: UserServiceMock;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventDetailComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: EventService, useClass: EventServiceMock },
        { provide: Clipboard, useClass: ClipboardMock },
        { provide: UserService, useClass: UserServiceMock }]
    })
      .compileComponents();

    eventService = TestBed.inject(EventService);
    copyService = TestBed.inject(Clipboard);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);

    userServiceMock = userService as unknown as UserServiceMock;
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

    it('should set showDeleteOption to true when user has created the event', async () => {
      // When
      await fixture.whenStable();
      comp.ngOnInit();

      // Then
      expect(comp.showDeleteOption).toBeTruthy();
    });

    it('should set showDeleteOption to false when user has not created the event', async () => {
      // When
      userServiceMock.user = user;
      await fixture.whenStable();
      comp.ngOnInit();

      // Then
      expect(comp.showDeleteOption).toBeFalsy();
    });
  });

  describe('onAttendClicked', () => {
    it('should post an participation', async () => {
      // When
      await fixture.whenStable();
      comp.userParticipates = false;
      comp.onAttendClicked(eventEntityNoParticipation);

      // Then
      expect(eventService.participateOnEvent).toHaveBeenCalledWith(eventEntity.id);
    });

    it('should delete a participation', async () => {
      // When
      await fixture.whenStable();
      comp.userParticipates = true;
      comp.onAttendClicked(eventEntity);

      // Then
      expect(eventService.deleteParticipateOnEvent).toHaveBeenCalledWith(eventEntity.id);
    });
  });

  describe('safeUrl', () => {
    it('should return a safe url', async () => {
      // When
      await fixture.whenStable();
      const url = comp.imageUrl(eventEntity);

      // Then
      expect(url).toBeDefined();
    });
  });

  describe('deleteAndRefresh', () => {
    it('should call service in deleteAndRefresh', async () => {
      // When
      await fixture.whenStable();
      comp.deleteAndRefresh(eventEntity);

      // Then
      expect(eventService.deleteEvent).toHaveBeenCalled();
    });

    it('should call service on success display no error', async () => {
      //Given
      jest.spyOn(router, 'navigateByUrl');

      // When
      await fixture.whenStable();
      comp.deleteAndRefresh(eventEntity);

      // Then
      expect(comp.showError).toBeFalsy();
    });

    it('should call service on success display no error', async () => {
      jest.spyOn(router, 'navigateByUrl');

      // When
      await fixture.whenStable();
      comp.deleteAndRefresh(eventEntity);

      // Then
      expect(comp.showError).toBeFalsy();
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
const user = {
  id: 'google:123456',
  displayName: 'Max1',
  firstName: 'Max',
  lastName: 'Hermannus',
  email: undefined,
  emailVerified: true,
  role: RoleEnum.USER
};

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
  organizerName: 'organizerName',
  organizerId: '1'
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
  organizerName: 'organizerName',
  organizerId: '1'
};
