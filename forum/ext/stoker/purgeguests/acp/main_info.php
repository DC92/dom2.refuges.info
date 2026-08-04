<?php
/**
 * Purge Guest Sessions extension for phpBB
 *
 * @package stoker/purgeguests
 * @copyright (c) 2026 Stoker
 * @license GNU General Public License, version 2 (GPL-2.0)
 */

declare(strict_types=1);

namespace stoker\purgeguests\acp;

class main_info
{
	public function module()
	{
		return [
			'filename'	=> '\stoker\purgeguests\acp\main_module',
			'title'		=> 'ACP_PURGEGUESTS_TITLE',
			'modes'		=> [
				'settings'	=> [
					'title'	=> 'ACP_PURGEGUESTS_SETTINGS',
					'auth'	=> 'ext_stoker/purgeguests && acl_a_board',
					'cat'	=> ['ACP_PURGEGUESTS_TITLE'],
				],
			],
		];
	}
}
