odoo.define('pos_tax_report_separate_reports.ReceiptScreen', function (require) {
    'use strict';

    const { Printer } = require('point_of_sale.Printer');
    const { is_email } = require('web.utils');
    const { useRef, useContext } = owl.hooks;
    const { useErrorHandlers, onChangeOrder } = require('point_of_sale.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const AbstractReceiptScreen = require('point_of_sale.AbstractReceiptScreen');

    const ReceiptScreen = (AbstractReceiptScreen) => {
        class ReceiptScreen extends AbstractReceiptScreen {
            constructor() {
                super(...arguments);
                useErrorHandlers();
                onChangeOrder(null, (newOrder) => newOrder && this.render());
                this.orderTaxReceipt = useRef('tax-invoice-receipt');
                this.orderReceipt = useRef('order-receipt');
                this.orderQR =useRef('qr-receipt');
                const order = this.currentOrder;
                console.log("orderorderorderorderorderorder",order);
                const client = order.get_client();
                this.orderUiState = useContext(order.uiState.ReceiptScreen);
                this.orderUiState.inputEmail = this.orderUiState.inputEmail || (client && client.email) || '';
                this.is_email = is_email;
//                this.set_invoice_number(order.name);
            }
            set_invoice_number(pos_reference){
                this.rpc({
                        'route': '/pos_tax_report_separate_reports/get_invoice_number',
                        'params': {
                            'pos_reference_number': pos_reference,
                        },
                })
                .then(function (invoice_number) {
                    document.getElementById("invoice_number").innerHTML = invoice_number;
                    document.getElementById("invoice_number1").innerHTML = invoice_number;
                });
            }
            mounted() {
                // Here, we send a task to the event loop that handles
                // the printing of the receipt when the component is mounted.
                // We are doing this because we want the receipt screen to be
                // displayed regardless of what happen to the handleAutoPrint
                // call.
                setTimeout(async () => await this.handleAutoPrint(), 0);
            }
            async onSendEmail() {
                if (!is_email(this.orderUiState.inputEmail)) {
                    this.orderUiState.emailSuccessful = false;
                    this.orderUiState.emailNotice = 'Invalid email.';
                    return;
                }
                try {
                    await this._sendReceiptToCustomer();
                    this.orderUiState.emailSuccessful = true;
                    this.orderUiState.emailNotice = 'Email sent.'
                } catch (error) {
                    this.orderUiState.emailSuccessful = false;
                    this.orderUiState.emailNotice = 'Sending email failed. Please try again.'
                }
            }
            get orderAmountPlusTip() {
                const order = this.currentOrder;
                const orderTotalAmount = order.get_total_with_tax();
                const tip_product_id = this.env.pos.config.tip_product_id && this.env.pos.config.tip_product_id[0];
                const tipLine = order
                    .get_orderlines()
                    .find((line) => tip_product_id && line.product.id === tip_product_id);
                const tipAmount = tipLine ? tipLine.get_all_prices().priceWithTax : 0;
                const orderAmountStr = this.env.pos.format_currency(orderTotalAmount - tipAmount);
                if (!tipAmount) return orderAmountStr;
                const tipAmountStr = this.env.pos.format_currency(tipAmount);
                return `${orderAmountStr} + ${tipAmountStr} tip`;
            }
            get currentOrder() {
                return this.env.pos.get_order();
            }
            get nextScreen() {
                return { name: 'ProductScreen' };
            }
            /**
             * This function is called outside the rendering call stack. This way,
             * we don't block the displaying of ReceiptScreen when it is mounted; additionally,
             * any error that can happen during the printing does not affect the rendering.
             */
            async handleAutoPrint() {
                if (this._shouldAutoPrint()) {
                    await this.printReceipt();
                    await this.printTaxReceipt();
                    if (this.currentOrder._printed && this.currentOrder._taxprinted && this._shouldCloseImmediately()) {
                        this.orderDone();
                    }
                }
            }
            orderDone() {
                this.currentOrder.finalize();
                const { name, props } = this.nextScreen;
                this.showScreen(name, props);
            }
            async printTaxReceipt(print_for) {
                const isTaxPrinted = await this._printTaxReceipt(print_for);
                if (isTaxPrinted) {
                    console.log("tax receipt report printed for "+print_for);
                    this.currentOrder._taxprinted=true;
                }
            }
            async printReceipt() {
                const isPrinted = await this._printReceipt();
                if (isPrinted) {
                    console.log("order receipt printed");
                    this.currentOrder._printed = true;
                }
            }

            async _printTaxReceipt(print_for) {
                if (this.env.pos.proxy.printer) {
                    if(print_for=='qr'){
                        const printResult = await this.env.pos.proxy.printer.print_receipt(this.orderQR.el.outerHTML);
                    }
                    else if(print_for=='tax_invoice')
                    {
                         const printResult = await this.env.pos.proxy.printer.print_receipt(this.orderTaxReceipt.el.outerHTML);
                    }
                    if (printResultTax.successful) {
                        return true;
                    } else {
                        const { confirmed } = await this.showPopup('ConfirmPopup', {
                            title: printResultTax.message.title,
                            body: 'Do you want to print using the web printer?',
                        });
                        if (confirmed) {
                            // We want to call the _printWeb when the popup is fully gone
                            // from the screen which happens after the next animation frame.
                            await nextFrame();
                            return await this._printTaxReceiptWeb(print_for);
                        }
                        return false;
                    }
                } else {
                    return await this._printTaxReceiptWeb(print_for);
                }
            }

            async _printTaxReceiptWeb(print_for) {

                try {
                    if(print_for=='qr'){
                        var prtContent = document.getElementById("div_pos_qr_code");
                    }
                    else if(print_for=='tax_invoice'){
                        var prtContent = document.getElementById("div_tax_receipt");
                    }
                    else{
                        await this.showPopup('ErrorPopup', {
                            title: this.env._t('Invalid Printing Option'),
                            body: this.env._t(
                                'There is a programming error!!! Please contact your administrator!!!'
                            ),
                        });
                    return false;
                    }
                    //downloading report in pdf for record keeping.
//                    this._download_tax_report(prtContent.innerHTML);

                    //printing report for tax customer
                    var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                    WinPrint.document.write(prtContent.innerHTML);
                    console.log('WinPrint.document',WinPrint.document);
                    WinPrint.document.close();
                    WinPrint.focus();
                    WinPrint.print();
                    WinPrint.close();
                    return true;
                } catch (err) {
                    console.log("Error while printing report for:"+print_for,err);
                    await this.showPopup('ErrorPopup', {
                        title: this.env._t('Printing is not supported on some browsers'),
                        body: this.env._t(
                            'Printing is not supported on some browsers due to no default printing protocol ' +
                                'is available. It is possible to print your tickets by making use of an IoT Box.'
                        ),
                    });
                    return false;
                }
            }

            _download_tax_report(element){
                try{
//                    var doc = new jsPDF({ orientation: 'p', format: 'a4' });
                    var doc = new jsPDF({
                                          orientation: "landscape",
                                          format: 'a4'
                                        });
                    console.log(document.getElementById('div_tax_receipt').innerHTML);
                    doc.fromHTML(document.getElementById('div_tax_receipt').innerHTML, 0, 0, {
                      elementHandlers: function() {
                        return true;
                      },
                      'width': 1800
                    }, function() {
                      doc.save('test');
                    });

//                     printDoc.fromHTML($('#pdf').get(0), 10, 10, {'width': 180});
                }
                catch(error){
                    console.log("error downloading file",error);
                }
            }

            _shouldAutoPrint() {
                return this.env.pos.config.iface_print_auto && !this.currentOrder._printed;
            }
            _shouldCloseImmediately() {
                var invoiced_finalized = this.currentOrder.is_to_invoice() ? this.currentOrder.finalized : true;
                return this.env.pos.proxy.printer && this.env.pos.config.iface_print_skip_screen && invoiced_finalized;
            }
            async _sendReceiptToCustomer() {
                const printer = new Printer();
                const receiptString = this.orderReceipt.comp.el.outerHTML;
                const ticketImage = await printer.htmlToImg(receiptString);
                const order = this.currentOrder;
                const client = order.get_client();
                const orderName = order.get_name();
                const orderClient = { email: this.orderUiState.inputEmail, name: client ? client.name : this.orderUiState.inputEmail };
                const order_server_id = this.env.pos.validated_orders_name_server_id_map[orderName];
                await this.rpc({
                    model: 'pos.order',
                    method: 'action_receipt_to_customer',
                    args: [[order_server_id], orderName, orderClient, ticketImage],
                });
            }
        }
        ReceiptScreen.template = 'ReceiptScreen';
        console.log("ReceiptScreen",ReceiptScreen);
        return ReceiptScreen;
    };

    Registries.Component.addByExtending(ReceiptScreen, AbstractReceiptScreen);

    return ReceiptScreen;
});
