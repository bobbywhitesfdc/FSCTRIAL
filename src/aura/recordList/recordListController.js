({
	getList: function(component, event, helper) {
		 //if PSL check fails, then don't retrieve records
        if (!component.get("v.hasLicense")) {
            return;
        }
        
        if (component.get("v.filterRequired") && $A.util.isEmpty(component.get("v.filterCriteria"))) {
        	return;
        }

        helper.getList(component.getConcreteComponent());
        helper.getRecordCount(component.getConcreteComponent());
    }
})