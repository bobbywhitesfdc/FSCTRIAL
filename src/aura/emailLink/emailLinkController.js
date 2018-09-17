({
    openEmail: function(component, event, helper) {
        window.open("mailto:" + component.get("v.emailId"))
    }
})