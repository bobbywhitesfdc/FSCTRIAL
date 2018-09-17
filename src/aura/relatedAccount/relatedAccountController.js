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
    onInit: function(component, event, helper) {
    	helper.getObjectInfo(component, event, helper);
    },
    onError: function(component, event, helper) {
        $A.get("e.force:toggleModalSpinner").setParams({
            isVisible: false
        }).fire();

        helper.showErrorToast(component);
    }
})