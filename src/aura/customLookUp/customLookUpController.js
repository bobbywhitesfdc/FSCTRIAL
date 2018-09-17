({
	doInit: function(component, event, helper){
		var entity = component.get("v.sObjectName");
		component.set("v.entities", [{label: '', name: entity}]);
		component.set("v.createableEntities", [entity]);

        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";

        //prepend namespace to field if custom
        var fieldName = component.get("v.fieldName");
        if(!$A.util.isEmpty(fieldName) && /__c$/.test(fieldName.toLowerCase())) {
			fieldName = prefix + fieldName;
	        component.set("v.fieldName", fieldName);
        }

        //prepend namespace to source if custom
        var source = component.get("v.source");
        if(!$A.util.isEmpty(source) && /__c$/.test(source.toLowerCase())) {
			source = prefix + source;
        	component.set("v.source", source);
	    }
	}
})