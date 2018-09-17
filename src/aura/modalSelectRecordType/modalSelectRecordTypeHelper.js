({
	onInit: function(component, event, helper) {
		if (component.get("v.recordTypes").length == 1) {
			var recType = component.get("v.recordTypes")[0];
			this.selectRecordType(component, recType.Id, recType.Name);
		} else {
			//Set body.
	        component.set("v.body", component.find("body"));

			//Set footer actions.
			var labelCancel = $A.get("$Label.FinServ.Button_Label_Cancel");
	        var cancelAction = {
	            title: labelCancel,
	            label: labelCancel,
	            isCancelAction: true
	        };
			var footerNextButton = component.find("nextButton");
			var footerActions = [footerNextButton, cancelAction];
			component.set("v.footerActions", footerActions);
		}
	},

	//Helper function to handle footer actions of the record type selector panel created above.
	onRecordTypeSelect: function(component) {
        var modalBody = component.find("body");
        var recordTypes = modalBody.get("v.recordTypes");
        var modal;
        var recordTypeId;
        var recordTypeName;

        if (recordTypes.length == 1) {
			var recType = recordTypes[0];
			recordTypeName = recType.Name;
			recordTypeId = recType.Id;
		} else {
            recordTypeId = component.get("v.selectedRecordTypeId");
            recordTypeName = component.get("v.selectedRecordTypeName");
		}
		
		this.selectRecordType(component, recordTypeId, recordTypeName);
	},

	selectRecordType: function(component, recordTypeId, recordTypeName) {
		var attributes = {
            "recordTypeId": recordTypeId,
			"recordTypeName": recordTypeName,
			"editMode": false
        };
		var selectRecordTypeEvent = component.getEvent("selectRecordTypeEvent");
		selectRecordTypeEvent.setParams(attributes);
		selectRecordTypeEvent.fire();
	},

	chooseRecordType: function(component, event, helper) {
		var selectedRecordTypeId = event.getParam("recordTypeId");
		var selectedRecordTypeName = event.getParam("recordTypeName") 
		component.set("v.selectedRecordTypeId", selectedRecordTypeId);
		component.set("v.selectedRecordTypeName", selectedRecordTypeName);
	}
})