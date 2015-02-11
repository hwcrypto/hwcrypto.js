
/*
 * JavaScript library for signing in web browsers - version 0.21
 * 
 * August 2014 (client library ver 0.21)
 * 		idCard.js - fixed syntax errors according to feedback. 
 * 
 * April 2014 (client library ver 0.20)
 * 		idCard.js 	- Changed IdCardPluginHandler methods getCertificate(), sign() and getVersion() API and behaviour - the methods must now be used asynchronously with callback functions. Users of 0.14 version need to make changes in the client code to continue using the library (see also user manual for more information). 
 *				- Added variable 'libraryVersion' which specifies the idCard.js library's version. It is strongly recommended to write the version information to log file during signature creation - additional information is provided in the documentation.
 *				- Added method getType() which returns the signing module's type (asynchronous or synchronous). It is strongly recommended to write the type information to log file during signature creation - additional information is provided in the documentation.
 *				- User manual "JavaScript library for Signing in Web Browsers" is now available in English.
 * 		sign.html 	- sign.html sample application is now available in English.
 * 				- changed the DigiDocService web service related steps to 'optional'
 * 				- added idCard.js library's version to the heading section of the sample.
 * 				- added the signing module's type information to the heading section of the sample.
 * 				- added Lithuanian to the language selection dropdown.
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

//  version of the idCard.js library
var libraryVersion = '0.21'; 

var Certificate = {
    id: null,
    cert: null,
    CN: null,
    issuerCN: null,
    keyUsage: null,
    validFrom: "", // Certificate's "valid from" date, in format dd.mm.yyyy hh:mm:ss (Zulu time-zone)
    validTo: null // Certificate's "valid to" date, in format dd.mm.yyyy hh:mm:ss (Zulu time-zone)
};

var getCertificatesResponse = {
    certificates: [],
    returnCode: 0
};

var SignResponse = {
    signature: null,
    returnCode: 0
};

//1..99 are error codes returned by the signing module
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
};

// Variable for internal use in idCard.js
var loadedPlugin = '';


// Exception
function IdCardException(returnCode, message) {
    this.returnCode = returnCode;

    this.message = message;

    this.isError = function () {
        return this.returnCode != 1;
    };

    this.isCancelled = function () {
        return this.returnCode == 1;
    };
}

// This function is meant for internal use, do not use in client code. 
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

// This function is meant for internal use, do not use in client code. 
function checkIfPluginIsLoaded(pluginName, lang)
{
	var plugin = document.getElementById('IdCardSigning');

	if (pluginName == "digidocPlugin")
	{
		try
		{
			var ver = plugin.version;	
			if (ver!==undefined) {
				return true;
			}
		}
		catch (ex)
		{
			//console.error(ex);
		}

		return false;
	}
	else // Other cases, e.g. pluginName == ""
	{		 
		return false;
	}
}

// Loads the signing module to browser
function loadSigningPlugin(lang, pluginToLoad){
	lang = lang || 'eng';
	var pluginHTML = {
		digidocPlugin:	'<object id="IdCardSigning" type="application/x-digidoc" style="width: 1px; height: 1px; visibility: hidden;"></object>'
	};

	// It is checked if the connection is https during the signing module loading
	if (document.location.href.indexOf("https://") == -1)
	{
		throw new IdCardException(19, dictionary[19][lang]);
	}

	if (pluginToLoad != undefined)
	{
		if (pluginHTML[pluginToLoad] != undefined) // Signing module with the specified name exists
		{
			document.getElementById('pluginLocation').innerHTML = pluginHTML[pluginToLoad];

			if (!checkIfPluginIsLoaded(pluginToLoad, lang))
			{
				throw new IdCardException(100, dictionary[100][lang]);
			}

			loadedPlugin = pluginToLoad;
		}
		else
		{
			// Throw exception to return information about incorrect signing module's name
			throw new IdCardException(100, dictionary[100][lang]);
		}
		return;
	} else {

		if ( // Special case for Mac+Safari combination, it must be checked if the signing module is installed in the user's system. Otherwise an error is shown to the user.
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

		// The signing module's loading was unsuccessful, throw exception 
		if (loadedPlugin===undefined || loadedPlugin=="")
		{
			throw new IdCardException(100, dictionary[100][lang]);
		}
	}
}

// Returns ISO 639-1 compatible two-letter language code
function getISO6391Language(lang)
{
    var languageMap = {est: 'et', eng: 'en', rus: 'ru', lit: 'lt', et: 'et', en: 'en', ru: 'ru', lt: 'lt'};
    return languageMap[lang];
}

// Returns the signing module's type, possible values are 'SYNC' and 'ASYNC' (synchronous or asynchronous).
function getType() {
    return 'SYNC';
}

// This function is meant for internal use by the library
function digidocPluginHandler(lang)
{
	var plugin = document.getElementById('IdCardSigning');
    plugin.pluginLanguage = getISO6391Language(lang) || 'en';
	this.getCertificate = function () {
		var TempCert = undefined;
		var response;
		var tmpErrorMessage;

		try
		{
			TempCert = plugin.getCertificate();
		}
		catch (ex)
		{
			//console.error(ex);
		}

		if (plugin.errorCode != "0")
		{

			try
			{
				tmpErrorMessage = dictionary[plugin.errorCode][lang];	// Exception is thrown if there is no respective element in the array 
			}
			catch (ex)
			{
				tmpErrorMessage = plugin.errorMessage;
			}

			throw new IdCardException(parseInt(plugin.errorCode), tmpErrorMessage);
		}

		// Workaround for IE - in case the certificate is not returned in HEX format then the value is taken from certificateAsHex field. 
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
		} 
		return TempCert;
	};

	this.sign = function (id, hash ) {
		var response = null;
		var tmpErrorMessage;

		try
		{
			response = plugin.sign(id, hash, "");
		}
		catch (ex)
		{
			//console.error(ex);
		}

		if (plugin.errorCode != "0")
		{

			try
			{
				tmpErrorMessage = dictionary[plugin.errorCode][lang];	// Exception is thrown if there is no respective element in the array 
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
			response = '({' + 'signature: "' + response + '",' + 'returnCode:0' + '})';
		}

		response = eval('' + response);

		if (response.returnCode != 0) {
            throw new IdCardException(response.returnCode, dictionary[response.returnCode][lang]);
        }
        return response.signature;
	};

	this.getVersion = function () {
		return plugin.version;
	};
}

// Provides the main functionality for signature creation
function IdCardPluginHandler(lang)
{
	lang = lang || 'eng';
	var pluginHandler = null;

	this.choosePluginHandler = function () {
	    return new digidocPluginHandler(lang);
	};

    // Get the signer's certificate from the smart card
	this.getCertificate = function (successCallback, failureCallback) {

		pluginHandler = this.choosePluginHandler();
        try {
		    var result = pluginHandler.getCertificate();
            successCallback(result);
        } catch (e) {
            failureCallback(e);
        }
	};

	// Get the signature value from the smart card
	this.sign = function (id, hash, successCallback, failureCallback) {

		pluginHandler = this.choosePluginHandler();
        try {
             var result = pluginHandler.sign(id, hash);
             successCallback(result);
        } catch (e) {
            failureCallback(e);
        }
	};

	// Get the signing module's version
	this.getVersion = function (successCallback, failureCallback) {

		pluginHandler = this.choosePluginHandler();
        try {
            var result = pluginHandler.getVersion();
            successCallback(result);
        } catch (e) {
            failureCallback(e);
        }
	};

}