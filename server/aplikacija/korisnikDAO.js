const Baza = require("./baza.js");
const kodovi = require("../aplikacija/moduli/kodovi.js");

class KorisnikDAO {
	constructor() {
		this.baza = new Baza("RWA2023dmatijani21.sqlite");
        this.sol = "dfGDFgRET5ErtSDfFhgERtEWRfdERrwedfg2435";
	}

    dajSveKorisnike = async function() {
        this.baza.spojiSeNaBazu();
		let sql = "SELECT k.id, k.korime, k.ime, k.prezime, k.email, k.telefon, k.adresa, k.web_stranica, u.naziv AS uloga "
        sql += "FROM korisnik k "
        sql += "JOIN uloga_korisnika u ON k.uloga_korisnika_id = u.id;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
    }

    dajJednogKorisnika = async function(korime) {
        this.baza.spojiSeNaBazu();
        let sql = "SELECT * FROM korisnik WHERE (korime = ?);"
        var podaci = await this.baza.izvrsiUpit(sql, [korime]);
        this.baza.zatvoriVezu();
        if (podaci.length == 1) {
            podaci[0].lozinka = undefined;
            podaci[0].totp_sifra = undefined;
            return podaci[0];
        }
        else return {};
    }

    dajUloguKorisnika = async function(korime, zatvori = true) {
        this.baza.spojiSeNaBazu();
        let sql = "SELECT naziv FROM uloga_korisnika WHERE id IN (SELECT uloga_korisnika_id FROM korisnik WHERE (korime = ?));"
        var podaci = await this.baza.izvrsiUpit(sql, [korime]);
        if (zatvori) this.baza.zatvoriVezu();
        if (podaci.length == 1) return podaci[0];
        else return {};
    }

    provjeriPostojanjeKorisnika = async function(korime, podaci) {
        if (korime == "" || korime === null || korime === undefined) {
            throw new Error("Korime nije definirano.");
        }
        let lozinka = podaci.lozinka;
        if (korime == "" || lozinka === null || lozinka === undefined) {
            throw new Error("Molimo unijeti lozinku.");
        }
        let korimeUneseno = podaci.korime;

        this.baza.spojiSeNaBazu();
        let sql = "SELECT * FROM korisnik WHERE (korime = ?) AND (lozinka = ?);"
        let vracenKorisnik = await this.baza.izvrsiUpit(sql, [korimeUneseno, kodovi.kreirajSHA256(lozinka, this.sol)]);
        this.baza.zatvoriVezu();
        if (vracenKorisnik.length == 1) return vracenKorisnik[0];
        else return {};
    }

    dodajNovogKorisnika = async function(noviKorisnik) {
        if (noviKorisnik.korime === undefined || noviKorisnik.korime === null
            || noviKorisnik.lozinka === undefined || noviKorisnik.lozinka === null
            || noviKorisnik.email === undefined || noviKorisnik.email === null) {
                throw new Error("podaci nisu definirani");
        }

        this.baza.spojiSeNaBazu();
        let postojiKorisnikKorime = await this.baza.izvrsiUpit("SELECT * FROM korisnik WHERE korime = ?;", [noviKorisnik.korime]);
        if (postojiKorisnikKorime.length > 0) {
            this.baza.zatvoriVezu();
            throw new Error("Korisnik s tim korisničkim imenom već postoji!");
        }

        let postojiKorisnikEmail = await this.baza.izvrsiUpit("SELECT * FROM korisnik WHERE email = ?;", [noviKorisnik.email]);
        if (postojiKorisnikEmail.length > 0) {
            this.baza.zatvoriVezu();
            throw new Error("Korisnik s tom email adresom već postoji!");
        }

        if (noviKorisnik.uloga_korisnika_id == undefined || noviKorisnik.uloga_korisnika_id == null) {
            let sqlUloga = "SELECT id FROM uloga_korisnika WHERE naziv = 'obican korisnik';"
            if (noviKorisnik.administrator_bool != undefined && noviKorisnik.administrator_bool != null) {
                if (typeof noviKorisnik.administrator_bool == "boolean" && noviKorisnik.administrator_bool) {
                    sqlUloga = "SELECT id FROM uloga_korisnika WHERE naziv = 'administrator';";
                }
            }

            let dobiveneUloge = await this.baza.izvrsiUpit(sqlUloga, []);
            if (dobiveneUloge.length != 1) {
                this.baza.zatvoriVezu();
                throw new Error("Uloga ne postoji.");
            } else {
                noviKorisnik.uloga_korisnika_id = dobiveneUloge[0].id;
            }
        }

        let sql = "INSERT INTO korisnik(korime, lozinka, ime, prezime, email, telefon, adresa, web_stranica, uloga_korisnika_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
        let podaci = [
            noviKorisnik.korime.trim().slice(0, 50),
            kodovi.kreirajSHA256(noviKorisnik.lozinka.trim(), this.sol),
            noviKorisnik.ime || null,
            noviKorisnik.prezime || null,
            noviKorisnik.email || null,
            noviKorisnik.telefon || null,
            noviKorisnik.adresa || null,
            noviKorisnik.web_stranica || null,
            noviKorisnik.uloga_korisnika_id
        ];
        await this.baza.izvrsiUpit(sql, podaci);
        this.baza.zatvoriVezu();
        return true;
    }

    azurirajKorisnika = async function(korime, korisnik) {
        if (korisnik.ime === undefined 
            || korisnik.prezime === undefined
            || korisnik.telefon === undefined
            || korisnik.adresa === undefined
            || korisnik.web_stranica === undefined) {
                throw new Error("podaci nisu definirani");
        }

        if (korisnik.ime.trim() == "") korisnik.ime = null; else korisnik.ime = korisnik.ime.trim();
        if (korisnik.prezime.trim() == "") korisnik.prezime = null; else korisnik.prezime = korisnik.prezime.trim();
        if (korisnik.telefon.trim() == "") korisnik.telefon = null; else korisnik.telefon = korisnik.telefon.trim();
        if (korisnik.adresa.trim() == "") korisnik.adresa = null; else korisnik.adresa = korisnik.adresa.trim();
        if (korisnik.web_stranica.trim() == "") korisnik.web_stranica = null; else korisnik.web_stranica = korisnik.web_stranica.trim();

        this.baza.spojiSeNaBazu();
        let postojiKorisnik = await this.baza.izvrsiUpit("SELECT * FROM korisnik WHERE korime = ?;", [korime]);
        if (postojiKorisnik.length == 0) {
            this.baza.zatvoriVezu();
            throw new Error("Korisnik s tim korisničkim imenom ne postoji!");
        }

        let sql = "UPDATE korisnik SET ime = ?, prezime = ?, telefon = ?, adresa = ?, web_stranica = ?, dvorazinska_autentifikacija = ? WHERE korime = ?;";
        let podaci = [korisnik.ime, korisnik.prezime, korisnik.telefon, korisnik.adresa, korisnik.web_stranica, korisnik.dvorazinska_autentifikacija, korime];
        await this.baza.izvrsiUpit(sql, podaci);

        if ((postojiKorisnik[0].dvorazinska_autentifikacija == null || postojiKorisnik[0].dvorazinska_autentifikacija == false) && korisnik.dvorazinska_autentifikacija == true && postojiKorisnik[0].totp_sifra == null) {
            let generiranaSifra = kodovi.kreirajTajniKljuc(korime);
            let sqlTotp = "UPDATE korisnik SET totp_sifra = ? WHERE korime = ?;";
            await this.baza.izvrsiUpit(sqlTotp, [generiranaSifra, korime]);

            this.baza.zatvoriVezu();
            return generiranaSifra;
        }

        this.baza.zatvoriVezu();
        return "izvrseno";
    }

    izbrisiKorisnika = async function(korime) {
        this.baza.spojiSeNaBazu();
        let postojiKorisnik = await this.baza.izvrsiUpit("SELECT * FROM korisnik WHERE korime = ?;", [korime]);
        if (postojiKorisnik.length == 0) {
            this.baza.zatvoriVezu();
            throw new Error("Korisnik s tim korisničkim imenom ne postoji!");
        }
        let uloga = this.dajUloguKorisnika(postojiKorisnik.korime, false);
        if (uloga.naziv == "administrator") {
            throw new Error("Korisnik je administrator i ne može se obrisati.");
        }

        let sql = "DELETE FROM korisnik WHERE korime = ?;";
		await this.baza.izvrsiUpit(sql,[korime]);

		return true;
    }
}

module.exports = KorisnikDAO;
