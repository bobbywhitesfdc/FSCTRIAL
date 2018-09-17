({
    raiseDataFetchedEvent: function(component, treeRoot){
        var compEvent = component.getEvent("onchange");
        var eventData = {
            treeRoot: treeRoot
        };
        compEvent.setParams({ data: eventData });
        compEvent.fire();
    },

    raiseDataErrorEvent: function(component, response){
        // add exception handling
        var errorMsg = this.getErrorMessage(response);
        var compEvent = component.getEvent("error");
        compEvent.setParams({error:errorMsg});
        compEvent.fire();
    },

    getErrorMessage: function(response) {
        var err = response.getError();
        var errors = [];
        for (var i = 0; i < err.length; i++) {
            errors.push(err[i].message);
        }
        var msg = errors.join(' ');
        if ($A.util.isEmpty(msg)) {
            msg = $A.get("$Label.FinServ.Msg_Error_General");
        }

        return msg;
    }
})