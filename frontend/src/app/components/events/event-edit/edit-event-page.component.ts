import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { requiredTimeValidator } from '../../../validators/requiredTime';
import { Category } from '../../../enums/category.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateEventDto } from '../../../dto/createEvent.dto';
import { AddressDto } from '../../../dto/address.dto';
import { requiredImageType } from '../../../validators/requiredImageType';
import { ImageService } from '../../../services/image.service';
import { HttpStatusCode } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { EventEntity } from '../../../entities/event.entity';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-edit',
  templateUrl: '../create-event-page/create-event-page.component.html',
  styleUrls: ['../create-event-page/create-event-page.component.scss']
})
export class EditEventPageComponent implements OnInit {

  isCreatePage = false;

  event$!: Observable<EventEntity | null>;

  categories = Object.values(Category);

  loadedEventCategories: string[] = [];

  createEventForm!: FormGroup;

  public todayDate = new Date();

  public loading = false;

  public error = false;

  private id!: string;

  event?: EventEntity = undefined;


  constructor(
    private readonly fb: FormBuilder,
    private readonly eventService: EventService,
    private readonly router: Router,
    private readonly imageService: ImageService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.createEventForm = this.fb.group({
      name: ['', Validators.required],
      address: this.fb.group({
        country: ['', Validators.required],
        street: ['', Validators.required],
        city: ['', Validators.required],
        housenumber: ['', Validators.required],
        postalcode: ['', Validators.required],
        addition: []
      }),
      price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^(?:0|[1-9]\d*)(?:[.]\d{1,2})?$/)]],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      description: ['', Validators.required],
      public: [true],
      category: new FormArray([], [Validators.required]),
      image: [null, requiredImageType()]
    }, { validators: requiredTimeValidator }
    );

    this.event$ = this.eventService.getEvent(this.id);
    let dp = new DatePipe('en');
    this.event$.pipe(take(1)).subscribe(event => {
      if (event !== null) {
        this.createEventForm.patchValue({
          name: event.name,
          price: event.price,
          date: dp.transform(event.startDateTime, 'yyyy-MM-dd'),
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          startTime: `${event.startDateTime.getHours().toString().padStart(2, '0')}:${event.startDateTime.getMinutes().toString().padStart(2, '0')}`,
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          endTime: `${event.endDateTime.getHours().toString().padStart(2, '0')}:${event.endDateTime.getMinutes().toString().padStart(2, '0')}`,
          description: event.description,
          address:{
            country: event.address.country,
            street: event.address.street,
            city: event.address.city,
            housenumber: event.address.housenumber,
            postalcode: event.address.postalcode,
            addition: event.address.addition ?? ''
          },
          public: event.public
        });
        event.category.forEach(cat => {
          this.loadedEventCategories.push(cat);
          const formArray: FormArray = this.createEventForm.get('category') as FormArray;
          formArray.push(new FormControl(cat));
        });
        this.event = event;
      }
    });
  }


  get name(): AbstractControl | null {
    return this.createEventForm.get('name');
  }

  get price(): AbstractControl | null {
    return this.createEventForm.get('price');
  }

  get date(): AbstractControl {
    return this.createEventForm.get('date')!;
  }

  get startTime(): AbstractControl {
    return this.createEventForm.get('startTime')!;
  }

  get endTime(): AbstractControl {
    return this.createEventForm.get('endTime')!;
  }

  get category(): AbstractControl | null {
    return this.createEventForm.get('category');
  }

  get country(): AbstractControl | null {
    return this. createEventForm.get(['address', 'country']);
  }

  get street(): AbstractControl | null {
    return this. createEventForm.get(['address', 'street']);
  }

  get city(): AbstractControl | null {
    return this. createEventForm.get(['address', 'city']);
  }

  get housenumber(): AbstractControl | null {
    return this. createEventForm.get(['address', 'housenumber']);
  }

  get postalcode(): AbstractControl | null {
    return this. createEventForm.get(['address', 'postalcode']);
  }

  get addition(): AbstractControl{
    return this.createEventForm.get(['address', 'addition'])!;
  }

  get public(): AbstractControl {
    return this.createEventForm.get(['public'])!;
  }

  get description(): AbstractControl | null {
    return this.createEventForm.get(['description']);
  }

  get image(): AbstractControl {
    return this.createEventForm.get(['image'])!;
  }

  get address(): AbstractControl {
    return this.createEventForm.get(['address'])!;
  }

  clearImage(): void {
    this.image.patchValue(null);
  }

  createEvent(): Partial<CreateEventDto> {
    const address = new AddressDto(
      this.createEventForm.value.address.country,
      this.createEventForm.value.address.city,
      this.createEventForm.value.address.postalcode,
      this.createEventForm.value.address.street,
      this.createEventForm.value.address.housenumber,
      this.addition.value
    );

    return {
      name: this.name?.touched ? this.createEventForm.value.name: undefined,
      description: this.description?.touched ? this.createEventForm.value.description : undefined,
      address: this.address.touched ? address : undefined,
      price: this.price?.touched ? Number(this.createEventForm.value.price) : undefined,
      public: this.price?.touched ? this.public.value: undefined,
      startDateTime: this.startTime.touched || this.date.touched ? new Date(`${this.date.value}T${this.startTime.value}`).toISOString() : undefined,
      endDateTime: this.endTime.touched || this.date.touched ? new Date(`${this.date.value}T${this.endTime.value}`).toISOString() : undefined,
      category: this.category?.touched ? this.createEventForm.value.category : undefined
    };
  }

  onSubmit(): void {
    if (this.createEventForm.valid){
      const newEvent = this.createEvent();
      this.loading = true;

      if (this.image.value) {
        this.imageService.uploadImage(this.image.value).subscribe({
          next: response => {
            newEvent.imageId = response.id;
            this.patchEvent(newEvent);
          },
          error: () => {
            this.loading = false;
            this.error = true;
          }
        });
      } else {
        this.patchEvent(newEvent);
      }
    }
  }

  private patchEvent(event: Partial<CreateEventDto>): void {
    this.eventService.patchEvent(event, this.id).subscribe({
      next: resp => {
        if (resp.status === HttpStatusCode.Ok) {
          this.loading = false;
          void this.router.navigate([`/event/${resp.body?.id}`]);
        }
      }, error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  onCheckChange(event: Event): void {
    const formArray: FormArray = this.createEventForm.get('category') as FormArray;

    const element = event.currentTarget as HTMLInputElement;
    const value = element.value;
    const checked = element.checked;
    formArray.markAsTouched();

    if (checked){
      formArray.push(new FormControl(value));
    } else {
      let i = 0;
      formArray.controls.forEach((ctrl: AbstractControl | null) => {
        if (ctrl?.value === value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }
}
