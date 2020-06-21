import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ServerService } from 'src/app/services/server.service';
import { ICovidData } from 'src/app/models/icovid-data';
import { FormControl } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';

export interface IChartData {
  data: number[];
  label: string;
  fill: boolean;
}

@Component({
  selector: 'app-graphs-view',
  templateUrl: './graphs-view.component.html',
  styleUrls: ['./graphs-view.component.scss']
})
export class GraphsViewComponent implements OnInit, OnDestroy {
  // The full dataset.
  data: ICovidData[] = null;

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
  private _selectedCountry: string;

  title = 'covid19-ng';
  subcriptions: Subscription = new Subscription();

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
    this.chartData1.push({ data: [], label: 'test', fill: false });
    this.chartData2.push({ data: [], label: 'test', fill: false });
  }

  ngOnInit(): void {
    this.data = this.serverService.get();
    this.initialize(this.data);

    this.subcriptions.add(this.serverService.getNewDataObservable().subscribe(resp => {
      this.data = resp;
      this.initialize(this.data);
    }));
  }

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  initialize(covidData: ICovidData[]) {
    if (!covidData) {
      return;
    }

    this.countries = [... new Set(covidData.map(d => d.name))].sort();
    const dates = covidData.map(p => p.reportDate);
    this.lastUpdated = dates.reduce((a, b) => a > b ? a : b);
  }

  /**
   * Reset the selected countries.
   */
  reset(): void {
    this.selectedCountries = new Array<string>();
    this.xAxisLabels.length = 0;
    this.chartData1.length = 0;
    this.chartData2.length = 0;
  }

  /**
   * Handle the clicking and unclicking of the multi-select.
   * @param event
   */
  // onSearchChange(event) {
  //   if (event.isUserInput) {
  //     const country = event.source.value;
  //     const index = this.selectedCountries.indexOf(country);
  //     if (event.source.selected) {
  //       if (index < 0) {
  //         this.selectedCountries.push(event.source.value);
  //       }
  //     } else {
  //       this.selectedCountries.splice(index, 1);
  //     }

  //     this.updateGraphs();
  //   }
  // }

  set selectedCountry(value: string) {
    this._selectedCountry = value;
    this.updateGraphs(value);
  }

  /**
   * Update graphs and results
   */
  updateGraphs(selectedCountry): void {
    this.chartData1.length = 0;
    this.chartData2.length = 0;
    this.selectedDataSet.length = 0;
    this.xAxisLabels.length = 0;

    let minX: number = Number.MAX_VALUE;
    let maxX = 0;
    let arraysize = 0;

    this.subcriptions.add(this.serverService.getDataByCountry(selectedCountry).subscribe(data => {
      const countryData = data.sort((obj1, obj2) => {
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

      this.chartData1.push({ data: [], label: name, fill: false });
      this.chartData2.push({ data: [], label: name, fill: false });

      let idx = 0;
      this.selectedDataSet.forEach(dataSet => {
        // Step 2. preallocate memory of chart.
        this.chartData1[idx].data = new Array<number>(maxX - minX + 1);
        this.chartData2[idx].data = new Array<number>(maxX - minX + 1);
        const startIdx = dataSet[0].reportNumber - minX;
        const howmany = maxX - dataSet[0].reportNumber + 1;
        this.chartData1[idx].data.splice(startIdx, howmany, ...dataSet.map(d => d.cases));
        this.chartData2[idx].data.splice(startIdx, howmany, ...dataSet.map(d => d.newCases));
        idx++;
      });

      // update the chart.
      if (this.chart !== undefined) {
        this.chart.update();
      }
      if (this.chart2 !== undefined) {
        this.chart2.update();
      }
    }));
  }
}
