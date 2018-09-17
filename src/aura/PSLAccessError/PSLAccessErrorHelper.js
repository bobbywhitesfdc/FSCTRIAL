({
	createPlaceholder : function(component) {
        var placeholder=component.get("v.placeholder");
        if(!$A.util.isEmpty(placeholder)){
            var attributes={
                name:placeholder
            };
            $A.createComponent("force:placeholder",attributes, function(placeholdercmp, status) {
            if (status === "SUCCESS") {
               var placeholderContainer= component.find("placeholder");
                placeholderContainer.set("v.body",placeholdercmp);
        	}
            });
		}
    }
})