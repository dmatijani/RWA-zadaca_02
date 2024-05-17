export interface DnevnickiZapisI {
    id: number;
    korime: string;
    datum_i_vrijeme: string;
    resurs: string;
    tijelo: string | null;
    vrsta_zahtjeva: string;
}

export interface DnevnickiZapisiI {
    broj_zapisa: number;
    podaci: Array<DnevnickiZapisI>;
    zapisi_po_stranici: string;
}