<?php
/**
 * Purge Guest Sessions extension for phpBB
 *
 * @package stoker/purgeguests
 * @copyright (c) 2026 Stoker
 * @license GNU General Public License, version 2 (GPL-2.0)
 */

declare(strict_types=1);

namespace stoker\purgeguests\migrations;

class add_config extends \phpbb\db\migration\migration
{
	/**
	 * {@inheritdoc}
	 */
	public static function depends_on()
	{
		return ['\phpbb\db\migration\data\v330\v330'];
	}

	/**
	 * {@inheritdoc}
	 */
	public function effectively_installed()
	{
		return $this->config->offsetExists('purgeguests_auto_threshold');
	}

	/**
	 * {@inheritdoc}
	 */
	public function update_data()
	{
		return [
			['config.add', ['purgeguests_auto_threshold', 0]],
			['config.add', ['purgeguests_threshold_rows', 0]],
			['config.add', ['purgeguests_auto_interval', 30]],
			['config.add', ['purgeguests_auto_enabled', 0]],
			['config.add', ['purgeguests_exclude_register', 0]],
			['config.add', ['purgeguests_last_check', 0, true]],
			['module.add', ['acp', 'ACP_CAT_DOT_MODS', 'ACP_PURGEGUESTS_TITLE']],
			['module.add', ['acp', 'ACP_PURGEGUESTS_TITLE', [
				'module_basename'	=> '\stoker\purgeguests\acp\main_module',
				'modes'				=> ['settings'],
			]]],
		];
	}

	/**
	 * {@inheritdoc}
	 */
	public function revert_data()
	{
		return [
			['module.remove', ['acp', 'ACP_PURGEGUESTS_TITLE', [
				'module_basename'	=> '\stoker\purgeguests\acp\main_module',
				'modes'				=> ['settings'],
			]]],
			['module.remove', ['acp', 'ACP_CAT_DOT_MODS', 'ACP_PURGEGUESTS_TITLE']],
			['config.remove', ['purgeguests_auto_threshold']],
			['config.remove', ['purgeguests_threshold_rows']],
			['config.remove', ['purgeguests_auto_interval']],
			['config.remove', ['purgeguests_auto_enabled']],
			['config.remove', ['purgeguests_exclude_register']],
			['config.remove', ['purgeguests_last_check']],
		];
	}
}