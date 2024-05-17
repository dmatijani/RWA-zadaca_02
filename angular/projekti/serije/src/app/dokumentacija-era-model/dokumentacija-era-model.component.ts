import { Component, DoCheck } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dokumentacija-era-model',
  templateUrl: './dokumentacija-era-model.component.html',
  styleUrl: './dokumentacija-era-model.component.scss'
})
export class DokumentacijaEraModelComponent implements DoCheck {
  era_slika_putanja?: string;

  constructor(private router: Router) { }

  ngDoCheck(): void {
    this.era_slika_putanja = environment.fetchUrlBezBaze + "ERAmodel";
  }

  odiNaDokumentaciju(): void {
    this.router.navigate(["/dokumentacija"]);
  }
}
