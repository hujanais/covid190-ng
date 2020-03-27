import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { compareTwoStrings, findBestMatch } from 'string-similarity';
import { ICovidData } from '../models/icovid-data';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

const URL = 'https://covid190api.herokuapp.com/api/data';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private filterSubject = new Subject<ICovidData[]>();

  private covidData: ICovidData[];

  public filteredData: ICovidData[];

  constructor(private httpClient: HttpClient) { }

  /**
   * Get data once from server.
   */
  hydrate() {
    this.httpClient.get(URL).subscribe((resp: ICovidData[]) => {
      this.covidData = resp;
      this.filterCountry(null);
    }, error => {
      console.log(error);
    });
  }

  filterCountry(name: string) {
    if (!name) {
      this.filteredData = this.covidData;
    } else {
      const lowerCaseName = name.toLowerCase();
      this.filteredData = this.covidData.filter(d => d.name.toLowerCase().includes(lowerCaseName));
    }

    this.filterSubject.next(this.filteredData);
  }

  getFilterCountryObservable(): Observable<ICovidData[]> {
    return this.filterSubject.asObservable();
  }

  get() {
    const body = null;
    return this.httpClient.get(URL);
  }

  test(countries: string[]) {
    let uniqueCountries: string[] = Array<string>();
    uniqueCountries = this.scrub(countries, 0.7);
    //uniqueCountries = this.scrub(uniqueCountries, 0.6);
    // uniqueCountries = this.scrub(uniqueCountries, 0.3);
  }

  scrub(countries: string[], ratingThreshold: number): string[] {
    let uniqueCountries: string[] = Array<string>();

    countries.forEach(element => {
      if (uniqueCountries.length == 0) {
        uniqueCountries.push(element);
      }
      else {
        const bestMatch = findBestMatch(element, uniqueCountries);
        if (bestMatch.bestMatch.rating < ratingThreshold) {
          uniqueCountries.push(element);
          // console.log(`New: ${bestMatch.bestMatch.rating}-${element}-${bestMatch.bestMatch.target}`);
        } else {
          console.log(`Old: ${bestMatch.bestMatch.rating} ${element}-${bestMatch.bestMatch.target}`);
        }
      }
    });

    return uniqueCountries;
  }
}
