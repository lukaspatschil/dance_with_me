import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent implements OnInit {

  constructor(private readonly swUpdate: SwUpdate) { }

  ngOnInit(): void {
    this.swUpdate.available.subscribe(() => {
      // here you can reload your page
      window.location.reload();
    });
  }

}
