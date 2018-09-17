({
	onInit: function(component) {
		var pages = new Array();
		pages.push({
			"stepName": "detailsStep"
		});
		pages.push({
			"stepName": "membersStep"
		});
		component.set("v.pages", pages);

		//Set header, body.
		component.set("v.steps", [$A.get("$Label.FinServ.Wizard_Step_Group_Details"), $A.get("$Label.FinServ.Wizard_Step_Group_Members_Relationships")]);
		component.set("v.header", component.find("header"));
		component.set("v.body", component.find("body"));
		component.set("v.modalClass", "uiModal--medium forceModal");
		component.set("v.closeOnActionButtonClick", false);

		//move to members step if edit mode
		if(component.get("v.editMode")) {
			component.set("v.pageNumber", 1);
		}

		this.showStep(component);
		this.enforceCRUD(component);

		var defaultRowValues = component.get("v.defaultRowValues");
		var editMode = component.get("v.editMode");
		if(!$A.util.isEmpty(defaultRowValues) && !editMode) {
			//if account id is set, then its indirect, otherwise member
			if(defaultRowValues.hasOwnProperty("AccountId")) {
				component.set("v.defaultIndirectMember", defaultRowValues);
			} else if(defaultRowValues.hasOwnProperty("ContactId")) {
				component.set("v.defaultMember", defaultRowValues);
			}
		}
	},

	showStep: function(component) {
		var pageNumber = component.get("v.pageNumber");
		var page = this.getPage(component, pageNumber);
		//Update the footer to change the breadcrumb progess and switch the body component.
		if(!$A.util.isEmpty(page)) {
			component.set("v.stepName", page.stepName);
			var footer = component.find("footer");
			footer.set("v.currentStepIndex", pageNumber);
		}
		//hide spinner
		$A.get("e.force:toggleModalSpinner").setParams({
			"isVisible": false
		}).fire();
	},

	onCancel: function(component) {
		component.get("v.currentPanel").close();
	},

	changePage: function(component, delta) {
		//move page backwards
		var pageNumber = component.get("v.pageNumber") + delta;
		var page = this.getPage(component, pageNumber)
		if(!$A.util.isEmpty(page)) {
			component.set("v.pageNumber", pageNumber);
		}

		this.showStep(component);
	},

	saveGroup: function(component, event, helper) {
		var body = component.get("v.body")[0];
		var currentPage = this.getPage(component, component.get("v.pageNumber"));
		if(body.isInstanceOf("FinServ:createRelationshipGroup") && !$A.util.isEmpty(currentPage)) {
			body.save(function(detailPanel, state, saveResult, crudAction) {
				if(currentPage.stepName == "detailsStep") {
					//move to next step
					var recordId = saveResult.attributes.recordId;
					component.set("v.groupName", detailPanel.get("v.record").Name);
					component.set("v.recordId", recordId);
					helper.changePage(component, 1);
				} else if(currentPage.stepName == "membersStep") {
					//fire toast message from detail panel and close panel
					$A.get("e.force:toggleModalSpinner").setParams({
						"isVisible": false
					}).fire();
					
					var toastEvent = component.getEvent("showToast");
					toastEvent.setParams({
						name: component.get("v.groupName"),
						recordId: component.get("v.recordId"),
						isCreate: !component.get("v.editMode")
					}).fire();
					helper.onCancel(component);
				}
			});
		}
	},

	getPage: function(component, pageNumber) {
		var pages = component.get("v.pages");
		if(!$A.util.isEmpty(pages) && pageNumber >= 0 && pageNumber < pages.length) {
			return pages[pageNumber];
		}
		return null;
	},
	// Hides back and save buttons if needed
	enforceCRUD: function(component) {
        var action = component.get("c.getUserAccessPermissionsOnSObjects");
        var sObjects = ["Account", "Contact", "ContactContactRelation__c"];
        action.setParams({
            "sObjectNames": sObjects
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var value = response.getReturnValue();
                if (value != null) {
                    if (value["Account"] && !value["Account"]["canUpdate"]) {
                    	var backButton = component.find("backButton");
                    	$A.util.addClass(backButton, "slds-hide");
                    }
                    if (value["Contact"] && value["ContactContactRelation__c"]) {
                    	if (!(value["Contact"]["canUpdate"] || value["ContactContactRelation__c"]["canUpdate"] || value["ContactContactRelation__c"]["canCreate"])) {
                    		var saveButton = component.find("saveButton");
                    		$A.util.addClass(saveButton, "slds-hide");
                    	}
                    }
                }
            }
        });
        $A.enqueueAction(action);
    }
})