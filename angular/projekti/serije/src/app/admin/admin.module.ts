import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SviKorisniciComponent } from './svi-korisnici/svi-korisnici.component';
import { RegistracijaNovogKorisnikaComponent } from './registracija-novog-korisnika/registracija-novog-korisnika.component';
import { DnevnikComponent } from './dnevnik/dnevnik.component';


@NgModule({
  declarations: [
    SviKorisniciComponent,
    RegistracijaNovogKorisnikaComponent,
    DnevnikComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
