import { Injectable } from '@angular/core';
import { FetchService } from './fetch-servis.service';
import { SerijaDetaljnoI } from '../sucelja/SerijaDetaljnoI';

@Injectable({
  providedIn: 'root'
})
export class FavoritiService {
  constructor(private fetchServis: FetchService) { }

  async dohvatiFavoritePrijavljenogKorisnika(): Promise<Array<SerijaDetaljnoI> | null> {
    if (sessionStorage['korime'] == undefined) return Promise.resolve(null);

    return this.fetchServis.dohvatiPodatke("favoriti");
  }

  async dohvatiDetaljeFavorita(id: number): Promise<SerijaDetaljnoI | null> {
    if (sessionStorage['korime'] == undefined) return Promise.resolve(null);

    return this.fetchServis.dohvatiPodatke(`favoriti/${id}`);
  }

  async ukloniSerijuIzFavorita(id: number): Promise<any> {
    if (sessionStorage['korime'] == undefined) return Promise.resolve(null);

    return this.fetchServis.posaljiPodatke(`favoriti/${id}`, {}, "DELETE");
  }
}
