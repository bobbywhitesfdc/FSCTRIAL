({
    afterRender: function(component, helper) {
        var ret = this.superAfterRender();
        var c = component.getElement();
        c.appendChild(helper.pieChart(component));
        return ret;
    },

    rerender: function(component, helper) {
        var ret = this.superRerender();
        var c = component.getElement();
        c.removeChild(c.lastChild);
        c.appendChild(helper.pieChart(component));
        return ret;
    }
})