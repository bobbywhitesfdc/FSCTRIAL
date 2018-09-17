({	
	handleDataChange: function (cmp, event, helper) {
        var listViewCard = cmp.find("listViewCard");
        var dataProvider = listViewCard.get("v.dataProvider")[0];
        var count = dataProvider.get("v.totalItems");
        listViewCard.set("v.subtitle", count);
        listViewCard.set("v.showViewAll", count > 0);
    },
	onDataLoadError: function(cmp, event, helper) {
		var listViewCard = cmp.find("listViewCard");
        var dataProvider = listViewCard.get("v.dataProvider")[0];
        listViewCard.set("v.hasDataLoadError", true);
	},
    onInit: function(cmp, event, helper) {
        helper.getObjectInfo(cmp, event, helper);
    },
    onError: function(cmp, event, helper) {
        $A.get("e.force:toggleModalSpinner").setParams({
            isVisible: false
        }).fire();

        helper.showErrorToast(cmp);
    }
})