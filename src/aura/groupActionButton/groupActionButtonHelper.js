({
    clickActionButton: function(component) {
        var editMode = component.get("v.editMode");
        if (editMode) {
            var params = component.get("v.params");
            params = JSON.parse(JSON.stringify(params));
            params["editMode"] = true;
            component.find("createPanelUtility").createPanel("FinServ:modalCreateRelationshipGroup", params);
        } else {
            this.createGroup(component);
        }
    },
    createGroup: function(component) {
        var getGroupRecordTypesAction = component.get("c.getGroupRecordTypes");
        $A.get("e.force:toggleModalSpinner").setParams({
            "isVisible": true
        }).fire();
        getGroupRecordTypesAction.setStorable();
        getGroupRecordTypesAction.setCallback(this, function(response) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": false
            }).fire();
            var state = response.getState();
            if (state === "SUCCESS") {
                var groupRecordTypes = response.getReturnValue();
                //If there is only 1 group record type, open the createRelationship group modal directly.
                var params = {
                    "recordTypes": groupRecordTypes,
                    "title": $A.get("$Label.FinServ.Header_Panel_Group_New"),
                    "selectRecordTypeEvent": component.getReference("c.handleRecordTypeSelection")
                };
                var panelAttributes = { "createBody": (groupRecordTypes.length > 1) };
                component.find("createPanelUtility").createPanel("FinServ:modalSelectRecordType", params, panelAttributes);
            } else if (state === "ERROR") {
                component.set("v.showErrors", true);
                component.set("v.errors", response.getError());
            }
        });
        $A.enqueueAction(getGroupRecordTypesAction);
    },
    handleRecordTypeSelection: function(component, event) {
        var params = event.getParams();
        params = JSON.parse(JSON.stringify(params));
        var componentParams = component.get("v.params");
        params.defaultRowValues = componentParams.defaultRowValues;
        params.showRelatedAccounts = componentParams.showRelatedAccounts;
        params.showRelatedContacts = componentParams.showRelatedContacts;
        component.find("createPanelUtility").createPanel("FinServ:modalCreateRelationshipGroup", params);
    }
})