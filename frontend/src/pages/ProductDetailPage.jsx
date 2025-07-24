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
import { getProductById } from "../utils/Api";

const { Title, Text, Paragraph } = Typography;

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productData = await getProductById(id);
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Ürün bilgileri yüklenirken hata oluştu.");
        message.error("Ürün bulunamadı.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      const { addToCart } = await import("../utils/Api");
      await addToCart(product.id, 1);
      message.success(`${product?.name} sepete eklendi!`);
    } catch (error) {
      console.error("Add to cart error:", error);
      message.error(error.message || "Ürün sepete eklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Text className="text-gray-500">Ürün yükleniyor...</Text>
        </Space>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Title level={3} className="text-gray-600 mb-4">
            Ürün Bulunamadı
          </Title>
          <Text className="text-gray-500 mb-6 block">
            {error || "Aradığınız ürün mevcut değil."}
          </Text>
          <Space>
            <Button onClick={() => navigate(-1)}>
              Geri Dön
            </Button>
            <Button type="primary" onClick={() => navigate('/app/products')}>
              Tüm Ürünler
            </Button>
          </Space>
        </div>
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
                  src={product.image_url || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjEwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPsOccnVuIEfDtnJzZWxpPC90ZXh0Pgo8L3N2Zz4K"}
                  alt={product.name}
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '400px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjEwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPsOccnVuIEfDtnJzZWxpPC90ZXh0Pgo8L3N2Zz4K";
                    e.target.onerror = null;
                  }}
                />
              </div>
            </Col>

            {/* Product Info */}
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                {/* Category - Şimdilik basit gösterim, daha sonra kategori ilişkisi eklenebilir */}
                <Tag color="blue">Kategori</Tag>

                {/* Product Name */}
                <Title level={2} className="mb-2">
                  {product.name}
                </Title>

                {/* Rating - Şimdilik sabit değer, daha sonra gerçek rating sistemi eklenebilir */}
                <div className="flex items-center space-x-2">
                  <StarFilled className="text-yellow-400" />
                  <Text className="text-lg">4.5</Text>
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