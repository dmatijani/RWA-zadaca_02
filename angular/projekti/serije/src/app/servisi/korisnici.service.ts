import { Injectable } from '@angular/core';
import { FetchService } from './fetch-servis.service';
import { KorisnikI } from '../sucelja/KorisnikI';

@Injectable({
  providedIn: 'root'
})
export class KorisniciService {
  constructor(private fetchServis: FetchService) { }

  dohvatiSveKorisnike(): Promise<Array<KorisnikI> | null> {
    return this.fetchServis.dohvatiPodatke("korisnici");
  }

  async obrisiKorisnika(korime: string): Promise<any> {
    if (sessionStorage['korime'] == undefined) return Promise.resolve(null);
    if (sessionStorage['admin'] == undefined) return Promise.resolve(null);
    if (sessionStorage['admin'] == "ne") return Promise.resolve(null);

    return this.fetchServis.posaljiPodatke(`korisnici/${korime}`, {}, "DELETE");
  }
}
