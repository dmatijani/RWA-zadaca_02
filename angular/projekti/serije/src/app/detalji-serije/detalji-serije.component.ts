import {
  DoCheck,
  Input,
  SimpleChanges
} from '@angular/core';
import { Component } from '@angular/core';
import { SerijeService } from '../servisi/serije.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SerijaDetaljnoI } from '../sucelja/SerijaDetaljnoI';
import { environment } from '../../environments/environment';
import { FetchService } from '../servisi/fetch-servis.service';

@Component({
  selector: 'app-detalji-serije',
  templateUrl: './detalji-serije.component.html',
  styleUrl: './detalji-serije.component.scss'
})
export class DetaljiSerijeComponent implements DoCheck {
  @Input() serija: SerijaDetaljnoI | null = null;
  idSerije!: number;
  naziv?: string;
  opis?: string;
  pocetna_putanja?: string;
  slika_putanja?: string;
  broj_epizoda?: number;
  broj_sezona?: number;
  popularnost?: number;
  porukaGreske: string = "";
  porukaUspjeha: string = "";

  constructor(
    private serijeServis: SerijeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fetchServis: FetchService
  ) {
    if (sessionStorage['korime'] == undefined) {
      router.navigate(["/prijava"]);
    }

    activatedRoute.paramMap.subscribe((parametri) => {
      let dobiveniId = parametri.get('id');

      if (dobiveniId != null) {
        this.idSerije = parseInt(dobiveniId);

        serijeServis.ucitajDetaljeSerije(this.idSerije).then((odgovor: SerijaDetaljnoI | null) => {
          if (odgovor == null) {
            this.router.navigate(["/prijava"]);
          } else {
            this.serija = odgovor;
            this.ucitajPodatkeSerije();
          }
        });
      } else {
        this.router.navigate(["/prijava"]);
      }
    });
  }

  ngDoCheck(): void {
    if (this.serija != null) {
      this.slika_putanja = environment.posterPath + this.serija.slika_putanja;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (let nazivAtributa in changes) {
      if (nazivAtributa == 'serija') {
        if (this.serija == null) return;
        else this.ucitajPodatkeSerije();
      }
    }
  }

  ucitajPodatkeSerije(): void {
    this.naziv = this.serija?.naziv;
    this.opis = this.serija?.opis;
    this.pocetna_putanja = this.serija?.adresa_putanja;
    this.broj_epizoda = this.serija?.broj_epizoda;
    this.broj_sezona = this.serija?.broj_sezona;
    this.popularnost = this.serija?.popularnost;
  }

  async dodajSerijuUFavorite() {
    let odgovor = (await this.fetchServis.posaljiPodatke("favoriti", { body: JSON.stringify(this.serija) }));
    
    if (odgovor.status != 201) {
      this.porukaGreske = odgovor.opis;
      this.porukaUspjeha = "";
    } else {
      this.porukaGreske = "";
      this.porukaUspjeha = "Serija uspješno dodana u favorite.";
    }
  }

  postojiPrijava(): boolean {
    return (sessionStorage['korime'] != undefined);
  }
}
