
/*
 * JavaScript library for signing in web browsers - version 0.20
 * 
 * April 2014 (client library ver 0.20)
 * 		idCard.js 	- Changed IdCardPluginHandler methods getCertificate(), sign() and getVersion() API and behaviour - the methods must now be used asynchronously with callback functions. Users of 0.14 version need to make changes in the client code to continue using the library (see also user manual for more information). 
 *				- Added variable 'libraryVersion' which specifies the idCard.js library's version. It is recommended to write the version information to log file during signature creation - additional information is provided in the documentation.
 *				- User manual "JavaScript library for Signing in Web Browsers" is now available in English.
 * 		sign.html 	- sign-*.html sample application is now available in English.
 * 				- changed the DigiDocService web service related steps to 'optional'
 * 				- added version number to the file name, the number is set according to the idCard.js library's version (e.g. sign-0.20.html).
 * 				- added idCard.js library's version to the heading section of the sample.
 *
 *
 * May 2013 (client library ver 0.14)
 *		idCard.js - removed support for old plugin-s, default language is English
 *
 *
 * May 2013 (client library ver 0.13)
 *		idCard.js - old Mac OSX plugin (application/x-idcard-plugin) support removed
 *
 *
 * 16 Mar 2012 (client library ver 0.12)
 * 		idCard.js - java applet support removed
 *
 *
 * 7 Sept 2011 (client library ver 0.11)
 * 		idCard.js - bug fixes, see also header of idCard.js
 *	 	sign.html - minor fixes
 * 		documentation - "Veebis signeerimise Javascripti klienditeek.doc" - added error codes and description of inner logic behind idCard.js
 *
 *
 * 10 May 2011 (client library ver 0.10)
 * 		Bug fixes to idCard.js, sign.html, API documentation
*/	



/* ------------------------------------ */
/* --- Variables and data structures --- */
/* ------------------------------------ */

var libraryVersion = '0.20'; //  version of the idCard.js library

var Certificate = {
    id: null,
    cert: null,
    CN: null,
    issuerCN: null,
    keyUsage: null,
    validFrom: "", // Sertifikaadi kehtivuse algusaeg, esitatud kujul dd.mm.yyyy hh:mm:ss, Zulu ajavööndis
    validTo: null // Sertifikaadi kehtivuse lõpuaeg, esitatud kujul dd.mm.yyyy hh:mm:ss, Zulu ajavööndis
}

var getCertificatesResponse = {
    certificates: [],
    returnCode: 0
}

var SignResponse = {
    signature: null,
    returnCode: 0
}

//1..99 on pluginatest tulevad vead
//ver 0.12 - veakoodi 100 detailsem kirjeldus
var dictionary = {
    1:	{est: 'Allkirjastamine katkestati',			eng: 'Signing was cancelled',			lit: 'Pasirašymas nutrauktas',					rus: 'Подпись была отменена'},
    2:	{est: 'Sertifikaate ei leitud',				eng: 'Certificate not found',			lit: 'Nerastas sertifikatas',					rus: 'Сертификат не найден'},
	9:  {est: 'Vale allkirjastamise PIN',			eng: 'Incorrect PIN code',				lit:'Incorrect PIN code',						rus: 'Неверный ПИН-код'},
    12: {est: 'ID-kaardi lugemine ebaõnnestus',		eng: 'Unable to read ID-Card',			lit: 'Nepavyko perskaityti ID-kortos',			rus: 'Невозможно считать ИД-карту'},
	14: {est: 'Tehniline viga',						eng: 'Technical error',					lit: 'Techninė klaida',							rus: 'Техническая ошибка'},
	15: {est: 'Vajalik tarkvara on puudu',			eng: 'Unable to find software',			lit: 'Nerasta programinės įranga',				rus: 'Отсутствует необходимое программное обеспечение'},
	16: {est: 'Vigane sertifikaadi identifikaator', eng: 'Invalid certificate identifier',	lit: 'Neteisingas sertifikato identifikatorius',rus: 'Неверный идентификатор сертификата'},
	17: {est: 'Vigane räsi',						eng: 'Invalid hash',					lit: 'Neteisinga santrauka',					rus: 'Неверный хеш'},
	19: {est: 'Veebis allkirjastamise käivitamine on võimalik vaid https aadressilt',		eng: 'Web signing is allowed only from https:// URL',					lit: 'Web signing is allowed only from https:// URL',					rus: 'Подпись в интернете возможна только с URL-ов, начинающихся с https://'},
	100: {est: 'Teie arvutist puudub allkirjastamistarkvara või ei ole Teie operatsioonisüsteemi ja brauseri korral veebis allkirjastamine toetatud. Allkirjastamistarkvara saate aadressilt https://installer.id.ee',		eng: 'Web signing module is missing from your computer or web signing is not supported on your operating system and browser platform. Signing software is available from https://installer.id.ee',		lit: 'Web signing module is missing from your computer or web signing is not supported on your operating system and browser platform. Signing software is available from https://installer.id.ee',				rus: 'На вашем компьютере отстутствует модуль для цифровой подписи в интернете или цифровая подпись в интернете не поддерживается вашей операционной системой и/или браузером. Программное обеспечение доступно здесь: https://installer.id.ee'}
}


var loadedPlugin = '';


// Exception

function IdCardException(returnCode, message) {
    this.returnCode = returnCode;

    this.message = message;

    this.isError = function () {
        return this.returnCode != 1;
    }

    this.isCancelled = function () {
        return this.returnCode == 1;
    }
}

//Ahto, 2013.05, See ei toimi IE puhul, põhiliselt on seda vaja mac+safari juhu jaoks.
function isPluginSupported(pluginName) {
       if (navigator.mimeTypes && navigator.mimeTypes.length) {
	       if (navigator.mimeTypes[pluginName]) {
		       return true;
	       } else {
		       return false;
	       }
       } else {
	       return false;
       }
}

function checkIfPluginIsLoaded(pluginName, lang)
{
	var plugin = document.getElementById('IdCardSigning');

	if (pluginName == "digidocPlugin")
	{
		try
		{
			var ver = plugin.version;	// Uue plugina tuvastus - uuel pluginal pole getVersion() meetodit
							// IE-s ei tule siin exceptionit, lihtsalt ver == undefined
			if (ver!==undefined) {
				return true;
			}
		}
		catch (ex)
		{
		}

		return false;
	}
	else
	{
		//Muud juhud ehk siis pluginName == "" vms
		return false;
	}
}

function loadSigningPlugin(lang, pluginToLoad){

	var pluginHTML = {
		digidocPlugin:	'<object id="IdCardSigning" type="application/x-digidoc" style="width: 1px; height: 1px; visibility: hidden;"></object>'
	}
	var plugin;

	if (!lang || lang == undefined)
	{
		lang = 'eng';
	}

	//2011.05.10, ahto - juba plugina laadimisel uuritakse, kas tuldi https pealt.
	if (document.location.href.indexOf("https://") == -1)
	{
		throw new IdCardException(19, dictionary[19][lang]);
	}

	// Kontrollime, kas soovitakse laadida spetsiifiline plugin
	if (pluginToLoad != undefined)
	{
		if (pluginHTML[pluginToLoad] != undefined) // Määratud nimega plugin on olemas
		{
			document.getElementById('pluginLocation').innerHTML = pluginHTML[pluginToLoad];

			if (!checkIfPluginIsLoaded(pluginToLoad, lang))
			{
				throw new IdCardException(100, dictionary[100][lang]);
			}

			loadedPlugin = pluginToLoad;
		}
		else // Plugina nimi on tundmatu
		{
			// Tagastame vea juhtimaks teegi kasutaja tähelepanu valele nimele.
			throw new IdCardException(100, dictionary[100][lang]);
		}
		return;
	} else {

		// 2011.05, Ahto kommentaar if lause kohta:
		// Mac+Safari juhul käivitub isPluginSupported, mis vaatab, kas plugin on arvutis olemas või mitte.
		// Teiste OS+Brauseri kombinatsioonide puhul võib lihtsalt uut pluginat laadima minna, aga Mac+Safari
		// puhul, kui püüda uut pluginat ilma selle olemasolu kontrollita laadida, näidatakse kasutajale
		// kole viga, kui pluginat pole.
		if (
				(!(navigator.userAgent.indexOf('Mac') != -1 && navigator.userAgent.indexOf('Safari') != -1)) ||
				isPluginSupported('application/x-digidoc')
			)
		{
			document.getElementById('pluginLocation').innerHTML = pluginHTML['digidocPlugin'];
			if (checkIfPluginIsLoaded('digidocPlugin', lang))
			{
				loadedPlugin = "digidocPlugin";
				return;
			}
		}

		//pluginat ei suudetud laadida, anname vea
		if (loadedPlugin===undefined || loadedPlugin=="")
		{
			throw new IdCardException(100, dictionary[100][lang]);
		}
	}
}

function getISO6391Language(lang)
{
    var languageMap = {est: 'et', eng: 'en', rus: 'ru', et: 'et', en: 'en', ru: 'ru'};
    return languageMap[lang];
}

function digidocPluginHandler(lang)
{
	var plugin = document.getElementById('IdCardSigning');

    plugin.pluginLanguage = getISO6391Language(lang);

	this.getCertificate = function () {
		var TempCert;
		var response;
		var tmpErrorMessage;

		try
		{
			TempCert = plugin.getCertificate();
		}
		catch (ex)
		{

		}

		//2011.08.12, Ahto, saadame vea ülesse
		if (plugin.errorCode != "0")
		{

			try
			{
				tmpErrorMessage = dictionary[plugin.errorCode][lang];	//exception tuleb, kui array elementi ei eksisteeri
			}
			catch (ex)
			{
				tmpErrorMessage = plugin.errorMessage;
			}

			throw new IdCardException(parseInt(plugin.errorCode), tmpErrorMessage);
		}

		// IE plugin ei tagastanud cert väljal sertifikaati HEX kujul, mistõttu on siia tehtud hack, et sertifikaadi hex kuju võetakse certificateAsHex väljalt
		if ((TempCert.cert==undefined)){
				response = '({' +
			   '    id: "' + TempCert.id + '",' +
			   '    cert: "'+TempCert.certificateAsHex+'",' +
			   '    CN: "' + TempCert.CN + '",' +
			   '    issuerCN: "' + TempCert.issuerCN + '",' +
			   '    keyUsage: "Non-Repudiation"' +
//				   '    validFrom: ' + TempCert.validFrom + ',' +
//				   '    validTo: ' + TempCert.validTo +
			   '})';
				response = eval('' + response);
				return response;
		} else {
			return TempCert;
		}
	}

	this.sign = function (id, hash ) {
		var response;
		var tmpErrorMessage;

		try
		{
			response = plugin.sign(id, hash, "");
		}
		catch (ex)
		{}

		//2011.08.12, Ahto, saadame vea ülesse
		if (plugin.errorCode != "0")
		{

			try
			{
				tmpErrorMessage = dictionary[plugin.errorCode][lang];	//exception tuleb, kui array elementi ei eksisteeri
			}
			catch (ex)
			{
				tmpErrorMessage = plugin.errorMessage;
			}

			throw new IdCardException(parseInt(plugin.errorCode), tmpErrorMessage);
		}


		if (response == null || response == undefined || response == "")
		{
			response = '({' + 'signature: "",' + 'returnCode: 14' + '})';
		}
		else
		{
			response = '({' + 'signature: "' + response + '",' + 'returnCode:0' + '})'
		}

		response = eval('' + response);

		if (response.returnCode != 0) {
            throw new IdCardException(response.returnCode, dictionary[response.returnCode][lang]);
        }
        return response.signature;
	}

	this.getVersion = function () {
		return plugin.version;
	}
}

function IdCardPluginHandler(lang)
{
	var plugin = document.getElementById('IdCardSigning');
	var pluginHandler = null;
	var response = null;

	if (!lang || lang == undefined)
	{
		lang = 'eng';
	}

	this.choosePluginHandler = function () {
	    return new digidocPluginHandler(lang);
	}

	this.getCertificate = function (successCallback, failureCallback) {

		pluginHandler = this.choosePluginHandler();
        try {
		    var result = pluginHandler.getCertificate();
            successCallback(result);
        } catch (e) {
            failureCallback(e);
        }
	}

	this.sign = function (id, hash, successCallback, failureCallback) {

		pluginHandler = this.choosePluginHandler();
        try {
             var result = pluginHandler.sign(id, hash);
             successCallback(result);
        } catch (e) {
            failureCallback(e);
        }
	}

	this.getVersion = function (successCallback, failureCallback) {

		pluginHandler = this.choosePluginHandler();
        try {
            var result = pluginHandler.getVersion();
            successCallback(result);
        } catch (e) {
            failureCallback(e);
        }
	}

}
