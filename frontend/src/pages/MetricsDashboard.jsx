import { useState, useEffect, useContext } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Spin, 
  Alert, 
  Button,
  Typography,
  Tag,
  Progress,
  Space
} from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  BankOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { 
  getDashboardOverview,
  getUserMetrics,
  getProductMetrics,
  getOrderMetrics,
  getDailyOrdersChart,
  getTopSellingProducts
} from '../utils/Api';

const { Title, Text } = Typography;

const MetricsDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: null,
    users: null,
    products: null,
    orders: null,
    dailyChart: null,
    topProducts: null
  });
  const [error, setError] = useState(null);

  // Sadece admin kullanıcılar erişebilir
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert
          message="Erişim Reddedildi"
          description="Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece admin kullanıcılar metrics dashboard'ını görüntüleyebilir."
          type="error"
          showIcon
          className="max-w-md"
        />
      </div>
    );
  }

  const fetchAllMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        overviewData,
        usersData,
        productsData,
        ordersData,
        dailyChartData,
        topProductsData
      ] = await Promise.all([
        getDashboardOverview(),
        getUserMetrics(),
        getProductMetrics(),
        getOrderMetrics(),
        getDailyOrdersChart(),
        getTopSellingProducts()
      ]);

      setData({
        overview: overviewData.data,
        users: usersData.data,
        products: productsData.data,
        orders: ordersData.data,
        dailyChart: dailyChartData.data,
        topProducts: topProductsData.data
      });
    } catch (error) {
      console.error('Metrics fetch error:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMetrics();
  }, []);

  const topProductsColumns = [
    {
      title: 'Sıra',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => (
        <div className="flex items-center space-x-3">
          {index < 3 && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index === 0 ? 'bg-yellow-100 text-yellow-600' : 
              index === 1 ? 'bg-gray-100 text-gray-600' : 
              'bg-orange-100 text-orange-600'
            }`}>
              <TrophyOutlined />
            </div>
          )}
          {index >= 3 && (
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </div>
          )}
        </div>
      ),
      width: 80
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <div>
          <Text strong className="text-gray-900">{name}</Text>
        </div>
      )
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text className="font-medium text-gray-700">
          ₺{price?.toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Satılan',
      dataIndex: 'totalSold',
      key: 'totalSold',
      render: (sold) => (
        <Tag color="blue" className="font-medium">
          {sold} adet
        </Tag>
      )
    },
    {
      title: 'Toplam Gelir',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue) => (
        <Text strong className="text-green-600 text-base">
          ₺{revenue?.toFixed(2)}
        </Text>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Text className="text-gray-500 text-lg">Metrikler yükleniyor...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert
          message="Hata Oluştu"
          description={`Metrikler yüklenirken bir hata oluştu: ${error}`}
          type="error"
          showIcon
          className="max-w-lg"
          action={
            <Button onClick={fetchAllMetrics} type="primary" className="mt-4">
              Tekrar Dene
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="mb-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                📊 Dashboard
              </Title>
              <Text className="text-gray-500 text-lg">
                Sistem performansı ve iş metriklerinin genel görünümü
              </Text>
            </div>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchAllMetrics}
              type="primary"
              size="large"
              className="h-12 px-6 font-medium shadow-lg"
              style={{
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-primary)',
                borderRadius: 'var(--radius-base)'
              }}
            >
              Yenile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="card-modern border-0 h-full"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div className="text-white">
                <div className="flex items-center justify-between mb-4">
                  <TeamOutlined className="text-3xl opacity-80" />
                  <ArrowUpOutlined className="text-green-300" />
                </div>
                <Title level={2} className="text-white mb-1">
                  {data.users?.total_users || 0}
                </Title>
                <Text className="text-blue-100 text-base">Toplam Kullanıcı</Text>
                <div className="mt-3 pt-3 border-t border-blue-300/30">
                  <Text className="text-blue-100 text-sm">
                    Doğrulanmış: {data.users?.verified_users || 0}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="card-modern border-0 h-full"
              style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div className="text-white">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingOutlined className="text-3xl opacity-80" />
                  <ArrowUpOutlined className="text-green-300" />
                </div>
                <Title level={2} className="text-white mb-1">
                  {data.products?.total_products || 0}
                </Title>
                <Text className="text-pink-100 text-base">Toplam Ürün</Text>
                <div className="mt-3 pt-3 border-t border-pink-300/30">
                  <Text className="text-pink-100 text-sm">
                    Stokta: {data.products?.in_stock_products || 0}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="card-modern border-0 h-full"
              style={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div className="text-white">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCartOutlined className="text-3xl opacity-80" />
                  <ArrowUpOutlined className="text-green-300" />
                </div>
                <Title level={2} className="text-white mb-1">
                  {data.orders?.total_orders || 0}
                </Title>
                <Text className="text-cyan-100 text-base">Toplam Sipariş</Text>
                <div className="mt-3 pt-3 border-t border-cyan-300/30">
                  <Text className="text-cyan-100 text-sm">
                    Bu hafta: {data.orders?.orders_7d || 0}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="card-modern border-0 h-full"
              style={{ 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div className="text-white">
                <div className="flex items-center justify-between mb-4">
                  <BankOutlined className="text-3xl opacity-80" />
                  <ArrowUpOutlined className="text-green-300" />
                </div>
                <Title level={2} className="text-white mb-1">
                  ₺{(data.orders?.total_revenue || 0).toFixed(0)}
                </Title>
                <Text className="text-green-100 text-base">Toplam Gelir</Text>
                <div className="mt-3 pt-3 border-t border-green-300/30">
                  <Text className="text-green-100 text-sm">
                    Ort. Sipariş: ₺{(data.orders?.average_order_value || 0).toFixed(0)}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Detail Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          {/* Kullanıcı Metrikleri */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <UserOutlined className="text-blue-600" />
                  <span className="font-semibold text-gray-800">Kullanıcı Analizi</span>
                </div>
              }
              className="card-modern h-full"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Text className="text-gray-600">Yeni kullanıcılar (24h)</Text>
                    <div className="flex items-center space-x-2 mt-1">
                      <Title level={4} className="mb-0 text-green-600">{data.users?.new_users_24h || 0}</Title>
                      <RiseOutlined className="text-green-500" />
                    </div>
                  </div>
                  <Progress 
                    type="circle" 
                    size={50} 
                    percent={Math.round((data.users?.new_users_24h || 0) / (data.users?.total_users || 1) * 100)} 
                    strokeColor="#10B981"
                    format={() => '24h'}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Text className="text-gray-600">Yeni kullanıcılar (7 gün)</Text>
                    <div className="flex items-center space-x-2 mt-1">
                      <Title level={4} className="mb-0 text-blue-600">{data.users?.new_users_7d || 0}</Title>
                      <RiseOutlined className="text-blue-500" />
                    </div>
                  </div>
                  <Progress 
                    type="circle" 
                    size={50} 
                    percent={Math.round((data.users?.new_users_7d || 0) / (data.users?.total_users || 1) * 100)} 
                    strokeColor="#3B82F6"
                    format={() => '7d'}
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-2">
                    <Text className="text-sm text-gray-600">Admin kullanıcılar</Text>
                    <Tag color="red">{data.users?.admin_users || 0}</Tag>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-sm text-gray-600">Müşteri kullanıcılar</Text>
                    <Tag color="blue">{data.users?.customer_users || 0}</Tag>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Ürün Metrikleri */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <ShoppingOutlined className="text-purple-600" />
                  <span className="font-semibold text-gray-800">Ürün Analizi</span>
                </div>
              }
              className="card-modern h-full"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Title level={3} className="mb-1 text-green-600">{data.products?.in_stock_products || 0}</Title>
                    <Text className="text-green-600 text-sm font-medium">Stokta</Text>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Title level={3} className="mb-1 text-red-600">{data.products?.out_of_stock_products || 0}</Title>
                    <Text className="text-red-600 text-sm font-medium">Tükenen</Text>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-3">
                    <Text className="text-gray-600">Düşük stok uyarısı</Text>
                    <Tag color="orange">{data.products?.low_stock_products || 0} ürün</Tag>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Text className="text-sm text-gray-600 block mb-1">Ortalama ürün fiyatı</Text>
                    <Title level={4} className="mb-0 text-gray-800">
                      ₺{(data.products?.average_price || 0).toFixed(2)}
                    </Title>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Sipariş Metrikleri */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <ShoppingCartOutlined className="text-orange-600" />
                  <span className="font-semibold text-gray-800">Sipariş Analizi</span>
                </div>
              }
              className="card-modern h-full"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <Title level={4} className="mb-1 text-yellow-600">{data.orders?.pending_orders || 0}</Title>
                    <Text className="text-yellow-600 text-xs font-medium">Bekleyen</Text>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Title level={4} className="mb-1 text-blue-600">{data.orders?.shipped_orders || 0}</Title>
                    <Text className="text-blue-600 text-xs font-medium">Kargoda</Text>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Title level={4} className="mb-1 text-green-600">{data.orders?.delivered_orders || 0}</Title>
                    <Text className="text-green-600 text-xs font-medium">Teslim</Text>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <Title level={4} className="mb-1 text-red-600">{data.orders?.cancelled_orders || 0}</Title>
                    <Text className="text-red-600 text-xs font-medium">İptal</Text>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Text className="text-sm text-gray-600 block mb-1">Başarı oranı</Text>
                  <Progress 
                    percent={Math.round(((data.orders?.delivered_orders || 0) / (data.orders?.total_orders || 1)) * 100)}
                    strokeColor="#10B981"
                    className="mb-0"
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* En Çok Satan Ürünler */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card 
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrophyOutlined className="text-yellow-600" />
                    <span className="font-semibold text-gray-800">En Çok Satan Ürünler</span>
                  </div>
                  <Text className="text-gray-500 text-sm">Son 30 gün</Text>
                </div>
              }
              className="card-modern"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <Table
                dataSource={data.topProducts}
                columns={topProductsColumns}
                pagination={{ pageSize: 10, showQuickJumper: true }}
                rowKey="id"
                size="middle"
                className="modern-table"
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MetricsDashboard; 