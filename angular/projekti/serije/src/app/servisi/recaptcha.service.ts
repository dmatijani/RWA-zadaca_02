import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  reCaptchaKljuc: string = "";

  constructor() {
    fetch(`${environment.fetchUrlBezBaze}recaptchajavnikljuc`)
      .then(odgovor => odgovor.json())
      .then(podaci => {
        this.reCaptchaKljuc = podaci.kljuc;
      })
  }

  async dohvatiReCaptchaToken(radnja: string): Promise<string> {
    return new Promise((res, rej) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(this.reCaptchaKljuc, { action: radnja })
          .then((token: string) => {
            res(token);
          })
          .catch((error: any) => {
            console.error("Error pri dobijanju reCAPTCHA tokena: ", error);
            res("");
          });
      });
    })
  }
}
