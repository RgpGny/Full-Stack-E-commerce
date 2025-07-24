import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  InputNumber,
  message,
  Breadcrumb,
  Popconfirm,
  Image,
  Divider
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  HomeOutlined,
  ClearOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { updateCartItem, removeFromCart, clearCart } from "../utils/Api";

const { Title, Text } = Typography;

export const CartPage = () => {
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    itemCount: 0,
    totalQuantity: 0,
    totalAmount: 0
  });
  
  const navigate = useNavigate();
  const { fetchCart, refreshCart } = useCart();

  // Static fallback image
  const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5O2PC90ZXh0Pgo8L3N2Zz4K";

  // Sepet verilerini getir
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await fetchCart();
      setCartItems(cartData.items || []);
      setCartSummary(cartData.summary || {
        itemCount: 0,
        totalQuantity: 0,
        totalAmount: 0
      });
    } catch (error) {
      console.error("Load cart error:", error);
      message.error("Sepet yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Ürün miktarını güncelle
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      await updateCartItem(cartItemId, newQuantity);
      message.success("Sepet güncellendi");
      loadCart(); // Sepeti yenile
      refreshCart(); // Header'daki sayacı güncelle
    } catch (error) {
      console.error("Update quantity error:", error);
      message.error(error.message || "Güncelleme sırasında hata oluştu.");
    }
  };

  // Ürünü sepetten kaldır
  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      message.success("Ürün sepetten kaldırıldı");
      loadCart(); // Sepeti yenile
      refreshCart(); // Header'daki sayacı güncelle
    } catch (error) {
      console.error("Remove item error:", error);
      message.error(error.message || "Ürün kaldırma sırasında hata oluştu.");
    }
  };

  // Sepeti tamamen temizle
  const handleClearCart = async () => {
    try {
      await clearCart();
      message.success("Sepet temizlendi");
      loadCart(); // Sepeti yenile
      refreshCart(); // Header'daki sayacı güncelle
    } catch (error) {
      console.error("Clear cart error:", error);
      message.error(error.message || "Sepet temizleme sırasında hata oluştu.");
    }
  };

  // Fiyat formatı
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  // Tablo kolonları
  const columns = [
    {
      title: "Ürün",
      key: "product",
      render: (record) => (
        <div className="flex items-center space-x-4">
          <Image
            src={record.image_url || fallbackImage}
            alt={record.product_name}
            width={60}
            height={60}
            className="rounded-lg object-cover"
            fallback={fallbackImage}
          />
          <div>
            <Text strong className="block text-gray-800">{record.product_name}</Text>
            <Text className="text-sm text-gray-500">{record.description}</Text>
          </div>
        </div>
      )
    },
    {
      title: "Birim Fiyat",
      key: "price",
      render: (record) => (
        <Text className="font-medium">{formatPrice(record.price)}</Text>
      )
    },
    {
      title: "Miktar",
      key: "quantity",
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Button
            icon={<MinusOutlined />}
            size="small"
            onClick={() => handleUpdateQuantity(record.cart_item_id, record.quantity - 1)}
            disabled={record.quantity <= 1}
          />
          <InputNumber
            min={1}
            max={record.stock}
            value={record.quantity}
            size="small"
            className="w-16"
            onChange={(value) => handleUpdateQuantity(record.cart_item_id, value)}
          />
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => handleUpdateQuantity(record.cart_item_id, record.quantity + 1)}
            disabled={record.quantity >= record.stock}
          />
        </div>
      )
    },
    {
      title: "Toplam",
      key: "total",
      render: (record) => (
        <Text strong className="text-lg">{formatPrice(record.total_price)}</Text>
      )
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (record) => (
        <Popconfirm
          title="Ürünü sepetten kaldır"
          description="Bu ürünü sepetinizden kaldırmak istediğinizden emin misiniz?"
          onConfirm={() => handleRemoveItem(record.cart_item_id)}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            size="small"
            className="text-red-500 border-red-500 hover:bg-red-50"
          >
            Kaldır
          </Button>
        </Popconfirm>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Text className="text-gray-500">Sepet yükleniyor...</Text>
        </Space>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link to="/app" className="text-blue-600 hover:text-blue-800">
              <HomeOutlined /> Ana Sayfa
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span className="text-gray-800 font-medium">Sepetim</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Başlık */}
        <div className="mb-6">
          <Title level={2} className="flex items-center space-x-2 mb-2">
            <ShoppingCartOutlined className="text-blue-600" />
            <span>Sepetim</span>
          </Title>
          <Text className="text-gray-600">
            Sepetinizde {cartSummary.itemCount} ürün bulunuyor
          </Text>
        </div>

        {cartItems.length === 0 ? (
          /* Boş sepet */
          <Card style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="text-center py-12">
              <Empty
                description="Sepetiniz boş"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={() => navigate('/app/products')}
                >
                  Alışverişe Başla
                </Button>
              </Empty>
            </div>
          </Card>
        ) : (
          /* Dolu sepet */
          <Row gutter={[24, 24]}>
            {/* Sepet içeriği */}
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <div className="flex justify-between items-center">
                    <span>Sepet İçeriği</span>
                    <Popconfirm
                      title="Sepeti temizle"
                      description="Sepetinizdeki tüm ürünleri kaldırmak istediğinizden emin misiniz?"
                      onConfirm={handleClearCart}
                      okText="Evet"
                      cancelText="Hayır"
                    >
                      <Button 
                        icon={<ClearOutlined />} 
                        danger 
                        size="small"
                        className="text-red-500"
                      >
                        Sepeti Temizle
                      </Button>
                    </Popconfirm>
                  </div>
                }
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <Table
                  dataSource={cartItems}
                  columns={columns}
                  rowKey="cart_item_id"
                  pagination={false}
                  className="cart-table"
                />
              </Card>
            </Col>

            {/* Sepet özeti */}
            <Col xs={24} lg={8}>
              <Card 
                title="Sipariş Özeti"
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Text>Ürün Sayısı:</Text>
                    <Text strong>{cartSummary.itemCount}</Text>
                  </div>
                  
                  <div className="flex justify-between">
                    <Text>Toplam Adet:</Text>
                    <Text strong>{cartSummary.totalQuantity}</Text>
                  </div>

                  <Divider />

                  <div className="flex justify-between text-lg">
                    <Text strong>Toplam:</Text>
                    <Text strong className="text-blue-600">
                      {formatPrice(cartSummary.totalAmount)}
                    </Text>
                  </div>

                  <Divider />

                  <Space direction="vertical" className="w-full" size="middle">
                    <Button
                      type="primary"
                      size="large"
                      block
                      className="h-12 font-semibold"
                      onClick={() => navigate('/app/checkout')}
                    >
                      Siparişi Tamamla
                    </Button>
                    
                    <Button
                      size="large"
                      block
                      onClick={() => navigate('/app/products')}
                    >
                      Alışverişe Devam Et
                    </Button>
                  </Space>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-700 space-y-1">
                      <div>✅ Ücretsiz kargo (75₺ ve üzeri)</div>
                      <div>🚚 Hızlı teslimat (1-3 iş günü)</div>
                      <div>↩️ 15 gün koşulsuz iade</div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default CartPage; 