import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserEntity } from '../../../entities/user.entity';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpStatusCode } from '@angular/common/http';
import { ValidationService } from '../../../services/validation.service';
import { RoleEnum } from '../../../enums/role.enum';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { requiredImageType } from '../../../validators/requiredImageType';
import { ValidationRequestEntity } from '../../../entities/validationRequestEntity';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})

export class UserDetailComponent implements OnInit {

  user: UserEntity | null = null;

  validationStatus?: ValidationRequestEntity;

  isUser = false;

  upgradeUserClicked = false;

  validationForm!: FormGroup;

  loading = false;

  error = false;

  constructor(private readonly service: UserService,
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly validationService: ValidationService,
    private readonly router: Router) { }

  ngOnInit(): void {

    this.validationForm = this.fb.group({
      image: [null, [Validators.required, requiredImageType()]]
    }
    );

    this.service.user$.subscribe( user => {
      this.user = user;
      if (this.user !== null && this.user.role === RoleEnum.USER){
        this.isUser = true;
      }
    });

    this.getValidationStatus();
  }

  get image(): AbstractControl {
    return this.validationForm.get(['image'])!;
  }

  clearImage(): void {
    this.image.patchValue(null);
  }

  deleteUser(): void {
    this.service.deleteUser().subscribe({
      next: resp => {
        if (resp.status == HttpStatusCode.NoContent) {
          this.authService.logout();
          void this.router.navigate(['']);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.validationForm.valid) {
      this.validationService.validateUser(this.image.value).subscribe({
        next: resp => {
          if (resp.status === HttpStatusCode.Created) {
            this.loading = false;
            this.upgradeUserClicked = false;
            this.getValidationStatus();
          }
        }, error: () => {
          this.loading = false;
          this.error = true;
        }
      });
    }
  }

  getValidationStatus(): void{
    this.validationService.getValidationRequest().subscribe(request => {
      this.validationStatus = request[0];
    });
  }
}
