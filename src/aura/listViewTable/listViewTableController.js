({
	onInit: function(cmp, event, helper) {
		var dataProvider = cmp.get("v.dataProvider") ? cmp.get("v.dataProvider")[0] : null;
		if(!$A.util.isEmpty(dataProvider) && (dataProvider.get("v.sObjectName") != cmp.get("v.sObjectName"))) {
			//when field set object and data provider object are different, need to set the relationship object
			//so that fields queried on in the data provider use the relationship
			var relationshipObject = cmp.get("v.sObjectName");
			if (/__c$/.test(relationshipObject)) {
				relationshipObject.replace("__c", "__r");
			}
			cmp.set("v.relationshipObject", relationshipObject);
		}
		helper.getFieldsList(cmp, event, helper);
	},
	expandListViewTable: function(component, event, helper) {
		var rowRecordId = event.getParam("rowRecordId");
		var firstTimeAccessed = event.getParam("firstTimeAccessed");
		var tableRow = $A.getComponent(component.find("listViewTableBody").getElement().querySelector("#listViewRow_" + rowRecordId));
		var tableRowParent = $A.getComponent(component.find("listViewTableBody").getElement().querySelector("#listViewRowParent_" + rowRecordId));
		$A.util.toggleClass(tableRowParent, "slds-hide");

		if (firstTimeAccessed) {
			helper.setExpandedTable(tableRow, rowRecordId, component.get("v.childTables"));
		}
	}
})