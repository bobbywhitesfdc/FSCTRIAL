({
	onInit: function(component, event, helper){
		var entity = component.get("v.entity");
		var groupAttributes = new Map();
		groupAttributes.set("showRelatedAccounts", component.get("v.showRelatedAccounts"));
		groupAttributes.set("showRelatedContacts", component.get("v.showRelatedContacts"));
		component.set("v.groupAttributes", groupAttributes);
		var bucketLabel = '';

		switch(entity.bucketType) {
			case 'RELATED_GROUP':
			bucketLabel = $A.get("$Label.FinServ.Header_Section_Related_Groups");
			break;
			case 'RELATIONSHIP_GROUP':
			bucketLabel = $A.get("$Label.FinServ.Label_Field_Set_Relationship_Groups");
			break;
			case 'RELATED_ACCOUNT':
			bucketLabel = $A.get("$Label.FinServ.Header_Section_Related_Accounts");
			break;
			case 'RELATED_CONTACT':
			bucketLabel = $A.get("$Label.FinServ.Header_Section_Related_Contacts");
			break;
			default:
			break;
		}
		component.set("v.nonGroupLabel", bucketLabel);
	}	
})