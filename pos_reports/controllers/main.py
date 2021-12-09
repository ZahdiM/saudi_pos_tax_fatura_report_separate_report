# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from datetime import datetime
from werkzeug.exceptions import Forbidden, NotFound

from odoo import  http
from odoo.http import request
from odoo.exceptions import ValidationError

class POSReports(http.Controller):

    @http.route(['/pos_reports/get_invoice_number'], type='json', auth="public", methods=['POST'], website=True, csrf=False)
    def get_invoice_number(self, pos_reference_number):
        """This route is called when changing quantity from the cart or adding
        a product from the wishlist."""
        pos_order = request.env['pos.order'].sudo().search([('pos_reference','=',pos_reference_number)])
        invoice_no= "---"
        if pos_order and pos_order.account_move:
            invoice_no=pos_order.account_move.name
        return invoice_no



