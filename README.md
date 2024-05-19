# 2. zadaća iz kolegija Razvoj web aplikacija

## Općenito

Web aplikacija napravljena je u sklopu kolegija Razvoj web aplikacija, _prosinac 2023._

Fokus je bio na sljedećem:
- dinamične web stranice
- REST servisi i API kojemu klijentska strana pristupa
- jednostranične aplikacije
- sigurna prijava korištenjem JWT
- korištenje vanjskih API-ja (TMDB)
- Google ReCaptcha

Korisnička strana aplikacije napisana je pomoću okvira **Angular** i koristi REST servise koje nudi server, napisan pomoću _Express_ i _Node.js_. Baza je _SQLite_.
Web aplikacija koristi **TMDB** (https://www.themoviedb.org/) za dohvat podataka o serijama.
<br>
<img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB logo" width="240">

Fokus _nije_ bio na sljedećem:
- responzivan dizajn

**2. zadaća iz kolegija OWT (travanj 2023.) imala je fokus na responzivan dizajn (i ima bolji dizajn općenito):** https://github.com/dmatijani/OWT-zadaca_02

## Pokretanje

1. Prebaciti se u _server_ direktorij
2. Potrebno je instalirati sljedeće npm pakete:
   - _base32-encoding_
   - _cors_
   - _crypto_
   - _express_
   - _express-session_
   - _jsonwebtoken_
   - _nodemailer_
   - _sqlite3_
   - _totp-generator_
   - najčešće je dovoljno samo pokrenuti _npm install_
3. Potrebno je pokrenuti _npm run pripremi_
4. Pokrenuti server pomoću _npm start_

## Slike zaslona

Ovo nisu slike cijele aplikacije!

![Stranica s prijavom](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/19757967-8c11-4f1b-a2c8-34ccd90c0888)

![Neke dohvaćene serije](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/2574aae8-e7fc-4515-b51b-f855c53de072)

![Detalji o seriji](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/a528ed1a-339c-4e05-8e5d-b50a5d276f6a)

![Favoriti](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/804b632d-f9ef-4e05-a172-beb97881c776)

![Detalji favorita](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/bc79d769-593f-4548-80c2-63e948dca668)

![Svi korisnici u sustavu](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/176a072f-5e09-4fc8-81a1-0fa56039a970)

![Dnevnik](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/aae69950-47c4-46c5-95f8-50c1704c058c)

## Ostale slike vezane uz mogućnosti aplikacije

![ERA model baze](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/0b75ee97-248f-46ca-8323-ba745ac3e681)

![Dokumentacija](https://github.com/dmatijani/RWA-zadaca_02/assets/126497251/36c21b33-6ea9-4c10-840d-e9cae02918f0)





