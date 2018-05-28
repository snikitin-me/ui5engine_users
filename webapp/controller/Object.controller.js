/*global location*/
sap.ui.define(
  [
    'engine/users/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/routing/History',
    'engine/users/model/formatter',
    'sap/m/MessageToast'
  ],
  function(BaseController, JSONModel, History, formatter, MessageToast) {
    'use strict'

    return BaseController.extend('engine.users.controller.Object', {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the worklist controller is instantiated.
       * @public
       *
       * TODO: add extend points to sections as frgments
       */
      onInit: function() {
        // Model used to manipulate control states. The chosen values make sure,
        // detail page is busy indication immediately so there is no break in
        // between the busy indication for loading the view's meta data
        var iOriginalBusyDelay,
          oViewModel = new JSONModel({
            busy: true,
            delay: 0,
            isNew: null
          })
        this.getRouter()
          .getRoute('object')
          .attachPatternMatched(this._onObjectMatched, this)

        // Store original busy indicator delay, so it can be restored later on
        iOriginalBusyDelay = this.getView().getBusyIndicatorDelay()
        this.setModel(oViewModel, 'objectView')

        // set data model
        this.setModel(new JSONModel())

        $.getJSON(
          '/module/users/user/groups',
          function(response) {
            this.getModel('objectView').setProperty(
              '/groups',
              response.d.results
            )
          }.bind(this)
        )

        $.getJSON(
          '/module/users/user/regions',
          function(response) {
            this.getModel('objectView').setProperty(
              '/regions',
              response.d.results
            )
          }.bind(this)
        )
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Event handler  for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the worklist route.
       * @public
       */
      onNavBack: function() {
        var sPreviousHash = History.getInstance().getPreviousHash()

        if (sPreviousHash !== undefined) {
          history.go(-1)
        } else {
          this.getRouter().navTo('worklist', {}, true)
        }
      },

      handleEditPress: function() {
        //Clone the data
        this._oSupplier = jQuery.extend(
          {},
          this.getView()
            .getModel()
            .getData().SupplierCollection[0]
        )
        this._toggleButtonsAndView(true)
      },

      handleCancelPress: function() {
        //Restore the data
        var oModel = this.getView().getModel()
        var oData = oModel.getData()

        oData.SupplierCollection[0] = this._oSupplier

        oModel.setData(oData)
        this._toggleButtonsAndView(false)
      },

      onSavePress: function() {
        this._save()

        // TODO
        //this._toggleButtonsAndView(false);
      },

      onDeletePress: function() {
        this._deleteUser()
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      _formFragments: {},

      _toggleButtonsAndView: function(bEdit) {
        var oView = this.getView()
        // Show the appropriate action buttons
        oView.byId('edit').setVisible(!bEdit)
        oView.byId('save').setVisible(bEdit)
        oView.byId('cancel').setVisible(bEdit)

        // Set the right form type
        this._showFormFragment(bEdit ? 'Change' : 'Display')
      },

      _getFormFragment: function(sFragmentName) {
        var oFormFragment = this._formFragments[sFragmentName]

        if (oFormFragment) {
          return oFormFragment
        }

        oFormFragment = sap.ui.xmlfragment(
          this.getView().getId(),
          'engine.users.view.object.' + sFragmentName
        )

        this._formFragments[sFragmentName] = oFormFragment
        return this._formFragments[sFragmentName]
      },

      _showFormFragment: function(sFragmentName) {
        var oPage = this.getView().byId('page')

        oPage.removeAllContent()
        oPage.insertContent(this._getFormFragment(sFragmentName))
      },

      /**
       * Binds the view to the object path.
       * @function
       * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
       * @private
       */
      _onObjectMatched: function(oEvent) {
        var sObjectId = oEvent.getParameter('arguments').objectId
        var isNew = false

        if (sObjectId == '0') {
          this.getModel().setProperty('/', {
            code: '',
            email: '123',
            firstname: '',
            image: '',
            lastname: '',
            password: '',
            salt: '',
            status: '0',
            user_group_id: '0',
            username: '',
            region_id: '0'
          })
          this.getView().bindElement({ path: '/' })
          this._onBindingChange()

          isNew = true
        } else {
          this._loadUser(sObjectId)
        }

        this.getModel('objectView').setProperty('/isNew', isNew)
      },

      _save: function() {
        var oData = $.extend({}, this.getModel().getProperty('/'))

        var objectEntitySetName = this.getOwnerComponent().getObjectEntitySetName()

        $.post(objectEntitySetName, oData)
          .done(
            function(data) {
              MessageToast.show('Данные сохранет успешно.')

              if (this.getModel('objectView').getProperty('/isNew')) {
                var objectPropertyName = this.getOwnerComponent().getObjectPropertyName()
                this.getRouter().navTo(
                  'object',
                  {
                    objectId: data.d.results[objectPropertyName]
                  },
                  true
                )
              }
            }.bind(this)
          )
          .fail(
            function(jqXHR, text) {
              this.getOwnerComponent()
                .getErrorHandler()
                .showServiceError(jqXHR.responseText)
            }.bind(this)
          )
      },

      _deleteUser: function() {
        var objectEntitySetName = this.getOwnerComponent().getObjectEntitySetName()
        var objectPropertyName = this.getOwnerComponent().getObjectPropertyName()
        var url =
          objectEntitySetName +
          '/' +
          this.getModel().getProperty('/' + objectPropertyName)

        $.ajax(url, {
          method: 'DELETE',
          dataType: 'json',
          success: function(res) {
            MessageToast.show('Данные сохранены успешно')
            this.onNavBack()
          }.bind(this)
        })
      },

      _loadUser: function(id) {
        var objectEntitySetName = this.getOwnerComponent().getObjectEntitySetName()

        $.getJSON(
          objectEntitySetName + '/' + id,
          function(response) {
            this.getModel().setProperty('/', response.d.results)
            this.getView().bindElement({ path: '/' })
            this._onBindingChange()
          }.bind(this)
        )
      },

      _onBindingChange: function() {
        var oView = this.getView(),
          oViewModel = this.getModel('objectView'),
          oElementBinding = oView.getElementBinding()

        // No data for the binding
        if (!oElementBinding.getBoundContext()) {
          this.getRouter()
            .getTargets()
            .display('objectNotFound')
          return
        }

        // Everything went fine.
        oViewModel.setProperty('/busy', false)

        // Set the initial form to be the display one
        //this._showFormFragment("Display"); // TODO:
        this._showFormFragment('Change')
      },

      onExit: function() {
        for (var sPropertyName in this._formFragments) {
          if (!this._formFragments.hasOwnProperty(sPropertyName)) {
            return
          }

          this._formFragments[sPropertyName].destroy()
          this._formFragments[sPropertyName] = null
        }
      }
    })
  }
)
