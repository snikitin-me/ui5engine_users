sap.ui.define(['engine/users/controller/BaseController'], function(
  BaseController
) {
  'use strict'

  return BaseController.extend('engine.users.controller.NotFound', {
    /**
     * Navigates to the worklist when the link is pressed
     * @public
     */
    onLinkPressed: function() {
      this.getRouter().navTo('worklist')
    }
  })
})
