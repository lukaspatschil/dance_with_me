import { ComponentFixture, TestBed } from '@angular/core/testing';

jest.mock('@meilisearch/instant-meilisearch');

import { EventSearchComponent } from '../../../../app/components/events/event-search/event-search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('EventSearchComponent', () => {
  let comp: EventSearchComponent;
  let fixture: ComponentFixture<EventSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventSearchComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot() ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSearchComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });
});
