/*global QUnit*/

sap.ui.define([
	"emergencyso/emergencyso/controller/Emergency_So.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Emergency_So Controller");

	QUnit.test("I should test the Emergency_So controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
