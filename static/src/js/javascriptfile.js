(function() {

    /*Starts Editable Object*/
    var _model, _view, _controller, updateJob, body, containter, tPaidBody, 
    tUnpaidBody, ticketsTable,navBar,contentTable,contentTableLeftBar,moduleContainer,
    contentTableActionBar, oldObj, newObj,
    ticketsModel = {
        uiInited: true,
        attachHandlers: function(){
            var that = this;

            jQuery(document).on('keydown', function(e){
                if (e.keyCode === 27){
                    if (!body.hasClass('ticketList')) {
                        body.addClass('ticketList');
                        that.hideGlobalComps();
                        that.initUpdateJob(true);
                    }else{
                        body.removeClass('ticketList');
                        that.showGlobalComps();
                        that.initUpdateJob(false);
                    }
                };
            });
        },
        requestTickets: function(callback){
            var that = this,
            tickets = new openerp.Model('purchase.order');
        
            tickets.query(['name', 'partner_id', 'state'])
                .filter([['state', '!=', 'cancel'], ['pago_caja', '=', 'pendiente']])
                .limit(15)
                .all().then(function(tickets) {
                    newObj = JSON.stringify(tickets);
                    if (newObj !== oldObj) {
                        callback(tickets);
                    };
                });
        },
        initUpdateJob: function(activate){
            var that = this;
            console.log('execution');
            if (activate) {
                updateJob = window.setInterval(function() {
                    that.requestTickets(function(tickets){
                        var drafts = '', orders = '';

                        jQuery.each(tickets, function( index, value ) {
                            var row = '<tr><td>'+value.name +' - '+value.partner_id[1]+'</td></tr>';
                            if (value.state === 'draft' || value.state === 'confirmed') {
                                drafts += row;
                            }else if(value.state === 'approved'){
                                orders += row;
                            }else{};
                        });
                        tUnpaidBody.html(drafts);
                        tPaidBody.html(orders);
                    });
                }, 10000);
            }else{
                 window.clearInterval(updateJob);
            }
        },
        renderUI: function(){
            body.addClass('ticketList');
            this.initGlobalComps();
            this.hideGlobalComps();

            tUnpaidBody = container.find('#drafts-tck-table tbody');
            tPaidBody = container.find('#orders-tck-table tbody');
            this.initUpdateJob(true);
        },
        initGlobalComps:function (){
            navBar = body.find('#oe_main_menu_navbar');
            contentTable = body.find('table.oe_webclient tbody');
            contentTableLeftBar = contentTable.find('td.oe_leftbar');
            moduleContainer = contentTable.find('td.oe_application');
            contentTableActionBar = moduleContainer.find('table.oe_view_manager_header');
            this.uiInited = true;
        },
        hideGlobalComps: function(){
            navBar.hide();
            contentTableLeftBar.hide();
            contentTableActionBar.hide();
            container.show();
        },
        showGlobalComps: function(){
            navBar.show();
            contentTableLeftBar.show();
            contentTableActionBar.show();
            container.hide();
        },
        _init: function(model, view, controller){
            _model = model;
            _view = view;
            _controller = controller;

            if (view == 'list' && controller.model == 'tickets.dashboard'){
                this.renderUI();
                this.attachHandlers();
            }
        }
    },
    /*Ends Editable Object*/

    /*===DO NOT TOUCH===*/
    loading = function() {
        /*@TODO: Create load(splash) screen to show until the DOM is fully loaded*/
    },
    igniter = function(model, fnObj){
        var watcher = window.setInterval(function() {
            var view, controller, cont = $('.oe_view_manager.oe_view_manager_current .oe_view_manager_body .custom-container');

            if (model && model.action_manager && model.action_manager.inner_widget  
                && model.action_manager.inner_widget.active_view  && cont.length > 0) {
                view = model.action_manager.inner_widget.active_view;
                controller = model.action_manager.inner_widget.views[view].controller;
                container = cont;

                window.clearInterval(watcher);
                fnObj._init(model, view, controller);
            }
        }, 2000);
    };
    
    jQuery(document).ready(function(){
        body = jQuery('body');

        openerp.web.WebClient.include({
            start: function() {
                this._super();
                igniter(this, ticketsModel);
            },
        });
    });

})(window);