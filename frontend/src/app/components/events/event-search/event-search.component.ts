import { Component } from '@angular/core';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { environment } from '../../../../environments/environment';

const searchClient = instantMeiliSearch(
  environment.meiliSearchUrl,
  environment.meiliSearchApiKey
);

@Component({
  selector: 'app-event-search',
  templateUrl: './event-search.component.html',
  styleUrls: ['./event-search.component.scss']
})
export class EventSearchComponent {
  title = 'events';

  config = {
    indexName: 'events',
    searchClient: searchClient
  };
}
