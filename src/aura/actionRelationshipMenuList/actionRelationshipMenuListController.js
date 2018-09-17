({
    onEdit: function (cmp, event, helper) {
        var groupEdit = cmp.get("v.groupEdit");
        if (groupEdit) {
            var createPanelUtility = cmp.find("createPanelUtility");
            var groupAttributes = cmp.get("v.groupAttributes");
            var attributes = {
                "recordId": cmp.get("v.recordId"),
                "groupName": cmp.get("v.groupName"),
                "editMode": true,
                "showRelatedAccounts": groupAttributes != null ? groupAttributes.get("showRelatedAccounts") : true,
                "showRelatedContacts": groupAttributes != null ? groupAttributes.get("showRelatedContacts") : true
            }
            createPanelUtility.createPanel("FinServ:modalCreateRelationshipGroup", attributes);
        } else {
            $A.get("e.force:editRecord").setParams({
                "recordId": cmp.get("v.recordId")
            }).fire();
        }
    },
    onRemove: function (cmp, event, helper) {
        //popup confirmation modal
        var removeLabel = $A.get("$Label.FinServ.Button_Label_Remove");
        helper.createConfirmationModal(cmp, removeLabel, "remove");
    },
    onDelete: function (cmp, event, helper) {
        //popup confirmation modal
        var deleteLabel = $A.get("$Label.FinServ.Button_Label_Delete");
        helper.createConfirmationModal(cmp, deleteLabel, "delete");
    },
    onConfirmRemove: function(cmp, event, helper) {
        helper.onConfirmHelper("remove", cmp);
    },
    onConfirmDelete: function(cmp, event, helper) {
         helper.onConfirmHelper("delete", cmp);
    }
})