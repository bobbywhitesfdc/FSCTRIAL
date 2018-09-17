({
	onInit: function(cmp, event, helper) {
		helper.onInit(cmp, event, helper);
	},
	onFileChange: function(cmp, event, helper) {
		helper.onFileChange(cmp, event, helper);
	},
	onFileRemove: function(cmp, event, helper) {
		helper.onFileRemove(cmp, event, helper);
	},
	onSave: function(cmp, event, helper) {
		cmp.find("save").set("v.disabled", true);
		//tried setting without timeout, however aura renders everything at the same time
		//this will force the disable to render and then the list
		setTimeout($A.getCallback(function() {
			helper.onSave(cmp, event, helper);
		}), 1);
	}
})