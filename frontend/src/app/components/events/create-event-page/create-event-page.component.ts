import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EventService} from "../../../services/event.service";
import {requiredTimeValidator} from "../../../validators/requiredTime";
import {Category} from "../../../enums/category.enum";
import {Router} from "@angular/router";
import {CreateEventDto} from "../../../dto/createEvent.dto";
import {AddressDto} from "../../../dto/address.dto";

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


  constructor(private fb: FormBuilder, private eventService: EventService, private router: Router,
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
          addition: [],
        }),
        price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
        date: ['', Validators.required],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
        description: ['', Validators.required],
        public: [true],
        category: ['', Validators.required]
      }, { validators: requiredTimeValidator}
    );
  }


  get name(): AbstractControl | null {
    return this.createEventForm.get('name')
  }

  get price(): AbstractControl | null {
    return this.createEventForm.get('price')
  }

  get date(): AbstractControl | null {
    return this.createEventForm.get('date')
  }

  get startTime(): AbstractControl | null {
    return this.createEventForm.get('startTime')
  }

  get endTime(): AbstractControl | null {
    return this.createEventForm.get('endTime')
  }

  get category(): AbstractControl | null {
    return this.createEventForm.get('category')
  }

  get country(): AbstractControl | null {
    return this. createEventForm.get(['address', 'country'])
  }

  get street(): AbstractControl | null {
    return this. createEventForm.get(['address', 'street'])
  }

  get city(): AbstractControl | null {
    return this. createEventForm.get(['address', 'city'])
  }

  get housenumber(): AbstractControl | null {
    return this. createEventForm.get(['address', 'housenumber'])
  }

  get postalcode(): AbstractControl | null {
    return this. createEventForm.get(['address', 'postalcode'])
  }

  get addition(): AbstractControl | null{
    return this.createEventForm.get(['address', 'addition'])
  }

  get public(): AbstractControl | null {
    return this.createEventForm.get(['public'])
  }

  get description(): AbstractControl | null {
    return this.createEventForm.get(['description'])
  }

  createEvent() {
    const address = new AddressDto(
      this.createEventForm.value.address.country,
      this.createEventForm.value.address.city,
      this.createEventForm.value.address.postalcode,
      this.createEventForm.value.address.street,
      this.createEventForm.value.address.housenumber,
      this.createEventForm.value.address.addition
    );

    return new CreateEventDto(
      this.createEventForm.value.name,
      this.createEventForm.value.description,
      address,
      Number(this.createEventForm.value.price),
      this.createEventForm.value.public,
      new Date(`${this.date?.value}T${this.startTime?.value}`).toISOString(),
      new Date(`${this.date?.value}T${this.endTime?.value}`).toISOString(),
      this.createEventForm.value.category,
    )
  }

  onSubmit(){
    if (this.createEventForm.valid){
      const newEvent = this.createEvent();
      this.loading = true;

      this.eventService.createEvent(newEvent).subscribe({
        next: resp => {
          if (resp.status == 201) {
            this.loading = false;
            this.router.navigate(['']);
          }
        }, error: err => {
          this.loading = false;
          this.error = true;
        }
      });
    }
  }
}
