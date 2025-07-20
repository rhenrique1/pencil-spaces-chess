import { Routes } from '@angular/router';
import { MainPageComponent } from './components/main-page';
import { IframePageComponent } from './components/iframe-page';

export const routes: Routes = [
  { path: 'mainpage', component: MainPageComponent },
  { path: 'iframepage', component: IframePageComponent },
  { path: '', redirectTo: '/mainpage', pathMatch: 'full' }
];
