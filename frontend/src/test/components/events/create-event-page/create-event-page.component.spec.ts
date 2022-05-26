import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';

import {CreateEventPageComponent} from '../../../../app/components/events/create-event-page/create-event-page.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {EventService} from "../../../../app/services/event.service";
import {EventServiceMock} from "../../../mock/event.service.mock";
import {TranslateModule} from "@ngx-translate/core";
import {Category} from "../../../../app/enums/category.enum";
import {formatDate} from "@angular/common";
import {CreateEventDto} from "../../../../app/dto/createEvent.dto";
import {AddressDto} from "../../../../app/dto/address.dto";

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

    beforeEach(async () => {
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
        categoryElementSalsa = fixture.debugElement.nativeElement.querySelector('#category0')
        description = fixture.debugElement.nativeElement.querySelector('#description')
        priceElement = fixture.debugElement.nativeElement.querySelector('#price')
        publicElement = fixture.debugElement.nativeElement.querySelector('#public')

        createButton = fixture.debugElement.nativeElement.querySelector('#create_button')

        date = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
      })


      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });


    it('should create-event-page', () => {
      expect(comp).toBeTruthy();
    });

    it('should return the amount of input fields', () => {
      // When
      const formElement = fixture.debugElement.nativeElement.querySelector('#createForm');
      const inputElements = formElement.querySelectorAll('input');

      // Then
      expect(inputElements.length).toEqual(18)
    });

    describe('CreateEventForm', () => {
      it('should be invalid when empty', () => {
        expect(comp.createEventForm.valid).toBeFalsy();
      });

      it('should return empty for all form values', async () => {
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
          category: [],
          image: null
        }
        await fixture.whenStable();

        // Then
        expect(createForm.value).toEqual(createFormValues);
      });

      it('should be valid when inputs are filled correctly', async () => {
        // Given
        await fixture.whenStable();

        // When
        createValidInput();
        const isFormValid = comp.createEventForm.valid

        // Then
        expect(isFormValid).toBeTruthy()

      });

      it('should be invalid when one input is filled falsely', async () => {
        // Given
        await fixture.whenStable()

        // When
        createInvalidInput()
        const isFormValid = comp.createEventForm.valid

        // Then
        expect(isFormValid).toBeFalsy()

      });
    })

    describe('SubmitButton', () => {
      it('should be disabled when form invalid', async () => {
        await fixture.whenStable()

        // When
        createInvalidInput()

        // Then
        expect(createButton.disabled).toBeTruthy()
      });
    })

    describe('createEvent', () => {
      it('should create-event-page a new event', async () => {
        // Given
        const address = new AddressDto('country', 'city', '1020', 'street', '10', 'addition')
        const newEvent = new CreateEventDto(
          'name',
          'description',
          address,
          1,
          true,
          new Date(`${date}T10:00`).toISOString(),
          new Date(`${date}T12:00`).toISOString(),
          [Category.SALSA]
        );

        // When
        createValidInput();
        await fixture.whenStable()

        // Then
        expect(comp.createEvent()).toEqual(newEvent)
      });
    });

    describe('clearImage', () => {
      it('should set the value of image to null', () => {
        // When
        comp.clearImage();

        // Then
        expect(comp.image?.value).toBeNull();
      });
    });

    describe('onSubmit', () => {
      it('should send a new event to API ', async () => {
        // When
        const newEvent: CreateEventDto = {
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
          startDateTime: new Date(`${date}T10:00`).toISOString(),
          endDateTime: new Date(`${date}T12:00`).toISOString(),
          category: [Category.SALSA]
        };

        await fixture.whenStable()
        createValidInput();
        comp.onSubmit();

        // Then
        expect(eventService.createEvent).toHaveBeenCalledWith(newEvent)
      });

      it('should not send a new event to API when input invalid', async () => {
        // Given
        await fixture.whenStable()

        // When
        createInvalidInput();
        comp.onSubmit();

        // Then
        expect(eventService.createEvent).not.toHaveBeenCalled();
      });
    });

    describe('onCheckChange', () => {
      it('should set a category in eventCreateForm', fakeAsync(()=>{
        // When
        const handleSpy = jest.spyOn(comp, 'onCheckChange');
        createValidInput()
        fixture.detectChanges();

        // Then
        expect(comp.createEventForm.get('category')?.value ).toStrictEqual([Category.SALSA]);
        expect(handleSpy).toHaveBeenCalled();
      }));

      it('should do nothing if no category is checked', () => {
        // When
        const handleSpy = jest.spyOn(comp, 'onCheckChange');
        fixture.detectChanges();

        // Then
        expect(comp.createEventForm.get('category')?.value ).toStrictEqual([]);
        expect(handleSpy).not.toHaveBeenCalled();
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
      categoryElementSalsa.checked = true
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
      categoryElementSalsa.checked = true
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
      categoryElementSalsa.dispatchEvent(new Event('change'))
      priceElement.dispatchEvent(new Event('input'))
      description.dispatchEvent(new Event('input'))
      publicElement.dispatchEvent(new Event('input'))
    }
  });
