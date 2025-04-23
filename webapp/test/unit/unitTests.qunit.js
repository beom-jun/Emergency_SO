/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"emergencyso/emergencyso/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
