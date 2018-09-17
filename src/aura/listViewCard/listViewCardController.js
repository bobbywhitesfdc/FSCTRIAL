({
	onInit: function(cmp, event, helper) {
		var dataProvider = cmp.get("v.dataProvider") ? cmp.get("v.dataProvider")[0] : null;
		if (dataProvider) {
			// May change to addEventHandler when we get more details
			//dataProvider.addHandler("onchange", cmp, "c.handleDataChange");
			//dataProvider.addHandler("error", cmp, "c.onDataLoadError");
		}
	},
	handleDataChange: function (cmp, event, helper) {
		// only show count and view all when there's no error 
		if (!cmp.get("v.hasDataLoadError")) {
			// Count is set on listViewDataProvider.provide() 
			var dataProvider = cmp.get("v.dataProvider") ? cmp.get("v.dataProvider")[0] : null;
			if (dataProvider) {
				var count = dataProvider.get("v.totalItems");
				cmp.set("v.subtitle", count);
				cmp.set("v.showViewAll", count > 0);
			}
		}
	},
	onDataLoadError: function(cmp, event, helper) {
		cmp.set("v.hasDataLoadError", true);
	}
})