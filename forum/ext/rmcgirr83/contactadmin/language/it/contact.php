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
	'ACP_CAT_CONTACTADMIN'		=> 'Contatta l’amministrazione',
	'ADD_ATTACHMENT_EXPLAIN'	=> 'Se desideri allegare un file, inserisci i dettagli qui sotto.',
	'CONTACT_ERROR'			=> 'Al momento non puoi usare il modulo di contatto perché c’è un errore nella configurazione. È stata inviata un’e-mail al fondatore.',
	'CONTACT_NONE'			=> 'L‘utilisateur %1$s a essayé d‘utiliser l‘extension "Contacter l‘administrateur" à %2$s pour envoyer un %3$s, mais aucun admnistrateur n‘autorise %3$ss pour les utilisateurs. Aller au panneau de configuration de l‘extension %4$s pour choisir une autre méthode de contact',
	'CONTACT_BOT_SUBJECT'		=> 'Erreur avec l‘extension Contacter un administrateur',
	'CONTACT_BOT_MESSAGE'	=> 'L‘utilisateur %1$s a essayé d‘utiliser l‘extension "Contacter l‘administrateur" à %2$s, mais le %3$s sélectionné dans la configuration est incorrect. Aller au panneau de configuration de l‘extension %4$s et choisir une autre %3$s dans les paramètres de l‘extension.',
	'CONTACT_CONFIRM'			=> 'Conferma',
	'CONTACT_DISABLED'			=> 'Al momento non puoi usare il modulo di contatto perché è disattivato.',
	'CONTACT_MAIL_DISABLED'		=> 'Si è verificato un errore nella configurazione dell’estensione. L’estensione è impostata per inviare un’e-mail, ma il forum non è configurato per l’invio di e-mail. Avvisa l’%samministratore del forum%s.',
	'CONTACT_MSG_SENT'			=> 'Il tuo messaggio è stato inviato con successo',
	'CONTACT_NO_MSG'			=> 'Non hai inserito un messaggio',
	'CONTACT_NO_SUBJ'			=> 'Non hai inserito un oggetto',
	'CONTACT_REASON'			=> 'Motivo',
	'CONTACT_TEMPLATE'			=> '[b]Nom :[/b] %1$s' . "\n" . '[b]Adresse e-mail :[/b] %2$s' . "\n" . '[b]IP :[/b] %3$s' . "\n" . '[b]Sujet :[/b] %4$s' . "\n" . '[b]À écrit le message suivant dans le formulaire de contact :[/b] %5$s',
	'CONTACT_TITLE'				=> 'Contatta l’amministrazione',

	'CONTACT_YOUR_NAME'			=> 'Il tuo nome',
	'CONTACT_YOUR_NAME_EXPLAIN'	=> 'Inserisci il tuo nome, in modo che il messaggio abbia un mittente.',
	'CONTACT_YOUR_EMAIL'		=> 'Il tuo indirizzo e-mail',
	'CONTACT_YOUR_EMAIL_EXPLAIN'	=> 'Inserisci un indirizzo e-mail valido, così potremo eventualmente contattarti.',
	'CONTACT_YOUR_EMAIL_CONFIRM'	=> 'Conferma l’indirizzo e-mail',
	'WRONG_DATA_EMAIL'			=> 'Gli indirizzi e-mail non coincidono',

	'TOO_MANY_CONTACT_TRIES'	=> 'Hai superato il numero massimo di tentativi per questa sessione. Riprova più tardi.',
	'CONTACT_NO_NAME'			=> 'Non hai inserito un nome',
	'FORUM'						=> 'forum',
	'USER'						=> 'utilisateur',
	'CONTACT_REGISTERED'		=> 'Utilisateur enregistré',
	'CONTACT_GUEST'				=> 'Visiteur',

	'REASON_EXPLAIN'			=> 'Scegli un motivo',
	'REASON_ERROR'				=> 'Scegli un motivo appropriato',
	'RETURN_CONTACT'			=> '%sTorna alla pagina di contatto%s',
	'CONTACT_PRIVACYPOLICY'				=> 'Informativa sulla privacy',
	'CONTACT_PRIVACYPOLICY_EXPLAIN'		=> 'Confermo che il nome, l’indirizzo e-mail, il testo del messaggio e il mio indirizzo IP saranno trattati e conservati dal gestore del forum secondo l’<a target="_blank" title="Link all’informativa sulla privacy" href="%s">informativa sulla privacy</a>.',
	'CONTACT_PRIVACYPOLICY_ERROR'		=> 'Spunta la casella dell’informativa sulla privacy. Senza la tua conferma non potrai inviarci un messaggio.',
]);
