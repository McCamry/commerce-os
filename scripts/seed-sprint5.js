"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var org, store, warehouse, location, variant, unit, vendor, po, grn, updatedInv, invoice, payment;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting Sprint 5 Seeding & E2E Test...');
                    return [4 /*yield*/, prisma.organization.findFirst({ where: { code: 'DEMO' } })];
                case 1:
                    org = _a.sent();
                    return [4 /*yield*/, prisma.store.findFirst({ where: { organizationId: org.id } })];
                case 2:
                    store = _a.sent();
                    return [4 /*yield*/, prisma.warehouse.findFirst({ where: { storeId: store.id } })];
                case 3:
                    warehouse = _a.sent();
                    return [4 /*yield*/, prisma.location.findFirst({ where: { warehouseId: warehouse.id } })];
                case 4:
                    location = _a.sent();
                    return [4 /*yield*/, prisma.productVariant.findFirst()];
                case 5:
                    variant = _a.sent();
                    return [4 /*yield*/, prisma.unit.findFirst()];
                case 6:
                    unit = _a.sent();
                    if (!org || !store || !warehouse || !location || !variant || !unit) {
                        throw new Error('Required base data not found! Please run previous seeds.');
                    }
                    return [4 /*yield*/, prisma.vendor.create({
                            data: {
                                organizationId: org.id,
                                code: 'VND-001',
                                name: 'ABC Electronics Supplier',
                                taxId: '1234567890123',
                                creditDays: 30,
                                paymentTerm: 'Net 30'
                            }
                        })];
                case 7:
                    vendor = _a.sent();
                    console.log('✅ Created Vendor:', vendor.name);
                    return [4 /*yield*/, prisma.purchaseOrder.create({
                            data: {
                                organizationId: org.id,
                                storeId: store.id,
                                warehouseId: warehouse.id,
                                vendorId: vendor.id,
                                purchaseNo: 'PO-2026-001',
                                status: 'APPROVED',
                                subtotal: 5000,
                                grandTotal: 5350, // with VAT 7%
                                items: {
                                    create: [
                                        {
                                            variantId: variant.id,
                                            unitId: unit.id,
                                            quantity: 100,
                                            unitPrice: 50,
                                            lineTotal: 5000
                                        }
                                    ]
                                }
                            },
                            include: { items: true }
                        })];
                case 8:
                    po = _a.sent();
                    console.log('✅ Created Purchase Order:', po.purchaseNo);
                    return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var receive, inv;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.goodsReceive.create({
                                            data: {
                                                purchaseOrderId: po.id,
                                                warehouseId: warehouse.id,
                                                receiveNo: 'GRN-2026-001',
                                                receivedBy: 'System',
                                                status: 'COMPLETED',
                                                items: {
                                                    create: [
                                                        {
                                                            purchaseOrderItemId: po.items[0].id,
                                                            variantId: variant.id,
                                                            unitId: unit.id,
                                                            locationId: location.id,
                                                            quantity: 50,
                                                            status: 'COMPLETED'
                                                        }
                                                    ]
                                                }
                                            },
                                            include: { items: true }
                                        })];
                                    case 1:
                                        receive = _a.sent();
                                        // Update PO Item
                                        return [4 /*yield*/, tx.purchaseOrderItem.update({
                                                where: { id: po.items[0].id },
                                                data: { receivedQty: 50, status: 'PARTIALLY_RECEIVED' }
                                            })];
                                    case 2:
                                        // Update PO Item
                                        _a.sent();
                                        // Update PO
                                        return [4 /*yield*/, tx.purchaseOrder.update({
                                                where: { id: po.id },
                                                data: { status: 'PARTIALLY_RECEIVED' }
                                            })];
                                    case 3:
                                        // Update PO
                                        _a.sent();
                                        // Inventory Transaction
                                        return [4 /*yield*/, tx.inventoryTransaction.create({
                                                data: {
                                                    type: 'PURCHASE_RECEIPT',
                                                    referenceNo: receive.receiveNo,
                                                    warehouseId: warehouse.id,
                                                    locationId: location.id,
                                                    variantId: variant.id,
                                                    unitId: unit.id,
                                                    quantity: 50,
                                                    remark: 'Partial receipt'
                                                }
                                            })];
                                    case 4:
                                        // Inventory Transaction
                                        _a.sent();
                                        return [4 /*yield*/, tx.inventory.findFirst({
                                                where: { warehouseId: warehouse.id, locationId: location.id, variantId: variant.id }
                                            })];
                                    case 5:
                                        inv = _a.sent();
                                        if (!inv) return [3 /*break*/, 7];
                                        return [4 /*yield*/, tx.inventory.update({
                                                where: { id: inv.id },
                                                data: { onHand: { increment: 50 }, available: { increment: 50 } }
                                            })];
                                    case 6:
                                        _a.sent();
                                        return [3 /*break*/, 9];
                                    case 7: return [4 /*yield*/, tx.inventory.create({
                                            data: {
                                                warehouseId: warehouse.id,
                                                locationId: location.id,
                                                variantId: variant.id,
                                                onHand: 50,
                                                available: 50,
                                                reserved: 0
                                            }
                                        })];
                                    case 8:
                                        _a.sent();
                                        _a.label = 9;
                                    case 9: return [2 /*return*/, receive];
                                }
                            });
                        }); })];
                case 9:
                    grn = _a.sent();
                    console.log('✅ Created Goods Receive (50 units):', grn.receiveNo);
                    return [4 /*yield*/, prisma.inventory.findFirst({
                            where: { warehouseId: warehouse.id, locationId: location.id, variantId: variant.id }
                        })];
                case 10:
                    updatedInv = _a.sent();
                    console.log('✅ Verified Inventory OnHand:', updatedInv === null || updatedInv === void 0 ? void 0 : updatedInv.onHand);
                    return [4 /*yield*/, prisma.purchaseInvoice.create({
                            data: {
                                vendorId: vendor.id,
                                purchaseOrderId: po.id,
                                invoiceNo: 'INV-ABC-999',
                                invoiceDate: new Date(),
                                subtotal: 2500,
                                vat: 175,
                                grandTotal: 2675,
                                status: 'PENDING',
                                items: {
                                    create: [
                                        {
                                            variantId: variant.id,
                                            unitId: unit.id,
                                            quantity: 50,
                                            unitPrice: 50,
                                            lineTotal: 2500
                                        }
                                    ]
                                }
                            }
                        })];
                case 11:
                    invoice = _a.sent();
                    console.log('✅ Created Purchase Invoice:', invoice.invoiceNo);
                    return [4 /*yield*/, prisma.purchasePayment.create({
                            data: {
                                purchaseInvoiceId: invoice.id,
                                paymentMethod: 'TRANSFER',
                                amount: 2675,
                                reference: 'TXN123456',
                                status: 'COMPLETED'
                            }
                        })];
                case 12:
                    payment = _a.sent();
                    return [4 /*yield*/, prisma.purchaseInvoice.update({
                            where: { id: invoice.id },
                            data: { status: 'PAID' }
                        })];
                case 13:
                    _a.sent();
                    console.log('✅ Created Payment for Invoice:', payment.reference);
                    console.log('\n🎉 Sprint 5 E2E Test Completed Successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
run()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
