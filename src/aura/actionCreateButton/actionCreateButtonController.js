({
	clickCreate: function(cmp, event, helper) {
		var createRecordEvent = $A.get(cmp.get("v.event"));
		var createParams = cmp.get("v.params") || {};
		// move to external params
		var clone = JSON.parse(JSON.stringify(createParams));
		clone.navigationLocation = 'RELATED_LIST';
		createRecordEvent.setParams(clone).fire();
	}
})