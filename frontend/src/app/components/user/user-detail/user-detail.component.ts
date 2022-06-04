import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserEntity } from '../../../entities/user.entity';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})

export class UserDetailComponent implements OnInit {

  user: UserEntity | null = null;

  constructor(private readonly service: UserService,
    private readonly authService: AuthService,
    private readonly router: Router) { }

  ngOnInit(): void {
    this.service.user$.subscribe( user => this.user = user);
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
}
