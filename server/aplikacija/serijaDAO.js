const Baza = require("./baza.js");

class SerijaDAO {
	constructor() {
		this.baza = new Baza("RWA2023dmatijani21.sqlite");
	}

	dajFavoriteKorisnika = async function(korime) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM serija WHERE id IN (SELECT serija_id FROM favorit_serija WHERE korisnik_id IN (SELECT id FROM korisnik WHERE korime = ?));"
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);

		for (let indeks in podaci) {
			sql = "SELECT * FROM sezona WHERE serija_id = ?;";
			let sezone = await this.baza.izvrsiUpit(sql, [podaci[indeks].id]);
			podaci[indeks].sezone = sezone;
		}

		this.baza.zatvoriVezu();
		return podaci;
	}

	dajOdredeniFavorit = async function(korime, idSerije) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM serija WHERE id IN (SELECT serija_id FROM favorit_serija WHERE korisnik_id IN (SELECT id FROM korisnik WHERE korime = ?));"
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);

		let podatak;
		for (let ind in podaci) {
			if (podaci[ind].id == idSerije) {
				podatak = podaci[ind];
			}
		}

		if (podatak != undefined) {
			sql = "SELECT * FROM sezona WHERE serija_id = ?;";
			let sezone = await this.baza.izvrsiUpit(sql, [podatak.id]);
			podatak.sezone = sezone;
		}

		this.baza.zatvoriVezu();
		return podatak;
	}

	dodajSerijuUFavorite = async function(korime, podaciSerije) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT id FROM korisnik WHERE korime = ?";
		let dobivenKorisnik = await this.baza.izvrsiUpit(sql, [korime]);
		if (dobivenKorisnik.length == 0) {
			this.baza.zatvoriVezu();
            throw new Error("Korisnik s tim korisničkim imenom ne postoji.");
		}

		let korisnikId = dobivenKorisnik[0].id;
		
		if (podaciSerije.naziv === undefined
            || podaciSerije.opis === undefined
			|| podaciSerije.broj_sezona === undefined
			|| podaciSerije.broj_epizoda === undefined
			|| podaciSerije.popularnost === undefined
			|| podaciSerije.slika_putanja === undefined
			|| podaciSerije.adresa_putanja === undefined
			|| podaciSerije.tmdb_id === undefined) {
                throw new Error("podaci nisu definirani");
        }

		sql = "SELECT id FROM serija WHERE tmdb_id = ?";
		let dobivenaSerija = await this.baza.izvrsiUpit(sql, [podaciSerije.tmdb_id]);
		if (dobivenaSerija.length == 0) {
			sql = "INSERT INTO serija(naziv, opis, broj_sezona, broj_epizoda, popularnost, slika_putanja, adresa_putanja, tmdb_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
			let podaciZaUpit = [
				podaciSerije.naziv.slice(0, 250),
				podaciSerije.opis,
				podaciSerije.broj_sezona,
				podaciSerije.broj_epizoda,
				podaciSerije.popularnost,
				podaciSerije.slika_putanja,
				podaciSerije.adresa_putanja,
				podaciSerije.tmdb_id
			];
			await this.baza.izvrsiUpit(sql, podaciZaUpit);
			
			sql = "SELECT * FROM serija WHERE tmdb_id = ?;";
			dobivenaSerija = await this.baza.izvrsiUpit(sql, [podaciSerije.tmdb_id]);
			if (dobivenaSerija.length == 0) {
				throw new Error("Greška u dohvaćanju podataka.");
			}
			
			if (podaciSerije.sezone != undefined && podaciSerije.sezone != null) {
				for (let sezona of podaciSerije.sezone) {
					let sqlSezona = "INSERT INTO sezona(naziv, opis, broj_epizoda, slika_putanja, tmdb_id, serija_id) VALUES (?, ?, ?, ?, ?, ?);";

					let podaciZaUpitSezona = [
						sezona.naziv.slice(0, 250),
						sezona.opis,
						sezona.broj_epizoda,
						sezona.slika_putanja,
						sezona.tmdb_id,
						dobivenaSerija[0].id
					];
					await this.baza.izvrsiUpit(sqlSezona, podaciZaUpitSezona);
				}
			}
		}
		
		let serijaId = dobivenaSerija[0].id;

		sql = "SELECT * FROM favorit_serija WHERE korisnik_id = ? AND serija_id = ?";
		let postojiVec = await this.baza.izvrsiUpit(sql, [korisnikId, serijaId]);
		if (postojiVec.length > 0) {
			throw new Error("Serija je već u favoritima.");
		}

		sql = "INSERT INTO favorit_serija VALUES (?, ?);";
		await this.baza.izvrsiUpit(sql, [korisnikId, serijaId]);

		return true;
	}

	ukloniFavorit = async function(korime, idSerije) {
		this.baza.spojiSeNaBazu();
        let sql = "DELETE FROM favorit_serija WHERE serija_id = ? AND korisnik_id IN (SELECT id FROM korisnik WHERE korime = ?);";
		await this.baza.izvrsiUpit(sql, [idSerije, korime]);
		
		sql = "SELECT * FROM favorit_serija WHERE serija_id = ?;";
		let postojeciFavoriti = await this.baza.izvrsiUpit(sql, idSerije);
		if (postojeciFavoriti.length == 0) {
			let sql1 = "DELETE FROM sezona WHERE serija_id = ?;";
			await this.baza.izvrsiUpit(sql1, idSerije);
			let sql2 = "DELETE FROM serija WHERE id = ?;";
			await this.baza.izvrsiUpit(sql2, idSerije);
		}

		this.baza.zatvoriVezu();
		return true;
	}
}

module.exports = SerijaDAO;
