import { useState, useEffect } from "react";
import {
  Layout,
  Carousel,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Input,
  message,
  Spin,
  Space,
  Tag
} from "antd";
import { 
  ShoppingCartOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  FireOutlined,
  GiftOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchCategorys, fetchProducts } from "../utils/Api";
import sale1 from "../assets/sale1.jpg";
import sale2 from "../assets/sale2.jpg";
import sale3 from "../assets/sale3.jpg";
import { ProductCard } from "../components/ProductCard";

const { Title, Text } = Typography;

export const HomePage = () => {
  const carouselImages = [sale1, sale2, sale3];
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetchCategorys(),
          fetchProducts()
        ]);
        
        setCategories(categoriesResponse || []);
        setProducts(productsResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/app/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/app/products?category=${categoryId}`);
  };

  const featuredProducts = products.slice(0, 8); // İlk 8 ürün

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Text className="text-gray-500">Sayfa yükleniyor...</Text>
        </Space>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Banner */}
          <div className="py-12">
            <Carousel
              autoplay
              autoplaySpeed={4000}
              dots={{ className: "custom-dots" }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              {carouselImages.map((image, index) => (
                <div key={index} className="relative">
                  <div className="h-[400px] md:h-[500px] bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
                    <div className="absolute inset-0 bg-black bg-opacity-30" />
                    <img
                      src={image}
                      alt={`Kampanya ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white max-w-2xl px-4">
                        <Title level={1} className="text-white mb-4 animate-fade-in">
                          🛍️ Özel Kampanyalar
                        </Title>
                        <Text className="text-xl mb-6 text-gray-100 block">
                          En kaliteli ürünler en uygun fiyatlarla sizlerle!
                        </Text>
                        <Button 
                          type="primary" 
                          size="large"
                          icon={<ShoppingCartOutlined />}
                          className="h-12 px-8 font-semibold text-lg"
                          style={{
                            backgroundColor: 'white',
                            borderColor: 'white',
                            color: 'var(--color-primary)'
                          }}
                          onClick={() => navigate('/app/products')}
                        >
                          Alışverişe Başla
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>

          {/* Search Section */}
          <div className="py-8 text-center">
            <Title level={2} className="mb-6">
              Ne arıyorsunuz?
            </Title>
            <div className="max-w-2xl mx-auto">
              <Input.Search
                placeholder="Ürün, kategori veya marka arayın..."
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                enterButton={
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />}
                    className="h-12 px-6"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      borderColor: 'var(--color-primary)'
                    }}
                  >
                    Ara
                  </Button>
                }
                className="search-input-large"
                style={{ height: '48px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4">
              📂 Kategoriler
            </Title>
            <Text className="text-lg text-gray-600">
              İhtiyacınız olan her şey kategoriler halinde
            </Text>
          </div>

          <Row gutter={[24, 24]} justify="center">
            {categories.map((category) => (
              <Col key={category.id} xs={12} sm={8} md={6} lg={4}>
                <Card
                  hoverable
                  className="card-modern text-center h-32 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all duration-300"
                  style={{ borderRadius: 'var(--radius-xl)' }}
                  onClick={() => handleCategoryClick(category.id)}
                  bodyStyle={{ 
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}
                >
                  <div>
                    <div className="text-2xl mb-2">🏷️</div>
                    <Title level={5} className="mb-0 text-gray-800">
                      {category.name}
                    </Title>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-8">
            <Button 
              type="outline" 
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate('/app/products')}
              className="btn-secondary h-12 px-6"
            >
              Tüm Kategoriler
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Space align="center" className="mb-4">
              <FireOutlined className="text-2xl text-red-500" />
              <Title level={2} className="mb-0">
                Öne Çıkan Ürünler
              </Title>
            </Space>
            <Text className="text-lg text-gray-600">
              En popüler ve kaliteli ürünlerimizi keşfedin
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {featuredProducts.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image_url}
                  description={product.description}
                />
              </Col>
            ))}
          </Row>

          <div className="text-center mt-12">
            <Button 
              type="primary" 
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/app/products')}
              className="h-12 px-8 font-semibold"
              style={{
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-primary)'
              }}
            >
              Tüm Ürünleri Gör
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Title level={2} className="text-center mb-12">
            🌟 Neden Bizi Tercih Etmelisiniz?
          </Title>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThunderboltOutlined className="text-2xl text-blue-600" />
                </div>
                <Title level={4}>Hızlı Teslimat</Title>
                <Text className="text-gray-600">
                  Siparişleriniz 24 saat içinde kargoda!
                </Text>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GiftOutlined className="text-2xl text-green-600" />
                </div>
                <Title level={4}>Ücretsiz Kargo</Title>
                <Text className="text-gray-600">
                  200₺ ve üzeri alışverişlerde kargo bizden!
                </Text>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCartOutlined className="text-2xl text-purple-600" />
                </div>
                <Title level={4}>Kolay İade</Title>
                <Text className="text-gray-600">
                  14 gün içinde koşulsuz iade garantisi!
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Title level={2} className="text-white mb-4">
            📧 Haberdar Olun!
          </Title>
          <Text className="text-xl text-blue-100 mb-8 block">
            Yeni ürünler ve özel kampanyalardan ilk siz haberdar olun.
          </Text>
          
          <div className="max-w-md mx-auto">
            <Input.Group compact>
              <Input 
                placeholder="E-mail adresinizi girin"
                size="large"
                className="flex-1"
                style={{ height: '48px' }}
              />
              <Button 
                type="primary"
                size="large"
                className="h-12 px-6 font-semibold"
                style={{
                  backgroundColor: 'white',
                  borderColor: 'white',
                  color: 'var(--color-primary)'
                }}
              >
                Abone Ol
              </Button>
            </Input.Group>
          </div>
        </div>
      </div>
    </div>
  );
};
