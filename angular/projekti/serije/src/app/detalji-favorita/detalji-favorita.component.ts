import { Component, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FavoritiService } from '../servisi/favoriti.service';
import { SerijaDetaljnoI, SezonaI } from '../sucelja/SerijaDetaljnoI';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-detalji-favorita',
  templateUrl: './detalji-favorita.component.html',
  styleUrl: './detalji-favorita.component.scss'
})
export class DetaljiFavoritaComponent {
  favorit: SerijaDetaljnoI | null = null;
  idFavorita!: number;
  naziv?: string;
  opis?: string;
  pocetna_putanja?: string;
  slika_putanja?: string;
  broj_epizoda?: number;
  broj_sezona?: number;
  popularnost?: number;
  sezone?: Array<SezonaI>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private favoritiServis: FavoritiService
  ) {
    if (sessionStorage['korime'] == undefined) {
      router.navigate(["/prijava"]);
    }

    activatedRoute.paramMap.subscribe((parametri) => {
      let dobiveniId = parametri.get('id');

      if (dobiveniId != null) {
        this.idFavorita = parseInt(dobiveniId);

        this.favoritiServis.dohvatiDetaljeFavorita(parseInt(dobiveniId)).then((favorit) => {
          if (favorit == null) {
            this.favorit = null;
            this.router.navigate(["/favoriti"]);
          } else {
            this.favorit = favorit;
            this.ucitajPodatkeFavorita();
          }
        });
      } else {
        this.router.navigate(["/favoriti"]);
      }
    });
  }

  ngDoCheck(): void {
    if (this.favorit != null) {
      this.slika_putanja = environment.posterPath + this.favorit.slika_putanja;
      this.sezone = this.favorit.sezone;
      for (let s of this.sezone) {
        if (s.slika_putanja != null && s.slika_putanja != undefined) {
          s.slika_putanja = environment.posterPath + s.slika_putanja;
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (let nazivAtributa in changes) {
      if (nazivAtributa == 'favorit') {
        if (this.favorit == null) return;
        else this.ucitajPodatkeFavorita();
      }
    }
  }

  ucitajPodatkeFavorita(): void {
    this.naziv = this.favorit?.naziv;
    this.opis = this.favorit?.opis;
    this.pocetna_putanja = this.favorit?.adresa_putanja;
    this.broj_epizoda = this.favorit?.broj_epizoda;
    this.broj_sezona = this.favorit?.broj_sezona;
    this.popularnost = this.favorit?.popularnost;
  }

  ukloniSerijuIzFavorita(): void {
    if (this.idFavorita == null) return;
    this.favoritiServis.ukloniSerijuIzFavorita(this.idFavorita).then((odgovor) => {
      if (odgovor.status == 201) {
        console.log(odgovor);
        this.router.navigate(["/favoriti"]);
      }
    });
  }
}
