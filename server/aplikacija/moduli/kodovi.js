const crypto = require('crypto');
const totp = require('totp-generator');
const base32 = require('base32-encoding');

exports.kreirajSHA256 = function(tekst) {
	return _kreirajSHA256(tekst);
}

exports.kreirajSHA256 = function(tekst, sol) {
	const hash = crypto.createHash('sha256');
	hash.write(tekst+sol);
	var izlaz = hash.digest('hex');
	hash.end();
	return izlaz;
}

exports.dajNasumceBroj = function(min, max) {
  return _dajNasumceBroj(min, max);
}

exports.kreirajTajniKljuc = function(korime) {
	let tekst = korime + new Date() + _dajNasumceBroj(10000000, 90000000);
	let hash = _kreirajSHA256(tekst);
	let tajniKljuc = base32.stringify(hash, "ABCDEFGHIJKLMNOPRSTQRYWXZ234567");
	return tajniKljuc.toUpperCase();
}

exports.provjeriTOTP = function(uneseniKod, tajniKljuc) {
	const kod = totp(tajniKljuc, {
		digits: 6,
		algorithm: "SHA-512",
		period: 60
	});

	if(uneseniKod == kod)
		return true;
	else
		return false;
}

_dajNasumceBroj = function(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); 
}

_kreirajSHA256 = function(tekst) {
	const hash = crypto.createHash('sha256');
	hash.write(tekst);
	var izlaz = hash.digest('hex');
	hash.end();
	return izlaz;
}