export interface SerijeTmdbI {
    rezultati: Array<SerijaTmdbI>;
    broj_rezultata: number;
    broj_stranica: number;
    zapisi_po_stranici: string;
    stranica: number;
    opis?: string;
}

export interface SerijaTmdbI {
    adult: boolean;
    backdrop_path: string;
    genre_ids: Array<number>;
    id: number;
    origin_country: Array<string>;
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    first_air_date: string;
    name: string;
    vote_average: number;
    vote_count: number;
}