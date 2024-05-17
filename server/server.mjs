import ds from "fs";
import express from "express";
import sesija from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Konfiguracija from "./konfiguracija.js";
import RestKorisnik from "./aplikacija/restKorisnik.js";
import RestSerija from "./aplikacija/restSerija.js";
import RestDnevnik from "./aplikacija/restDnevnik.js";
import RestTMDB from "./aplikacija/restTMDB.js";
import cors from "cors";

const port = 12423; // Ukoliko se mijenja port ili URL, potrebno promijeniti i u index.html

const currentModuleURL = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleURL);
const putanja = dirname(currentModulePath);

let konstante = ds.readFileSync(putanja + "/konstantePredlozak.js", "UTF-8");
konstante = konstante.replace("#PORT#", port);
ds.writeFileSync(putanja + '/konstante.js', konstante, 'UTF-8');

const server = express();

let konf = new Konfiguracija();

konf.ucitajKonfiguraciju()
    .then(pokreniServer)
    .catch((greska) => {
        if (greska.path != null) {
            console.log("Naziv datoteke nije dobar: " + greska.path);
        } else {
            console.log(greska.message);
        }
    });

function pokreniServer() {
    server.use(cors({
        origin: ['http://localhost:4200'],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }));
    server.use((zahtjev, odgovor, sljedeci) => {
        odgovor.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
        odgovor.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        odgovor.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        odgovor.setHeader("Access-Control-Expose-Headers", "Authorization");
        odgovor.setHeader("Access-Control-Allow-Credentials", "true");

        sljedeci();
    });

    server.use(express.urlencoded({ extended: true }));
    server.use(express.json());
    server.use(sesija({
        secret: konf.dajKonf().tajniKljucSesija,
        saveUninitialized: true,
        cookie: { maxAge: 1000*60*60*3},
        resave: false
    }));

    server.get("/recaptchajavnikljuc", (zahtjev, odgovor) => {
        odgovor.status(200);
        odgovor.json({ kljuc: konf.dajKonf().reCaptchaJavniKljuc });
    });
    
    pripremiPutanjeREST();
    pripremiPutanjeAplikacija();
    posluziAngular();

    server.listen(port, () => {
        console.log(`Server pokrenut na portu: ${port}`);
    });
}

function neimplementiranaMetoda (zahtjev, odgovor) {
    odgovor.status(501);
    odgovor.type("application/json");
    odgovor.write(JSON.stringify({"opis": "metoda nije implementirana"}));
    odgovor.end();
}

function pripremiPutanjeREST() {
    let konfZapisi = konf.dajKonf();
    let restKorisnik = new RestKorisnik(konfZapisi.jwtTajniKljuc, konfZapisi.jwtValjanost, konfZapisi.reCaptchaTajniKljuc);
    let restSerija = new RestSerija(konfZapisi.jwtTajniKljuc);
    let restDnevnik = new RestDnevnik(konfZapisi.jwtTajniKljuc, konfZapisi.jwtValjanost, konfZapisi.appStranicenje);
    let restTMDB = new RestTMDB(konfZapisi.tmdbApiKeyV3, konfZapisi.appStranicenje, konfZapisi.jwtTajniKljuc);

    server.use("/baza", (zahtjev, odgovor, sljedeci) => {
        restDnevnik.unesiUDnevnik(zahtjev, odgovor);
        sljedeci();
    });

    server.get("/baza/korisnici", restKorisnik.getKorisnici);
    server.post("/baza/korisnici", restKorisnik.postKorisnici);
    server.put("/baza/korisnici", neimplementiranaMetoda);
    server.delete("/baza/korisnici", neimplementiranaMetoda);
    server.get("/baza/korisnici/:korime", restKorisnik.getKorisnik);
    server.post("/baza/korisnici/:korime", restKorisnik.postKorisnik);
    server.put("/baza/korisnici/:korime", restKorisnik.putKorisnik);
    server.delete("/baza/korisnici/:korime", restKorisnik.deleteKorisnik);
    server.get("/baza/korisnici/:korime/prijava", restKorisnik.getKorisnikPrijava);
    server.post("/baza/korisnici/:korime/prijava", restKorisnik.postKorisnikPrijava)
    server.put("/baza/korisnici/:korime/prijava", neimplementiranaMetoda);
    server.delete("/baza/korisnici/:korime/prijava", neimplementiranaMetoda);

    server.get("/baza/favoriti", restSerija.getFavoriti);
    server.post("/baza/favoriti", restSerija.postFavoriti);
    server.put("/baza/favoriti", neimplementiranaMetoda);
    server.delete("/baza/favoriti", neimplementiranaMetoda);
    server.get("/baza/favoriti/:id", restSerija.getFavorit);
    server.post("/baza/favoriti/:id", restSerija.postFavorit);
    server.put("/baza/favoriti/:id", restSerija.putFavorit);
    server.delete("/baza/favoriti/:id", restSerija.deleteFavorit);

    server.get("/baza/dnevnik", restDnevnik.getDnevnik);
    server.post("/baza/dnevnik", neimplementiranaMetoda);
    server.put("/baza/dnevnik", neimplementiranaMetoda);
    server.delete("/baza/dnevnik", neimplementiranaMetoda);

    server.get("/baza/serije_pretrazivanje/:tekst", restTMDB.pretraziSerije);
    server.post("/baza/serije_pretrazivanje/:tekst", neimplementiranaMetoda);
    server.put("/baza/serije_pretrazivanje/:tekst", neimplementiranaMetoda);
    server.delete("/baza/serije_pretrazivanje/:tekst", neimplementiranaMetoda);
    server.get("/baza/detalji_serije/:id", restTMDB.dajDetaljeSerije);
    server.post("/baza/detalji_serije/:id", neimplementiranaMetoda);
    server.put("/baza/detalji_serije/:id", neimplementiranaMetoda);
    server.delete("/baza/detalji_serije/:id", neimplementiranaMetoda);

    server.use("/baza", (zahtjev, odgovor) => {
        odgovor.status(404);
        odgovor.json({ opis: "nema resursa" });
    });
}

function pripremiPutanjeAplikacija() {
    server.use("/ERAmodel", express.static(putanja + "/dokumentacija/ERAmodel.png"));
    server.use("/dokumentacija", express.static(putanja + "/dokumentacija/dokumentacija.html"));
}

function posluziAngular() {
    server.use("/", express.static(putanja + "/angular/browser"));
    server.get("/odjava", (zahtjev, odgovor) => {
        odgovor.type("application/json");
        if (zahtjev.session) {
            zahtjev.session.destroy((greska) => {});
            odgovor.status(201);
            odgovor.send(JSON.stringify({ "opis": "izvrseno" }));
            return;
        }

        odgovor.status(400);
        odgovor.send(JSON.stringify({ "opis": "nema sesije" }));
    });

    server.get("/:ostalo", (zahtjev, odgovor) => {odgovor.redirect("/")});
}