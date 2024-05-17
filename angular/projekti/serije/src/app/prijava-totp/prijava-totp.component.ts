import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrijavaService } from '../servisi/prijava.service';

@Component({
  selector: 'app-prijava-totp',
  templateUrl: './prijava-totp.component.html',
  styleUrl: './prijava-totp.component.scss'
})
export class PrijavaTotpComponent {
  korime: string = "";
  lozinka: string = "";
  porukaGreske: string = "";

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private prijavaServis: PrijavaService
  ) {
    if (sessionStorage['korime'] != undefined) {
      router.navigate(["/pocetna"]);
    }

    activatedRoute.paramMap.subscribe((parametri) => {
      let korimeStr: string | null = parametri.get("korime");
      if (korimeStr == null || korimeStr == undefined) {
        this.router.navigate(["/prijava"]);
        return;
      }

      this.korime = korimeStr;

      let lozinkaStr: string | null = parametri.get("lozinka");
      if (lozinkaStr == null || lozinkaStr == undefined) {
        this.router.navigate(["/prijava"]);
        return;
      }

      this.lozinka = lozinkaStr;
    })
  }

  async prijaviKorisnika(totp: string) {
    if (this.korime == "" || this.lozinka == "") {
      this.router.navigate(["/prijava"]);
      return;
    }

    let poruka: string = await this.prijavaServis.prijaviKorisnika(this.korime, this.lozinka, totp);
    this.porukaGreske = poruka;

    if (poruka == "") {
      this.router.navigate(["/pocetna"]);
    }
  }

  odiNatragNaPrijavu() {
    this.router.navigate(["/prijava"]);
  }
}
