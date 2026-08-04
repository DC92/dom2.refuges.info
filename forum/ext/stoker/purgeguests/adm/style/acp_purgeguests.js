(function($) {
	'use strict';
	phpbb.addAjaxCallback('purgeguests_toggle', function(res) {
		if (typeof res.success === 'undefined' || !res.success) {
			return;
		}
		var checkbox = this.querySelector('input[type="checkbox"]');
		checkbox.checked = !checkbox.checked;
	});
})(jQuery);
