import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PrijavaService } from '../servisi/prijava.service';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrl: './prijava.component.scss'
})
export class PrijavaComponent {
  
  porukaGreske: string = "";

  constructor(private router: Router, private prijavaServis: PrijavaService) {
    if (sessionStorage['korime'] != undefined) {
      router.navigate(["/pocetna"]);
    }
  }

  async prijaviKorisnika(korime: string, lozinka: string) {
    let poruka: string = await this.prijavaServis.prijaviKorisnika(korime, lozinka);
    this.porukaGreske = poruka;

    if (poruka == "") {
      this.router.navigate(["/pocetna"]);
    }
  }
}
