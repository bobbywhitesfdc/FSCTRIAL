({
    getActivitiesCount: function(component) {
        var action = component.get("c.getNumberOfActivities");
        var self = this;
        action.setParams({
            "identifier": component.get("v.identifier")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.activityCounts", response.getReturnValue());
            } else if (state === "ERROR") {
                this.fireErrorEvent(component, action);
            }
        });
        $A.enqueueAction(action);
    }
})