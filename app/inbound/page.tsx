"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, Plus, Loader2 } from "lucide-react"

interface Product {
  id: number
  name: string
  sku: string
  category: string
  unit: string
  stock_quantity: number
}

export default function InboundPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [showProductList, setShowProductList] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    product_id: 0,
    product_name: "",
    product_sku: "",
    product_unit: "件",
    quantity: "",
    unit_price: "",
    supplier: "",
    warehouse_location: "",
    notes: "",
    inbound_date: new Date().toISOString().slice(0, 10),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 搜索商品
  const searchProducts = async (keyword: string) => {
    if (!keyword.trim()) {
      setProducts([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products?keyword=${encodeURIComponent(keyword)}`)
      const result = await response.json()

      if (result.success) {
        setProducts(result.data)
        setShowProductList(true)
      }
    } catch (error) {
      console.error("[v0] Error searching products:", error)
    } finally {
      setLoading(false)
    }
  }

  // 选择商品
  const selectProduct = (product: Product) => {
    setFormData({
      ...formData,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      product_unit: product.unit,
    })
    setShowProductList(false)
    setSearchKeyword("")
    setErrors({ ...errors, product_id: "" })
  }

  // 验证表单
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.product_id) {
      newErrors.product_id = "请选择商品"
    }

    if (!formData.quantity || Number.parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "入库数量必须大于0"
    }

    if (!formData.unit_price || Number.parseFloat(formData.unit_price) <= 0) {
      newErrors.unit_price = "单价必须大于0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交入库
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/inbound", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: formData.product_id,
          quantity: Number.parseInt(formData.quantity),
          unit_price: Number.parseFloat(formData.unit_price),
          supplier: formData.supplier,
          warehouse_location: formData.warehouse_location,
          notes: formData.notes,
          inbound_date: formData.inbound_date,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`入库成功！批次号：${result.data.batch_number}`)
        // 重置表单
        setFormData({
          product_id: 0,
          product_name: "",
          product_sku: "",
          product_unit: "件",
          quantity: "",
          unit_price: "",
          supplier: "",
          warehouse_location: "",
          notes: "",
          inbound_date: new Date().toISOString().slice(0, 10),
        })
      } else {
        alert(`入库失败：${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Error submitting inbound:", error)
      alert("入库失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  // 计算总价
  const totalPrice =
    formData.quantity && formData.unit_price
      ? (Number.parseInt(formData.quantity) * Number.parseFloat(formData.unit_price)).toFixed(2)
      : "0.00"

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">商品入库</h1>
              <p className="text-sm text-muted-foreground">录入新商品入库信息</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>入库表单</CardTitle>
            <CardDescription>请填写完整的入库信息，确保数据准确</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 商品搜索 */}
              <div className="space-y-2">
                <Label htmlFor="product-search">
                  搜索商品 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="product-search"
                    placeholder="输入商品名称或SKU搜索"
                    className="pl-9"
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value)
                      searchProducts(e.target.value)
                    }}
                  />
                </div>

                {/* 商品搜索结果 */}
                {showProductList && products.length > 0 && (
                  <div className="rounded-md border bg-card">
                    <div className="max-h-60 overflow-y-auto">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="cursor-pointer border-b p-3 last:border-b-0 hover:bg-muted"
                          onClick={() => selectProduct(product)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {product.sku} | 库存: {product.stock_quantity} {product.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showProductList && products.length === 0 && !loading && (
                  <div className="rounded-md border bg-card p-4 text-center text-sm text-muted-foreground">
                    未找到相关商品
                  </div>
                )}

                {errors.product_id && <p className="text-sm text-red-500">{errors.product_id}</p>}
              </div>

              {/* 已选商品 */}
              {formData.product_id > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{formData.product_name}</div>
                        <div className="text-sm text-muted-foreground">SKU: {formData.product_sku}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            product_id: 0,
                            product_name: "",
                            product_sku: "",
                            product_unit: "件",
                          })
                        }}
                      >
                        更换
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 入库数量和单价 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    入库数量 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="请输入数量"
                      value={formData.quantity}
                      onChange={(e) => {
                        setFormData({ ...formData, quantity: e.target.value })
                        setErrors({ ...errors, quantity: "" })
                      }}
                    />
                    <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
                      {formData.product_unit}
                    </div>
                  </div>
                  {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_price">
                    单价 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">¥</div>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="请输入单价"
                      value={formData.unit_price}
                      onChange={(e) => {
                        setFormData({ ...formData, unit_price: e.target.value })
                        setErrors({ ...errors, unit_price: "" })
                      }}
                    />
                  </div>
                  {errors.unit_price && <p className="text-sm text-red-500">{errors.unit_price}</p>}
                </div>
              </div>

              {/* 总价显示 */}
              <Card className="border-2 border-primary">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">入库总金额</span>
                    <span className="text-2xl font-bold text-primary">¥ {totalPrice}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 供应商和仓位 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supplier">供应商</Label>
                  <Input
                    id="supplier"
                    placeholder="请输入供应商名称"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse_location">仓位</Label>
                  <Input
                    id="warehouse_location"
                    placeholder="如: A区-01"
                    value={formData.warehouse_location}
                    onChange={(e) => setFormData({ ...formData, warehouse_location: e.target.value })}
                  />
                </div>
              </div>

              {/* 入库日期 */}
              <div className="space-y-2">
                <Label htmlFor="inbound_date">入库日期</Label>
                <Input
                  id="inbound_date"
                  type="date"
                  value={formData.inbound_date}
                  onChange={(e) => setFormData({ ...formData, inbound_date: e.target.value })}
                />
              </div>

              {/* 备注 */}
              <div className="space-y-2">
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  placeholder="可填写其他说明信息"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      提交入库
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/inbound/records")}>
                  查看记录
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
