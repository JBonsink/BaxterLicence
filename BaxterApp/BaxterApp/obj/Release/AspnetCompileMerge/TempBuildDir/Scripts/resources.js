Resources = {
    Global: {},
    /*
    @param resources array of objects with a .name and .value property
    */
    AddGlobalResources: function (resources) {
        for (var i = 0; i < resources.length; ++i) {
            this.Global[resources[i].name] = resources[i].value;
        }
    },
    
    LogUndfinedResources: function (resources) {
        /// <signature>
        /// <summary>Prints all undefined resources to the console.</summary>
        /// <param name="resources" type="Array">Array of resource string names</param>
        /// </signature>
        for (var i = 0; i < resources.length; ++i) {
            if (!(resources[i] in this.Global)) console.log(resources[i] + " is undefined.");
        }
    }
}