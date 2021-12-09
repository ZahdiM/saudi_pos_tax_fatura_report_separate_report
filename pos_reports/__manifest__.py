# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{

    'name': 'Saudia Tax Invoice for POS فاتورة ضريبية مبسطة',
    'version': '15.0.0.0',
    'category': 'Sales/Point of Sale',
    'sequence': 40,
    'summary': 'This Module will help in printing the separate simplified tax report for POS other than the default one, with barcode فاتورة ضريبية مبسطة',
    'description': """ Simplified Tax Report for POS
    Point of Sale tax report for saudi arabia
    Simplified VAT Report
    Saudi Arabia VAT Invoice
    VAT E-Invoice Standard
    E-Invoicing
    B2C VAT Invoice
    Fatora 
    فاتورة ضريبیة
    فاتورة ضريبية مبسطة
    """,
    'license': 'OPL-1',

    # Author
    'author': 'Mediod Consulting Pvt. Ltd.',
    'website': 'http://www.mediodconsulting.com/',
    'maintainer': 'Mediod Consulting Pvt. Ltd.',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_assets_common.xml',
    ],
    'demo': [
    ],
    'qweb': [
        'static/src/xml/Screens/ReceiptScreen/TaxReceipt.xml',
        'static/src/xml/Screens/ReceiptScreen/TaxInvoiceReceipt.xml',
        'static/src/xml/Screens/ReceiptScreen/ReceiptScreen.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'price': 29.80,
    'currency': 'USD',
}
