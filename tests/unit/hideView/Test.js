// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dojo/when",
	"dapp/Application",
	"dapp/utils/view",
	"requirejs-text/text!dapp/tests/unit/hideView/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, when, Application, viewUtils, hideViewconfig) {
	// -------------------------------------------------------------------------------------- //
	// for hideViewSuite transition test
	var hideViewHtmlContent3 =
		"<d-view-stack id='hideViewApp3dviewStack' style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";
	var hideViewContainer,
		testApp,
		hideViewApp3Home1View,
		hideViewApp3Home2View,
		hideViewApp3Home3NoControllerView,
		hideViewNode;

	var hideViewSuite = {
		name: "hideViewSuite: test app transitions",
		setup: function () {
			hideViewContainer = document.createElement("div");
			document.body.appendChild(hideViewContainer);
			hideViewContainer.innerHTML = hideViewHtmlContent3;
			hideViewNode = document.getElementById("hideViewApp3dviewStack");

		},
		"test initial view and hide hideViewApp3Home1": function () {
			this.timeout = 20000;

			return when(new Application(JSON.parse(stripComments(hideViewconfig)), hideViewContainer)
				.then(function (app) {
					// we are ready to test
					testApp = app;

					var hideViewApp3Home1 = document.getElementById("hideViewApp3Home1");

					// Here hideViewApp3Home1View should be displayed

					hideViewApp3Home1View = viewUtils.getViewFromViewId(testApp, "hideViewApp3Home1");

					// check that init has been called on these views
					assert.isTrue(hideViewApp3Home1View.initialized,
						"hideViewApp3Home1View.initialized should be true");
					// check the DOM state to see if we are in the expected state
					assert.isNotNull(hideViewNode, "root hideViewNode must be here");
					assert.isNotNull(hideViewApp3Home1, "hideViewApp3Home1 view must be here");
					assert.strictEqual(hideViewApp3Home1View._beforeActivateCallCount, 1,
						"hideViewApp3Home1View._beforeActivateCallCount should be 1");

					checkNodeVisibility(hideViewNode, hideViewApp3Home1);
					// Currently showing hideViewApp3Home1View test transition to hide it
					return when(hideViewNode.hide("hideViewApp3Home1").then(function () {
						var hideViewApp3Home1 = document.getElementById("hideViewApp3Home1");
						hideViewApp3Home1View = viewUtils.getViewFromViewId(testApp, "hideViewApp3Home1");
						assert.isNull(hideViewApp3Home1);
						assert.isNull(hideViewApp3Home1View.parentNode);
					}));
				}));

		},
		// Currently showing hideViewApp3Home1 test transition back to hideViewApp3Home2
		"testApp.show and then hide 'hideViewApp3Home2'": function () {
			this.timeout = 20000;
			return when(testApp.showOrHideViews('hideViewApp3Home2')
				.then(function () {
					var hideViewApp3Home2 = document.getElementById("hideViewApp3Home2");
					hideViewApp3Home2View = viewUtils.getViewFromViewId(testApp, "hideViewApp3Home2");
					checkNodeVisibility(hideViewNode, hideViewApp3Home2);

					// Now hideViewApp3Home2View ActivateCallCounts should be 1
					checkActivateCallCount(hideViewApp3Home2View, 1);

					// Now hideViewApp3Home3NoControllerView DeactivateCallCounts should be 2
					checkDeactivateCallCount(hideViewApp3Home3NoControllerView, 1);
					// Now hideViewApp3Home1View DeactivateCallCounts should be 2
					checkDeactivateCallCount(hideViewApp3Home1View, 1);
					return when(testApp.showOrHideViews('-hideViewApp3Home2')
						.then(function () {
							var hideViewApp3Home2 = document.getElementById("hideViewApp3Home2");
							hideViewApp3Home2View = viewUtils.getViewFromViewId(testApp, "hideViewApp3Home2");
							assert.isNull(hideViewApp3Home2);
							assert.isNull(hideViewApp3Home2View.parentNode);

							// Now hideViewApp3Home2View ActivateCallCounts should be 1
							var view = hideViewApp3Home2View;
							var count = 1;
							assert.strictEqual(view._beforeActivateCallCount, count,
								view.id + " _beforeActivateCallCount should be " + count);
							assert.strictEqual(view._afterActivateCallCount, count,
								view.id + " _afterActivateCallCount should be " + count);

							// Now hideViewApp3Home3NoControllerView DeactivateCallCounts should be 2
							checkDeactivateCallCount(hideViewApp3Home2View, 1);
						}));
				}));
		},
		// Currently showing nothing test transition to hideViewApp3Home3NoController
		"hideViewNode.show('hideViewApp3Home3NoController')": function () {
			this.timeout = 20000;
			return when(hideViewNode.show('hideViewApp3Home3NoController').then(function () {
				var hideViewApp3Home3NoController = document.getElementById("hideViewApp3Home3NoController");
				checkNodeVisibility(hideViewNode, hideViewApp3Home3NoController);

				// Now hideViewApp3Home3NoControllerView ActivateCallCounts should be 2
				checkActivateCallCount(hideViewApp3Home3NoControllerView, 2);

				// Now hideViewApp3Home1View DeactivateCallCounts should be 2
				checkDeactivateCallCount(hideViewApp3Home1View, 1);
			}));

		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			hideViewContainer.parentNode.removeChild(hideViewContainer);
			testApp.unloadApp();
		}
	};

	registerSuite(hideViewSuite);

	function checkNodeVisibility(vs, target) {
		for (var i = 0; i < vs.children.length; i++) {
			if (vs.children[i] === target) {
				assert.strictEqual(vs.children[i].style.display, "",
					"checkNodeVisibility FAILED for target.id=" + target.id + " display should equal blank");
			} else {
				assert.strictEqual(vs.children[i].style.display, "none",
					"checkNodeVisibility FAILED other children style.display should equal none");
			}
		}
	}

	function checkActivateCallCount(view, count) {
		if (view) {
			assert.strictEqual(view._beforeActivateCallCount, count,
				view.id + " _beforeActivateCallCount should be " + count);
			assert.strictEqual(view._afterActivateCallCount, count,
				view.id + " _afterActivateCallCount should be " + count);

			//also test for selectedChildren being set correctly with constraint main
			var selectedChildId = testApp.selectedChildren.main.id;
			assert.strictEqual(view.id, selectedChildId, view.id + " should be in testApp.selectedChildren.main. ");

			//also test for view._active being set correctly to true
			assert.isTrue(view._active, "view_active should be true for " + view.id);
		}
	}

	function checkDeactivateCallCount(view, count) {
		if (view) {
			assert.strictEqual(view._beforeDeactivateCallCount, count,
				view.id + " _beforeDeactivateCallCount should be " + count);
			assert.strictEqual(view._afterDeactivateCallCount, count,
				view.id + " _afterDeactivateCallCount should be " + count);

			//also test for view._active being set correctly to false
			assert.isFalse(view._active, "view_active should be false for " + view.id);
		}
	}

	// strip out single line comments from the json config
	function stripComments(jsonData) {
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		return jsonData;
	}

});
