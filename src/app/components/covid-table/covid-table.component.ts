import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServerService } from 'src/app/services/server.service';
import { Subscription } from 'rxjs';
import { ICovidData } from 'src/app/models/icovid-data';

@Component({
  selector: 'app-covid-table',
  templateUrl: './covid-table.component.html',
  styleUrls: ['./covid-table.component.scss']
})
export class CovidTableComponent implements OnInit, OnDestroy {

  private data: ICovidData[];
  private subscriber: Subscription;

  constructor(private service: ServerService) { }

  ngOnInit() {
    console.log('ngOnInit');
    this.data = this.service.get();

    this.subscriber = this.service.getNewDataObservable().subscribe(resp => {
      this.data = resp;
    });
  }

  ngOnDestroy(): void {
    this.subscriber.unsubscribe();
  }


}
