import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritiService } from '../servisi/favoriti.service';
import { SerijaDetaljnoI } from '../sucelja/SerijaDetaljnoI';
import { PrijavaService } from '../servisi/prijava.service';

@Component({
  selector: 'app-favoriti',
  templateUrl: './favoriti.component.html',
  styleUrl: './favoriti.component.scss'
})
export class FavoritiComponent implements OnInit {
  favoriti = new Array<SerijaDetaljnoI>();

  constructor(
    private router: Router,
    private favoritiServis: FavoritiService,
    private prijavaServis: PrijavaService
  ) {
    if (sessionStorage['korime'] == undefined) {
      router.navigate(["/prijava"]);
    }
  }

  ngOnInit(): void {
    this.favoritiServis.dohvatiFavoritePrijavljenogKorisnika().then((favoriti) => {
      if (favoriti == null) {
        this.favoriti = new Array<SerijaDetaljnoI>();
        this.prijavaServis.odjaviKorisnika();
        this.router.navigate(["/prijava"]);
      } else {
        this.favoriti = favoriti;
      }
    });
  }
}
