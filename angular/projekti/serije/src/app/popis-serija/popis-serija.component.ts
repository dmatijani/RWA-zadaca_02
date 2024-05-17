import { Component } from '@angular/core';
import { SerijaI } from '../sucelja/SerijaI';
import { SerijeService } from '../servisi/serije.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popis-serija',
  templateUrl: './popis-serija.component.html',
  styleUrl: './popis-serija.component.scss'
})
export class PopisSerijaComponent {
  serije = new Array<SerijaI>();
  kljucnaRijec: string = "";
  stranica: number = 1;
  brojRezultata: number = 1;
  brojStranica: number = 1;
  zapisiPoStranici: number = 1;

  constructor(
    private serijeServis: SerijeService,
    private router: Router
  ) {
    if (sessionStorage['korime'] == undefined) {
      router.navigate(["/prijava"]);
    }
  }

  async dohvatiSerije(stranica: number, kljucnaRijec: string) {
    if (kljucnaRijec == "") {
      this.serije = new Array<SerijaI>();
      this.stranica = 1;
      this.brojRezultata = 1;
      this.brojStranica = 1;
      this.zapisiPoStranici = 1;
    }

    let odgovor = await this.serijeServis.ucitajSerije(stranica, kljucnaRijec);
    if (odgovor != null) {
      this.stranica = stranica;
      this.serije = odgovor.serije;
      this.brojRezultata = odgovor.broj_rezultata;
      this.brojStranica = odgovor.broj_stranica;
      this.zapisiPoStranici = odgovor.zapisi_po_stranici;
    } else {
      this.serije = new Array;
      this.router.navigate(["/prijava"]);
    }
  }

  dohvatiSerijePoKljucnojRijeci(kljucnaRijec: string) {
    if (kljucnaRijec.length < 3) {
      this.serije = new Array<SerijaI>();
      this.kljucnaRijec = "";
      this.stranica = 1;
      return;
    }
    this.kljucnaRijec = kljucnaRijec;

    this.dohvatiSerije(1, kljucnaRijec);
  }
}
