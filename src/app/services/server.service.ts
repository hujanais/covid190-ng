import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICovidData } from '../models/icovid-data';
import { Observable, Subject } from 'rxjs';

// const URL = 'https://covid190api.herokuapp.com/api/data';
const URL = 'https://covid19.pillious.now.sh/api/data';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private newDataSubject = new Subject<ICovidData[]>();

  private covidData: ICovidData[] = null;

  private _lastUpdated: Date;

  constructor(private httpClient: HttpClient) { }

  /**
   * Get data once from server.
   */
  hydrate() {
    this.httpClient.get(URL).subscribe((resp: ICovidData[]) => {
      this.covidData = resp;
      const dates = resp.map(p => p.reportDate);
      this._lastUpdated = dates.reduce((a, b) => a > b ? a : b);

      this.newDataSubject.next(this.covidData);

    }, error => {
      console.log(error);
    });
  }

  getNewDataObservable(): Observable<ICovidData[]> {
    return this.newDataSubject.asObservable();
  }

  /**
   * Get the last updated time.
   */
  get lastUpdated(): Date {
    return this._lastUpdated;
  }

  /**
   * Return all data from the last updated date.
   */
  get latestData(): ICovidData[] {
    if (this.covidData !== null) {
      return this.covidData.filter(m => m.reportDate === this._lastUpdated);
    } else {
      return null;
    }
  }

  /**
   * Get the raw data.
   */
  get(): ICovidData[] {
    return this.covidData;
  }
}
