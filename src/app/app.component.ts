import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ServerService } from './services/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {

  isLoading = false;
  lastUpdated: Date;

  constructor(private service: ServerService) {

  }

  ngOnInit(): void {
    this.isLoading = false;
    this.service.getNewDataObservable().subscribe(data => {
      this.lastUpdated = this.service.lastUpdated;
      this.isLoading = false;
    });

    this.service.hydrate();
  }
}
