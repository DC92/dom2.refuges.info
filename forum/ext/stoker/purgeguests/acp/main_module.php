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

class main_module
{
	public $page_title;
	public $tpl_name;
	public $u_action;

	/**
	 * @param int    $id
	 * @param string $mode
	 */
	public function main($id, $mode)
	{
		global $phpbb_container;

		$this->tpl_name = 'acp_purgeguests';
		$this->page_title = 'ACP_PURGEGUESTS_TITLE';

		/** @var \stoker\purgeguests\controller\admin_controller $controller */
		$controller = $phpbb_container->get('stoker.purgeguests.admin_controller');
		$controller->set_u_action($this->u_action);
		$controller->display_settings();
	}
}