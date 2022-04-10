import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'dance-with-me-web-client';

  @HostBinding('class.navbar-opened') navbarOpened = false;
  constructor(
  ) { }

  toggleNavbar() {
    this.navbarOpened = !this.navbarOpened;
  }
}
