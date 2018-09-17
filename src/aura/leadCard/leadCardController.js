({
    init: function (component, event, helper) {
        var objectName = component.get("v.sObjectName");
        var uId = $A.get("$SObjectType.CurrentUser.Id");
        var condition = {
            IsConverted: 'false',
            ownerId: uId
        };

        component.set("v.filterCriteria", condition);
        helper.getList(component);
        helper.getRecordCount(component);
    }
})