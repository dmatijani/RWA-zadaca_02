import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PopisSerijaComponent } from './popis-serija/popis-serija.component';
import { DetaljiSerijeComponent } from './detalji-serije/detalji-serije.component';
import { RouterModule, Routes } from '@angular/router';
import { PrijavaComponent } from './prijava/prijava.component';
import { FavoritiComponent } from './favoriti/favoriti.component';
import { DetaljiFavoritaComponent } from './detalji-favorita/detalji-favorita.component';
import { ProfilComponent } from './profil/profil.component';
import { AdminModule } from './admin/admin.module';
import { DokumentacijaComponent } from './dokumentacija/dokumentacija.component';
import { DokumentacijaEraModelComponent } from './dokumentacija-era-model/dokumentacija-era-model.component';
import { PrijavaTotpComponent } from './prijava-totp/prijava-totp.component'

const routes: Routes = [
  { path: 'pocetna', component: PopisSerijaComponent },
  { path: 'detalji', component: DetaljiSerijeComponent },
  { path: 'detalji/:id', component: DetaljiSerijeComponent },
  { path: '', redirectTo: 'prijava', pathMatch: 'full' },
  { path: 'prijava', component: PrijavaComponent },
  { path: 'prijava/totp', component: PrijavaTotpComponent },
  { path: 'favoriti', component: FavoritiComponent },
  { path: 'favoriti/:id', component: DetaljiFavoritaComponent },
  { path: 'profil', component: ProfilComponent },
  { path: 'dokumentacija', component: DokumentacijaComponent },
  { path: 'dokumentacija-era-model', component: DokumentacijaEraModelComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PopisSerijaComponent,
    DetaljiSerijeComponent,
    PrijavaComponent,
    FavoritiComponent,
    DetaljiFavoritaComponent,
    ProfilComponent,
    DokumentacijaComponent,
    DokumentacijaEraModelComponent,
    PrijavaTotpComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    AdminModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
