const db = require('../config/db');

class InventoryModel {
  // Bonus: Pagination, Search, Filtering
  static async getStockList({ page = 1, limit = 10, search = '', warehouseId }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT i.warehouse_id, w.name as warehouse_name, i.product_id, p.name as product_name, p.sku, i.quantity 
      FROM Inventories i
      JOIN Warehouses w ON i.warehouse_id = w.id
      JOIN Products p ON i.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (warehouseId) {
      query += ` AND i.warehouse_id = ?`;
      params.push(warehouseId);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    return rows;
  }

  // Database Transaction untuk Transfer Stok
  static async transferStock({ productId, fromWarehouseId, toWarehouseId, quantity, userId }) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Cek stok di gudang asal
      const [sourceStock] = await connection.execute(
        'SELECT quantity FROM Inventories WHERE warehouse_id = ? AND product_id = ? FOR UPDATE',
        [fromWarehouseId, productId]
      );

      if (!sourceStock[0] || sourceStock[0].quantity < quantity) {
        throw new Error('Stok gudang asal tidak mencukupi untuk transfer.');
      }

      // 2. Kurangi stok di gudang asal
      await connection.execute(
        'UPDATE Inventories SET quantity = quantity - ? WHERE warehouse_id = ? AND product_id = ?',
        [quantity, fromWarehouseId, productId]
      );

      // 3. Tambahkan stok di gudang tujuan (Upsert)
      const [destStock] = await connection.execute(
        'SELECT quantity FROM Inventories WHERE warehouse_id = ? AND product_id = ? FOR UPDATE',
        [toWarehouseId, productId]
      );

      if (destStock[0]) {
        await connection.execute(
          'UPDATE Inventories SET quantity = quantity + ? WHERE warehouse_id = ? AND product_id = ?',
          [quantity, toWarehouseId, productId]
        );
      } else {
        await connection.execute(
          'INSERT INTO Inventories (warehouse_id, product_id, quantity) VALUES (?, ?, ?)',
          [toWarehouseId, productId, quantity]
        );
      }

      // 4. Catat Mutasi ke Audit Log (StockMutations)
      await connection.execute(
        `INSERT INTO StockMutations (user_id, product_id, from_warehouse_id, to_warehouse_id, quantity, type) 
         VALUES (?, ?, ?, ?, ?, 'TRANSFER')`,
        [userId, productId, fromWarehouseId, toWarehouseId, quantity]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = InventoryModel;