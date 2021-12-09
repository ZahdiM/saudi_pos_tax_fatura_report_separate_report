odoo.define('pos_tax_report_separate_reports.TaxInvoiceReceipt', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');

    class TaxInvoiceReceipt extends PosComponent {
        constructor() {
            super(...arguments);
            this._receiptEnv = this.props.order.getOrderReceiptEnv();
            /*this.set_invoice_number(this.props.order.name);
            alert(1);*/
        }
        /*set_invoice_number(pos_reference){
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
        }*/
        willUpdateProps(nextProps) {
            this._receiptEnv = nextProps.order.getOrderReceiptEnv();
        }
        get receipt() {
            return this.receiptEnv.receipt;
        }
        get orderlines() {
            return this.receiptEnv.orderlines;
        }
        get paymentlines() {
            return this.receiptEnv.paymentlines;
        }
        get isTaxIncluded() {
            return Math.abs(this.receipt.subtotal - this.receipt.total_with_tax) <= 0.000001;
        }
        get receiptEnv () {
          return this._receiptEnv;
        }
        isSimple(line) {
            return (
                line.discount === 0 &&
                line.unit_name === 'Units' &&
                line.quantity === 1 &&
                !(
                    line.display_discount_policy == 'without_discount' &&
                    line.price != line.price_lst
                )
            );
        }
    }
    TaxInvoiceReceipt.template = 'TaxInvoiceReceipt';

    Registries.Component.add(TaxInvoiceReceipt);

    return TaxInvoiceReceipt;
});
