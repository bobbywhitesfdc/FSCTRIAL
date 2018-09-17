({
	closeModal : function(component) {
		component.getEvent('notify').setParams({
   			action: 'closePanel',
   			typeOf: 'ui:closePanel'
		}).fire();
	}
})