import React, { useState, useEffect } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Spin,
  Empty,
  Pagination,
  Drawer,
  Slider,
  Checkbox,
  Tag,
  message,
  Breadcrumb,
  Badge
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  HomeOutlined,
  ClearOutlined
} from "@ant-design/icons";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { fetchProducts, fetchCategorys } from "../utils/Api";
import { ProductCard } from "../components/ProductCard";

const { Title, Text } = Typography;
const { Option } = Select;

export const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid veya list
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL parametrelerini kontrol et
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    if (search) {
      setSearchQuery(search);
    }
    if (category) {
      setSelectedCategory(parseInt(category));
    }
  }, [searchParams]);

  // Veri getirme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // URL parametrelerini backend'e gönder
        const params = {};
        if (selectedCategory) params.category_id = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetchProducts(params),
          fetchCategorys()
        ]);
        
        setProducts(productsResponse || []);
        setCategories(categoriesResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Ürünler yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]); // selectedCategory ve searchQuery değiştiğinde yeniden çağır

  // Filtreleme backend'de yapılıyor, frontend'de sadece sıralama ve fiyat filtresi
  const filteredProducts = products.filter(product => {
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesPrice;
  });

  // Sıralama
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateURL({ search: value });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    updateURL({ category: categoryId });
  };

  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPriceRange([0, 10000]);
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    priceRange[0] > 0 || priceRange[1] < 10000,
    sortBy !== "newest"
  ].filter(Boolean).length;

  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.name;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Text className="text-gray-500">Ürünler yükleniyor...</Text>
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
            <span className="text-gray-600">Ürünler</span>
          </Breadcrumb.Item>
          {selectedCategoryName && (
            <Breadcrumb.Item>
              <span className="text-gray-800 font-medium">{selectedCategoryName}</span>
            </Breadcrumb.Item>
          )}
        </Breadcrumb>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <Title level={2} className="mb-4">
            🛍️ Ürünler
            {selectedCategoryName && (
              <Text className="text-gray-500 font-normal ml-2">
                - {selectedCategoryName}
              </Text>
            )}
          </Title>

          {/* Search Bar */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12} lg={14}>
              <Input.Search
                placeholder="Ürün ara..."
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                allowClear
                className="w-full"
              />
            </Col>
            
            <Col xs={24} md={12} lg={10}>
              <Space size="middle" className="w-full justify-end">
                {/* Mobile Filter Button */}
                <Badge count={activeFiltersCount} offset={[-8, 8]}>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setFilterDrawerVisible(true)}
                    className="lg:hidden"
                  >
                    Filtrele
                  </Button>
                </Badge>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-40"
                  size="large"
                >
                  <Option value="newest">En Yeni</Option>
                  <Option value="price-low">Ucuzdan Pahalıya</Option>
                  <Option value="price-high">Pahalıdan Ucuza</Option>
                  <Option value="name">İsme Göre</Option>
                </Select>

                {/* View Mode */}
                <Button.Group>
                  <Button
                    icon={<AppstoreOutlined />}
                    type={viewMode === "grid" ? "primary" : "default"}
                    onClick={() => setViewMode("grid")}
                  />
                  <Button
                    icon={<BarsOutlined />}
                    type={viewMode === "list" ? "primary" : "default"}
                    onClick={() => setViewMode("list")}
                  />
                </Button.Group>
              </Space>
            </Col>
          </Row>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Space wrap>
                <Text strong className="text-gray-600">Aktif Filtreler:</Text>
                {searchQuery && (
                  <Tag closable onClose={() => handleSearch("")}>
                    Arama: {searchQuery}
                  </Tag>
                )}
                {selectedCategoryName && (
                  <Tag closable onClose={() => handleCategoryChange(null)}>
                    Kategori: {selectedCategoryName}
                  </Tag>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <Tag closable onClose={() => setPriceRange([0, 10000])}>
                    Fiyat: {priceRange[0]}₺ - {priceRange[1]}₺
                  </Tag>
                )}
                <Button 
                  type="link" 
                  icon={<ClearOutlined />} 
                  onClick={clearFilters}
                  className="p-0 h-auto"
                >
                  Tümünü Temizle
                </Button>
              </Space>
            </div>
          )}
        </div>

        <Row gutter={[24, 24]}>
          {/* Sidebar Filters - Desktop */}
          <Col xs={0} lg={6}>
            <Card className="shadow-sm sticky top-6" style={{ borderRadius: 'var(--radius-lg)' }}>
              <Title level={4} className="mb-4">🔍 Filtreler</Title>
              
              {/* Categories */}
              <div className="mb-6">
                <Title level={5} className="mb-3">Kategoriler</Title>
                <div className="space-y-2">
                  <div
                    className={`cursor-pointer p-2 rounded-lg transition-colors ${
                      !selectedCategory ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCategoryChange(null)}
                  >
                    Tüm Kategoriler
                  </div>
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`cursor-pointer p-2 rounded-lg transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Title level={5} className="mb-3">Fiyat Aralığı</Title>
                <Slider
                  range
                  min={0}
                  max={10000}
                  step={100}
                  value={priceRange}
                  onChange={setPriceRange}
                  tipFormatter={(value) => `${value}₺`}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{priceRange[0]}₺</span>
                  <span>{priceRange[1]}₺</span>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  block
                  icon={<ClearOutlined />}
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Filtreleri Temizle
                </Button>
              )}
            </Card>
          </Col>

          {/* Products */}
          <Col xs={24} lg={18}>
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <Text className="text-gray-600">
                {sortedProducts.length} ürün listeleniyor
                {searchQuery && ` "${searchQuery}" için`}
              </Text>
            </div>

            {/* Products Grid/List */}
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Empty
                  description="Aradığınız kriterlere uygun ürün bulunamadı"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" onClick={clearFilters}>
                    Filtreleri Temizle
                  </Button>
                </Empty>
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {paginatedProducts.map(product => (
                    <Col 
                      key={product.id} 
                      xs={24} 
                      sm={12} 
                      md={viewMode === "list" ? 24 : 8} 
                      xl={viewMode === "list" ? 24 : 6}
                    >
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.image_url}
                        description={product.description}
                        stock={product.stock}
                        rating={4.5}
                        discount={Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : null}
                        isNew={Math.random() > 0.8}
                      />
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {sortedProducts.length > pageSize && (
                  <div className="text-center mt-12">
                    <Pagination
                      current={currentPage}
                      total={sortedProducts.length}
                      pageSize={pageSize}
                      onChange={setCurrentPage}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) => 
                        `${range[0]}-${range[1]} / ${total} ürün`
                      }
                      className="custom-pagination"
                    />
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>

        {/* Mobile Filter Drawer */}
        <Drawer
          title="🔍 Filtreler"
          placement="right"
          width={320}
          open={filterDrawerVisible}
          onClose={() => setFilterDrawerVisible(false)}
          footer={
            <Space className="w-full justify-between">
              <Button onClick={clearFilters} icon={<ClearOutlined />}>
                Temizle
              </Button>
              <Button 
                type="primary" 
                onClick={() => setFilterDrawerVisible(false)}
                className="flex-1 ml-2"
              >
                Filtreleri Uygula
              </Button>
            </Space>
          }
        >
          {/* Categories */}
          <div className="mb-6">
            <Title level={5} className="mb-3">Kategoriler</Title>
            <div className="space-y-2">
              <div
                className={`cursor-pointer p-2 rounded-lg transition-colors ${
                  !selectedCategory ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryChange(null)}
              >
                Tüm Kategoriler
              </div>
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`cursor-pointer p-2 rounded-lg transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <Title level={5} className="mb-3">Fiyat Aralığı</Title>
            <Slider
              range
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onChange={setPriceRange}
              tipFormatter={(value) => `${value}₺`}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{priceRange[0]}₺</span>
              <span>{priceRange[1]}₺</span>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
};
