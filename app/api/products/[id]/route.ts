import { NextResponse } from "next/server"
import { query, type ProductWithStock } from "@/lib/db"

// GET - 获取单个商品详情
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sql = `
      SELECT 
        p.*,
        COALESCE(s.quantity, 0) as stock_quantity,
        COALESCE(s.min_stock_alert, 10) as min_stock_alert,
        s.last_inbound_date
      FROM products p
      LEFT JOIN inventory_stock s ON p.id = s.product_id
      WHERE p.id = ?
    `

    const products = await query<ProductWithStock[]>(sql, [params.id])

    if (products.length === 0) {
      return NextResponse.json({ success: false, error: "商品不存在" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: products[0],
    })
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return NextResponse.json({ success: false, error: "获取商品详情失败" }, { status: 500 })
  }
}
