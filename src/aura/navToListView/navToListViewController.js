({
	onInit : function(component, event, helper) {
		helper.loadListViewId(component, event, helper);
	},
    navigate: function(component, event, helper){
        var navEvent = $A.get("e.force:navigateToList");
            navEvent.setParams({
                "listViewId":component.get("v.listViewId"),
                "scope": component.get("v.objectName")
            });
        navEvent.fire();
    }
})