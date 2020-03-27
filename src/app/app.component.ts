import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ServerService } from './services/server.service';
import { Subscription } from 'rxjs';
import { ICovidData } from './models/icovid-data';
import { FormControl } from '@angular/forms';

export interface IChartData {
  data: number[];
  label: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  // The full dataset.
  data: ICovidData[];

  // The dataset to be presented.
  selectedDataSet = new Array<ICovidData[]>();

  // The chart data
  chartData: IChartData[] = new Array<IChartData>();

  xAxisLabels = [];

  // available countries.
  countries: string[];

  // used for multiple selection.
  toppings = new FormControl();
  // Contains the list of selected countries.
  selectedCountries: string[] = new Array<string>();

  title = 'covid19-ng';
  _subscription: Subscription;

  @ViewChild(BaseChartDirective, { static: false }) chart: BaseChartDirective;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    title: {
      display: true,
      text: 'Total Cases'
    },
    scales: {
      xAxes: [{
        display: true
      }]
    }
  };

  constructor(private serverService: ServerService) {
    this.chartData.push({ data: [], label: 'test' });
  }

  ngOnInit(): void {
    this._subscription = this.serverService.getFilterCountryObservable().subscribe(resp => {
      this.data = resp;
      this.countries = [... new Set(this.data.map(d => d.name))].sort();
    });

    this.serverService.hydrate();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /**
   * Reset the selected countries.
   */
  reset(): void {
    this.selectedCountries = new Array<string>();
    this.chartData.length = 0;
  }

  /**
   * Handle the clicking and unclicking of the multi-select.
   * @param event 
   */
  onSearchChange(event) {
    if (event.isUserInput) {
      let country = event.source.value;
      let index = this.selectedCountries.indexOf(country);
      if (event.source.selected) {
        if (index < 0) {
          this.selectedCountries.push(event.source.value);
        }
      }
      else {
        this.selectedCountries.splice(index, 1);
      }

      this.updateGraphs();
    }
  }

  /**
   * Update graphs and results
   */
  updateGraphs(): void {
    this.chartData.length = 0;

    let minX: number = Number.MAX_VALUE;
    let maxX: number = 0;

    this.selectedDataSet.length = 0;
    this.selectedCountries.forEach(name => {
      let countryData = this.data.filter(p => p.name === name).sort((obj1, obj2) => {
        return obj1.reportNumber - obj2.reportNumber;
      });

      const arr = countryData.map(c => c.reportNumber);
      minX = Math.min(minX, Math.min(...arr));
      maxX = Math.max(maxX, Math.max(...arr));

      this.selectedDataSet.push(countryData);

      this.chartData.push({ data: [], label: name });
    });

    // display the actual data.
    // Step 1. build the x-axis range.
    this.xAxisLabels.length = 0;
    for (let x = minX; x <= maxX; x++) {
      this.xAxisLabels.push(x.toString());
    }

    let idx = 0;
    this.selectedDataSet.forEach(dataSet => {
      // Step 2. preallocate memory of chart.
      this.chartData[idx].data = new Array<number>(maxX - minX + 1);
      let startIdx = dataSet[0].reportNumber - minX;
      let howmany = maxX - dataSet[0].reportNumber + 1;
      this.chartData[idx].data.splice(startIdx, howmany, ...dataSet.map(d => d.cases));
      idx++;
    });

    // update the chart.
    this.chart.update();
  }
}
