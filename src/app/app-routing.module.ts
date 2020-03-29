import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CovidTableComponent } from './components/covid-table/covid-table.component';
import { GraphsViewComponent } from './components/graphs-view/graphs-view.component';


const routes: Routes = [
  { path: 'table', component: CovidTableComponent },
  { path: 'graph', component: GraphsViewComponent },
  { path: '', component: CovidTableComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
