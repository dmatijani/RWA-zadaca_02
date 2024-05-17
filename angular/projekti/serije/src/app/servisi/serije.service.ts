import { Injectable } from '@angular/core';
import { SerijeTmdbI } from '../sucelja/SerijeTmdbI';
import { SerijaI } from '../sucelja/SerijaI';
import { FetchService } from './fetch-servis.service';
import { SerijaDetaljnoTmdbI } from '../sucelja/SerijaDetaljnoTmdbI';
import { SerijaDetaljnoI, SezonaI } from '../sucelja/SerijaDetaljnoI';

@Injectable({
  providedIn: 'root'
})
export class SerijeService {
  dohvaceneSerije?: SerijeTmdbI;
  dohvaceniDetalji!: SerijaDetaljnoTmdbI | null;
  serije = new Array<SerijaI>();
  detalji!: SerijaDetaljnoI | null;

  constructor(private fetchServis: FetchService) { }

  async ucitajSerije(stranica: number, kljucnaRijec: string) {
    let parametarStranica = `?str=${stranica}`;
    let url = `serije_pretrazivanje/${kljucnaRijec}${parametarStranica}`;

    let rezultat = await this.fetchServis.dohvatiPodatke(url) as SerijeTmdbI;
    if (rezultat != null) {
      if (rezultat.opis != undefined) {
        return null;
      } else {
        this.dohvaceneSerije = rezultat;
        this.dajSerije();
      }
      
    } else {
      this.serije = new Array<SerijaI>();
      return null;
    }

    return {
      serije: this.serije,
      broj_rezultata: rezultat.broj_rezultata,
      broj_stranica: rezultat.broj_stranica,
      zapisi_po_stranici: parseInt(rezultat.zapisi_po_stranici)
    };
  }

  dajSerije(): Array<SerijaI> {
    if (this.dohvaceneSerije == undefined) {
      return new Array<SerijaI>();
    } else if (this.dohvaceneSerije.rezultati.length == 0) {
      return new Array<SerijaI>();
    } else {
      this.serije = new Array<SerijaI>();
      for (let dohvSerija of this.dohvaceneSerije.rezultati) {
        let serija: SerijaI = {
          id: dohvSerija.id,
          naziv: dohvSerija.name,
          opis: dohvSerija.overview
        };

        this.serije.push(serija);
      }

      return this.serije;
    }
  }

  async ucitajDetaljeSerije(id: number) {
    let url = `detalji_serije/${id}`;
    let rezultat = await this.fetchServis.dohvatiPodatke(url) as SerijaDetaljnoTmdbI | null;
    if (rezultat == null) {
      return null;
    }
    
    this.dohvaceniDetalji = rezultat;
    this.dajDetaljeSerije();
    return this.detalji;
  }

  dajDetaljeSerije(): SerijaDetaljnoI | null {
    if (this.dohvaceniDetalji == undefined) {
      return null;
    }

    let serijaDetaljno: SerijaDetaljnoI = {
      tmdb_id: this.dohvaceniDetalji.id,
      naziv: this.dohvaceniDetalji.name,
      opis: this.dohvaceniDetalji.overview,
      adresa_putanja: this.dohvaceniDetalji.homepage,
      slika_putanja: this.dohvaceniDetalji.poster_path,
      broj_epizoda: this.dohvaceniDetalji.number_of_episodes,
      broj_sezona: this.dohvaceniDetalji.number_of_seasons,
      popularnost: this.dohvaceniDetalji.popularity,
      sezone: new Array<SezonaI>()
    }

    for (let sezonaTmdb of this.dohvaceniDetalji.seasons) {
      let novaSezona: SezonaI = {
        naziv: sezonaTmdb.name,
        opis: sezonaTmdb.overview,
        broj_epizoda: sezonaTmdb.episode_count,
        slika_putanja: sezonaTmdb.poster_path,
        tmdb_id: sezonaTmdb.id
      };
      serijaDetaljno.sezone.push(novaSezona);
    }

    this.detalji = serijaDetaljno;
    return this.detalji;
  }
}
