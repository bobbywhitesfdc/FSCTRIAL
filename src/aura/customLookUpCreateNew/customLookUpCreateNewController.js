({
	onClick: function(component, event, helper) {
		var createNew = component.get("v.option");
		var newEvent = $A.get(createNew.CreateNewEvent);
        if (createNew.Attributes != null) {
            newEvent.setParams(createNew.Attributes);
        }
        newEvent.setParam("navigationLocationId", component.get("v.parentGlobalId"));
        newEvent.fire();
	}
})