<?php
/**
 * Purge Guest Sessions extension for phpBB
 *
 * @package stoker/purgeguests
 * @copyright (c) 2026 Stoker
 * @license GNU General Public License, version 2 (GPL-2.0)
 */

declare(strict_types=1);

namespace stoker\purgeguests\controller;

use phpbb\config\config;
use phpbb\db\driver\driver_interface;
use phpbb\log\log_interface;
use phpbb\request\request_interface;
use phpbb\template\template;
use phpbb\user;

class admin_controller
{
	/** @var config */
	protected $config;

	/** @var driver_interface */
	protected $db;

	/** @var log_interface */
	protected $log;

	/** @var request_interface */
	protected $request;

	/** @var template */
	protected $template;

	/** @var user */
	protected $user;

	/** @var string */
	protected $u_action;

	/**
	 * @param config            $config
	 * @param driver_interface  $db
	 * @param log_interface     $log
	 * @param request_interface $request
	 * @param template          $template
	 * @param user              $user
	 */
	public function __construct(config $config, driver_interface $db, log_interface $log, request_interface $request, template $template, user $user)
	{
		$this->config = $config;
		$this->db = $db;
		$this->log = $log;
		$this->request = $request;
		$this->template = $template;
		$this->user = $user;
	}

	/**
	 * @param string $u_action
	 */
	public function set_u_action($u_action)
	{
		$this->u_action = $u_action;
	}

	/**
	 * Display settings and handle actions.
	 */
	public function display_settings()
	{
		$this->user->add_lang_ext('stoker/purgeguests', 'purgeguests');

		$action = $this->request->variable('action', '');

		// Handle AJAX toggle
		if ($action === 'toggle')
		{
			$this->ajax_toggle_setting();
			return;
		}

		// Handle manual purge
		if ($action === 'purge_guest_sessions')
		{
			if (!confirm_box(true))
			{
				confirm_box(false, $this->user->lang('PURGE_GUEST_SESSIONS_CONFIRM'), build_hidden_fields([
					'action' => 'purge_guest_sessions',
				]));
				return;
			}

			$sql = 'DELETE FROM ' . SESSIONS_TABLE . '
				WHERE session_user_id = ' . ANONYMOUS;

			if ($this->config['purgeguests_exclude_register'])
			{
				$sql .= " AND session_page NOT LIKE '%mode=register%'";
			}

			$this->db->sql_query($sql);

			$this->log->add('admin', $this->user->data['user_id'], $this->user->ip, 'LOG_PURGE_GUEST_SESSIONS');

			trigger_error($this->user->lang('PURGE_GUEST_SESSIONS_SUCCESS') . adm_back_link($this->u_action));
		}

		// Handle settings save
		if ($this->request->is_set_post('submit'))
		{
			if (!check_form_key('stoker_purgeguests'))
			{
				trigger_error('FORM_INVALID', E_USER_WARNING);
			}

			$threshold = $this->request->variable('purgeguests_auto_threshold', 0);
			$threshold_rows = $this->request->variable('purgeguests_threshold_rows', 0);
			$interval = $this->request->variable('purgeguests_auto_interval', 30);

			// Enforce bounds
			$threshold = max(0, min(99999, $threshold));
			$threshold_rows = max(0, min(99999, $threshold_rows));
			$interval = max(10, min(86400, $interval));

			$this->config->set('purgeguests_auto_threshold', $threshold);
			$this->config->set('purgeguests_threshold_rows', $threshold_rows);
			$this->config->set('purgeguests_auto_interval', $interval);

			$this->log->add('admin', $this->user->data['user_id'], $this->user->ip, 'LOG_PURGEGUESTS_SETTINGS');

			trigger_error($this->user->lang('ACP_PURGEGUESTS_SAVED') . adm_back_link($this->u_action));
		}

		// Get active guest count (unique IPs within online time span)
		$online_time = (int) $this->config['load_online_time'] * 60;
		$sql = 'SELECT COUNT(DISTINCT session_ip) AS guest_count
			FROM ' . SESSIONS_TABLE . '
			WHERE session_user_id = ' . ANONYMOUS . '
				AND session_time >= ' . (time() - $online_time);
		$result = $this->db->sql_query($sql);
		$active_guest_count = (int) $this->db->sql_fetchfield('guest_count');
		$this->db->sql_freeresult($result);

		// Get total guest session rows
		$sql = 'SELECT COUNT(*) AS guest_count
			FROM ' . SESSIONS_TABLE . '
			WHERE session_user_id = ' . ANONYMOUS;
		$result = $this->db->sql_query($sql);
		$total_guest_count = (int) $this->db->sql_fetchfield('guest_count');
		$this->db->sql_freeresult($result);

		add_form_key('stoker_purgeguests');

		$thousands_sep = $this->user->lang('PURGEGUESTS_THOUSANDS_SEP');

		$this->template->assign_vars([
			'ACTIVE_GUEST_COUNT'			=> number_format($active_guest_count, 0, '', $thousands_sep),
			'TOTAL_GUEST_COUNT'				=> number_format($total_guest_count, 0, '', $thousands_sep),
			'PURGEGUESTS_AUTO_ENABLED'		=> (int) $this->config['purgeguests_auto_enabled'],
			'PURGEGUESTS_STAT_AUTO_COUNT'	=> number_format((int) $this->config['purgeguests_stat_auto_count'], 0, '', $thousands_sep),
			'PURGEGUESTS_EXCLUDE_REGISTER'	=> (int) $this->config['purgeguests_exclude_register'],
			'PURGEGUESTS_LOG_ENABLED'		=> (int) $this->config['purgeguests_log_enabled'],
			'PURGEGUESTS_AUTO_THRESHOLD'	=> (int) $this->config['purgeguests_auto_threshold'],
			'PURGEGUESTS_THRESHOLD_ROWS'	=> (int) $this->config['purgeguests_threshold_rows'],
			'PURGEGUESTS_AUTO_INTERVAL'		=> (int) $this->config['purgeguests_auto_interval'],
			'U_ACTION'						=> $this->u_action,
			'U_TOGGLE_ENABLED'				=> $this->u_action . '&amp;action=toggle&amp;setting=purgeguests_auto_enabled&amp;hash=' . generate_link_hash('togglepurgeguests_auto_enabled'),
			'U_TOGGLE_REGISTER'				=> $this->u_action . '&amp;action=toggle&amp;setting=purgeguests_exclude_register&amp;hash=' . generate_link_hash('togglepurgeguests_exclude_register'),
			'U_TOGGLE_LOG'					=> $this->u_action . '&amp;action=toggle&amp;setting=purgeguests_log_enabled&amp;hash=' . generate_link_hash('togglepurgeguests_log_enabled'),
		]);
	}

	/**
	 * Handle AJAX toggle for boolean settings.
	 */
	private function ajax_toggle_setting()
	{
		$setting = $this->request->variable('setting', '');

		if (!check_link_hash($this->request->variable('hash', ''), 'toggle' . $setting))
		{
			trigger_error('FORM_INVALID', E_USER_WARNING);
		}

		$valid_settings = [
			'purgeguests_auto_enabled',
			'purgeguests_exclude_register',
			'purgeguests_log_enabled',
		];

		if (!in_array($setting, $valid_settings, true))
		{
			trigger_error('FORM_INVALID', E_USER_WARNING);
		}

		$new_value = $this->config[$setting] ? 0 : 1;
		$this->config->set($setting, $new_value);

		if ($this->request->is_ajax())
		{
			$json_response = new \phpbb\json_response();
			$json_response->send(['success' => true]);
		}

		redirect($this->u_action);
	}
}