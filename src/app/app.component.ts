import { Component, OnInit } from '@angular/core';
import { ServerService } from './services/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isHydrating = false;
  lastUpdated: Date;

  constructor(private service: ServerService) {

  }

  ngOnInit(): void {
    this.isHydrating = true;
    this.service.getNewDataObservable().subscribe(data => {
      const dates = data.map(p => p.reportDate);
      this.lastUpdated = dates.reduce((a, b) => a > b ? a : b);
      this.isHydrating = false;
    });

    // this.service.hydrate();
  }


}
