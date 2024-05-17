import { Injectable } from '@angular/core';
import { FetchService } from './fetch-servis.service';

@Injectable({
  providedIn: 'root'
})
export class DnevnikService {
  constructor(private fetchServis: FetchService) { }

  dohvatiDnevnickeZapise(parametri: string = "?stranica=1"): any {
    return this.fetchServis.dohvatiPodatke(`dnevnik${parametri}`);
  }
}
