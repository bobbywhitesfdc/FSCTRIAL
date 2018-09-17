({
    doInit: function(component) {
        
        var self = this;
        self.showLoading(component, true);
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        var action = component.get("c.getAllHouseholdMembers");
        action.setParams({
            "identifier": component.get("v.recordId"),
            "extraFieldsString": component.get("v.fieldsToQuery")
        });
        component.set("v.records", []);
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                var records = result.members;
                //This is a hack around the issue with namespace till we have fieldset support
                var _outResult = JSON.parse(JSON.stringify(records).split(prefix).join(""));
                var householdId = result.account.Id;
                component.set("v.householdId", householdId);
                component.set("v.householdName", result.account.Name);
                component.set("v.records", _outResult);
                component.set("v.memberCount", records.length);
                //set create params
                var params = component.get("v.createParam");
                params = ($A.util.isEmpty(params)) ? {} : params;
                //if householdId is set, it is edit
                params.recordId = householdId;
                params.groupName = component.get("v.householdName");
                params.editMode = (!$A.util.isEmpty(householdId));
                component.set("v.createParam", params);
            }
            self.showLoading(component, false);
        });
        $A.enqueueAction(action);
    },
    showLoading: function(component, visible) {
        $A.util.toggleClass(component, "loading", !!visible);
    }
})