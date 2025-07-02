import { Layout, Menu, Button, message, Input, Badge, Avatar, Dropdown, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  UserOutlined, 
  SearchOutlined, 
  ShoppingCartOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShopOutlined,
  HeartOutlined,
  SettingOutlined
} from "@ant-design/icons";

const { Header: AntHeader } = Layout;

function Header() {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  // Dinamik menü oluştur
  const getMenuItems = () => {
    const baseItems = [
      {
        key: "1",
        label: (
          <Link to="/app" className="flex items-center gap-2 text-base font-medium">
            <ShopOutlined />
            Ana Sayfa
          </Link>
        ),
      },
      {
        key: "2",
        label: (
          <Link to="/app/products" className="flex items-center gap-2 text-base font-medium">
            <ShoppingCartOutlined />
            Ürünler
          </Link>
        ),
      },
      {
        key: "3",
        label: (
          <Link to="/app/orders" className="flex items-center gap-2 text-base font-medium">
            <HeartOutlined />
            Siparişlerim
          </Link>
        ),
      },
    ];

    // Admin kullanıcılar için Metrics Dashboard ekle
    if (user?.role === 'admin') {
      baseItems.push({
        key: "4",
        label: (
          <Link to="/app/metrics" className="flex items-center gap-2 text-base font-medium">
            <DashboardOutlined />
            Dashboard
          </Link>
        ),
      });
    }

    return baseItems;
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success("Çıkış başarılı");
      navigate("/login");
    } catch (error) {
      message.error("Çıkış başarısız: Sunucuya ulaşılamadı");
      console.error("Logout error:", error.response?.data || error.message);
    }
  };

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center gap-3 py-2">
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          <div>
            <div className="font-medium text-sm">{user?.username}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      label: (
        <span className="flex items-center gap-2">
          <SettingOutlined />
          Ayarlar
        </span>
      ),
    },
    {
      key: 'logout',
      label: (
        <span className="flex items-center gap-2 text-red-500">
          <LogoutOutlined />
          Çıkış Yap
        </span>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="nav-modern sticky top-0 z-50 px-0 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/app" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <ShopOutlined className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                E-Ticaret
              </span>
            </Link>

            {/* Navigation Menu - Desktop */}
            <div className="hidden md:block">
              <Menu
                mode="horizontal"
                defaultSelectedKeys={["1"]}
                className="bg-transparent border-none"
                items={getMenuItems()}
                style={{
                  backgroundColor: 'transparent',
                  borderBottom: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden sm:block flex-1 max-w-md mx-8">
            <Input.Search
              placeholder="Ürün, kategori veya marka ara..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-full border-gray-200 focus:border-blue-500 shadow-sm"
              style={{
                height: '40px',
                backgroundColor: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border)',
              }}
              onSearch={(value) => {
                if (value.trim()) {
                  navigate(`/app/products?search=${encodeURIComponent(value.trim())}`);
                }
              }}
              enterButton="Ara"
              size="large"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Shopping Cart */}
            <Button
              type="text"
              icon={
                <Badge count={0} size="small">
                  <ShoppingCartOutlined className="text-lg text-gray-600" />
                </Badge>
              }
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
            />

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
              className="cursor-pointer"
            >
              <Space className="hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.username || 'Kullanıcı'}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role || 'customer'}
                  </div>
                </div>
              </Space>
            </Dropdown>

            {/* Mobile Search Toggle - Hidden for now */}
            <Button
              type="text"
              icon={<SearchOutlined />}
              className="sm:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
            />
          </div>
        </div>
      </div>
    </AntHeader>
  );
}

export default Header;
