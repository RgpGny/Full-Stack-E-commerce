import React, { useState, useContext } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Breadcrumb,
  Row,
  Col,
  Avatar,
  Upload,
  message,
  Divider,
  Switch,
  Select
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  HomeOutlined,
  SettingOutlined,
  CameraOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const { Title, Text } = Typography;
const { Option } = Select;

export const SettingsPage = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Kullanıcı bilgilerini güncelle
  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      // API çağrısı burada yapılacak
      console.log("Profil güncelleme:", values);
      message.success("Profil bilgileri güncellendi!");
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      message.error("Profil güncellenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Şifre değiştir
  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      // API çağrısı burada yapılacak
      console.log("Şifre değiştirme:", values);
      message.success("Şifreniz başarıyla değiştirildi!");
    } catch (error) {
      console.error("Şifre değiştirme hatası:", error);
      message.error("Şifre değiştirme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Profil fotoğrafı yükleme
  const handleAvatarUpload = (info) => {
    if (info.file.status === 'done') {
      message.success('Profil fotoğrafı güncellendi!');
    } else if (info.file.status === 'error') {
      message.error('Profil fotoğrafı yüklenirken hata oluştu.');
    }
  };

  const uploadProps = {
    name: 'avatar',
    action: '/api/upload/avatar',
    showUploadList: false,
    onChange: handleAvatarUpload
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link to="/app" className="text-blue-600 hover:text-blue-800">
              <HomeOutlined /> Ana Sayfa
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span className="text-gray-800 font-medium">Ayarlar</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Başlık */}
        <div className="mb-6">
          <Title level={2} className="flex items-center space-x-2 mb-2">
            <SettingOutlined className="text-blue-600" />
            <span>Hesap Ayarları</span>
          </Title>
          <Text className="text-gray-600">
            Hesap bilgilerinizi ve tercihlerinizi yönetin
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profil Bilgileri */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  <span>Profil Bilgileri</span>
                </Space>
              }
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              {/* Profil Fotoğrafı */}
              <div className="text-center mb-6">
                <Upload {...uploadProps}>
                  <div className="relative inline-block">
                    <Avatar
                      size={100}
                      src={user?.avatar}
                      icon={<UserOutlined />}
                      className="cursor-pointer border-4 border-white shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all cursor-pointer">
                      <CameraOutlined className="text-white text-lg opacity-0 hover:opacity-100" />
                    </div>
                  </div>
                </Upload>
                <Text className="block mt-2 text-gray-600">Profil fotoğrafını değiştir</Text>
              </div>

              {/* Profil Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                initialValues={{
                  username: user?.username,
                  email: user?.email,
                  firstName: user?.firstName || '',
                  lastName: user?.lastName || ''
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Ad"
                      name="firstName"
                      rules={[{ required: true, message: 'Ad alanı zorunludur' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Adınız" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Soyad"
                      name="lastName"
                      rules={[{ required: true, message: 'Soyad alanı zorunludur' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Soyadınız" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Kullanıcı Adı"
                  name="username"
                  rules={[{ required: true, message: 'Kullanıcı adı zorunludur' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Kullanıcı adınız" />
                </Form.Item>

                <Form.Item
                  label="E-posta"
                  name="email"
                  rules={[
                    { required: true, message: 'E-posta alanı zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="E-posta adresiniz" />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                    className="w-full"
                  >
                    Profili Güncelle
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Şifre Değiştirme */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <LockOutlined />
                  <span>Şifre Değiştir</span>
                </Space>
              }
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <Form
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  label="Mevcut Şifre"
                  name="currentPassword"
                  rules={[{ required: true, message: 'Mevcut şifrenizi girin' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Mevcut şifreniz" 
                  />
                </Form.Item>

                <Form.Item
                  label="Yeni Şifre"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Yeni şifrenizi girin' },
                    { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Yeni şifreniz" 
                  />
                </Form.Item>

                <Form.Item
                  label="Yeni Şifre Tekrar"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Şifrenizi tekrar girin' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Yeni şifrenizi tekrar girin" 
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    danger
                    className="w-full"
                  >
                    Şifreyi Değiştir
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Tercihler */}
            <Card 
              title="Tercihler"
              className="mt-6"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Text strong>E-posta Bildirimleri</Text>
                    <Text className="block text-sm text-gray-500">
                      Sipariş durumu ve kampanya bildirimleri
                    </Text>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Divider />

                <div className="flex justify-between items-center">
                  <div>
                    <Text strong>SMS Bildirimleri</Text>
                    <Text className="block text-sm text-gray-500">
                      Kargo takip ve acil bilgilendirmeler
                    </Text>
                  </div>
                  <Switch />
                </div>

                <Divider />

                <div className="flex justify-between items-center">
                  <div>
                    <Text strong>Dil Seçimi</Text>
                    <Text className="block text-sm text-gray-500">
                      Arayüz dili
                    </Text>
                  </div>
                  <Select defaultValue="tr" className="w-32">
                    <Option value="tr">Türkçe</Option>
                    <Option value="en">English</Option>
                  </Select>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tehlikeli Alan */}
        <Card 
          title="Tehlikeli Alan"
          className="mt-6 border-red-200"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <div className="bg-red-50 p-4 rounded-lg">
            <Text strong className="text-red-700 block mb-2">
              Hesabı Sil
            </Text>
            <Text className="text-red-600 mb-4 block">
              Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
            </Text>
            <Button danger size="small">
              Hesabı Sil
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage; 