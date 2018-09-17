({
    doInit: function (component, event, helper) {
        helper.getValues(component);
    },

	onChange: function(component, event, helper) {
		//use helper function to determine if event is pertinent
		if(helper.isEventRelated(component, event)) {
			component.refresh();
		}
	} 
})