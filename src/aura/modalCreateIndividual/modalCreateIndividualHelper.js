({
	onInit: function(component) {
		var contactFirst = component.get("v.contactFirst");
		var firstStep = (contactFirst) ? "contactDetailsStep" : "accountDetailsStep";
		var secondStep = (contactFirst) ? "accountDetailsStep" : "contactDetailsStep";
		var pages = new Array();
		pages.push({
			"pageName": "individual",
			"pageIndex": 0,
			"stepIndex": 0,
			"stepName": firstStep
		});
		pages.push({
			"pageName": "individual",
			"pageIndex": 0,
			"stepIndex": 1,
			"stepName": secondStep
		});
		pages.push({
			"pageName": "group",
			"pageIndex": 1,
			"stepIndex": 0,
			"stepName": "groupDetailsStep"
		});
		component.set("v.pages", pages);

		//Set header, body.
		component.set("v.steps", [$A.get("$Label.FinServ.Wizard_Step_Individual_Details"), $A.get("$Label.FinServ.Wizard_Step_Relationship_Group_Details")]);
		component.set("v.header", component.find("header"));
		component.set("v.body", component.find("body"));
		component.set("v.modalClass", "uiModal--medium forceModal");
		component.set("v.closeOnActionButtonClick", false);

		this.showStep(component);
	},

	showStep: function(component) {
		var pageNumber = component.get("v.pageNumber");
		var page = this.getPage(component, pageNumber);
		//Update the header to change the breadcrumb progess and switch the body component.
		if(!$A.util.isEmpty(page)) {
			var footer = component.find("footer");
			footer.set("v.currentStepIndex", page.pageIndex);
		}
		//hide spinner
		$A.get("e.force:toggleModalSpinner").setParams({
			"isVisible": false
		}).fire();
	},

	changePage: function(component, delta) {
		//change page
		var pageNumber = component.get("v.pageNumber") + delta;
		var page = this.getPage(component, pageNumber)
		if(!$A.util.isEmpty(page)) {
			var defaultFieldValues = {};

			// Default to contact id and primary group
			if(page.stepName === "groupDetailsStep") {
				defaultFieldValues = {
					ContactId: component.get("v.contactId")
				};
				//set primaryGroup
				var prefix = component.getType().split(":")[0];
				var primaryGroupField = ((prefix == "c") ? "" : prefix + "__") + "PrimaryGroup__c";
				defaultFieldValues[primaryGroupField] = true;
			}
			component.set("v.defaultFieldValues", defaultFieldValues);
			component.set("v.recordTypeId", null);
			component.set("v.recordId", (page.stepName == "accountDetailsStep") ? component.get("v.accountId") : (page.stepName == "contactDetailsStep") ? component.get("v.contactId") : null);
			component.set("v.pageNumber", pageNumber);
		}

		this.showStep(component);
	},

	saveIndividual: function(component, event, helper) {
		//save source
		var saveButton = component.find("saveButton");
		var isSave = (!$A.util.isEmpty(saveButton) && event.getSource().getGlobalId() == saveButton.getGlobalId());
		var saveAndNewButton = component.find("saveAndNewButton");
		var isSaveAndNew = (!$A.util.isEmpty(saveAndNewButton) && event.getSource().getGlobalId() == saveAndNewButton.getGlobalId());

		//fire save function
		var body = component.get("v.body")[0];
		if(body.isInstanceOf("FinServ:createIndividual")) {
			component.set("v.errors", []);
			body.save(function(detailPanel, state, saveResult, crudAction) {
				//save the client name to use in toast message
				var entityApiName = detailPanel.get("v.entityApiName");
				if(!$A.util.isEmpty(entityApiName) && (entityApiName.toLowerCase() == "account" || entityApiName.toLowerCase() == "contact")) {
					component.set("v.individualName", detailPanel.get("v.record").Name);
				}
				if(isSave) {
					//redirect to account on save
					$A.get("e.force:toggleModalSpinner").setParams({
						"isVisible": false
					}).fire();
					$A.get("e.force:navigateToSObject").setParams({
						"recordId": component.get("v.accountId")
					}).fire();
					//fire toast message from detail panel
					var toastEvent = component.getEvent("showToast");
					toastEvent.setParams({
						name: component.get("v.individualName"),
						recordId: component.get("v.accountId")
					}).fire();
				} else if (isSaveAndNew) {
					//close modal, reopen
					$A.get("e.force:toggleModalSpinner").setParams({
						"isVisible": false
					}).fire();
					component.get("v.currentPanel").close();
					component.find("actionButton").openModal();
				} else {
					//move to next step
					var recordId = saveResult.attributes.recordId;
					helper.onRecordSave(component, recordId, helper);
				}
			});
		}
	},

	onRecordSave: function(component, recordId, helper) {
		//If the event source is the detailPanel, then the record saved is the correct record which was saved successfully.
		var nextPageNumber = component.get("v.pageNumber") + 1;
		var nextPage = this.getPage(component, nextPageNumber);
		//on the first step
		if (!$A.util.isEmpty(nextPage) && (nextPage.stepName === "accountDetailsStep" || nextPage.stepName === "contactDetailsStep")) {
			var contactFirst = component.get("v.contactFirst");
			var firstId = "v." + ((contactFirst) ? "contactId" : "accountId");
			var secondId = "v." + ((contactFirst) ? "accountId" : "contactId");
			var clientFunction = (contactFirst) ? "getClientAccountId" : "getClientContactId";

			//check to see if second id is already set
			if($A.util.isEmpty(component.get(secondId))) {
				//save the first id 
				component.set(firstId, recordId);
				// Get the second id
				var action = component.get("c." + clientFunction);
				action.setParams({
					recordId: recordId
				});
				action.setCallback(this, function(response) {
					var state = response.getState();
					if (state === "SUCCESS") {
						//save id and move to next page
						var returnValue = response.getReturnValue();
						var nextId = '';
						var primaryContact = '';
						
						if (contactFirst && nextPage.stepName === "accountDetailsStep") {
							nextId = returnValue['AccountId'];
							primaryContact = returnValue['PrimaryContact'];
						} else {
							nextId = returnValue;
						}
						
						component.set(secondId, nextId);

						if (contactFirst && nextPage.stepName === "accountDetailsStep" && $A.util.isEmpty(primaryContact)) {
							$A.enqueueAction(action);
						} else {
							helper.changePage(component, 1);
						}
					} else if (state === "ERROR") {
						//set errors and reopen to same page
						component.set("v.errors", response.getError());
						$A.get("e.force:toggleModalSpinner").setParams({
							"isVisible": false
						}).fire();
					}
				});

				//to display spinner set timeout
				setTimeout($A.getCallback(function() {
					$A.get("e.force:toggleModalSpinner").setParams({
						"isVisible": true
					}).fire();
					$A.enqueueAction(action);
				}), 1);
			} else {
				helper.changePage(component, 1);
			}
		} else if (!$A.util.isEmpty(nextPage) && nextPage.stepName === "groupDetailsStep") {
			//on save of second step, reopen to group
			helper.changePage(component, 1);
		}
	},

	getPage: function(component, pageNumber) {
		var pages = component.get("v.pages");
		if(!$A.util.isEmpty(pages) && pageNumber >= 0 && pageNumber < pages.length) {
			return pages[pageNumber];
		}
		return null;
	}
})