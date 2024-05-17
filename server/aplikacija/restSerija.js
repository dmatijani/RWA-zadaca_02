const SerijaDAO = require("./serijaDAO.js");
const jwt = require("../aplikacija/moduli/jwt.js");

class RestSerija {
    constructor(_jwtTajniKljuc) {
        this.jwtTajniKljuc = _jwtTajniKljuc;
    }

    getFavoriti = (zahtjev, odgovor) => {
        odgovor.type("application/json");
        
        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = zahtjev.headers.authorization.split(" ")[1];
        let korime = jwt.dajKorimeJWT(token, this.jwtTajniKljuc);

        let sDao = new SerijaDAO();
        sDao.dajFavoriteKorisnika(korime)
            .then((serije) => {
                odgovor.status(200);
                odgovor.send(JSON.stringify(serije));
            })
            .catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    }

    postFavoriti = (zahtjev, odgovor) => {
        odgovor.type("application/json");
        
        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = zahtjev.headers.authorization.split(" ")[1];
        let korime = jwt.dajKorimeJWT(token, this.jwtTajniKljuc);
        
        let sDao = new SerijaDAO();
        let podaci = zahtjev.body;

        let porukeGreske = provjeriPodatke(podaci);
        if (porukeGreske.length > 0) {
            let nabrojaneGreske = ""
            for (let porukaGreske of porukeGreske) {
                nabrojaneGreske += porukaGreske + ", ";
            }
            nabrojaneGreske = nabrojaneGreske.slice(0, nabrojaneGreske.length-2);

            odgovor.status(400);
            odgovor.send(JSON.stringify({"opis": nabrojaneGreske}));
            return;
        }

        sDao.dodajSerijuUFavorite(korime, podaci)
            .then((tocno) => {
                odgovor.status(201);
                odgovor.send(JSON.stringify({"opis": "izvrseno"}));
            })
            .catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    }

    getFavorit = (zahtjev, odgovor) => {
        odgovor.type("application/json");

        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = zahtjev.headers.authorization.split(" ")[1];
        let korime = jwt.dajKorimeJWT(token, this.jwtTajniKljuc);

        let idSerije = zahtjev.params.id;

        let sDao = new SerijaDAO();
        sDao.dajOdredeniFavorit(korime, idSerije)
            .then((serija) => {
                if (serija == undefined) {
                    odgovor.status(400);
                    odgovor.send(JSON.stringify({"opis": "serija nije u favoritima korisnika"}));
                } else {
                    odgovor.status(200);
                    odgovor.send(JSON.stringify(serija));
                }
            })
            .catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    }

    postFavorit = (zahtjev, odgovor) => {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.send(JSON.stringify({"opis": "zabranjeno"}));
    }

    putFavorit = (zahtjev, odgovor) => {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.send(JSON.stringify({"opis": "zabranjeno"}));
    }

    deleteFavorit = (zahtjev, odgovor) => {
        odgovor.type("application/json");

        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = zahtjev.headers.authorization.split(" ")[1];
        let korime = jwt.dajKorimeJWT(token, this.jwtTajniKljuc);

        let idSerije = zahtjev.params.id;

        let sDao = new SerijaDAO();
        sDao.ukloniFavorit(korime, idSerije)
            .then((tocno) => {
                odgovor.status(201);
                odgovor.send(JSON.stringify({"opis": "izvrseno"}));
            })
            .catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    }
}

provjeriPodatke = function (podaci) {
    let greske = [];

    if (podaci.naziv == undefined) {
        greske.push("serija ne moze postojati bez naziva");
    }
    if (podaci.tmdb_id == undefined) {
        greske.push("serija ne moze postojati bez tmdb_id");
    }
    if (podaci.naziv.length > 250) {
        greske.push("naziv serije ne moze biti dulji od 250 znakova");
    }

    return greske;
}

module.exports = RestSerija;
