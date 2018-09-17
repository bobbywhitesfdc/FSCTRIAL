({
    clickActionButton: function(component) {
        var editMode = component.get("v.editMode");
        if (editMode) {
            var params = component.get("v.params");
            params = JSON.parse(JSON.stringify(params));
            component.find("createPanelUtility").createPanel("FinServ:modalCreateIndividual", params);
        } else {
            this.createIndividual(component);
        }
    },
    createIndividual: function(component) {
        var getIndividualRecordTypesAction = component.get("c.getIndividualRecordTypes");
        $A.get("e.force:toggleModalSpinner").setParams({
            "isVisible": true
        }).fire();
        getIndividualRecordTypesAction.setStorable();
        getIndividualRecordTypesAction.setCallback(this, function(response) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": false
            }).fire();
            var state = response.getState();
            if (state === "SUCCESS") {
                var recordTypeWrapper = response.getReturnValue();
                var recordTypes = recordTypeWrapper.recordTypes;
                component.set("v.individualMapping", recordTypeWrapper.individualMapping);
                //If there is only 1 individual record type, open the createIndividual modal directly.
                var params = { 
                    "recordTypes": recordTypes,
                    "title": $A.get("$Label.FinServ.Header_Panel_Individual_New"), 
                    "selectRecordTypeEvent": component.getReference("c.handleRecordTypeSelection")
                };

                var panelAttributes = { "createBody": (recordTypes.length > 1) };
                component.find("createPanelUtility").createPanel("FinServ:modalSelectRecordType", params, panelAttributes);
            } else if (state === "ERROR") {
                component.set("v.showErrors", true);
                component.set("v.errors", response.getError());
            }
        });
        $A.enqueueAction(getIndividualRecordTypesAction);
    },
    handleRecordTypeSelection: function(component, event) {
        var params = event.getParams();
        params = JSON.parse(JSON.stringify(params));
        params.contactFirst = component.get("v.contactFirst");
        //retrieve the individual mapping and get the contact record type
        if(params.contactFirst && !$A.util.isEmpty(component.get("v.individualMapping"))) {
            var contactRecordTypeId = component.get("v.individualMapping")[params.recordTypeId];
            params.recordTypeId = contactRecordTypeId;
        }
        component.find("createPanelUtility").createPanel("FinServ:modalCreateIndividual", params);
    }
})