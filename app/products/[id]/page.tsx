"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react"

interface Product {
  id: number
  name: string
  sku: string
  category: string
  description: string
  unit: string
  stock_quantity: number
  min_stock_alert: number
  last_inbound_date: string
}

interface InboundRecord {
  id: number
  quantity: number
  unit_price: number
  total_price: number
  batch_number: string
  supplier: string
  inbound_date: string
  status: string
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [inboundHistory, setInboundHistory] = useState<InboundRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      fetchProductDetail()
      fetchInboundHistory()
    }
  }, [productId])

  const fetchProductDetail = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const result = await response.json()

      if (result.success) {
        setProduct(result.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching product detail:", error)
    }
  }

  const fetchInboundHistory = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/inbound-history`)
      const result = await response.json()

      if (result.success) {
        setInboundHistory(result.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching inbound history:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount)
  }

  // 计算平均价格
  const averagePrice =
    inboundHistory.length > 0
      ? inboundHistory.reduce((sum, record) => sum + record.unit_price, 0) / inboundHistory.length
      : 0

  // 生成报价表
  const handleGenerateQuotation = () => {
    router.push(`/quotations/create?productId=${productId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">商品不存在</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>
            <Button onClick={handleGenerateQuotation}>
              <FileText className="mr-2 h-4 w-4" />
              生成报价表
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 商品基本信息 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>商品信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">商品名称</span>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">SKU编码</span>
                  <p className="font-mono text-sm">{product.sku}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">商品分类</span>
                  <p className="font-medium">{product.category || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">计量单位</span>
                  <p className="font-medium">{product.unit}</p>
                </div>
                {product.description && (
                  <div>
                    <span className="text-sm text-muted-foreground">商品描述</span>
                    <p className="text-sm">{product.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 库存信息 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>库存信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">当前库存</span>
                  <p className="text-2xl font-bold">
                    {product.stock_quantity} {product.unit}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">预警数量</span>
                  <p className="font-medium">
                    {product.min_stock_alert} {product.unit}
                  </p>
                </div>
                {product.stock_quantity <= product.min_stock_alert && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span>库存不足，请及时补货</span>
                  </div>
                )}
                {product.last_inbound_date && (
                  <div>
                    <span className="text-sm text-muted-foreground">最后入库日期</span>
                    <p className="font-medium">{product.last_inbound_date}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 价格统计 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>价格统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">平均入库价</span>
                  <p className="text-xl font-bold text-primary">{formatCurrency(averagePrice)}</p>
                </div>
                {inboundHistory.length > 0 && (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">最高价格</span>
                      <p className="font-medium">
                        {formatCurrency(Math.max(...inboundHistory.map((r) => r.unit_price)))}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">最低价格</span>
                      <p className="font-medium">
                        {formatCurrency(Math.min(...inboundHistory.map((r) => r.unit_price)))}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 入库历史 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>入库历史</CardTitle>
                <CardDescription>共 {inboundHistory.length} 条入库记录</CardDescription>
              </CardHeader>
              <CardContent>
                {inboundHistory.length > 0 ? (
                  <div className="space-y-4">
                    {inboundHistory.map((record) => (
                      <Card key={record.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <span className="text-sm text-muted-foreground">入库日期</span>
                              <p className="font-medium">{record.inbound_date}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">入库数量</span>
                              <p className="font-medium">
                                {record.quantity} {product.unit}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">单价</span>
                              <p className="font-medium">{formatCurrency(record.unit_price)}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">总金额</span>
                              <p className="font-semibold text-primary">{formatCurrency(record.total_price)}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">批次号</span>
                              <p className="font-mono text-xs">{record.batch_number}</p>
                            </div>
                            {record.supplier && (
                              <div>
                                <span className="text-sm text-muted-foreground">供应商</span>
                                <p className="font-medium">{record.supplier}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">暂无入库记录</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
