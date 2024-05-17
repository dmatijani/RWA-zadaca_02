import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PrijavaService } from '../../servisi/prijava.service';
import { DnevnikService } from '../../servisi/dnevnik.service';
import { DnevnickiZapisI, DnevnickiZapisiI } from '../../sucelja/DnevnickiZapisiI';

@Component({
  selector: 'app-dnevnik',
  templateUrl: './dnevnik.component.html',
  styleUrl: './dnevnik.component.scss'
})
export class DnevnikComponent implements OnInit {
  dnevnickiZapisi: Array<DnevnickiZapisI> = new Array<DnevnickiZapisI>();
  brojZapisa: number = 0;
  zapisiPoStr: number = 0;
  stranica: number = 1;
  brojStranica: number = 1;
  parametri: string = "";

  constructor(
    private router: Router,
    private prijavaServis: PrijavaService,
    private dnevnikServis: DnevnikService
  ) {
    if (sessionStorage['korime'] == undefined
    ) {
      prijavaServis.odjaviKorisnika();
      router.navigate(["/prijava"]);
      return;
    }

    if (sessionStorage['admin'] == undefined) {
      prijavaServis.odjaviKorisnika();
      router.navigate(["/prijava"]);
      return;
    }

    if (sessionStorage['admin'] == "ne") {
      router.navigate(["/pocetna"]);
      return;
    }
  }

  ngOnInit(): void {
    this.dohvatiDnevnickeZapise("?stranica=1");
  }

  primijeniParametre(sortInput: string, pDatumInput: string, zDatumInput: string, pVrijemeInput: string, zVrijemeInput: string) {
    this.parametri = this.pripremiParametre(sortInput, pDatumInput, zDatumInput, pVrijemeInput, zVrijemeInput);
    this.stranica = 1;
    this.dohvatiDnevnickeZapise(`?stranica=1${this.parametri}`);
  }

  dohvatiDnevnickeZapise(parametri: string): void {
    this.dnevnikServis.dohvatiDnevnickeZapise(parametri).then((odgovor: DnevnickiZapisiI | null) => {
      if (odgovor == null) {
        this.dnevnickiZapisi = new Array<DnevnickiZapisI>();
        this.brojZapisa = 0;
        this.zapisiPoStr = 0;
        this.stranica = 1;
        this.brojStranica = 1;
      } else {
        this.dnevnickiZapisi = odgovor.podaci;
        this.brojZapisa = odgovor.broj_zapisa;
        this.zapisiPoStr = parseInt(odgovor.zapisi_po_stranici);
        this.brojStranica = Math.floor(this.brojZapisa/this.zapisiPoStr) + ((this.brojZapisa % this.zapisiPoStr != 0) ? 1 : 0);
      }
    });
  }

  parsirajDatumZaParametar(datum: string): string {
    let datumDijelovi: Array<string> = datum.split("-");
    return `${datumDijelovi[2]}.${datumDijelovi[1]}.${datumDijelovi[0]}`;
  }

  parsirajDatumZaPrikaz(datum: string): string {
    let dijelovi: Array<string> = datum.split(" ");
    return `Dana ${this.parsirajDatumZaParametar(dijelovi[0])} u ${dijelovi[1]}`;
  }

  pripremiParametre(sortInput: string, pDatumInput: string, zDatumInput: string, pVrijemeInput: string, zVrijemeInput: string): string {
    let parametri = "";

    parametri += `&sortiraj=${sortInput != "" ? sortInput : ""}`;

    if (pDatumInput != "") parametri += `&datumOd=${this.parsirajDatumZaParametar(pDatumInput)}`;
    if (zDatumInput != "") parametri += `&datumDo=${this.parsirajDatumZaParametar(zDatumInput)}`;

    if (pVrijemeInput != "") parametri += `&vrijemeOd=${pVrijemeInput}:00`;
    if (zVrijemeInput != "") parametri += `&vrijemeDo=${zVrijemeInput}:00`;
    
    return parametri;
  }

  dohvatiDnevnickeZapiseStranica(stranica: number): void {
    this.stranica = stranica;
    this.dohvatiDnevnickeZapise(`?stranica=${stranica}${this.parametri}`);
  }

  osvjeziParametre() {
    this.stranica = 1;
    this.dohvatiDnevnickeZapise(`?stranica=1`);
  }
}
