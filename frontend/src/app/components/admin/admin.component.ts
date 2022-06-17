import { Component, OnInit } from '@angular/core';
import { ValidationRequestEntity } from '../../entities/validationRequestEntity';
import { AdminService } from '../../services/admin.service';
import { ValidationEnum } from '../../enums/validation.enum';
import { ImageService } from '../../services/image.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-overview',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  validationRequests: ValidationRequestEntity[] = [];

  comment = '';

  constructor(
    private readonly adminService: AdminService,
    private readonly imageService: ImageService,
    private readonly sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.setRequests();
  }

  setRequests(): void {
    this.adminService.getAllRequests().subscribe(entries => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      entries.forEach(async entry => {
        const image = await this.imageService.getValidationImage(entry.id);
        entry.image = URL.createObjectURL(image);
      });

      this.validationRequests = entries;
    });
  }

  accept(id: string): void {
    this.adminService.updateRequest(id, ValidationEnum.APPROVED, this.comment).subscribe(() => {
      this.setRequests();
    });
  }

  reject(id: string): void {
    this.adminService.updateRequest(id, ValidationEnum.REJECTED, this.comment).subscribe(() => {
      this.setRequests();
    });
  }

  transform(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
