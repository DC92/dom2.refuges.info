<?php
/**
 * Purge Guest Sessions extension for phpBB
 *
 * @package stoker/purgeguests
 * @copyright (c) 2026 Stoker
 * @license GNU General Public License, version 2 (GPL-2.0)
 */
 
declare(strict_types=1);

namespace stoker\purgeguests\event;

use phpbb\config\config;
use phpbb\db\driver\driver_interface;
use phpbb\log\log_interface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class listener implements EventSubscriberInterface
{
	/** @var config */
	protected $config;

	/** @var driver_interface */
	protected $db;

	/** @var log_interface */
	protected $log;

	/**
	 * @param config           $config
	 * @param driver_interface $db
	 * @param log_interface    $log
	 */
	public function __construct(config $config, driver_interface $db, log_interface $log)
	{
		$this->config = $config;
		$this->db = $db;
		$this->log = $log;
	}

	/**
	 * {@inheritdoc}
	 */
	public static function getSubscribedEvents()
	{
		return [
			'core.page_header' => 'auto_purge_guest_sessions',
		];
	}

	/**
	 * Check guest session count and auto-purge if threshold exceeded.
	 */
	public function auto_purge_guest_sessions()
	{
		if (!$this->config['purgeguests_auto_enabled'])
		{
			return;
		}

		$threshold_online = (int) $this->config['purgeguests_auto_threshold'];
		$threshold_rows = (int) $this->config['purgeguests_threshold_rows'];

		// Both disabled, nothing to do
		if ($threshold_online === 0 && $threshold_rows === 0)
		{
			return;
		}

		$interval = (int) $this->config['purgeguests_auto_interval'];
		$now = time();

		// Atomic check: only one worker wins the update
		$sql = 'UPDATE ' . CONFIG_TABLE . "
			SET config_value = '" . $now . "'
			WHERE config_name = 'purgeguests_last_check'
				AND CAST (config_value AS INTEGER) <= " . ($now - $interval);
				// DOMINIQUE : Cast nécéssaire pour PGSQL // AND config_value <= " . ($now - $interval);
		$this->db->sql_query($sql);


//CAST (config_value AS INTEGER)

		if (!$this->db->sql_affectedrows())
		{
			return;
		}

		// Check active guests online (unique IPs within online time span)
		if ($threshold_online > 0)
		{
			$online_time = (int) $this->config['load_online_time'] * 60;
			$sql = 'SELECT COUNT(DISTINCT session_ip) AS guest_count
				FROM ' . SESSIONS_TABLE . '
				WHERE session_user_id = ' . ANONYMOUS . '
					AND session_time >= ' . ($now - $online_time);
			$result = $this->db->sql_query($sql);
			$active_count = (int) $this->db->sql_fetchfield('guest_count');
			$this->db->sql_freeresult($result);

			if ($active_count >= $threshold_online)
			{
				$this->purge_guest_sessions();
				$this->config->increment('purgeguests_stat_auto_count', 1);

				if ($this->config['purgeguests_log_enabled'])
				{
					$this->log->add('admin', ANONYMOUS, '', 'LOG_AUTO_PURGE_GUEST_SESSIONS_ONLINE', false, [$active_count]);
				}
				return;
			}
		}

		// Check total guest session rows
		if ($threshold_rows > 0)
		{
			$sql = 'SELECT COUNT(*) AS guest_count
				FROM ' . SESSIONS_TABLE . '
				WHERE session_user_id = ' . ANONYMOUS;
			$result = $this->db->sql_query($sql);
			$total_count = (int) $this->db->sql_fetchfield('guest_count');
			$this->db->sql_freeresult($result);

			if ($total_count >= $threshold_rows)
			{
				$this->purge_guest_sessions();
				$this->config->increment('purgeguests_stat_auto_count', 1);

				if ($this->config['purgeguests_log_enabled'])
				{
					$this->log->add('admin', ANONYMOUS, '', 'LOG_AUTO_PURGE_GUEST_SESSIONS_ROWS', false, [$total_count]);
				}
				return;
			}
		}
	}

	/**
	 * Delete all guest sessions, optionally excluding registration pages.
	 */
	protected function purge_guest_sessions()
	{
		$sql = 'DELETE FROM ' . SESSIONS_TABLE . '
			WHERE session_user_id = ' . ANONYMOUS;

		if ($this->config['purgeguests_exclude_register'])
		{
			$sql .= " AND session_page NOT LIKE '%mode=register%'";
		}
		$this->db->sql_query($sql);
	}
}