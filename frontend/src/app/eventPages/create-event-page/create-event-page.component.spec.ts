import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {CreateEventPageComponent} from '../create-event-page/create-event-page.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {EventService} from "../../../app/services/event.service";
import * as EventModel from "../../../app/models/event";
import {EventServiceMock} from "../../services/event.service.mock";
import {TranslateModule} from "@ngx-translate/core";
import {Category} from "../../enums/category";
import {formatDate} from "@angular/common";

describe('CreateEventPageComponent',
  () => {
    let comp: CreateEventPageComponent;
    let fixture: ComponentFixture<CreateEventPageComponent>;

    let nameElement: HTMLInputElement;
    let dateElement: HTMLInputElement;
    let timeElement: HTMLInputElement;
    let endElement: HTMLInputElement;
    let streetElement: HTMLInputElement;
    let houseNrElement: HTMLInputElement;
    let zipElement: HTMLInputElement;
    let cityElement: HTMLInputElement;
    let countryElement: HTMLInputElement;
    let additionElement: HTMLInputElement;
    let categoryElementSalsa: HTMLInputElement;
    let description: HTMLInputElement;
    let priceElement: HTMLInputElement;
    let publicElement: HTMLInputElement;
    let createButton: HTMLInputElement;

    let httpMock: HttpTestingController;
    let eventService: EventService;

    let date: string;


    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot()],
        declarations: [CreateEventPageComponent],
        providers: [{provide: EventService, useClass: EventServiceMock}]
      });

      httpMock = TestBed.inject(HttpTestingController);
      eventService = TestBed.inject(EventService);
    });

    beforeEach(() => {
      // Given
      fixture = TestBed.createComponent(CreateEventPageComponent)
      comp = fixture.componentInstance;
      comp.ngOnInit();

      fixture.whenStable().then(() => {

        nameElement = fixture.debugElement.nativeElement.querySelector('#event-name')
        dateElement = fixture.debugElement.nativeElement.querySelector('#date')
        timeElement = fixture.debugElement.nativeElement.querySelector('#startTime')
        endElement = fixture.debugElement.nativeElement.querySelector('#endTime')
        streetElement = fixture.debugElement.nativeElement.querySelector('#street')
        houseNrElement = fixture.debugElement.nativeElement.querySelector('#housenumber')
        zipElement = fixture.debugElement.nativeElement.querySelector('#zip')
        cityElement = fixture.debugElement.nativeElement.querySelector('#city')
        countryElement = fixture.debugElement.nativeElement.querySelector('#country')
        additionElement = fixture.debugElement.nativeElement.querySelector('#addition')
        categoryElementSalsa = fixture.debugElement.nativeElement.querySelector('#category')
        description = fixture.debugElement.nativeElement.querySelector('#description')
        priceElement = fixture.debugElement.nativeElement.querySelector('#price')
        publicElement = fixture.debugElement.nativeElement.querySelector('#public')

        createButton = fixture.debugElement.nativeElement.querySelector('#create_button')

        date = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
      });

      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });


    it('should create-event-page', () => {
      expect(comp).toBeTruthy();
    });

    it('should return the amount of input fields', () => {
      // WHen
      const formElement = fixture.debugElement.nativeElement.querySelector('#createForm');
      const inputElements = formElement.querySelectorAll('input');

      // Then
      expect(inputElements.length).toEqual(12)
    });

    describe('CreateEventForm', () => {
      it('should be invalid when empty', () => {
        expect(comp.createEventForm.valid).toBeFalsy();
      });

      it('should return empty for all form values', () => {
        // When
        const createForm = comp.createEventForm;
        const createFormValues = {
          name: '',
          address: {
            country: '',
            street: '',
            city: '',
            housenumber: '',
            postalcode: '',
            addition: null
          },
          price: '',
          date: '',
          startTime: '',
          endTime: '',
          description: '',
          public: true,
          category: ''
        }
        fixture.whenStable().then(() => {
          // Then
          expect(createForm.value).toEqual(createFormValues)
        })
      });

      it('should be valid when inputs are filled correctly', () => {
        fixture.whenStable().then(() => {
          // When
          createValidInput();
          const isFormValid = comp.createEventForm.valid

          // Then
          expect(isFormValid).toBeTruthy()
        })
      });

      it('should be invalid when one input is filled falsely', () => {
        fixture.whenStable().then(() => {
          // When
          createInvalidInput()
          const isFormValid = comp.createEventForm.valid

          // Then
          expect(isFormValid).toBeFalsy()
        })
      });
    })

    describe('SubmitButton', () => {
      it('should be disabled when form invalid', () => {
        fixture.whenStable().then(() => {
          // When
          createInvalidInput()

          // Then
          expect(createButton.disabled).toBeTruthy()
        })
      });
    })

    describe('createEvent', () => {
      it('should create-event-page a new event', () => {
        // When
        const newEvent: EventModel.Event = {
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
          date: date,
          starttime: '10:00',
          endtime: '12:00',
          category: Category.Salsa
        };

        createValidInput();

        fixture.whenStable().then(() => {
          // Then
          expect(comp.createEvent()).toEqual(newEvent)
        })
      });
    });


    describe('onSubmit', () => {
      it('should send a new event to API ', () => {
        // When
        const newEvent: EventModel.Event =  {
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
          date: date,
          starttime: '10:00',
          endtime: '12:00',
          category: Category.Salsa
        };

        fixture.whenStable().then(() => {
          createValidInput();
          comp.onSubmit();

          // Then
          expect(eventService.createEvent).toHaveBeenCalledWith(newEvent)
        })
      });

      it('should not send a new event to API when input invalid', () => {
        fixture.whenStable().then(() => {
          // When
          createInvalidInput();
          comp.onSubmit();

          // Then
          expect(eventService.createEvent).not.toHaveBeenCalled();
        })
      });
    });

    function createValidInput() {
      nameElement.value = "name"
      dateElement.value = date
      timeElement.value = "10:00"
      endElement.value = "12:00"
      streetElement.value = "street"
      houseNrElement.value = String(10)
      zipElement.value = String(1020)
      cityElement.value = "city"
      countryElement.value = "country"
      additionElement.value = "addition"
      categoryElementSalsa.value = Category.Salsa
      priceElement.value = String(1)
      description.value = "description"
      publicElement.value = String(true)

      nameElement.dispatchEvent(new Event('input'))
      dateElement.dispatchEvent(new Event('input'))
      timeElement.dispatchEvent(new Event('input'))
      endElement.dispatchEvent(new Event('input'))
      streetElement.dispatchEvent(new Event('input'))
      houseNrElement.dispatchEvent(new Event('input'))
      zipElement.dispatchEvent(new Event('input'))
      cityElement.dispatchEvent(new Event('input'))
      countryElement.dispatchEvent(new Event('input'))
      additionElement.dispatchEvent(new Event('input'))
      categoryElementSalsa.dispatchEvent(new Event('change'))
      priceElement.dispatchEvent(new Event('input'))
      description.dispatchEvent(new Event('input'))
      publicElement.dispatchEvent(new Event('input'))
    }

    function createInvalidInput() {
      nameElement.value = ""
      dateElement.value = "2022-04-24"
      timeElement.value = "10:00"
      endElement.value = "12:00"
      streetElement.value = "street"
      houseNrElement.value = "1"
      zipElement.value = "1020"
      cityElement.value = "city"
      countryElement.value = "country"
      additionElement.value = "addition"
      categoryElementSalsa.value = "Salsa"
      priceElement.value = "1"
      description.value = "description"
      publicElement.value = String(true)

      nameElement.dispatchEvent(new Event('input'))
      dateElement.dispatchEvent(new Event('input'))
      timeElement.dispatchEvent(new Event('input'))
      endElement.dispatchEvent(new Event('input'))
      streetElement.dispatchEvent(new Event('input'))
      houseNrElement.dispatchEvent(new Event('input'))
      zipElement.dispatchEvent(new Event('input'))
      cityElement.dispatchEvent(new Event('input'))
      countryElement.dispatchEvent(new Event('input'))
      additionElement.dispatchEvent(new Event('input'))
      categoryElementSalsa.dispatchEvent(new Event('input'))
      priceElement.dispatchEvent(new Event('input'))
      description.dispatchEvent(new Event('input'))
      publicElement.dispatchEvent(new Event('input'))
    }
  });
