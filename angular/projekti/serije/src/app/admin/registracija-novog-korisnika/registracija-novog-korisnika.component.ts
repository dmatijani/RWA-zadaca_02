import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PrijavaService } from '../../servisi/prijava.service';
import { KorisnikI } from '../../sucelja/KorisnikI';
import { FetchService } from '../../servisi/fetch-servis.service';
import { RecaptchaService } from '../../servisi/recaptcha.service';

@Component({
  selector: 'app-registracija-novog-korisnika',
  templateUrl: './registracija-novog-korisnika.component.html',
  styleUrl: './registracija-novog-korisnika.component.scss'
})
export class RegistracijaNovogKorisnikaComponent {
  porukeGreske: Array<string> = new Array<string>();
  porukaUspjeha: string = "";

  constructor(
    private router: Router,
    private prijavaServis: PrijavaService,
    private fetchServis: FetchService,
    private reCaptchaServis: RecaptchaService
  ) {
    if (sessionStorage['korime'] == undefined) {
      prijavaServis.odjaviKorisnika();
      router.navigate(["/prijava"]);
      return;
    }

    if (sessionStorage['admin'] == undefined) {
      prijavaServis.odjaviKorisnika();
      router.navigate(["/prijava"]);
      return;
    }

    if (sessionStorage['admin'] == "ne") {
      router.navigate(["/pocetna"]);
      return;
    }
  }

  registrirajNovogKorisnika(
    korimeInput: string,
    lozinkaInput: string,
    lozinkaPonovnoInput: string,
    imeInput: string,
    prezimeInput: string,
    emailInput: string,
    telefonInput: string,
    adresaInput: string,
    webStranicaInput: string,
    jeAdminInput: boolean
  ): void {
    this.porukeGreske = new Array<string>();
    this.porukaUspjeha = "";

    if (lozinkaInput != lozinkaPonovnoInput) {
      this.porukeGreske.push("Lozinke se ne podudaraju!");
      return;
    }

    let noviKorisnik: KorisnikI = {
      korime: korimeInput.trim(),
      lozinka: lozinkaInput.trim(),
      ime: imeInput.trim(),
      prezime: prezimeInput.trim(),
      email: emailInput.trim(),
      telefon: telefonInput.trim(),
      adresa: adresaInput.trim(),
      web_stranica: webStranicaInput.trim(),
      administrator_bool: jeAdminInput
    };

    this.porukeGreske = this.provjeriPodatke(noviKorisnik);

    if (this.porukeGreske.length > 0) {
      return;
    }

    this.posaljiKorisnikaNaServer(noviKorisnik);
  }

  provjeriPodatke(novi: KorisnikI): Array<string> {
    let greske = new Array<string>();

    if (novi.email == undefined || novi.email == null) {
      greske.push("Email mora biti unesen!");
    } else {
      if (novi.email.length == 0) {
        greske.push("Email mora biti unesen!");
      } else {
        let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(novi.email)) {
          greske.push("Email nije ispravno napisan!");
        }
      }
      
      if (novi.email.length > 100) {
        greske.push("Email mora imati najviše 100 znakova!");
      }
    }
    
    if (novi.korime == undefined || novi.korime == null) {
      greske.push("Korisničko ime mora biti uneseno!");
    } else {
      if (novi.korime.length == 0) {
        greske.push("Korisničko ime mora biti uneseno!");
      } else {
        let korimeRegex = /^[a-zA-Z0-9_-]*$/;
        if (!korimeRegex.test(novi.korime)) {
          greske.push("Korisničko ime ne smije imati specijalne i dijakritičke znakove te razmake!");
        }
      }

      if (novi.korime.length > 50) {
        greske.push("Korisničko ime mora imati najviše 50 znakova!");
      }
    }

    if (novi.lozinka == null || novi.lozinka == undefined) {
      greske.push("Lozinka mora biti unesena!");
    } else {
      if (novi.lozinka.length == 0) {
        greske.push("Lozinka mora biti unesena!");
      }
      if (novi.lozinka.split(" ").length > 1) {
        greske.push("Lozinka ne smije imati razmake!");
      }    
      if (novi.lozinka.length > 250) {
        greske.push("Lozinka ime mora imati najviše 250 znakova!");
      }
    }
    

    if (novi.ime != undefined && novi.ime != null) {
      if (novi.ime.length > 50) {
        greske.push("Ime mora imati najviše 50 znakova!");
      }
    }
    
    if (novi.prezime != undefined && novi.prezime != null) {
      if (novi.prezime.length > 100) {
        greske.push("Prezime ime mora imati najviše 100 znakova!");
      }
    }
    
    if (novi.telefon != undefined && novi.telefon != null) {
      if (novi.telefon.length > 25) {
        greske.push("Telefon mora imati najviše 25 znakova!");
      }
    }

    if (novi.web_stranica != undefined && novi.web_stranica != null) {
      if (novi.web_stranica.length > 150) {
        greske.push("Web stranica mora imati najviše 150 znakova!");
      }
    }

    return greske;
  }

  async posaljiKorisnikaNaServer(noviKorisnik: KorisnikI) {
    let token: string = await this.reCaptchaServis.dohvatiReCaptchaToken("registracija");

    let podaciZaSlanje = {
      korisnik: noviKorisnik,
      recaptchatoken: token
    }
    this.fetchServis.posaljiPodatke("korisnici", { body: JSON.stringify(podaciZaSlanje) }).then((odgovor) => {
      if (odgovor.status == 201) {
        this.porukaUspjeha = "Uspješno registriran novi korisnik!";
      } else {
        this.porukaUspjeha = "";
        this.porukeGreske = new Array<string>();
        this.porukeGreske.push(odgovor.opis);
      }
    })
  }
}
