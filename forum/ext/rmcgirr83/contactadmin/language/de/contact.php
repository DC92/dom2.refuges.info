<?php
/**
*
* Contact admin extension for the phpBB Forum Software package.
*
* @copyright 2016 Rich McGirr (RMcGirr83)
* @license GNU General Public License, version 2 (GPL-2.0)
*
*/
/**
* DO NOT CHANGE
*/
if (!defined('IN_PHPBB'))
{
	exit;
}

if (empty($lang) || !is_array($lang))
{
	$lang = [];
}

// DEVELOPERS PLEASE NOTE
//
// All language files should use UTF-8 as their encoding and the files must not contain a BOM.
//
// Placeholders can now contain order information, e.g. instead of
// 'Page %s of %s' you can (and should) write 'Page %1$s of %2$s', this allows
// translators to re-order the output of data while ensuring it remains correct
//
// You do not need this where single placeholders are used, e.g. 'Message %d' is fine
// equally where a string contains only two placeholders which are used to wrap text
// in a url you again do not need to specify an order e.g., 'Click %sHERE%s' is fine
//
// Some characters you may want to copy&paste:
// ’ » “ ” …
//

$lang = array_merge($lang, [
	'ACP_CAT_CONTACTADMIN'		=> 'Administration kontaktieren',
	'ADD_ATTACHMENT_EXPLAIN'	=> 'Wenn Sie eine Datei anhängen möchten, geben Sie unten die Details ein.',
	'CONTACT_ERROR'			=> 'Sie können das Kontaktformular im Moment nicht benutzen, da ein Konfigurationsfehler vorliegt. Eine E-Mail wurde an den Gründer gesendet.',
	'CONTACT_NONE'			=> 'L‘utilisateur %1$s a essayé d‘utiliser l‘extension "Contacter l‘administrateur" à %2$s pour envoyer un %3$s, mais aucun admnistrateur n‘autorise %3$ss pour les utilisateurs. Aller au panneau de configuration de l‘extension %4$s pour choisir une autre méthode de contact',
	'CONTACT_BOT_SUBJECT'		=> 'Erreur avec l‘extension Contacter un administrateur',
	'CONTACT_BOT_MESSAGE'	=> 'L‘utilisateur %1$s a essayé d‘utiliser l‘extension "Contacter l‘administrateur" à %2$s, mais le %3$s sélectionné dans la configuration est incorrect. Aller au panneau de configuration de l‘extension %4$s et choisir une autre %3$s dans les paramètres de l‘extension.',
	'CONTACT_CONFIRM'			=> 'Bestätigen',
	'CONTACT_DISABLED'			=> 'Sie können das Kontaktformular im Moment nicht benutzen, da es deaktiviert ist.',
	'CONTACT_MAIL_DISABLED'		=> 'Bei der Konfiguration der Erweiterung ist ein Fehler aufgetreten. Die Erweiterung soll eine E-Mail senden, aber das Forum ist nicht für den E-Mail-Versand konfiguriert. Bitte benachrichtigen Sie den %sForum-Administrator%s.',
	'CONTACT_MSG_SENT'			=> 'Ihre Nachricht wurde erfolgreich gesendet',
	'CONTACT_NO_MSG'			=> 'Sie haben keine Nachricht eingegeben',
	'CONTACT_NO_SUBJ'			=> 'Sie haben keinen Betreff eingegeben',
	'CONTACT_REASON'			=> 'Grund',
	'CONTACT_TEMPLATE'			=> '[b]Nom :[/b] %1$s' . "\n" . '[b]Adresse e-mail :[/b] %2$s' . "\n" . '[b]IP :[/b] %3$s' . "\n" . '[b]Sujet :[/b] %4$s' . "\n" . '[b]À écrit le message suivant dans le formulaire de contact :[/b] %5$s',
	'CONTACT_TITLE'				=> 'Administration kontaktieren',

	'CONTACT_YOUR_NAME'			=> 'Ihr Name',
	'CONTACT_YOUR_NAME_EXPLAIN'	=> 'Bitte geben Sie Ihren Namen ein, damit die Nachricht einen Absender hat.',
	'CONTACT_YOUR_EMAIL'		=> 'Ihre E-Mail-Adresse',
	'CONTACT_YOUR_EMAIL_EXPLAIN'	=> 'Bitte geben Sie eine gültige E-Mail-Adresse ein, damit wir Sie gegebenenfalls kontaktieren können.',
	'CONTACT_YOUR_EMAIL_CONFIRM'	=> 'E-Mail-Adresse bestätigen',
	'WRONG_DATA_EMAIL'			=> 'Die E-Mail-Adressen stimmen nicht überein',

	'TOO_MANY_CONTACT_TRIES'	=> 'Sie haben die maximale Anzahl an Versuchen für diese Sitzung überschritten. Bitte versuchen Sie es später erneut.',
	'CONTACT_NO_NAME'			=> 'Sie haben keinen Namen eingegeben',
	'FORUM'						=> 'forum',
	'USER'						=> 'utilisateur',
	'CONTACT_REGISTERED'		=> 'Utilisateur enregistré',
	'CONTACT_GUEST'				=> 'Visiteur',

	'REASON_EXPLAIN'			=> 'Bitte wählen Sie einen Grund',
	'REASON_ERROR'				=> 'Bitte wählen Sie einen passenden Grund',
	'RETURN_CONTACT'			=> '%sZurück zur Kontaktseite%s',
	'CONTACT_PRIVACYPOLICY'				=> 'Datenschutzerklärung',
	'CONTACT_PRIVACYPOLICY_EXPLAIN'		=> 'Ich bestätige, dass der angegebene Name, die E-Mail-Adresse, der Nachrichtentext und meine IP-Adresse vom Betreiber des Forums gemäß der <a target="_blank" title="Link zur Datenschutzerklärung" href="%s">Datenschutzerklärung</a> verarbeitet und gespeichert werden.',
	'CONTACT_PRIVACYPOLICY_ERROR'		=> 'Bitte aktivieren Sie das Kästchen zur Datenschutzerklärung. Ohne Ihre Bestätigung können Sie uns keine Nachricht senden.',
]);
