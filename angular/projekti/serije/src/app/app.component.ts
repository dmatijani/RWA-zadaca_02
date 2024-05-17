import { Component, OnInit } from '@angular/core';
import { PrijavaService } from './servisi/prijava.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'serije';
  putanja = 'popis';
  korime: string = "";

  constructor(private prijavaServis: PrijavaService) { }

  ngOnInit() {
    this.prijavaServis.uspjesnaPrijava.subscribe((novoKorime) => {
      this.korime = novoKorime;
    });

    if (this.korime == "" && sessionStorage['korime'] != undefined) {
      if (sessionStorage['korime'] != "") {
        this.korime = sessionStorage['korime'];
      }
    }
  }

  prebaciNa(putanja: string) {
    this.putanja = putanja;
  }

  postojiPrijava(): boolean {
    return (sessionStorage['korime'] != undefined);
  }

  odjaviKorisnika(): void {
    this.prijavaServis.odjaviKorisnika();
  }

  korisnikAdmin(): boolean {
    return (sessionStorage['admin'] == "da");
  }
}
