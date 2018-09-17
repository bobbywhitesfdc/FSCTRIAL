({
	onInit: function(component, event, helper) {
		helper.onInit(component);
	},
	onChange : function(component, event, helper) {
		var accountRelatedList = component.find("accountRelatedList");
		var contactRelatedList = component.find("contactRelatedList");
        
        var accountRelList = accountRelatedList;
        var contactRelList = contactRelatedList;
        if($A.util.isArray(accountRelatedList) && !$A.util.isEmpty(accountRelatedList)){
        	accountRelList = accountRelatedList[0];
        }
        if($A.util.isArray(contactRelatedList) && !$A.util.isEmpty(contactRelatedList)){
        	contactRelList = contactRelatedList[0];
        }
        if(!$A.util.isEmpty(accountRelList)) {
            accountRelList.get("e.refresh").fire();
        }
		if(!$A.util.isEmpty(contactRelList)) {
			contactRelList.get("e.refresh").fire();
		}
	}
})