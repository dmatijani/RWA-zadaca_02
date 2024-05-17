const jwt = require("../aplikacija/moduli/jwt.js");

class RestTMDB {
    constructor (apiKeyV3, _zapisiPoStranici, _jwtTajniKljuc) {
        this.apiKey = apiKeyV3;
        this.zapisiPoStranici = _zapisiPoStranici;
        this.jwtTajniKljuc = _jwtTajniKljuc;
    }

    pretraziSerije = async (zahtjev, odgovor) => {
        odgovor.type("application/json");
        
        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({
                "opis": "potrebna prijava",
                "rezultati": [],
                "broj_rezultata": 0,
                "broj_stranica": 0,
                "zapisi_po_stranici": 0,
                "stranica": 0
            }));
            return;
        }
        
        let tekstPretrage = zahtjev.params.tekst;
        let parametri = {
            method: "GET",
            headers: {accept: 'application/json'},
        }

        let zatrazenaStr = zahtjev.query.str;
        if (zatrazenaStr == undefined) {
            zatrazenaStr = 1;
        }
        
        let prviZapis = (zatrazenaStr - 1)*this.zapisiPoStranici;
        let zadnjiZapis = zatrazenaStr*this.zapisiPoStranici - 1;
        let prvaTMDBStranica = Math.ceil((prviZapis + 1)/20);
        let zadnjaTMDBStranica = Math.ceil((zadnjiZapis + 1)/20);

        let potrebnaDohvacanja = [];
        for (let i = prvaTMDBStranica; i <= zadnjaTMDBStranica; i++) {
            potrebnaDohvacanja.push(fetch(`https://api.themoviedb.org/3/search/tv?query=${tekstPretrage}&include_adult=false&language=en-US&page=${i}&api_key=${this.apiKey}`, parametri));
        }
        let dobiveniOdgovori = await Promise.all(potrebnaDohvacanja);
        
        let dohvaceniPodaci = [];
        for (let dobivenOdgovor of dobiveniOdgovori) {
            if (dobivenOdgovor.status != 200 || dobivenOdgovor.status == undefined || dobivenOdgovor.status == null) {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": "greska kod dohvacanja serija"}));
                return;
            } else {
                if (dobivenOdgovor.status == 200) {
                    dohvaceniPodaci.push(dobivenOdgovor.text());
                } else {
                    odgovor.status(400);
                    odgovor.send(JSON.stringify({"opis": "greska kod dohvacanja serija"}));
                    return;
                }
            }
        }
        let dohvaceneSerije = await Promise.all(dohvaceniPodaci);
        
        let sveSerije = [];
        let brojRezultata = 0;
        for (let dohvacenaSerija of dohvaceneSerije) {
            let dohvacenaSerijaParsirana = JSON.parse(dohvacenaSerija);
            let poljeSerija = dohvacenaSerijaParsirana.results;
            brojRezultata = dohvacenaSerijaParsirana.total_results;
            sveSerije = sveSerije.concat(poljeSerija);
        }
        sveSerije = sveSerije.slice(prviZapis - (prvaTMDBStranica - 1)*20, zadnjiZapis - (prvaTMDBStranica - 1)*20 + 1);

        let podaciZaSlanje = {
            "rezultati": sveSerije,
            "broj_rezultata": brojRezultata,
            "broj_stranica": Math.ceil(brojRezultata/this.zapisiPoStranici),
            "zapisi_po_stranici": this.zapisiPoStranici,
            "stranica": zatrazenaStr
        }

        odgovor.status(200);
        odgovor.send(JSON.stringify(podaciZaSlanje));
    };

    dajDetaljeSerije = (zahtjev, odgovor) => {
        odgovor.type("application/json");
        
        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        
        let serijaId = zahtjev.params.id;
        
        let parametri = {
            method: "GET",
            headers: {accept: 'application/json'},
        }
        fetch(`https://api.themoviedb.org/3/tv/${serijaId}?api_key=${this.apiKey}`, parametri).then(async (dobivenOdgovor) => {
            if (dobivenOdgovor.status == 200) {
                let dohvaceniDetalji = await dobivenOdgovor.text();
                odgovor.status(200);
                odgovor.send(dohvaceniDetalji);
            } else {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": "greska kod dohvacanja detalja serije"}));
            }
        }).catch((e) => {
            odgovor.status(400);
            odgovor.send(JSON.stringify({"opis": "TMDB servis ne radi"}));
        });
    };
}

module.exports = RestTMDB;