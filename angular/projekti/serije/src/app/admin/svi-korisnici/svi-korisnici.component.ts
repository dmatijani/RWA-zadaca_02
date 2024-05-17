import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KorisniciService } from '../../servisi/korisnici.service';
import { KorisnikI } from '../../sucelja/KorisnikI';
import { PrijavaService } from '../../servisi/prijava.service';

@Component({
  selector: 'app-svi-korisnici',
  templateUrl: './svi-korisnici.component.html',
  styleUrl: './svi-korisnici.component.scss'
})
export class SviKorisniciComponent implements OnInit {
  korisnici!: Array<KorisnikI> | null;

  constructor(
    private router: Router,
    private korisniciServis: KorisniciService,
    private prijavaServis: PrijavaService
  ) {
    if (sessionStorage['korime'] == undefined) {
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
    this.dohvatiKorisnike();
  }

  dohvatiKorisnike(): void {
    this.korisniciServis.dohvatiSveKorisnike().then((korisnici) => {
      if (korisnici == null) {
        this.router.navigate(["/prijava"]);
      } else {
        
        this.prikaziKorisnike(korisnici);
      }
    });
  }

  prikaziKorisnike(korisnici: Array<KorisnikI>): void {
    this.korisnici = korisnici;
    console.log(this.korisnici);
  }

  obrisiKorisnika(korime: string | undefined) {
    if (korime == undefined) {
      return;
    }
    
    this.korisniciServis.obrisiKorisnika(korime).then((odgovor) => {
      if (odgovor.status == 201) {
        this.dohvatiKorisnike();
      }
    });
  }
}
