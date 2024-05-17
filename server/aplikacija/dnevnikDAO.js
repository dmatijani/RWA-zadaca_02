const Baza = require("./baza.js");
const kodovi = require("../aplikacija/moduli/kodovi.js");

class DnevnikDAO {
	constructor() {
		this.baza = new Baza("RWA2023dmatijani21.sqlite");
	}

    pohraniUDnevnik = async function(korime, vrsta, resurs, tijelo) {
        if (typeof tijelo == "string") tijelo = tijelo.trim();
        if (tijelo == undefined || tijelo == "" || Object.keys(tijelo).length == 0) {
            tijelo = null;
        }
        if (tijelo != null) {
            tijelo = JSON.stringify(tijelo);
        }

        this.baza.spojiSeNaBazu();
        let sql = "INSERT INTO dnevnik(korime, datum_i_vrijeme, vrsta_zahtjeva, resurs, tijelo) VALUES (?, current_timestamp, ?, ?, ?);";
        let podaci = [korime, vrsta, resurs, tijelo];
        await this.baza.izvrsiUpit(sql, podaci);
        this.baza.zatvoriVezu();
    }

    dohvatiBrojZapisa = async function(parametri) {
        this.baza.spojiSeNaBazu();
        let sql = `SELECT COUNT(*) AS broj FROM dnevnik ${dajSQLUvjete(parametri)};`
        let broj = await this.baza.izvrsiUpit(sql, []);
        this.baza.zatvoriVezu();
        return broj;
    }

    dohvatiDnevnik = async function(zapisiPoStranici, parametri) {
        parametri.stranica --;

        let sortiranje = "datum_i_vrijeme DESC";
        if (parametri.sortiraj != undefined) {
            if (parametri.sortiraj == "m" || parametri.sortiraj == "M") {
                sortiranje = "CASE vrsta_zahtjeva ";
                sortiranje += "WHEN 'GET' THEN 1 ";
                sortiranje += "WHEN 'POST' THEN 2 ";
                sortiranje += "WHEN 'PUT' THEN 3 ";
                sortiranje += "WHEN 'DELETE' THEN 4 ";
                sortiranje += "ELSE 5 END,";
                sortiranje += "datum_i_vrijeme DESC";
            }
        }

        this.baza.spojiSeNaBazu();
        let sql = `SELECT * FROM dnevnik ${dajSQLUvjete(parametri)}ORDER BY ${sortiranje} LIMIT ? OFFSET ?;`;

        let podaci = [
            zapisiPoStranici,
            parametri.stranica*zapisiPoStranici
        ];
        let zapisi = await this.baza.izvrsiUpit(sql, podaci);
        this.baza.zatvoriVezu();
        return zapisi;
    }
}

function parsirajDatumUSQL(datum) {
    let datumDijelovi = datum.split(".");
    if (datumDijelovi[0].length == 1) datumDijelovi[0] = "0" + datumDijelovi[0];
    if (datumDijelovi[1].length == 1) datumDijelovi[1] = "0" + datumDijelovi[1];
    return datumDijelovi[2] + "-" + datumDijelovi[1] + "-" + datumDijelovi[0];
}

function dajSQLUvjete(parametri) {
    let uvjeti = "";
    let prviUvjetNapisan = false;

    if (parametri.datumOd != undefined) {
        if (!prviUvjetNapisan) {
            uvjeti += "WHERE ";
            prviUvjetNapisan = true;
        }
        else uvjeti += "AND ";
        uvjeti += `DATE(datum_i_vrijeme) >= '${parsirajDatumUSQL(parametri.datumOd)}' `;
    }
    if (parametri.datumDo != undefined) {
        if (!prviUvjetNapisan) {
            uvjeti += "WHERE ";
            prviUvjetNapisan = true;
        }
        else uvjeti += "AND ";
        uvjeti += `DATE(datum_i_vrijeme) <= '${parsirajDatumUSQL(parametri.datumDo)}' `;
    }
    if (parametri.vrijemeOd != undefined) {
        if (!prviUvjetNapisan) {
            uvjeti += "WHERE ";
            prviUvjetNapisan = true;
        }
        else uvjeti += "AND ";
        uvjeti += `TIME(datum_i_vrijeme) >= '${parametri.vrijemeOd}' `;
    }
    if (parametri.vrijemeDo != undefined) {
        if (!prviUvjetNapisan) {
            uvjeti += "WHERE ";
            prviUvjetNapisan = true;
        }
        else uvjeti += "AND ";
        uvjeti += `TIME(datum_i_vrijeme) <= '${parametri.vrijemeDo}' `;
    }

    return uvjeti;
}

module.exports = DnevnikDAO;
