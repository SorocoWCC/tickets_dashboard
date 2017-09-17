
# -*- coding: utf-8 -*-
from openerp import http
import json
import logging 
_logger = logging.getLogger(__name__)

class DashboardController(http.Controller):

    def getDraftsPristineDict(instance, odooDraftsDict):
        cleanDict = {}

        for draft in odooDraftsDict:
            # _logger.info("=> Iteration")
            # _logger.info(draft)
            key = draft["name"]
            #_logger.info("=> Index" + key)
            cleanDict[draft["name"]] = draft

        #_logger.info(cleanDict)
        return cleanDict

    def getListDIff(instance, odooDraftsDict, qTicketList):
        diffDict = {"added":[], "removed":[]}
        toRemoveKeyList = []

        _logger.info("=> Qticket List Start:")

        # Check every order from Odoo and save the 
        # ID's of each order already loaded
        if len(qTicketList) > 0:
            for xKey in qTicketList:
                for yKey in odooDraftsDict:
                    cDraft = odooDraftsDict[yKey]
                    if xKey == cDraft["name"]:
                        toRemoveKeyList.append(xKey);

            # Remove any orders repeated from the list retrieved by Odoo
            for key in toRemoveKeyList:
                del odooDraftsDict[key]
                qTicketList.remove(key)
                        
        # Get the remaining Ids in the list and set them
        # as "to remove" in Qticket
        if len(qTicketList) > 0:
            for nKey in qTicketList:
                diffDict["removed"].append(nKey)
                qTicketList.remove(nKey)

        _logger.info("=====> qTicketList remaining")
        _logger.info(qTicketList)

        # Process and filter the results from Odoo 
        # to retrieve them to Qticket
        if len(odooDraftsDict) > 0:
            for draftKey in odooDraftsDict:
                currentDraft = odooDraftsDict[draftKey]

                diffDict["added"].append({
                    "id": currentDraft["name"],
                    "client": currentDraft["partner_id"],
                    "ticket": currentDraft["placa"]
                 })

        return diffDict;

    @http.route('/rest/purchases/drafts/list', type='json', auth='public', methods=['POST'], website=True)
    def getDraftsList(self, **args):
        drafts = http.request.env['purchase.order'].search_read([('state', '=', 'draft'), ('pago_caja', '=', 'pendiente')])
        ids = args.get('ids', False)
        qTicketList = ids['ids']

        draftsDict = self.getDraftsPristineDict(drafts);

        updatesList = self.getListDIff(draftsDict, qTicketList);

        return json.dumps(updatesList)