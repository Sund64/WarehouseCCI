const { z } = require('zod');

const transferStockSchema = z.object({
  productId: z.number().positive(),
  fromWarehouseId: z.number().positive(),
  toWarehouseId: z.number().positive(),
  quantity: z.number().positive({ message: "Kuantitas harus lebih dari 0" })
});

module.exports = { transferStockSchema };