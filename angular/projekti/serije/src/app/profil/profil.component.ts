import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FetchService } from '../servisi/fetch-servis.service';
import { KorisnikI } from '../sucelja/KorisnikI';
import { PrijavaService } from '../servisi/prijava.service';
import { RecaptchaService } from '../servisi/recaptcha.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit {
  korime: string = "";
  ime: string = "";
  prezime: string = "";
  email: string = "";
  telefon: string = "";
  adresa: string = "";
  web_stranica: string = "";
  dvorazinska_autentifikacija: boolean = false;

  porukaGreske: string = "";
  tajniKljuc: string = "";

  constructor(
    private router: Router,
    private fetchServis: FetchService,
    private prijavaServis: PrijavaService,
    private reCaptchaServis: RecaptchaService
  ) {
    if (sessionStorage['korime'] == undefined) {
      router.navigate(["/prijava"]);
    } else {
      this.korime = sessionStorage['korime'];
    }
  }

  ngOnInit(): void {
    this.dohvatiPodatke(this.korime);
  }

  dohvatiPodatke(korime: string): void {
    this.fetchServis.dohvatiPodatke(`korisnici/${korime}`).then((podaci: KorisnikI | null) => {
      if (podaci == null) {
        this.prijavaServis.odjaviKorisnika();
        this.router.navigate(["/prijava"]);
      } else {
        this.ucitajKorisnickePodatke(podaci);
      }
    });
  }

  ucitajKorisnickePodatke(korisnik: KorisnikI): void {
    if (korisnik.ime != undefined) {
      this.ime = korisnik.ime;
    } else {
      this.ime = "";
    }

    if (korisnik.prezime != undefined) {
      this.prezime = korisnik.prezime;
    } else {
      this.prezime = "";
    }

    if (korisnik.email != undefined) {
      this.email = korisnik.email;
    }

    if (korisnik.telefon != undefined && korisnik.telefon != null) {
      this.telefon = korisnik.telefon;
    } else {
      this.telefon = "";
    }

    if (korisnik.adresa != undefined && korisnik.adresa != null) {
      this.adresa = korisnik.adresa;
    } else {
      this.adresa = "";
    }

    if (korisnik.web_stranica != undefined && korisnik.web_stranica != null) {
      this.web_stranica = korisnik.web_stranica;
    } else {
      this.web_stranica = "";
    }

    if (korisnik.dvorazinska_autentifikacija != undefined && korisnik.dvorazinska_autentifikacija != null) {
      this.dvorazinska_autentifikacija = korisnik.dvorazinska_autentifikacija;
    } else {
      this.dvorazinska_autentifikacija = false;
    }
  }

  async posaljiPodatkeZaAzuriranje(imeNovo: string, prezimeNovo: string, telefonNovi: string, adresaNova: string, webStranicaNova: string, dvorazinskaNovaInput: boolean) {
    let noviPodaciKorisnika: KorisnikI = {
      ime: imeNovo,
      prezime: prezimeNovo,
      telefon: telefonNovi,
      adresa: adresaNova,
      web_stranica: webStranicaNova,
      dvorazinska_autentifikacija: dvorazinskaNovaInput
    }

    this.porukaGreske = this.provjeriNovePodatke(noviPodaciKorisnika);
    if (this.porukaGreske != "") {
      return;
    }

    let token: string = await this.reCaptchaServis.dohvatiReCaptchaToken("azuriranje_profila");

    let podaciZaAzuriranje = {
      korisnik: noviPodaciKorisnika,
      recaptchatoken: token
    }

    this.fetchServis.posaljiPodatke(
      `korisnici/${this.korime}`,
      { body: JSON.stringify(podaciZaAzuriranje), },
      "PUT"
    ).then((odgovor) => {
      if (odgovor.status != 201) {
        this.porukaGreske = odgovor.opis;
      } else {
        if (odgovor.tajniKljuc != undefined) {
          this.tajniKljuc = odgovor.tajniKljuc;
        } else {
          this.tajniKljuc = "";
        }
        this.dohvatiPodatke(this.korime);
      }
    });
  }

  provjeriNovePodatke(novi: KorisnikI): string {
    let greske = "";

    if (novi.ime != null && novi.ime != undefined) {
      if (novi.ime.length > 50) {
        if (greske != "") greske += "\n";
        greske += "Ime mora imati najviše 50 znakova!";
      };
    }
    
    if (novi.prezime != null && novi.prezime != undefined) {
      if (novi.prezime.length > 100) {
        if (greske != "") greske += "\n";
        greske += "Prezime ime mora imati najviše 100 znakova!";
      };
    }

    if (novi.telefon != null && novi.telefon != undefined) {
      if (novi.telefon.length > 25) {
        if (greske != "") greske += "\n";
        greske += "Telefon mora imati najviše 25 znakova!";
      };
    }

    if (novi.web_stranica != null && novi.web_stranica != undefined) {
      if (novi.web_stranica.length > 150) {
        if (greske != "") greske += "\n";
        greske += "Web stranica mora imati najviše 150 znakova!";
      };
    }

    return greske;
}

}
