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
	'ACP_PURGEGUESTS_SETTINGS_EXPLAIN'		=> 'If you like this extension, please consider following',
	'ACP_PURGEGUESTS_DONATION'				=> 'Make a Donation',
	'ACP_PURGEGUESTS_MEMBER'				=> 'Become an active member of my Community',
	'ACP_PURGEGUESTS_SUPPORT'				=> 'Extension support or feedback',
	'ACP_PURGEGUESTS_BADGE'					=> 'Auto Purge Guest Sessions-1.0.5',
	
	'ACP_PURGEGUESTS_EXPLAIN'				=> 'Manage guest sessions manually or configure automatic purging to protect against botnet floods.',
	'ACP_PURGEGUESTS_AUTO_SETTINGS'			=> 'Auto-purge settings',
	'ACP_PURGEGUESTS_SAVED'					=> 'Purge guest sessions settings have been saved.',
	
	'PURGEGUESTS_AUTO_ENABLED'				=> 'Enable auto-purge',
	'PURGEGUESTS_AUTO_ENABLED_EXPLAIN'		=> 'Automatically purge guest sessions when thresholds are exceeded.',
	'PURGEGUESTS_STAT_AUTO_COUNT'			=> 'Total auto-purges',
	'PURGEGUESTS_STAT_AUTO_COUNT_EXPLAIN'	=> 'Total number of automatic purges performed since the extension was installed.',
	'PURGEGUESTS_EXCLUDE_REGISTER'			=> 'Exclude registering guests',
	'PURGEGUESTS_EXCLUDE_REGISTER_EXPLAIN'	=> 'Protect guests who are currently on the registration page from being purged.<br>This setting also affects the manual purge.<br><em>Note: This adds a wildcard filter that may slightly impact purge performance on very large session tables.</em>',
	'PURGEGUESTS_LOG_ENABLED'				=> 'Log auto-purge events',
	'PURGEGUESTS_LOG_ENABLED_EXPLAIN'		=> 'Write an entry to the admin log each time an auto-purge is triggered.',
 
	'PURGE_GUEST_SESSIONS'					=> 'Purge guest sessions',
	'PURGE_GUEST_SESSIONS_EXPLAIN'			=> 'Remove all anonymous session entries without affecting logged-in users.',
	'PURGE_GUEST_SESSIONS_CONFIRM'			=> 'Are you sure you want to purge all guest sessions?',
	'PURGE_GUEST_SESSIONS_SUCCESS'			=> 'Guest sessions purged successfully.',
 
	'PURGEGUESTS_ACTIVE_COUNT'				=> 'Active guests online',
	'PURGEGUESTS_ACTIVE_COUNT_EXPLAIN'		=> 'Unique guest IPs within the online time span configured in load settings.<br>Matches the guest count shown in "Who is online".',
	'PURGEGUESTS_TOTAL_COUNT'				=> 'Total guest session rows',
	'PURGEGUESTS_TOTAL_COUNT_EXPLAIN'		=> 'All guest session rows in the database, including expired sessions not yet cleaned up by garbage collection.',
 
	'PURGEGUESTS_AUTO_THRESHOLD'			=> 'Auto-purge active guests threshold',
	'PURGEGUESTS_AUTO_THRESHOLD_EXPLAIN'	=> 'Automatically purge all guest sessions when the number of active guests online exceeds this value.<br>Set to 0 to disable. (MAX: 99999)',
	'PURGEGUESTS_THRESHOLD_ROWS'			=> 'Auto-purge session rows threshold',
	'PURGEGUESTS_THRESHOLD_ROWS_EXPLAIN'	=> 'Automatically purge all guest sessions when the total number of guest session rows exceeds this value.<br>Set to 0 to disable. (MAX: 99999)',
	'PURGEGUESTS_GUESTS'					=> 'Guests',
	'PURGEGUESTS_ROWS'						=> 'Rows',
	'PURGEGUESTS_SECONDS'					=> 'Seconds',
	'PURGEGUESTS_AUTO_INTERVAL'				=> 'Auto-purge check interval',
	'PURGEGUESTS_AUTO_INTERVAL_EXPLAIN'		=> 'How often to check the guest session count, in seconds.<br>Lower values respond faster to attacks but run more frequent checks.<br>(MIN: 10 - MAX: 86400)',

	'PURGEGUESTS_THOUSANDS_SEP'				=> ',',
]);