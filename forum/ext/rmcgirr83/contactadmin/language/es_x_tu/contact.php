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
	'ACP_CAT_CONTACTADMIN'		=> 'Contactar con la administración',
	'ADD_ATTACHMENT_EXPLAIN'	=> 'Si deseas adjuntar un archivo, introduce los detalles a continuación.',
	'CONTACT_ERROR'			=> 'No puedes usar el formulario de contacto en este momento porque hay un error en la configuración. Se ha enviado un correo electrónico al fundador.',
	'CONTACT_NONE'			=> 'L‘utilisateur %1$s a essayé d‘utiliser l‘extension "Contacter l‘administrateur" à %2$s pour envoyer un %3$s, mais aucun admnistrateur n‘autorise %3$ss pour les utilisateurs. Aller au panneau de configuration de l‘extension %4$s pour choisir une autre méthode de contact',
	'CONTACT_BOT_SUBJECT'		=> 'Erreur avec l‘extension Contacter un administrateur',
	'CONTACT_BOT_MESSAGE'	=> 'L‘utilisateur %1$s a essayé d‘utiliser l‘extension "Contacter l‘administrateur" à %2$s, mais le %3$s sélectionné dans la configuration est incorrect. Aller au panneau de configuration de l‘extension %4$s et choisir une autre %3$s dans les paramètres de l‘extension.',
	'CONTACT_CONFIRM'			=> 'Confirmar',
	'CONTACT_DISABLED'			=> 'No puedes usar el formulario de contacto en este momento porque está desactivado.',
	'CONTACT_MAIL_DISABLED'		=> 'Se ha producido un error en la configuración de la extensión. La extensión está configurada para enviar un correo electrónico, pero el foro no está configurado para enviarlos. Avisa al %sadministrador del foro%s.',
	'CONTACT_MSG_SENT'			=> 'Tu mensaje se ha enviado correctamente',
	'CONTACT_NO_MSG'			=> 'No has escrito ningún mensaje',
	'CONTACT_NO_SUBJ'			=> 'No has escrito ningún asunto',
	'CONTACT_REASON'			=> 'Motivo',
	'CONTACT_TEMPLATE'			=> '[b]Nom :[/b] %1$s' . "\n" . '[b]Adresse e-mail :[/b] %2$s' . "\n" . '[b]IP :[/b] %3$s' . "\n" . '[b]Sujet :[/b] %4$s' . "\n" . '[b]À écrit le message suivant dans le formulaire de contact :[/b] %5$s',
	'CONTACT_TITLE'				=> 'Contactar con la administración',

	'CONTACT_YOUR_NAME'			=> 'Tu nombre',
	'CONTACT_YOUR_NAME_EXPLAIN'	=> 'Introduce tu nombre para que el mensaje tenga un remitente.',
	'CONTACT_YOUR_EMAIL'		=> 'Tu dirección de correo electrónico',
	'CONTACT_YOUR_EMAIL_EXPLAIN'	=> 'Introduce una dirección de correo electrónico válida para que podamos contactar contigo si es necesario.',
	'CONTACT_YOUR_EMAIL_CONFIRM'	=> 'Confirma la dirección de correo electrónico',
	'WRONG_DATA_EMAIL'			=> 'Las direcciones de correo electrónico no coinciden',

	'TOO_MANY_CONTACT_TRIES'	=> 'Has superado el número máximo de intentos para esta sesión. Inténtalo de nuevo más tarde.',
	'CONTACT_NO_NAME'			=> 'No has escrito ningún nombre',
	'FORUM'						=> 'forum',
	'USER'						=> 'utilisateur',
	'CONTACT_REGISTERED'		=> 'Utilisateur enregistré',
	'CONTACT_GUEST'				=> 'Visiteur',

	'REASON_EXPLAIN'			=> 'Elige un motivo',
	'REASON_ERROR'				=> 'Elige un motivo adecuado',
	'RETURN_CONTACT'			=> '%sVolver a la página de contacto%s',
	'CONTACT_PRIVACYPOLICY'				=> 'Política de privacidad',
	'CONTACT_PRIVACYPOLICY_EXPLAIN'		=> 'Confirmo que el nombre, la dirección de correo electrónico, el texto del mensaje y mi dirección IP serán tratados y conservados por el responsable del foro de acuerdo con la <a target="_blank" title="Enlace a la política de privacidad" href="%s">política de privacidad</a>.',
	'CONTACT_PRIVACYPOLICY_ERROR'		=> 'Marca la casilla de la política de privacidad. Sin tu confirmación no podrás enviarnos un mensaje.',
]);
