({
	changeProgess: function(component, event, helper) {
		var currentStepIndex = component.get("v.currentStepIndex");
		var numberOfSteps = component.get("v.steps").length;
		if (numberOfSteps > 1 && currentStepIndex >= 0) {
			var progress = (100/(numberOfSteps-1))*currentStepIndex;
			component.set("v.progress", "width: " + progress + "%;");
		}
	}
})