import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from '../../../../app/services/event.service';
import { EventServiceMock } from '../../../mock/event.service.mock';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../../../app/enums/category.enum';
import { formatDate } from '@angular/common';
import { CreateEventDto } from '../../../../app/dto/createEvent.dto';
import { AddressDto } from '../../../../app/dto/address.dto';
import { ImageService } from '../../../../app/services/image.service';
import { ImageServiceMock } from '../../../mock/image.service.mock';
import { EditEventPageComponent } from '../../../../app/components/events/event-edit/edit-event-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('EditEventPageComponent',
  () => {
    let comp: EditEventPageComponent;
    let fixture: ComponentFixture<EditEventPageComponent>;


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
    let categoryElementZouk: HTMLInputElement;
    let description: HTMLInputElement;
    let priceElement: HTMLInputElement;
    let publicElement: HTMLInputElement;
    let imageServiceMock: ImageServiceMock;

    let httpMock: HttpTestingController;
    let eventService: EventService;
    let eventServiceMock: EventServiceMock;

    let router: Router;


    let date: string;


    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot()],
        declarations: [EditEventPageComponent],
        providers: [{ provide: EventService, useClass: EventServiceMock }, { provide: ImageService, useClass: ImageServiceMock },
          { provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: {
                  get: jest.fn().mockReturnValue('1')
                }
              }
            } }]
      });

      httpMock = TestBed.inject(HttpTestingController);
      eventService = TestBed.inject(EventService);
      eventServiceMock = eventService as unknown as EventServiceMock;
      imageServiceMock = TestBed.inject(ImageService) as unknown as ImageServiceMock;
      router = TestBed.inject(Router);
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(EditEventPageComponent);
      comp = fixture.componentInstance;
      comp.ngOnInit();

      void fixture.whenStable().then(() => {
        nameElement = fixture.debugElement.nativeElement.querySelector('#event-name');
        dateElement = fixture.debugElement.nativeElement.querySelector('#date');
        timeElement = fixture.debugElement.nativeElement.querySelector('#startTime');
        endElement = fixture.debugElement.nativeElement.querySelector('#endTime');
        streetElement = fixture.debugElement.nativeElement.querySelector('#street');
        houseNrElement = fixture.debugElement.nativeElement.querySelector('#housenumber');
        zipElement = fixture.debugElement.nativeElement.querySelector('#zip');
        cityElement = fixture.debugElement.nativeElement.querySelector('#city');
        countryElement = fixture.debugElement.nativeElement.querySelector('#country');
        additionElement = fixture.debugElement.nativeElement.querySelector('#addition');
        categoryElementSalsa = fixture.debugElement.nativeElement.querySelector('#category0');
        categoryElementZouk = fixture.debugElement.nativeElement.querySelector('#category2');
        description = fixture.debugElement.nativeElement.querySelector('#description');
        priceElement = fixture.debugElement.nativeElement.querySelector('#price');
        publicElement = fixture.debugElement.nativeElement.querySelector('#public');

      });

      date = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');


      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });


    it('should edit-event-page', () => {
      expect(comp).toBeTruthy();
    });

    it('should return the amount of edit input fields', () => {
      // When
      const formElement = fixture.debugElement.nativeElement.querySelector('#createForm');
      const inputElements = formElement.querySelectorAll('input');

      // Then
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      expect(inputElements.length).toEqual(18);
    });

    describe('EditEventForm', () => {
      it('should be valid when default is set', () => {
        expect(comp.createEventForm.valid).toBeTruthy();
      });

      it('should return default event for all form values', async () => {
        // Given

        // When
        const createForm = comp.createEventForm;
        const createFormValues = {
          name: 'name',
          address: {
            country: 'country',
            street: 'street',
            city: 'city',
            housenumber: '10',
            postalcode: '1020',
            addition: 'addition'
          },
          price: 1,
          date: '2022-04-24',
          startTime: '10:00',
          endTime: '10:00',
          description: 'description',
          public: true,
          category: ['Salsa'],
          image: null
        };
        await fixture.whenStable();

        // Then
        expect(createForm.value).toEqual(createFormValues);
      });

      it('should be valid when inputs are filled correctly', async () => {
        // Given
        await fixture.whenStable();

        // When
        createValidInput();
        const isFormValid = comp.createEventForm.valid;

        // Then
        expect(isFormValid).toBeTruthy();

      });

      it('should be invalid when one input is filled falsely', async () => {
        // Given
        await fixture.whenStable();

        // When
        createInvalidInput();
        const isFormValid = comp.createEventForm.valid;

        // Then
        expect(isFormValid).toBeFalsy();

      });
    });

    describe('patchEvent', () => {
      it('should call patchEvent and execute rerouting', async () => {
        const rout = jest.spyOn(router, 'navigateByUrl');

        await fixture.whenStable();
        createValidInput();
        comp.onSubmit();

        // Then
        expect(rout).toHaveBeenCalled();
      });

      it('should call patchEvent and show error on exception', async () => {
        eventServiceMock.patchEvent = jest.fn().mockReturnValue(throwError(() => new Error()));

        await fixture.whenStable();
        createValidInput();
        comp.onSubmit();

        // Then
        expect(comp.error).toBeTruthy();
      });
    });

    describe('editEvent', () => {
      it('should create-event-page a new event', async () => {
        // Given
        const address = new AddressDto('country', 'city', '1020', 'street', '10', 'addition');
        const newEvent = new CreateEventDto(
          'name',
          'description',
          address,
          1,
          true,
          new Date(`${date}T10:00`).toISOString(),
          new Date(`${date}T12:00`).toISOString(),
          [Category.SALSA, Category.ZOUK]
        );
        if (comp.name)
          comp.name.markAsTouched();
        if (comp.description)
          comp.description.markAsTouched();
        if (comp.price)
          comp.price.markAsTouched();
        comp.startTime.markAsTouched();
        comp.endTime.markAsTouched();
        comp.date.markAsTouched();
        comp.public.markAsTouched();
        comp.date.markAsTouched();
        comp.address.markAsTouched();


        // When
        createValidInput();
        await fixture.whenStable();

        // Then
        expect(comp.createEvent()).toEqual(newEvent);
      });

      it('should create-event-page a new event', async () => {
        // Given
        const event: Partial<CreateEventDto>  = {
          name: undefined,
          description: undefined,
          address: undefined,
          price: undefined,
          category: [Category.SALSA, Category.ZOUK],
          endDateTime: undefined,
          startDateTime: undefined,
          public: undefined
        };

        // When
        createValidInput();
        await fixture.whenStable();

        // Then
        expect(comp.createEvent()).toEqual(event);
      });
    });

    describe('clearImage', () => {
      it('should set the value of image to null', () => {
        // When
        comp.clearImage();

        // Then
        expect(comp.image.value).toBeNull();
      });
    });

    describe('onSubmit', () => {
      it('should send a new event to API ', async () => {
        const createFormValues = {
          name: undefined,
          address: undefined,
          price: undefined,
          date: undefined,
          startDateTime: undefined,
          endDateTime: undefined,
          description: undefined,
          public: undefined,
          category: ['Salsa', 'Zouk']
        };
        await fixture.whenStable();
        createValidInput();
        comp.onSubmit();

        // Then
        expect(eventService.patchEvent).toHaveBeenCalledWith(createFormValues, '1');
      });

      it('should not send a new event to API when input invalid', async () => {
        // Given
        await fixture.whenStable();

        // When
        createInvalidInput();
        comp.onSubmit();

        // Then
        expect(eventService.createEvent).not.toHaveBeenCalled();
      });

      it('should send the value of image and set it in event', async () => {
        imageServiceMock.uploadImage = jest.fn().mockReturnValue(of({ id: 1 }));

        const createFormValues = {
          name: undefined,
          address: undefined,
          price: undefined,
          date: undefined,
          startDateTime: undefined,
          endDateTime: undefined,
          description: undefined,
          public: undefined,
          category: ['Salsa', 'Zouk'],
          imageId: 1
        };
        await fixture.whenStable();
        createValidInput();
        jest.spyOn(comp, 'image', 'get').mockReturnValue(comp.public);
        comp.onSubmit();

        // Then
        expect(eventService.patchEvent).toHaveBeenCalledWith(createFormValues, '1');
      });

      it('should send the value of image and set error flag to true on error', async () => {
        imageServiceMock.uploadImage = jest.fn().mockReturnValue(throwError(() => new Error()));

        await fixture.whenStable();
        createValidInput();
        jest.spyOn(comp, 'image', 'get').mockReturnValue(comp.public);
        comp.onSubmit();

        // Then
        expect(comp.error).toBeTruthy();
      });
    });

    describe('onCheckChange', () => {
      it('should set a category in eventCreateForm', fakeAsync(()=>{
        // When
        const handleSpy = jest.spyOn(comp, 'onCheckChange');
        createValidInput();
        fixture.detectChanges();

        // Then
        expect(comp.createEventForm.get('category')?.value ).toStrictEqual([Category.SALSA, Category.ZOUK]);
        expect(handleSpy).toHaveBeenCalled();
      }));

      it('should do nothing if no category is checked', () => {
        // When
        const handleSpy = jest.spyOn(comp, 'onCheckChange');
        fixture.detectChanges();

        // Then
        expect(comp.createEventForm.get('category')?.value ).toStrictEqual([Category.SALSA]);
        expect(handleSpy).not.toHaveBeenCalled();
      });
    });


    function createValidInput(): void {
      nameElement.value = 'name';
      dateElement.value = date;
      timeElement.value = '10:00';
      endElement.value = '12:00';
      streetElement.value = 'street';
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      houseNrElement.value = String(10);
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      zipElement.value = String(1020);
      cityElement.value = 'city';
      countryElement.value = 'country';
      additionElement.value = 'addition';
      categoryElementZouk.checked = true;
      priceElement.value = String(1);
      description.value = 'description';
      publicElement.value = String(true);

      nameElement.dispatchEvent(new Event('input'));
      dateElement.dispatchEvent(new Event('input'));
      timeElement.dispatchEvent(new Event('input'));
      endElement.dispatchEvent(new Event('input'));
      streetElement.dispatchEvent(new Event('input'));
      houseNrElement.dispatchEvent(new Event('input'));
      zipElement.dispatchEvent(new Event('input'));
      cityElement.dispatchEvent(new Event('input'));
      countryElement.dispatchEvent(new Event('input'));
      additionElement.dispatchEvent(new Event('input'));
      categoryElementZouk.dispatchEvent(new Event('change'));
      priceElement.dispatchEvent(new Event('input'));
      description.dispatchEvent(new Event('input'));
      publicElement.dispatchEvent(new Event('input'));
    }

    function createInvalidInput(): void {
      nameElement.value = '';
      dateElement.value = '2022-04-24';
      timeElement.value = '10:00';
      endElement.value = '12:00';
      streetElement.value = 'street';
      houseNrElement.value = '1';
      zipElement.value = '1020';
      cityElement.value = 'city';
      countryElement.value = 'country';
      additionElement.value = 'addition';
      categoryElementSalsa.checked = true;
      priceElement.value = '1,0';
      description.value = '';
      publicElement.value = String(true);

      nameElement.dispatchEvent(new Event('input'));
      dateElement.dispatchEvent(new Event('input'));
      timeElement.dispatchEvent(new Event('input'));
      endElement.dispatchEvent(new Event('input'));
      streetElement.dispatchEvent(new Event('input'));
      houseNrElement.dispatchEvent(new Event('input'));
      zipElement.dispatchEvent(new Event('input'));
      cityElement.dispatchEvent(new Event('input'));
      countryElement.dispatchEvent(new Event('input'));
      additionElement.dispatchEvent(new Event('input'));
      categoryElementSalsa.dispatchEvent(new Event('change'));
      priceElement.dispatchEvent(new Event('input'));
      description.dispatchEvent(new Event('input'));
      publicElement.dispatchEvent(new Event('input'));
    }
  });
