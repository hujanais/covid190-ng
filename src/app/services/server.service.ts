import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICovidData } from '../models/icovid-data';
import { Observable, Subject } from 'rxjs';

const URL = 'https://covid190api.herokuapp.com/api/data';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private newDataSubject = new Subject<ICovidData[]>();

  private covidData: ICovidData[];

  constructor(private httpClient: HttpClient) { }

  /**
   * Get data once from server.
   */
  hydrate() {
    this.httpClient.get(URL).subscribe((resp: ICovidData[]) => {
      this.covidData = resp;
      this.newDataSubject.next(this.covidData);
    }, error => {
      console.log(error);
    });
  }

  getNewDataObservable(): Observable<ICovidData[]> {
    return this.newDataSubject.asObservable();
  }

  // private filterCountry(name: string) {
  //   if (!name) {
  //     this.filteredData = this.covidData;
  //   } else {
  //     const lowerCaseName = name.toLowerCase();
  //     this.filteredData = this.covidData.filter(d => d.name.toLowerCase().includes(lowerCaseName));
  //   }

  //   this.filterSubject.next(this.filteredData);
  // }

  // getFilterCountryObservable(): Observable<ICovidData[]> {
  //   return this.filterSubject.asObservable();
  // }

  get(): ICovidData[] {
    return this.covidData;
  }
}
