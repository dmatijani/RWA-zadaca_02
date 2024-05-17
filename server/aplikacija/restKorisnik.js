const KorisnikDAO = require("./korisnikDAO.js");
const SerijaDAO = require("./serijaDAO.js");
const jwt = require("../aplikacija/moduli/jwt.js");
const mail = require("../aplikacija/moduli/mail.js");
const recaptcha = require("../aplikacija/moduli/recaptcha.js");
const kodovi = require("../aplikacija/moduli/kodovi.js");

class RestKorisnik {
    constructor(_jwtTajniKljuc, _jwtValjanost, _reCaptchaTajniKljuc) {
        this.jwtTajniKljuc = _jwtTajniKljuc;
        this.jwtValjanost = parseInt(_jwtValjanost); 
        this.reCaptchaTajniKljuc = _reCaptchaTajniKljuc;
    }

    getKorisnici = (zahtjev, odgovor) => {
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
        
        odgovor.status(200);
        (new KorisnikDAO()).dajSveKorisnike().then((sviKorisnici) => {
            odgovor.send(JSON.stringify(sviKorisnici));
        });
    };

    postKorisnici = async (zahtjev, odgovor) => {
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
        
        let kDao = new KorisnikDAO();
        let podaci = zahtjev.body;

        if (podaci.recaptchatoken == undefined) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            return;
        }

        let jeCovjek = recaptcha.provjeriReCaptchu(this.reCaptchaTajniKljuc, podaci.recaptchatoken);
        if (!jeCovjek) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            return;
        }

        let porukeGreske = provjeriPodatkePriAzuriranju(podaci.korisnik, true);
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
        
        kDao.dodajNovogKorisnika(podaci.korisnik)
            .then((tocno) => {
                odgovor.status(201);
                odgovor.send(JSON.stringify({"opis": "izvrseno"}));

                try {
                    posaljiMailPriUspjesnojPrijavi(podaci);
                } catch {
                    console.log("Mail se nije mogao poslati!");
                }
            })
            .catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    };

    getKorisnik = (zahtjev, odgovor) => {
        odgovor.type("application/json");
        
        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = zahtjev.headers.authorization.split(" ")[1];
        let korime = zahtjev.params.korime;
        let dobivenoKorime = jwt.dajKorimeJWT(token);
        if (korime != dobivenoKorime) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            return;
        }
        
        (new KorisnikDAO()).dajJednogKorisnika(korime).then((korisnik) => {
            if (korisnik.korime === undefined) {
                odgovor.status(417);
                odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            } else {
                odgovor.status(200);
                odgovor.send(JSON.stringify(korisnik));
            }
        });
    }

    postKorisnik = (zahtjev, odgovor) => {
        odgovor.type("application/json");
        odgovor.status(405);
        odgovor.send(JSON.stringify({"opis": "zabranjeno"}));
    }

    putKorisnik = (zahtjev, odgovor) => {
        odgovor.type("application/json");
        
        let jwtValidan = jwt.provjeriToken(zahtjev, this.jwtTajniKljuc);
        if (!jwtValidan) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
            return;
        }
        let token = zahtjev.headers.authorization.split(" ")[1];
        let korime = zahtjev.params.korime;
        let dobivenoKorime = jwt.dajKorimeJWT(token);
        if (korime != dobivenoKorime) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            return;
        }
        
        let kDao = new KorisnikDAO();
        let podaci = zahtjev.body;

        if (podaci.recaptchatoken == undefined) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci - nema tokena"}));
            return;
        }

        let jeCovjek = recaptcha.provjeriReCaptchu(this.reCaptchaTajniKljuc, podaci.recaptchatoken);
        if (!jeCovjek) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci - token ne valja"}));
            return;
        }

        let porukeGreske = provjeriPodatkePriAzuriranju(podaci.korisnik);
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
        
        kDao.azurirajKorisnika(korime, podaci.korisnik)
            .then((tocno) => {
                if (tocno == "izvrseno") {
                    odgovor.status(201);
                    odgovor.send(JSON.stringify({"opis": tocno}));
                } else {
                    odgovor.status(201);
                    odgovor.send(JSON.stringify({"opis": "izvrseno", "tajniKljuc": tocno}));
                }
            })
            .catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    }

    deleteKorisnik = async (zahtjev, odgovor) => {
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
        
        let kDao = new KorisnikDAO();
        let korime = zahtjev.params.korime;

        let sDao = new SerijaDAO();
        let sveSerije = await sDao.dajFavoriteKorisnika(korime);
        let svaBrisanja = [];
        for (let serija of sveSerije) {
            svaBrisanja.push(sDao.ukloniFavorit(korime, serija.id));
        }
        await Promise.allSettled(svaBrisanja);

        kDao.izbrisiKorisnika(korime)
            .then((tocno) => {
                odgovor.status(201);
                odgovor.send(JSON.stringify({"opis": "izvrseno"}));
            })
            .catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    }

    getKorisnikPrijava = async (zahtjev, odgovor) => {
        odgovor.type("application/json");

        let korime = zahtjev.params.korime;
        if (zahtjev.session.korime === null || zahtjev.session.korime === undefined) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({"opis": "potrebna prijava"}));
        } else {
            let kDao = new KorisnikDAO();
            let korisnik = await kDao.dajJednogKorisnika(korime);
            let korisnikUloga = await kDao.dajUloguKorisnika(korime);
            let podaciJwt = {
                korime: korisnik.korime,
                uloga: korisnikUloga.naziv
            }
            let token = jwt.kreirajToken(podaciJwt, this.jwtTajniKljuc, this.jwtValjanost);
            zahtjev.session.jwt = token;
            odgovor.set("Authorization", `Bearer ${token}`);
            odgovor.status(201);
            odgovor.send(JSON.stringify({"opis": "izvrseno"}));
        }
    }

    postKorisnikPrijava = (zahtjev, odgovor) => {
        odgovor.type("application/json");

        let kDao = new KorisnikDAO();
        let korime = zahtjev.params.korime;
        let podaci = zahtjev.body;

        if (korime != podaci.korime) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            return;
        }

        if (podaci.recaptchatoken == undefined) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            return;
        }

        let jeCovjek = recaptcha.provjeriReCaptchu(this.reCaptchaTajniKljuc, podaci.recaptchatoken);
        if (!jeCovjek) {
            odgovor.status(417);
            odgovor.send(JSON.stringify({"opis": "neocekivani podaci"}));
            return;
        }

        kDao.provjeriPostojanjeKorisnika(korime, podaci)
            .then(async (korisnik) => {
                if (korisnik.id === undefined) {
                    odgovor.status(400);
                    odgovor.send(JSON.stringify({"opis": "Korisnik sa tim podacima ne postoji!"}));
                } else {
                    if (korisnik.dvorazinska_autentifikacija) {
                        if (podaci.totp == undefined) {
                            odgovor.status(403);
                            odgovor.send(JSON.stringify({"opis": "Potreban TOTP"}));
                            return;
                        } else {
                            if (!kodovi.provjeriTOTP(podaci.totp, korisnik.totp_sifra)) {
                                odgovor.status(400);
                                odgovor.send(JSON.stringify({"opis": "Pogrešan TOTP!"}));
                                return;
                            }
                        }
                    }

                    let ulogaKorisnika = await kDao.dajUloguKorisnika(korisnik.korime);
                    if (zahtjev.session.korime === null || zahtjev.session.korime === undefined) {
                        zahtjev.session.korime = korisnik.korime;
                        zahtjev.session.admin = false;
                        
                        if (ulogaKorisnika.naziv != undefined) {
                            if (ulogaKorisnika.naziv == "administrator") {
                                zahtjev.session.admin = true;
                            }
                        }
                    }
                    odgovor.status(201);
                    let jeAdmin = "ne";
                    if (ulogaKorisnika != undefined || uloga_korisnika != null) {
                        if (ulogaKorisnika.naziv == "administrator") jeAdmin = "da";
                    }
                    odgovor.header("Authorization", jeAdmin);
                    odgovor.send(JSON.stringify({"opis": "izvrseno"}));
                }
            })
            .catch((greska) => {
                odgovor.status(400);
                odgovor.send(JSON.stringify({"opis": greska.message}));
            })
    }
}

provjeriPodatkePriAzuriranju = function(podaci, novi = false) {
    let greske = [];

    if (novi) {
        let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(podaci.email)) {
            greske.push("email nije ispravan");
        }
        let korimeRegex = /^[a-zA-Z0-9_-]*$/;
        if (!korimeRegex.test(podaci.korime)) {
            greske.push("korisnicko ime ne smije imati specijalne i dijakriticke znakove te razmake");
        }
        if (podaci.korime.length == 0) {
            greske.push("korisnicko ime mora biti uneseno");
        }
        if (podaci.lozinka.length == 0) {
            greske.push("lozinka mora biti unesena");
        }
        if (podaci.lozinka.split(" ").length > 1) {
            greske.push("lozinka ne smije imati razmake");
        }
        if (podaci.email.length == 0) {
            greske.push("email mora biti unesen");
        }
        if (podaci.korime.length > 50) {
            greske.push("korisnicko ime mora imati najvise 50 znakova");
        };
        if (podaci.lozinka.length > 250) {
            greske.push("lozinka ime mora imati najvise 250 znakova");
        };
        if (podaci.email.length > 100) {
            greske.push("email mora imati najvise 100 znakova");
        };
    }

    if (podaci.ime.length > 50) {
        greske.push("ime mora imati najvise 50 znakova");
    };
    if (podaci.prezime.length > 100) {
        greske.push("prezime ime mora imati najvise 100 znakova");
    };
    if (podaci.telefon.length > 25) {
        greske.push("telefon mora imati najvise 25 znakova");
    };
    if (podaci.web_stranica.length > 150) {
        greske.push("web stranica mora imati najvise 150 znakova");
    };

    return greske;
}

posaljiMailPriUspjesnojPrijavi = async function(korisnik) {
    let posiljatelj = "dmatijani21@student.foi.hr";
    let primatelj = korisnik.email;
    
    let mailPoruka = "Pozdrav!\n"
        + "Vaš novi korisnički račun uspješno je kreiran.\n\n"
        + "Podaci za prijavu: \n"
        + `Korisničko ime: ${korisnik.korime}\n`
        + `Lozinka: ${korisnik.lozinka}\n\n`
        + "Vaše podatke čuvajte na sigurnom mjestu!";

    let poruka = await mail.posaljiMail(
        posiljatelj,
        primatelj,
        "Uspješno kreiranje računa",
        mailPoruka
    )
}

module.exports = RestKorisnik;
