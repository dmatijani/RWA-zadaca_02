import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
  fetchUrl: string = environment.fetchUrl;

  constructor() { }

  async dohvatiPodatke(putanja: string, metoda = "GET", potrebanJwt = true, ispravanStatus = 200) {
    let fetchParametri: RequestInit = {
      credentials: "include",
      method: metoda
    };

    if (potrebanJwt) {
      let odgovor = (await fetch(`${environment.fetchUrl}korisnici/${sessionStorage['korime']}/prijava`, {
        method: "GET",
        credentials: "include"
      })) as Response;
      if (odgovor.status != 201) {
        return null;
      }

      let token = odgovor.headers.get("authorization");
      if (token == "" || token == null || token == undefined) {
        return null;
      }

      let zaglavlje = new Headers();
      zaglavlje.set("Content-Type", "application/json");
      zaglavlje.set("Authorization", `Bearer ${token.split(" ")[1]}`);

      fetchParametri.headers = zaglavlje;
    }

    let odgovor = (await fetch(this.fetchUrl + putanja, fetchParametri as RequestInit)) as Response;

    if (odgovor.status != ispravanStatus) {
      return null;
    }

    return JSON.parse(await odgovor.text());
  }

  async posaljiPodatke(putanja: string, parametri: RequestInit, metoda = "POST", potrebanJwt = true, ispravanStatus = 201) {
    if (potrebanJwt) {
      let odgovor = (await fetch(`${environment.fetchUrl}korisnici/${sessionStorage['korime']}/prijava`, {
        method: "GET",
        credentials: "include"
      })) as Response;
      if (odgovor.status != 201) {
        return {
          opis: "JWT nije prošao",
          status: odgovor.status
        };
      }

      let token = odgovor.headers.get("authorization");
      if (token == "" || token == null || token == undefined) {
        return {
          opis: "JWT nije prošao",
          status: odgovor.status
        };
      }

      let zaglavlje = new Headers();
      zaglavlje.set("Content-Type", "application/json");
      zaglavlje.set("Authorization", `Bearer ${token.split(" ")[1]}`);

      parametri.headers = zaglavlje;
    }

    parametri.credentials = "include";
    parametri.method = metoda;

    let odgovor = (await fetch(this.fetchUrl + putanja, parametri as RequestInit)) as Response;

    let odgovorZaVratiti = JSON.parse(await odgovor.text());
    odgovorZaVratiti.status = odgovor.status;
    odgovorZaVratiti.headers = odgovor.headers;

    return odgovorZaVratiti;
  }
}
