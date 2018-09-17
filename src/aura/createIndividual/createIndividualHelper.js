({
	setStep: function(component) {
		var pageNumber = component.get("v.currentPage");
		var pages = component.get("v.pages");
		component.set("v.objectName", null);
		if(!$A.util.isEmpty(pages) && pageNumber >= 0 && pageNumber < pages.length) {
			var currentPage = pages[pageNumber];
			//set step name/number
			component.set("v.currentStep", currentPage.stepName);
			component.set("v.stepNumber", currentPage.stepIndex + 1);
			//set total steps
			var totalSteps = 0;
			pages.forEach(function(page) {
				if(currentPage.pageName == page.pageName) {
					totalSteps++;
				}
			});
			component.set("v.totalSteps", totalSteps);
			//set object name
			if(currentPage.stepName == "accountDetailsStep") {
				component.set("v.objectName", "Account");
				component.set("v.title", $A.get("$Label.FinServ.Header_Wizard_New_Client"));
				component.set("v.subtitle", $A.get("$Label.FinServ.Wizard_Step_Account_Details"));
			} else if(currentPage.stepName == "contactDetailsStep") {
				component.set("v.objectName", "Contact");
				component.set("v.title", $A.get("$Label.FinServ.Header_Wizard_New_Client"));
				component.set("v.subtitle", $A.get("$Label.FinServ.Wizard_Step_Contact_Details"));
			} else if(currentPage.stepName == "groupDetailsStep") {
				component.set("v.objectName", "AccountContactRelation");
				component.set("v.title", $A.get("$Label.FinServ.Header_Wizard_New_Client_Group"));
				component.set("v.subtitle", $A.get("$Label.FinServ.Wizard_Step_Relationship_Group_Details"));
			} 
		}
	},
	save: function(component, event, helper) {
		var params = event.getParam("arguments");

		var detailPanel = component.find("detailPanel");
		if(!$A.util.isEmpty(detailPanel) && detailPanel.length == 1) {
			detailPanel = detailPanel[0];
		}

		detailPanel.save({
			successHandler: params.callback
		});
	}
})