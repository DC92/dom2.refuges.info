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

class add_log_config extends \phpbb\db\migration\migration
{
	/**
	 * {@inheritdoc}
	 */
	public static function depends_on()
	{
		return ['\stoker\purgeguests\migrations\add_config'];
	}

	/**
	 * {@inheritdoc}
	 */
	public function effectively_installed()
	{
		return $this->config->offsetExists('purgeguests_log_enabled');
	}

	/**
	 * {@inheritdoc}
	 */
	public function update_data()
	{
		return [
			['config.add', ['purgeguests_log_enabled', 1]],
		];
	}

	/**
	 * {@inheritdoc}
	 */
	public function revert_data()
	{
		return [
			['config.remove', ['purgeguests_log_enabled']],
		];
	}
}
