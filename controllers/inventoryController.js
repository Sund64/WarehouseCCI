const InventoryModel = require('../models/inventoryModel');
const { transferStockSchema } = require('../validators/inventoryValidator');
const { AppError } = require('../middlewares/errorMiddleware');

exports.getStok = async (req, res, next) => {
  try {
    const { page, limit, search, warehouseId } = req.query;

    const stok = await InventoryModel.getStockList({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      warehouseId
    });

    res.status(200).json({
      status: 'success',
      results: stok.length,
      data: { stok }
    });
  } catch (error) {
    next(error);
  }
};

exports.transferGudang = async (req, res, next) => {
  try {
    const validatedData = transferStockSchema.parse(req.body);

    await InventoryModel.transferStock({
      productId: validatedData.productId,
      fromWarehouseId: validatedData.fromWarehouseId,
      toWarehouseId: validatedData.toWarehouseId,
      quantity: validatedData.quantity,
      userId: req.user.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Transfer stok antar cabang berhasil diproses dan dicatat.'
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    if (error.message.includes('tidak mencukupi')) {
      return next(new AppError(error.message, 400));
    }
    next(error);
  }
};