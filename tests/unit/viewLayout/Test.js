// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"decor/sniff",
	"dojo/when",
	"dapp/Application",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"delite/register",
	"requirejs-text/text!dapp/tests/unit/viewLayout/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, has, when, Application, domGeom, domClass, register, viewLayoutconfig) {
	// -------------------------------------------------------------------------------------- //

	// for viewLayoutSuite
	var viewLayoutContainer2,
		testApp,
		viewLayoutNode2;

	var viewLayoutHtmlContent2 =
		"<d-linear-layout id='viewLayoutAppdlayout' style='height:500px'>" +
		"</d-linear-layout>";

	var viewLayoutSuite = {
		name: "viewLayoutSuite dapp viewLayout: test app initial layout",
		setup: function () {
			viewLayoutContainer2 = document.createElement("div");
			document.body.appendChild(viewLayoutContainer2);
			viewLayoutContainer2.innerHTML = viewLayoutHtmlContent2;
			register.parse(viewLayoutContainer2);
			viewLayoutNode2 = document.getElementById("viewLayoutAppdlayout");
		},
		"viewLayoutSuite dapp viewLayout test domNode sizes": function () {
			this.timeout = 20000;
			if (has("ie") === 10) {
				this.skip("Skipping this test on IE10.");
			}

			// create the app from the config and wait for the promise
			return when(new Application(JSON.parse(stripComments(viewLayoutconfig)), viewLayoutContainer2)
				.then(function (app) {
					// we are ready to test
					testApp = app;

					// check the DOM state to see if we are in the expected state
					assert.isNotNull(document.getElementById("viewLayoutAppdlayout"),
						"root viewLayoutAppdlayout must be here");
					assert.isNotNull(document.getElementById("viewLayoutAppHome1"),
						"viewLayoutAppHome1 view must be here");
					assert.isNotNull(document.getElementById("viewLayoutAppHome2"),
						"viewLayoutAppHome2 view must be here");
					assert.isNotNull(document.getElementById("viewLayoutAppHome3NoController"),
						"viewLayoutAppHome3NoController view must be here");

					var children = viewLayoutNode2.getChildren();
					viewLayoutNode2.style.height = "600px";
					children[1].style.height = "";
					//	domClass.add(children[1], "fill");
					var box1 = domGeom.getMarginBox(children[0]);
					var box2 = domGeom.getMarginBox(children[1]);
					var box3 = domGeom.getMarginBox(children[2]);
					assert.strictEqual(box1.h, 200);
					assert.strictEqual(box3.h, 200);
					assert.strictEqual(box1.h, box2.h);
				}));
		},
		// hide one view and verify sizes
		"viewLayoutSuite dapp viewLayout hide viiew and test domNode sizes": function () {
			this.timeout = 20000;
			if (has("ie") === 10) {
				this.skip("Skipping this test on IE10.");
			}

			return when(document.getElementById("viewLayoutAppdlayout").hide("viewLayoutAppHome2")
				.then(function () {
					assert.isNotNull(document.getElementById("viewLayoutAppdlayout"),
						"root viewLayoutAppdlayout must be here");
					assert.isNotNull(document.getElementById("viewLayoutAppHome1"),
						"viewLayoutAppHome1 view must be here");
					assert.isNotNull(document.getElementById("viewLayoutAppHome3NoController"),
						"viewLayoutAppHome3NoController view must be here");

					var children = viewLayoutNode2.getChildren();
					viewLayoutNode2.style.height = "600px";
					children[1].style.height = "";
					//	domClass.add(children[1], "fill");
					var box1 = domGeom.getMarginBox(children[0]);
					var box2 = domGeom.getMarginBox(children[1]);
					//	var box3 = domGeom.getMarginBox(children[2]);
					assert.strictEqual(box1.h, 300);
					assert.strictEqual(box2.h, 300);
					assert.strictEqual(box1.h, box2.h);
				}));
		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			viewLayoutContainer2.parentNode.removeChild(viewLayoutContainer2);
			if (testApp) {
				testApp.unloadApp();
			}
		}
	};
	registerSuite(viewLayoutSuite);

	// strip out single line comments from the json config
	function stripComments(jsonData) {
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		return jsonData;
	}

});
