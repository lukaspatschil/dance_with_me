import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { requiredTimeValidator } from '../../../validators/requiredTime';
import { Category } from '../../../enums/category.enum';
import { Router } from '@angular/router';
import { CreateEventDto } from '../../../dto/createEvent.dto';
import { AddressDto } from '../../../dto/address.dto';
import { requiredImageType } from '../../../validators/requiredImageType';
import { ImageService } from '../../../services/image.service';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-create-event-page',
  templateUrl: './create-event-page.component.html',
  styleUrls: ['./create-event-page.component.scss']
})
export class CreateEventPageComponent implements OnInit {
  title = 'create';

  categories = Object.values(Category);

  createEventForm!: FormGroup;

  public todayDate = new Date();

  public loading = false;

  public error = false;


  constructor(
    private readonly fb: FormBuilder,
    private readonly eventService: EventService,
    private readonly router: Router,
    private readonly imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.createEventForm = this.fb.group({
      name: ['', Validators.required],
      address: this.fb.group({
        country: ['', Validators.required],
        street: ['', Validators.required],
        city: ['', Validators.required],
        housenumber: ['', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
        postalcode: ['', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
        addition: []
      }),
      price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      description: ['', Validators.required],
      public: [true],
      category: new FormArray([], [Validators.required]),
      image: [null, requiredImageType()]
    }, { validators: requiredTimeValidator }
    );
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

  clearImage(): void {
    this.image.patchValue(null);
  }

  createEvent(): CreateEventDto {
    const address = new AddressDto(
      this.createEventForm.value.address.country,
      this.createEventForm.value.address.city,
      this.createEventForm.value.address.postalcode,
      this.createEventForm.value.address.street,
      this.createEventForm.value.address.housenumber,
      this.addition.value
    );

    return new CreateEventDto(
      this.createEventForm.value.name,
      this.createEventForm.value.description,
      address,
      Number(this.createEventForm.value.price),
      this.public.value,
      new Date(`${this.date.value}T${this.startTime.value}`).toISOString(),
      new Date(`${this.date.value}T${this.endTime.value}`).toISOString(),
      this.createEventForm.value.category
    );
  }

  onSubmit(): void {
    if (this.createEventForm.valid){
      const newEvent = this.createEvent();
      this.loading = true;

      if (this.image.value) {
        this.imageService.uploadImage(this.image.value).subscribe({
          next: response => {
            newEvent.imageId = response.id;
            this.uploadEvent(newEvent);
          },
          error: () => {
            this.loading = false;
            this.error = true;
          }
        });
      } else {
        this.uploadEvent(newEvent);
      }
    }
  }

  private uploadEvent(event: CreateEventDto): void {
    this.eventService.createEvent(event).subscribe({
      next: resp => {
        if (resp.status === HttpStatusCode.Created) {
          this.loading = false;
          void this.router.navigate([`/payment/${resp.body?.id}`]);
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
