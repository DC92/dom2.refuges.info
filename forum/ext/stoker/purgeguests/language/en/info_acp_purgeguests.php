<?php
/**
 * Purge Guest Sessions extension for phpBB
 *
 * @package stoker/purgeguests
 * @copyright (c) 2026 Stoker
 * @license GNU General Public License, version 2 (GPL-2.0)
 */

if (!defined('IN_PHPBB'))
{
	exit;
}

if (empty($lang) || !is_array($lang))
{
	$lang = [];
}

$lang = array_merge($lang, [
	'ACP_PURGEGUESTS_TITLE'		=> 'Purge Guest Sessions',
	'ACP_PURGEGUESTS_SETTINGS'	=> 'Settings',
	
	'LOG_PURGE_GUEST_SESSIONS'				=> '<strong>Purged guest sessions</strong>',
	'LOG_PURGEGUESTS_SETTINGS'				=> '<strong>Purge guest sessions settings updated</strong>',
	'LOG_AUTO_PURGE_GUEST_SESSIONS_ONLINE'	=> '<strong>Auto-purged guest sessions</strong><br />» Active guests: %1$s',
	'LOG_AUTO_PURGE_GUEST_SESSIONS_ROWS'	=> '<strong>Auto-purged guest sessions</strong><br />» Session rows: %1$s',
]);