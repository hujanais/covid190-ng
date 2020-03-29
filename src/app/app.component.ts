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

  // the latest data timestamp
  lastUpdated: Date;

  // The chart data
  chartData1: IChartData[] = new Array<IChartData>();
  chartData2: IChartData[] = new Array<IChartData>();

  xAxisLabels = [];

  // available countries.
  countries: string[];

  // used for multiple selection.
  toppings = new FormControl();
  // Contains the list of selected countries.
  selectedCountries: string[] = new Array<string>();

  title = 'covid19-ng';
  _subscription: Subscription;

  @ViewChild('canvas1', { static: false }) chart: BaseChartDirective;
  @ViewChild('canvas2', { static: false }) chart2: BaseChartDirective;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    title: {
      display: true,
      text: 'Total Cases'
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'day'
        },
        display: true
      }]
    }
  };

  chartOptions2 = {
    responsive: true,
    maintainAspectRatio: true,
    title: {
      display: true,
      text: 'New Cases'
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'day'
        },
        display: true
      }]
    }
  };


  constructor(private serverService: ServerService) {
    this.chartData1.push({ data: [], label: 'test' });
    this.chartData2.push({ data: [], label: 'test' });
  }

  ngOnInit(): void {
    this._subscription = this.serverService.getNewDataObservable().subscribe(resp => {
      this.data = resp;
      this.countries = [... new Set(this.data.map(d => d.name))].sort();
      const dates = this.data.map(p => p.reportDate);
      this.lastUpdated = dates.reduce((a, b) => a > b ? a : b);
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
    this.chartData1.length = 0;
    this.chartData2.length = 0;
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
    this.chartData1.length = 0;
    this.chartData2.length = 0;
    this.selectedDataSet.length = 0;
    this.xAxisLabels.length = 0;

    let minX: number = Number.MAX_VALUE;
    let maxX: number = 0;
    let arraysize: number = 0;

    this.selectedCountries.forEach(name => {
      let countryData = this.data.filter(p => p.name === name).sort((obj1, obj2) => {
        return obj1.reportNumber - obj2.reportNumber;
      });

      const arr = countryData.map(c => c.reportNumber);
      minX = Math.min(minX, Math.min(...arr));
      maxX = Math.max(maxX, Math.max(...arr));

      // Step 1. build the x-axis range.
      if (countryData.length > arraysize) {
        this.xAxisLabels = countryData.map(c => c.reportDate);
        arraysize = countryData.length;
      }

      this.selectedDataSet.push(countryData);

      this.chartData1.push({ data: [], label: name });
      this.chartData2.push({ data: [], label: name });
    });

    let idx = 0;
    this.selectedDataSet.forEach(dataSet => {
      // Step 2. preallocate memory of chart.
      this.chartData1[idx].data = new Array<number>(maxX - minX + 1);
      this.chartData2[idx].data = new Array<number>(maxX - minX + 1);
      let startIdx = dataSet[0].reportNumber - minX;
      let howmany = maxX - dataSet[0].reportNumber + 1;
      this.chartData1[idx].data.splice(startIdx, howmany, ...dataSet.map(d => d.cases));
      this.chartData2[idx].data.splice(startIdx, howmany, ...dataSet.map(d => d.newCases));
      idx++;
    });

    // update the chart.
    this.chart.update();
    this.chart2.update();
  }
}
