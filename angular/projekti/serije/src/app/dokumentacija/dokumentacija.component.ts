import { Component, DoCheck } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dokumentacija',
  templateUrl: './dokumentacija.component.html',
  styleUrl: './dokumentacija.component.scss'
})
export class DokumentacijaComponent implements DoCheck {
  era_slika_putanja?: string;

  constructor(private router: Router) { }

  ngDoCheck(): void {
    this.era_slika_putanja = environment.fetchUrlBezBaze + "ERAmodel";
  }

  odiNaSliku(): void {
    this.router.navigate(["/dokumentacija-era-model"]);
  }
}
