export interface SezonaI {
    naziv: string;
    opis: string;
    broj_epizoda: number;
    slika_putanja: string;
    tmdb_id: number;
    id?: number;
    serija_id?: number;
}

export interface SerijaDetaljnoI {
    id?: number;
    tmdb_id: number;
    naziv: string;
    opis: string;
    adresa_putanja: string;
    slika_putanja: string;
    broj_epizoda: number;
    broj_sezona: number;
    popularnost: number;
    sezone: Array<SezonaI>
}