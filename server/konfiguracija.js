const ds = require("fs/promises");

class Konfiguracija {
	constructor() {
		this.konf = {};
		this.potrebneVrijednosti = {
			jwtValjanost: {
				tip: "broj",
				min: 15,
				maks: 3600
			},
			jwtTajniKljuc: {
				tip: "tekst",
				min: 50,
				maks: 100,
				regex: /^[A-Za-z0-9]+$/
			},
			tajniKljucSesija: {
				tip: "tekst",
				min: 50,
				maks: 100,
				regex: /^[A-Za-z0-9]+$/
			},
			appStranicenje: {
				tip: "broj",
				min: 5,
				maks: 100
			},
			tmdbApiKeyV3: {},
			tmdbApiKeyV4: {},
			reCaptchaTajniKljuc: {
				tip: "tekst",
				min: 10,
				maks: 100,
				regex: /(.*)/
			},
			reCaptchaJavniKljuc: {
				tip: "tekst",
				min: 10,
				maks: 100,
				regex: /(.*)/
			}
		};
	}

	dajKonf() {
		return this.konf;
	}

	async ucitajKonfiguraciju() {
		if (process.argv.length == 2) {
			throw new Error("Niste unijeli konfiguracijsku datoteku!");
		}
		
		if (process.argv.length > 3) {
			throw new Error("Previše parametara!");
		}

		let podaci = await ds.readFile(process.argv[2], "UTF-8");
		let podaciJson = pretvoriJSONkonfig(podaci);

		let podaciKojiNedostaju = provjeriPostojanjePodataka(podaciJson, this.potrebneVrijednosti);
		let kriveVrijednostiPodataka = provjeriVrijednostiPodataka(podaciJson, this.potrebneVrijednosti);
		if (kriveVrijednostiPodataka.length > 0 || podaciKojiNedostaju.length > 0) {
			let nabrojaniPodaci = "";
			for (let imePodatka of podaciKojiNedostaju) {
				nabrojaniPodaci += imePodatka + " ne postoji";
				nabrojaniPodaci += ", ";
			}
			for (let poruka of kriveVrijednostiPodataka) {
				nabrojaniPodaci += poruka;
				nabrojaniPodaci += ", ";
			}
			nabrojaniPodaci = nabrojaniPodaci.slice(0, nabrojaniPodaci.length-2);
			throw new Error("Postoje problemi s određenim parametrima: " + nabrojaniPodaci); 
		}

		this.konf = podaciJson;
	}
}

function pretvoriJSONkonfig(podaci) {
	let konfJson = {};
	var nizPodataka = podaci.split("\n");
	for (let podatak of nizPodataka) {
		var podatakNiz = podatak.split(":");
		var naziv = podatakNiz[0];
		var vrijednost = podatakNiz[1];
		konfJson[naziv] = vrijednost;
	}
	return konfJson;
}

function provjeriPostojanjePodataka(podaciJson, potrebniPodaci) {
	let popisPodataka = [];

	for (let nazivPodatka in potrebniPodaci) {
		if (podaciJson[nazivPodatka] === undefined) {
			popisPodataka.push(nazivPodatka);
		}
	}

	return popisPodataka;
}

function provjeriVrijednostiPodataka(podaciJson, potrebniPodaci) {
	let popisPoruka = [];

	for (let nazivPodatka in potrebniPodaci) {
		if (nazivPodatka == "reCaptchaJavniKljuc" || nazivPodatka == "reCaptchaTajniKljuc"
		|| nazivPodatka == "tmdbApiKeyV3" || nazivPodatka == "tmdbApiKeyV4") {
			let vrijednostTog = podaciJson[nazivPodatka];
			if (vrijednostTog == "PROMIJENI ME") {
				popisPoruka.push(`potrebno je unijeti vlastiti ${nazivPodatka} u konfiguracijsku datoteku`);
			}
		}

		let tipProvjere = potrebniPodaci[nazivPodatka];
		if (tipProvjere.tip === undefined) continue;

		let vrijednostPodatka = podaciJson[nazivPodatka];

		if (vrijednostPodatka == undefined) {
			popisPoruka.push(`nedostaje ${nazivPodatka}`);
			continue;
		}

		if (tipProvjere.tip == "broj") {
			if (vrijednostPodatka < tipProvjere.min || vrijednostPodatka > tipProvjere.maks) {
				popisPoruka.push(`${nazivPodatka} mora biti broj između ${tipProvjere.min} i ${tipProvjere.maks}`);
			}
		} else if (tipProvjere.tip == "tekst") {
			if (vrijednostPodatka.length < tipProvjere.min || vrijednostPodatka.length > tipProvjere.maks) {
				popisPoruka.push(`${nazivPodatka} mora imati između ${tipProvjere.min} i ${tipProvjere.maks} znakova`);
			}
			if (!tipProvjere.regex.test(vrijednostPodatka)) {
				popisPoruka.push(`${nazivPodatka} ne smije imati specijalne znakove`);
			}
		}
	}

	return popisPoruka;
}

module.exports = Konfiguracija;
