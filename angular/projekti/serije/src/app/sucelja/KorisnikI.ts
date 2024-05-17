export interface KorisnikI {
    adresa?: string | null;
    email?: string;
    id?: number;
    ime?: string | null;
    lozinka?: string | null;
    korime?: string;
    prezime?: string | null;
    telefon?: string | null;
    uloga?: string | null;
    uloga_korisnika_id?: number;
    web_stranica?: string | null;
    administrator_bool?: boolean | null;
    dvorazinska_autentifikacija?: boolean | null;
    totp_sifra?: string | null;
}