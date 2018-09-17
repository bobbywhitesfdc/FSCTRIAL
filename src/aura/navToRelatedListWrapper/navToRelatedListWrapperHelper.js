({
	navigate : function(component) {
		// Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        var parentRecordId = component.get("v.parentRecordId");
        var relatedListId = component.get("v.relatedListId");

        //Namespace prefix should not be added if the object is standard
        if (relatedListId.toLowerCase().indexOf(prefix) != 0 && /__r$/.test(relatedListId.toLowerCase())) {
            relatedListId = prefix + relatedListId;
        }
        
        var relatedEvent = $A.get("e.force:navigateToRelatedList");
        relatedEvent.setParams({
            "relatedListId": relatedListId,
            "parentRecordId": parentRecordId
        });
        relatedEvent.fire();
	}
})