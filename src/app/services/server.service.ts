import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICovidData } from '../models/icovid-data';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const URL = 'https://covid19.pillious.now.sh/api/data';
// const URL = environment.serverURL;

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

  /**
   * The data is presorted by date.
   * @param country 
   */
  getDataByCountry(country: string): Observable<ICovidData[]> {
    return this.httpClient.get(URL, { params: { name: country } }).pipe(
      map((resp: ICovidData[]) => {
        this.covidData = resp;
        const dates = resp.map(p => p.reportDate);
        this._lastUpdated = dates.reduce((a, b) => a > b ? a : b);
        return this.covidData;
      })
    )
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
