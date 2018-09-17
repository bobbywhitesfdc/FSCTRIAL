({
    render: function(component, helper) {
        helper.render(component);
        return this.superRender();
    },
    rerender: function(component, helper) {
        helper.render(component);
        return this.superRerender();
    }
})