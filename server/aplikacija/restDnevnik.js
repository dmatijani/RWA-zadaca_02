const DnevnikDAO = require("./dnevnikDAO.js");
const jwt = require("../aplikacija/moduli/jwt.js");
const mail = require("../aplikacija/moduli/mail.js");

class RestDnevnik {
    constructor(_jwtTajniKljuc, _jwtValjanost, _zapisiPoStranici) {
        this.jwtTajniKljuc = _jwtTajniKljuc;
        this.jwtValjanost = parseInt(_jwtValjanost); 
        this.zapisiPoStranici = _zapisiPoStranici;
    }

    unesiUDnevnik = (zahtjev, odgovor) => {
        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            return;
        }

        let token = zahtjev.headers.authorization.split(" ")[1];

        let korime = jwt.dajKorimeJWT(token);
        let vrsta = zahtjev.method;
        let resurs = zahtjev.originalUrl;
        let tijelo = zahtjev.body;

        let dDao = new DnevnikDAO();
        dDao.pohraniUDnevnik(korime, vrsta, resurs, tijelo);
    };

    getDnevnik = async (zahtjev, odgovor) => {
        odgovor.type("application/json");

        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = zahtjev.headers.authorization.split(" ")[1];
        if (!jwt.provjeriJeLiAdmin(token)) {
            odgovor.status(403);
            odgovor.send(JSON.stringify({"opis": "zabranjen pristup"}));
            return;
        }

        let parametri = zahtjev.query;

        let ispravniParametri = provjeriParametre(parametri);
        if (!ispravniParametri) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            return;
        }

        let dDao = new DnevnikDAO();

        let brojPodatakaInfo = await dDao.dohvatiBrojZapisa(parametri);
        let brojPodataka = brojPodatakaInfo[0].broj;
        if (brojPodataka == 0) {
            odgovor.status(400);
            odgovor.send(JSON.stringify({"opis": "nema zapisa za ove uvjete"}));
            return;
        }

        if ((parametri.stranica - 1)*this.zapisiPoStranici >= brojPodataka) {
            odgovor.status(400);
            odgovor.send(JSON.stringify({"opis": "nema zapisa na toj stranici"}));
            return;
        }

        let brojZapisa = await dDao.dohvatiBrojZapisa(parametri);

        dDao.dohvatiDnevnik(this.zapisiPoStranici, parametri)
            .then((dnevnickiZapisi) => {
                odgovor.status(200);
                odgovor.send(JSON.stringify({"broj_zapisa": brojZapisa[0].broj, "zapisi_po_stranici": this.zapisiPoStranici, "podaci": dnevnickiZapisi}));
            }).catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    }
}

function provjeriParametre(parametri) {
    if (parametri.stranica == undefined || parametri.stranica == null || parametri.stranica == "") {
        return false;
    }
    if (isNaN(parametri.stranica)) {
        return false;
    }
    if (parametri.stranica < 1) {
        return false;
    }
    if (parametri.sortiraj != undefined) {
        if (parametri.sortiraj != "d" && parametri.sortiraj != "m"
        && parametri.sortiraj != "D" && parametri.sortiraj != "M") {
            return false;
        }
    }
    if (parametri.datumOd != undefined) {
        if (!provjeriDatum(parametri.datumOd)) {
            return false;
        }
    }
    if (parametri.datumDo != undefined) {
        if (!provjeriDatum(parametri.datumDo)) {
            return false;
        }
    }
    if (parametri.vrijemeOd != undefined) {
        if (!provjeriVrijeme(parametri.vrijemeOd)) {
            return false;
        }
    }
    if (parametri.vrijemeDo != undefined) {
        if (!provjeriVrijeme(parametri.vrijemeDo)) {
            return false;
        }
    }

    let sviParametri = [
        "stranica",
        "sortiraj",
        "datumOd",
        "datumDo",
        "vrijemeOd",
        "vrijemeDo"
    ];
    return (provjeriViskaParametre(parametri, sviParametri));
}

function provjeriDatum(datum) {
    let regex = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[0-2])\.\d{4}$/;
    if (!regex.test(datum)) {
        return false;
    }

    let dijeloviDatuma = datum.split(".");
    let dijeloviBrojevi = dijeloviDatuma.map(brojStr => parseInt(brojStr));
    
    let dan = dijeloviBrojevi[0];
    let mjesec = dijeloviBrojevi[1];
    let godina = dijeloviBrojevi[2];

    if (dan == 31) {
        if (mjesec == 2 || mjesec == 4 || mjesec == 6 || mjesec == 9 || mjesec == 11) {
            return false;
        }
    }
    if (mjesec == 2) {
        if (dan > 29) {
            return false;
        } else if (dan == 29) {
            if (!((godina % 4 === 0 && godina % 100 !== 0) || (godina % 400 === 0))) {
                return false;
            }
        }
    }

    return true;
}

function provjeriVrijeme(vrijeme) {
    let regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(vrijeme);
}

function provjeriViskaParametre(parametri, ocekivaniParametri) {
    const kljucevi = Object.keys(parametri);
    const dodatniKljucevi = kljucevi.filter((kljuc) => !ocekivaniParametri.includes(kljuc));
    return dodatniKljucevi.length == 0;
  }

module.exports = RestDnevnik;
