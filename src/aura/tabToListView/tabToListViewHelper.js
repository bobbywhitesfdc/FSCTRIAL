({
	navigateToListView : function(cmp, event, helper) {
		var action = cmp.get("c.getListViewIdByName");
		action.setParams({
			"sObjectName": cmp.get("v.objectName"),
			"listViewName": cmp.get("v.listViewName")
		});
		action.setCallback(this, function(response) {
			var state = response.getState();
			//defaults to recently viewed
			var listViewId = (state === "SUCCESS") ? response.getReturnValue() : null;
			var navEvent = $A.get("e.force:navigateToList");
			navEvent.setParams({
				"listViewId": listViewId,
				"scope": cmp.get("v.objectName")
			});
			navEvent.fire();
		});
		$A.enqueueAction(action);
	}
})