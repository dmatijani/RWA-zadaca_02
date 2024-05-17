import { EventEmitter, Injectable, Output } from '@angular/core';
import { FetchService } from './fetch-servis.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { RecaptchaService } from './recaptcha.service';

@Injectable({
  providedIn: 'root'
})
export class PrijavaService {
  @Output() uspjesnaPrijava: EventEmitter<string> = new EventEmitter();

  constructor(
    private fetchServis: FetchService,
    private router: Router,
    private reCaptchaServis: RecaptchaService
  ) { }

  async prijaviKorisnika(korime: string, lozinka: string, totp: string = ""): Promise<string> {
    let porukaGreske = this.unosIspravan(korime, lozinka);
    if (porukaGreske != "") {
      return Promise.resolve(porukaGreske);
    }

    return this.posaljiZahtjevZaPrijavu(korime, lozinka, totp);
  }

  unosIspravan(korime: string, lozinka: string): string {
    let porukaGreske = "";

    if (korime == "") {
      porukaGreske += "Nije uneseno korisničko ime.";
    }
    if (lozinka == "") {
      if (porukaGreske != "") {
        porukaGreske += "\n";
      }
      porukaGreske += "Nije unesena lozinka.";
    }

    return porukaGreske;
  }

  async posaljiZahtjevZaPrijavu(korime: string, lozinka: string, totp: string = ""): Promise<string> {
    let token: string = await this.reCaptchaServis.dohvatiReCaptchaToken("prijava");

    let tijelo: any = {
      korime: korime,
      lozinka: lozinka,
      recaptchatoken: token
    }

    if (totp != "") {
      tijelo.totp = totp;
    }
    
    let zaglavlje: Headers = new Headers();
    zaglavlje.set("Content-Type", "application/json");
    let parametri = {
      method: "POST",
      body: JSON.stringify(tijelo),
      headers: zaglavlje
    }
    
    let odgovor = await this.fetchServis.posaljiPodatke(`korisnici/${korime}/prijava`, parametri, "POST", false);
    
    if (odgovor.status != 201) {
      if (odgovor.status == 403) {
        this.router.navigate(["/prijava/totp", {korime: tijelo.korime, lozinka: tijelo.lozinka}]);
      }
      return Promise.resolve(odgovor.opis);
    }

    this.pohraniPrijavljenogKorisnika(korime, odgovor.headers.get("authorization"));

    return Promise.resolve("");
  }

  pohraniPrijavljenogKorisnika(korime: string, admin: string) {
    sessionStorage['korime'] = korime;
    sessionStorage['admin'] = admin;
    this.uspjesnaPrijava.emit(korime);
  }

  async odjaviKorisnika() {
    let odgovor = await fetch(`${environment.fetchUrlBezBaze}odjava`, {
      method: "GET",
      credentials: "include"
    }) as Response;

    if (odgovor.status == 201) {
      this.ukloniPrijavljenogKorisnika();
      this.router.navigate(["/prijava"]);
      return;
    }
  }

  ukloniPrijavljenogKorisnika() {
    sessionStorage.removeItem('korime');
    sessionStorage.removeItem('admin');
    this.uspjesnaPrijava.emit("");
  }
}
