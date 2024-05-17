import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SviKorisniciComponent } from './svi-korisnici/svi-korisnici.component';
import { DnevnikComponent } from './dnevnik/dnevnik.component';
import { RegistracijaNovogKorisnikaComponent } from './registracija-novog-korisnika/registracija-novog-korisnika.component';

const routes: Routes = [
  { path: 'admin', redirectTo: 'admin/korisnici', pathMatch: 'full' },
  { path: 'admin/dnevnik', component: DnevnikComponent },
  { path: 'admin/svi-korisnici', component: SviKorisniciComponent },
  { path: 'admin/registracija-novog-korisnika', component: RegistracijaNovogKorisnikaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
