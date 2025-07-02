import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  Timeline,
  Modal,
  Descriptions,
  Badge,
  message,
  Breadcrumb,
  Input,
  Select,
  DatePicker
} from "antd";
import {
  ShoppingCartOutlined,
  CalendarOutlined,
  DollarOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  HomeOutlined,
  SearchOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import dayjs from "dayjs";
import { getUserOrders } from "../utils/Api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Static fallback image (data URL - 1x1 pixel gray image)
  const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5O2PC90ZXh0Pgo8L3N2Zz4K";

  // Dummy data - gerçek API'den gelecek
  const mockOrders = [
    {
      id: 1,
      order_number: "ORD-2024-001",
      total_price: 1250.00,
      status: "delivered",
      created_at: "2024-01-15T10:30:00Z",
      delivery_date: "2024-01-18T14:00:00Z",
      items: [
        {
          id: 1,
          product_name: "iPhone 15 Pro",
          quantity: 1,
          unit_price: 999.00,
          image_url: fallbackImage
        },
        {
          id: 2,
          product_name: "Silikon Kılıf",
          quantity: 1,
          unit_price: 49.00,
          image_url: fallbackImage
        }
      ],
      tracking_steps: [
        { title: "Sipariş Alındı", date: "2024-01-15 10:30", status: "completed" },
        { title: "Hazırlanıyor", date: "2024-01-15 15:20", status: "completed" },
        { title: "Kargoya Verildi", date: "2024-01-16 09:15", status: "completed" },
        { title: "Teslim Edildi", date: "2024-01-18 14:00", status: "completed" }
      ]
    },
    {
      id: 2,
      order_number: "ORD-2024-002",
      total_price: 2150.00,
      status: "processing",
      created_at: "2024-01-20T09:15:00Z",
      items: [
        {
          id: 3,
          product_name: "MacBook Pro 14'",
          quantity: 1,
          unit_price: 2150.00,
          image_url: fallbackImage
        }
      ],
      tracking_steps: [
        { title: "Sipariş Alındı", date: "2024-01-20 09:15", status: "completed" },
        { title: "Hazırlanıyor", date: "2024-01-20 14:30", status: "current" },
        { title: "Kargoya Verilecek", date: "", status: "pending" },
        { title: "Teslim Edilecek", date: "", status: "pending" }
      ]
    },
    {
      id: 3,
      order_number: "ORD-2024-003",
      total_price: 450.00,
      status: "cancelled",
      created_at: "2024-01-10T16:45:00Z",
      items: [
        {
          id: 4,
          product_name: "Bluetooth Kulaklık",
          quantity: 2,
          unit_price: 225.00,
          image_url: fallbackImage
        }
      ]
    }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Gerçek API çağrısı burada olacak
        // const response = await getUserOrders();
        // setOrders(response);
        
        // Şimdilik mock data kullanıyoruz
        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching orders:", error);
        message.error("Siparişler yüklenirken hata oluştu.");
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      processing: "blue", 
      shipped: "cyan",
      delivered: "green",
      cancelled: "red"
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Beklemede",
      processing: "Hazırlanıyor",
      shipped: "Kargoda",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi"
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      processing: <ExclamationCircleOutlined />,
      shipped: <TruckOutlined />,
      delivered: <CheckCircleOutlined />,
      cancelled: <ExclamationCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD MMMM YYYY, HH:mm');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => 
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    const matchesDate = !dateRange || (
      dayjs(order.created_at).isAfter(dateRange[0]) &&
      dayjs(order.created_at).isBefore(dateRange[1])
    );

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalSpent = orders.reduce((sum, order) => {
    return order.status !== 'cancelled' ? sum + order.total_price : sum;
  }, 0);

  const orderStats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    processing: orders.filter(o => o.status === 'processing').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const columns = [
    {
      title: "Sipariş",
      key: "order",
      render: (record) => (
        <div>
          <Text strong className="text-gray-800">{record.order_number}</Text>
          <br />
          <Text className="text-sm text-gray-500">
            {formatDate(record.created_at)}
          </Text>
        </div>
      )
    },
    {
      title: "Ürünler",
      key: "items",
      render: (record) => (
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {record.items.slice(0, 3).map((item, idx) => (
              <img
                key={idx}
                src={item.image_url || fallbackImage}
                alt={item.product_name}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                onError={(e) => {
                  // Güvenli fallback - başka URL'e gitmez
                  e.target.src = fallbackImage;
                  e.target.onerror = null; // Sonsuz döngüyü önle
                }}
              />
            ))}
            {record.items.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                +{record.items.length - 3}
              </div>
            )}
          </div>
          <div>
            <Text className="text-sm font-medium">
              {record.items[0].product_name}
              {record.items.length > 1 && ` ve ${record.items.length - 1} ürün daha`}
            </Text>
            <br />
            <Text className="text-xs text-gray-500">
              {record.items.length} ürün
            </Text>
          </div>
        </div>
      )
    },
    {
      title: "Tutar",
      key: "total",
      render: (record) => (
        <Text strong className="text-lg">
          {formatPrice(record.total_price)}
        </Text>
      )
    },
    {
      title: "Durum",
      key: "status",
      render: (record) => (
        <Tag 
          color={getStatusColor(record.status)} 
          icon={getStatusIcon(record.status)}
          className="px-3 py-1"
        >
          {getStatusText(record.status)}
        </Tag>
      )
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedOrder(record);
              setModalVisible(true);
            }}
          >
            Detay
          </Button>
          {record.status === 'delivered' && (
            <Button type="outline" size="small">
              Tekrar Sipariş Ver
            </Button>
          )}
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Text className="text-gray-500">Siparişleriniz yükleniyor...</Text>
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
            <span className="text-gray-800 font-medium">Siparişlerim</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Header & Stats */}
        <div className="mb-8">
          <Title level={2} className="mb-6">
            📦 Siparişlerim
          </Title>

          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center" style={{ borderRadius: 'var(--radius-lg)' }}>
                <Statistic
                  title="Toplam Sipariş"
                  value={orderStats.total}
                  prefix={<ShoppingCartOutlined className="text-blue-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center" style={{ borderRadius: 'var(--radius-lg)' }}>
                <Statistic
                  title="Teslim Edilen"
                  value={orderStats.delivered}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center" style={{ borderRadius: 'var(--radius-lg)' }}>
                <Statistic
                  title="Hazırlanan"
                  value={orderStats.processing}
                  prefix={<ClockCircleOutlined className="text-orange-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center" style={{ borderRadius: 'var(--radius-lg)' }}>
                <Statistic
                  title="Toplam Harcama"
                  value={totalSpent}
                  formatter={(value) => formatPrice(value)}
                  prefix={<DollarOutlined className="text-purple-500" />}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Filters */}
        <Card className="mb-6" style={{ borderRadius: 'var(--radius-lg)' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input.Search
                placeholder="Sipariş no veya ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Durum filtrele"
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full"
              >
                <Option value="all">Tüm Durumlar</Option>
                <Option value="pending">Beklemede</Option>
                <Option value="processing">Hazırlanıyor</Option>
                <Option value="shipped">Kargoda</Option>
                <Option value="delivered">Teslim Edildi</Option>
                <Option value="cancelled">İptal Edildi</Option>
              </Select>
            </Col>
            <Col xs={24} md={10}>
              <RangePicker
                placeholder={["Başlangıç", "Bitiş"]}
                value={dateRange}
                onChange={setDateRange}
                className="w-full"
              />
            </Col>
          </Row>
        </Card>

        {/* Orders Table */}
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Empty
                description="Henüz siparişiniz bulunmuyor"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  onClick={() => navigate('/app/products')}
                  icon={<ShoppingCartOutlined />}
                >
                  Alışverişe Başla
                </Button>
              </Empty>
            </div>
          ) : (
            <Table
              dataSource={filteredOrders}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} / ${total} sipariş`
              }}
              className="order-table"
            />
          )}
        </Card>

        {/* Order Detail Modal */}
        <Modal
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>Sipariş Detayı</span>
              {selectedOrder && (
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              )}
            </Space>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Kapat
            </Button>,
            selectedOrder?.status === 'delivered' && (
              <Button key="reorder" type="primary">
                Tekrar Sipariş Ver
              </Button>
            )
          ]}
          width={800}
        >
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Sipariş No" span={1}>
                  <Text strong>{selectedOrder.order_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Sipariş Tarihi" span={1}>
                  {formatDate(selectedOrder.created_at)}
                </Descriptions.Item>
                <Descriptions.Item label="Toplam Tutar" span={1}>
                  <Text strong className="text-lg">
                    {formatPrice(selectedOrder.total_price)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Durum" span={1}>
                  <Tag color={getStatusColor(selectedOrder.status)} icon={getStatusIcon(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Tag>
                </Descriptions.Item>
                {selectedOrder.delivery_date && (
                  <Descriptions.Item label="Teslim Tarihi" span={2}>
                    {formatDate(selectedOrder.delivery_date)}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Order Items */}
              <div>
                <Title level={5} className="mb-3">Sipariş İçeriği</Title>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image_url || fallbackImage}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          // Güvenli fallback - başka URL'e gitmez
                          e.target.src = fallbackImage;
                          e.target.onerror = null; // Sonsuz döngüyü önle
                        }}
                      />
                      <div className="flex-1">
                        <Text strong className="block">{item.product_name}</Text>
                        <Space className="mt-1">
                          <Text className="text-gray-500">Adet: {item.quantity}</Text>
                          <Text className="text-gray-500">•</Text>
                          <Text className="text-gray-500">Birim Fiyat: {formatPrice(item.unit_price)}</Text>
                        </Space>
                      </div>
                      <Text strong className="text-lg">
                        {formatPrice(item.quantity * item.unit_price)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline */}
              {selectedOrder.tracking_steps && (
                <div>
                  <Title level={5} className="mb-3">Sipariş Takibi</Title>
                  <Timeline>
                    {selectedOrder.tracking_steps.map((step, index) => (
                      <Timeline.Item
                        key={index}
                        color={
                          step.status === 'completed' ? 'green' :
                          step.status === 'current' ? 'blue' : 'gray'
                        }
                        dot={
                          step.status === 'completed' ? <CheckCircleOutlined /> :
                          step.status === 'current' ? <ClockCircleOutlined /> : null
                        }
                      >
                        <div>
                          <Text strong>{step.title}</Text>
                          {step.date && (
                            <div className="text-gray-500 text-sm mt-1">
                              {step.date}
                            </div>
                          )}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
