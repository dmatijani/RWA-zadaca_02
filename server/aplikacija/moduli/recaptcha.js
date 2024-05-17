exports.provjeriReCaptchu = async function(tajniKljuc, token) {
    let parametri = {method: 'POST'}

    let o = await fetch(
        "https://www.google.com/recaptcha/api/siteverify?secret=" + tajniKljuc + "&response=" + token,
        {method: "POST"}
    );

    let reCaptchaStatus = JSON.parse(await o.text());

    console.log("--- RECAPTCHA ---");
    console.log(reCaptchaStatus);

    if(reCaptchaStatus.success && reCaptchaStatus.score > 0.5) return true;
    else return false
    return reCaptchaStatus;
}