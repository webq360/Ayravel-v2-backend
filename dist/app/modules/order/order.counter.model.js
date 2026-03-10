"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCounterModel = void 0;
const mongoose_1 = require("mongoose");
const orderCounterSchema = new mongoose_1.Schema({
    date: {
        type: String,
        required: true,
        unique: true,
    },
    count: {
        type: Number,
        required: true,
        default: 0,
    },
});
exports.OrderCounterModel = (0, mongoose_1.model)("OrderCounter", orderCounterSchema);
