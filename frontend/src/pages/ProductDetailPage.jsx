import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Breadcrumb,
  message,
  Spin
} from "antd";
import { 
  ShoppingCartOutlined, 
  HeartOutlined,
  StarFilled,
  HomeOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Mock product data - gerçek API'den gelecek
    const mockProduct = {
      id: parseInt(id),
      name: "Ürün Detay Sayfası",
      description: "Bu bir örnek ürün detay sayfasıdır. Gerçek API'den veri çekildiğinde bu bilgiler güncellenecektir.",
      price: 299.99,
      image: "https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Ürün",
      stock: 25,
      rating: 4.5,
      category: "Elektronik"
    };
    
    setProduct(mockProduct);
  }, [id]);

  const handleAddToCart = () => {
    message.success(`${product?.name} sepete eklendi!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Text className="text-gray-500">Ürün yükleniyor...</Text>
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
            <Link to="/app/products" className="text-blue-600 hover:text-blue-800">
              Ürünler
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span className="text-gray-800 font-medium">{product.name}</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          Geri Dön
        </Button>

        {/* Product Detail */}
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          <Row gutter={[48, 32]}>
            {/* Product Image */}
            <Col xs={24} lg={12}>
              <div className="text-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
            </Col>

            {/* Product Info */}
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                {/* Category */}
                <Tag color="blue">{product.category}</Tag>

                {/* Product Name */}
                <Title level={2} className="mb-2">
                  {product.name}
                </Title>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <StarFilled className="text-yellow-400" />
                  <Text className="text-lg">{product.rating}</Text>
                  <Text className="text-gray-500">(127 değerlendirme)</Text>
                </div>

                {/* Price */}
                <div className="py-4">
                  <Text className="text-3xl font-bold text-gray-800">
                    {formatPrice(product.price)}
                  </Text>
                </div>

                {/* Stock */}
                <div className="flex items-center space-x-2">
                  <Text>Stok Durumu:</Text>
                  {product.stock > 0 ? (
                    <Tag color="green">Stokta {product.stock} adet</Tag>
                  ) : (
                    <Tag color="red">Stokta Yok</Tag>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Title level={4}>Ürün Açıklaması</Title>
                  <Paragraph>{product.description}</Paragraph>
                </div>

                {/* Action Buttons */}
                <Space size="large" className="w-full">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="px-8"
                  >
                    Sepete Ekle
                  </Button>
                  
                  <Button
                    size="large"
                    icon={<HeartOutlined />}
                    className="px-6"
                  >
                    Favorilere Ekle
                  </Button>
                </Space>

                {/* Additional Info */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>✅ Ücretsiz kargo (75₺ ve üzeri alışverişlerde)</div>
                    <div>🚚 Hızlı teslimat (1-3 iş günü)</div>
                    <div>↩️ 15 gün içinde koşulsuz iade</div>
                    <div>🛡️ 2 yıl resmi distribütör garantisi</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetailPage; 