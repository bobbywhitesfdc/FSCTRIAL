({
    onInit: function(component) {
        var recordListAction = component.get("c.getClientsWithUpComingBirthdayByAgeAndRange");

        recordListAction.setParams({
            "age": component.get("v.age"),
            "dayAfterAge": component.get("v.dayAfterAge"),
            "nextNDays": component.get("v.dayRange"),
            "listSize": component.get("v.maxListSize")
        });

        recordListAction.setCallback(this, function(b) {
            var state = b.getState();
            if (state === "SUCCESS") {
                var result = b.getReturnValue();
                var RMDList = result['cards'];
                var recordCount = result['totalItems'];
                component.set("v.recordCount", recordCount);
                component.set("v.RMDList", RMDList);
            }
            else{
                component.set("v.errorState", true);
            }
        });
        $A.enqueueAction(recordListAction);
    }
})