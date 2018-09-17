({
	doInit : function(component) {
		var selectedOptions = [];
		var value = component.get("v.value");
		//iterate through data and create objects
		if(!$A.util.isEmpty(value)) {
			value.split(";").forEach(function(val){
                selectedOptions.push({label: val});
			});
		}
		component.set("v.selectedOptions", selectedOptions);
	},
	onSelectedChange: function(component) {
		//join data into 1 string on any change
		var selectedOptions = [];
		component.get("v.selectedOptions").forEach(function(opt){
            selectedOptions.push(opt.label);
		});
		component.set("v.value", selectedOptions.join(";"));
	}
})