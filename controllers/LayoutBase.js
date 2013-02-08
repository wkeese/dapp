define(["dojo/_base/lang", "dojo/_base/declare", "dojo/sniff", "dojo/_base/window", "dojo/_base/config",
		"dojo/topic", "dojo/dom-style", "../utils/constraints", "../Controller"],
function(lang, declare, has, win, config, topic, domStyle, constraints, Controller){
	// module:
	//		dojox/app/controllers/LayoutBase
	// summary:
	//		Bind "layout" and "select" events on dojox/app application instance.

	return declare("dojox.app.controllers.LayoutBase", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "initLayout" and "layoutView" events on application instance.
			//
			// app:
			//		dojox/app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"initLayout": this.initLayout,
				"layoutView": this.layoutView,
				"resize": this.onResize
			};
			// if we are using dojo mobile & we are hiding address bar we need to be bit smarter and listen to
			// dojo mobile events instead
			if(config.mblHideAddressBar){
				topic.subscribe("/dojox/mobile/afterResizeAll", lang.hitch(this, this.onResize));
			}else{
				// bind to browsers orientationchange event for ios otherwise bind to browsers resize
				this.bind(win.global, has("ios") ? "orientationchange" : "resize", lang.hitch(this, this.onResize));
			}
		},

		onResize: function(){
			this._doResize(this.app);
			// this is needed to resize the children on an orientation change or a resize of the browser.
			// it was being done in _doResize, but was not needed for every call to _doResize.
			for(var hash in this.app.selectedChildren){  // need this to handle all selectedChildren
				if(this.app.selectedChildren[hash]) {
					this._doResize(this.app.selectedChildren[hash]);
				}
			}
			
		},
		
		initLayout: function(event){
			// summary:
			//		Response to dojox/app "initLayout" event.
			//
			// example:
			//		Use dojo/on.emit to trigger "initLayout" event, and this function will respond to the event. For example:
			//		|	on.emit(this.app.evented, "initLayout", view);
			//
			// event: Object
			// |		{"view": view, "callback": function(){}};
			this.app.log("in app/controllers/LayoutBase.initLayout event=",event);
			this.app.log("in app/controllers/LayoutBase.initLayout event.view.parent.name=[",event.view.parent.name,"]");
		},


		_doLayout: function(view){
			// summary:
			//		do view layout.
			//
			// view: Object
			//		view instance needs to do layout.

			if(!view){
				console.warn("layout empty view.");
				return;
			}
		},

		_doResize: function(view){
			// summary:
			//		resize view.
			//
			// view: Object
			//		view instance needs to do resize.
			this.app.log("in LayoutBase _doResize called for view.id="+view.id+" view=",view);
			this._doLayout(view);
		},

		layoutView: function(event){
			// summary:
			//		Response to dojox/app "layoutView" event.
			//
			// example:
			//		Use dojo/on.emit to trigger "layoutView" event, and this function will response the event. For example:
			//		|	on.emit(this.app.evented, "layoutView", view);
			//
			// event: Object
			// |		{"parent":parent, "view":view, "removeView": boolean}
			var parent = event.parent || this.app;
			var view = event.view;

			if(!view){
				return;
			}
			
			// if the parent has a child in the view constraint it has to be hidden, and this view displayed.
			var parentSelChild = constraints.getSelectedChild(parent, view.constraint);
			if(event.removeView){  // if this view is being removed set display to none and the selectedChildren entry to null
				this.hideView(view);
				if(view == parentSelChild){
					constraints.setSelectedChild(parent, view.constraint, null);  // remove from selectedChildren
				}
			}else if(view !== parentSelChild){
				if(parentSelChild){
				//	domStyle.set(parentSelChild.domNode, "zIndex", 25);
					this.hideView(parentSelChild);
				}
				this.showView(view);
				//domStyle.set(view.domNode, "zIndex", 50);
				constraints.setSelectedChild(parent, view.constraint, view);
			}
		},

		hideView: function(view){
			domStyle.set(view.domNode, "display", "none");
		},

		showView: function(view){
			domStyle.set(view.domNode, "display", "");
		}
	});
});
